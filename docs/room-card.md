# SHFD Room Card

[English](room-card.md) · [Deutsch](de/room-card.md)

A configurable Home Assistant room card with a visual editor.

Combine room status, lighting, scenes, switches, covers, thermostats,
media players and alarms in one card. Empty sections are hidden.

![SHFD Room Card with status indicators and room controls](images/room-card.png)

## Installation

Install [Mushroom](https://github.com/piitaya/lovelace-mushroom) and
[UIX](https://github.com/Lint-Free-Technology/uix), then register the
collection entry point as a JavaScript Module resource:

```text
/hacsfiles/ha-card-collection/ha-card-collection.js
```

For a manual installation, use:

```text
/local/ha-card-collection/ha-card-collection.js
```

Do not register `raumkarte.js` or `raumkarte-editor.js` separately.
Reload Home Assistant after changing resources.

## Add the card

Select **SHFD Raumkarte** in the card picker, or add it in YAML:

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
| `title_color` | Optional dynamic title color rules |
| `layout` | Optional section order, columns and visibility |
| `status_items` | Window, door, motion, smoke, lock, temperature, humidity and ventilation indicators |
| `wecker` | Alarm times and optional wake-up light automations |
| `szenen` | Scenes |
| `lampen` | Lights |
| `schalter` | Switches |
| `rolllaeden` | Covers and shutters |
| `thermostate` | Climate entities |
| `mediaplayer` | Media players |

Each section entry requires an `entity`. Most sections also support an
optional `name`. Entries without an entity are hidden.

## Layout

Use `layout` to change the order, column count and visibility of
content sections. The header is always shown first.

```yaml
layout:
  order:
    - lampen
    - status_items
    - szenen

  sections:
    lampen:
      columns: 2

    status_items:
      columns: 4

    wecker:
      visible: false
```

| Option | Description |
| --- | --- |
| `order` | Ordered list of section keys; omitted sections keep their default order |
| `sections.<key>.columns` | Grid columns from 1 to 6 |
| `sections.<key>.visible` | Set to `false` to hide a section |

Available section keys are `status_items`, `wecker`, `szenen`,
`lampen`, `schalter`, `rolllaeden`, `thermostate` and `mediaplayer`.

Hidden sections keep their configured entries. Empty sections remain
hidden even when `visible` is `true`.

## Title colors

The title color can change when lights with matching labels are on:

```yaml
title_color:
  room_label: Living Room
  default: "var(--primary-text-color)"
  rules:
    - label: Main Lighting
      color: "#FFD600"
```

The first matching rule wins. Supported colors are hex values, CSS
color names and simple CSS variables.

## Alarms

Alarm entities must provide `hour` and `minute` attributes. Optionally
add a wake-up light automation:

```yaml
wecker:
  - entity: input_datetime.bedroom_alarm
    name: Alarm
    lichtwecker: automation.bedroom_wake_up_light
    lichtwecker_name: Wake-up light
```

## Troubleshooting

- **Card is missing:** Check that the collection entry point is registered as a JavaScript Module.
- **No styling or controls:** Ensure Mushroom and UIX are installed and loaded.
- **Editor does not open:** Keep `raumkarte-editor.js` next to `raumkarte.js`.
- **Changes do not appear:** Reload the complete Home Assistant page and clear the browser cache if needed.
- **Layout error:** Check that `layout.order` contains no unknown or duplicate section keys and that `columns` is between 1 and 6.
