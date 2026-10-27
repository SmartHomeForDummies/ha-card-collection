const RAUM_EDITOR_SECTIONS = [
  {
    key: "status_items",
    title: "Status",
    fields: [
      ["entity", "Entity", { entity: {} }],
      ["name", "Anzeigename", { text: {} }],
      [
        "kind",
        "Statusart",
        {
          select: {
            mode: "dropdown",
            options: [
              { value: "window", label: "Fenster" },
              { value: "door", label: "Tür" },
              { value: "motion", label: "Bewegung / Anwesenheit" },
              { value: "smoke", label: "Rauchmelder" },
              { value: "lock", label: "Schloss" },
              { value: "temperature", label: "Temperatur" },
              { value: "humidity", label: "Luftfeuchtigkeit" },
              { value: "ventilation", label: "Lüftungsempfehlung" },
            ],
          },
        },
      ],
    ],
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

class RaumKarteEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._forms = [];
    this._openSections = new Set();
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
    const form = document.createElement("ha-form");

    form.hass = this._hass;
    form.schema = this._schema(fields);

    // null-Werte aus der bisherigen YAML im Formular leer anzeigen.
    form.data = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        value === null ? "" : value,
      ])
    );

    form.computeLabel = (schema) => schema.label || schema.name;

    form.addEventListener("value-changed", (event) => {
      event.stopPropagation();
      onChange(event.detail.value);
    });

    this._forms.push(form);
    return form;
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

  _render() {
    if (!this._config) return;

    this._forms = [];
    this._rendered = true;

    const style = document.createElement("style");
    style.textContent = `
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

      .empty {
        margin: 0 0 12px;
        color: var(--secondary-text-color);
      }
    `;

    const container = document.createElement("div");

    const intro = document.createElement("p");
    intro.className = "intro";
    intro.textContent =
      "Konfiguriere deinen Raum und die einzelnen Bereiche. " +
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

    for (const section of RAUM_EDITOR_SECTIONS) {
      const items = this._config[section.key] || [];

      const details = document.createElement("details");
      details.open = this._openSections.has(section.key);

      details.addEventListener("toggle", () => {
        // Ignoriere Toggle-Ereignisse bereits ersetzter Elemente.
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