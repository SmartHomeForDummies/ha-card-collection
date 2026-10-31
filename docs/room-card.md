# SHFD Room Card

[English](room-card.md) · [Deutsch](de/room-card.md)

A Home Assistant room card with an integrated visual editor: status, lights, scenes, switches, covers, climate, media, alarms and custom sections. Empty sections and entries without an entity are hidden.

![SHFD Room Card](images/room-card.png)

## Installation and getting started

Install [Mushroom](https://github.com/piitaya/lovelace-mushroom) and [UIX](https://github.com/Lint-Free-Technology/uix). Register the collection entry point as a JavaScript Module:

```text
/hacsfiles/ha-card-collection/ha-card-collection.js
```

Manual installation: `/local/ha-card-collection/ha-card-collection.js`. Do not also register `raumkarte.js` with this setup. No separate editor, CSS or color-extension files are required. Reload the complete browser page after resource changes.

Select SHFD Raumkarte in the picker or use:

```yaml
type: custom:raum-karte
raum: Living Room
status_items:
  - entity: binary_sensor.living_room_window
    name: Window
    kind: window
lampen:
  - entity: light.living_room_ceiling
    name: Ceiling
```

## Card-picker preview

The picker uses real available entities and prefers one common Home Assistant area. An entity's explicit area takes precedence over its device's area. It chooses the area with the most varied suitable equipment; missing categories are not filled from other areas.

The preview includes at most one window/door contact, one temperature and one humidity sensor, two lights, and one thermostat or alternatively one shutter. Short status labels are Fenster, Tür, Temperatur and Luftfeuchte. Light names are retained; different devices and main lights are preferred over segments. Without device assignments, device identity cannot be established reliably.

Humidity requires `device_class: humidity`, not just `%`. Invalid measurements and available registry flags for hidden, disabled, diagnostic or configuration entities are considered. Without usable area assignments, the title is the neutral Raumübersicht. No entities or values are invented. This is an editable starting configuration, not a permanent automatic room assignment; included controls operate real entities.

## Configuration

| Option | Meaning |
| --- | --- |
| `raum` | Required room title |
| `anwesenheit` | Optional `person` entity |
| `title_color` | Dynamic title colors |
| `layout` | Section order, columns, visibility |
| `appearance` | Appearance of this card instance |
| `status_items` | Status indicators and measurements |
| `wecker` | Alarms and wake-up light automations |
| `szenen`, `lampen`, `schalter` | Scenes, lights, switches |
| `rolllaeden`, `thermostate`, `mediaplayer` | Covers, climate, media |
| `custom_sections` | Custom sections |

Entries need `entity` to appear and usually support optional `name`. Empty entries are allowed while editing. YAML keys are identical in both documentation languages.

## Custom sections and layout

```yaml
custom_sections:
  - key: sensors
    title: Sensors
    domain: sensor
    columns: 3
    visible: true
    items:
      - entity: sensor.living_room_temperature
        name: Temperature
        icon: mdi:thermometer
        icon_color: "#FFB74D"
layout:
  order:
    - status_items
    - sensors
    - lampen
  sections:
    sensors:
      columns: 2
    wecker:
      visible: false
```

`key` must be unique, non-empty and different from built-in section keys. `title` is required but used only in the editor/layout: custom sections have no extra dashboard heading or section icon. `columns` permits 1–6, default 3; `visible` defaults to `true`. Items support `entity`, `name`, `icon`, `icon_color`.

`domain` only limits editor entity suggestions; omit or use `""` for Any. Changing the filter deletes no entries. Custom entries are generic Mushroom entity cards opening more-info when tapped, not specialized light/scene/cover controls.

Built-in keys: `status_items`, `wecker`, `szenen`, `lampen`, `schalter`, `rolllaeden`, `thermostate`, `mediaplayer`, plus custom `key` values. Each custom section moves individually. Keys omitted from `order` are appended in default order; duplicates are invalid. `layout.sections.<key>` overrides `columns` and `visible`. Empty sections stay hidden; hidden entries remain configured. The header always comes first.

In the editor: Layout → move up/down → Layout übernehmen (apply layout).

## Status types

| `kind` | States / display |
| --- | --- |
| `window`, `door` | `on` open, `off` closed; icon and color per state |
| `motion` | `on` detected, `off` no motion/absent |
| `smoke` | `on` alarm, `off` OK |
| `lock` | `locked`, `unlocked`, `locking`, `unlocking`, `jammed`, `open`, `opening` |
| `ventilation` | `wait`, `ventilate`, `ok`, `do_not_ventilate`, `close`; fixed icon, state colors |
| `temperature`, `humidity` | Numeric measurement; fixed icon, value-based color |

Ventilation states depend on the sensor. Additional explicitly configured states are possible in YAML, but not as additional state rows in the editor.

```yaml
status_items:
  - entity: binary_sensor.living_room_window
    name: Window
    kind: window
    states:
      "on":
        label: Open
        icon: mdi:window-open-variant
        color: "#EF9A9A"
      "off":
        label: Closed
        icon: mdi:window-closed-variant
        color: "#A5D6A7"
```

`label`, `icon`, `color` are optional. Unspecified values use defaults; explicit `color: ""` means neutral. An entry-level fixed `icon`/`icon_color` overrides the corresponding state rule, but not failure rendering. The ventilation icon always stays fixed.

### Failure states

`unknown` shows Unbekannt; `unavailable`, `none` and empty states show Nicht verfügbar. Unrecognized states not explicitly configured show Unerwarteter Zustand with the raw value. All receive a grey main icon and red exclamation badge. Measurement kinds only display numeric values normally; invalid values are not treated as `0`. An arbitrary `error` no longer becomes green/OK. The current UI uses German messages.

## Measurement colors and color inputs

```yaml
status_items:
  - entity: sensor.living_room_temperature
    name: Temperature
    kind: temperature
    colors_enabled: true
    ranges:
      - above: null
        color: "#90CAF9"
      - above: 18
        color: "#A5D6A7"
      - above: 24
        color: "#FFE082"
      - above: 26
        color: "#FFB74D"
```

Exactly one `above: null` defines the base range. Numeric lower bounds must be unique. The highest matching bound wins regardless of order and is inclusive: 18 already matches `above: 18`. Empty colors mean neutral; `colors_enabled: false` disables colors without deleting rules. Failure states stay grey.

Without `ranges`: temperature base `#90CAF9`, from 18 `#A5D6A7`, 24 `#FFE082`, 26 `#FFB74D`, 28 `#EF9A9A`; humidity base `#90CAF9`, from 40 `#A5D6A7`, 70 `#FFE082`, 85 `#FFB74D`. Defaults assume °C and relative humidity in %. No unit conversion; adjust bounds for other units. Colors are display aids, not health/mould assessments.

Old `below`/`from`/`to` rules retain their previous order-dependent behavior. The editor shows a notice. Restoring default colors replaces these rules and removes an older fixed `icon_color` override. The only base range is protected against removal.

Color controls provide a picker and text input for CSS colors including hex, names, `rgb(...)`, `hsl(...)` and simple theme variables. Quote hex values in YAML. Empty optional fixed colors remove the override; scenes without `icon_color` use their default color.

## Appearance

All `appearance` options affect only this card. Without overrides, its existing look is preserved; `0` is valid. Colors use the existing color picker.

```yaml
appearance:
  padding: 6
  status_item_gap: 8
  device_item_gap: 10
  section_spacing: 16
  dividers:
    enabled: true
    width: 1
    color: "rgba(255,255,255,0.12)"
  background:
    mode: theme
  border:
    enabled: true
    width: 1
    color: "rgba(255,255,255,0.20)"
    radius: 18
  shadow:
    mode: soft
```

This example explicitly sets section spacing; it is not the untouched default configuration.

| Option | Meaning / default |
| --- | --- |
| `padding` | Distance from card edge, 6 px |
| `status_item_gap` | Grid gap between status items, 8 px |
| `device_item_gap` | Grid gap in device/custom sections, 10 px |
| `item_gap` | Shared YAML fallback for both grids; specific values take precedence |
| `section_spacing` | Custom free space between content sections; omission retains legacy spacing |
| `dividers.enabled`, `.width`, `.color` | Dividers: `true`, 1 px, `rgba(255,255,255,0.12)` |
| `background.mode`, `.color` | `theme` (default), `transparent`, `custom`; custom requires a color |
| `border.enabled`, `.width`, `.color`, `.radius` | Border: `true`, 1 px, `rgba(255,255,255,0.20)`, 18 px |
| `shadow.mode`, `.value` | Default `default`; see shadow presets |

Spacing and radius: 0–100 px; border/divider widths: 0–10 px. Grid gaps separate entries, not the contents of a Mushroom card; with one entry there is no second item to separate. `section_spacing` replaces legacy section/stack spacing; divider width is additional and the header stays unchanged. Empty sections produce no dividers; the last visible section has no bottom divider.

The editor defaults to retaining existing section spacing. Disabling that switch starts custom spacing at 16 px; 16 is not a measured legacy total. Standardabstände wiederherstellen resets spacing only. Darstellung übernehmen applies changes. Darstellung auf Standard zurücksetzen removes only `appearance`, retaining entities, status colors and layout. Opening the editor does not save displayed defaults.

### Shadow presets

| `shadow.mode` | CSS value |
| --- | --- |
| `default` | Existing combined Room Card shadow |
| `none` | No shadow |
| `subtle` | `0 1px 3px rgba(0, 0, 0, 0.18)` |
| `soft` | `0 4px 12px rgba(0, 0, 0, 0.22)` |
| `strong` | `0 8px 24px rgba(0, 0, 0, 0.30)` |
| `floating` | `0 12px 32px rgba(0, 0, 0, 0.35)` |
| `custom` | Your valid CSS value in `shadow.value` |

Als eigenen Schatten bearbeiten copies a preset into the editable CSS field. Example: `shadow: {mode: custom, value: "0 4px 16px rgba(0,0,0,0.25)"}`. Enter a value, not a complete CSS rule or trailing semicolon. Black shadows can be subtle on dark backgrounds; test without a border and compare `none` with `floating`. Shadows require visible surrounding space and may be clipped by parent containers. `padding` is internal space only. Transparent backgrounds do not make text/icons transparent.

## Title colors and alarms

```yaml
title_color:
  room_label: Living Room
  default: "var(--primary-text-color)"
  rules:
    - label: Main Lighting
      color: "#FFD600"
wecker:
  - entity: input_datetime.bedroom_alarm
    name: Alarm
    lichtwecker: automation.bedroom_wake_up_light
    lichtwecker_name: Wake-up light
```

The first title rule matching an on light with both labels wins; without `room_label`, the room name is used, and without a match `default` applies. Use Farbregeln übernehmen in the editor. Alarm entities require `hour` and `minute`; the wake-up automation is optional.

## Troubleshooting

- Missing card/styles: check the collection resource, Mushroom and UIX; do not load an old color extension in parallel.
- Changes missing: apply changes, reload the complete browser page, clear cache if needed.
- Color not applied: check raw state and fixed overrides; failure rendering takes precedence.
- Custom section stays last: move it individually and apply layout.
- Deleted section: remove its key from `layout.order` and `layout.sections` if necessary.
- Layout error: use known, unique section keys and 1–6 columns.
- For different spacing semantics, see the [Climate Card](freshairiq-climate-room-card.md).
