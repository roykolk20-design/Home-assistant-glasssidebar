from typing import Any

DOMAIN = "glass_sidebar"
VERSION = "1.1.0"
JS_PATH = f"/{DOMAIN}/sidebar.js"
JS_URL = f"{JS_PATH}?v={VERSION}"
SIGNAL_UPDATE = f"{DOMAIN}_update"

CONF_FLOATING = "floating"
CONF_INSET = "inset"
CONF_RADIUS = "radius"
CONF_BLUR = "blur"
CONF_CATEGORIES = "categories"

DEFAULTS: dict[str, Any] = {
    CONF_FLOATING: True,
    CONF_INSET: 8,
    CONF_RADIUS: 20,
    CONF_BLUR: 18,
    CONF_CATEGORIES: "",
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
