/*
 * SHFD Room Card
 *
 * Card type: custom:raum-karte
 *
 * Dependencies:
 * - Mushroom
 * - UIX
 *
 * Visual editor: included in this file.
 */

const ROOM_LISTS = [
  "status_items",
  "wecker",
  "szenen",
  "lampen",
  "schalter",
  "rolllaeden",
  "thermostate",
  "mediaplayer",
];


// Shared numeric-color model: one base, inclusive lower bounds.
const ROOM_STATUS_COLOR_DEFAULTS = {
  temperature: [
    { above: null, color: "#90CAF9" },
    { above: 18, color: "#A5D6A7" },
    { above: 24, color: "#FFE082" },
    { above: 26, color: "#FFB74D" },
    { above: 28, color: "#EF9A9A" },
  ],
  humidity: [
    { above: null, color: "#90CAF9" },
    { above: 40, color: "#A5D6A7" },
    { above: 70, color: "#FFE082" },
    { above: 85, color: "#FFB74D" },
  ],
};
function roomColorNumber(value) {
  if (value == null || typeof value === "boolean" || String(value).trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}
function roomColorIssues(rows) {
  if (!Array.isArray(rows)) return ["Farbbereiche müssen eine Liste sein."];
  const seen = new Set(), errors = [];
  let bases = 0;
  for (const row of rows) {
    if (!row || typeof row !== "object" || Array.isArray(row)) {
      errors.push("Ungültiger Farbbereich."); continue;
    }
    if (row.above === null) { bases++; continue; }
    const n = roomColorNumber(row.above);
    if (n === null) errors.push("Jede Untergrenze muss eine gültige Zahl sein.");
    else if (seen.has(n)) errors.push(`Die Untergrenze ${n} ist mehrfach vorhanden.`);
    seen.add(n);
  }
  if (bases !== 1) errors.push("Genau ein Grundbereich ist erforderlich.");
  return [...new Set(errors)];
}
function roomStatusRanges(item) {
  if (item.ranges === undefined) return structuredClone(ROOM_STATUS_COLOR_DEFAULTS[item.kind] || []);
  return structuredClone(item.ranges);
}
function roomNewRanges(rows) {
  return Array.isArray(rows) && rows.every(r => r && Object.hasOwn(r, "above"));
}
function roomValidColor(value) {
  return typeof value === "string" && (!value.trim() || CSS.supports("color", value.trim()));
}

const ROOM_ITEM_STYLE = `
  ha-card {
    background: transparent;
    box-shadow: none;
    border: none;
    padding: 0 !important;
    margin: 0 !important;
    --card-primary-font-size: 14px;
    --card-secondary-font-size: 12px;
  }
`;

class RaumKarte extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: "open" });

    this._generation = 0;
    this._card = null;
    this._hass = null;
    this._customSections = [];
  }

  static getConfigElement() {
    return document.createElement("raum-karte-editor");
  }

  static getStubConfig() {
    return {
      type: "custom:raum-karte",
      raum: "Neuer Raum",
      anwesenheit: "",
      status_items: [],
      wecker: [],
      szenen: [],
      lampen: [],
      schalter: [],
      rolllaeden: [],
      thermostate: [],
      mediaplayer: [],
      custom_sections: [],
    };
  }

  setConfig(config) {
    const isObject = (value) =>
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value);

    if (!isObject(config)) {
      throw new Error("Die Kartenkonfiguration muss ein Objekt sein.");
    }

    if (typeof config.raum !== "string" || !config.raum.trim()) {
      throw new Error("Bitte einen Raumnamen unter 'raum' angeben.");
    }

    for (const key of ROOM_LISTS) {
      if (config[key] !== undefined && !Array.isArray(config[key])) {
        throw new Error(`'${key}' muss eine Liste sein.`);
      }

      for (const item of config[key] || []) {
        if (!isObject(item)) {
          throw new Error(
            "Einträge unter '" + key + "' müssen Objekte mit einer Entity sein."
          );
        }

        if (
          key === "status_items" &&
          item.states !== undefined &&
          !isObject(item.states)
        ) {
          throw new Error(
            "'states' eines Statuseintrags muss ein Objekt sein."
          );
        }

        if (
          key === "status_items" &&
          item.ranges !== undefined &&
          !Array.isArray(item.ranges)
        ) {
          throw new Error(
            "'ranges' eines Statuseintrags muss eine Liste sein."
          );
        }
      }
    }

    const customSections =
      config.custom_sections === undefined ? [] : config.custom_sections;

    if (!Array.isArray(customSections)) {
      throw new Error("'custom_sections' muss eine Liste sein.");
    }

    const customKeys = new Set();

    for (const [index, section] of customSections.entries()) {
      if (!isObject(section)) {
        throw new Error(
          "Jeder eigene Bereich unter 'custom_sections' muss ein Objekt sein."
        );
      }

      if (typeof section.key !== "string" || !section.key.trim()) {
        throw new Error(
          `Eigener Bereich ${index + 1}: Bitte einen 'key' angeben.`
        );
      }

      const key = section.key.trim();

      if (ROOM_LISTS.includes(key) || customKeys.has(key)) {
        throw new Error(
          `Eigener Bereich '${key}': Der Bereichsname ist bereits vorhanden.`
        );
      }

      if (typeof section.title !== "string" || !section.title.trim()) {
        throw new Error(
          `Eigener Bereich '${key}': Bitte einen 'title' angeben.`
        );
      }

      if (
        section.columns !== undefined &&
        (!Number.isInteger(section.columns) ||
          section.columns < 1 ||
          section.columns > 6)
      ) {
        throw new Error(
          `Eigener Bereich '${key}': 'columns' muss eine ganze Zahl zwischen 1 und 6 sein.`
        );
      }

      if (
        section.domain !== undefined &&
        section.domain !== null &&
        typeof section.domain !== "string"
      ) {
        throw new Error(
          `Eigener Bereich '${key}': 'domain' muss eine Zeichenkette sein.`
        );
      }

      if (
        section.visible !== undefined &&
        typeof section.visible !== "boolean"
      ) {
        throw new Error(
          `Eigener Bereich '${key}': 'visible' muss true oder false sein.`
        );
      }

      if (section.items !== undefined && !Array.isArray(section.items)) {
        throw new Error(
          `Eigener Bereich '${key}': 'items' muss eine Liste sein.`
        );
      }

      for (const item of section.items || []) {
        if (!isObject(item)) {
          throw new Error(
            `Eigener Bereich '${key}': Jeder Eintrag muss ein Objekt sein.`
          );
        }
      }

      customKeys.add(key);
    }

    this._validateTitleColor(config.title_color);

    const defaultColumns = {
      status_items: 3,
      wecker: 1,
      szenen: 3,
      lampen: 2,
      schalter: 3,
      rolllaeden: 1,
      thermostate: 2,
      mediaplayer: 1,
    };

    const layout = config.layout === undefined ? {} : config.layout;

    if (!isObject(layout)) {
      throw new Error("'layout' muss ein Objekt sein.");
    }

    const knownKeys = [...ROOM_LISTS, ...customKeys];
    const allowedLayoutKeys = new Set(["order", "sections"]);

    for (const key of Object.keys(layout)) {
      if (!allowedLayoutKeys.has(key)) {
        throw new Error("Unbekannte Layout-Option: '" + key + "'");
      }
    }

    const requestedOrder = layout.order === undefined ? [] : layout.order;

    if (!Array.isArray(requestedOrder)) {
      throw new Error("'layout.order' muss eine Liste sein.");
    }

    const seen = new Set();

    for (const key of requestedOrder) {
      if (typeof key !== "string" || !knownKeys.includes(key)) {
        throw new Error(
          "'layout.order' enthält einen unbekannten Bereich."
        );
      }

      if (seen.has(key)) {
        throw new Error(`'layout.order' enthält '${key}' mehrfach.`);
      }

      seen.add(key);
    }

    const order = [
      ...requestedOrder,
      ...knownKeys.filter((key) => !seen.has(key)),
    ];

    const configuredSections =
      layout.sections === undefined ? {} : layout.sections;

    if (!isObject(configuredSections)) {
      throw new Error("'layout.sections' muss ein Objekt sein.");
    }

    for (const key of Object.keys(configuredSections)) {
      if (!knownKeys.includes(key)) {
        throw new Error(
          "Unbekannter Bereich unter 'layout.sections': '" + key + "'"
        );
      }
    }

    const sections = {};

    for (const key of knownKeys) {
      const customSection = customSections.find(
        (section) => section.key.trim() === key
      );

      const settings =
        configuredSections[key] === undefined ? {} : configuredSections[key];

      if (!isObject(settings)) {
        throw new Error(`'layout.sections.${key}' muss ein Objekt sein.`);
      }

      for (const option of Object.keys(settings)) {
        if (!["columns", "visible"].includes(option)) {
          throw new Error(
            "Unbekannte Option unter 'layout.sections." + key + "'"
          );
        }
      }

      if (
        settings.columns !== undefined &&
        (!Number.isInteger(settings.columns) ||
          settings.columns < 1 ||
          settings.columns > 6)
      ) {
        throw new Error(
          `'layout.sections.${key}.columns' muss eine ganze Zahl zwischen 1 und 6 sein.`
        );
      }

      if (
        settings.visible !== undefined &&
        typeof settings.visible !== "boolean"
      ) {
        throw new Error(
          `'layout.sections.${key}.visible' muss true oder false sein.`
        );
      }

      sections[key] = {
        columns:
          settings.columns ??
          (customSection ? customSection.columns ?? 3 : defaultColumns[key]),
        visible:
          settings.visible ??
          (customSection ? customSection.visible ?? true : true),
      };
    }

    this._customSections = customSections.map((section) => ({
      ...section,
      key: section.key.trim(),
    }));

    this._config = {
      ...RaumKarte.getStubConfig(),
      ...config,
    };

    this._layout = {
      order,
      sections,
    };

    this._buildCard();
  }

  set hass(hass) {
    this._hass = hass;

    if (this._card) {
      this._card.hass = hass;
    }
  }

  get hass() {
    return this._hass;
  }

  getCardSize() {
    return this._card?.getCardSize?.() ?? 6;
  }

  _styled(card) {
    return {
      ...card,
      uix: {
        style: ROOM_ITEM_STYLE,
      },
    };
  }

  _named(item) {
    return Object.prototype.hasOwnProperty.call(item, "name")
      ? { name: item.name ?? "" }
      : {};
  }

  _section(items, columns = 3, gap = 10, divider = true) {
    if (!items.length) return null;

    return {
      type: "custom:mod-card",
      uix: {
        style: `
          ha-card {
            background: transparent;
            box-shadow: none;
            border: none;
            ${
              divider
                ? "border-bottom: 1px solid rgba(255,255,255,0.12);"
                : ""
            }
            border-radius: 0;
            padding-bottom: 8px;
            margin-bottom: 8px;
          }
        `,
      },
      card: {
        type: "grid",
        columns,
        square: false,
        cards: items,
        uix: {
          style: `
            :host {
              --grid-card-gap: ${gap}px;
            }
          `,
        },
      },
    };
  }

  _customItem(item) {
    const card = {
      type: "custom:mushroom-entity-card",
      entity: item.entity,
      layout: "horizontal",
      fill_container: true,
      primary_info: "name",
      secondary_info: "state",
      tap_action: { action: "more-info" },
    };

    if (item.name) card.name = item.name;
    if (item.icon) card.icon = item.icon;
    if (item.icon_color) card.icon_color = item.icon_color;

    return this._styled(card);
  }

  _validateTitleColor(value) {
    if (value === undefined) return;

    if (
      value === null ||
      typeof value !== "object" ||
      Array.isArray(value)
    ) {
      throw new Error("'title_color' muss ein Objekt sein.");
    }

    if (
      value.room_label !== undefined &&
      (typeof value.room_label !== "string" || !value.room_label.trim())
    ) {
      throw new Error(
        "'title_color.room_label' muss ein nicht leeres Label sein."
      );
    }

    const validColor = (color) => roomValidColor(color);

    if (value.default !== undefined && !validColor(value.default)) {
      throw new Error(
        "'title_color.default': Verwende eine Hex-Farbe, einen CSS-Farbnamen oder var(--primary-text-color)."
      );
    }

    if (value.rules !== undefined && !Array.isArray(value.rules)) {
      throw new Error("'title_color.rules' muss eine Liste sein.");
    }

    for (const [index, rule] of (value.rules || []).entries()) {
      if (!rule || typeof rule !== "object" || Array.isArray(rule)) {
        throw new Error(
          `Titelfarbregel ${index + 1} muss ein Objekt sein.`
        );
      }

      if (typeof rule.label !== "string" || !rule.label.trim()) {
        throw new Error(
          `Titelfarbregel ${index + 1}: Bitte ein Label angeben.`
        );
      }

      if (!validColor(rule.color)) {
        throw new Error(
          `Titelfarbregel ${index + 1}: Bitte eine gültige Farbe angeben.`
        );
      }
    }
  }

  _titleColorTemplate() {
    const c = this._config;

    const settings =
      c.title_color === undefined
        ? {
            room_label: c.raum,
            default: "#FFFFFF",
            rules: [
              {
                label: "Hauptbeleuchtung",
                color: "#FFD600",
              },
              {
                label: "Ambiente Beleuchtung",
                color: "#FF9800",
              },
            ],
          }
        : {
            room_label: c.title_color.room_label ?? c.raum,
            default: c.title_color.default ?? "var(--primary-text-color)",
            rules: c.title_color.rules ?? [],
          };

    const rules = settings.rules.map((rule) => ({
      label: rule.label,
      color: rule.color.trim(),
    }));

    const roomLabel = JSON.stringify(settings.room_label);
    const defaultColor = JSON.stringify(settings.default.trim());
    const ruleData = JSON.stringify(rules);

    return `
      {% set room_lights = label_entities(${roomLabel})
        | select('match', '^light\\\\.')
        | select('is_state', 'on')
        | list %}

      {% set rules = ${ruleData} %}

      {% set ns = namespace(
        color=${defaultColor},
        matched=false
      ) %}

      {% for rule in rules %}
        {% if not ns.matched %}
          {% set matching = room_lights
            | select('in', label_entities(rule.label))
            | list %}

          {% if matching | count > 0 %}
            {% set ns.color = rule.color %}
            {% set ns.matched = true %}
          {% endif %}
        {% endif %}
      {% endfor %}

      --card-primary-color: {{ ns.color }};
    `;
  }

  _header() {
    const c = this._config;
    const person = JSON.stringify(c.anwesenheit || "");

    return {
      type: "custom:mushroom-template-card",
      primary: c.raum,

      secondary: `
        {% set e = ${person} %}
        {% if not e %}
          {{ '' }}
        {% elif is_state(e, 'home') %}
          Zuhause
        {% elif states(e) in ['unknown', 'unavailable'] %}
          Unbekannt
        {% else %}
          Abwesend
        {% endif %}
      `,

      icon: `
        {% set e = ${person} %}
        {% if not e %}
          {{ '' }}
        {% elif states(e) in ['unknown', 'unavailable'] %}
          mdi:account-question
        {% elif is_state(e, 'home') %}
          mdi:account-check
        {% else %}
          mdi:account-off
        {% endif %}
      `,

      icon_color: `
        {% set e = ${person} %}
        {{ 'green' if e and is_state(e, 'home') else 'grey' }}
      `,

      layout: "horizontal",
      fill_container: true,
      tap_action: { action: "none" },
      hold_action: { action: "none" },

      uix: {
        style: {
          ".": `
            ha-card {
              background: transparent;
              box-shadow: none;
              border: none;
              padding: 4px 12px 8px;
              margin: 0;

              --card-primary-font-size: 22px;
              --card-primary-font-weight: 400;
              --card-secondary-font-size: 13px;

              ${this._titleColorTemplate()}
            }

            .primary {
              position: absolute;
              left: 50%;
              top: 50%;
              transform: translate(-50%, -50%);
              width: max-content;
              max-width: 80%;
              text-align: center;
            }
          `,

          "mushroom-state-item$": `
            .container {
              display: flex !important;
              flex-direction: row-reverse !important;
              align-items: center !important;
              justify-content: center !important;
              width: max-content !important;
              max-width: 100%;
              margin-inline: auto !important;
              gap: 12px !important;
            }

            .container > * {
              flex: 0 0 auto !important;
              width: auto !important;
              margin: 0 !important;
            }
          `,

          "mushroom-state-info$": `
            .container {
              align-items: center !important;
              text-align: center !important;
            }
          `,
        },
      },
    };
  }

  _status(item) {
    const kind = item.kind || "";
    const kindJson = JSON.stringify(kind);

    const fixedIcon = item.icon || "";
    const fixedColor = item.icon_color || "";

    const stateConfig = item.states || {};
    const ranges = roomStatusRanges(item);

    const stateConfigJson = JSON.stringify(stateConfig);
    const rangesJson = JSON.stringify(JSON.stringify(ranges));
    const newRanges = roomNewRanges(ranges);
    const validRanges = newRanges && roomColorIssues(ranges).length === 0;
    const fixedIconJson = JSON.stringify(fixedIcon);
    const fixedColorJson = JSON.stringify(fixedColor);

    const defaultNumericColor =
      kind === "temperature" ? "deep-orange" : "blue";
    const defaultNumericColorJson = JSON.stringify(defaultNumericColor);

    return this._styled({
      type: "custom:mushroom-template-card",
      entity: item.entity,
      primary: item.name ?? "",

      secondary: `
        {% set k = ${kindJson} %}
        {% set s = states(entity) %}
        {% set cfg = ${stateConfigJson} %}

        {% if s == 'unknown' %}
          Unbekannt
        {% elif s in ['unavailable', 'none', None] %}
          Nicht verfügbar
        {% elif cfg.get(s, {}).get('label') %}
          {{ cfg[s].label }}
        {% elif k in ['window', 'door'] %}
          {{ 'Offen' if s == 'on' else 'Geschlossen' }}
        {% elif k == 'smoke' %}
          {{ 'Alarm!' if s == 'on' else 'OK' }}
        {% elif k in ['temperature', 'humidity'] %}
          {{ s }} {{ state_attr(entity, 'unit_of_measurement') or '' }}
        {% else %}
          {{ state_translated(entity) }}
        {% endif %}
      `,

      icon: `
        {% set k = ${kindJson} %}
        {% set s = states(entity) %}
        {% set cfg = ${stateConfigJson} %}
        {% set fixed = ${fixedIconJson} %}

        {% if s in ['unknown', 'unavailable'] %}
          {{ fixed or {
            'window': 'mdi:window-closed-variant', 'door': 'mdi:door-closed',
            'motion': 'mdi:motion-sensor', 'smoke': 'mdi:smoke-detector',
            'lock': 'mdi:lock-question', 'temperature': 'mdi:thermometer',
            'humidity': 'mdi:water-percent', 'ventilation': 'mdi:weather-windy'
          }.get(k, 'mdi:information-outline') }}
        {% elif k == 'ventilation' %}
          {{ fixed or 'mdi:weather-windy' }}
        {% elif fixed %}
          {{ fixed }}
        {% elif cfg.get(s, {}).get('icon') %}
          {{ cfg[s].icon }}
        {% elif k == 'window' %}
          {{ 'mdi:window-open-variant' if s == 'on'
             else 'mdi:window-closed-variant' }}
        {% elif k == 'door' %}
          {{ 'mdi:door-open' if s == 'on' else 'mdi:door-closed' }}
        {% elif k == 'motion' %}
          {{ 'mdi:motion-sensor' if s == 'on'
             else 'mdi:motion-sensor-off' }}
        {% elif k == 'smoke' %}
          {{ 'mdi:smoke-detector-alert' if s == 'on'
             else 'mdi:smoke-detector' }}
        {% elif k == 'lock' %}
          {{ {
            'locked': 'mdi:lock',
            'unlocked': 'mdi:lock-open-variant',
            'locking': 'mdi:lock-clock',
            'unlocking': 'mdi:lock-clock',
            'jammed': 'mdi:lock-alert',
            'open': 'mdi:lock-open-variant',
            'opening': 'mdi:lock-clock'
          }.get(s, 'mdi:lock-question') }}
        {% elif k == 'ventilation' %}
          mdi:weather-windy
        {% elif k == 'temperature' %}
          mdi:thermometer
        {% elif k == 'humidity' %}
          mdi:water-percent
        {% else %}
          mdi:information-outline
        {% endif %}
      `,

      icon_color: `
        {% set k = ${kindJson} %}
        {% set s = states(entity) %}
        {% set cfg = ${stateConfigJson} %}
        {% set ranges = ${rangesJson} | from_json %}
        {% set fixed = ${fixedColorJson} %}

        {% if s in ['unknown', 'unavailable', 'none', None] %}
          grey
        {% elif k in ['temperature', 'humidity'] and not is_number(s) %}
          grey
        {% elif k in ['temperature', 'humidity'] and ${item.colors_enabled === false ? 'true' : 'false'} %}
          {{ '' }}
        {% elif fixed %}
          {{ fixed }}
        {% elif 'color' in cfg.get(s, {}) %}
          {{ cfg[s].color }}
        {% elif k in ['temperature', 'humidity'] %}
          {% if ${newRanges ? 'true' : 'false'} %}
            {% if ${validRanges ? 'true' : 'false'} %}
              {% set value = s | float %}
              {% set ns = namespace(color='', limit=none) %}
              {% for r in ranges %}
                {% if r.above is none %}
                  {% if ns.limit is none %}{% set ns.color = r.color | default('') %}{% endif %}
                {% elif value >= r.above and (ns.limit is none or r.above > ns.limit) %}
                  {% set ns.limit = r.above %}
                  {% set ns.color = r.color | default('') %}
                {% endif %}
              {% endfor %}
              {{ ns.color }}
            {% else %}{{ '' }}{% endif %}
          {% else %}
            {# Compatibility with existing below/from/to YAML rules. #}
            {% set value = s | float %}
            {% set ns = namespace(color=${defaultNumericColorJson}, matched=false) %}
            {% for r in ranges %}
              {% if not ns.matched %}
                {% set below_ok = r.below is defined and r.below is number and value < r.below %}
                {% set range_ok = r.from is defined and r.from is number and r.to is defined and r.to is number and value >= r.from and value < r.to %}
                {% set from_ok = r.from is defined and r.from is number and r.to is not defined and value >= r.from %}
                {% if below_ok or range_ok or from_ok %}
                  {% set ns.color = r.color | default('') %}
                  {% set ns.matched = true %}
                {% endif %}
              {% endif %}
            {% endfor %}
            {{ ns.color }}
          {% endif %}
        {% elif k in ['window', 'door', 'smoke', 'motion'] %}
          {{ 'red' if s == 'on' else 'green' }}
        {% elif k == 'lock' %}
          {{ {
            'locked': 'green',
            'unlocked': 'red',
            'locking': 'orange',
            'unlocking': 'orange',
            'jammed': 'red',
            'open': 'red',
            'opening': 'orange'
          }.get(s, 'grey') }}
        {% elif k == 'ventilation' %}
          {{ {
            'wait': 'yellow',
            'ventilate': 'blue',
            'ok': 'green',
            'do_not_ventilate': 'red',
            'close': 'orange'
          }.get(s, 'grey') }}
        {% else %}
          grey
        {% endif %}
      `,

      badge_icon: `
        {% if states(entity) in ['unknown', 'unavailable', 'none', None] %}
          mdi:exclamation-thick
        {% endif %}
      `,

      badge_color: "red",

      layout: "horizontal",
      fill_container: true,
      tap_action: { action: "more-info" },
    });
  }

  _light(item) {
    return this._styled({
      type: "custom:mushroom-light-card",
      entity: item.entity,
      ...this._named(item),
      use_light_color: true,
      show_brightness_control: true,
      collapsible_controls: true,
      tap_action: { action: "toggle" },
      hold_action: { action: "more-info" },
    });
  }

  _scene(item) {
    return this._styled({
      type: "custom:mushroom-entity-card",
      entity: item.entity,
      ...this._named(item),
      layout: "horizontal",
      fill_container: true,
      primary_info: "name",
      secondary_info: "none",
      icon: "mdi:palette",
      icon_color: item.icon_color || "purple",

      tap_action: {
        action: "perform-action",
        perform_action: "scene.turn_on",
        target: {
          entity_id: item.entity,
        },
      },

      hold_action: { action: "more-info" },
    });
  }

  _switch(item) {
    return this._styled({
      type: "custom:mushroom-entity-card",
      entity: item.entity,
      ...this._named(item),
      ...(item.icon ? { icon: item.icon } : {}),
      layout: "horizontal",
      fill_container: true,
      primary_info: "name",
      secondary_info: "state",
      icon_color: "amber",
      tap_action: { action: "more-info" },
    });
  }

  _cover(item) {
    const entity = JSON.stringify(item.entity);

    return {
      type: "custom:mushroom-cover-card",
      entity: item.entity,
      ...this._named(item),

      layout: "horizontal",
      fill_container: true,
      show_buttons_control: true,
      show_position_control: true,

      tap_action: { action: "more-info" },
      hold_action: { action: "more-info" },

      uix: {
        style: {
          ".": `
            {% set e = ${entity} %}
            {% set s = states(e) %}
            {% set p = state_attr(e, 'current_position') | float(-1) %}

            {% if s in ['unknown', 'unavailable'] %}
              {% set rgb = '158, 158, 158' %}
            {% elif p == 100 %}
              {% set rgb = '255, 235, 59' %}
            {% elif p == 0 or s == 'closed' %}
              {% set rgb = '158, 158, 158' %}
            {% elif p > 0 or s in ['open', 'opening', 'closing'] %}
              {% set rgb = '255, 152, 0' %}
            {% else %}
              {% set rgb = '158, 158, 158' %}
            {% endif %}

            ha-card {
              --raum-rollladen-rgb: {{ rgb }};
              background: transparent;
              box-shadow: none;
              border: none;
              padding: 0 !important;
              margin: 0 !important;
              --card-primary-font-size: 14px;
              --card-secondary-font-size: 12px;
            }

            ha-state-icon {
              color: rgb(var(--raum-rollladen-rgb)) !important;
            }
          `,

          "mushroom-shape-icon$": `
            .shape {
              --shape-color:
                rgba(var(--raum-rollladen-rgb), 0.2) !important;
            }
          `,
        },
      },
    };
  }

  _climate(item) {
    return this._styled({
      type: "custom:mushroom-climate-card",
      entity: item.entity,
      ...this._named(item),
      show_temperature_control: true,
      collapsible_controls: true,
      tap_action: { action: "more-info" },
    });
  }

  _media(item) {
    return this._styled({
      type: "custom:mushroom-media-player-card",
      entity: item.entity,
      ...this._named(item),
      use_media_info: true,
      show_volume_level: true,
      collapsible_controls: true,
    });
  }

  _alarm(item) {
    const cards = [
      this._styled({
        type: "custom:mushroom-template-card",
        entity: item.entity,
        primary: item.name ?? "",

        secondary: `
          {% set h = state_attr(entity, 'hour') %}
          {% set m = state_attr(entity, 'minute') %}

          {% if states(entity) in ['unknown', 'unavailable', 'none']
                or h is none or m is none %}
            Nicht verfügbar
          {% else %}
            {{ '%02d:%02d' | format(h | int, m | int) }}
          {% endif %}
        `,

        icon: "mdi:alarm",

        icon_color: `
          {{ 'grey'
             if states(entity) in ['unknown', 'unavailable', 'none']
             else 'blue' }}
        `,

        layout: "horizontal",
        fill_container: true,
        tap_action: { action: "more-info" },
      }),
    ];

    if (item.lichtwecker) {
      cards.push(
        this._styled({
          type: "custom:mushroom-template-card",
          entity: item.lichtwecker,
          primary: item.lichtwecker_name || "Lichtwecker",

          secondary: `
            {% set s = states(entity) %}
            {% if s == 'on' %}
              Aktiv
            {% elif s == 'off' %}
              Deaktiviert
            {% else %}
              Nicht verfügbar
            {% endif %}
          `,

          icon: "mdi:weather-sunset-up",

          icon_color: `
            {{ 'amber' if is_state(entity, 'on') else 'grey' }}
          `,

          layout: "horizontal",
          fill_container: true,

          tap_action: {
            action: "perform-action",
            perform_action: "automation.toggle",
            target: {
              entity_id: item.lichtwecker,
            },
          },

          hold_action: { action: "more-info" },
        })
      );
    }

    return {
      type: "horizontal-stack",
      cards,
    };
  }

  _sectionCards(key) {
    const c = this._config;

    const customSection = (this._customSections || []).find(
      (section) => section.key === key
    );

    if (customSection) {
      return (customSection.items || [])
        .filter(
          (item) =>
            typeof item.entity === "string" && item.entity.trim().length > 0
        )
        .map((item) => this._customItem(item));
    }

    const items = (c[key] || []).filter(
      (item) =>
        typeof item.entity === "string" && item.entity.trim().length > 0
    );

    switch (key) {
      case "status_items":
        return items.map((item) => this._status(item));

      case "wecker":
        return items.map((item) => this._alarm(item));

      case "szenen":
        return items.map((item) => this._scene(item));

      case "lampen":
        return items.map((item) => this._light(item));

      case "schalter":
        return items.map((item) => this._switch(item));

      case "rolllaeden":
        return items.map((item) => this._cover(item));

      case "thermostate":
        return items.map((item) => this._climate(item));

      case "mediaplayer":
        return items.map((item) => this._media(item));

      default:
        return [];
    }
  }

  _createCardConfig() {
    const layout = this._layout || {
      order: ROOM_LISTS,
      sections: {},
    };

    const visibleSections = layout.order
      .filter((key) => layout.sections[key]?.visible !== false)
      .map((key) => ({
        key,
        cards: this._sectionCards(key),
      }))
      .filter((section) => section.cards.length > 0);

    const cards = visibleSections.map((section, index) => {
      const settings = layout.sections[section.key] || {};
      const isLast = index === visibleSections.length - 1;
      const sectionGap = section.key === "status_items" ? 8 : 10;

      return this._section(
        section.cards,
        settings.columns,
        sectionGap,
        !isLast
      );
    });

    return {
      type: "custom:mod-card",

      uix: {
        style: `
          ha-card {
            background:
              var(--ha-card-background, var(--card-background-color));
            border-radius: 18px;
            border: 1px solid rgba(255, 255, 255, 0.20);
            box-shadow:
              0 8px 24px rgba(0, 0, 0, 0.28),
              0 2px 6px rgba(0, 0, 0, 0.16),
              inset 0 1px 0 rgba(255, 255, 255, 0.08);
            overflow: hidden;
            padding: 6px;
          }
        `,
      },

      card: {
        type: "vertical-stack",
        cards: [this._header(), ...cards],
      },
    };
  }

  async _buildCard() {
    const generation = ++this._generation;

    try {
      const cardConfig = this._createCardConfig();
      const helpers = await window.loadCardHelpers();

      if (generation !== this._generation) return;

      const card = helpers.createCardElement(cardConfig);

      if (this._hass) {
        card.hass = this._hass;
      }

      const style = document.createElement("style");
      style.textContent = `
        :host {
          display: block;
          min-width: 0;
        }
      `;

      this._card = card;
      this.shadowRoot.replaceChildren(style, card);
    } catch (error) {
      if (generation !== this._generation) return;

      this._card = null;

      const message = document.createElement("ha-card");
      message.style.padding = "16px";
      message.textContent =
        `Raumkarte konnte nicht geladen werden: ${error.message}`;

      this.shadowRoot.replaceChildren(message);
      console.error("Raumkarte:", error);
    }
  }
}

if (!customElements.get("raum-karte")) {
  customElements.define("raum-karte", RaumKarte);
}

window.customCards = window.customCards || [];

if (
  !window.customCards.some(
    (card) => card.type === "custom:raum-karte"
  )
) {
  window.customCards.push({
    type: "custom:raum-karte",
    name: "Raumkarte",
    description:
      "Dashboard-unabhängige Raumkarte mit Status, Licht, Szenen, " +
      "Heizung, Medien, Rollläden und Wecker.",
    preview: false,
  });
}

console.info("SHFD Room Card loaded");

/* Room Card editor */

const RAUM_EDITOR_SECTIONS = [
  {
    key: "status_items",
    title: "Status",
  },
  {
    key: "szenen",
    title: "Szenen",
    domain: "scene",
    fields: [
      ["entity", "Szene", { entity: { domain: "scene" } }],
      ["name", "Anzeigename", { text: {} }],
      ["icon_color", "Icon-Farbe, z. B. orange", { text: {} }],
    ],
  },
  {
    key: "lampen",
    title: "Lampen",
    domain: "light",
  },
  {
    key: "schalter",
    title: "Schalter",
    domain: "switch",
    extraFields: [
      ["icon", "Icon", { icon: {} }],
    ],
  },
  {
    key: "rolllaeden",
    title: "Rollläden",
    domain: "cover",
  },
  {
    key: "thermostate",
    title: "Thermostate",
    domain: "climate",
  },
  {
    key: "mediaplayer",
    title: "Mediaplayer",
    domain: "media_player",
  },
  {
    key: "wecker",
    title: "Wecker",
    domain: "input_datetime",
    extraFields: [
      [
        "lichtwecker",
        "Lichtwecker-Automation",
        { entity: { domain: "automation" } },
      ],
      ["lichtwecker_name", "Name des Lichtweckers", { text: {} }],
    ],
  },
];

const RAUM_LAYOUT_DEFAULTS = {
  status_items: 3,
  wecker: 1,
  szenen: 3,
  lampen: 2,
  schalter: 3,
  rolllaeden: 1,
  thermostate: 2,
  mediaplayer: 1,
};

const RAUM_CUSTOM_DOMAINS = [
  "light",
  "switch",
  "scene",
  "cover",
  "climate",
  "media_player",
  "sensor",
  "binary_sensor",
  "input_boolean",
  "input_datetime",
  "automation",
  "script",
  "button",
  "lock",
  "fan",
  "humidifier",
  "vacuum",
  "camera",
  "number",
  "select",
  "text",
  "weather",
];

const RAUM_STATUS_KINDS = [
  { value: "window", label: "Fenster" },
  { value: "door", label: "Tür" },
  { value: "motion", label: "Bewegung / Anwesenheit" },
  { value: "smoke", label: "Rauchmelder" },
  { value: "lock", label: "Schloss" },
  { value: "temperature", label: "Temperatur" },
  { value: "humidity", label: "Luftfeuchtigkeit" },
  { value: "ventilation", label: "Lüftungsempfehlung" },
];

const RAUM_STATUS_STATE_LABELS = {
  on: "An / Offen / Alarm",
  off: "Aus / Geschlossen / OK",
  locked: "Verriegelt",
  unlocked: "Entriegelt",
  locking: "Wird verriegelt",
  unlocking: "Wird entriegelt",
  jammed: "Klemmt",
  open: "Offen",
  opening: "Wird geöffnet",
  wait: "Warten",
  ventilate: "Lüften",
  ok: "OK",
  do_not_ventilate: "Nicht lüften",
  close: "Schließen",
};

class RaumKarteEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._forms = [];
    this._openSections = new Set();
    this._fieldId = 0;
  }

  setConfig(config) {
    const unchanged =
      JSON.stringify(this._config) === JSON.stringify(config);

    this._config = {
      ...config,
      type: "custom:raum-karte",
    };

    if (!unchanged || !this._rendered) {
      this._render();
    }
  }

  set hass(hass) {
    this._hass = hass;

    for (const form of this._forms) {
      form.hass = hass;
    }
  }

  _emitConfig() {
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: this._config },
        bubbles: true,
        composed: true,
      })
    );
  }

  _schema(fields) {
    return fields.map(([name, label, selector]) => ({
      name,
      label,
      selector,
    }));
  }

  _createForm(fields, data, onChange) {
    const colorFields = fields.filter(([name]) => name.includes("color"));
    if (colorFields.length) {
      const host = document.createElement("div");
      let values = { ...data };
      const otherFields = fields.filter(([name]) => !name.includes("color"));
      if (otherFields.length) host.append(this._createForm(otherFields, data, (next) => {
        values = { ...values, ...next };
        onChange(values);
      }));
      for (const [name, label] of colorFields) {
        host.append(this._colorField(label, data[name], (value) => {
          values = { ...values, [name]: value };
          onChange(values);
        }));
      }
      return host;
    }
    const form = document.createElement("ha-form");

    form.hass = this._hass;
    form.schema = this._schema(fields);

    form.data = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        value === null ? "" : value,
      ])
    );

    form.computeLabel = (schema) => schema.label || schema.name;

    form.addEventListener("value-changed", (event) => {
      event.stopPropagation();

      const values = event.detail.value;
      form.data = values;

      onChange(values);
    });

    this._forms.push(form);
    return form;
  }

  _colorField(title, value, onChange, options = {}) {
    const container = document.createElement("div");
    container.className = "room-color-field";
    const label = document.createElement("label");
    label.textContent = title;
    const row = document.createElement("div");
    row.className = "room-color-row";
    const picker = document.createElement("input");
    picker.type = "color";
    picker.setAttribute("aria-label", title + " auswählen");
    const text = document.createElement("input");
    text.type = "text";
    text.value = value ?? "";
    text.placeholder = options.placeholder || "Leer = neutral / automatisch";
    text.id = "room-color-" + (++this._fieldId);
    label.htmlFor = text.id;
    const sync = () => {
      let color = text.value.trim();
      const variable = color.match(/^var\((--[a-zA-Z0-9_-]+)\)$/);
      if (variable) color = getComputedStyle(this).getPropertyValue(variable[1]).trim();
      const context = document.createElement("canvas").getContext("2d");
      picker.value = "#808080";
      if (context && color && CSS.supports("color", color)) {
        context.fillStyle = color;
        if (/^#[0-9a-f]{6}$/i.test(context.fillStyle)) picker.value = context.fillStyle;
      }
    };
    const apply = () => {
      const color = text.value.trim();
      text.setCustomValidity(roomValidColor(color) ? "" : "Gültige CSS-Farbe eingeben.");
      if (!text.checkValidity()) { text.reportValidity(); return; }
      sync(); onChange(color);
    };
    picker.addEventListener("change", () => {
      text.value = picker.value; text.setCustomValidity(""); apply();
    });
    text.addEventListener("input", () => text.setCustomValidity(""));
    text.addEventListener("change", apply);
    row.append(picker, text);
    container.append(label);
    if (options.theme) {
      const themeLabel = document.createElement("label");
      themeLabel.className = "room-color-theme";
      const check = document.createElement("input");
      check.type = "checkbox";
      check.checked = text.value.trim() === "var(--primary-text-color)";
      let saved = check.checked ? "#FFFFFF" : text.value;
      const visibility = () => { row.hidden = check.checked; text.disabled = check.checked; picker.disabled = check.checked; };
      check.addEventListener("change", () => {
        if (check.checked) { saved = text.value; text.value = "var(--primary-text-color)"; }
        else text.value = saved || "#FFFFFF";
        visibility(); apply();
      });
      themeLabel.append(check, document.createTextNode("Textfarbe des Themes verwenden"));
      container.append(themeLabel); visibility();
    }
    container.append(row);
    sync();
    container.colorInput = text;
    return container;
  }

  _fieldsFor(section) {
    if (section.fields) {
      return section.fields;
    }

    return [
      [
        "entity",
        "Entity",
        { entity: { domain: section.domain } },
      ],
      ["name", "Anzeigename", { text: {} }],
      ...(section.extraFields || []),
    ];
  }

  _button(label, onClick, disabled = false) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.disabled = disabled;
    button.addEventListener("click", onClick);
    return button;
  }

  _updateItem(key, index, values) {
    const items = [...(this._config[key] || [])];

    items[index] = {
      ...items[index],
      ...values,
    };

    this._config = {
      ...this._config,
      [key]: items,
    };

    this._emitConfig();
  }

  _addItem(section) {
    const items = [...(this._config[section.key] || [])];

    items.push(
      section.key === "status_items"
        ? { entity: "", name: "", kind: "window" }
        : { entity: "", name: "" }
    );

    this._config = {
      ...this._config,
      [section.key]: items,
    };

    this._openSections.add(section.key);
    this._render();
    this._emitConfig();
  }

  _removeItem(key, index) {
    const items = [...(this._config[key] || [])];
    items.splice(index, 1);

    this._config = {
      ...this._config,
      [key]: items,
    };

    this._render();
    this._emitConfig();
  }

  _moveItem(key, index, direction) {
    const items = [...(this._config[key] || [])];
    const target = index + direction;

    if (target < 0 || target >= items.length) return;

    [items[index], items[target]] = [items[target], items[index]];

    this._config = {
      ...this._config,
      [key]: items,
    };

    this._render();
    this._emitConfig();
  }

  _statusStateKeys(kind) {
    if (["window", "door", "motion", "smoke"].includes(kind)) {
      return ["on", "off"];
    }

    if (kind === "lock") {
      return [
        "locked",
        "unlocked",
        "locking",
        "unlocking",
        "jammed",
        "open",
        "opening",
      ];
    }

    if (kind === "ventilation") {
      return [
        "wait",
        "ventilate",
        "ok",
        "do_not_ventilate",
        "close",
      ];
    }

    return [];
  }

  _updateStatusItem(index, values) {
    const items = [...(this._config.status_items || [])];

    items[index] = {
      ...items[index],
      ...values,
    };

    this._config = {
      ...this._config,
      status_items: items,
    };

    this._emitConfig();
  }

  _updateStatusState(itemIndex, stateKey, values) {
    const items = [...(this._config.status_items || [])];
    const states = { ...(items[itemIndex].states || {}) };

    states[stateKey] = {
      ...states[stateKey],
      ...values,
    };

    items[itemIndex] = {
      ...items[itemIndex],
      states,
    };

    this._config = {
      ...this._config,
      status_items: items,
    };

    this._emitConfig();
  }

  _updateStatusRange(itemIndex, rangeIndex, values) {
    const items = [...(this._config.status_items || [])];
    const ranges = [...(items[itemIndex].ranges || [])];

    ranges[rangeIndex] = {
      ...ranges[rangeIndex],
      ...values,
    };

    items[itemIndex] = {
      ...items[itemIndex],
      ranges,
    };

    this._config = {
      ...this._config,
      status_items: items,
    };

    this._emitConfig();
  }

  _addStatusRange(itemIndex) {
    const items = [...(this._config.status_items || [])];

    items[itemIndex] = {
      ...items[itemIndex],
      ranges: [
        ...(items[itemIndex].ranges || []),
        { color: "" },
      ],
    };

    this._config = {
      ...this._config,
      status_items: items,
    };

    this._openSections.add("status_items");
    this._render();
    this._emitConfig();
  }

  _removeStatusRange(itemIndex, rangeIndex) {
    const items = [...(this._config.status_items || [])];
    const ranges = [...(items[itemIndex].ranges || [])];

    ranges.splice(rangeIndex, 1);

    items[itemIndex] = {
      ...items[itemIndex],
      ranges,
    };

    this._config = {
      ...this._config,
      status_items: items,
    };

    this._render();
    this._emitConfig();
  }

  _moveStatusRange(itemIndex, rangeIndex, direction) {
    const items = [...(this._config.status_items || [])];
    const ranges = [...(items[itemIndex].ranges || [])];
    const target = rangeIndex + direction;

    if (target < 0 || target >= ranges.length) return;

    [ranges[rangeIndex], ranges[target]] = [
      ranges[target],
      ranges[rangeIndex],
    ];

    items[itemIndex] = {
      ...items[itemIndex],
      ranges,
    };

    this._config = {
      ...this._config,
      status_items: items,
    };

    this._render();
    this._emitConfig();
  }

  _renderStatusRanges(item, index) {
    const box = document.createElement("fieldset");
    const legend = document.createElement("legend");
    legend.textContent = "Messwertfarben"; box.append(legend);
    const latest = () => this._config.status_items[index];
    const save = (rows, redraw = true) => {
      this._updateStatusItem(index, { ranges: rows });
      if (redraw) this._render();
    };
    const label = document.createElement("label");
    label.className = "room-color-theme";
    const enabled = document.createElement("input");
    enabled.type = "checkbox"; enabled.checked = item.colors_enabled !== false;
    label.append(enabled, document.createTextNode("Messwertfarben aktivieren")); box.append(label);
    const controls = document.createElement("fieldset");
    controls.className = "room-color-controls"; controls.disabled = !enabled.checked;
    enabled.addEventListener("change", () => {
      this._updateStatusItem(index, { colors_enabled: enabled.checked });
      controls.disabled = !enabled.checked;
    });
    box.append(controls);
    const note = document.createElement("p"); note.className = "empty";
    note.textContent = "Genau ein Grundbereich; jede numerische Untergrenze nur einmal. Höchste passende Untergrenze gilt inklusive. Leere Farbe = neutral.";
    controls.append(note);
    const rows = roomStatusRanges(item);
    if (!roomNewRanges(rows)) {
      const warning = document.createElement("p"); warning.className = "room-color-error";
      warning.textContent = "Bestehende Von/Bis-Regeln bleiben unverändert wirksam. Für das neue Schema bitte die Standardfarben wiederherstellen. Die alten Regeln werden nicht stillschweigend umgerechnet.";
      controls.append(warning);
    } else {
      const errors = document.createElement("p"); errors.className = "room-color-error";
      errors.setAttribute("role", "status"); errors.textContent = roomColorIssues(rows).join(" "); controls.append(errors);
      const entries = rows.map((row, i) => ({row, i})).sort((a, b) =>
        (a.row.above === null ? -Infinity : Number(a.row.above)) - (b.row.above === null ? -Infinity : Number(b.row.above))
      );
      for (const {row, i} of entries) {
        const line = document.createElement("div"); line.className = "room-color-rule";
        const label = document.createElement("label");
        label.textContent = row.above === null ? "Grundbereich" : "Ab Wert";
        const limit = document.createElement("input"); limit.type = "number"; limit.step = "any";
        limit.value = row.above ?? ""; limit.placeholder = "Alle";
        // Preserve the only base; a duplicate base can be corrected or removed.
        limit.disabled = row.above === null && rows.filter(r => r.above === null).length === 1;
        limit.addEventListener("input", () => limit.setCustomValidity(""));
        limit.addEventListener("change", () => {
          if (!limit.checkValidity() || limit.validity.badInput) { limit.reportValidity(); return; }
          const value = roomColorNumber(limit.value), next = roomStatusRanges(latest());
          if (value === null || next.some((r, j) => j !== i && r.above !== null && roomColorNumber(r.above) === value)) {
            limit.setCustomValidity("Gültige, noch nicht verwendete Untergrenze eingeben."); limit.reportValidity(); return;
          }
          next[i] = {...next[i], above: value}; save(next);
        });
        label.append(limit); line.append(label);
        line.append(this._colorField("Farbe", row.color ?? "", value => {
          const next = roomStatusRanges(latest()); next[i] = {...next[i], color: value}; save(next, false);
        }, {placeholder: "Leer = neutral"}));
        const remove = this._button("×", () => {
          const next = roomStatusRanges(latest()); next.splice(i, 1); save(next);
        }, row.above === null && rows.filter(r => r.above === null).length === 1);
        remove.title = "Farbbereich entfernen"; line.append(remove); controls.append(line);
      }
      if (!rows.some(r => r.above === null)) controls.append(this._button("Grundbereich hinzufügen", () => {
        save([{above: null, color: ""}, ...roomStatusRanges(latest())]);
      }));
      controls.append(this._button("Bereich hinzufügen", () => {
        const next = roomStatusRanges(latest());
        const used = new Set(next.filter(r => r.above !== null).map(r => roomColorNumber(r.above)));
        let above = 0; while (used.has(above)) above++;
        next.push({above, color: "#A5D6A7"}); save(next);
      }));
    }
    if (item.icon_color) {
      const note = document.createElement("p"); note.className = "empty";
      note.textContent = "Eine ältere feste Farbe überschreibt noch die Messwertregeln.";
      box.append(note, this._button("Feste Farbe entfernen", () => {
        this._updateStatusItem(index, {icon_color: ""}); this._render();
      }));
    }
    box.append(this._button("Standardfarben wiederherstellen", () => {
      this._updateStatusItem(index, {ranges: structuredClone(ROOM_STATUS_COLOR_DEFAULTS[item.kind]), icon_color: ""});
      this._render();
    }));
    return box;
  }

  _renderStatusItem(item, index) {
    const container = document.createElement("div");
    container.className = "item";

    const title = document.createElement("div");
    title.className = "item-title";
    title.textContent = `Eintrag ${index + 1}`;
    container.append(title);

    const kind = item.kind || "window";
    const stateKeys = this._statusStateKeys(kind);
    const isNumeric = ["temperature", "humidity"].includes(kind);

    const previousKind = kind;

    container.append(
      this._createForm(
        [
          ["entity", "Entity", { entity: {} }],
          ["name", "Anzeigename", { text: {} }],
          [
            "kind",
            "Statusart",
            {
              select: {
                mode: "dropdown",
                options: RAUM_STATUS_KINDS,
              },
            },
          ],
          [
            "icon",
            isNumeric
              ? "Icon (fest)"
              : "Icon (fest, optional)",
            { icon: {} },
          ],
          ...(!isNumeric ? [["icon_color", "Farbe (fest, optional)", { text: {} }]] : []),
        ],
        item,
        (values) => {
          this._updateStatusItem(index, values);

          if ((values.kind || "window") !== previousKind) {
            this._openSections.add("status_items");
            this._render();
          }
        }
      )
    );

    if (stateKeys.length) {
      const stateBox = document.createElement("fieldset");
      stateBox.className = "item";

      const stateLegend = document.createElement("legend");
      stateLegend.textContent = "Zustände";
      stateBox.append(stateLegend);

      const stateNote = document.createElement("p");
      stateNote.className = "empty";
      stateNote.textContent =
        "Leere Felder verwenden das automatische Standard-Icon " +
        "bzw. die Standardfarbe. Leere Farbe = neutral. Eine feste Farbe hat Vorrang vor Zustandsfarben.";
      stateBox.append(stateNote);

      stateKeys.forEach((stateKey) => {
        const stateData = item.states?.[stateKey] || {};

        const row = document.createElement("div");
        row.className = "item";

        const stateTitle = document.createElement("div");
        stateTitle.className = "item-title";
        stateTitle.textContent =
          ({
            window: { on: "Offen", off: "Geschlossen" },
            door: { on: "Offen", off: "Geschlossen" },
            motion: { on: "Bewegung / Anwesenheit erkannt", off: "Keine Bewegung / abwesend" },
            smoke: { on: "Rauchalarm", off: "Kein Rauchalarm" },
          }[kind]?.[stateKey]) || RAUM_STATUS_STATE_LABELS[stateKey] || stateKey;
        row.append(stateTitle);

        row.append(
          this._createForm(
            [
              ["label", "Text (optional)", { text: {} }],
              ...(kind !== "ventilation" ? [["icon", "Icon (optional)", { icon: {} }]] : []),
              ["color", "Farbe (optional)", { text: {} }],
            ],
            stateData,
            (values) => {
              this._updateStatusState(index, stateKey, values);
            }
          )
        );

        stateBox.append(row);
      });

      container.append(stateBox);
    }

    if (isNumeric) container.append(this._renderStatusRanges(item, index));

    const actions = document.createElement("div");
    actions.className = "actions";
    actions.append(
      this._button("Nach oben", () => this._moveItem("status_items", index, -1), index === 0),
      this._button("Nach unten", () => this._moveItem("status_items", index, 1), index === (this._config.status_items || []).length - 1),
      this._button("Entfernen", () => this._removeItem("status_items", index))
    );
    container.append(actions);

    return container;
  }

  _addCustomSection() {
    const sections = [...(this._config.custom_sections || [])];

    let index = sections.length + 1;
    let key = `custom_${index}`;

    while (
      sections.some((section) => section.key === key) ||
      ROOM_LISTS.includes(key)
    ) {
      index += 1;
      key = `custom_${index}`;
    }

    sections.push({
      key,
      title: `Eigener Bereich ${index}`,
      columns: 3,
      domain: "",
      visible: true,
      items: [],
    });

    const layout = this._config.layout;

    if (
      layout &&
      Array.isArray(layout.order) &&
      !layout.order.includes(key)
    ) {
      this._config = {
        ...this._config,
        custom_sections: sections,
        layout: {
          ...layout,
          order: [...layout.order, key],
        },
      };
    } else {
      this._config = {
        ...this._config,
        custom_sections: sections,
      };
    }

    this._openSections.add(`custom_${key}`);
    this._render();
    this._emitConfig();
  }

  _removeCustomSection(index) {
    const sections = [...(this._config.custom_sections || [])];
    const removed = sections.splice(index, 1)[0];

    const layout = this._config.layout;

    if (
      layout &&
      Array.isArray(layout.order) &&
      removed &&
      layout.order.includes(removed.key)
    ) {
      this._config = {
        ...this._config,
        custom_sections: sections,
        layout: {
          ...layout,
          order: layout.order.filter(
            (orderKey) => orderKey !== removed.key
          ),
        },
      };
    } else {
      this._config = {
        ...this._config,
        custom_sections: sections,
      };
    }

    this._render();
    this._emitConfig();
  }

  _updateCustomSection(index, values) {
    const sections = [...(this._config.custom_sections || [])];

    sections[index] = {
      ...sections[index],
      ...values,
    };

    this._config = {
      ...this._config,
      custom_sections: sections,
    };

    this._emitConfig();
  }

  _addCustomItem(sectionIndex) {
    const sections = [...(this._config.custom_sections || [])];

    sections[sectionIndex] = {
      ...sections[sectionIndex],
      items: [
        ...(sections[sectionIndex].items || []),
        { entity: "", name: "" },
      ],
    };

    this._config = {
      ...this._config,
      custom_sections: sections,
    };

    this._openSections.add(`custom_${sections[sectionIndex].key}`);
    this._render();
    this._emitConfig();
  }

  _updateCustomItem(sectionIndex, itemIndex, values) {
    const sections = [...(this._config.custom_sections || [])];
    const items = [...(sections[sectionIndex].items || [])];

    items[itemIndex] = {
      ...items[itemIndex],
      ...values,
    };

    sections[sectionIndex] = {
      ...sections[sectionIndex],
      items,
    };

    this._config = {
      ...this._config,
      custom_sections: sections,
    };

    this._emitConfig();
  }

  _removeCustomItem(sectionIndex, itemIndex) {
    const sections = [...(this._config.custom_sections || [])];
    const items = [...(sections[sectionIndex].items || [])];

    items.splice(itemIndex, 1);

    sections[sectionIndex] = {
      ...sections[sectionIndex],
      items,
    };

    this._config = {
      ...this._config,
      custom_sections: sections,
    };

    this._render();
    this._emitConfig();
  }

  _moveCustomItem(sectionIndex, itemIndex, direction) {
    const sections = [...(this._config.custom_sections || [])];
    const items = [...(sections[sectionIndex].items || [])];
    const target = itemIndex + direction;

    if (target < 0 || target >= items.length) return;

    [items[itemIndex], items[target]] = [
      items[target],
      items[itemIndex],
    ];

    sections[sectionIndex] = {
      ...sections[sectionIndex],
      items,
    };

    this._config = {
      ...this._config,
      custom_sections: sections,
    };

    this._render();
    this._emitConfig();
  }

  _layoutDraft() {
    const current = this._config.layout || {};
    const customSections = this._config.custom_sections || [];
    const customKeys = customSections.map((section) => section.key);

    const defaultOrder = [
      ...Object.keys(RAUM_LAYOUT_DEFAULTS),
      ...customKeys,
    ];

    const configuredOrder = Array.isArray(current.order)
      ? current.order
      : [];
    const configuredSections =
      current.sections &&
      typeof current.sections === "object" &&
      !Array.isArray(current.sections)
        ? current.sections
        : {};

    const requestedOrder = [
      ...new Set(
        configuredOrder.filter((key) => defaultOrder.includes(key))
      ),
    ];
    const order = [
      ...requestedOrder,
      ...defaultOrder.filter((key) => !requestedOrder.includes(key)),
    ];

    return {
      order,
      sections: Object.fromEntries(
        order.map((key) => {
          const section = RAUM_EDITOR_SECTIONS.find(
            (item) => item.key === key
          );
          const customSection = customSections.find(
            (item) => item.key === key
          );
          const settings = configuredSections[key] || {};

          return [
            key,
            {
              title: customSection
                ? customSection.title
                : section.title,
              columns:
                settings.columns ??
                (customSection
                  ? customSection.columns ?? 3
                  : RAUM_LAYOUT_DEFAULTS[key]),
              visible: settings.visible !== false,
            },
          ];
        })
      ),
    };
  }

  _renderLayout() {
    const sectionKey = "layout";
    const draft = this._layoutDraft();

    const details = document.createElement("details");
    details.open = this._openSections.has(sectionKey);

    details.addEventListener("toggle", () => {
      if (!this.shadowRoot.contains(details)) return;

      if (details.open) {
        this._openSections.add(sectionKey);
      } else {
        this._openSections.delete(sectionKey);
      }
    });

    const summary = document.createElement("summary");
    summary.textContent = "Layout";
    details.append(summary);

    const form = document.createElement("form");
    form.className = "section-body";
    details.append(form);

    const note = document.createElement("p");
    note.className = "empty";
    note.textContent =
      "Leere Bereiche werden weiterhin nicht angezeigt. " +
      "Änderungen zuerst mit „Layout übernehmen“ speichern.";
    form.append(note);

    const orderList = document.createElement("div");
    form.append(orderList);

    const renderOrder = () => {
      orderList.replaceChildren();

      draft.order.forEach((key, index) => {
        const settings = draft.sections[key];
        const row = document.createElement("div");
        row.className = "layout-item";

        const title = document.createElement("div");
        title.className = "item-title";
        title.textContent = settings.title;
        row.append(title);

        const controls = document.createElement("div");
        controls.className = "layout-controls";

        const columnsLabel = document.createElement("label");
        columnsLabel.textContent = "Spalten";

        const columns = document.createElement("select");
        for (let value = 1; value <= 6; value++) {
          const option = document.createElement("option");
          option.value = String(value);
          option.textContent = String(value);
          option.selected = settings.columns === value;
          columns.append(option);
        }

        columns.addEventListener("change", () => {
          settings.columns = Number(columns.value);
        });

        columnsLabel.append(columns);

        const visibleLabel = document.createElement("label");
        visibleLabel.className = "layout-visible";

        const visible = document.createElement("input");
        visible.type = "checkbox";
        visible.checked = settings.visible;

        visible.addEventListener("change", () => {
          settings.visible = visible.checked;
        });

        visibleLabel.append(
          visible,
          document.createTextNode("Anzeigen")
        );

        controls.append(columnsLabel, visibleLabel);
        row.append(controls);

        const actions = document.createElement("div");
        actions.className = "actions";

        actions.append(
          this._button(
            "Nach oben",
            () => {
              const target = index - 1;
              if (target < 0) return;

              [draft.order[index], draft.order[target]] = [
                draft.order[target],
                draft.order[index],
              ];

              renderOrder();
            },
            index === 0
          ),
          this._button(
            "Nach unten",
            () => {
              const target = index + 1;
              if (target >= draft.order.length) return;

              [draft.order[index], draft.order[target]] = [
                draft.order[target],
                draft.order[index],
              ];

              renderOrder();
            },
            index === draft.order.length - 1
          )
        );

        row.append(actions);
        orderList.append(row);
      });
    };

    renderOrder();

    const actions = document.createElement("div");
    actions.className = "actions";

    actions.append(
      this._button("Layout übernehmen", () => {
        this._config = {
          ...this._config,
          layout: {
            order: [...draft.order],
            sections: Object.fromEntries(
              draft.order.map((key) => [
                key,
                {
                  columns: draft.sections[key].columns,
                  visible: draft.sections[key].visible,
                },
              ])
            ),
          },
        };

        this._openSections.add(sectionKey);
        this._render();
        this._emitConfig();
      }),

      this._button("Auf Standard zurücksetzen", () => {
        const config = { ...this._config };
        delete config.layout;

        this._config = config;
        this._openSections.add(sectionKey);
        this._render();
        this._emitConfig();
      })
    );

    form.append(actions);

    form.addEventListener("submit", (event) => {
      event.preventDefault();
    });

    return details;
  }

  _renderTitleColors() {
    const sectionKey = "title_color";

    const current = this._config.title_color;

    const draft =
      current === undefined
        ? {
            room_label: "",
            default: "#FFFFFF",
            rules: [
              {
                label: "Hauptbeleuchtung",
                color: "#FFD600",
              },
              {
                label: "Ambiente Beleuchtung",
                color: "#FF9800",
              },
            ],
          }
        : {
            room_label: current.room_label ?? "",
            default:
              current.default ?? "var(--primary-text-color)",
            rules: (current.rules ?? []).map((rule) => ({
              label: rule.label,
              color: rule.color,
            })),
          };

    const details = document.createElement("details");
    details.open = this._openSections.has(sectionKey);

    details.addEventListener("toggle", () => {
      if (!this.shadowRoot.contains(details)) return;

      if (details.open) {
        this._openSections.add(sectionKey);
      } else {
        this._openSections.delete(sectionKey);
      }
    });

    const summary = document.createElement("summary");
    summary.textContent = "Titelfarben";
    details.append(summary);

    const form = document.createElement("form");
    form.className = "section-body";
    details.append(form);

    const note = document.createElement("p");
    note.className = "empty";
    note.textContent =
      "Die erste passende Regel gewinnt. " +
      "Ein leeres Raumlabel verwendet den Raumnamen. " +
      "Änderungen hier zuerst mit „Farbregeln übernehmen“ speichern.";
    form.append(note);

    const field = (parent, title, value, onChange, options = {}) => {
      if (options.color) {
        const field = this._colorField(title, value, onChange, options);
        parent.append(field);
        return field.colorInput;
      }
      const label = document.createElement("label");
      label.className = "room-color-field";
      label.textContent = title;
      const input = document.createElement("input");
      input.type = "text"; input.value = value ?? "";
      input.addEventListener("change", () => onChange(input.value));
      label.append(input); parent.append(label);
      return input;
    };

    field(
      form,
      "Raumlabel — leer = Raumname",
      draft.room_label,
      (value) => {
        draft.room_label = value;
      }
    );

    field(
      form,
      "Standardfarbe",
      draft.default,
      (value) => {
        draft.default = value;
      },
      {
        required: true,
        color: true,
        theme: true,
      }
    );

    const ruleList = document.createElement("div");
    form.append(ruleList);

    const renderRules = () => {
      ruleList.replaceChildren();

      if (!draft.rules.length) {
        const empty = document.createElement("p");
        empty.className = "empty";
        empty.textContent =
          "Keine Regeln: Der Titel verwendet immer die Standardfarbe.";
        ruleList.append(empty);
      }

      draft.rules.forEach((rule, index) => {
        const row = document.createElement("div");
        row.className = "item";

        const title = document.createElement("div");
        title.className = "item-title";
        title.textContent = `Regel ${index + 1}`;
        row.append(title);

        field(
          row,
          "Beleuchtungslabel",
          rule.label,
          (value) => {
            rule.label = value;
          },
          { required: true }
        );

        field(
          row,
          "Farbe",
          rule.color,
          (value) => {
            rule.color = value;
          },
          { required: true, color: true }
        );

        const actions = document.createElement("div");
        actions.className = "actions";

        const move = (direction) => {
          const target = index + direction;
          if (target < 0 || target >= draft.rules.length) return;

          [draft.rules[index], draft.rules[target]] = [
            draft.rules[target],
            draft.rules[index],
          ];

          renderRules();
        };

        actions.append(
          this._button(
            "Nach oben",
            () => move(-1),
            index === 0
          ),
          this._button(
            "Nach unten",
            () => move(1),
            index === draft.rules.length - 1
          ),
          this._button("Entfernen", () => {
            draft.rules.splice(index, 1);
            renderRules();
          })
        );

        row.append(actions);
        ruleList.append(row);
      });
    };

    renderRules();

    const actions = document.createElement("div");
    actions.className = "actions";

    actions.append(
      this._button("+ Farbregel", () => {
        draft.rules.push({
          label: "",
          color: "#FFD600",
        });
        renderRules();
      }),

      this._button("Farbregeln übernehmen", () => {
        if (!form.reportValidity()) return;

        const roomLabel = draft.room_label.trim();

        const titleColor = {
          ...(roomLabel ? { room_label: roomLabel } : {}),
          default: draft.default.trim(),
          rules: draft.rules.map((rule) => ({
            label: rule.label.trim(),
            color: rule.color.trim(),
          })),
        };

        this._config = {
          ...this._config,
          title_color: titleColor,
        };

        this._openSections.add(sectionKey);
        this._render();
        this._emitConfig();
      }),

      this._button("Auf Standard zurücksetzen", () => {
        const config = { ...this._config };
        delete config.title_color;

        this._config = config;
        this._openSections.add(sectionKey);
        this._render();
        this._emitConfig();
      })
    );

    form.append(actions);

    form.addEventListener("submit", (event) => {
      event.preventDefault();
    });

    return details;
  }

  _renderCustomSections() {
    const sections = this._config.custom_sections || [];

    const domainOptions = [
      { value: "", label: "Beliebig" },
      ...RAUM_CUSTOM_DOMAINS.map((domain) => ({
        value: domain,
        label: domain,
      })),
    ];

    const details = document.createElement("details");
    details.open = this._openSections.has("custom_sections");

    details.addEventListener("toggle", () => {
      if (!this.shadowRoot.contains(details)) return;

      if (details.open) {
        this._openSections.add("custom_sections");
      } else {
        this._openSections.delete("custom_sections");
      }
    });

    const summary = document.createElement("summary");
    summary.textContent = `Eigene Bereiche (${sections.length})`;
    details.append(summary);

    const body = document.createElement("div");
    body.className = "section-body";

    const note = document.createElement("p");
    note.className = "empty";
    note.textContent =
      "Eigene Bereiche erscheinen wie die festen Bereiche ohne eigene " +
      "Überschrift. Die Reihenfolge wird im Layout-Bereich geändert.";
    body.append(note);

    sections.forEach((section, sectionIndex) => {
      const box = document.createElement("fieldset");
      box.className = "item";

      const legend = document.createElement("legend");
      legend.textContent = section.title || section.key;
      box.append(legend);

      const previousDomain = section.domain || "";

      box.append(
        this._createForm(
          [
            ["title", "Titel (Layout)", { text: {} }],
            ["columns", "Spalten", { number: {} }],
            [
              "domain",
              "Domain-Filter",
              {
                select: {
                  mode: "dropdown",
                  options: domainOptions,
                },
              },
            ],
          ],
          {
            title: section.title || "",
            columns: section.columns ?? 3,
            domain: section.domain || "",
          },
          (values) => {
            this._updateCustomSection(sectionIndex, values);

            if ((values.domain || "") !== previousDomain) {
              this._openSections.add(`custom_${section.key}`);
              this._render();
            }
          }
        )
      );

      (section.items || []).forEach((item, itemIndex) => {
        const row = document.createElement("div");
        row.className = "item";

        const title = document.createElement("div");
        title.className = "item-title";
        title.textContent = `Eintrag ${itemIndex + 1}`;
        row.append(title);

        row.append(
          this._createForm(
            [
              [
                "entity",
                "Entity",
                {
                  entity: section.domain
                    ? { domain: section.domain }
                    : {},
                },
              ],
              ["name", "Anzeigename", { text: {} }],
              ["icon", "Icon (optional)", { icon: {} }],
              ["icon_color", "Icon-Farbe (optional)", { text: {} }],
            ],
            item,
            (values) => {
              this._updateCustomItem(sectionIndex, itemIndex, values);
            }
          )
        );

        const actions = document.createElement("div");
        actions.className = "actions";

        actions.append(
          this._button(
            "Nach oben",
            () =>
              this._moveCustomItem(sectionIndex, itemIndex, -1),
            itemIndex === 0
          ),
          this._button(
            "Nach unten",
            () =>
              this._moveCustomItem(sectionIndex, itemIndex, 1),
            itemIndex === (section.items || []).length - 1
          ),
          this._button("Entfernen", () =>
            this._removeCustomItem(sectionIndex, itemIndex)
          )
        );

        row.append(actions);
        box.append(row);
      });

      const sectionActions = document.createElement("div");
      sectionActions.className = "actions";

      sectionActions.append(
        this._button("+ Eintrag hinzufügen", () =>
          this._addCustomItem(sectionIndex)
        ),
        this._button("Bereich entfernen", () =>
          this._removeCustomSection(sectionIndex)
        )
      );

      box.append(sectionActions);
      body.append(box);
    });

    const addSection = document.createElement("div");
    addSection.className = "actions";
    addSection.append(
      this._button("+ Eigener Bereich hinzufügen", () =>
        this._addCustomSection()
      )
    );

    body.append(addSection);
    details.append(body);

    return details;
  }

  _render() {
    if (!this._config) return;

    this._forms = [];
    this._rendered = true;

    const style = document.createElement("style");
    style.textContent = `
      .room-color-field {display:flex;flex-direction:column;gap:6px;margin:12px 0;min-width:0;}
      .room-color-row {display:grid;grid-template-columns:44px minmax(0,1fr);gap:8px;align-items:center;}
      .room-color-row input[type="color"] {width:44px;height:38px;padding:0;border:0;background:none;cursor:pointer;}
      .room-color-row input[type="text"], .room-color-rule input[type="number"], .room-color-field > input {
        box-sizing:border-box;width:100%;min-width:0;padding:10px;border:1px solid var(--divider-color);
        border-radius:8px;background:var(--secondary-background-color);color:var(--primary-text-color);font:inherit;
      }
      .room-color-row[hidden] {display:none;}
      .room-color-rule {display:grid;grid-template-columns:minmax(85px,1fr) minmax(120px,2fr) auto;gap:8px;align-items:center;}
      .room-color-rule > label {display:flex;flex-direction:column;gap:6px;}
      .room-color-controls {min-width:0;border:0;padding:0;margin:12px 0;}
      .room-color-controls:disabled {opacity:.45;}
      .room-color-error {color:var(--error-color,#db4437);font-size:13px;}
      .room-color-theme {display:flex;align-items:center;gap:8px;margin:10px 0;}
      @media(max-width:400px) { .room-color-rule {grid-template-columns:minmax(65px,1fr) minmax(90px,2fr) auto;gap:4px;} }

      :host {
        display: block;
        color: var(--primary-text-color);
      }

      .intro {
        margin: 0 0 16px;
        color: var(--secondary-text-color);
        line-height: 1.5;
      }

      .general {
        margin-bottom: 20px;
      }

      details {
        margin: 12px 0;
        border: 1px solid var(--divider-color);
        border-radius: 12px;
        overflow: hidden;
      }

      summary {
        padding: 14px;
        cursor: pointer;
        font-weight: 500;
      }

      .section-body {
        padding: 0 12px 12px;
      }

      .item {
        border-top: 1px solid var(--divider-color);
        padding: 12px 0;
      }

      .item-title {
        margin-bottom: 10px;
        font-weight: 500;
      }

      .actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-top: 10px;
      }

      button {
        padding: 8px 12px;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        font: inherit;
        cursor: pointer;
      }

      button:hover {
        border-color: var(--primary-color);
      }

      button:disabled {
        opacity: 0.4;
        cursor: default;
      }

      .layout-item {
        border-top: 1px solid var(--divider-color);
        padding: 12px 0;
      }

      .layout-controls {
        display: flex;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
        margin-bottom: 8px;
      }

      .layout-controls label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: var(--secondary-text-color);
      }

      .layout-controls select {
        padding: 6px 8px;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        font: inherit;
      }

      .layout-visible {
        color: var(--primary-text-color) !important;
        cursor: pointer;
      }

      .layout-visible input {
        width: 18px;
        height: 18px;
        margin: 0;
        accent-color: var(--primary-color);
        cursor: pointer;
      }

      .title-color-field {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin: 12px 0;
      }

      .title-color-field > label {
        font-size: 14px;
        color: var(--secondary-text-color);
      }

      .title-color-controls {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .title-color-controls input[type="text"] {
        box-sizing: border-box;
        flex: 1;
        min-width: 0;
        width: 100%;
        padding: 12px;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        background: var(--secondary-background-color);
        color: var(--primary-text-color);
        font: inherit;
      }

      .title-color-picker {
        box-sizing: border-box;
        flex: 0 0 52px;
        width: 52px;
        height: 44px;
        padding: 4px;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        background: var(--secondary-background-color);
        cursor: pointer;
      }

      .title-color-controls input:focus-visible {
        outline: 2px solid var(--primary-color);
        outline-offset: 1px;
      }

      .empty {
        margin: 0 0 12px;
        color: var(--secondary-text-color);
      }

      .title-color-theme {
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        color: var(--primary-text-color);
        font-size: 14px;
        line-height: 1.5;
      }

      .title-color-theme input[type="checkbox"] {
        width: 18px;
        height: 18px;
        margin: 0;
        accent-color: var(--primary-color);
        cursor: pointer;
      }

      .title-color-controls[hidden] {
        display: none;
      }
    `;

    const container = document.createElement("div");

    const intro = document.createElement("p");
    intro.className = "intro";
    intro.textContent =
      "Konfiguriere deinen Raum, das Layout und die einzelnen Bereiche. " +
      "Leere Bereiche werden nicht angezeigt. " +
      "Neue Einträge benötigen eine Entity.";
    container.append(intro);

    const general = document.createElement("div");
    general.className = "general";

    general.append(
      this._createForm(
        [
          ["raum", "Raumname", { text: {} }],
          [
            "anwesenheit",
            "Anwesenheit (optional)",
            { entity: { domain: "person" } },
          ],
        ],
        {
          raum: this._config.raum || "",
          anwesenheit: this._config.anwesenheit || "",
        },
        (values) => {
          this._config = {
            ...this._config,
            ...values,
          };
          this._emitConfig();
        }
      )
    );

    container.append(general);
    container.append(this._renderLayout());
    container.append(this._renderTitleColors());
    container.append(this._renderCustomSections());

    for (const section of RAUM_EDITOR_SECTIONS) {
      const items = this._config[section.key] || [];

      const details = document.createElement("details");
      details.open = this._openSections.has(section.key);

      details.addEventListener("toggle", () => {
        if (!this.shadowRoot.contains(details)) return;

        if (details.open) {
          this._openSections.add(section.key);
        } else {
          this._openSections.delete(section.key);
        }
      });

      const summary = document.createElement("summary");
      summary.textContent = `${section.title} (${items.length})`;
      details.append(summary);

      const body = document.createElement("div");
      body.className = "section-body";

      if (!items.length) {
        const empty = document.createElement("p");
        empty.className = "empty";
        empty.textContent = "Noch keine Einträge.";
        body.append(empty);
      }

      items.forEach((item, index) => {
        if (section.key === "status_items") {
          body.append(this._renderStatusItem(item, index));
          return;
        }

        const row = document.createElement("div");
        row.className = "item";

        const title = document.createElement("div");
        title.className = "item-title";
        title.textContent = `Eintrag ${index + 1}`;
        row.append(title);

        row.append(
          this._createForm(
            this._fieldsFor(section),
            item,
            (values) => {
              this._updateItem(section.key, index, values);
            }
          )
        );

        const actions = document.createElement("div");
        actions.className = "actions";

        actions.append(
          this._button(
            "Nach oben",
            () => this._moveItem(section.key, index, -1),
            index === 0
          ),
          this._button(
            "Nach unten",
            () => this._moveItem(section.key, index, 1),
            index === items.length - 1
          ),
          this._button(
            "Entfernen",
            () => this._removeItem(section.key, index)
          )
        );

        row.append(actions);
        body.append(row);
      });

      body.append(
        this._button(
          "+ Eintrag hinzufügen",
          () => this._addItem(section)
        )
      );

      details.append(body);
      container.append(details);
    }

    this.shadowRoot.replaceChildren(style, container);
  }
}

if (!customElements.get("raum-karte-editor")) {
  customElements.define("raum-karte-editor", RaumKarteEditor);
}
