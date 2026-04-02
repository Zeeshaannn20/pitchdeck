from __future__ import annotations

import re
from typing import Optional

# All prefixes that should render as styled code/mono blocks
_CODE_PREFIXES = (
    "code:", "syntax:", "query:", "sql:",
    "yaml:", "cli:", "bash:",
    "document:", "mongodb:",
    "formula:", "dax:",
    "fsm:", "grammar:", "trace:", "pda:", "tm:",
    "xml-layout:",
)

# Prefixes that render as structured tables
_TABLE_PREFIXES = (
    "comparison:", "dataset:", "eval:", "metrics:",
    "case:", "framework:", "table:", "sample:",
    "er-diagram:",
)

_TABLE_HEADER_RE = re.compile(
    r"^\s*(" + "|".join(p.rstrip(":") for p in _TABLE_PREFIXES) + r")\s*:", re.I
)
_PIPE_TABLE_RE  = re.compile(r"^\s*[^|]+\|\s*[^|]+", re.I)
_TRUTH_TABLE_RE = re.compile(r"^\s*truth\s*table\s*:", re.I)
_CODE_FENCE_RE  = re.compile(r"```[\w]*\n(.*?)\n```", re.S)

def normalize_separators(s: str) -> str:
    if "||" not in s:
        return s
    if ":" in s.split("||")[0]:
        prefix, _, rest = s.partition(":")
        rest = rest.strip()
    else:
        prefix = None
        rest = s
    rows = [r.strip() for r in rest.split("||") if r.strip()]
    if prefix is not None:
        return prefix + ":\n" + "\n".join(rows)
    return "\n".join(rows)

def is_table_block(s: str) -> bool:
    s = (s or "").strip()
    return bool(_TABLE_HEADER_RE.match(s) or _TRUTH_TABLE_RE.match(s))

def extract_code_block(text: str) -> tuple[Optional[str], Optional[str]]:
    if not text:
        return None, text

    m = _CODE_FENCE_RE.search(text)
    if m:
        return m.group(1).strip(), text.replace(m.group(0), "").strip()

    t = text.strip()
    lower = t.lower()

    for prefix in _CODE_PREFIXES:
        if lower.startswith(prefix):
            content = t[len(prefix):].strip()
            return content, None

    return None, text

def parse_table_from_text(raw: str) -> Optional[tuple]:
    s = normalize_separators((raw or "").strip())
    if not s or "|" not in s:
        return None

    lines = [ln.strip() for ln in s.splitlines() if ln.strip()]
    if not lines:
        return None

    title_hint = None

    if _TABLE_HEADER_RE.match(lines[0]):
        head_line = lines[0].split(":", 1)[1].strip() if ":" in lines[0] else lines[0]
        if "|" in head_line:
            header = [c.strip() for c in head_line.split("|") if c.strip()]
            data_lines = lines[1:]
        else:
            header = []
            data_lines = lines[1:]

        if not header and data_lines and "|" in data_lines[0]:
            header = [c.strip() for c in data_lines[0].split("|") if c.strip()]
            data_lines = data_lines[1:]

        rows = []
        for ln in data_lines:
            if "|" in ln:
                cells = [c.strip() for c in ln.split("|") if c.strip()]
                if cells:
                    rows.append(cells)

        if header and rows:
            ncols = len(header)
            rows = [(r + [""] * ncols)[:ncols] for r in rows]

        meta = {"kind": "comparison", "title_hint": title_hint}
        return header, rows, meta

    pipe_lines = [ln for ln in lines if "|" in ln]
    if len(pipe_lines) >= 2:
        header = [c.strip() for c in pipe_lines[0].strip("|").split("|") if c.strip()]
        body = []
        for ln in pipe_lines[1:]:
            parts = [c.strip() for c in ln.strip("|").split("|")]
            if all(re.fullmatch(r"[-–—\s]*", c) for c in parts):
                continue
            body.append(parts)

        max_cols = max(len(header), max((len(r) for r in body), default=0))
        if len(header) < max_cols:
            header += [f"Col{i}" for i in range(len(header)+1, max_cols+1)]
        body = [(r + [""] * max_cols)[:max_cols] for r in body]
        body = [r for r in body if any(c.strip() for c in r)]

        flat = [c.strip().lower() for r in body for c in r]
        br   = sum(c in {"0", "1"} for c in flat) / (len(flat) or 1)
        kind = "truth" if br >= 0.5 else "table"
        return header, body, {"kind": kind, "title_hint": title_hint}

    return None

def extract_inline_pipe_tables(text: str) -> tuple[list, str]:
    if not text or "|" not in text:
        return [], text

    tables, kept = [], []
    lines = text.splitlines()
    i = 0
    while i < len(lines):
        ln = lines[i]
        if ln.count("|") >= 2:
            block = []
            while i < len(lines) and lines[i].count("|") >= 2:
                block.append(lines[i]); i += 1
            raw_block = normalize_separators("\n".join(block))
            parsed = parse_table_from_text(raw_block)
            if parsed:
                tables.append(parsed)
            else:
                kept.extend(block)
        else:
            kept.append(ln); i += 1

    remaining = "\n".join(kept)
    remaining = re.sub(r"(?im)^\s*truth\s*table\s*:\s*$", "", remaining).strip()
    return tables, remaining

def normalize_paragraph(text: str) -> str:
    t = (text or "")
    if "|" in t or _TABLE_HEADER_RE.match(t) or _TRUTH_TABLE_RE.match(t):
        return t
    t = " ".join(t.split())
    # FIX: Allow up to 4 sentences for theory/definition slides
    parts = re.split(r"(?<=[.!?])\s+", t)
    return " ".join(parts[:4]) if len(parts) > 4 else t
