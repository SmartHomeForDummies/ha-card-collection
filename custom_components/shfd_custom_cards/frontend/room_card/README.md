# Room Card

A configurable Home Assistant room card with a visual editor.

Combine room status, lighting, scenes, switches, covers,
thermostats, media players and alarms in a single card.
Empty sections are hidden automatically.

## Requirements

Install [SHFD Custom Cards](../../../../README.md#installation)
and the following dependencies:

- [Mushroom](https://github.com/piitaya/lovelace-mushroom)
  — provides the control and status cards.
- [UIX – UI eXtension](https://github.com/Lint-Free-Technology/uix)
  — provides styling and layout support.

Follow each project's installation and setup instructions.

## Setup

### 1. Register the dashboard resource

Open **Settings → Dashboards → Resources** and add:

```text
URL: /shfd_custom_cards/room_card/raumkarte.js?v=1
Type: JavaScript Module
```

The visual editor is loaded automatically and does not require
a separate resource entry.

Reload the Home Assistant page after adding the resource.

### 2. Add the card

Edit your dashboard and select **Raumkarte** from the card picker.

Use the visual editor to configure the room and add entries.
Entries can be reordered within each section.

Alternatively, add a manual card:

```yaml
type: custom:raum-karte
raum: Living Room

status_items:
  - entity: binary_sensor.living_room_window
    name: Window
    kind: window

  - entity: sensor.living_room_temperature
    name: Temperature
    kind: temperature

lampen:
  - entity: light.living_room_ceiling
    name: Ceiling
```

Replace the example entity IDs with your own entities.

## Configuration

Configuration keys, editor labels and some status messages
currently use German names.

| Option | Description | Default |
| --- | --- | --- |
| `type` | Must be `custom:raum-karte` | Required |
| `raum` | Room title | Required |
| `anwesenheit` | Person entity for the presence indicator | Empty |
| `status_items` | Status indicators | `[]` |
| `wecker` | Alarm times and optional wake-up light controls | `[]` |
| `szenen` | Scenes | `[]` |
| `lampen` | Lights | `[]` |
| `schalter` | Switches | `[]` |
| `rolllaeden` | Covers and shutters | `[]` |
| `thermostate` | Climate entities | `[]` |
| `mediaplayer` | Media players | `[]` |

Sections appear in the order shown above. Empty sections are hidden.

Use the option names exactly as listed, including `rolllaeden`.

### Entry options

Each section contains a list of entries.

| Option | Applies to | Description |
| --- | --- | --- |
| `entity` | All sections | Entity ID |
| `name` | All sections | Display name; use `""` for a blank label |
| `kind` | Status indicators | Status type |
| `icon_color` | Scenes | Icon color; defaults to `purple` |
| `icon` | Switches | Optional icon |
| `lichtwecker` | Alarms | Optional wake-up light automation |
| `lichtwecker_name` | Alarms | Automation label; defaults to `Lichtwecker` |

Entries without an entity are hidden while editing.

### Status indicators

Supported values for `kind`:

| Value | Purpose |
| --- | --- |
| `window` | Window contact |
| `door` | Door contact |
| `motion` | Motion or occupancy |
| `smoke` | Smoke alarm |
| `lock` | Lock status |
| `temperature` | Temperature |
| `humidity` | Humidity |
| `ventilation` | Ventilation recommendation |

Window and door indicators expect `on` for open.
Motion and smoke indicators use `on` for active detection.
Temperature and humidity indicators display the entity's unit.

Ventilation colors are mapped to the following entity states:

| State | Color |
| --- | --- |
| `wait` | Yellow |
| `ventilate` | Blue |
| `ok` | Green |
| `do_not_ventilate` | Red |
| `close` | Orange |

Unrecognized ventilation states use grey.

### Presence indicator

Configure a person entity to show presence in the header:

```yaml
anwesenheit: person.example
```

Omit this option to hide the indicator.

### Room title colors

The title color is based on Home Assistant labels.

Assign a label matching the configured `raum` value to the
relevant light entities. Also assign one of these labels:

- `Hauptbeleuchtung` — main lighting
- `Ambiente Beleuchtung` — ambient lighting

The title is:

- Yellow when a matching main light is on.
- Orange when a matching ambient light is on and no matching
  main light is on.
- White otherwise.

This feature uses labels, not Home Assistant area assignments.

### Alarm controls

Alarm entities must provide `hour` and `minute` attributes.

You can optionally add a wake-up light automation:

```yaml
wecker:
  - entity: input_datetime.bedroom_alarm
    name: Alarm
    lichtwecker: automation.bedroom_wake_up_light
    lichtwecker_name: Wake-up light
```

The wake-up light control enables or disables the configured
automation. The automation itself must already exist.

## Complete example

All entity IDs below are placeholders.

```yaml
type: custom:raum-karte
raum: Living Room
anwesenheit: person.example

status_items:
  - entity: binary_sensor.living_room_window
    name: Window
    kind: window

  - entity: binary_sensor.living_room_door
    name: Door
    kind: door

  - entity: binary_sensor.living_room_smoke
    name: Smoke
    kind: smoke

  - entity: sensor.living_room_temperature
    name: Temperature
    kind: temperature

  - entity: sensor.living_room_humidity
    name: Humidity
    kind: humidity

wecker:
  - entity: input_datetime.example_alarm
    name: Alarm
    lichtwecker: automation.example_wake_up_light
    lichtwecker_name: Wake-up light

szenen:
  - entity: scene.living_room_relax
    name: Relax
    icon_color: orange

lampen:
  - entity: light.living_room_ceiling
    name: Ceiling

  - entity: light.living_room_ambient
    name: Ambient

schalter:
  - entity: switch.living_room_tv
    name: TV
    icon: mdi:television

rolllaeden:
  - entity: cover.living_room_shutter
    name: Shutter

thermostate:
  - entity: climate.living_room
    name: Heating

mediaplayer:
  - entity: media_player.living_room
    name: Media
```

## Troubleshooting

### Card is not available

Check the dashboard resource URL and ensure its type is
**JavaScript Module**.

Open the following path using your Home Assistant address:

```text
/shfd_custom_cards/room_card/raumkarte.js
```

It should return JavaScript. If it does not, check the integration
installation and Home Assistant logs.

### Missing controls or styling

Ensure Mushroom and UIX are installed and loaded.
Follow their setup instructions, then reload the browser.

### Visual editor does not load

Ensure `raumkarte-editor.js` is located next to `raumkarte.js`.
Check the browser console for import errors.

### Changes are not visible

Reload the complete Home Assistant page. If necessary, clear
the browser cache or increase the version parameter in the
dashboard resource URL.
