from __future__ import annotations

import json
import os
import re
import logging
from typing import Optional

logger = logging.getLogger(__name__)

_SYLLABI_DIR = os.path.join(os.path.dirname(__file__), "syllabi")

# ──────────────
# File loader
# ──────────────
def _syllabus_filename(subject: str) -> str:
    """Convert subject name to the JSON filename."""
    name = subject.lower().strip()
    name = name.replace("++", "_pp").replace("+", "_p")
    name = re.sub(r"[^a-z0-9]+", "_", name).strip("_")
    return os.path.join(_SYLLABI_DIR, f"{name}.json")

def load_syllabus(subject: str) -> Optional[dict]:
    """Load the syllabus JSON for a subject. Returns None if not found."""
    path = _syllabus_filename(subject)
    if not os.path.exists(path):
        logger.info(f"No syllabus file found for '{subject}' at {path}")
        return None
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logger.warning(f"Failed to load syllabus for '{subject}': {e}")
        return None

# ───────────────
# Topic matcher
# ───────────────
def _score_topic_match(topic_entry: dict, topics: str, subtopics: str) -> int:
    """
    Score how well a syllabus topic entry matches the lecture topics/subtopics.
    Higher score = better match.
    """
    combined = (topics + " " + subtopics).lower()
    score    = 0

    # Topic name exact match — strong signal
    topic_name = topic_entry.get("name", "").lower()
    if topic_name and topic_name in combined:
        score += 10

    # Keyword hits
    for kw in topic_entry.get("keywords", []):
        if kw.lower() in combined:
            score += 3

    # Subtopic word overlap — at least 2 meaningful words must match
    for sub in topic_entry.get("subtopics", []):
        sub_words = sub.lower().split()
        hits = sum(1 for w in sub_words if w in combined and len(w) > 3)
        if hits >= 2:
            score += 2

    return score

def find_matching_topics(syllabus: dict, topics: str, subtopics: str) -> list[dict]:
    """
    Return the single best-matching syllabus topic entry for the given lecture.
    Only returns a result if the top match clears MIN_SCORE — prevents injecting
    unrelated content from low-confidence matches.
    """
    MIN_SCORE = 8

    candidates = []
    for module in syllabus.get("modules", []):
        module_name = module.get("module", "")
        for topic_entry in module.get("topics", []):
            score = _score_topic_match(topic_entry, topics, subtopics)
            if score > 0:
                candidates.append({
                    "module": module_name,
                    "score":  score,
                    **topic_entry,
                })

    candidates.sort(key=lambda x: x["score"], reverse=True)

    if candidates and candidates[0]["score"] >= MIN_SCORE:
        return candidates[:1]
    return []

# ─────────────────────────
# Prompt injection builder
# ─────────────────────────     
def _format_required_content(items: list[str]) -> str:
    return "\n".join(f"        • {item}" for item in items)

def _format_required_code(code: str) -> str:
    return f"""
        MANDATORY CODE SLIDE:
        Include this exact code (or an improved version with more comments) as a Code: block.
        Use \\n for line breaks in the JSON string.
        ---
        {code}
        ---"""

def _format_required_diagrams(diagrams: list[str]) -> str:
    lines = []
    for i, d in enumerate(diagrams, 1):
        lines.append(f"        Diagram {i}: {d}")
    return "\n".join(lines)

def _format_required_tables(tables: list[str]) -> str:
    lines = []
    for t in tables:
        lines.append(f"        • {t}")
    return "\n".join(lines)

def _format_common_mistakes(mistakes: list[str]) -> str:
    return "\n".join(f"        • {m}" for m in mistakes)

def build_syllabus_injection(subject: str, topics: str, subtopics: str) -> str:
    """
    Main entry point. Returns a formatted string to inject into the prompt,
    giving topic-specific content requirements. Returns empty string if no
    syllabus is available or no match is found.
    """
    syllabus = load_syllabus(subject)
    if not syllabus:
        return ""

    matched = find_matching_topics(syllabus, topics, subtopics)
    if not matched:
        logger.info(f"No syllabus topic match found for topics='{topics}' subtopics='{subtopics}'")
        return ""

    # Parse user-provided subtopics into a clean list
    user_sub_list = [s.strip() for s in subtopics.split(",") if s.strip()] if subtopics.strip() else []

    blocks = []
    for entry in matched:
        block_lines = [
            "═══════════════════════════════════════════════════════════",
            f"SYLLABUS-SPECIFIC REQUIREMENTS  [{entry['module']} → {entry['name']}]",
            "═══════════════════════════════════════════════════════════",
            "(These are MANDATORY — they override general subject rules)",
            "",
        ]

        # Subtopics to cover — always driven by USER input, not syllabus list
        if user_sub_list:
            block_lines.append("SUBTOPICS TO COVER — ONE DEDICATED SLIDE PER ITEM (MANDATORY):")
            block_lines.append("Each bullet below = exactly ONE slide. Do NOT merge any two together.")
            block_lines.append("Do NOT add any slide not listed here — even if related content exists in the syllabus.")
            for sub in user_sub_list:
                block_lines.append(f"• {sub}")
            block_lines.append(f"Total: {len(user_sub_list)} subtopics = exactly {len(user_sub_list)} topic slides.")
            block_lines.append("")
        elif entry.get("subtopics"):
            block_lines.append("SUBTOPICS TO COVER (allocate one slide per subtopic where feasible):")
            for sub in entry["subtopics"]:
                block_lines.append(f"• {sub}")
            block_lines.append("")

        # Required content points
        if entry.get("required_content"):
            block_lines.append("REQUIRED CONTENT POINTS (include ONLY within slides listed above — do NOT create new slides for these points):")
            block_lines.append(_format_required_content(entry["required_content"]))
            block_lines.append("")

        # No-code flag
        if entry.get("no_code"):
            block_lines.append("CODE POLICY: NO code slides for this topic. Use diagrams, tables, and explanations.")
            block_lines.append("")
        elif entry.get("required_code"):
            block_lines.append(_format_required_code(entry["required_code"]))
            block_lines.append("")

        # Required diagrams
        if entry.get("required_diagrams"):
            block_lines.append("REQUIRED DIAGRAMS (include as image objects in topic arrays):")
            block_lines.append(_format_required_diagrams(entry["required_diagrams"]))
            block_lines.append("Use this format:")
            block_lines.append('{"image": {"type": "diagram", "prompt": "<use the description above>", "placement": "right"}}')
            block_lines.append("")

        # Required tables
        if entry.get("required_tables"):
            block_lines.append("REQUIRED TABLES (include using the table prefix format):")
            block_lines.append(_format_required_tables(entry["required_tables"]))
            block_lines.append("")

        # Common mistakes
        if entry.get("common_mistakes"):
            block_lines.append("COMMON MISTAKES (include at least one as 'Common Mistake:' item):")
            block_lines.append(_format_common_mistakes(entry["common_mistakes"]))
            block_lines.append("")

        # Slide scripts — filter to user subtopics only
        if entry.get("use_slide_scripts") and entry.get("slide_scripts"):
            slide_script_block = _format_slide_scripts(entry, user_subtopics=subtopics)
            if slide_script_block:
                block_lines.append(slide_script_block)

        blocks.append("\n".join(block_lines))

    return "\n\n".join(blocks)

def _format_slide_scripts(entry: dict, user_subtopics: str = "") -> str:
    """
    Converts per-slide script entries into explicit Gemini instructions.
    Only injects scripts whose subtopic key matches what the user actually passed.
    If user_subtopics is empty, injects ALL scripts (backward compatible).
    """
    scripts = entry.get("slide_scripts", {})
    if not scripts:
        return ""

    if user_subtopics.strip():
        import re

        # Noise words that don't identify a script
        NOISE = {"gate", "universal", "the", "a", "an", "of", "to", "in",
                 "and", "or", "not", "behavior", "symbol", "table", "circuit"}

        def _canonical(text: str) -> str:
            """
            Extract the meaningful identifier from a phrase.
            'NAND Universal gate' → 'nand'
            'NAND Universality'   → 'nand universality'
            'Boolean Algebra Laws'→ 'boolean algebra'
            'XOR Gate'            → 'xor'
            """
            tokens = re.findall(r"[a-z0-9]+", text.lower())
            meaningful = [t for t in tokens if t not in NOISE]
            if not meaningful:
                return tokens[0] if tokens else ""
            # If first meaningful token is a gate name (short, <=4 chars or known gate)
            # AND second meaningful token is a qualifier → keep both
            GATE_NAMES = {"and", "or", "not", "nand", "nor", "xor", "xnor"}
            if len(meaningful) >= 2 and meaningful[0] in GATE_NAMES:
                # Second token is a qualifier (not just noise) → compound id
                return meaningful[0] + " " + meaningful[1]
            return meaningful[0]

        # Build canonical IDs for each user term
        user_ids = set()
        for raw in user_subtopics.replace(";", ",").split(","):
            cid = _canonical(raw.split("—")[0].split("(")[0])
            if cid:
                user_ids.add(cid)

        # Build canonical ID for each script key and match
        matched_keys = set()
        for key in scripts:
            key_part = key.split("—")[0].split("(")[0]
            key_id = _canonical(key_part)
            if key_id in user_ids:
                matched_keys.add(key)

        filtered = {k: v for k, v in scripts.items() if k in matched_keys}
        scripts = filtered if filtered else scripts
        # Fallback: if nothing matched, inject all (safety net)

    lines = [
        "═══════════════════════════════════════════════════════════",
        "EXPLICIT SLIDE SCRIPTS — HIGHEST PRIORITY",
        "═══════════════════════════════════════════════════════════",
        "Generate ONLY the slides listed below — no extras, no additions.",
        "For each slide: output a topic array with EXACTLY the items listed.",
        "item[0] = the slide title. item[1], item[2]... = content items verbatim.",
        "DO NOT add slides not listed here. DO NOT use Definition:/Tip: labels unless shown.",
        "DO NOT merge two slides. DO NOT reorder items.",
        "",
    ]

    for subtopic, script in scripts.items():
        slide_title = script["title"]
        lines.append(f"── SLIDE: '{slide_title}' ──────────────────────────")

        # Support new 'items' format (preferred) or old 'content_flow' format
        items = script.get("items") or script.get("content_flow", [])
        opening = script.get("opening")

        if opening and not items:
            # Old format: opening + content_flow
            lines.append(f"Opening: {opening}")
            lines.append("Content items:")
        else:
            lines.append(f"Content items (EXACTLY {len(items)}, no more no less):")

        for i, item in enumerate(items, 1):
            if isinstance(item, dict):
                # image object — pass through as JSON hint
                prompt = item.get("image", {}).get("prompt", "")
                placement = item.get("image", {}).get("placement", "right")
                lines.append(f'  {i}. [IMAGE] prompt: "{prompt[:120]}..." placement: {placement}')
            else:
                lines.append(f"  {i}. {item}")

        lines.append("")

    return "\n".join(lines)


