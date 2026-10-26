(() => {
  if (window.__glassSidebar) return;
  window.__glassSidebar = true;

  const cacheKey = "glass-sidebar-config";
  const sectionClass = "gs-section";
  const panelIdPrefix = "sidebar-panel-";
  // Phones only; tablets and desktops keep the normal drawer.
  const phoneQuery = "(max-width: 600px)";

  const sheets = new WeakMap();
  const watched = new WeakSet();
  let config = readCachedConfig();
  let frame = 0;

  // ha-sidebar lives two shadow roots deep:
  // home-assistant > #shadow > home-assistant-main > #shadow > ha-drawer > ha-sidebar
  function findParts() {
    const ha = document.querySelector("home-assistant");
    const main = ha?.shadowRoot?.querySelector("home-assistant-main");
    const drawer = main?.shadowRoot?.querySelector("ha-drawer");
    const sidebar = main?.shadowRoot?.querySelector("ha-sidebar");
    return { ha, main, drawer, sidebar };
  }

  const enabled = () => Boolean(config?.enabled);

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

  function drawerCss() {
    if (!enabled()) return "";
    const inset = config.floating ? config.inset : 0;
    return `
      ${
        config.floating
          ? `.sidebar-shell {
               border-inline-end-color: transparent;
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
          box-sizing: border-box;
          padding: ${inset}px;
          background: transparent;
          box-shadow: none;
        }
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
    return `
      :host {
        ${
          // HA colors the selected item with this variable, so one override is enough.
          config.accent
            ? `--sidebar-selected-icon-color: ${config.accent};
               --sidebar-selected-text-color: ${config.accent};`
            : ""
        }
        background: color-mix(
          in srgb,
          var(--sidebar-background-color, var(--card-background-color, #fff)) ${opacity}%,
          transparent
        );
        -webkit-backdrop-filter: blur(${config.blur}px) saturate(1.5);
        backdrop-filter: blur(${config.blur}px) saturate(1.5);
        border-radius: ${radius}px;
        ${
          config.floating
            ? `border: 1px solid color-mix(in srgb, var(--divider-color, #888) 60%, transparent);
               box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06), 0 12px 32px rgba(0, 0, 0, 0.12);`
            : ""
        }
      }

      :host([narrow]) {
        border: 0;
        border-radius: 0;
        box-shadow: none;
      }

      @media ${phoneQuery} {
        :host([narrow]) {
          background: color-mix(
            in srgb,
            var(--sidebar-background-color, var(--card-background-color, #fff))
              ${Math.min(opacity + 12, 100)}%,
            transparent
          );
          border-radius: ${radius}px;
          ${
            config.floating
              ? `border: 1px solid color-mix(in srgb, var(--divider-color, #888) 60%, transparent);
                 box-shadow: 0 24px 60px rgba(0, 0, 0, 0.28);`
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
      }

      .menu {
        border-bottom-color: transparent;
        background-color: transparent;
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
        padding: 14px 16px 6px;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: var(--secondary-text-color);
      }

      :host(:not([expanded])) .${sectionClass} {
        height: 1px;
        padding: 0;
        margin: 8px 16px;
        font-size: 0;
        background: var(--divider-color);
      }

      @media (prefers-reduced-motion: reduce) {
        ha-list-item-button:hover ha-svg-icon[slot="start"],
        ha-list-item-button:hover ha-icon[slot="start"] {
          transform: none;
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

  // Categories only change the visual order (CSS `order`). The items stay
  // where Lit rendered them, so HA can keep updating the list.
  function applyCategories(sidebar) {
    const holder = sidebar.shadowRoot.querySelector(
      'ha-list-nav.before-spacer slot[name="main-navigation"]'
    );
    if (!holder) return;

    const categories = enabled() ? config.categories : [];
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
      if (order >= 1000) used.add(Math.floor(order / 1000) - 1);

      natural += 1;
      previous = order;
      setOrder(el, categories.length ? order : null);
    }

    const existing = new Map(
      [...holder.querySelectorAll(`:scope > .${sectionClass}`)].map((el) => [
        el.dataset.key,
        el,
      ])
    );
    categories.forEach((category, index) => {
      const key = `${index}:${category.name}`;
      let header = existing.get(key);
      existing.delete(key);

      if (!used.has(index)) {
        header?.remove();
        return;
      }
      if (!header) {
        header = document.createElement("div");
        header.className = sectionClass;
        header.dataset.key = key;
        header.setAttribute("role", "heading");
        header.setAttribute("aria-level", "2");
        header.textContent = category.name;
        holder.append(header);
      }
      setOrder(header, (index + 1) * 1000);
    });
    existing.forEach((el) => el.remove());
  }

  function watch(root) {
    if (watched.has(root)) return;
    watched.add(root);
    new MutationObserver(schedule).observe(root, { childList: true, subtree: true });
  }

  function render() {
    frame = 0;
    const { ha, main, drawer, sidebar } = findParts();
    if (ha?.shadowRoot) watch(ha.shadowRoot);
    if (main?.shadowRoot) {
      watch(main.shadowRoot);
      applySheet(main.shadowRoot, mainCss());
    }
    if (drawer?.shadowRoot) applySheet(drawer.shadowRoot, drawerCss());
    if (sidebar?.shadowRoot) {
      watch(sidebar.shadowRoot);
      applySheet(sidebar.shadowRoot, sidebarCss());
      applyCategories(sidebar);
    }
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(render);
  }

  function readCachedConfig() {
    try {
      return JSON.parse(localStorage.getItem(cacheKey));
    } catch (err) {
      return null;
    }
  }

  function setConfig(value) {
    config = value;
    try {
      localStorage.setItem(cacheKey, JSON.stringify(value));
    } catch (err) {
      // Storage can be blocked; the live config still applies.
    }
    schedule();
  }

  function subscribe() {
    const connection = document.querySelector("home-assistant")?.hass?.connection;
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
