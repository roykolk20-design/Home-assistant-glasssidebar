# Changelog

## [1.4.0]

- **Changes are saved right away.** The settings menu no longer needs Save;
  every change is stored and shown immediately. *Save* is now *Close*.
- **No more clearing the cache after an update.** When the app or browser
  still runs the previous version, it reloads itself once.
- **Notifications** open in the same floating glass panel as the sidebar.
- **Works with themes that style the sidebar**, such as Frosted Glass: their
  sidebar background, border and glass layer no longer override the plugin.
  The rest of the theme keeps working.

## [1.3.0]

- **Text size on phones** is now a setting (Phone → Text size). The default
  is 14 px, the same as normal Home Assistant; it was 16 px.

## [1.2.1]

- Ready for the Home Assistant Marketplace (built in from Home Assistant
  2026.11) and the HACS default list: all HACS and hassfest checks pass without
  exceptions.
- README: how to install and update through the Marketplace.

## [1.2.0]

### New

- **Settings menu.** *Configure* now opens a menu with Appearance, Phone,
  Categories and Save. Changes are kept until you choose Save.
- **Category editor.** Add, rename, reorder and remove categories, and pick
  panels from a list of your own panels instead of typing them.
- **Vivid highlight.** Optional solid accent pill with a soft glow for the
  selected item.
- **Glass dashboard cards.** Optional: dashboard cards become translucent with
  the same blur as the sidebar.
- **Own accent color**, **panel opacity** and a switch for the **hover
  animation**.
- **Phone settings:** drawer width and whether the page behind it is blurred.

### Upgrading

Your existing settings, including categories written as text in 1.1, are
taken over automatically.

## [1.1.1]

- Narrower drawer on phones.

## [1.1.0]

- Floating glass sidebar with options for distance, radius and blur.
- Categories in the sidebar.
- Wider drawer with a blurred background on phones.
- Settings apply live, without reloading the page.
