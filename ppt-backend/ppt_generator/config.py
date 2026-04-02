from __future__ import annotations

import os
from pptx.util import Pt, Inches
from pptx.dml.color import RGBColor
from dotenv import load_dotenv

load_dotenv()

# ===============
# Gemini / API
# ===============
GEMINI_API_KEY = os.getenv("DHRUV_API_KEY")
GEMINI_MODEL   = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")

_IMAGE_MODELS: list[str] = [
    "gemini-3.1-flash-image-preview",
    "gemini-2.5-flash-image",
]

TEMPLATE_PATH = os.getenv("TEMPLATE_PATH", "institute_template.pptx")

# ===============
# Fonts
# ===============
TITLE_FONT_NAME   = "Poppins"
CONTENT_FONT_NAME = "Poppins"
MONO_FONT         = "Consolas"
TITLE_FONT_SIZE   = Pt(20)
CONTENT_FONT_SIZE = Pt(16)

FONT_PATH_MAP = {
    "Poppins":  "arial.ttf",
    "Consolas": "consola.ttf",
}

# ===============
# Colours
# ===============
TITLE_COLOR      = RGBColor(160,  93,  45)
CONTENT_COLOR    = RGBColor(255, 255, 255)
ACCENT_PRIMARY   = RGBColor(255, 215,   0)
ACCENT_SECONDARY = RGBColor( 70, 130, 180)
WARNING_COLOR    = RGBColor(255, 165,   0)
ERROR_COLOR      = RGBColor(220,  20,  60)
CODE_BG          = RGBColor(240, 248, 255)
CODE_BORDER      = RGBColor(255, 215,   0)
CODE_TEXT        = RGBColor( 25,  25, 112)
COLOR_BLACK      = RGBColor(  0,   0,   0)
SLIDE_BG_PRIMARY = RGBColor(  6,  28,  60)
TITLE_BG         = RGBColor(255, 255, 255)
GOLD_ACCENT      = RGBColor(228, 195, 140)

# ===============
# Layout
# ===============
MARGIN_LEFT          = Inches(0.3)
SAFE_SIDE_MARGIN_IN  = 0.80
CONTENT_TOP_IN       = 1.00
CONTENT_BOTTOM_PAD   = 1.00

BODY_LINE_SPACING_PT = 20
CODE_LINE_SPACING_PT = 16
PARA_SPACE_BEFORE_PT = 2
PARA_SPACE_AFTER_PT  = 2
