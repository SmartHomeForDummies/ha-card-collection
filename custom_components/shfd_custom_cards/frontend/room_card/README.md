# Room Card

A configurable Home Assistant room card with a visual editor.

Display room status and control lights, scenes, switches, covers,
thermostats and media players in a single card. Empty sections
are hidden automatically.

## Requirements

Install [SHFD Custom Cards](../../../../README.md#installation)
and the following frontend dependencies:

- [Mushroom](https://github.com/piitaya/lovelace-mushroom)
- [Card Mod](https://github.com/thomasloven/lovelace-card-mod),
  providing `custom:mod-card`
- The frontend extension providing support for `uix.style`

> The current styling uses `uix.style`. Card Mod alone does not
> provide this configuration format.
>
> Maintainer: Add the exact name and installation link of the
> extension providing `uix.style` before publishing.

Decluttering Card and dashboard-level templates are not required.

## Dashboard resource

Add the following resource under
**Settings → Dashboards → Resources**:

```text
URL: /shfd_custom_cards/room_card/raumkarte.js?v=1
Type: JavaScript Module
```

The editor is loaded automatically. Do not register
`raumkarte-editor.js` separately.

Reload the Home Assistant page after adding the resource.

## Add the card

Select **Raumkarte** in the card picker, or add a manual card:

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

The visual editor supports adding, removing and reordering
entries within each section.

## Configuration

The card type and configuration keys currently retain their
original German names. Some editor labels and status texts
are also German.

| Option | Description | Default |
| --- | --- | --- |
| `type` | Must be `custom:raum-karte` | Required |
| `raum` | Room title | Required |
| `anwesenheit` | Person entity for presence display | Empty |
| `status_items` | Status indicators | `[]` |
| `wecker` | Alarm times and optional wake-up light automations | `[]` |
| `szenen` | Scenes | `[]` |
| `lampen` | Lights | `[]` |
| `schalter` | Switches | `[]` |
| `rolllaeden` | Covers and shutters | `[]` |
| `thermostate` | Climate entities | `[]` |
| `mediaplayer` | Media players | `[]` |

The spelling `rolllaeden` matches the current implementation.

Sections appear in the order listed above, starting with status
indicators. Empty sections are omitted.

### Entry options

Each section contains a list of entries.

| Option | Description |
| --- | --- |
| `entity` | Entity ID |
| `name` | Display name |
| `kind` | Status type; used in `status_items` |
| `icon_color` | Scene icon color; defaults to `purple` |
| `icon` | Optional switch icon |
| `lichtwecker` | Optional automation entity associated with an alarm |
| `lichtwecker_name` | Wake-up light label; defaults to `Lichtwecker` |

Entries without an entity are temporarily hidden while editing.

### Status indicators

Supported values for `kind`:

| Value | Purpose |
| --- | --- |
| `window` | Window contact |
| `door` | Door contact |
| `motion` | Motion or occupancy |
| `smoke` | Smoke alarm |
| `lock` | Lock status |
| `temperature` | Temperature with entity unit |
| `humidity` | Humidity with entity unit |
| `ventilation` | Ventilation recommendation |

Window and door indicators expect `on` for open.
Motion and smoke indicators use `on` for active detection.

The ventilation indicator recognizes these states for its colors:

| State | Color |
| --- | --- |
| `wait` | Yellow |
| `ventilate` | Blue |
| `ok` | Green |
| `do_not_ventilate` | Red |
| `close` | Orange |

Other ventilation states use grey.

### Presence

Set a person entity to display presence in the header:

```yaml
anwesenheit: person.example
```

Omit this option to hide the presence indicator.

### Room title colors

The title color uses Home Assistant labels, not area assignments.

Assign a label matching the configured `raum` value to the
relevant lights. Also assign one of these lighting labels:

- `Hauptbeleuchtung` — main lighting
- `Ambiente Beleuchtung` — ambient lighting

The title becomes:

- Yellow when a matching main light is on.
- Orange when a matching ambient light is on and no matching
  main light is on.
- White otherwise.

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

wecker:
  - entity: input_datetime.example_alarm
    name: Alarm
    lichtwecker: automation.example_wake_up_light
    lichtwecker_name: Wake-up light
```

The alarm entity must provide `hour` and `minute` attributes.
The optional wake-up light control toggles the configured
automation; it does not create a wake-up routine.

## Troubleshooting

### Custom element does not exist: `raum-karte`

Check the dashboard resource URL and ensure its type is
**JavaScript Module**.

Open the following path using your Home Assistant address:

```text
/shfd_custom_cards/room_card/raumkarte.js
```

It should return JavaScript. If necessary, check the browser
console for errors and reload with the cache disabled.

### Missing controls or styling

Verify that all frontend dependencies are installed and loaded.
They are not bundled with this card.

### Visual editor does not load

Ensure `raumkarte-editor.js` is located next to `raumkarte.js`.
Check the browser console for import errors.

### Decluttering template error

An older wrapper version may still be loaded.
