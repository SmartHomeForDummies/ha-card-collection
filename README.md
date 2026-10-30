# SHFD Custom Cards

A collection of custom Home Assistant dashboard cards by
SmartHome for Dummies (SHFD).

The cards are installed as a dashboard package.

## Preview

![Room Card with status indicators and room controls](docs/images/room-card.png)

![FreshAirIQ Room Card with room climate, recommendation and outdoor values](docs/images/climate-card.png)

## Available cards

| Card | Documentation |
| --- | --- |
| Room Card | [English](docs/room-card.md) · [Deutsch](docs/de/room-card.md) |
| FreshAirIQ Room Card | [English](docs/freshairiq-climate-room-card.md) · [Deutsch](docs/de/freshairiq-climate-room-card.md) |

## Requirements

The Room Card requires the following frontend dependencies:

- Mushroom
- UIX

The FreshAirIQ Room Card also requires the
[FreshAirIQ integration](https://github.com/rupascha/freshairiq).
It reads room data from the FreshAirIQ action sensor.

Install and configure these dependencies before using the cards.

## Installation with HACS

1. Open HACS in Home Assistant.
2. Open the menu and select **Custom repositories**.
3. Add this repository:

   ```text
   https://github.com/SmartHomeForDummies/ha-card-collection
   ```

4. Select **Dashboard** as the repository type.
5. Add the repository and download **SHFD Custom Cards**.

### Dashboard resource

After downloading, check whether the following resource is
registered under **Settings → Dashboards → Resources**:

```text
/hacsfiles/ha-card-collection/ha-card-collection.js
```

The resource type must be **JavaScript Module**.

If the resource is missing, add it manually.
Do not add a duplicate if it is already registered.
Keep any `?hacstag=...` parameter added by HACS.

Only the collection entry point needs to be registered.
Do not add `raumkarte.js`,
`freshairiq-climate-room-card.js` or the picker modules as separate
dashboard resources.

Reload the browser page after installation.

## Manual installation

1. Create this directory in your Home Assistant configuration:

   ```text
   www/ha-card-collection/
   ```

2. Copy all JavaScript files from this repository's `dist/`
   directory into it. Keep the files together without renaming them.

3. Add the following dashboard resource, replacing `RELEASE` with
   the installed release tag:

   ```text
   /local/ha-card-collection/ha-card-collection.js?v=RELEASE
   ```

4. Select **JavaScript Module** as the resource type.
5. Reload the browser page.

## Add a Room Card

Select **SHFD Raumkarte** in the card picker, or add a manual card:

```yaml
type: custom:raum-karte
raum: Living Room
```

Use the visual editor to configure the card's sections,
entities, layout and title colors. Empty sections are hidden.

See the [English documentation](docs/room-card.md)
or the [German documentation](docs/de/room-card.md) for entry options
and YAML examples. Configuration keys and editor labels use German names.

## Add a FreshAirIQ Room Card

Select **SHFD FreshAirIQ Raumkarte** in the card picker, or add a
manual card:

```yaml
type: custom:shfd-freshairiq-room-card
rooms:
  - recommendation_entity: sensor.freshairiq_wohnzimmer_aktion
```

The FreshAirIQ integration is required. Replace the action sensor
with the FreshAirIQ action sensor for your room.

See the [English documentation](docs/freshairiq-climate-room-card.md)
or the [German documentation](docs/de/freshairiq-climate-room-card.md)
for room options, outdoor values, weather integration and color settings.

## Layout

Open **Layout** below the room name and presence fields, above
**Titelfarben**. For each section, choose 1–6 columns, toggle
**Anzeigen**, or use **Nach oben** / **Nach unten** to change its position.

Click **Layout übernehmen**, then save the card. Apply layout changes
before editing other sections; unapplied changes can be lost.
The move buttons inside the entity sections only reorder entries
within that section.

Without a custom layout, sections use the following order and columns:

| Section key | Section | Columns |
| --- | --- | --- |
| `status_items` | Status | 3 |
| `wecker` | Alarms | 1 |
| `szenen` | Scenes | 3 |
| `lampen` | Lights | 2 |
| `schalter` | Switches | 3 |
| `rolllaeden` | Covers | 1 |
| `thermostate` | Climate | 2 |
| `mediaplayer` | Media players | 1 |

The header stays first. Hidden sections keep their entries, and
empty sections remain hidden. **Auf Standard zurücksetzen** in the
Layout section removes `layout` and restores these defaults.

Example YAML, added to your card configuration:

```yaml
layout:
  order:
    - lampen
    - status_items
    - szenen
  sections:
    lampen:
      columns: 1
    status_items:
      visible: false
```

Sections omitted from `order` are appended in default order.
Omitted settings use their defaults; sections are visible by default.

## Status indicators

Each `status_items` entry needs an `entity`. Use one of these exact
`kind` values: `window`, `door`, `motion`, `smoke`, `lock`,
`temperature`, `humidity`, or `ventilation`.

```yaml
status_items:
  - entity: binary_sensor.living_room_window
    name: Window
    kind: window
```

Window and door contacts expect `on` for open. Motion and smoke
indicators use `on` for detection. Temperature and humidity show
the entity's unit. Ventilation states are `wait`, `ventilate`, `ok`,
`do_not_ventilate`, and `close`; other values use grey.

## Title colors

Open **Titelfarben** to configure colors and rule priority.
A light must have both the room label and the rule's lighting label
assigned directly to its entity. Area assignments alone do not match.
The first rule with at least one matching light on wins;
otherwise the default color is used.

```yaml
title_color:
  room_label: Living Room
  default: "var(--primary-text-color)"
  rules:
    - label: Main Lighting
      color: "#FFD600"
```

For this example, assign both `Living Room` and `Main Lighting`
to the relevant light entities. If `room_label` is omitted, the value
of `raum` is used. Colors may be hex values, CSS names or simple
CSS variables; quote hex values in YAML.

Click **Farbregeln übernehmen**, then save the card. Use `rules: []`
to disable dynamic colors. When `title_color` is configured but
`default` is omitted, the theme text color is used.

Without `title_color`, the room label is the value of `raum`,
`Hauptbeleuchtung` has priority with yellow (`#FFD600`),
`Ambiente Beleuchtung` uses orange (`#FF9800`), and the fallback is
white (`#FFFFFF`). **Auf Standard zurücksetzen** in Titelfarben
restores this behavior.

## Updates

For HACS installations, download updates through HACS. The entry point
passes its `hacstag` value to the card and editor imports so they use
versioned URLs. No manual import-version changes are needed when
HACS changes this parameter.

For manual installations, replace all JavaScript files with files
from the same release and update `?v=RELEASE` on the dashboard resource.
This value is also passed to the card and editor imports.

Reload the complete browser page after updating, not just the editor.
If an old version remains visible, check for duplicate resources and
cached responses from your browser or reverse proxy/CDN.

## Troubleshooting

- **Card is missing:** Check the entry-point resource URL and its
  JavaScript Module type. Ensure all JavaScript files were installed.
- **No styling or controls:** Ensure Mushroom and UIX are installed
  and loaded.
- **Editor does not open:** Ensure `raumkarte.js` was installed and
  reload the complete browser page.
- **FreshAirIQ card has no room data:** Install and configure the
  [FreshAirIQ integration](https://github.com/rupascha/freshairiq),
  then select a FreshAirIQ action sensor as `recommendation_entity`.
- **Layout changes do not appear:** Apply the layout, save the card,
  and reload the page. Check for old resource entries or cached imports.
- **Layout error:** Use known section keys, no duplicates in `order`,
  integer columns from 1 to 6, and boolean `visible` values.
