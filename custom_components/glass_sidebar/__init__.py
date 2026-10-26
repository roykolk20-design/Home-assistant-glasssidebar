from pathlib import Path
from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.components.frontend import add_extra_js_url, remove_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry, ConfigEntryState
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import (
    async_dispatcher_connect,
    async_dispatcher_send,
)

from .const import (
    CONF_ACCENT_COLOR,
    CONF_BLUR,
    CONF_CUSTOM_ACCENT,
    CONF_FLOATING,
    CONF_GLASS_CARDS,
    CONF_HIGHLIGHT,
    CONF_HOVER_MOTION,
    CONF_INSET,
    CONF_MOBILE_BLUR,
    CONF_MOBILE_TEXT_SIZE,
    CONF_MOBILE_WIDTH,
    CONF_OPACITY,
    CONF_RADIUS,
    DEFAULTS,
    DOMAIN,
    HIGHLIGHTS,
    JS_PATH,
    JS_URL,
    SIGNAL_UPDATE,
    stored_categories,
)

DISABLED: dict[str, Any] = {"enabled": False}


def _accent(options: dict[str, Any]) -> str | None:
    if not options[CONF_CUSTOM_ACCENT]:
        return None
    try:
        red, green, blue = (int(c) for c in options[CONF_ACCENT_COLOR])
    except (TypeError, ValueError):
        return None
    return f"rgb({red}, {green}, {blue})"


def build_config(entry: ConfigEntry) -> dict[str, Any]:
    options = {**DEFAULTS, **entry.options}
    highlight = options[CONF_HIGHLIGHT]
    if highlight not in HIGHLIGHTS:
        highlight = DEFAULTS[CONF_HIGHLIGHT]

    return {
        "enabled": True,
        "floating": bool(options[CONF_FLOATING]),
        "inset": int(options[CONF_INSET]),
        "radius": int(options[CONF_RADIUS]),
        "blur": int(options[CONF_BLUR]),
        "opacity": int(options[CONF_OPACITY]),
        "highlight": highlight,
        "accent": _accent(options),
        "hover_motion": bool(options[CONF_HOVER_MOTION]),
        "glass_cards": bool(options[CONF_GLASS_CARDS]),
        "mobile_width": int(options[CONF_MOBILE_WIDTH]),
        "mobile_blur": bool(options[CONF_MOBILE_BLUR]),
        "mobile_text_size": int(options[CONF_MOBILE_TEXT_SIZE]),
        "categories": stored_categories(options),
    }


@callback
def current_config(hass: HomeAssistant) -> dict[str, Any]:
    for entry in hass.config_entries.async_entries(DOMAIN):
        if entry.state is ConfigEntryState.LOADED:
            return build_config(entry)
    return DISABLED


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/subscribe"})
@callback
def ws_subscribe(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
) -> None:
    @callback
    def forward(config: dict[str, Any]) -> None:
        connection.send_message(websocket_api.event_message(msg["id"], config))

    connection.subscriptions[msg["id"]] = async_dispatcher_connect(
        hass, SIGNAL_UPDATE, forward
    )
    connection.send_result(msg["id"])
    forward(current_config(hass))


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    if not hass.data.get(DOMAIN):
        js_path = Path(__file__).parent / "www" / "sidebar.js"
        await hass.http.async_register_static_paths(
            [StaticPathConfig(JS_PATH, str(js_path), False)]
        )
        websocket_api.async_register_command(hass, ws_subscribe)
        hass.data[DOMAIN] = True

    add_extra_js_url(hass, JS_URL)
    entry.async_on_unload(entry.add_update_listener(async_options_updated))
    async_dispatcher_send(hass, SIGNAL_UPDATE, build_config(entry))
    return True


async def async_options_updated(hass: HomeAssistant, entry: ConfigEntry) -> None:
    async_dispatcher_send(hass, SIGNAL_UPDATE, build_config(entry))


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    remove_extra_js_url(hass, JS_URL)
    async_dispatcher_send(hass, SIGNAL_UPDATE, DISABLED)
    return True
