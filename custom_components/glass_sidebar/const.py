from typing import Any

DOMAIN = "glass_sidebar"
VERSION = "1.6.0"
JS_PATH = f"/{DOMAIN}/sidebar.js"
JS_URL = f"{JS_PATH}?v={VERSION}"
PANEL_JS_PATH = f"/{DOMAIN}/panel.js"
PANEL_JS_URL = f"{PANEL_JS_PATH}?v={VERSION}"
PANEL_URL_PATH = "glass-sidebar"
PANEL_ELEMENT = "glass-sidebar-panel"
SIGNAL_UPDATE = f"{DOMAIN}_update"

CONF_FLOATING = "floating"
CONF_INSET = "inset"
CONF_RADIUS = "radius"
CONF_BLUR = "blur"
CONF_OPACITY = "opacity"
CONF_TINT = "tint"
CONF_HIGHLIGHT = "highlight"
CONF_CUSTOM_ACCENT = "custom_accent"
CONF_ACCENT_COLOR = "accent_color"
CONF_HOVER_MOTION = "hover_motion"
CONF_GLASS_CARDS = "glass_cards"
CONF_EXTEND_BACKGROUND = "extend_background"
CONF_QUICK_MENU = "quick_menu"
CONF_MOBILE_WIDTH = "mobile_width"
CONF_MOBILE_BLUR = "mobile_blur"
CONF_MOBILE_TEXT_SIZE = "mobile_text_size"
CONF_MOBILE_ROUNDED = "mobile_rounded"
CONF_MOBILE_SWIPE = "mobile_swipe"
CONF_MOBILE_HIDE_HEADER = "mobile_hide_header"
CONF_CATEGORIES = "categories"
CONF_CUSTOM_STYLES = "custom_styles"

HIGHLIGHTS = ("soft", "vivid")
TINTS = ("theme", "light", "dark")

DEFAULTS: dict[str, Any] = {
    CONF_FLOATING: True,
    CONF_INSET: 8,
    CONF_RADIUS: 20,
    CONF_BLUR: 18,
    CONF_OPACITY: 74,
    CONF_TINT: "theme",
    CONF_HIGHLIGHT: "soft",
    CONF_CUSTOM_ACCENT: False,
    CONF_ACCENT_COLOR: [3, 169, 244],
    CONF_HOVER_MOTION: True,
    CONF_GLASS_CARDS: False,
    CONF_EXTEND_BACKGROUND: True,
    CONF_QUICK_MENU: True,
    CONF_MOBILE_WIDTH: 300,
    CONF_MOBILE_BLUR: True,
    CONF_MOBILE_TEXT_SIZE: 14,
    CONF_MOBILE_ROUNDED: True,
    CONF_MOBILE_SWIPE: False,
    CONF_MOBILE_HIDE_HEADER: False,
    CONF_CATEGORIES: [],
    CONF_CUSTOM_STYLES: [],
}

# A style sets these; categories and phone settings stay as they are.
STYLE_KEYS = (
    CONF_FLOATING,
    CONF_INSET,
    CONF_RADIUS,
    CONF_BLUR,
    CONF_OPACITY,
    CONF_TINT,
    CONF_HIGHLIGHT,
    CONF_CUSTOM_ACCENT,
    CONF_ACCENT_COLOR,
)

_GLASS = {CONF_FLOATING: True, CONF_INSET: 8, CONF_CUSTOM_ACCENT: False}
PRESETS: dict[str, dict[str, Any]] = {
    "frosted": {**_GLASS, CONF_RADIUS: 20, CONF_BLUR: 18, CONF_OPACITY: 62,
                CONF_TINT: "light", CONF_HIGHLIGHT: "soft"},
    "midnight": {**_GLASS, CONF_RADIUS: 20, CONF_BLUR: 18, CONF_OPACITY: 70,
                 CONF_TINT: "dark", CONF_HIGHLIGHT: "soft"},
    "vivid": {**_GLASS, CONF_RADIUS: 20, CONF_BLUR: 18, CONF_OPACITY: 74,
              CONF_TINT: "theme", CONF_HIGHLIGHT: "vivid"},
    "aurora": {**_GLASS, CONF_RADIUS: 22, CONF_BLUR: 22, CONF_OPACITY: 64,
               CONF_TINT: "dark", CONF_HIGHLIGHT: "vivid",
               CONF_CUSTOM_ACCENT: True, CONF_ACCENT_COLOR: [124, 92, 255]},
    "minimal": {CONF_FLOATING: False, CONF_INSET: 0, CONF_RADIUS: 0, CONF_BLUR: 0,
                CONF_OPACITY: 100, CONF_TINT: "theme", CONF_HIGHLIGHT: "soft",
                CONF_CUSTOM_ACCENT: False},
    "solid": {**_GLASS, CONF_RADIUS: 16, CONF_BLUR: 0, CONF_OPACITY: 100,
              CONF_TINT: "theme", CONF_HIGHLIGHT: "soft"},
}


def parse_categories(text: str) -> list[dict[str, Any]]:
    """Parse lines like 'Dashboards: lovelace, energy, map'."""
    categories = []
    for line in text.splitlines():
        line = line.strip()
        if not line:
            continue
        name, sep, panels = line.partition(":")
        if not sep or not name.strip():
            raise ValueError(line)
        categories.append(
            {
                "name": name.strip(),
                "panels": [p.strip() for p in panels.split(",") if p.strip()],
            }
        )
    return categories


def stored_categories(options: dict[str, Any]) -> list[dict[str, Any]]:
    """Categories from options; 1.1 stored them as text, 1.2+ as a list."""
    value = options.get(CONF_CATEGORIES) or []
    if isinstance(value, str):
        try:
            return parse_categories(value)
        except ValueError:
            return []
    categories = []
    for item in value:
        if not isinstance(item, dict) or not item.get("name"):
            continue
        category: dict[str, Any] = {
            "name": str(item["name"]),
            "panels": [str(p) for p in item.get("panels", [])],
        }
        if item.get("icon"):
            category["icon"] = str(item["icon"])
        if item.get("collapsed"):
            category["collapsed"] = True
        categories.append(category)
    return categories


def current_options(options: dict[str, Any]) -> dict[str, Any]:
    """All settings with defaults filled in."""
    merged = {**DEFAULTS, **options}
    merged[CONF_CATEGORIES] = stored_categories(merged)
    return merged
