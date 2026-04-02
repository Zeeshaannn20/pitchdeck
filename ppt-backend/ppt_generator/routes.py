from __future__ import annotations

import os
import re
import logging
from typing import Optional

import requests as http_requests
from flask import Blueprint, request, jsonify, send_file, after_this_request

from .config import GEMINI_API_KEY, GEMINI_MODEL, _IMAGE_MODELS, TEMPLATE_PATH
from .prompts import build_prompt
from .services import call_gemini_api, safe_parse_json, validate_content_structure, cleanup_temp_files
from .generator import generate_professional_ppt

logger = logging.getLogger(__name__)

bp = Blueprint("ppt", __name__)

def sanitize_filename(filename: str) -> str:
    if not filename:
        return "presentation"
    safe = re.sub(r"[^\w\s-]", "", filename)
    safe = re.sub(r"[-\s]+", "_", safe)
    safe = safe.strip("_")
    safe = safe[:80]
    return safe or "presentation"

@bp.route("/api/generate-ppt", methods=["POST"])
def generate_ppt_route():
    ppt_path: Optional[str] = None
    temp_files: list[str]   = []

    try:
        data = request.get_json() or {}
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400

        subject             = data.get("subject", "Computer Science")
        topics              = data.get("topics", "General Topics")
        subtopics           = data.get("subtopics", "")
        previousLecture     = data.get("previousLecture", "Introduction")
        specialRequirements = data.get("specialRequirements", "")
        instructor_name     = data.get("professorName", "")
        qualification       = data.get("qualification", "")
        instructor_b64      = data.get("instructorImage")
        batch_code          = data.get("batchCode", "")

        if instructor_b64 and len(instructor_b64) > 10_000_000:
            return jsonify({"error": "Instructor image too large (max ~7.5 MB)"}), 413

        try:
            duration = int(data.get("duration", 60))
            if duration <= 0:
                return jsonify({"error": "Duration must be positive"}), 400
        except (ValueError, TypeError):
            return jsonify({"error": "Invalid duration value"}), 400

        logger.info(
            f"Generating PPT — Subject: {subject} | Topics: {topics} | Duration: {duration}min"
        )

        # ── 1. Generate content via Gemini ──────────────────────────────
        prompt   = build_prompt(subject, topics, subtopics,
                                previousLecture, duration, specialRequirements)
        raw_resp = call_gemini_api(prompt)
        content  = safe_parse_json(raw_resp)
        content  = validate_content_structure(content)

        # Default missing sections
        defaults = {
            "agenda":  ["Today's topics to be covered…"],
            "topics":  [["Introduction", "Content to be added"]],
            "quiz":    ["Q: Review question | Options: (A) A; (B) B; (C) C; (D) D | Answer: A | Explanation: TBD | Bloom: Remember"],
            "summary": ["Key takeaways to follow…"],
        }
        for k, v in defaults.items():
            if k not in content or not content[k]:
                content[k] = v

        # ── 2. Build PPT (images downloaded + embedded inside) ──────────
        ppt_path, temp_files = generate_professional_ppt(
            content=content,
            subject=subject,
            topics=topics,
            special_requirements=specialRequirements,
            instructor_name=instructor_name,
            qualification=qualification,
            instructor_image_b64=instructor_b64,
            batch_code=batch_code,
        )

        # ── 3. Sanity checks ────────────────────────────────────────────
        if not os.path.exists(ppt_path):
            raise RuntimeError("Generated PPT file not found")
        if os.path.getsize(ppt_path) == 0:
            raise RuntimeError("Generated PPT file is empty")

        files_to_cleanup = list(temp_files)  # snapshot before return

        @after_this_request
        def _cleanup(response):
            cleanup_temp_files(files_to_cleanup)
            return response

        filename = (
            f"{sanitize_filename(subject)}_"
            f"{sanitize_filename(topics)}_lecture.pptx"
        )

        return send_file(
            ppt_path,
            as_attachment=True,
            download_name=filename,
            mimetype=(
                "application/vnd.openxmlformats-officedocument"
                ".presentationml.presentation"
            ),
        )

    # ── Error handlers — cleanup runs here too ───────────────────────────
    # In error cases there is no after_this_request, so we clean up
    # directly in the except blocks before returning the error response.

    except ValueError as e:
        logger.error(f"Validation error: {e}")
        cleanup_temp_files(temp_files)
        return jsonify({"error": f"Content validation failed: {str(e)}"}), 400

    except RuntimeError as e:
        logger.error(f"Runtime error: {e}")
        cleanup_temp_files(temp_files)
        return jsonify({"error": f"Configuration error: {str(e)}"}), 500

    except http_requests.RequestException as e:
        logger.error(f"API request error: {e}")
        cleanup_temp_files(temp_files)
        return jsonify({"error": f"External service unavailable: {str(e)}"}), 503

    except Exception as e:
        logger.exception("Unexpected error generating PPT")
        cleanup_temp_files(temp_files)
        return jsonify({"error": f"Failed to generate presentation: {str(e)}"}), 500

@bp.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({
        "status":             "healthy",
        "template_available": os.path.exists(TEMPLATE_PATH),
        "gemini_configured":  bool(GEMINI_API_KEY),
        "image_models":       _IMAGE_MODELS,
        "version":            "7.0-modular",
    })


