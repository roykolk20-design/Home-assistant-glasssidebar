import re
from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.components.frontend import DATA_PANELS
from homeassistant.core import HomeAssistant, callback
from homeassistant.data_entry_flow import FlowResult
from homeassistant.helpers.selector import (
    BooleanSelector,
    ColorRGBSelector,
    NumberSelector,
    NumberSelectorConfig,
    NumberSelectorMode,
    SelectOptionDict,
    SelectSelector,
    SelectSelectorConfig,
    SelectSelectorMode,
    TextSelector,
)

from .const import (
    CONF_ACCENT_COLOR,
    CONF_BLUR,
    CONF_CATEGORIES,
    CONF_CUSTOM_ACCENT,
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
    DEFAULTS,
    DOMAIN,
    HIGHLIGHTS,
    PANEL_URL_PATH,
    TINTS,
    stored_categories,
)

CONF_NAME = "name"
CONF_PANELS = "panels"
CONF_CATEGORY = "category"
CONF_POSITION = "position"
CONF_REMOVE = "remove"

# Panels HA always shows at the bottom; they can't be put in a category.
FIXED_PANELS = {"config", "profile", "notfound", PANEL_URL_PATH}
# Where HA keeps titles the user changed in the sidebar editor.
DATA_PANELS_CONFIG = "frontend_panels_config"


def _slider(minimum: int, maximum: int, unit: str = "px") -> NumberSelector:
    return NumberSelector(
        NumberSelectorConfig(
            min=minimum,
            max=maximum,
            step=1,
            unit_of_measurement=unit,
            mode=NumberSelectorMode.SLIDER,
        )
    )


APPEARANCE_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_FLOATING): BooleanSelector(),
        vol.Required(CONF_INSET): _slider(0, 24),
        vol.Required(CONF_RADIUS): _slider(0, 32),
        vol.Required(CONF_BLUR): _slider(0, 40),
        vol.Required(CONF_OPACITY): _slider(40, 100, "%"),
        vol.Required(CONF_TINT): SelectSelector(
            SelectSelectorConfig(
                options=list(TINTS),
                mode=SelectSelectorMode.LIST,
                translation_key=CONF_TINT,
            )
        ),
        vol.Required(CONF_HIGHLIGHT): SelectSelector(
            SelectSelectorConfig(
                options=list(HIGHLIGHTS),
                mode=SelectSelectorMode.LIST,
                translation_key=CONF_HIGHLIGHT,
            )
        ),
        vol.Required(CONF_CUSTOM_ACCENT): BooleanSelector(),
        vol.Required(CONF_ACCENT_COLOR): ColorRGBSelector(),
        vol.Required(CONF_HOVER_MOTION): BooleanSelector(),
        vol.Required(CONF_GLASS_CARDS): BooleanSelector(),
        vol.Required(CONF_EXTEND_BACKGROUND): BooleanSelector(),
        vol.Required(CONF_QUICK_MENU): BooleanSelector(),
    }
)

MOBILE_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_MOBILE_WIDTH): _slider(240, 360),
        vol.Required(CONF_MOBILE_TEXT_SIZE): _slider(12, 20),
        vol.Required(CONF_MOBILE_BLUR): BooleanSelector(),
        vol.Required(CONF_MOBILE_ROUNDED): BooleanSelector(),
        vol.Required(CONF_MOBILE_SWIPE): BooleanSelector(),
        vol.Required(CONF_MOBILE_HIDE_HEADER): BooleanSelector(),
    }
)


def panel_label(url_path: str, title: str | None) -> str:
    if not title:
        title = "Overview" if url_path == "lovelace" else url_path
    elif re.fullmatch(r"[a-z0-9_]+", title):
        # Built-in panels carry a translation key such as "energy".
        title = title.replace("_", " ").capitalize()
    return f"{title} (/{url_path})"


@callback
def panel_choices(hass: HomeAssistant, selected: list[str]) -> list[SelectOptionDict]:
    overrides = hass.data.get(DATA_PANELS_CONFIG) or {}
    choices = {
        url_path: panel_label(
            url_path, (overrides.get(url_path) or {}).get("title") or panel.sidebar_title
        )
        for url_path, panel in (hass.data.get(DATA_PANELS) or {}).items()
        if url_path not in FIXED_PANELS
    }
    # Keep panels from earlier settings visible even if they are gone now.
    for value in selected:
        choices.setdefault(value, value)
    return [
        SelectOptionDict(value=value, label=label)
        for value, label in sorted(choices.items(), key=lambda item: item[1].lower())
    ]


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
    """A menu of settings pages. Every change is stored right away."""

    def __init__(self) -> None:
        self._options: dict[str, Any] = {}
        self._editing = 0

    @property
    def _categories(self) -> list[dict[str, Any]]:
        return self._options[CONF_CATEGORIES]

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        if not self._options:
            self._options = {**DEFAULTS, **self.config_entry.options}
            self._options[CONF_CATEGORIES] = stored_categories(self._options)
        return self.async_show_menu(
            step_id="init",
            menu_options=["appearance", "mobile", "categories", "done"],
        )

    async def async_step_appearance(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        if user_input is not None:
            self._store(user_input)
            return await self.async_step_init()
        return self._settings_form("appearance", APPEARANCE_SCHEMA)

    async def async_step_mobile(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        if user_input is not None:
            self._store(user_input)
            return await self.async_step_init()
        return self._settings_form("mobile", MOBILE_SCHEMA)

    async def async_step_done(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        return self.async_create_entry(data=self._options)

    def _store(self, changes: dict[str, Any]) -> None:
        """Save right away, so the sidebar updates while the menu stays open."""
        self._options = {**self._options, **changes}
        self.hass.config_entries.async_update_entry(
            self.config_entry, options=self._options
        )

    async def async_step_categories(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        menu = ["category_add"]
        if self._categories:
            menu.append("category_pick")
        menu.append("init")
        return self.async_show_menu(
            step_id="categories",
            menu_options=menu,
            description_placeholders={"categories": self._summary()},
        )

    async def async_step_category_add(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            name = user_input[CONF_NAME].strip()
            if error := self._name_error(name, skip=None):
                errors[CONF_NAME] = error
            else:
                self._store(
                    {
                        CONF_CATEGORIES: [
                            *self._categories,
                            {"name": name, "panels": user_input.get(CONF_PANELS, [])},
                        ]
                    }
                )
                return await self.async_step_categories()

        values = user_input or {}
        return self.async_show_form(
            step_id="category_add",
            data_schema=self.add_suggested_values_to_schema(
                self._category_schema(values.get(CONF_PANELS, []), edit=False),
                values,
            ),
            errors=errors,
        )

    async def async_step_category_pick(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        if user_input is not None:
            self._editing = int(user_input[CONF_CATEGORY])
            return await self.async_step_category_edit()

        options = [
            SelectOptionDict(value=str(index), label=category["name"])
            for index, category in enumerate(self._categories)
        ]
        return self.async_show_form(
            step_id="category_pick",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_CATEGORY): SelectSelector(
                        SelectSelectorConfig(options=options, mode=SelectSelectorMode.LIST)
                    )
                }
            ),
        )

    async def async_step_category_edit(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        categories = list(self._categories)
        current = categories[self._editing]
        errors: dict[str, str] = {}

        if user_input is not None:
            name = user_input[CONF_NAME].strip()
            if user_input.get(CONF_REMOVE):
                del categories[self._editing]
                self._store({CONF_CATEGORIES: categories})
                return await self.async_step_categories()
            if error := self._name_error(name, skip=self._editing):
                errors[CONF_NAME] = error
            else:
                del categories[self._editing]
                position = min(max(int(user_input[CONF_POSITION]), 1), len(categories) + 1)
                categories.insert(
                    position - 1,
                    {**current, "name": name, "panels": user_input.get(CONF_PANELS, [])},
                )
                self._store({CONF_CATEGORIES: categories})
                return await self.async_step_categories()

        values = user_input or {
            CONF_NAME: current["name"],
            CONF_PANELS: current["panels"],
            CONF_POSITION: self._editing + 1,
            CONF_REMOVE: False,
        }
        return self.async_show_form(
            step_id="category_edit",
            data_schema=self.add_suggested_values_to_schema(
                self._category_schema(values.get(CONF_PANELS, []), edit=True), values
            ),
            errors=errors,
            description_placeholders={"name": current["name"]},
        )

    def _settings_form(self, step_id: str, schema: vol.Schema) -> FlowResult:
        return self.async_show_form(
            step_id=step_id,
            data_schema=self.add_suggested_values_to_schema(schema, self._options),
        )

    def _category_schema(self, selected: list[str], edit: bool) -> vol.Schema:
        fields: dict[Any, Any] = {
            vol.Required(CONF_NAME): TextSelector(),
            vol.Optional(CONF_PANELS, default=[]): SelectSelector(
                SelectSelectorConfig(
                    options=panel_choices(self.hass, selected),
                    multiple=True,
                    custom_value=True,
                    sort=False,
                    mode=SelectSelectorMode.DROPDOWN,
                )
            ),
        }
        if edit:
            fields[vol.Required(CONF_POSITION)] = NumberSelector(
                NumberSelectorConfig(
                    min=1,
                    max=max(len(self._categories), 1),
                    step=1,
                    mode=NumberSelectorMode.BOX,
                )
            )
            fields[vol.Required(CONF_REMOVE, default=False)] = BooleanSelector()
        return vol.Schema(fields)

    def _name_error(self, name: str, skip: int | None) -> str | None:
        if not name:
            return "name_required"
        taken = {
            category["name"].lower()
            for index, category in enumerate(self._categories)
            if index != skip
        }
        return "name_exists" if name.lower() in taken else None

    def _summary(self) -> str:
        if not self._categories:
            return "—"
        return "\n".join(
            f"- **{category['name']}**: {', '.join(category['panels']) or '—'}"
            for category in self._categories
        )
