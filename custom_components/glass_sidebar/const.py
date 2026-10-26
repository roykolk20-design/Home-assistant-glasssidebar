from typing import Any

DOMAIN = "glass_sidebar"
VERSION = "1.8.0"
# Each person's own style lives in Home Assistant's per-user frontend data.
USER_DATA_KEY = DOMAIN
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
CONF_SELECTED_SHAPE = "selected_shape"
CONF_DENSITY = "density"
CONF_SHADOW = "shadow"
CONF_GLOW = "glow"
CONF_ICON_COLOR = "icon_color"
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
# Styles an admin set for a specific person: {user_id: {"values": {...}}}.
CONF_USER_STYLES = "user_styles"

HIGHLIGHTS = ("soft", "vivid")
TINTS = ("theme", "light", "dark")
SHAPES = ("pill", "bar", "outline")
DENSITIES = ("compact", "normal", "spacious")
SHADOWS = ("none", "soft", "deep")
ICON_COLORS = ("theme", "accent", "muted")

DEFAULTS: dict[str, Any] = {
    CONF_FLOATING: True,
    CONF_INSET: 8,
    CONF_RADIUS: 20,
    CONF_BLUR: 18,
    CONF_OPACITY: 74,
    CONF_TINT: "theme",
    CONF_HIGHLIGHT: "soft",
    CONF_SELECTED_SHAPE: "pill",
    CONF_DENSITY: "normal",
    CONF_SHADOW: "soft",
    CONF_GLOW: False,
    CONF_ICON_COLOR: "theme",
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
    CONF_USER_STYLES: {},
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
    CONF_SELECTED_SHAPE,
    CONF_DENSITY,
    CONF_SHADOW,
    CONF_GLOW,
    CONF_ICON_COLOR,
    CONF_CUSTOM_ACCENT,
    CONF_ACCENT_COLOR,
)

# What each person may set for themselves. Categories and the quick menu
# switch stay shared.
PERSONAL_KEYS = (
    *STYLE_KEYS,
    CONF_HOVER_MOTION,
    CONF_GLASS_CARDS,
    CONF_EXTEND_BACKGROUND,
    CONF_MOBILE_WIDTH,
    CONF_MOBILE_BLUR,
    CONF_MOBILE_TEXT_SIZE,
    CONF_MOBILE_ROUNDED,
    CONF_MOBILE_SWIPE,
    CONF_MOBILE_HIDE_HEADER,
)


def _style(
    tint: str,
    highlight: str,
    shape: str,
    *,
    accent: list[int] | None = None,
    radius: int = 20,
    blur: int = 18,
    opacity: int = 70,
    density: str = "normal",
    shadow: str = "soft",
    glow: bool = False,
    icons: str = "theme",
    floating: bool = True,
) -> dict[str, Any]:
    return {
        CONF_FLOATING: floating,
        CONF_INSET: 8 if floating else 0,
        CONF_RADIUS: radius,
        CONF_BLUR: blur,
        CONF_OPACITY: opacity,
        CONF_TINT: tint,
        CONF_HIGHLIGHT: highlight,
        CONF_SELECTED_SHAPE: shape,
        CONF_DENSITY: density,
        CONF_SHADOW: shadow,
        CONF_GLOW: glow,
        CONF_ICON_COLOR: icons,
        CONF_CUSTOM_ACCENT: accent is not None,
        CONF_ACCENT_COLOR: accent or [3, 169, 244],
    }


PRESETS: dict[str, dict[str, Any]] = {
    "frosted": _style("light", "soft", "pill", opacity=62),
    "midnight": _style("dark", "soft", "pill", shadow="deep", icons="muted"),
    "vivid": _style("theme", "vivid", "pill", opacity=74, glow=True),
    "aurora": _style("dark", "vivid", "pill", accent=[124, 92, 255], radius=22,
                     blur=22, opacity=64, shadow="deep", glow=True, icons="accent"),
    "ocean": _style("light", "vivid", "bar", accent=[0, 150, 136], radius=24,
                    blur=20, opacity=66, glow=True, icons="accent"),
    "sunset": _style("dark", "vivid", "pill", accent=[255, 112, 67], radius=22,
                     opacity=68, shadow="deep", glow=True, icons="accent"),
    "forest": _style("light", "soft", "outline", accent=[67, 160, 71], radius=18,
                     opacity=72, density="spacious", icons="accent"),
    "rose": _style("light", "vivid", "pill", accent=[236, 64, 122], radius=26,
                   opacity=70, density="spacious", glow=True),
    "graphite": _style("dark", "soft", "bar", accent=[176, 190, 197], radius=14,
                       opacity=80, density="compact", icons="muted"),
    "mono": _style("light", "vivid", "pill", accent=[33, 33, 33], radius=12,
                   blur=8, opacity=92, shadow="none", icons="muted"),
    "minimal": _style("theme", "soft", "bar", radius=0, blur=0, opacity=100,
                      density="compact", shadow="none", icons="muted",
                      floating=False),
    "solid": _style("theme", "soft", "pill", radius=16, blur=0, opacity=100),
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
