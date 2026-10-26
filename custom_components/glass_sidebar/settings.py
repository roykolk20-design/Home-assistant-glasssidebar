"""Validation for changes sent by the settings page."""

from typing import Any

import voluptuous as vol

from .const import (
    CONF_ACCENT_COLOR,
    CONF_BLUR,
    CONF_CATEGORIES,
    CONF_CUSTOM_ACCENT,
    CONF_CUSTOM_STYLES,
    CONF_EXTEND_BACKGROUND,
    CONF_FLOATING,
    CONF_GLASS_CARDS,
    CONF_HIGHLIGHT,
    CONF_HOVER_MOTION,
    CONF_INSET,
    CONF_MOBILE_BLUR,
    CONF_MOBILE_HIDE_HEADER,
    CONF_MOBILE_ROUNDED,
    CONF_MOBILE_SWIPE,
    CONF_MOBILE_TEXT_SIZE,
    CONF_MOBILE_WIDTH,
    CONF_OPACITY,
    CONF_QUICK_MENU,
    CONF_RADIUS,
    CONF_TINT,
    HIGHLIGHTS,
    TINTS,
)


def _number(minimum: int, maximum: int) -> vol.All:
    return vol.All(vol.Coerce(int), vol.Range(min=minimum, max=maximum))


def _name(value: Any) -> str:
    name = vol.All(str, vol.Strip, vol.Length(min=1, max=40))(value)
    return name


def _unique_names(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    names = [item["name"].lower() for item in items]
    if len(names) != len(set(names)):
        raise vol.Invalid("names must be unique")
    return items


STYLE_VALUES = {
    vol.Optional(CONF_FLOATING): bool,
    vol.Optional(CONF_INSET): _number(0, 24),
    vol.Optional(CONF_RADIUS): _number(0, 32),
    vol.Optional(CONF_BLUR): _number(0, 40),
    vol.Optional(CONF_OPACITY): _number(40, 100),
    vol.Optional(CONF_TINT): vol.In(TINTS),
    vol.Optional(CONF_HIGHLIGHT): vol.In(HIGHLIGHTS),
    vol.Optional(CONF_CUSTOM_ACCENT): bool,
    vol.Optional(CONF_ACCENT_COLOR): vol.All(
        [_number(0, 255)], vol.Length(min=3, max=3)
    ),
}

CATEGORY = vol.Schema(
    {
        vol.Required("name"): _name,
        vol.Optional("panels", default=list): vol.All(
            [vol.All(str, vol.Length(min=1, max=100))], vol.Length(max=100)
        ),
        vol.Optional("icon"): vol.Any(None, vol.Match(r"^mdi:[a-z0-9-]+$")),
        vol.Optional("collapsed", default=False): bool,
    }
)

CUSTOM_STYLE = vol.Schema(
    {vol.Required("name"): _name, vol.Required("values"): vol.Schema(STYLE_VALUES)}
)

CHANGES = vol.Schema(
    {
        **STYLE_VALUES,
        vol.Optional(CONF_HOVER_MOTION): bool,
        vol.Optional(CONF_GLASS_CARDS): bool,
        vol.Optional(CONF_EXTEND_BACKGROUND): bool,
        vol.Optional(CONF_QUICK_MENU): bool,
        vol.Optional(CONF_MOBILE_WIDTH): _number(240, 360),
        vol.Optional(CONF_MOBILE_TEXT_SIZE): _number(12, 20),
        vol.Optional(CONF_MOBILE_BLUR): bool,
        vol.Optional(CONF_MOBILE_ROUNDED): bool,
        vol.Optional(CONF_MOBILE_SWIPE): bool,
        vol.Optional(CONF_MOBILE_HIDE_HEADER): bool,
        vol.Optional(CONF_CATEGORIES): vol.All(
            [CATEGORY], vol.Length(max=30), _unique_names
        ),
        vol.Optional(CONF_CUSTOM_STYLES): vol.All(
            [CUSTOM_STYLE], vol.Length(max=12), _unique_names
        ),
    }
)


def validate_changes(changes: dict[str, Any]) -> dict[str, Any]:
    """Return cleaned changes or raise vol.Invalid."""
    cleaned = CHANGES(changes)
    for category in cleaned.get(CONF_CATEGORIES, []):
        if not category.get("icon"):
            category.pop("icon", None)
        if not category.get("collapsed"):
            category.pop("collapsed", None)
    return cleaned
