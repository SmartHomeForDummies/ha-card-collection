# SHFD Markdown Table Card

[English](markdown-table-card.md) · [Deutsch](de/markdown-table-card.md) · [Collection](../README.md)

Configurable tables for entity states, attributes, Jinja and text. Native Home Assistant components; no Mushroom, UIX or FreshAirIQ dependency.

## Preview

![SHFD Markdown Table Card preview](https://raw.githubusercontent.com/SmartHomeForDummies/ha-card-collection/9799b54a8365fc3421ed2fceb5171ca471a32733/docs/images/markdown-table-card.png)

## Installation and start

Follow the [collection installation](../README.md#installation-with-hacs). Install matching `dist/` files together and register only `ha-card-collection.js`. Development branch changes are not automatically in a published release.

Select **SHFD Markdown-Tabelle**. The picker supplies editable static examples, not live measurements. No entity lookup, service call or template request is needed for that example.

```yaml
type: custom:shfd-markdown-table-card
title: Room overview
row_header: Room
columns:
  - name: Temperature
    precision: 1
rows:
  - name: Living Room
    cells:
      - type: entity
        entity: sensor.living_room_temperature
```

Replace the ID. Tapping an available entity opens more-info. YAML keys are identical in both languages; editor labels are German.

## Editor

- **Tabelle:** title, dimensions and heading labels/visibility.
- **Tabellenlayout:** text, row spacing, widths including Room, scrolling.
- **Gestaltung:** font, grid, heading and alternating row backgrounds.
- **Inhalte und Formatierung:** cell selection, sources, display defaults/exceptions, rules and actions.

Valid changes update the preview immediately; Save in Home Assistant persists them. No general Apply button. Destructive row/column actions and rule replacement have confirmations. Undo/redo retains 20 session steps; closing/external changes can reset it. Clipboards are internal, not the OS clipboard.

Shrinking dimensions hides stored cells; growing restores them. Deletion removes data. Whole-row/column operations can include hidden contents; rule transfer only targets visible cells.

## Sources and formatting

Root options: `title` (empty hides it), `row_header`, `row_count`, `column_count`, `show_row_headers`, `show_column_headers`. Counts can be inferred from lists; both heading flags default to `true`. A row has `name` and `cells` in value-column order.

| Source | Cell fields |
| --- | --- |
| Entity | `type: entity`, `entity`; optional `attribute`, custom unit label `unit` |
| Jinja | `type: template`, `template` |
| Text | `type: text`, `text`; bold/italic, inline code, links; no raw HTML/images |

Source switches retain inactive inputs. Templates/text are not numerically reformatted or translated. Jinja receives `row.name`, `column.name`, one-based `row.index`, `column.index`, `row_index`, `column_index`, and available user display name in `user`.

Display precedence: cell → column → `defaults` → built-in default. Options: `precision` 0–6 decimals (omitted: automatic), `show_unit` (default `true`), `translate_state` (default `false`), `align` (`left`, `center`, `right`; default `left`). Translation applies to nonnumeric entity states, not attributes. Attributes do not automatically get the state unit. Unit labels never convert values. Standard übernehmen removes an override.

## Layout and appearance

`layout.text`: `single` (default) or `multi`. Column `wrap: truncate` means single-line with `…`; `wrap: normal` means multiline; omit to inherit. Legacy `nowrap` also displays single-line with ellipsis. Full single-line text remains available as a tooltip. Multiline wraps at words, then inside long words if needed; height grows automatically.

Omit column `width` for automatic sizing; fixed widths are 40–1000 px integers and never squeezed. Oversized tables scroll horizontally. No cell widths/fixed row heights. `layout.row_header` accepts its own `width` and `text`. `layout.spacing`: `compact`, `normal` (default), `airy`.

Within `appearance`: `font_size` 8–32 px (default 14), optional viewport `max_height` 120–1200 px, booleans `grid`, `striped`, `sticky_headers` (default `true`). Fill objects: `column_header_background`, `row_header_background`, `row_backgrounds.odd`/`.even`; each supports `mode` (`theme`, `transparent`, `custom`), `color`, integer `opacity` 0–100. Custom requires a color. Check contrast and transparent sticky headings.

Layout reset preserves contents, rules, alignment and scroll settings. Older global width/wrap settings remain readable through migration.

## Color and icon rules

Put `rules` on value columns/cells, not row labels. Cell rules replace the entire column set. Omit cell rules to inherit; `rules: {enabled: false}` disables them without falling back.

Numeric-rule fragment for a column or cell:

```yaml
rules:
  mode: ranges
  ranges:
    - above: null
      color: "#90CAF9"
    - above: 18
      color: "#A5D6A7"
    - above: 24
      color: "#FFE082"
  targets:
    icon: true
    text: false
    background: true
  background_opacity: 20
```

Exactly one base, unique numeric bounds; the highest matching bound wins inclusively, independent of order. Invalid numeric values do not become zero. Numeric templates must return a pure number without units.

State rules use `mode: states` and `states: [{value: "on", color: "#A5D6A7", icon: "mdi:window-open-variant"}]`. Match is exact raw value before translation/rounding. Suggestions allow manual values and are not a guaranteed list of all future states.

`targets.icon` defaults to `true`; absent icon means a status dot. Text/background targets default to `false`. Empty color means no rule color. `background_opacity`: 0–100, default 20; positive rule backgrounds override alternating fills. Quote hex colors. No unit conversion; check thresholds and contrast.

## Transfer rules

Under **Nur Farb- und Icon-Regeln übertragen**: select source → Wirksame Regeln kopieren → Zielzellen auswählen → mark matrix cells/row/column → Übertragung prüfen → Regeln auf N Zellen anwenden. Matrix clicks in target mode mark, not edit; arrows move focus and Enter/Space activates a cell. Abbrechen changes nothing.

Active inherited rules can be copied. Targets receive independent own copies replacing existing rules, including disabled ones. Sources, templates, text, units, precision and other display settings remain intact. One undo restores the batch and previous inheritance. Copies do not follow later source changes; use column rules for shared maintenance.

At most 500 visible targets; oversized selection is wholly rejected. Configuration changes cancel stale selections; changed confirmations/warnings require review. No state renaming/unit conversion; warnings cannot replace a semantic check. Clipboard contents are cleared when the editor closes.

## Limits and troubleshooting

Maximum 100 stored rows, 20 value columns plus optional row headings, 100 active visible templates, 50 entries per state/range list.

Missing picker: check matching loader/card/picker files, duplicate resources and full-page reload. Static values: replace examples. Colors: check raw state, inheritance, targets and units. Template errors appear at the cell; hidden templates are not subscribed.

Development documentation is not a completed browser certification. Test preview, native selectors, themes, touch/keyboard and real backend data locally.
