// Glass Sidebar settings page (Settings → Devices & services → Glass Sidebar → Configure).
(() => {
  if (customElements.get("glass-sidebar-panel")) return;

  const TEXT = {
    en: {
      subtitle: "Settings", live: "Changes apply right away", saving: "Saving…", saved: "Saved",
      error: "Couldn't save", loading: "Loading…", notLoaded: "Glass Sidebar isn't set up.",
      tabs: { style: "Style", shape: "Shape & glass", color: "Color", phone: "Phone", categories: "Categories" },
      styleTitle: "Choose a style", styleIntro: "Start from a style and fine-tune it under Shape & glass.",
      chosen: "Chosen", yourStyles: "Your styles", saveStyle: "Save current settings as a style",
      styleName: "Name of the style", save: "Save", remove: "Remove",
      presets: {
        frosted: ["Frosted", "Light glass, soft tint"], midnight: ["Midnight", "Dark glass for the evening"],
        vivid: ["Vivid", "Vivid highlight with glow"], aurora: ["Aurora", "Purple accent on dark glass"],
        minimal: ["Minimal", "Attached to the edge, no glass"], solid: ["Solid", "Floating, not see-through"],
      },
      floating: ["Floating", "A separate panel with space around it"],
      inset: "Distance to screen edge", radius: "Corner radius", blur: "Blur", opacity: "Opacity",
      tint: "Glass tint", tints: { theme: "Theme", light: "Light", dark: "Dark" },
      highlight: "Selected item", highlights: { soft: "Soft tint", vivid: "Vivid with glow" },
      hover: ["Hover animation", "Icons slide slightly when you point at them"],
      cards: ["Glass dashboard cards", "Cards get the same blur. Can be heavy on older tablets"],
      quick: ["Quick menu", "A button in the sidebar header for quick changes"],
      customAccent: ["Use my own accent color", "Off: the accent color of your theme"],
      accent: "Accent color", pickColor: "Pick a color",
      preview: "Live preview", light: "Light", dark: "Dark",
      phoneIntro: "For screens up to 600 px wide. Tablets and computers keep the normal sidebar.",
      width: "Drawer width", textSize: "Text size", rowsNote: (h) => `Rows become ${h} px tall, never lower than 44 px so they stay easy to tap.`,
      phoneBlur: ["Blur the page behind the menu", "The dashboard gets blurry while the menu is open"],
      rounded: ["Rounded corners", "Off: the drawer sits flush against the screen edge"],
      swipe: ["Open by swiping from the edge", "Swipe from the left edge to open the menu"],
      hideHeader: ["Hide the header", "More room for your panels"],
      catIntro: "Drag panels into a category. The order in a card is the order in your sidebar.",
      unassigned: "Not in a category · stays at the top", newCategory: "New category",
      dropNew: "Drop a panel here for a new category", startCollapsed: "Start collapsed",
      icon: "Choose icon", noIcon: "No icon", move: (name) => `Move ${name}`, removeFrom: (name) => `Remove ${name} from this category`,
      deleteCategory: "Delete category", nameTaken: "There is already a category with this name.", styleTaken: "There is already a style with this name.",
      nameEmpty: "Give the category a name.", moveHint: "Tip: arrow keys move a panel, left and right switch category.",
      panels: (n) => `${n} panel${n === 1 ? "" : "s"}`, category: "Category",
    },
    nl: {
      subtitle: "Instellingen", live: "Wordt direct toegepast", saving: "Opslaan…", saved: "Opgeslagen",
      error: "Opslaan mislukt", loading: "Laden…", notLoaded: "Glass Sidebar is niet ingesteld.",
      tabs: { style: "Stijl", shape: "Vorm en glas", color: "Kleur", phone: "Telefoon", categories: "Categorieën" },
      styleTitle: "Kies een stijl", styleIntro: "Begin met een stijl en pas daarna alles aan bij Vorm en glas.",
      chosen: "Gekozen", yourStyles: "Jouw stijlen", saveStyle: "Huidige instellingen als stijl bewaren",
      styleName: "Naam van de stijl", save: "Bewaren", remove: "Verwijderen",
      presets: {
        frosted: ["Frosted", "Licht glas, zachte tint"], midnight: ["Midnight", "Donker glas voor de avond"],
        vivid: ["Vivid", "Fel actief item met gloed"], aurora: ["Aurora", "Paars accent op donker glas"],
        minimal: ["Minimaal", "Vast aan de rand, geen glas"], solid: ["Effen", "Zwevend, maar niet doorschijnend"],
      },
      floating: ["Zwevend", "Losse balk met ruimte rondom"],
      inset: "Afstand tot rand", radius: "Hoekradius", blur: "Vervaging", opacity: "Dekking",
      tint: "Kleur van het glas", tints: { theme: "Thema", light: "Licht", dark: "Donker" },
      highlight: "Actief item", highlights: { soft: "Zachte tint", vivid: "Fel met gloed" },
      hover: ["Hover-animatie", "Iconen schuiven iets op als je erop wijst"],
      cards: ["Glazen dashboardkaarten", "Kaarten krijgen dezelfde vervaging. Kan zwaar zijn op oudere tablets"],
      quick: ["Snelmenu", "Een knopje in de kop van de zijbalk voor snelle aanpassingen"],
      customAccent: ["Eigen accentkleur gebruiken", "Uit: de accentkleur van je thema"],
      accent: "Accentkleur", pickColor: "Kies een kleur",
      preview: "Live voorbeeld", light: "Licht", dark: "Donker",
      phoneIntro: "Geldt voor schermen tot 600 px breed. Tablets en computers houden de gewone zijbalk.",
      width: "Breedte van de lade", textSize: "Tekstgrootte", rowsNote: (h) => `Rijen worden ${h} px hoog, nooit lager dan 44 px zodat je ze makkelijk raakt.`,
      phoneBlur: ["Pagina achter het menu vervagen", "Het dashboard wordt wazig terwijl het menu open is"],
      rounded: ["Ronde hoeken", "Uit: de lade sluit strak aan op de schermrand"],
      swipe: ["Openen door vanaf de rand te vegen", "Veeg van links naar rechts om het menu te openen"],
      hideHeader: ["Kop verbergen", "Meer ruimte voor je panelen"],
      catIntro: "Sleep panelen naar een categorie. De volgorde in een kaart is de volgorde in je zijbalk.",
      unassigned: "Niet ingedeeld · blijft bovenaan", newCategory: "Nieuwe categorie",
      dropNew: "Sleep een paneel hierheen voor een nieuwe categorie", startCollapsed: "Ingeklapt beginnen",
      icon: "Icoon kiezen", noIcon: "Geen icoon", move: (name) => `${name} verplaatsen`, removeFrom: (name) => `${name} uit deze categorie halen`,
      deleteCategory: "Categorie verwijderen", nameTaken: "Er is al een categorie met deze naam.", styleTaken: "Er is al een stijl met deze naam.",
      nameEmpty: "Geef de categorie een naam.", moveHint: "Tip: pijltjes omhoog en omlaag verplaatsen een paneel, links en rechts wisselen van categorie.",
      panels: (n) => `${n} ${n === 1 ? "paneel" : "panelen"}`, category: "Categorie",
    },
  };

  const SWATCHES = {
    frosted: "linear-gradient(135deg, #F4F7FB, #DCE6F2)", midnight: "linear-gradient(135deg, #2A2F3A, #0E1220)",
    vivid: "linear-gradient(135deg, #29B6F6, #026592)", aurora: "linear-gradient(135deg, #9B7BFF, #3B2A7A)",
    minimal: "linear-gradient(135deg, #FFFFFF, #EEF0F3)", solid: "linear-gradient(135deg, #FFFFFF, #CBD2DA)",
  };
  const ACCENTS = [[3, 169, 244], [0, 150, 136], [76, 175, 80], [255, 152, 0], [244, 67, 54], [233, 30, 99], [124, 92, 255], [96, 125, 139]];
  const ICONS = ["mdi:view-dashboard", "mdi:home", "mdi:sofa", "mdi:bed", "mdi:lightbulb", "mdi:flash", "mdi:chart-line",
    "mdi:history", "mdi:shield-home", "mdi:robot", "mdi:music", "mdi:calendar", "mdi:folder", "mdi:tools", "mdi:cog", "mdi:star"];
  const STYLE_KEYS = ["floating", "inset", "radius", "blur", "opacity", "tint", "highlight", "custom_accent", "accent_color"];
  const HIDDEN_PANELS = ["config", "profile", "notfound", "glass-sidebar"];

  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const rgb = (c) => `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
  const hex = (c) => `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
  const fromHex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const ICON = {
    app: "M5 4h5a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM14 4h5a1 1 0 0 1 1 1v5h-6zM14 13h6v6a1 1 0 0 1-1 1h-5z",
    check: "m5 12 5 5 9-10", plus: "M12 5v14M5 12h14", close: "M6 6l12 12M18 6 6 18",
    grip: "M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01",
    trash: "M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3", menu: "M4 6h16M4 12h16M4 18h16",
  };
  const svg = (d, size = 18, width = 2) =>
    `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;

  const STYLES = `
    :host { display: block; min-height: 100%; background: var(--primary-background-color); color: var(--primary-text-color);
      font-family: var(--ha-font-family-body, Roboto, sans-serif); -webkit-font-smoothing: antialiased; }
    * { box-sizing: border-box; }
    button, input { font: inherit; color: inherit; }
    :focus-visible { outline: 2px solid var(--primary-color); outline-offset: 2px; }
    .page { max-width: 1280px; margin: 0 auto; padding: 24px 32px 48px; display: flex; flex-direction: column; gap: 20px; }
    .narrow .page, .page.narrow { padding: 12px 12px 40px; }
    .top { display: flex; align-items: center; gap: 14px; }
    .app-icon { width: 48px; height: 48px; flex: none; border-radius: 14px; background: linear-gradient(180deg, #29B6F6, #0288D1); color: #fff; display: flex; align-items: center; justify-content: center; }
    .titles { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
    h1 { margin: 0; font-size: 26px; font-weight: 700; letter-spacing: -0.02em; }
    h2 { margin: 0; font-size: 18px; font-weight: 600; }
    .muted { color: var(--secondary-text-color); font-size: 14px; }
    .status { display: inline-flex; align-items: center; gap: 6px; height: 32px; padding: 0 12px; border-radius: 16px; font-size: 13px; font-weight: 600; white-space: nowrap;
      background: color-mix(in srgb, var(--success-color, #43a047) 16%, transparent); color: var(--success-color, #2e7d32); }
    .status.error { background: color-mix(in srgb, var(--error-color, #db4437) 14%, transparent); color: var(--error-color, #c62828); }
    .tabs { display: flex; gap: 4px; padding: 4px; border-radius: 16px; background: color-mix(in srgb, var(--primary-text-color) 6%, transparent); overflow-x: auto; align-self: flex-start; max-width: 100%; }
    .tab { flex: none; height: 40px; padding: 0 16px; border: 0; border-radius: 12px; background: transparent; cursor: pointer; font-size: 14px; font-weight: 500; color: var(--secondary-text-color); }
    .tab[aria-selected="true"] { background: var(--card-background-color); color: var(--primary-text-color); font-weight: 600; box-shadow: 0 1px 2px rgba(0,0,0,.12); }
    .split { display: grid; grid-template-columns: minmax(0, 1fr) 420px; gap: 20px; align-items: start; }
    .narrow .split { grid-template-columns: minmax(0, 1fr); }
    .card { background: var(--card-background-color); border: 1px solid color-mix(in srgb, var(--divider-color) 70%, transparent); border-radius: 20px; }
    .list { padding: 4px 20px; }
    .row { display: flex; align-items: center; gap: 16px; min-height: 68px; padding: 12px 0; }
    .row + .row { border-top: 1px solid color-mix(in srgb, var(--divider-color) 70%, transparent); }
    .row.col { flex-direction: column; align-items: stretch; gap: 10px; }
    .text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
    .name { font-size: 15px; font-weight: 600; }
    .hint { font-size: 13px; color: var(--secondary-text-color); }
    label.name { display: flex; justify-content: space-between; gap: 12px; }
    label.name span { font-weight: 500; color: var(--secondary-text-color); }
    input[type=range] { width: 100%; margin: 0; accent-color: var(--primary-color); }
    .switch { appearance: none; -webkit-appearance: none; flex: none; position: relative; width: 46px; height: 26px; margin: 0; border-radius: 13px; background: color-mix(in srgb, var(--secondary-text-color) 45%, transparent); cursor: pointer; transition: background 150ms; }
    .switch::before { content: ""; position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.3); transition: transform 150ms; }
    .switch:checked { background: var(--primary-color); }
    .switch:checked::before { transform: translateX(20px); }
    .seg { display: flex; gap: 4px; padding: 4px; border-radius: 12px; background: color-mix(in srgb, var(--primary-text-color) 6%, transparent); flex-wrap: wrap; }
    .seg button { height: 36px; padding: 0 14px; border: 0; border-radius: 9px; background: transparent; cursor: pointer; font-size: 13px; color: var(--secondary-text-color); }
    .seg button[aria-checked="true"] { background: var(--card-background-color); color: var(--primary-text-color); font-weight: 600; box-shadow: 0 1px 2px rgba(0,0,0,.12); }
    .preview-card { padding: 18px; display: flex; flex-direction: column; gap: 12px; position: sticky; top: 12px; }
    .preview-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
    .scene { position: relative; height: 380px; border-radius: 16px; padding: 14px; display: flex; gap: 12px; overflow: hidden;
      background: radial-gradient(260px 200px at 82% 18%, rgba(124,92,255,.3), transparent 70%), radial-gradient(300px 240px at 18% 92%, rgba(3,169,244,.32), transparent 70%), #DCE6F2; }
    .scene.dark { background: radial-gradient(260px 200px at 82% 18%, rgba(124,92,255,.35), transparent 70%), radial-gradient(300px 240px at 18% 92%, rgba(3,169,244,.25), transparent 70%), #0E1220; }
    .mini { flex: none; width: 168px; display: flex; flex-direction: column; gap: 3px; padding: 8px 6px; overflow: hidden; }
    .mini .item { height: 26px; flex: none; display: flex; align-items: center; padding: 0 10px; border-radius: 9px; font-size: 11px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .mini .head { padding: 8px 10px 2px; font-size: 9px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; opacity: .7; }
    .tiles { flex: 1; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); grid-auto-rows: 58px; gap: 10px; align-content: start; }
    .tile { border-radius: 14px; }
    .grid3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
    .narrow .grid3 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .preset { position: relative; display: flex; flex-direction: column; padding: 0; border: 0; border-radius: 18px; overflow: hidden; cursor: pointer; text-align: start;
      background: var(--card-background-color); box-shadow: 0 0 0 1px color-mix(in srgb, var(--divider-color) 80%, transparent); }
    .preset[aria-pressed="true"] { box-shadow: 0 0 0 3px var(--primary-color), 0 12px 28px rgba(0,0,0,.14); }
    .preset .scene { height: 150px; border-radius: 0; padding: 10px; }
    .preset .mini { width: 108px; }
    .preset .mini .item { height: 20px; font-size: 9px; padding: 0 7px; }
    .preset .tiles { grid-auto-rows: 38px; gap: 7px; }
    .preset-text { display: flex; align-items: center; gap: 8px; padding: 12px 14px; }
    .badge { display: inline-flex; align-items: center; gap: 4px; height: 26px; padding: 0 10px; border-radius: 13px; font-size: 12px; font-weight: 600;
      background: color-mix(in srgb, var(--primary-color) 16%, transparent); color: var(--primary-color); }
    .style-actions { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
    .text-input { height: 44px; min-width: 0; flex: 1 1 220px; padding: 0 14px; border-radius: 12px; border: 1px solid color-mix(in srgb, var(--divider-color) 90%, transparent); background: var(--card-background-color); font-size: 15px; }
    .btn { height: 44px; padding: 0 18px; border: 0; border-radius: 12px; cursor: pointer; font-size: 14px; font-weight: 600; display: inline-flex; align-items: center; gap: 8px; }
    .btn.primary { background: var(--primary-color); color: var(--text-primary-color, #fff); }
    .btn.ghost { background: color-mix(in srgb, var(--primary-text-color) 7%, transparent); }
    .icon-btn { width: 40px; height: 40px; flex: none; border: 0; border-radius: 10px; background: transparent; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; color: var(--secondary-text-color); }
    .icon-btn:hover { background: color-mix(in srgb, var(--primary-text-color) 7%, transparent); }
    .swatches { display: flex; gap: 10px; flex-wrap: wrap; }
    .swatch { width: 44px; height: 44px; border-radius: 12px; border: 0; cursor: pointer; box-shadow: 0 0 0 1px rgba(0,0,0,.12); }
    .swatch[aria-pressed="true"] { box-shadow: 0 0 0 3px var(--card-background-color), 0 0 0 5px var(--primary-text-color); }
    input[type=color] { width: 44px; height: 44px; padding: 0; border: 0; border-radius: 12px; background: none; cursor: pointer; }
    .phone { position: relative; width: 260px; height: 520px; margin: 0 auto; border-radius: 34px; overflow: hidden; box-shadow: 0 0 0 8px #1C1F24, 0 20px 40px rgba(0,0,0,.3); }
    .phone .page-bg { position: absolute; inset: 0; height: auto; padding: 40px 12px 12px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); grid-auto-rows: 60px; gap: 8px; }
    .phone .scrim { position: absolute; inset: 0; background: rgba(15,17,21,.22); }
    .phone .drawer { position: absolute; top: 28px; bottom: 6px; left: 6px; display: flex; flex-direction: column; gap: 2px; padding: 6px 5px; overflow: hidden; }
    .board { display: grid; grid-template-columns: 260px minmax(0, 1fr) 240px; gap: 16px; align-items: start; }
    .narrow .board { grid-template-columns: minmax(0, 1fr); }
    .cats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; align-content: start; }
    .narrow .cats { grid-template-columns: minmax(0, 1fr); }
    .zone { display: flex; flex-direction: column; gap: 6px; padding: 14px; border-radius: 18px; min-height: 120px; }
    .zone.loose { background: color-mix(in srgb, var(--card-background-color) 55%, transparent); border: 1px dashed color-mix(in srgb, var(--secondary-text-color) 55%, transparent); }
    .zone.cat { background: var(--card-background-color); box-shadow: 0 0 0 1px color-mix(in srgb, var(--divider-color) 80%, transparent); }
    .zone.new { align-items: center; justify-content: center; gap: 8px; border: 2px dashed color-mix(in srgb, var(--secondary-text-color) 45%, transparent); color: var(--secondary-text-color); font-size: 14px; font-weight: 500; text-align: center; }
    .zone.over { box-shadow: 0 0 0 2px var(--primary-color); }
    .zone-label { font-size: 13px; font-weight: 600; color: var(--secondary-text-color); padding: 0 4px 4px; }
    .cat-head { display: flex; align-items: center; gap: 8px; padding-bottom: 6px; }
    .cat-icon { width: 40px; height: 40px; flex: none; border: 0; border-radius: 10px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;
      background: color-mix(in srgb, var(--primary-color) 14%, transparent); color: var(--primary-color); --mdc-icon-size: 20px; }
    .cat-name { flex: 1; min-width: 0; height: 40px; padding: 0 10px; border: 1px solid transparent; border-radius: 10px; background: transparent; font-size: 16px; font-weight: 600; }
    .cat-name:hover, .cat-name:focus { border-color: color-mix(in srgb, var(--divider-color) 90%, transparent); background: var(--card-background-color); }
    .cat-count { font-size: 12px; color: var(--secondary-text-color); white-space: nowrap; }
    .cat-foot { display: flex; align-items: center; gap: 8px; padding-top: 8px; margin-top: 2px; border-top: 1px solid color-mix(in srgb, var(--divider-color) 70%, transparent); font-size: 13px; color: var(--secondary-text-color); }
    .cat-foot input { width: 16px; height: 16px; margin: 0; accent-color: var(--primary-color); }
    .field-error { font-size: 12px; color: var(--error-color, #c62828); padding: 0 4px; }
    .icons { display: grid; grid-template-columns: repeat(8, 40px); gap: 6px; padding: 8px; border-radius: 12px; background: color-mix(in srgb, var(--primary-text-color) 5%, transparent); }
    .icons button { width: 40px; height: 40px; border: 0; border-radius: 10px; background: var(--card-background-color); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; }
    .icons button[aria-pressed="true"] { box-shadow: 0 0 0 2px var(--primary-color); }
    .panel-row { display: flex; align-items: center; gap: 10px; min-height: 44px; padding: 0 6px 0 4px; border-radius: 12px; font-size: 14px; font-weight: 500;
      background: color-mix(in srgb, var(--primary-text-color) 4%, transparent); }
    .panel-row ha-icon { --mdc-icon-size: 18px; color: var(--secondary-text-color); flex: none; }
    .panel-row .title { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .grip { width: 32px; height: 36px; flex: none; border: 0; border-radius: 8px; background: transparent; cursor: grab; touch-action: none; color: var(--secondary-text-color); display: inline-flex; align-items: center; justify-content: center; }
    .grip:active { cursor: grabbing; }
    .panel-row.dragging { opacity: .35; }
    .drop-line { height: 3px; margin: 1px 6px; border-radius: 2px; background: var(--primary-color); box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color) 20%, transparent); }
    .ghost { position: fixed; z-index: 1000; pointer-events: none; width: 260px; transform: rotate(-2deg); background: var(--card-background-color); box-shadow: 0 18px 40px rgba(0,0,0,.28), 0 0 0 2px var(--primary-color); }
    .side-preview { padding: 12px 8px; border-radius: 20px; display: flex; flex-direction: column; gap: 2px; background: color-mix(in srgb, var(--card-background-color) 80%, transparent);
      border: 1px solid color-mix(in srgb, var(--divider-color) 70%, transparent); position: sticky; top: 12px; }
    .side-preview .item { height: 30px; display: flex; align-items: center; padding: 0 10px; border-radius: 9px; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .side-preview .head { display: flex; justify-content: space-between; padding: 10px 10px 2px; font-size: 9px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--secondary-text-color); }
    .tip { font-size: 13px; color: var(--secondary-text-color); }
    .loading { padding: 48px; text-align: center; color: var(--secondary-text-color); }
    .menu-fallback { width: 44px; height: 44px; border: 0; border-radius: 12px; background: transparent; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
    @media (prefers-reduced-motion: reduce) { .switch, .switch::before { transition: none; } }
  `;

  class GlassSidebarPanel extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this._tab = "style";
      this._previewTheme = "light";
      this._settings = null;
      this._pending = {};
      this._status = "live";
      this._saveTimer = 0;
      this._iconFor = -1;
      this._nameErrors = {};
      this._drag = null;
      this.shadowRoot.addEventListener("click", (ev) => this._onClick(ev));
      this.shadowRoot.addEventListener("input", (ev) => this._onInput(ev));
      this.shadowRoot.addEventListener("change", (ev) => this._onChange(ev));
      this.shadowRoot.addEventListener("keydown", (ev) => this._onKey(ev));
      this.shadowRoot.addEventListener("pointerdown", (ev) => this._onPointerDown(ev));
    }

    set hass(hass) {
      const first = !this._hass;
      const panelsChanged = this._hass && hass.panels !== this._hass.panels;
      this._hass = hass;
      if (first) this._load();
      else if (panelsChanged && this._tab === "categories" && !this._drag) this._render();
      this._syncMenuButton();
    }

    set narrow(narrow) {
      if (narrow === this._narrow) return;
      this._narrow = narrow;
      this._render();
    }

    set panel(_panel) {}
    set route(_route) {}

    get _t() {
      return TEXT[(this._hass?.language || "en").startsWith("nl") ? "nl" : "en"];
    }

    get _o() {
      return { ...this._settings.options, ...this._pending };
    }

    async _load() {
      try {
        this._settings = await this._hass.callWS({ type: "glass_sidebar/settings" });
        this._error = null;
      } catch (err) {
        this._error = err?.code === "not_loaded" ? this._t.notLoaded : err?.message || String(err);
      }
      this._render();
    }

    // ---- Saving ----

    _change(changes, delay = 0) {
      Object.assign(this._pending, changes);
      this._setStatus("saving");
      clearTimeout(this._saveTimer);
      this._saveTimer = setTimeout(() => this._save(), delay);
      this._updatePreview();
    }

    async _save() {
      const changes = this._pending;
      if (!Object.keys(changes).length) return;
      this._pending = {};
      try {
        this._settings = await this._hass.callWS({ type: "glass_sidebar/settings/update", changes });
        this._setStatus(Object.keys(this._pending).length ? "saving" : "saved");
      } catch (err) {
        console.warn("Glass Sidebar: could not save", err);
        this._setStatus("error");
        this._render();
      }
    }

    _setStatus(status) {
      this._status = status;
      const el = this.shadowRoot.querySelector("[data-status]");
      if (!el) return;
      const t = this._t;
      el.classList.toggle("error", status === "error");
      el.innerHTML = status === "error" ? esc(t.error)
        : status === "saving" ? esc(t.saving)
        : `${svg(ICON.check, 15, 2.4)} ${esc(status === "saved" ? t.saved : t.live)}`;
    }

    // ---- Rendering ----

    _render() {
      if (!this._hass) return;
      const t = this._t;
      const root = this.shadowRoot;
      const focus = this._focusKey(root.activeElement);
      if (!this._settings) {
        root.innerHTML = `<style>${STYLES}</style><div class="page${this._narrow ? " narrow" : ""}"><header class="top" data-top></header><div class="loading">${esc(this._error || t.loading)}</div></div>`;
        this._syncMenuButton();
        return;
      }
      const o = this._o;
      const tabs = Object.entries(t.tabs).map(([id, label]) =>
        `<button type="button" class="tab" role="tab" id="tab-${id}" aria-selected="${id === this._tab}" aria-controls="tabpanel" data-action="tab" data-id="${id}" data-f="tab-${id}">${esc(label)}</button>`).join("");
      root.innerHTML = `<style>${STYLES}</style>
        <div class="page${this._narrow ? " narrow" : ""}">
          <header class="top" data-top>
            <div class="app-icon">${svg(ICON.app, 26, 1.8)}</div>
            <div class="titles"><h1>Glass Sidebar</h1><span class="muted">${esc(t.subtitle)} · ${esc(this._settings.version)}</span></div>
            <span class="status" data-status role="status"></span>
          </header>
          <div class="tabs" role="tablist" aria-label="Glass Sidebar">${tabs}</div>
          <div id="tabpanel" role="tabpanel" aria-labelledby="tab-${this._tab}">${this[`_${this._tab}Tab`](o)}</div>
        </div>`;
      this._setStatus(this._status);
      this._syncMenuButton();
      this._updatePreview();
      if (focus) root.querySelector(`[data-f="${CSS.escape(focus)}"]`)?.focus();
    }

    _focusKey(el) {
      return el?.dataset?.f || null;
    }

    // HA panels show their own menu button on narrow screens.
    _syncMenuButton() {
      const top = this.shadowRoot.querySelector("[data-top]");
      if (!top) return;
      let button = top.querySelector(".menu-button");
      if (!this._narrow) {
        button?.remove();
        return;
      }
      if (!button) {
        if (customElements.get("ha-menu-button")) {
          button = document.createElement("ha-menu-button");
        } else {
          button = document.createElement("button");
          button.type = "button";
          button.className = "menu-fallback";
          button.innerHTML = svg(ICON.menu, 22);
          button.addEventListener("click", () => this.dispatchEvent(new CustomEvent("hass-toggle-menu", { bubbles: true, composed: true })));
        }
        button.classList.add("menu-button");
        top.prepend(button);
      }
      button.hass = this._hass;
      button.narrow = true;
    }

    _toggleRow(key, [name, hint], o) {
      return `<label class="row"><span class="text"><span class="name">${esc(name)}</span>${hint ? `<span class="hint">${esc(hint)}</span>` : ""}</span>
        <input type="checkbox" class="switch" role="switch" data-key="${key}" data-f="${key}" ${o[key] ? "checked" : ""}></label>`;
    }

    _sliderRow(key, label, min, max, unit, o, note = "") {
      return `<div class="row col"><label class="name" for="s-${key}">${esc(label)}<span data-value="${key}">${o[key]} ${unit}</span></label>
        <input id="s-${key}" type="range" min="${min}" max="${max}" step="1" value="${o[key]}" data-key="${key}" data-number data-unit="${unit}" data-f="${key}">${note}</div>`;
    }

    _segRow(key, label, options, o) {
      const buttons = Object.entries(options).map(([value, text]) =>
        `<button type="button" role="radio" aria-checked="${o[key] === value}" data-action="set" data-key="${key}" data-value="${value}" data-f="${key}-${value}">${esc(text)}</button>`).join("");
      return `<div class="row" style="flex-wrap: wrap"><span class="text"><span class="name">${esc(label)}</span></span><div class="seg" role="radiogroup" aria-label="${esc(label)}">${buttons}</div></div>`;
    }

    _previewCard(kind) {
      const t = this._t;
      const toggles = kind === "phone" ? "" : `<div class="seg" role="radiogroup" aria-label="${esc(t.preview)}">
        ${["light", "dark"].map((m) => `<button type="button" role="radio" aria-checked="${this._previewTheme === m}" data-action="preview-theme" data-value="${m}" data-f="pv-${m}">${esc(t[m])}</button>`).join("")}</div>`;
      return `<section class="card preview-card" aria-label="${esc(t.preview)}"><div class="preview-head"><h2>${esc(t.preview)}</h2>${toggles}</div><div data-preview="${kind}"></div></section>`;
    }

    _styleTab(o) {
      const t = this._t;
      const presets = Object.entries(this._settings.presets).map(([id, values]) => {
        const [name, text] = t.presets[id] || [id, ""];
        const chosen = this._isStyle(o, values);
        return `<button type="button" class="preset" aria-pressed="${chosen}" data-action="apply-style" data-preset="${id}" data-f="preset-${id}">
          ${this._sceneHTML({ ...o, ...values }, { theme: values.tint === "dark" ? "dark" : "light", small: true })}
          <span class="preset-text"><span class="text"><span class="name">${esc(name)}</span><span class="hint">${esc(text)}</span></span>
          ${chosen ? `<span class="badge">${svg(ICON.check, 14, 2.6)}${esc(t.chosen)}</span>` : ""}</span></button>`;
      }).join("");
      const custom = (o.custom_styles || []).map((style, index) => {
        const chosen = this._isStyle(o, style.values);
        return `<div style="position: relative">
          <button type="button" class="preset" style="width: 100%" aria-pressed="${chosen}" data-action="apply-style" data-index="${index}" data-f="custom-${index}">
            ${this._sceneHTML({ ...o, ...style.values }, { theme: style.values.tint === "dark" ? "dark" : "light", small: true })}
            <span class="preset-text"><span class="text"><span class="name">${esc(style.name)}</span></span>${chosen ? `<span class="badge">${svg(ICON.check, 14, 2.6)}${esc(t.chosen)}</span>` : ""}</span>
          </button>
          <button type="button" class="icon-btn" style="position: absolute; top: 8px; right: 8px; background: var(--card-background-color)" aria-label="${esc(t.remove)}: ${esc(style.name)}" data-action="delete-style" data-index="${index}" data-f="del-style-${index}">${svg(ICON.trash, 18, 1.8)}</button>
        </div>`;
      }).join("");
      return `<div style="display: flex; flex-direction: column; gap: 18px">
        <div><h2>${esc(t.styleTitle)}</h2><p class="muted" style="margin: 4px 0 0">${esc(t.styleIntro)}</p></div>
        <div class="grid3">${presets}</div>
        ${custom ? `<h2>${esc(t.yourStyles)}</h2><div class="grid3">${custom}</div>` : ""}
        <div class="card" style="padding: 16px; display: flex; flex-direction: column; gap: 10px">
          <label class="name" for="style-name">${esc(t.saveStyle)}</label>
          <div class="style-actions"><input id="style-name" class="text-input" maxlength="40" placeholder="${esc(t.styleName)}" data-f="style-name">
          <button type="button" class="btn primary" data-action="save-style" data-f="save-style">${svg(ICON.plus, 18)}${esc(t.save)}</button></div>
          ${this._styleError ? `<span class="field-error">${esc(this._styleError)}</span>` : ""}
        </div></div>`;
    }

    _shapeTab(o) {
      const t = this._t;
      return `<div class="split"><section class="card list" aria-label="${esc(t.tabs.shape)}">
        ${this._toggleRow("floating", t.floating, o)}
        ${this._sliderRow("inset", t.inset, 0, 24, "px", o)}
        ${this._sliderRow("radius", t.radius, 0, 32, "px", o)}
        ${this._sliderRow("blur", t.blur, 0, 40, "px", o)}
        ${this._sliderRow("opacity", t.opacity, 40, 100, "%", o)}
        ${this._segRow("tint", t.tint, t.tints, o)}
        ${this._segRow("highlight", t.highlight, t.highlights, o)}
        ${this._toggleRow("hover_motion", t.hover, o)}
        ${this._toggleRow("glass_cards", t.cards, o)}
        ${this._toggleRow("quick_menu", t.quick, o)}
      </section>${this._previewCard("desktop")}</div>`;
    }

    _colorTab(o) {
      const t = this._t;
      const swatches = ACCENTS.map((c) =>
        `<button type="button" class="swatch" style="background: ${rgb(c)}" aria-label="${rgb(c)}" aria-pressed="${o.custom_accent && same(o.accent_color, c)}" data-action="accent" data-value="${c.join(",")}" data-f="acc-${c.join("-")}"></button>`).join("");
      return `<div class="split"><section class="card list" aria-label="${esc(t.tabs.color)}">
        ${this._toggleRow("custom_accent", t.customAccent, o)}
        <div class="row col"><span class="name">${esc(t.accent)}</span>
          <div class="swatches">${swatches}<input type="color" aria-label="${esc(t.pickColor)}" value="${hex(o.accent_color)}" data-key="accent_color" data-color data-f="color-input"></div></div>
      </section>${this._previewCard("desktop")}</div>`;
    }

    _phoneTab(o) {
      const t = this._t;
      const rowHeight = Math.max(44, Math.round(o.mobile_text_size * 3));
      return `<div class="split"><section class="card list" aria-label="${esc(t.tabs.phone)}">
        <p class="hint" style="margin: 14px 0 4px">${esc(t.phoneIntro)}</p>
        ${this._sliderRow("mobile_width", t.width, 240, 360, "px", o)}
        ${this._sliderRow("mobile_text_size", t.textSize, 12, 20, "px", o, `<span class="hint" data-rows>${esc(t.rowsNote(rowHeight))}</span>`)}
        ${this._toggleRow("mobile_blur", t.phoneBlur, o)}
        ${this._toggleRow("mobile_rounded", t.rounded, o)}
        ${this._toggleRow("mobile_swipe", t.swipe, o)}
        ${this._toggleRow("mobile_hide_header", t.hideHeader, o)}
      </section>${this._previewCard("phone")}</div>`;
    }

    // ---- Categories ----

    _panelList() {
      const panels = this._hass.panels || {};
      const localize = this._hass.localize || (() => "");
      return Object.values(panels)
        .filter((p) => !HIDDEN_PANELS.includes(p.url_path) && (p.title || p.url_path === "lovelace"))
        .map((p) => ({
          id: p.url_path,
          title: (p.title && localize(`panel.${p.title}`)) || p.title || localize("panel.states") || "Overview",
          icon: p.icon || "mdi:view-dashboard",
        }));
    }

    _categoriesTab(o) {
      const t = this._t;
      const panels = this._panelList();
      const byId = new Map(panels.map((p) => [p.id, p]));
      const placed = new Set(o.categories.flatMap((c) => c.panels));
      const loose = panels.filter((p) => !placed.has(p.id));
      const row = (id, zone, index) => {
        const p = byId.get(id) || { id, title: id, icon: "mdi:help-circle-outline" };
        return `<div class="panel-row" data-panel="${esc(id)}" data-zone="${zone}" data-index="${index}">
          <button type="button" class="grip" aria-label="${esc(t.move(p.title))}" aria-describedby="move-tip" data-grip data-f="grip-${esc(id)}">${svg(ICON.grip, 16, 2.6)}</button>
          <ha-icon icon="${esc(p.icon)}"></ha-icon><span class="title">${esc(p.title)}</span>
          ${zone >= 0 ? `<button type="button" class="icon-btn" aria-label="${esc(t.removeFrom(p.title))}" data-action="unassign" data-panel="${esc(id)}" data-f="un-${esc(id)}">${svg(ICON.close, 16)}</button>` : ""}
        </div>`;
      };
      const cards = o.categories.map((c, i) => {
        const iconPicker = this._iconFor === i ? `<div class="icons" role="group" aria-label="${esc(t.icon)}">
          <button type="button" aria-pressed="${!c.icon}" data-action="set-icon" data-cat="${i}" data-value="" data-f="ic-${i}-none">${esc(t.noIcon)}</button>
          ${ICONS.map((icon) => `<button type="button" aria-label="${icon}" aria-pressed="${c.icon === icon}" data-action="set-icon" data-cat="${i}" data-value="${icon}" data-f="ic-${i}-${icon}"><ha-icon icon="${icon}"></ha-icon></button>`).join("")}</div>` : "";
        return `<section class="zone cat" data-zone="${i}" aria-label="${esc(c.name)}">
          <div class="cat-head">
            <button type="button" class="cat-icon" aria-label="${esc(t.icon)}" aria-expanded="${this._iconFor === i}" data-action="icon-picker" data-cat="${i}" data-f="icon-${i}">${c.icon ? `<ha-icon icon="${esc(c.icon)}"></ha-icon>` : svg(ICON.app, 18, 1.8)}</button>
            <input class="cat-name" value="${esc(c.name)}" maxlength="40" aria-label="${esc(t.category)}" data-cat-name="${i}" data-f="name-${i}">
            <span class="cat-count">${esc(t.panels(c.panels.length))}</span>
            <button type="button" class="icon-btn" aria-label="${esc(t.deleteCategory)}: ${esc(c.name)}" data-action="delete-cat" data-cat="${i}" data-f="del-${i}">${svg(ICON.trash, 18, 1.8)}</button>
          </div>
          ${this._nameErrors[i] ? `<span class="field-error">${esc(this._nameErrors[i])}</span>` : ""}
          ${iconPicker}
          ${c.panels.map((id, j) => row(id, i, j)).join("")}
          <label class="cat-foot"><input type="checkbox" data-collapsed="${i}" ${c.collapsed ? "checked" : ""} data-f="col-${i}">${esc(t.startCollapsed)}</label>
        </section>`;
      }).join("");
      return `<div style="display: flex; flex-direction: column; gap: 16px">
        <div style="display: flex; align-items: flex-end; gap: 16px; flex-wrap: wrap">
          <div style="flex: 1; min-width: 240px"><h2>${esc(t.tabs.categories)}</h2><p class="muted" style="margin: 4px 0 0">${esc(t.catIntro)}</p></div>
          <button type="button" class="btn primary" data-action="new-cat" data-f="new-cat">${svg(ICON.plus, 18)}${esc(t.newCategory)}</button>
        </div>
        <div class="board">
          <section class="zone loose" data-zone="-1" aria-label="${esc(t.unassigned)}"><span class="zone-label">${esc(t.unassigned)}</span>${loose.map((p, j) => row(p.id, -1, j)).join("")}</section>
          <div class="cats">${cards}<div class="zone new" data-zone="new">${svg(ICON.plus, 18)}${esc(t.dropNew)}</div></div>
          <div data-preview="sidebar"></div>
        </div>
        <p class="tip" id="move-tip">${esc(t.moveHint)}</p>
      </div>`;
    }

    _setCategories(categories, rerender = true) {
      this._change({ categories });
      if (rerender) this._render();
    }

    _movePanel(id, toZone, toIndex) {
      const cats = this._o.categories.map((c) => ({ ...c, panels: c.panels.filter((p) => p !== id) }));
      if (toZone === "new") {
        cats.push({ name: this._freeName(cats), panels: [id] });
      } else if (toZone >= 0) {
        const target = cats[toZone].panels;
        target.splice(Math.min(Math.max(toIndex, 0), target.length), 0, id);
      }
      this._setCategories(cats);
    }

    _freeName(cats) {
      const base = this._t.newCategory;
      const names = new Set(cats.map((c) => c.name.toLowerCase()));
      if (!names.has(base.toLowerCase())) return base;
      let n = 2;
      while (names.has(`${base} ${n}`.toLowerCase())) n += 1;
      return `${base} ${n}`;
    }

    // ---- Previews ----

    _colors(o, theme) {
      const dark = o.tint === "dark" || (o.tint === "theme" && theme === "dark");
      const base = o.tint === "light" ? "#ffffff" : dark ? "#16181d" : "#ffffff";
      const accent = o.custom_accent ? rgb(o.accent_color) : "#03A9F4";
      return {
        dark,
        glass: `color-mix(in srgb, ${base} ${o.opacity}%, transparent)`,
        text: dark ? "#ECEEF2" : "#1C1F24",
        tile: dark ? "rgba(30,33,40,.6)" : "rgba(255,255,255,.7)",
        accent,
        selected: o.highlight === "vivid"
          ? `color: #fff; font-weight: 600; background: linear-gradient(135deg, color-mix(in srgb, ${accent} 78%, black), color-mix(in srgb, ${accent} 60%, black)); box-shadow: 0 4px 12px -3px color-mix(in srgb, ${accent} 70%, transparent)`
          : `color: color-mix(in srgb, ${accent} ${dark ? "55%, white" : "60%, black"}); font-weight: 600; background: color-mix(in srgb, ${accent} ${dark ? 24 : 15}%, transparent)`,
      };
    }

    _miniItems(o, colors, { headers = false, limit = 7 } = {}) {
      const panels = this._panelList();
      const byId = new Map(panels.map((p) => [p.id, p]));
      const placed = new Set((o.categories || []).flatMap((c) => c.panels));
      const rows = panels.filter((p) => !placed.has(p.id)).map((p) => ({ label: p.title }));
      if (headers) {
        for (const c of o.categories || []) {
          const items = c.panels.filter((id) => byId.has(id));
          if (!items.length) continue;
          rows.push({ head: c.name, collapsed: c.collapsed });
          if (!c.collapsed) rows.push(...items.map((id) => ({ label: byId.get(id).title })));
        }
      }
      return rows.slice(0, headers ? 40 : limit).map((r, i) => r.head
        ? `<div class="head"><span>${esc(r.head)}</span><span>${r.collapsed ? "›" : "⌄"}</span></div>`
        : `<div class="item" style="${i === 0 ? colors.selected : `color: ${colors.text}`}">${esc(r.label)}</div>`).join("");
    }

    _sceneHTML(o, { theme = this._previewTheme, small = false } = {}) {
      const c = this._colors(o, theme);
      const scale = small ? 0.6 : 0.8;
      const radius = o.floating ? Math.round(o.radius * scale) : 0;
      const bar = `background: ${c.glass}; border-radius: ${radius}px; ${o.blur ? `backdrop-filter: blur(${Math.round(o.blur * scale)}px) saturate(1.5); -webkit-backdrop-filter: blur(${Math.round(o.blur * scale)}px) saturate(1.5);` : ""}
        ${o.floating ? `border: 1px solid ${c.dark ? "rgba(255,255,255,.1)" : "rgba(255,255,255,.9)"}; box-shadow: 0 10px 24px rgba(0,0,0,.18);` : `margin: ${small ? "-10px" : "-14px"} 0 ${small ? "-10px" : "-14px"} ${small ? "-10px" : "-14px"};`}`;
      const tiles = Array.from({ length: small ? 4 : 6 }, () => `<span class="tile" style="background: ${c.tile}"></span>`).join("");
      return `<div class="scene${c.dark ? " dark" : ""}" style="${o.floating ? `padding: ${Math.round(o.inset * scale) + (small ? 6 : 8)}px` : ""}">
        <div class="mini" style="${bar}">${this._miniItems(o, c, { limit: small ? 5 : 8 })}</div>
        <div class="tiles">${tiles}</div></div>`;
    }

    _phoneHTML(o) {
      const c = this._colors(o, "light");
      const scale = 260 / 390;
      const width = Math.round(Math.min(390 * 0.9, o.mobile_width) * scale);
      const text = (o.mobile_text_size * scale).toFixed(1);
      const row = Math.round(Math.max(44, o.mobile_text_size * 3) * scale);
      const radius = o.floating && o.mobile_rounded ? Math.round(o.radius * scale) : 0;
      const inset = o.mobile_rounded ? 6 : 0;
      const items = this._panelList().slice(0, 9).map((p, i) =>
        `<span style="height: ${row}px; flex: none; display: flex; align-items: center; padding: 0 8px; border-radius: 8px; font-size: ${text}px; ${i === 0 ? c.selected : `color: ${c.text}`}">${esc(p.title)}</span>`).join("");
      return `<div class="phone">
        <div class="page-bg scene" style="${o.mobile_blur ? "filter: blur(4px);" : ""} position: absolute; border-radius: 0">
          ${Array.from({ length: 8 }, () => `<span class="tile" style="background: ${c.tile}"></span>`).join("")}</div>
        <div class="scrim"></div>
        <div class="drawer" style="width: ${width - inset}px; left: ${inset}px; top: ${inset ? 28 : 22}px; bottom: ${inset}px; background: ${c.glass}; border-radius: ${radius}px;
          ${o.blur ? `backdrop-filter: blur(${Math.round(o.blur * scale)}px);` : ""} box-shadow: 0 16px 40px rgba(0,0,0,.28)">
          ${o.mobile_hide_header ? "" : `<span style="height: 30px; display: flex; align-items: center; padding: 0 8px; font-size: 12px; font-weight: 600; color: ${c.text}">Home Assistant</span>`}
          ${items}
        </div></div>`;
    }

    _sidebarPreviewHTML(o) {
      const c = this._colors(o, "light");
      // Dark glass needs a dark card, or its light text disappears.
      const card = c.dark ? "background: #1b1e24; border-color: rgba(255,255,255,.08); --secondary-text-color: #A4ACB9;" : "";
      return `<aside class="side-preview" style="${card}" aria-label="${esc(this._t.preview)}">
        <span class="hint" style="padding: 2px 10px 8px; font-weight: 600">${esc(this._t.preview)}</span>
        ${this._miniItems(o, c, { headers: true })}</aside>`;
    }

    _updatePreview() {
      const host = this.shadowRoot.querySelector("[data-preview]");
      if (!host || !this._settings) return;
      const o = this._o;
      const kind = host.dataset.preview;
      host.innerHTML = kind === "phone" ? this._phoneHTML(o) : kind === "sidebar" ? this._sidebarPreviewHTML(o) : this._sceneHTML(o);
    }

    _isStyle(o, values) {
      return STYLE_KEYS.every((key) => !(key in values) || same(o[key], values[key]));
    }

    // ---- Events ----

    _onClick(ev) {
      const el = ev.target.closest("[data-action]");
      if (!el) return;
      const o = this._o;
      const t = this._t;
      switch (el.dataset.action) {
        case "tab":
          this._tab = el.dataset.id;
          this._iconFor = -1;
          this._render();
          break;
        case "set":
          this._change({ [el.dataset.key]: el.dataset.value });
          this._render();
          break;
        case "preview-theme":
          this._previewTheme = el.dataset.value;
          this._render();
          break;
        case "apply-style": {
          const values = el.dataset.preset ? this._settings.presets[el.dataset.preset] : o.custom_styles[Number(el.dataset.index)].values;
          this._change({ ...values });
          this._render();
          break;
        }
        case "save-style": {
          const input = this.shadowRoot.getElementById("style-name");
          const name = input.value.trim();
          const styles = o.custom_styles || [];
          if (!name) this._styleError = t.nameEmpty;
          else if (styles.some((s) => s.name.toLowerCase() === name.toLowerCase())) this._styleError = t.styleTaken;
          else {
            this._styleError = null;
            const values = Object.fromEntries(STYLE_KEYS.map((key) => [key, o[key]]));
            this._change({ custom_styles: [...styles, { name, values }] });
          }
          this._render();
          break;
        }
        case "delete-style":
          this._change({ custom_styles: o.custom_styles.filter((_, i) => i !== Number(el.dataset.index)) });
          this._render();
          break;
        case "accent":
          this._change({ custom_accent: true, accent_color: el.dataset.value.split(",").map(Number) });
          this._render();
          break;
        case "new-cat":
          this._setCategories([...o.categories, { name: this._freeName(o.categories), panels: [] }], false);
          this._render();
          this.shadowRoot.querySelector(`[data-cat-name="${o.categories.length}"]`)?.select();
          break;
        case "delete-cat":
          this._nameErrors = {};
          this._setCategories(o.categories.filter((_, i) => i !== Number(el.dataset.cat)));
          break;
        case "unassign":
          this._movePanel(el.dataset.panel, -1, 0);
          break;
        case "icon-picker":
          this._iconFor = this._iconFor === Number(el.dataset.cat) ? -1 : Number(el.dataset.cat);
          this._render();
          break;
        case "set-icon": {
          const i = Number(el.dataset.cat);
          this._iconFor = -1;
          this._setCategories(o.categories.map((c, j) => j === i ? { ...c, icon: el.dataset.value || null } : c));
          this.shadowRoot.querySelector(`[data-f="icon-${i}"]`)?.focus();
          break;
        }
      }
    }

    _onInput(ev) {
      const el = ev.target;
      if (el.dataset.number !== undefined) {
        const value = Number(el.value);
        const label = this.shadowRoot.querySelector(`[data-value="${el.dataset.key}"]`);
        if (label) label.textContent = `${value} ${el.dataset.unit}`;
        if (el.dataset.key === "mobile_text_size") {
          const note = this.shadowRoot.querySelector("[data-rows]");
          if (note) note.textContent = this._t.rowsNote(Math.max(44, Math.round(value * 3)));
        }
        this._change({ [el.dataset.key]: value }, 350);
      } else if (el.dataset.color !== undefined) {
        this._change({ custom_accent: true, accent_color: fromHex(el.value) }, 350);
      }
    }

    _onChange(ev) {
      const el = ev.target;
      if (el.classList.contains("switch")) {
        this._change({ [el.dataset.key]: el.checked });
        if (el.dataset.key === "custom_accent") this._render();
      } else if (el.dataset.number !== undefined) {
        clearTimeout(this._saveTimer);
        this._save();
      } else if (el.dataset.color !== undefined) {
        this._render();
      } else if (el.dataset.collapsed !== undefined) {
        const i = Number(el.dataset.collapsed);
        this._setCategories(this._o.categories.map((c, j) => j === i ? { ...c, collapsed: el.checked } : c), false);
        this._updatePreview();
      } else if (el.dataset.catName !== undefined) {
        this._rename(Number(el.dataset.catName), el.value);
      }
    }

    _rename(i, raw) {
      const t = this._t;
      const name = raw.trim();
      const cats = this._o.categories;
      if (!name) this._nameErrors = { [i]: t.nameEmpty };
      else if (cats.some((c, j) => j !== i && c.name.toLowerCase() === name.toLowerCase())) this._nameErrors = { [i]: t.nameTaken };
      else {
        this._nameErrors = {};
        if (name !== cats[i].name) this._setCategories(cats.map((c, j) => j === i ? { ...c, name } : c), false);
      }
      this._render();
    }

    _onKey(ev) {
      const el = ev.target;
      if (el.dataset.catName !== undefined && ev.key === "Enter") {
        ev.preventDefault();
        el.blur();
        return;
      }
      if (el.id === "style-name" && ev.key === "Enter") {
        ev.preventDefault();
        this.shadowRoot.querySelector('[data-action="save-style"]').click();
        return;
      }
      if (el.getAttribute("role") === "tab" && (ev.key === "ArrowRight" || ev.key === "ArrowLeft")) {
        const ids = Object.keys(this._t.tabs);
        const next = ids[(ids.indexOf(this._tab) + (ev.key === "ArrowRight" ? 1 : ids.length - 1)) % ids.length];
        this._tab = next;
        this._render();
        this.shadowRoot.getElementById(`tab-${next}`)?.focus();
        ev.preventDefault();
        return;
      }
      if (el.dataset.grip === undefined) return;
      const row = el.closest(".panel-row");
      const id = row.dataset.panel;
      const zone = Number(row.dataset.zone);
      const index = Number(row.dataset.index);
      const cats = this._o.categories;
      let target = null;
      if (ev.key === "ArrowUp" && zone >= 0 && index > 0) target = [zone, index - 1];
      else if (ev.key === "ArrowDown" && zone >= 0 && index < cats[zone].panels.length - 1) target = [zone, index + 1];
      else if (ev.key === "ArrowRight" && zone < cats.length - 1) target = [zone + 1, Infinity];
      else if (ev.key === "ArrowLeft" && zone >= 0) target = [zone - 1, Infinity];
      if (!target) return;
      ev.preventDefault();
      this._movePanel(id, target[0], target[1]);
      this.shadowRoot.querySelector(`[data-f="grip-${CSS.escape(id)}"]`)?.focus();
    }

    // ---- Drag and drop (mouse, pen and touch) ----

    _onPointerDown(ev) {
      const grip = ev.target.closest("[data-grip]");
      if (!grip || ev.button > 0) return;
      const row = grip.closest(".panel-row");
      ev.preventDefault();
      grip.setPointerCapture?.(ev.pointerId);
      this._drag = { id: row.dataset.panel, row, startX: ev.clientX, startY: ev.clientY, active: false, target: null, pointerId: ev.pointerId };
      const move = (e) => this._onPointerMove(e);
      const up = (e) => {
        grip.removeEventListener("pointermove", move);
        grip.removeEventListener("pointerup", up);
        grip.removeEventListener("pointercancel", up);
        this._onPointerUp(e);
      };
      grip.addEventListener("pointermove", move);
      grip.addEventListener("pointerup", up);
      grip.addEventListener("pointercancel", up);
    }

    _onPointerMove(ev) {
      const drag = this._drag;
      if (!drag) return;
      if (!drag.active) {
        if (Math.hypot(ev.clientX - drag.startX, ev.clientY - drag.startY) < 5) return;
        drag.active = true;
        drag.row.classList.add("dragging");
        drag.ghost = drag.row.cloneNode(true);
        drag.ghost.classList.remove("dragging");
        drag.ghost.classList.add("ghost");
        drag.ghost.setAttribute("aria-hidden", "true");
        this.shadowRoot.append(drag.ghost);
      }
      drag.ghost.style.left = `${ev.clientX - 24}px`;
      drag.ghost.style.top = `${ev.clientY - 22}px`;
      this._findDrop(ev.clientX, ev.clientY);
    }

    _findDrop(x, y) {
      const drag = this._drag;
      this.shadowRoot.querySelectorAll(".drop-line").forEach((el) => el.remove());
      this.shadowRoot.querySelectorAll(".zone.over").forEach((el) => el.classList.remove("over"));
      const hit = (this.shadowRoot.elementsFromPoint?.(x, y) || []).find((el) => el.classList?.contains("zone"));
      if (!hit) {
        drag.target = null;
        return;
      }
      const zone = hit.dataset.zone;
      if (zone === "new" || zone === "-1") {
        hit.classList.add("over");
        drag.target = [zone === "new" ? "new" : -1, 0];
        return;
      }
      const rows = [...hit.querySelectorAll(":scope > .panel-row")].filter((r) => r !== drag.row);
      let index = rows.length;
      for (let i = 0; i < rows.length; i += 1) {
        const rect = rows[i].getBoundingClientRect();
        if (y < rect.top + rect.height / 2) {
          index = i;
          break;
        }
      }
      const line = document.createElement("div");
      line.className = "drop-line";
      if (rows[index]) rows[index].before(line);
      else hit.querySelector(".cat-foot")?.before(line);
      drag.target = [Number(zone), index];
    }

    _onPointerUp() {
      const drag = this._drag;
      this._drag = null;
      if (!drag) return;
      drag.ghost?.remove();
      drag.row.classList.remove("dragging");
      this.shadowRoot.querySelectorAll(".drop-line").forEach((el) => el.remove());
      this.shadowRoot.querySelectorAll(".zone.over").forEach((el) => el.classList.remove("over"));
      if (drag.active && drag.target) this._movePanel(drag.id, drag.target[0], drag.target[1]);
    }
  }

  customElements.define("glass-sidebar-panel", GlassSidebarPanel);
})();
