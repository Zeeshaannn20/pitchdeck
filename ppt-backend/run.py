from __future__ import annotations

import logging
from ppt_generator import create_app
from ppt_generator.config import GEMINI_API_KEY, GEMINI_MODEL, _IMAGE_MODELS
from ppt_generator.prompts import SUBJECT_CATEGORY_MAP

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = create_app()

if __name__ == "__main__":
    logger.info("=" * 60)
    logger.info("PPT Generator v7.0 — Modular Release")
    logger.info(f"Gemini model:  {GEMINI_MODEL}")
    logger.info(f"Image models:  {_IMAGE_MODELS}")
    logger.info(f"API key set:   {'Yes' if GEMINI_API_KEY else 'NO'}")
    logger.info(f"Subjects:      {len(SUBJECT_CATEGORY_MAP)} mapped")
    logger.info("=" * 60)
    app.run(host="0.0.0.0", port=5000, debug=False)
