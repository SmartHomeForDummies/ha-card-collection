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
| `title_color` | Label-based title color settings | See below |
| `status_items` | Status indicators | `[]` |
| `wecker` | Alarm times and optional wake-up light controls | `[]` |
| `szenen` | Scenes | `[]` |
| `lampen` | Lights | `[]` |
| `schalter` | Switches | `[]` |
| `rolllaeden` | Covers and shutters | `[]` |
| `thermostate` | Climate entities | `[]` |
| `mediaplayer` | Media players | `[]` |

Content sections appear in the order shown above.

Use the option names exactly as listed, including `rolllaeden`.

### Entry options

Each section contains a list of entries.

| Option | Applies to | Description |
| --- | --- | --- |
| `entity` | All sections | Entity ID |
| `name` | All sections | Display name |
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

The room title can change color when matching lights are on.
Configure lighting labels, colors and rule priority in the
visual editor or YAML.

This feature uses labels assigned to light entities, not
Home Assistant area assignments.

#### Visual editor

Open **Titelfarben** in the visual editor to configure:

- Room label: limits the rules to lights with this label.
  Leave it empty to use the room title.
- Default color: used when no rule matches.
  Select a color with the color picker or enable
  **Textfarbe des Themes verwenden** to use the theme's text color.
- Color rules: each rule specifies a lighting label and a color.
  Move rules up or down to change their priority.

Click **Farbregeln übernehmen** to apply your changes, then
save the card.

Apply changes in this section before editing other sections.
Unapplied changes may be lost when the editor is rebuilt.

#### Matching and priority

A light must have both:

1. The configured room label.
2. The lighting label specified by the rule.

A rule matches when at least one of these lights is on.
The first matching rule determines the title color.

If no rule matches, the default color is used.

#### YAML configuration

```yaml
title_color:
  room_label: Living Room
  default: "var(--primary-text-color)"
  rules:
    - label: Main Lighting
      color: "#FFD600"

    - label: Ambient Lighting
      color: "#FF9800"
```

| Option | Description | Default |
| --- | --- | --- |
| `room_label` | Label identifying the room's lights | Value of `raum` |
| `default` | Title color when no rule matches | `var(--primary-text-color)` |
| `rules` | Ordered list of label and color rules | `[]` |

If the entire `title_color` option is omitted, the card uses the
legacy default settings described below.

Each rule requires:

| Option | Description |
| --- | --- |
| `label` | Lighting label to match |
| `color` | Title color when the rule matches |

For the example above, assign these labels directly to the
light entities:

| Light entity | Labels |
| --- | --- |
| `light.living_room_ceiling` | `Living Room`, `Main Lighting` |
| `light.living_room_ambient` | `Living Room`, `Ambient Lighting` |

When both lighting groups are on, `Main Lighting` wins because
its rule comes first.

The displayed room title and the room label can differ:

```yaml
raum: Lounge

title_color:
  room_label: Living Room
  default: "var(--primary-text-color)"
  rules:
    - label: Main Lighting
      color: "#FFD600"
```

#### Supported colors

Use the color picker or enter:

- A hex color, such as `"#FFD600"`.
- A CSS color name, such as `orange`.
- A CSS variable, such as `"var(--primary-text-color)"`.

Quote hex colors in YAML.

RGB and HSL functions, and CSS variables with fallback arguments,
are not currently supported by the configuration validation.

The color picker selects solid colors. Selecting a color replaces
any color name or CSS variable in that field with a fixed hex value.

#### Disable dynamic colors

Use an empty rule list to always display the default color:

```yaml
title_color:
  default: "var(--primary-text-color)"
  rules: []
```

#### Default settings

If `title_color` is omitted, the card uses:

- The value of `raum` as the room label.
- `Hauptbeleuchtung` with yellow (`#FFD600`).
- `Ambiente Beleuchtung` with orange (`#FF9800`).
- White (`#FFFFFF`) when neither rule matches.

In the visual editor, **Auf Standard zurücksetzen** removes
the custom `title_color` configuration and restores these settings.

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
title_color:
  room_label: Living Room
  default: "var(--primary-text-color)"
  rules:
    - label: Main Lighting
      color: "#FFD600"

    - label: Ambient Lighting
      color: "#FF9800"

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
