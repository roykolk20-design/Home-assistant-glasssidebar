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
    CONF_BLUR,
    CONF_CATEGORIES,
    CONF_FLOATING,
    CONF_INSET,
    CONF_RADIUS,
    DEFAULTS,
    DOMAIN,
    JS_PATH,
    JS_URL,
    SIGNAL_UPDATE,
    parse_categories,
)

DISABLED: dict[str, Any] = {"enabled": False}


def build_config(entry: ConfigEntry) -> dict[str, Any]:
    options = {**DEFAULTS, **entry.options}
    try:
        categories = parse_categories(options[CONF_CATEGORIES])
    except ValueError:
        categories = []

    return {
        "enabled": True,
        "floating": bool(options[CONF_FLOATING]),
        "inset": int(options[CONF_INSET]),
        "radius": int(options[CONF_RADIUS]),
        "blur": int(options[CONF_BLUR]),
        "categories": categories,
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
