(() => {
  if (window.__glassSidebar) return;
  window.__glassSidebar = true;

  // Kept in step with VERSION in const.py; a newer server version reloads the page.
  const scriptVersion = "1.5.0";
  const reloadKey = "glass-sidebar-reloaded-for";
  const cacheKey = "glass-sidebar-config";
  const collapsedKey = "glass-sidebar-collapsed";
  const sectionClass = "gs-section";
  const quickClass = "gs-quick";
  const panelIdPrefix = "sidebar-panel-";
  const settingsPath = "/glass-sidebar";
  // Phones only; tablets and desktops keep the normal drawer.
  const phoneQuery = "(max-width: 600px)";

  const sheets = new WeakMap();
  const watched = new WeakSet();
  let config = readCachedConfig();
  let collapsed = readJson(collapsedKey) || {};
  let frame = 0;

  // A fixed glass color, with text colors that stay readable on it.
  const TINTS = {
    light: {
      base: "#ffffff",
      vars: `--sidebar-text-color: #1C1F24; --sidebar-icon-color: #4B5563;
             --primary-text-color: #1C1F24; --secondary-text-color: #5B6370;
             --divider-color: rgba(16, 24, 40, 0.1);`,
    },
    dark: {
      base: "#16181d",
      vars: `--sidebar-text-color: #ECEEF2; --sidebar-icon-color: #A9B1BE;
             --primary-text-color: #ECEEF2; --secondary-text-color: #A4ACB9;
             --divider-color: rgba(255, 255, 255, 0.12);`,
    },
  };

  const TEXT = {
    en: { quick: "Quick settings", style: "Style", floating: "Floating", vivid: "Vivid highlight",
      cards: "Glass cards", opacity: "Opacity", all: "All settings", close: "Close",
      presets: { frosted: "Frosted", midnight: "Midnight", vivid: "Vivid", aurora: "Aurora", minimal: "Minimal", solid: "Solid" } },
    nl: { quick: "Snel aanpassen", style: "Stijl", floating: "Zwevend", vivid: "Fel actief item",
      cards: "Glazen kaarten", opacity: "Dekking", all: "Alle instellingen", close: "Sluiten",
      presets: { frosted: "Frosted", midnight: "Midnight", vivid: "Vivid", aurora: "Aurora", minimal: "Minimaal", solid: "Effen" } },
  };
  const SWATCHES = {
    frosted: "linear-gradient(135deg, #F4F7FB, #DCE6F2)",
    midnight: "linear-gradient(135deg, #2A2F3A, #0E1220)",
    vivid: "linear-gradient(135deg, #29B6F6, #026592)",
    aurora: "linear-gradient(135deg, #9B7BFF, #3B2A7A)",
    minimal: "linear-gradient(135deg, #FFFFFF, #EEF0F3)",
    solid: "linear-gradient(135deg, #FFFFFF, #CBD2DA)",
  };
  const STYLE_KEYS = ["floating", "inset", "radius", "blur", "opacity", "tint", "highlight", "custom_accent", "accent_color"];

  // ha-sidebar lives two shadow roots deep:
  // home-assistant > #shadow > home-assistant-main > #shadow > ha-drawer > ha-sidebar
  function findParts() {
    const ha = document.querySelector("home-assistant");
    const main = ha?.shadowRoot?.querySelector("home-assistant-main");
    const drawer = main?.shadowRoot?.querySelector("ha-drawer");
    const sidebar = main?.shadowRoot?.querySelector("ha-sidebar");
    // Dialogs, like the notifications drawer, are added to home-assistant's shadow root.
    const notifications = ha?.shadowRoot?.querySelector("notification-drawer");
    const notificationsDrawer = notifications?.shadowRoot?.querySelector("ha-drawer");
    return { ha, main, drawer, sidebar, notifications, notificationsDrawer };
  }

  const hass = () => document.querySelector("home-assistant")?.hass;
  const text = () => TEXT[(hass()?.language || "en").startsWith("nl") ? "nl" : "en"];
  const enabled = () => Boolean(config?.enabled);
  const tint = () => TINTS[config?.tint];
  const glassBackground = (opacity, fallback = "var(--card-background-color, #fff)") => {
    const base = tint()?.base ?? `var(--sidebar-background-color, ${fallback})`;
    return `color-mix(in srgb, ${base} ${opacity}%, transparent)`;
  };
  const glassBorder = "1px solid color-mix(in srgb, var(--divider-color, #888) 60%, transparent)";
  const phoneRounded = () => config.mobile_rounded ?? true;

  function mainCss() {
    if (!enabled()) return "";
    const extra = config.inset * 2;
    return `
      ${
        config.floating
          ? `:host(:not([modal])) {
               --ha-sidebar-width: calc(56px + ${extra}px + var(--safe-area-inset-left, 0px));
             }
             :host([expanded]:not([modal])) {
               --ha-sidebar-width: calc(256px + ${extra}px + var(--safe-area-inset-left, 0px));
             }`
          : ""
      }

      ${
        // Cards inherit these from here; dialogs live outside and stay solid.
        config.glass_cards
          ? `:host {
               --ha-card-background: color-mix(
                 in srgb,
                 var(--card-background-color, #fff) 62%,
                 transparent
               );
               --ha-card-backdrop-filter: blur(${config.blur}px) saturate(1.5);
               --ha-card-border-color: color-mix(in srgb, var(--divider-color, #888) 45%, transparent);
               --ha-card-box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05), 0 10px 28px rgba(0, 0, 0, 0.1);
             }`
          : ""
      }
    `;
  }

  // Rules that shape the panel are !important: themes that style the sidebar
  // with card-mod may add their styles after ours, and must not undo the look.
  function drawerCss() {
    if (!enabled()) return "";
    const inset = config.floating ? config.inset : 0;
    const phoneInset = phoneRounded() ? inset : 0;
    return `
      ${
        config.floating
          ? `.sidebar-shell {
               border-inline-end-color: transparent !important;
               background: transparent !important;
               padding: ${inset}px;
             }`
          : ""
      }

      @media ${phoneQuery} {
        wa-drawer {
          --size: min(90vw, ${config.mobile_width ?? 300}px);
          ${config.mobile_blur ?? true ? "--backdrop-filter: blur(8px) saturate(1.2);" : ""}
        }

        wa-drawer::part(dialog) {
          box-sizing: border-box !important;
          padding: ${phoneInset}px !important;
          background: transparent !important;
          box-shadow: none !important;
          border: 0 !important;
        }
      }
    `;
  }

  // The notifications drawer: the same floating glass panel as the sidebar.
  function notificationsDrawerCss() {
    if (!enabled()) return "";
    const inset = config.floating ? config.inset : 0;
    const radius = config.floating ? config.radius : 0;
    return `
      wa-drawer {
        --backdrop-filter: blur(6px) saturate(1.2);
      }

      wa-drawer::part(dialog) {
        box-sizing: border-box !important;
        padding: ${inset}px !important;
        background: transparent !important;
        box-shadow: none !important;
        border: 0 !important;
      }

      wa-drawer::part(body) {
        box-sizing: border-box;
        height: 100%;
        overflow: hidden;
        border-radius: ${radius}px !important;
        background: ${glassBackground(Math.min((config.opacity ?? 74) + 12, 100), "var(--primary-background-color, #fff)")} !important;
        -webkit-backdrop-filter: blur(${config.blur}px) saturate(1.5);
        backdrop-filter: blur(${config.blur}px) saturate(1.5);
        ${config.floating ? `border: ${glassBorder} !important; box-shadow: 0 24px 60px rgba(0, 0, 0, 0.28) !important;` : ""}
      }
    `;
  }

  function notificationsCss() {
    if (!enabled()) return "";
    return `
      :host {
        ${tint()?.vars ?? ""}
      }

      ha-header-bar {
        --app-header-background-color: transparent;
        --app-header-text-color: var(--primary-text-color);
        background-color: transparent !important;
        border-bottom-color: color-mix(in srgb, var(--divider-color, #888) 50%, transparent) !important;
      }

      .notifications {
        background-color: transparent !important;
      }
    `;
  }

  function sidebarCss() {
    if (!enabled()) return "";
    const radius = config.floating ? config.radius : 0;
    const itemRadius = Math.min(Math.max(radius - 6, 8), 14);
    const opacity = config.opacity ?? 74;
    const mobileText = config.mobile_text_size ?? 14;
    // Rows grow with the text but stay a comfortable touch target.
    const mobileItemHeight = Math.max(44, Math.round(mobileText * 3));
    const mobileRadius = phoneRounded() ? radius : 0;
    return `
      :host {
        ${tint()?.vars ?? ""}
        ${
          // HA colors the selected item with this variable, so one override is enough.
          config.accent
            ? `--sidebar-selected-icon-color: ${config.accent};
               --sidebar-selected-text-color: ${config.accent};`
            : ""
        }
        background: ${glassBackground(opacity)} !important;
        -webkit-backdrop-filter: blur(${config.blur}px) saturate(1.5) !important;
        backdrop-filter: blur(${config.blur}px) saturate(1.5) !important;
        border-radius: ${radius}px !important;
        ${
          config.floating
            ? `border: ${glassBorder} !important;
               box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06), 0 12px 32px rgba(0, 0, 0, 0.12) !important;`
            : ""
        }
      }

      /* Some themes draw their own glass layer here; ours replaces it. */
      :host::before {
        content: none !important;
      }

      :host([narrow]) {
        border: 0 !important;
        border-radius: 0 !important;
        box-shadow: none !important;
      }

      @media ${phoneQuery} {
        :host([narrow]) {
          background: ${glassBackground(Math.min(opacity + 12, 100))} !important;
          border-radius: ${mobileRadius}px !important;
          ${
            config.floating && phoneRounded()
              ? `border: ${glassBorder} !important;
                 box-shadow: 0 24px 60px rgba(0, 0, 0, 0.28) !important;`
              : ""
          }
        }

        :host([narrow][expanded]) ha-list-item-button {
          width: calc(100% - 8px);
          --ha-row-item-min-height: ${mobileItemHeight}px;
        }

        :host([narrow]) ha-list-item-button .item-text {
          font-size: ${mobileText}px;
        }

        ${config.mobile_hide_header ? ":host([narrow]) .menu { display: none !important; }" : ""}
      }

      .menu {
        border-bottom-color: transparent;
        background-color: transparent;
      }

      .${quickClass} {
        flex: none;
        width: 40px;
        height: 40px;
        margin-inline-start: auto;
        border: 0;
        border-radius: 12px;
        background: transparent;
        color: var(--sidebar-icon-color);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }

      .${quickClass}:hover,
      .${quickClass}[aria-expanded="true"] {
        background: color-mix(in srgb, var(--primary-text-color) 8%, transparent);
      }

      .${quickClass}:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: 2px;
      }

      :host(:not([expanded])) .${quickClass} {
        display: none;
      }

      ha-list-item-button {
        border-radius: ${itemRadius}px;
        --ha-list-item-focus-radius: ${itemRadius}px;
      }

      ha-list-item-button::part(base),
      ha-list-item-button::part(ripple) {
        border-radius: ${itemRadius}px;
      }

      ha-list-item-button.selected::before {
        border-radius: ${itemRadius}px;
        background-color: var(--sidebar-selected-icon-color, var(--primary-color));
        opacity: 0.14;
      }

      ha-list-item-button.selected::part(headline) {
        font-weight: 600;
      }

      ${config.highlight === "vivid" ? vividCss(itemRadius) : ""}

      ha-list-item-button ha-svg-icon[slot="start"],
      ha-list-item-button ha-icon[slot="start"] {
        transition: transform 160ms ease-out;
      }

      ${
        config.hover_motion ?? true
          ? `ha-list-item-button:hover ha-svg-icon[slot="start"],
             ha-list-item-button:hover ha-icon[slot="start"] {
               transform: translateX(2px);
             }`
          : ""
      }

      ha-list-nav.before-spacer::part(base) {
        display: flex;
        flex-direction: column;
      }

      .${sectionClass} {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0 4px;
        padding: 12px 12px 6px;
        border-radius: 8px;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        white-space: nowrap;
        color: var(--secondary-text-color);
        cursor: pointer;
        user-select: none;
      }

      .${sectionClass}:hover {
        color: var(--primary-text-color);
      }

      .${sectionClass}:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: -2px;
      }

      .${sectionClass} ha-icon {
        --mdc-icon-size: 16px;
        width: 16px;
        height: 16px;
        flex: none;
      }

      .gs-name {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .gs-chevron {
        flex: none;
        transition: transform 160ms ease-out;
      }

      .${sectionClass}[aria-expanded="false"] .gs-chevron {
        transform: rotate(-90deg);
      }

      :host([expanded]) [data-gs-hidden] {
        display: none !important;
      }

      :host(:not([expanded])) .${sectionClass} {
        height: 1px;
        padding: 0;
        margin: 8px 16px;
        font-size: 0;
        background: var(--divider-color);
        cursor: default;
      }

      :host(:not([expanded])) .${sectionClass} > * {
        display: none;
      }

      @media (prefers-reduced-motion: reduce) {
        ha-list-item-button:hover ha-svg-icon[slot="start"],
        ha-list-item-button:hover ha-icon[slot="start"] {
          transform: none;
        }

        .gs-chevron {
          transition: none;
        }
      }
    `;
  }

  // A solid accent pill with a soft glow. HA's highlight layer sits above the
  // item content, so it is moved behind it before it becomes opaque.
  function vividCss(itemRadius) {
    const accent = "var(--sidebar-selected-icon-color, var(--primary-color))";
    return `
      ha-list-item-button.selected {
        isolation: isolate;
      }

      ha-list-item-button.selected::before {
        z-index: -1;
        opacity: 1;
        border-radius: ${itemRadius}px;
        background: linear-gradient(
          135deg,
          color-mix(in srgb, ${accent} 78%, black),
          color-mix(in srgb, ${accent} 60%, black)
        );
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.25),
          0 6px 18px -4px color-mix(in srgb, ${accent} 70%, transparent);
      }

      ha-list-item-button.selected::part(headline),
      ha-list-item-button.selected ha-svg-icon[slot="start"],
      ha-list-item-button.selected ha-icon[slot="start"] {
        color: #fff;
      }
    `;
  }

  function applySheet(root, css) {
    let sheet = sheets.get(root);
    if (!sheet) {
      if (!css) return;
      sheet = new CSSStyleSheet();
      // Appended after Lit's own adopted sheets, so equal selectors win.
      root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
      sheets.set(root, sheet);
    }
    sheet.replaceSync(css);
  }

  function setOrder(el, order) {
    const value = order === null ? "" : String(order);
    if (el.style.order !== value) el.style.order = value;
  }

  function setFlag(el, name, on) {
    if (on !== el.hasAttribute(name)) el.toggleAttribute(name, on);
  }

  const isCollapsed = (category) =>
    category.name in collapsed ? collapsed[category.name] : Boolean(category.collapsed);

  function toggleCategory(name, category) {
    collapsed = { ...collapsed, [name]: !isCollapsed(category) };
    writeJson(collapsedKey, collapsed);
    schedule();
  }

  function makeHeader(key, category) {
    const header = document.createElement("div");
    header.className = sectionClass;
    header.dataset.key = key;
    header.setAttribute("role", "button");
    header.tabIndex = 0;
    if (category.icon) {
      const icon = document.createElement("ha-icon");
      icon.setAttribute("icon", category.icon);
      header.append(icon);
    }
    const name = document.createElement("span");
    name.className = "gs-name";
    name.textContent = category.name;
    header.append(name);
    header.insertAdjacentHTML(
      "beforeend",
      '<svg class="gs-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>'
    );
    header.addEventListener("click", () => toggleCategory(category.name, category));
    header.addEventListener("keydown", (ev) => {
      if (ev.key !== "Enter" && ev.key !== " ") return;
      ev.preventDefault();
      toggleCategory(category.name, category);
    });
    return header;
  }

  // Categories only change the visual order (CSS `order`). The items stay
  // where Lit rendered them, so HA can keep updating the list.
  function applyCategories(sidebar) {
    const holder = sidebar.shadowRoot.querySelector(
      'ha-list-nav.before-spacer slot[name="main-navigation"]'
    );
    if (!holder) return;

    const categories = enabled() ? config.categories || [] : [];
    const lookup = new Map();
    categories.forEach((category, index) => {
      category.panels.forEach((panel, position) => {
        const key = panel.toLowerCase();
        if (!lookup.has(key)) lookup.set(key, (index + 1) * 1000 + 1 + position);
      });
    });

    const used = new Set();
    let natural = 0;
    let previous = 0;
    for (const el of holder.children) {
      if (el.classList.contains(sectionClass)) continue;

      if (el.localName !== "ha-list-item-button") {
        // Tooltips and other helpers follow the item before them.
        setOrder(el, categories.length ? previous : null);
        continue;
      }

      const path = el.id.startsWith(panelIdPrefix)
        ? el.id.slice(panelIdPrefix.length).toLowerCase()
        : "";
      const title =
        el.querySelector(".item-text")?.textContent.trim().toLowerCase() ?? "";
      // A panel listed in several categories goes to the first one.
      const listed = Math.min(lookup.get(path) ?? Infinity, lookup.get(title) ?? Infinity);
      const order = listed === Infinity ? natural : listed;
      const index = order >= 1000 ? Math.floor(order / 1000) - 1 : -1;
      if (index >= 0) used.add(index);

      natural += 1;
      previous = order;
      setOrder(el, categories.length ? order : null);
      // The page you're on stays visible inside a collapsed category.
      setFlag(
        el,
        "data-gs-hidden",
        index >= 0 && isCollapsed(categories[index]) && !el.classList.contains("selected")
      );
    }

    const existing = new Map(
      [...holder.querySelectorAll(`:scope > .${sectionClass}`)].map((el) => [
        el.dataset.key,
        el,
      ])
    );
    categories.forEach((category, index) => {
      const key = `${index}:${category.name}:${category.icon || ""}`;
      let header = existing.get(key);
      existing.delete(key);

      if (!used.has(index)) {
        header?.remove();
        return;
      }
      if (!header) {
        header = makeHeader(key, category);
        holder.append(header);
      }
      const expanded = String(!isCollapsed(category));
      if (header.getAttribute("aria-expanded") !== expanded) {
        header.setAttribute("aria-expanded", expanded);
      }
      setOrder(header, (index + 1) * 1000);
    });
    existing.forEach((el) => el.remove());
  }

  // ---- Quick settings ----

  let quick = null;

  function applyQuickButton(sidebar) {
    const menu = sidebar.shadowRoot.querySelector(".menu");
    if (!menu) return;
    let button = menu.querySelector(`.${quickClass}`);
    const wanted = enabled() && (config.quick_menu ?? true) && Boolean(hass()?.user?.is_admin);
    if (!wanted) {
      button?.remove();
      if (quick) closeQuick();
      return;
    }
    if (button) return;
    button = document.createElement("button");
    button.type = "button";
    button.className = quickClass;
    button.setAttribute("aria-label", text().quick);
    button.setAttribute("aria-expanded", "false");
    button.innerHTML =
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h4M12 17h8M16 5v4M10 15v4"/></svg>';
    // Don't let HA's header actions (hold to edit the sidebar) fire.
    for (const type of ["pointerdown", "mousedown", "touchstart"]) {
      button.addEventListener(type, (ev) => ev.stopPropagation());
    }
    button.addEventListener("click", (ev) => {
      ev.stopPropagation();
      if (quick) closeQuick();
      else openQuick(button);
    });
    menu.append(button);
  }

  const QUICK_CSS = `
    :host {
      all: initial;
      position: fixed;
      z-index: 9999;
      font-family: var(--ha-font-family-body, Roboto, sans-serif);
      color: var(--primary-text-color, #1C1F24);
    }
    :host([popover]) { margin: 0; padding: 0; border: 0; background: transparent; overflow: visible; inset: auto; }
    .card {
      box-sizing: border-box;
      width: 320px;
      max-width: calc(100vw - 24px);
      display: flex;
      flex-direction: column;
      gap: 14px;
      padding: 16px;
      border-radius: 22px;
      background: color-mix(in srgb, var(--card-background-color, #fff) 82%, transparent);
      border: 1px solid color-mix(in srgb, var(--divider-color, #888) 60%, transparent);
      box-shadow: 0 30px 70px rgba(16, 24, 40, 0.25);
      -webkit-backdrop-filter: blur(24px) saturate(1.6);
      backdrop-filter: blur(24px) saturate(1.6);
    }
    .head { display: flex; align-items: center; gap: 8px; }
    .title { flex: 1; font-size: 16px; font-weight: 700; }
    .label { font-size: 12px; font-weight: 600; color: var(--secondary-text-color, #5B6370); }
    button { font: inherit; color: inherit; }
    .icon-button { width: 36px; height: 36px; border: 0; border-radius: 10px; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .styles { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
    .style { display: flex; flex-direction: column; align-items: center; gap: 5px; padding: 0; border: 0; background: none; cursor: pointer; font-size: 11px; font-weight: 500; }
    .swatch { width: 100%; height: 40px; border-radius: 12px; box-shadow: 0 0 0 1px rgba(16, 24, 40, 0.12); }
    .style[aria-pressed="true"] .swatch { box-shadow: 0 0 0 2.5px var(--primary-color, #03A9F4); }
    .toggles { display: flex; flex-direction: column; padding: 2px 12px; border-radius: 14px; background: color-mix(in srgb, var(--primary-text-color, #000) 5%, transparent); }
    .toggle { display: flex; align-items: center; gap: 12px; min-height: 46px; cursor: pointer; font-size: 14px; }
    .toggle + .toggle { border-top: 1px solid color-mix(in srgb, var(--divider-color, #888) 60%, transparent); }
    .toggle span { flex: 1; }
    .toggle input { appearance: none; -webkit-appearance: none; position: relative; flex: none; width: 42px; height: 24px; margin: 0; border-radius: 12px; cursor: pointer;
      background: color-mix(in srgb, var(--secondary-text-color, #5B6370) 45%, transparent); transition: background 150ms; }
    .toggle input::before { content: ""; position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.3); transition: transform 150ms; }
    .toggle input:checked { background: var(--primary-color, #03A9F4); }
    .toggle input:checked::before { transform: translateX(18px); }
    .range { display: flex; flex-direction: column; gap: 6px; }
    .range label { display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; }
    .range input { width: 100%; margin: 0; accent-color: var(--primary-color, #03A9F4); }
    .all { height: 44px; display: flex; align-items: center; justify-content: center; border: 0; border-radius: 12px; background: var(--primary-color, #03A9F4); color: var(--text-primary-color, #fff); font-weight: 600; cursor: pointer; }
    :focus-visible { outline: 2px solid var(--primary-color, #03A9F4); outline-offset: 2px; }
  `;

  const sameStyle = (options, values) =>
    STYLE_KEYS.every((key) => !(key in values) || JSON.stringify(options[key]) === JSON.stringify(values[key]));

  async function openQuick(button) {
    const conn = hass()?.connection;
    if (!conn) return;
    const t = text();
    const host = document.createElement("div");
    host.className = "glass-sidebar-quick";
    const root = host.attachShadow({ mode: "open" });
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(QUICK_CSS);
    root.adoptedStyleSheets = [sheet];
    const card = document.createElement("section");
    card.className = "card";
    card.setAttribute("role", "dialog");
    card.setAttribute("aria-label", t.quick);
    root.append(card);

    quick = { host, button, card, settings: null };
    button.setAttribute("aria-expanded", "true");
    document.body.append(host);
    positionQuick();
    // The phone drawer is a modal <dialog> in the top layer; a popover can sit above it.
    if (host.showPopover) {
      host.setAttribute("popover", "manual");
      host.showPopover();
    }

    try {
      quick.settings = await hass().callWS({ type: "glass_sidebar/settings" });
    } catch (err) {
      console.warn("Glass Sidebar: could not load settings", err);
      closeQuick();
      return;
    }
    renderQuick();
    card.querySelector("button, input")?.focus();
  }

  function positionQuick() {
    if (!quick) return;
    const { host, button } = quick;
    if (matchMedia(phoneQuery).matches) {
      Object.assign(host.style, { left: "12px", right: "12px", bottom: "12px", top: "auto" });
      return;
    }
    const rect = button.getBoundingClientRect();
    Object.assign(host.style, { left: `${Math.round(rect.right + 12)}px`, top: `${Math.round(rect.top)}px` });
  }

  function renderQuick() {
    if (!quick?.settings) return;
    const t = text();
    const { options, presets } = quick.settings;
    const styles = [
      ...Object.entries(presets).map(([id, values]) => ({ id, name: t.presets[id] ?? id, values, swatch: SWATCHES[id] })),
      ...(options.custom_styles || []).map((style, i) => ({
        id: `custom-${i}`, name: style.name, values: style.values,
        swatch: "linear-gradient(135deg, var(--primary-color, #03A9F4), color-mix(in srgb, var(--primary-color, #03A9F4) 50%, black))",
      })),
    ];
    const card = quick.card;
    card.replaceChildren();

    const head = document.createElement("div");
    head.className = "head";
    const title = document.createElement("span");
    title.className = "title";
    title.textContent = t.quick;
    const close = document.createElement("button");
    close.type = "button";
    close.className = "icon-button";
    close.setAttribute("aria-label", t.close);
    close.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
    close.addEventListener("click", closeQuick);
    head.append(title, close);

    const styleLabel = document.createElement("span");
    styleLabel.className = "label";
    styleLabel.textContent = t.style;
    const grid = document.createElement("div");
    grid.className = "styles";
    for (const style of styles) {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "style";
      item.setAttribute("aria-pressed", String(sameStyle(options, style.values)));
      const swatch = document.createElement("span");
      swatch.className = "swatch";
      swatch.style.background = style.swatch;
      const name = document.createElement("span");
      name.textContent = style.name;
      item.append(swatch, name);
      item.addEventListener("click", () => updateQuick(style.values));
      grid.append(item);
    }

    const toggles = document.createElement("div");
    toggles.className = "toggles";
    const toggle = (label, checked, onChange) => {
      const row = document.createElement("label");
      row.className = "toggle";
      const span = document.createElement("span");
      span.textContent = label;
      const input = document.createElement("input");
      input.type = "checkbox";
      input.setAttribute("role", "switch");
      input.checked = checked;
      input.addEventListener("change", () => onChange(input.checked));
      row.append(span, input);
      toggles.append(row);
    };
    toggle(t.floating, options.floating, (on) => updateQuick({ floating: on }));
    toggle(t.vivid, options.highlight === "vivid", (on) => updateQuick({ highlight: on ? "vivid" : "soft" }));
    toggle(t.cards, options.glass_cards, (on) => updateQuick({ glass_cards: on }));

    const range = document.createElement("div");
    range.className = "range";
    const rangeLabel = document.createElement("label");
    rangeLabel.htmlFor = "gs-quick-opacity";
    const rangeName = document.createElement("span");
    rangeName.textContent = t.opacity;
    const rangeValue = document.createElement("span");
    rangeValue.textContent = `${options.opacity} %`;
    rangeLabel.append(rangeName, rangeValue);
    const slider = document.createElement("input");
    slider.type = "range";
    slider.id = "gs-quick-opacity";
    slider.min = "40";
    slider.max = "100";
    slider.value = String(options.opacity);
    slider.addEventListener("input", () => { rangeValue.textContent = `${slider.value} %`; });
    slider.addEventListener("change", () => updateQuick({ opacity: Number(slider.value) }));
    range.append(rangeLabel, slider);

    const all = document.createElement("button");
    all.type = "button";
    all.className = "all";
    all.textContent = t.all;
    all.addEventListener("click", () => {
      closeQuick();
      navigate(settingsPath);
    });

    card.append(head, styleLabel, grid, toggles, range, all);
  }

  async function updateQuick(changes) {
    if (!quick) return;
    try {
      quick.settings = await hass().callWS({ type: "glass_sidebar/settings/update", changes });
    } catch (err) {
      console.warn("Glass Sidebar: could not save", err);
    }
    const active = quick?.card.contains(quick.card.getRootNode().activeElement) ? quick.card.getRootNode().activeElement : null;
    const focusIndex = active ? [...quick.card.querySelectorAll("button, input")].indexOf(active) : -1;
    renderQuick();
    if (focusIndex >= 0) quick?.card.querySelectorAll("button, input")[focusIndex]?.focus();
  }

  function closeQuick() {
    if (!quick) return;
    const { host, button } = quick;
    quick = null;
    button.setAttribute("aria-expanded", "false");
    if (host.hidePopover && host.matches(":popover-open")) host.hidePopover();
    host.remove();
    if (button.isConnected) button.focus({ preventScroll: true });
  }

  document.addEventListener("pointerdown", (ev) => {
    if (!quick) return;
    const path = ev.composedPath();
    if (!path.includes(quick.host) && !path.includes(quick.button)) closeQuick();
  }, true);
  document.addEventListener("keydown", (ev) => {
    if (quick && ev.key === "Escape") closeQuick();
  }, true);
  window.addEventListener("resize", () => positionQuick());

  function navigate(path) {
    history.pushState(null, "", path);
    window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: false } }));
    // On a phone the menu is a drawer; close it so the page is visible.
    const { main, sidebar } = findParts();
    if (main?.hasAttribute("modal")) {
      sidebar?.dispatchEvent(
        new CustomEvent("hass-toggle-menu", { detail: { open: false }, bubbles: true, composed: true })
      );
    }
  }

  // ---- Swipe from the left edge to open the menu on phones ----

  let swipe = null;
  document.addEventListener("touchstart", (ev) => {
    swipe = null;
    if (!enabled() || !config.mobile_swipe || !matchMedia(phoneQuery).matches) return;
    const touch = ev.touches[0];
    if (ev.touches.length !== 1 || touch.clientX > 24) return;
    swipe = { x: touch.clientX, y: touch.clientY };
  }, { passive: true });
  document.addEventListener("touchmove", (ev) => {
    if (!swipe) return;
    const touch = ev.touches[0];
    if (Math.abs(touch.clientY - swipe.y) > 40) {
      swipe = null;
      return;
    }
    if (touch.clientX - swipe.x > 50) {
      swipe = null;
      findParts().sidebar?.dispatchEvent(
        new CustomEvent("hass-toggle-menu", { detail: { open: true }, bubbles: true, composed: true })
      );
    }
  }, { passive: true });
  document.addEventListener("touchend", () => { swipe = null; }, { passive: true });

  // ---- Wiring ----

  // `classes` also catches HA moving the "selected" class when you navigate.
  function watch(root, classes = false) {
    if (watched.has(root)) return;
    watched.add(root);
    new MutationObserver(schedule).observe(root, {
      childList: true,
      subtree: true,
      ...(classes ? { attributes: true, attributeFilter: ["class"] } : {}),
    });
  }

  function render() {
    frame = 0;
    const { ha, main, drawer, sidebar, notifications, notificationsDrawer } = findParts();
    if (ha?.shadowRoot) watch(ha.shadowRoot);
    if (notifications?.shadowRoot) {
      // The drawer inside is only rendered once it opens.
      watch(notifications.shadowRoot);
      applySheet(notifications.shadowRoot, notificationsCss());
    }
    if (notificationsDrawer?.shadowRoot) {
      applySheet(notificationsDrawer.shadowRoot, notificationsDrawerCss());
    }
    if (main?.shadowRoot) {
      watch(main.shadowRoot);
      applySheet(main.shadowRoot, mainCss());
    }
    if (drawer?.shadowRoot) applySheet(drawer.shadowRoot, drawerCss());
    if (sidebar?.shadowRoot) {
      watch(sidebar.shadowRoot, true);
      applySheet(sidebar.shadowRoot, sidebarCss());
      applyCategories(sidebar);
      applyQuickButton(sidebar);
    }
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(render);
  }

  function readJson(key) {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch (err) {
      return null;
    }
  }

  function writeJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      // Storage can be blocked; the live state still applies.
    }
  }

  function readCachedConfig() {
    return readJson(cacheKey);
  }

  // After an update the app often keeps the old page (and this old script)
  // open. Reload once so the browser picks up the new version by itself.
  function reloadForVersion(version) {
    try {
      if (sessionStorage.getItem(reloadKey) === version) return;
      sessionStorage.setItem(reloadKey, version);
    } catch (err) {
      return; // Without storage we can't guard against reload loops.
    }
    location.reload();
  }

  function setConfig(value) {
    if (value?.version && value.version !== scriptVersion) reloadForVersion(value.version);
    config = value;
    writeJson(cacheKey, value);
    if (quick && !enabled()) closeQuick();
    schedule();
  }

  function subscribe() {
    const connection = hass()?.connection;
    if (!connection) {
      setTimeout(subscribe, 500);
      return;
    }
    connection
      .subscribeMessage(setConfig, { type: "glass_sidebar/subscribe" })
      .catch((err) => console.warn("Glass Sidebar: could not load settings", err));
  }

  function start() {
    if (!document.querySelector("home-assistant")?.shadowRoot) {
      setTimeout(start, 200);
      return;
    }
    render();
    subscribe();
  }

  start();
})();
