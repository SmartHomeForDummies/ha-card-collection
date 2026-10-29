/*
 * SHFD Room Card
 *
 * Card type: custom:raum-karte
 *
 * Dependencies:
 * - Mushroom
 * - UIX
 *
 * Visual editor: raumkarte-editor.js
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
  }

  static async getConfigElement() {
    await import("./raumkarte-editor.js?v=4");
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
            `Einträge unter '${key}' müssen Objekte mit einer Entity sein.`
          );
        }
      }
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

    const allowedLayoutKeys = new Set(["order", "sections"]);

    for (const key of Object.keys(layout)) {
      if (!allowedLayoutKeys.has(key)) {
        throw new Error(`Unbekannte Layout-Option: '${key}'.`);
      }
    }

    const requestedOrder = layout.order === undefined ? [] : layout.order;

    if (!Array.isArray(requestedOrder)) {
      throw new Error("'layout.order' muss eine Liste sein.");
    }

    const seen = new Set();

    for (const key of requestedOrder) {
      if (typeof key !== "string" || !ROOM_LISTS.includes(key)) {
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
      ...ROOM_LISTS.filter((key) => !seen.has(key)),
    ];

    const configuredSections =
      layout.sections === undefined ? {} : layout.sections;

    if (!isObject(configuredSections)) {
      throw new Error("'layout.sections' muss ein Objekt sein.");
    }

    for (const key of Object.keys(configuredSections)) {
      if (!ROOM_LISTS.includes(key)) {
        throw new Error(
          "Unbekannter Bereich unter 'layout.sections': '" + key + "'."
        );
      }
    }

    const sections = {};

    for (const key of ROOM_LISTS) {
      const settings =
        configuredSections[key] === undefined ? {} : configuredSections[key];

      if (!isObject(settings)) {
        throw new Error(`'layout.sections.${key}' muss ein Objekt sein.`);
      }

      for (const option of Object.keys(settings)) {
        if (!["columns", "visible"].includes(option)) {
          throw new Error(
            `Unbekannte Option unter 'layout.sections.${key}': '${option}'.`
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
        columns: settings.columns ?? defaultColumns[key],
        visible: settings.visible ?? true,
      };
    }

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

    const validColor = (color) =>
      typeof color === "string" &&
      /^(?:#[0-9a-f]{3}|#[0-9a-f]{4}|#[0-9a-f]{6}|#[0-9a-f]{8}|[a-z]+|var\(--[a-z0-9_-]+\))$/i
        .test(color.trim());

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
    const kind = JSON.stringify(item.kind || "");

    return this._styled({
      type: "custom:mushroom-template-card",
      entity: item.entity,
      primary: item.name ?? "",

      secondary: `
        {% set k = ${kind} %}
        {% set raw = states(entity) %}

        {% if raw in ['unknown', 'unavailable', 'none', None] %}
          Nicht verfügbar
        {% elif k in ['window', 'door'] %}
          {{ 'Offen' if raw == 'on' else 'Geschlossen' }}
        {% elif k == 'smoke' %}
          {{ 'Alarm!' if raw == 'on' else 'OK' }}
        {% elif k in ['temperature', 'humidity'] %}
          {{ raw }} {{ state_attr(entity, 'unit_of_measurement') or '' }}
        {% else %}
          {{ state_translated(entity) }}
        {% endif %}
      `,

      icon: `
        {% set k = ${kind} %}
        {% set s = states(entity) %}

        {% if k == 'window' %}
          {{ 'mdi:window-open-variant' if s == 'on'
             else 'mdi:window-closed-variant' }}
        {% elif k == 'door' %}
          {{ 'mdi:door-open' if s == 'on' else 'mdi:door-closed' }}
        {% elif k == 'motion' %}
          {{ 'mdi:motion-sensor' if s == 'on'
             else 'mdi:motion-sensor-off' }}
        {% elif k == 'lock' %}
          {{ 'mdi:lock' if s == 'locked' else 'mdi:lock-open' }}
        {% else %}
          {{ {
            'smoke': 'mdi:smoke-detector',
            'ventilation': 'mdi:weather-windy',
            'temperature': 'mdi:thermometer',
            'humidity': 'mdi:water-percent'
          }.get(k, 'mdi:information-outline') }}
        {% endif %}
      `,

      icon_color: `
        {% set k = ${kind} %}
        {% set s = states(entity) %}

        {% if s in ['unknown', 'unavailable'] %}
          grey
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
          {{ {
            'temperature': 'deep-orange',
            'humidity': 'blue'
          }.get(k, 'grey') }}
        {% endif %}
      `,

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
