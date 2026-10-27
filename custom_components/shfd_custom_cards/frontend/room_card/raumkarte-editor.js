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

      const values = event.detail.value;
      form.data = values;

      onChange(values);
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
    _renderTitleColors() {
    const sectionKey = "title_color";

    // Ein eigener Entwurf verhindert, dass unfertige Regeln
    // sofort an die Karte übergeben werden.
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

    const colorPattern =
      "(?:#[0-9a-fA-F]{3}|#[0-9a-fA-F]{4}|" +
      "#[0-9a-fA-F]{6}|#[0-9a-fA-F]{8}|" +
      "[a-zA-Z]+|var\\(--[a-zA-Z0-9_]+(?:-[a-zA-Z0-9_]+)*\\))";

        const field = (
      parent,
      labelText,
      value,
      onInput,
      options = {}
    ) => {
      const container = document.createElement("div");
      container.className = "title-color-field";

      const caption = document.createElement("label");
      caption.textContent = labelText;

      const controls = document.createElement("div");
      controls.className = "title-color-controls";

      const input = document.createElement("input");
      input.type = "text";
      input.value = value ?? "";
      input.required = options.required ?? false;

      const id = `room-color-${crypto.randomUUID()}`;
      input.id = id;
      caption.htmlFor = id;

      let picker = null;

      if (options.color) {
        input.pattern = colorPattern;
        input.title =
          "Hex-Farbe, CSS-Farbname oder var(--primary-text-color)";

        picker = document.createElement("input");
        picker.type = "color";
        picker.className = "title-color-picker";
        picker.setAttribute(
          "aria-label",
          `${labelText} auswählen`
        );

        // Normale, deckende Farben für den nativen Picker
        // in eine sechsstellige Hex-Farbe umwandeln.
        const toHex = (value) => {
          let color = String(value || "").trim();

          const variable = color.match(
            /^var\((--[a-zA-Z0-9_-]+)\)$/
          );

          if (variable) {
            color = getComputedStyle(this)
              .getPropertyValue(variable[1])
              .trim();
          }

          if (/^#[0-9a-f]{3}$/i.test(color)) {
            return (
              "#" +
              [...color.slice(1)]
                .map((character) => character + character)
                .join("")
            ).toLowerCase();
          }

          if (/^#[0-9a-f]{6}$/i.test(color)) {
            return color.toLowerCase();
          }

          // Auch Farbnamen wie "orange" unterstützen.
          const context = document
            .createElement("canvas")
            .getContext("2d");

          if (!context || !CSS.supports("color", color)) {
            return null;
          }

          context.fillStyle = "#010203";
          context.fillStyle = color;

          const normalized = context.fillStyle;

          return /^#[0-9a-f]{6}$/i.test(normalized)
            ? normalized.toLowerCase()
            : null;
        };

        const syncPicker = () => {
          const hex = toHex(input.value);

          if (hex) {
            picker.value = hex;
            picker.title = "Farbe auswählen";
          } else {
            // Nicht darstellbare Werte bleiben im Textfeld erhalten.
            picker.value = "#ffffff";
            picker.title =
              "Keine exakte Vorschau für diesen Wert. " +
              "Eine Farbauswahl ersetzt den bisherigen Wert.";
          }
        };

        picker.addEventListener("input", () => {
          input.value = picker.value;
          input.setCustomValidity("");
          onInput(input.value);
        });

        input.addEventListener("input", syncPicker);

        syncPicker();
        controls.append(picker);
      }

      input.addEventListener("input", () => {
        input.setCustomValidity("");
        onInput(input.value);
      });

      input.addEventListener("change", () => {
        if (input.required && !input.value.trim()) {
          input.setCustomValidity("Bitte einen Wert eingeben.");
        }
      });

      controls.append(input);
      container.append(caption);

      if (options.theme) {
        const themeValue = "var(--primary-text-color)";

        const themeLabel = document.createElement("label");
        themeLabel.className = "title-color-theme";

        const themeCheckbox = document.createElement("input");
        themeCheckbox.type = "checkbox";
        themeCheckbox.checked =
          input.value.trim() === themeValue;

        const themeText = document.createElement("span");
        themeText.textContent =
          "Textfarbe des Themes verwenden";

        themeLabel.append(themeCheckbox, themeText);

        // Eine zuvor gewählte eigene Farbe beim Umschalten behalten.
        // Dieser Zwischenwert gilt für den aktuell geöffneten Editor.
        let customColor = themeCheckbox.checked
          ? "#FFFFFF"
          : input.value;

        const updateThemeState = () => {
          const useTheme = themeCheckbox.checked;

          input.disabled = useTheme;

          if (picker) {
            picker.disabled = useTheme;
          }

          controls.hidden = useTheme;
        };

        themeCheckbox.addEventListener("change", () => {
          if (themeCheckbox.checked) {
            customColor = input.value;
            input.value = themeValue;
          } else {
            input.value = customColor || "#FFFFFF";
          }

          input.setCustomValidity("");

          updateThemeState();

          // Die vorhandenen Listener synchronisieren Picker und Entwurf.
          input.dispatchEvent(
            new Event("input", { bubbles: true })
          );
        });

        // Auch eine manuell eingetragene Theme-Variable erkennen.
        input.addEventListener("change", () => {
          themeCheckbox.checked =
            input.value.trim() === themeValue;

          updateThemeState();
        });

        updateThemeState();
        container.append(themeLabel);
      }

      container.append(controls);
      parent.append(container);

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

    // Enter soll das Formular nicht an den Browser abschicken.
    form.addEventListener("submit", (event) => {
      event.preventDefault();
    });

    return details;
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
    container.append(this._renderTitleColors());
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