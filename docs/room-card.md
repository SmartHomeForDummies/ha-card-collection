# SHFD Room Card

[English](room-card.md) · [Deutsch](de/room-card.md)

A configurable Home Assistant room card with a visual editor. Combine room status, lighting, scenes, switches, covers, thermostats, media players, alarms and custom sections. Empty sections and entries without an entity are hidden.

![SHFD Room Card with status indicators and room controls](images/room-card.png)

## Installation

Install [Mushroom](https://github.com/piitaya/lovelace-mushroom) and [UIX](https://github.com/Lint-Free-Technology/uix). Register the collection entry point as a JavaScript Module resource:

```text
/hacsfiles/ha-card-collection/ha-card-collection.js
```

For a manual installation:

```text
/local/ha-card-collection/ha-card-collection.js
```

Do not register `raumkarte.js` separately with this installation. The visual editor is included; no separate editor or color-extension file is required. Reload the complete browser page after resource changes.

## Add the card

Select **SHFD Raumkarte** in the card picker or use YAML:

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

## Configuration

| Option | Description |
| --- | --- |
| `raum` | Room title; required |
| `anwesenheit` | Optional person entity for the presence indicator |
| `title_color` | Dynamic title colors |
| `layout` | Section order, columns and visibility |
| `status_items` | Status indicators and measurements |
| `wecker` | Alarms and optional wake-up light automations |
| `szenen` | Scenes |
| `lampen` | Lights |
| `schalter` | Switches |
| `rolllaeden` | Covers and shutters |
| `thermostate` | Climate entities |
| `mediaplayer` | Media players |
| `custom_sections` | Custom sections with freely selected entities |

An entry needs an `entity` to be displayed. Empty entries are allowed while editing. Most sections support an optional `name`. YAML keys remain unchanged in both documentation languages.

## Custom sections

```yaml
custom_sections:
  - key: sensors
    title: Sensors
    domain: sensor
    columns: 3
    items:
      - entity: sensor.living_room_temperature
        name: Temperature
        icon: mdi:thermometer
        icon_color: "#FFB74D"
```

| Option | Description |
| --- | --- |
| `key` | Unique, non-empty section key; must not match a built-in section |
| `title` | Required name for the editor and layout; not a dashboard heading |
| `domain` | Optional entity-selector domain filter; omit or use `""` for Any |
| `columns` | Default column count from 1 to 6; defaults to 3 |
| `visible` | Default visibility; defaults to `true` |
| `items` | Entries with `entity` and optional `name`, `icon`, `icon_color` |

Custom sections have no section heading or section icon, matching the built-in sections. Each custom section can be placed individually between built-in sections in the layout.

The domain filter only limits editor suggestions: `light` offers lights, `scene` scenes and `sensor` sensors. Changing the filter does not delete existing entries. The filter changes neither rendering nor tap behavior: custom entries use generic Mushroom entity cards and open more-info when tapped. Use built-in sections for specialized light, scene or cover controls.

## Layout

The header stays first. Built-in keys are `status_items`, `wecker`, `szenen`, `lampen`, `schalter`, `rolllaeden`, `thermostate` and `mediaplayer`, plus the `key` values of custom sections.

```yaml
layout:
  order:
    - status_items
    - sensors
    - lampen
    - szenen
  sections:
    sensors:
      columns: 2
    wecker:
      visible: false
```

Define `sensors` under `custom_sections` first. Sections omitted from `order` are appended in default order. Each key may appear only once. `layout.sections.<key>.columns` and `.visible` override section defaults. Hidden sections retain their entries; empty sections remain hidden even with `visible: true`.

In the editor: **Layout → move up / move down → apply layout**. Save title-color changes with the title-color apply button; status colors and measurement ranges update the configuration directly. The current editor uses German labels, including Layout übernehmen and Farbregeln übernehmen.

## Status types and states

| `kind` | Technical states / values | Display |
| --- | --- | --- |
| `window` | `on` = open, `off` = closed | Icon and color per state |
| `door` | `on` = open, `off` = closed | Icon and color per state |
| `motion` | `on` = detected, `off` = no motion / absent | Icon and color per state |
| `smoke` | `on` = alarm, `off` = OK | Icon and color per state |
| `lock` | `locked`, `unlocked`, `locking`, `unlocking`, `jammed`, `open`, `opening` | Icon and color per state |
| `ventilation` | `wait`, `ventilate`, `ok`, `do_not_ventilate`, `close` | Fixed icon and color per state |
| `temperature` | Numeric measurement | Fixed icon and value-based color |
| `humidity` | Numeric measurement | Fixed icon and value-based color |

The ventilation states are the keys provided by this card; actual states depend on the sensor used. Additional states can be configured under `states` in YAML, but are not available as additional rows in the visual editor. The ventilation icon remains fixed across states.

### State-based icons and colors

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

`label`, `icon` and `color` are optional. Automatic defaults remain in effect without overrides. An explicit `color: ""` means neutral. An entry-level fixed `icon` or `icon_color` takes precedence over the corresponding state rules; remove a fixed override to use state rules. Error-state rendering still overrides custom colors.

### Unknown and unavailable

All entries under `status_items` automatically use:

- `unknown`: the text Unbekannt (Unknown).
- `unavailable`: the text Nicht verfügbar (Unavailable).
- Both: a grey main icon and a red exclamation badge (`mdi:exclamation-thick`).

Invalid nonnumeric measurements are not treated as `0` by measurement color rules. The warning badge identifies `unknown` and `unavailable`; an arbitrary other invalid measurement does not automatically receive a badge.

## Measurement colors

Temperature and humidity use a base range and inclusive lower bounds, following the Climate Card model:

```yaml
status_items:
  - entity: sensor.living_room_temperature
    name: Temperature
    kind: temperature
    icon: mdi:thermometer
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

- Exactly one `above: null` defines the base range below all matching lower bounds.
- Each numeric lower bound must be unique.
- The highest matching lower bound wins regardless of list order. `above: 18` applies at exactly 18.
- In this example: blue below 18, green from 18, yellow from 24, orange from 26.
- `color: ""` means neutral.
- `colors_enabled: false` disables measurement colors without deleting rules; unknown/unavailable values remain grey.

Without `ranges`, these default colors apply:

| Measurement | Base range | Additional lower bounds |
| --- | --- | --- |
| Temperature | `#90CAF9` | 18: `#A5D6A7`, 24: `#FFE082`, 26: `#FFB74D`, 28: `#EF9A9A` |
| Humidity | `#90CAF9` | 40: `#A5D6A7`, 70: `#FFE082`, 85: `#FFB74D` |

Bounds are compared with the numeric sensor value; no unit conversion is performed. Temperature defaults assume °C; humidity defaults assume relative humidity in %. Adjust bounds for other units. Colors are display aids, not health or mould assessments.

The editor supports adding ranges, editing lower bounds and colors, and restoring defaults. The only base range cannot be removed. Older YAML rules using `below`, `from` and `to` remain effective; their previous order still matters. The editor shows a notice. Restoring default colors replaces them with the new schema and removes an older fixed `icon_color` override.

## Consistent color controls

Title colors, status colors, measurement ranges, scenes and custom entries provide a native color picker alongside a text input. Enter CSS colors such as hex values, names, `rgb(...)`, `hsl(...)` and simple theme variables. Always quote hex values in YAML.

Empty colors have field-specific meanings: empty state-rule and measurement-range colors mean neutral; empty optional fixed overrides remove the override. Scenes fall back to their default color without `icon_color`.

## Title colors

```yaml
title_color:
  room_label: Living Room
  default: "var(--primary-text-color)"
  rules:
    - label: Main Lighting
      color: "#FFD600"
```

The first rule matching an on light with both the room label and the rule label wins. The room name is used when `room_label` is omitted. `default` applies when no rule matches.

## Alarms

Alarm entities must provide `hour` and `minute` attributes:

```yaml
wecker:
  - entity: input_datetime.bedroom_alarm
    name: Alarm
    lichtwecker: automation.bedroom_wake_up_light
    lichtwecker_name: Wake-up light
```

## Troubleshooting

- **Card missing:** Register the collection entry point as a JavaScript Module.
- **No styling or controls:** Check Mushroom and UIX.
- **Outdated editor or colors:** Reload the complete browser page and clear the cache if necessary. Do not load an old additional status-color extension in parallel.
- **State color does not apply:** Check the technical state and any fixed `icon_color` override.
- **Custom section stays at the bottom:** Move the individual section in Layout and apply the layout.
- **Layout error after manually deleting a section:** Remove its key from both `layout.order` and `layout.sections`.
- **Invalid color ranges:** Use exactly one base range and unique numeric lower bounds, or restore defaults.
- **Layout error:** Use only known, unique keys and 1 to 6 columns.
