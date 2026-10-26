# Apple Glass Sidebar

A lightweight Home Assistant custom integration that turns the left navigation
into a floating glass panel with rounded items, subtle hover motion, a
theme-aware selected-item highlight and optional categories.

## Install

1. Copy `custom_components/glass_sidebar` into the `custom_components` folder
   of your Home Assistant configuration.
2. Restart Home Assistant.
3. In **Settings → Devices & services**, select **Add integration** and search
   for **Apple Glass Sidebar**.
4. Refresh the browser page (a hard refresh may be needed).

To install through HACS, add the repository as a custom integration after it
has been published to GitHub. Before publishing, replace the example
`documentation` URL in `custom_components/glass_sidebar/manifest.json` with
the repository URL.

## Options

Open **Settings → Devices & services → Apple Glass Sidebar → Configure**.
Changes apply right away in every open browser.

- **Floating**: show the sidebar as a separate panel with space around it.
- **Distance to screen edge**, **Corner radius**, **Blur**: fine-tune the look.
- **Categories**: one category per line, a name followed by a colon and the
  panels that belong to it:

  ```text
  Dashboards: lovelace, energy, map
  Insight: logbook, history, media-browser, todo
  ```

  Use the panel's URL path (the part after the first `/` in the address bar)
  or its title as shown in the sidebar. Panels you don't list stay at the top
  in Home Assistant's own order. Settings, notifications and the profile always
  stay at the bottom.

## Notes

- It uses Home Assistant's active theme colors and adds no frontend
  dependencies.
- Categories change the visual order only. Keyboard arrow navigation in the
  sidebar still follows Home Assistant's own order.
- Home Assistant's sidebar is part of its frontend, so a future frontend update
  may change the internal elements this styling targets. Built against the
  structure of frontend release 20260930 (Home Assistant 2026.10).
