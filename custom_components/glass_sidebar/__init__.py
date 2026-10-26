from pathlib import Path
from typing import Any

import voluptuous as vol

from homeassistant.components import frontend, panel_custom, websocket_api
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
    CONF_CATEGORIES,
    CONF_CUSTOM_ACCENT,
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
    DEFAULTS,
    DOMAIN,
    HIGHLIGHTS,
    JS_PATH,
    JS_URL,
    PANEL_ELEMENT,
    PANEL_JS_PATH,
    PANEL_JS_URL,
    PANEL_URL_PATH,
    PRESETS,
    SIGNAL_UPDATE,
    TINTS,
    VERSION,
    current_options,
)
from .settings import validate_changes

DISABLED: dict[str, Any] = {"enabled": False}


def _accent(options: dict[str, Any]) -> str | None:
    if not options[CONF_CUSTOM_ACCENT]:
        return None
    try:
        red, green, blue = (int(c) for c in options[CONF_ACCENT_COLOR])
    except (TypeError, ValueError):
        return None
    return f"rgb({red}, {green}, {blue})"


def _choice(options: dict[str, Any], key: str, allowed: tuple[str, ...]) -> str:
    value = options[key]
    return value if value in allowed else DEFAULTS[key]


def build_config(entry: ConfigEntry) -> dict[str, Any]:
    options = current_options(entry.options)

    return {
        "enabled": True,
        "version": VERSION,
        "floating": bool(options[CONF_FLOATING]),
        "inset": int(options[CONF_INSET]),
        "radius": int(options[CONF_RADIUS]),
        "blur": int(options[CONF_BLUR]),
        "opacity": int(options[CONF_OPACITY]),
        "tint": _choice(options, CONF_TINT, TINTS),
        "highlight": _choice(options, CONF_HIGHLIGHT, HIGHLIGHTS),
        "accent": _accent(options),
        "hover_motion": bool(options[CONF_HOVER_MOTION]),
        "glass_cards": bool(options[CONF_GLASS_CARDS]),
        "quick_menu": bool(options[CONF_QUICK_MENU]),
        "mobile_width": int(options[CONF_MOBILE_WIDTH]),
        "mobile_blur": bool(options[CONF_MOBILE_BLUR]),
        "mobile_text_size": int(options[CONF_MOBILE_TEXT_SIZE]),
        "mobile_rounded": bool(options[CONF_MOBILE_ROUNDED]),
        "mobile_swipe": bool(options[CONF_MOBILE_SWIPE]),
        "mobile_hide_header": bool(options[CONF_MOBILE_HIDE_HEADER]),
        "categories": options[CONF_CATEGORIES],
    }


@callback
def loaded_entry(hass: HomeAssistant) -> ConfigEntry | None:
    for entry in hass.config_entries.async_entries(DOMAIN):
        if entry.state is ConfigEntryState.LOADED:
            return entry
    return None


@callback
def current_config(hass: HomeAssistant) -> dict[str, Any]:
    entry = loaded_entry(hass)
    return build_config(entry) if entry else DISABLED


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


def _settings_result(entry: ConfigEntry) -> dict[str, Any]:
    return {
        "options": current_options(entry.options),
        "defaults": DEFAULTS,
        "presets": PRESETS,
        "version": VERSION,
    }


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/settings"})
@callback
def ws_settings(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
) -> None:
    if (entry := loaded_entry(hass)) is None:
        connection.send_error(msg["id"], "not_loaded", "Glass Sidebar is not set up")
        return
    connection.send_result(msg["id"], _settings_result(entry))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/settings/update",
        vol.Required("changes"): dict,
    }
)
@callback
def ws_settings_update(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
) -> None:
    if (entry := loaded_entry(hass)) is None:
        connection.send_error(msg["id"], "not_loaded", "Glass Sidebar is not set up")
        return
    try:
        changes = validate_changes(msg["changes"])
    except vol.Invalid as err:
        connection.send_error(msg["id"], "invalid_format", str(err))
        return
    hass.config_entries.async_update_entry(
        entry, options={**current_options(entry.options), **changes}
    )
    connection.send_result(msg["id"], _settings_result(entry))


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    if not hass.data.get(DOMAIN):
        www = Path(__file__).parent / "www"
        await hass.http.async_register_static_paths(
            [
                StaticPathConfig(JS_PATH, str(www / "sidebar.js"), False),
                StaticPathConfig(PANEL_JS_PATH, str(www / "panel.js"), False),
            ]
        )
        websocket_api.async_register_command(hass, ws_subscribe)
        websocket_api.async_register_command(hass, ws_settings)
        websocket_api.async_register_command(hass, ws_settings_update)
        hass.data[DOMAIN] = True

    add_extra_js_url(hass, JS_URL)
    # No sidebar title, so it stays out of the sidebar. The integration's
    # Configure button opens it, because of config_panel_domain.
    await panel_custom.async_register_panel(
        hass,
        frontend_url_path=PANEL_URL_PATH,
        webcomponent_name=PANEL_ELEMENT,
        module_url=PANEL_JS_URL,
        require_admin=True,
        config_panel_domain=DOMAIN,
    )
    entry.async_on_unload(entry.add_update_listener(async_options_updated))
    async_dispatcher_send(hass, SIGNAL_UPDATE, build_config(entry))
    return True


async def async_options_updated(hass: HomeAssistant, entry: ConfigEntry) -> None:
    async_dispatcher_send(hass, SIGNAL_UPDATE, build_config(entry))


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    remove_extra_js_url(hass, JS_URL)
    frontend.async_remove_panel(hass, PANEL_URL_PATH, warn_if_unknown=False)
    async_dispatcher_send(hass, SIGNAL_UPDATE, DISABLED)
    return True
