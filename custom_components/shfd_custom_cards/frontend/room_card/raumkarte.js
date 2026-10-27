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

  // ------------------------------------------------------------
  // Home-Assistant-Schnittstelle
  // ------------------------------------------------------------

  static async getConfigElement() {
    await import("./raumkarte-editor.js?v=1");
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
    if (!config.raum || typeof config.raum !== "string") {
      throw new Error("Bitte einen Raumnamen unter 'raum' angeben.");
    }

    for (const key of ROOM_LISTS) {
      if (
        config[key] !== undefined &&
        !Array.isArray(config[key])
      ) {
        throw new Error(`'${key}' muss eine Liste sein.`);
      }

      for (const item of config[key] || []) {
        if (!item || typeof item !== "object" || Array.isArray(item)) {
          throw new Error(
            `Einträge unter '${key}' müssen Objekte mit einer Entity sein.`
          );
        }
      }
    }

    this._config = {
      ...RaumKarte.getStubConfig(),
      ...config,
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

  // ------------------------------------------------------------
  // Gemeinsame Hilfsfunktionen
  // ------------------------------------------------------------

  _styled(card) {
    return {
      ...card,
      uix: {
        style: ROOM_ITEM_STYLE,
      },
    };
  }

  _named(item) {
    // null oder "" nicht durch einen Friendly Name ersetzen:
    // Damit bleibt eine bewusst leere Beschriftung möglich.
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

  // ------------------------------------------------------------
  // Überschrift und Anwesenheit
  // ------------------------------------------------------------

  _header() {
    const c = this._config;

    // JSON-Strings sind zugleich gültige String-Literale für
    // die hier verwendeten Jinja-Ausdrücke.
    const person = JSON.stringify(c.anwesenheit || "");
    const room = JSON.stringify(c.raum);

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

              {% set raum = ${room} %}

              {% set haupt = label_entities(raum)
                | select('in', label_entities('Hauptbeleuchtung'))
                | select('match', '^light\\\\.')
                | select('is_state', 'on')
                | list %}

              {% set ambiente = label_entities(raum)
                | select('in', label_entities('Ambiente Beleuchtung'))
                | select('match', '^light\\\\.')
                | select('is_state', 'on')
                | list %}

              {% if haupt | count > 0 %}
                --card-primary-color: #FFD600;
              {% elif ambiente | count > 0 %}
                --card-primary-color: #FF9800;
              {% else %}
                --card-primary-color: #FFFFFF;
              {% endif %}
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

  // ------------------------------------------------------------
  // Status
  // ------------------------------------------------------------

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

  // ------------------------------------------------------------
  // Lampen, Szenen und Schalter
  // ------------------------------------------------------------

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

  // ------------------------------------------------------------
  // Rollläden
  // ------------------------------------------------------------

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

  // ------------------------------------------------------------
  // Thermostate und Medien
  // ------------------------------------------------------------

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

  // ------------------------------------------------------------
  // Wecker und optionaler Lichtwecker
  // ------------------------------------------------------------

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

  // ------------------------------------------------------------
  // Gesamte Kartenkonfiguration zusammenstellen
  // ------------------------------------------------------------

  _createCardConfig() {
    const c = this._config;

    // Unfertige GUI-Einträge ohne Entity vorerst auslassen.
    const items = (key) =>
      (c[key] || []).filter(
        (item) =>
          typeof item.entity === "string" &&
          item.entity.trim().length > 0
      );

    const cards = [
      this._header(),

      this._section(
        items("status_items").map((item) => this._status(item)),
        3,
        8
      ),

      this._section(
        items("wecker").map((item) => this._alarm(item)),
        1
      ),

      this._section(
        items("szenen").map((item) => this._scene(item)),
        3
      ),

      this._section(
        items("lampen").map((item) => this._light(item)),
        2
      ),

      this._section(
        items("schalter").map((item) => this._switch(item)),
        3
      ),

      this._section(
        items("rolllaeden").map((item) => this._cover(item)),
        1
      ),

      this._section(
        items("thermostate").map((item) => this._climate(item)),
        2
      ),

      this._section(
        items("mediaplayer").map((item) => this._media(item)),
        1,
        10,
        false
      ),
    ].filter(Boolean);

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
        cards,
      },
    };
  }

  // ------------------------------------------------------------
  // Karteninstanz erzeugen
  // ------------------------------------------------------------

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

// ------------------------------------------------------------
// Custom Element und Karten-Picker registrieren
// ------------------------------------------------------------

if (!customElements.get("raum-karte")) {
  customElements.define("raum-karte", RaumKarte);
}

window.customCards = window.customCards || [];

if (!window.customCards.some((card) => card.type === "raum-karte")) {
  window.customCards.push({
    type: "raum-karte",
    name: "Raumkarte",
    description:
      "Dashboard-unabhängige Raumkarte mit Status, Licht, Szenen, " +
      "Heizung, Medien, Rollläden und Wecker.",
    preview: false,
  });
}

console.info(
  "Raumkarte: dashboard-unabhängige Version ohne Decluttering geladen"
);
