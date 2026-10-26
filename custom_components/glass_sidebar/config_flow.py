from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.core import callback
from homeassistant.data_entry_flow import FlowResult
from homeassistant.helpers.selector import (
    BooleanSelector,
    NumberSelector,
    NumberSelectorConfig,
    NumberSelectorMode,
    TextSelector,
    TextSelectorConfig,
)

from .const import (
    CONF_BLUR,
    CONF_CATEGORIES,
    CONF_FLOATING,
    CONF_INSET,
    CONF_RADIUS,
    DEFAULTS,
    DOMAIN,
    parse_categories,
)


def _slider(maximum: int) -> NumberSelector:
    return NumberSelector(
        NumberSelectorConfig(
            min=0,
            max=maximum,
            step=1,
            unit_of_measurement="px",
            mode=NumberSelectorMode.SLIDER,
        )
    )


OPTIONS_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_FLOATING): BooleanSelector(),
        vol.Required(CONF_INSET): _slider(24),
        vol.Required(CONF_RADIUS): _slider(32),
        vol.Required(CONF_BLUR): _slider(40),
        vol.Optional(CONF_CATEGORIES): TextSelector(
            TextSelectorConfig(multiline=True)
        ),
    }
)


class GlassSidebarConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    VERSION = 1

    @staticmethod
    @callback
    def async_get_options_flow(
        config_entry: config_entries.ConfigEntry,
    ) -> config_entries.OptionsFlow:
        return GlassSidebarOptionsFlow()

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        if self._async_current_entries():
            return self.async_abort(reason="single_instance_allowed")

        return self.async_create_entry(title="Glass Sidebar", data={})


class GlassSidebarOptionsFlow(config_entries.OptionsFlow):
    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            try:
                parse_categories(user_input.get(CONF_CATEGORIES, ""))
            except ValueError:
                errors[CONF_CATEGORIES] = "invalid_categories"
            else:
                return self.async_create_entry(
                    data={CONF_CATEGORIES: "", **user_input}
                )

        values = {**DEFAULTS, **self.config_entry.options, **(user_input or {})}
        return self.async_show_form(
            step_id="init",
            data_schema=self.add_suggested_values_to_schema(OPTIONS_SCHEMA, values),
            errors=errors,
        )
