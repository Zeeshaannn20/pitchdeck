from __future__ import annotations

import os
import re
import json
import time
import base64
import logging
import tempfile
import shutil
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Optional

import requests as http_requests
from PIL import Image, ImageFont, ImageDraw

from .config import GEMINI_API_KEY, GEMINI_MODEL, _IMAGE_MODELS

logger = logging.getLogger(__name__)

_GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta"

# =====================================================
# Temp directory management — request-level isolation
# =====================================================
def create_request_temp_dir() -> str:
    """
    Create a unique temp directory for ONE request.

    Called once per request inside generator.py.
    Every user gets their own isolated folder — no cross-user interference.

    On Windows (dev):  C:\\Users\\username\\AppData\\Local\\Temp\\ppt_gen_XXXX\\
    On Linux (server): /tmp/ppt_gen_XXXX/

    Returns:
        Absolute path to the newly created temp directory.
    """
    temp_dir = tempfile.mkdtemp(prefix="ppt_gen_")
    logger.info(f"Request temp dir created: {temp_dir}")
    return temp_dir

def cleanup_temp_files(temp_files: list[str]) -> None:
    """
    Delete all tracked temp files and directories after PPT is sent.

    Separates files and dirs from the list, deletes files first,
    then removes directories using shutil.rmtree (force delete).
    Clears the list in-place when done.

    Call this inside after_this_request (success) or except blocks (error)
    so cleanup is guaranteed regardless of what happens.

    Args:
        temp_files: list of absolute paths (files + dirs) to delete.
                    Cleared in-place after deletion.
    """
    files = [p for p in temp_files if p and os.path.isfile(p)]
    dirs  = [p for p in temp_files if p and os.path.isdir(p)]

    # Delete individual files first
    for path in files:
        try:
            os.unlink(path)
            logger.debug(f"Deleted temp file: {path}")
        except PermissionError:
            # Windows only: send_file() may still be streaming the PPT.
            # The OS releases the handle after streaming completes.
            # No action needed — Windows cleans up on process exit.
            logger.debug(f"Skipped (in use, Windows): {path}")
        except Exception as e:
            logger.warning(f"Could not delete temp file '{path}': {e}")

    # Delete directories after files are removed
    for dir_path in dirs:
        try:
            if os.path.exists(dir_path):
                shutil.rmtree(dir_path)  # force delete even if not empty
                logger.info(f"Temp dir removed: {dir_path}")
        except Exception as e:
            logger.warning(f"Could not remove temp dir '{dir_path}': {e}")

    temp_files.clear()

# =============
# Headers
# =============
def _gemini_headers() -> dict:
    return {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY or "",
    }

# ================
# Text generation
# ================
def call_gemini_api(prompt: str, model_override: str = "") -> str:
    if not GEMINI_API_KEY:
        raise RuntimeError("Missing GEMINI_API_KEY in environment")

    model = model_override.strip() if model_override else GEMINI_MODEL
    url = f"{_GEMINI_BASE}/models/{model}:generateContent"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.4,
            "topK": 40,
            "topP": 0.95,
            "maxOutputTokens": 32768,
        },
        "safetySettings": [
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_ONLY_HIGH"},
            {"category": "HARM_CATEGORY_HARASSMENT",        "threshold": "BLOCK_ONLY_HIGH"},
            {"category": "HARM_CATEGORY_HATE_SPEECH",       "threshold": "BLOCK_ONLY_HIGH"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_ONLY_HIGH"},
        ],
    }

    last_error: Optional[Exception] = None

    for attempt in range(3):
        try:
            resp = http_requests.post(
                url,
                headers=_gemini_headers(),
                json=payload,
                timeout=120,
            )

            if resp.status_code in (429, 503) and attempt < 2:
                wait = 2 ** attempt
                logger.warning(f"Gemini {resp.status_code} — retrying in {wait}s")
                time.sleep(wait)
                continue

            resp.raise_for_status()
            data = resp.json()

            if not data.get("candidates"):
                block_reason = data.get("promptFeedback", {}).get("blockReason", "UNKNOWN")
                logger.error(f"Gemini blocked entire prompt. blockReason={block_reason}")
                raise ValueError(
                    f"Gemini blocked the request (blockReason={block_reason}). "
                    f"Try rephrasing the subject or reducing sensitivity of topics."
                )

            candidate     = data["candidates"][0]
            finish_reason = candidate.get("finishReason", "STOP")

            if finish_reason in ("SAFETY", "RECITATION"):
                ratings = candidate.get("safetyRatings", [])
                triggered = [
                    r.get("category", "UNKNOWN")
                    for r in ratings
                    if r.get("probability", "LOW") not in ("NEGLIGIBLE", "LOW")
                ]
                logger.warning(
                    f"Gemini safety filter: finishReason={finish_reason}, "
                    f"triggered categories={triggered}. Attempt {attempt+1}/3."
                )
                if attempt < 2:
                    time.sleep(2)
                    continue
                raise ValueError(
                    f"Gemini content filter triggered (finishReason={finish_reason}). "
                    f"Triggered safety categories: {triggered or 'see server logs'}. "
                    f"Tip: Add 'academic' / 'educational' context to special requirements."
                )

            parts = (candidate.get("content") or {}).get("parts", [])
            if not parts:
                logger.error(f"Gemini returned no parts. finishReason={finish_reason}")
                raise ValueError(
                    f"Gemini returned an empty response body (finishReason={finish_reason})."
                )

            text = parts[0].get("text", "").strip()
            if not text:
                raise ValueError(
                    f"Gemini returned a blank text field (finishReason={finish_reason})."
                )

            if finish_reason == "MAX_TOKENS":
                logger.warning("Gemini hit MAX_TOKENS — response may be truncated.")

            return text

        except ValueError:
            raise
        except http_requests.exceptions.Timeout as e:
            last_error = e
            if attempt < 2:
                logger.warning(f"Gemini timeout (attempt {attempt+1}), retrying…")
                continue
        except http_requests.exceptions.RequestException as e:
            last_error = e
            if attempt < 2:
                time.sleep(2 ** attempt)
                continue

    raise RuntimeError(f"Gemini API failed after 3 attempts: {last_error}")

# ========================================================
# Placeholder image generator (for when API images fail)
# ========================================================
def _generate_placeholder_image(
    prompt: str,
    temp_files: list[str],
    temp_dir: str,
) -> Optional[str]:
    """
    Generate a simple branded placeholder when Gemini image API fails.
    Saved inside this request's unique temp_dir.

    Args:
        prompt:     Original image prompt used as label text.
        temp_files: List to append the saved file path into.
        temp_dir:   This request's unique temp directory.

    Returns:
        Absolute path to saved placeholder image, or None on failure.
    """
    try:
        img  = Image.new("RGB", (900, 600), color=(6, 28, 60))
        draw = ImageDraw.Draw(img)

        draw.rectangle([4, 4, 895, 595], outline=(228, 195, 140), width=3)

        try:
            font_title = ImageFont.truetype("arial.ttf", 22)
            font_body  = ImageFont.truetype("arial.ttf", 16)
        except Exception:
            font_title = ImageFont.load_default()
            font_body  = font_title

        draw.text((30, 25), "Diagram", fill=(228, 195, 140), font=font_title)

        # Word-wrap the prompt text onto the placeholder
        words = prompt[:200].split()
        lines, cur = [], ""
        for w in words:
            if len(cur) + len(w) + 1 <= 60:
                cur = (cur + " " + w).strip()
            else:
                lines.append(cur)
                cur = w
        if cur:
            lines.append(cur)

        y = 80
        for line in lines[:8]:
            draw.text((30, y), line, fill=(200, 200, 200), font=font_body)
            y += 28

        cx, cy = 450, 380
        draw.rounded_rectangle(
            [cx - 120, cy - 60, cx + 120, cy + 60],
            radius=15,
            outline=(255, 215, 0),
            width=2,
        )
        draw.text(
            (cx - 80, cy - 10), "[Visual Diagram]",
            fill=(255, 255, 255), font=font_body,
        )

        # Save inside THIS request's isolated temp folder
        filename = f"placeholder_{int(time.time() * 1000)}.png"
        tmp_path = os.path.join(temp_dir, filename)
        img.save(tmp_path)
        temp_files.append(tmp_path)
        logger.info(f"Placeholder image saved: {tmp_path}")
        return tmp_path

    except Exception as e:
        logger.warning(f"Placeholder image generation failed: {e}")
        return None

# =================
# Image generation
# =================
def _generate_image(
    image_prompt: str,
    temp_files: list[str],
    temp_dir: str,
) -> Optional[str]:
    """
    Try Gemini image API (multiple models + payload variants).
    Falls back to a branded placeholder if all API attempts fail.

    Every file is saved inside temp_dir — this request's unique folder.
    No two concurrent users ever share a directory.

    Args:
        image_prompt: Text prompt describing the diagram to generate.
        temp_files:   List to append the saved file path into.
        temp_dir:     This request's unique temp directory.

    Returns:
        Absolute path to the saved image file, or None on total failure.
    """
    if GEMINI_API_KEY:
        payload_variants = [
            {
                "contents": [{"role": "user", "parts": [{"text": image_prompt}]}],
                "generationConfig": {"responseModalities": ["IMAGE"]},
            },
            {
                "contents": [{"role": "user", "parts": [{"text": image_prompt}]}],
                "generationConfig": {"responseModalities": ["TEXT", "IMAGE"]},
            },
            {
                "contents": [{"parts": [{"text": image_prompt}]}],
                "generationConfig": {"responseModalities": ["IMAGE"]},
            },
        ]

        for model in _IMAGE_MODELS:
            url       = f"{_GEMINI_BASE}/models/{model}:generateContent"
            model_404 = False

            for vi, payload in enumerate(payload_variants):
                if model_404:
                    break

                logger.info(f"Image: {model} variant {vi + 1}")

                try:
                    for attempt in range(2):
                        resp = http_requests.post(
                            url,
                            headers=_gemini_headers(),
                            json=payload,
                            timeout=90,
                        )

                        if resp.status_code in (429, 503) and attempt < 1:
                            time.sleep(2)
                            continue

                        if resp.status_code == 404:
                            logger.warning(f"{model} → 404, skipping model")
                            model_404 = True
                            break

                        if resp.status_code == 400:
                            logger.warning(f"{model} v{vi+1} → 400, trying next variant")
                            break

                        resp.raise_for_status()
                        data  = resp.json()
                        parts = (
                            data.get("candidates", [{}])[0]
                                .get("content", {})
                                .get("parts", [])
                        )

                        image_b64, mime_type = None, "image/png"
                        for part in parts:
                            inline = part.get("inlineData", {})
                            if inline.get("data"):
                                image_b64 = inline["data"]
                                mime_type = inline.get("mimeType", "image/png")
                                break

                        if not image_b64:
                            logger.warning(f"{model} v{vi+1} → no image in response")
                            break

                        # Save inside THIS request's isolated temp folder
                        suffix   = ".png" if "png" in mime_type else ".jpg"
                        filename = (
                            f"gemini_{model.replace('/', '_')}"
                            f"_{vi + 1}_{int(time.time() * 1000)}{suffix}"
                        )
                        tmp_path = os.path.join(temp_dir, filename)

                        with open(tmp_path, "wb") as f:
                            f.write(base64.b64decode(image_b64))

                        temp_files.append(tmp_path)
                        logger.info(f"Image via Gemini ({model} v{vi+1}) → {tmp_path}")
                        return tmp_path

                except Exception as e:
                    logger.warning(f"{model} v{vi+1} error: {e}")
                    continue

    logger.info("Gemini image unavailable — using placeholder")
    return _generate_placeholder_image(image_prompt, temp_files, temp_dir)

# ===========================
# Concurrent image prefetch
# ===========================
def prefetch_images(
    content: dict,
    temp_files: list[str],
    temp_dir: str,
) -> dict[str, Optional[str]]:
    """
    Collect all unique image prompts from content and generate them
    concurrently (up to 4 workers).

    All images saved inside temp_dir — this request's isolated folder.

    Args:
        content:    Parsed PPT content dict from Gemini.
        temp_files: List to append saved file paths into.
        temp_dir:   This request's unique temp directory.

    Returns:
        Dict mapping prompt string → local file path (or None on failure).
    """
    prompts: list[str] = []
    for topic in content.get("topics", []):
        for item in (topic if isinstance(topic, list) else []):
            if isinstance(item, dict) and "image" in item:
                prompt = item["image"].get("prompt", "")
                if prompt and prompt not in prompts:
                    prompts.append(prompt)

    if not prompts:
        return {}

    cache: dict[str, Optional[str]] = {}

    with ThreadPoolExecutor(max_workers=4) as ex:
        future_map = {
            ex.submit(_generate_image, p, temp_files, temp_dir): p
            for p in prompts
        }
        for fut in as_completed(future_map):
            prompt = future_map[fut]
            try:
                cache[prompt] = fut.result()
            except Exception as e:
                logger.warning(
                    f"Image prefetch failed for prompt '{prompt[:60]}': {e}"
                )
                cache[prompt] = None

    return cache

# ==============================
# JSON parsing with validation
# ==============================
def _extract_json_segment(raw: str) -> str:
    """Find the LARGEST balanced JSON object in raw text."""
    text       = raw.strip()
    candidates = []
    stack      = []
    start      = None

    for i, ch in enumerate(text):
        if ch == "{":
            if not stack:
                start = i
            stack.append(ch)
        elif ch == "}":
            if stack:
                stack.pop()
                if not stack and start is not None:
                    candidates.append(text[start : i + 1])
                    start = None

    if not candidates:
        return ""
    return max(candidates, key=len)

def safe_parse_json(raw_text: str) -> dict:
    cleaned = _extract_json_segment(raw_text)
    if not cleaned:
        raise ValueError("No JSON object found in Gemini response.")

    cleaned = (
        cleaned
        .replace("\u201c", '"').replace("\u201d", '"')
        .replace("\u2018", "'").replace("\u2019", "'")
        .strip()
    )

    # First attempt: parse as-is
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Second attempt: truncation recovery
    try:
        fixed = cleaned

        if fixed and fixed[-1] not in ("}", "]"):
            fixed = re.sub(r',?\s*"[^"]*$', "", fixed)

        fixed = re.sub(r",\s*([}\]])", r"\1", fixed)

        open_a = fixed.count("[") - fixed.count("]")
        open_o = fixed.count("{") - fixed.count("}")
        fixed += "]" * max(0, open_a) + "}" * max(0, open_o)

        result = json.loads(fixed)
        logger.info("JSON recovered from truncated response.")
        return result

    except json.JSONDecodeError as e:
        logger.error(
            f"JSON parse failed even after recovery:\n{e}\n\nRaw:\n{raw_text[:500]}"
        )
        raise ValueError(
            "Gemini returned invalid JSON that could not be recovered."
        ) from e

def validate_content_structure(content: dict) -> dict:
    """
    Validate and repair the parsed JSON structure.
    Ensures topics is list-of-lists, quiz items have pipe format, etc.
    """
    if not isinstance(content, dict):
        raise ValueError("Content must be a JSON object (dict)")

    raw_topics = content.get("topics", [])
    if not isinstance(raw_topics, list):
        raw_topics = []

    valid_topics = []
    for i, topic in enumerate(raw_topics):
        if isinstance(topic, (list, tuple)) and len(topic) >= 1:
            title = str(topic[0]).strip()
            if title:
                cleaned = [title]
                for item in topic[1:]:
                    if isinstance(item, str):
                        cleaned.append(item)
                    elif isinstance(item, dict):
                        cleaned.append(item)
                    elif item is not None:
                        cleaned.append(str(item))
                valid_topics.append(cleaned)
            else:
                logger.warning(f"Skipping topic {i}: empty title")

        elif isinstance(topic, dict) and "image" in topic:
            valid_topics.append(["Visual Explanation", topic])

        elif isinstance(topic, str) and topic.strip():
            valid_topics.append([topic.strip(), "Content to be covered."])

        else:
            logger.warning(f"Skipping invalid topic at index {i}: {type(topic)}")

    content["topics"] = valid_topics or [["Introduction", "Content to be added"]]

    raw_quiz = content.get("quiz", [])
    content["quiz"] = (
        [str(q) for q in raw_quiz if q] if isinstance(raw_quiz, list) else []
    )

    for key in ("recap", "agenda", "summary"):
        val = content.get(key)
        if val is not None and not isinstance(val, list):
            content[key] = [str(val)] if val else []

    return content

