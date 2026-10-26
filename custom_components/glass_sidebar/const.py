from typing import Any

DOMAIN = "glass_sidebar"
VERSION = "1.2.0"
JS_PATH = f"/{DOMAIN}/sidebar.js"
JS_URL = f"{JS_PATH}?v={VERSION}"
SIGNAL_UPDATE = f"{DOMAIN}_update"

CONF_FLOATING = "floating"
CONF_INSET = "inset"
CONF_RADIUS = "radius"
CONF_BLUR = "blur"
CONF_OPACITY = "opacity"
CONF_HIGHLIGHT = "highlight"
CONF_CUSTOM_ACCENT = "custom_accent"
CONF_ACCENT_COLOR = "accent_color"
CONF_HOVER_MOTION = "hover_motion"
CONF_GLASS_CARDS = "glass_cards"
CONF_MOBILE_WIDTH = "mobile_width"
CONF_MOBILE_BLUR = "mobile_blur"
CONF_CATEGORIES = "categories"

HIGHLIGHTS = ("soft", "vivid")

DEFAULTS: dict[str, Any] = {
    CONF_FLOATING: True,
    CONF_INSET: 8,
    CONF_RADIUS: 20,
    CONF_BLUR: 18,
    CONF_OPACITY: 74,
    CONF_HIGHLIGHT: "soft",
    CONF_CUSTOM_ACCENT: False,
    CONF_ACCENT_COLOR: [3, 169, 244],
    CONF_HOVER_MOTION: True,
    CONF_GLASS_CARDS: False,
    CONF_MOBILE_WIDTH: 300,
    CONF_MOBILE_BLUR: True,
    CONF_CATEGORIES: [],
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
    """Categories from options; 1.1 stored them as text, 1.2 as a list."""
    value = options.get(CONF_CATEGORIES) or []
    if isinstance(value, str):
        try:
            return parse_categories(value)
        except ValueError:
            return []
    return [
        {"name": str(c["name"]), "panels": [str(p) for p in c.get("panels", [])]}
        for c in value
        if isinstance(c, dict) and c.get("name")
    ]
