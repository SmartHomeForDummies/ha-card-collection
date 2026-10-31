# SHFD FreshAirIQ Room Card

[English](freshairiq-climate-room-card.md) · [Deutsch](de/freshairiq-climate-room-card.md)

Room climate, ventilation recommendations, mould risk and optional outdoor values with an integrated editor.

![FreshAirIQ Climate Card](images/climate-card.png)

## Getting started and requirements

Automatic data extraction uses the [FreshAirIQ integration](https://github.com/rupascha/freshairiq) and its action sensor's `freshairiq_room_payload` attribute. Individual readings can be overridden with dedicated sensors. The Climate Card renders its own tiles; for the collection including the regular Room Card, also see its [installation instructions](room-card.md#installation-and-getting-started).

Load the collection entry point as a JavaScript Module: `/hacsfiles/ha-card-collection/ha-card-collection.js`, or manually `/local/ha-card-collection/ha-card-collection.js`. Register no extra editor/appearance file. Do not register a second copy of the Climate Card alongside the collection. Select SHFD FreshAirIQ Raumkarte or use:

```yaml
type: custom:shfd-freshairiq-room-card
title: Room climate
rooms:
  - recommendation_entity: sensor.freshairiq_living_room_action
```

Indoor rows show recommendation, absolute humidity, temperature and mould risk. Replace the sample ID with your action sensor. YAML keys are identical in both languages. The current editor uses German labels; the paths below intentionally quote those actual labels.

## Editor structure and live preview

The editor has five collapsible top-level sections:

| Section in the editor | Purpose |
| --- | --- |
| Kartentitel | Optional title, title font size and color |
| Innenräume | Defaults for all indoor rooms, action sensors and per-room overrides |
| Außenbereich | Outdoor heading, column captions, sensors and weather |
| Aussehen | Tile typography/padding, neutral tint, spacing, dividers, card surface, border and shadows |
| Messwertfarben | State colors and numeric color ranges |

Collapsed headings show summaries such as room count or custom settings. Room sections use the configured/payload room name where available and indicate whether they inherit defaults or have local display settings.

Valid changes update the preview without an additional appearance-apply button. Valid numeric appearance values and colors update while editing. Ordinary text fields, entity IDs and numeric color-range bounds are committed when the input is completed, for example when leaving the field. Switches and dropdowns update immediately. Permanently save the card with Home Assistant's **Speichern** button; preview updates alone do not save the dashboard.

Invalid or incomplete numeric, color and custom-shadow inputs show feedback beside the field and do not replace the last valid preview value. Correct the input or use its reset action. A missing/unavailable entity can show an informational warning without removing the assignment. Opening the editor does not create overrides or persist displayed defaults.

### Automatic values and individual resets

- **Automatisch** removes the relevant numeric override and restores the responsive/theme/default behavior. Other settings remain unchanged. An empty numeric field has the same effect.
- **Automatisch** on a theme-color field restores its automatic color. For a required custom background/shadow, the reset also selects the corresponding theme/default mode so the configuration remains valid.
- **Standard** on a state color removes the explicit override and restores automatic color resolution, including any applicable legacy color configuration.
- **Neutral** clears a color where an empty color means a neutrally tinted tile; this is different from restoring a default state color.
- Text/entity fields offer a clear/reset action where appropriate. Clearing the card title hides the title row; it does not create an automatic replacement title.

Disabled dependent controls retain stored values. Reset buttons explicitly name their scope. **Eigene Anzeigeeinstellungen entfernen** affects one room's display overrides, not its sensors/name/icon or the global defaults. **Gesamtes Aussehen zurücksetzen** removes `appearance` and `neutral_tint_strength`, but leaves rooms, sensors, captions, detail settings and measurement-color rules intact.

## Rooms and general options

| Option | Meaning / default |
| --- | --- |
| `rooms` | Indoor room list; assign an action sensor under `recommendation_entity` per room |
| `title` | Optional card heading; omit it or use `title: ""` to remove the title row and its own padding |
| `title_font_size` | Default 20 px; editor accepts whole numbers from 10 to 72; independent of tile font size |
| `title_color` | Optional CSS title color; otherwise theme |
| `neutral_tint_strength` | Neutral tile tint 0–100%, default 12; 0 is transparent |
| `show_header` | Indoor column captions only, default `true` |
| `show_room_heading` | Indoor room icon/name headings, default `true`; not inherited by the outdoor section |
| `details_label_mode` | Indoor details disclosure label, default `auto`; modes below |
| `column_labels` | Custom indoor captions; missing/blank text uses defaults |
| `show_details` | Global indoor details visibility, default `true` |
| `hide_missing_details` | Hide missing detail values by default (`true`); `false` displays placeholders |
| `detail_fields` | Global indoor detail-field list; can be replaced per room |
| `appearance` | Appearance of this card instance only |

Room options: `recommendation_entity`, optional `name`, `icon`, `temperature_entity`, `absolute_humidity_entity`, `mould_entity`, `humidity_entity`. Name/icon and indoor readings come from the payload unless overridden. Dedicated sensors replace the corresponding payload values. Each room also supports `show_room_heading`, `details_label_mode`, `show_details`, `hide_missing_details` and `detail_fields`.

Additional measurement points under `children` remain supported through YAML. Without their own display/detail overrides they inherit the card-level defaults, not the parent room's individual overrides. Reordering rooms keeps their configuration together.

Editor paths: **Kartentitel** for the card title; **Innenräume → [room]** for the action sensor, **Name und Icon anpassen**, **Messwertsensoren ersetzen** and **Von den Vorgaben abweichen**.

## Global and per-room details

Editor path for defaults: **Innenräume → Vorgaben für alle Innenräume → Aufklappbare Raumdetails**. Defaults apply unless a room overrides the corresponding setting.

| Room option | Behavior |
| --- | --- |
| `show_details` omitted | Inherit global visibility |
| `show_details: true` | Enable details even if globally disabled |
| `show_details: false` | Disable this room's details |
| `hide_missing_details` omitted | Inherit global missing-value handling |
| `hide_missing_details: true` / `false` | Hide missing values / display placeholders locally |
| `detail_fields` omitted | Dynamically inherit the global field selection |
| `detail_fields: [...]` | Replace the global list completely; no merging |
| `detail_fields: []` | Explicitly select no fields; no collapsible details section |

```yaml
show_details: true
hide_missing_details: true
detail_fields:
  - reason
  - humidity
  - delta_g_m3
rooms:
  - recommendation_entity: sensor.freshairiq_living_room_action
    name: Living Room
  - recommendation_entity: sensor.freshairiq_bathroom_action
    name: Bathroom
    detail_fields:
      - reason
      - humidity
      - surface_rh
      - moisture_source_message
    hide_missing_details: false
  - recommendation_entity: sensor.freshairiq_basement_action
    name: Basement
    show_details: false
```

Living Room follows global changes. Bathroom has its own fields and placeholders but inherits visibility. Basement has no details. Even when enabled, the section is omitted if no displayable fields remain.

Per-room path: **Innenräume → [room] → Von den Vorgaben abweichen**. Inherited choices show the current effective default. Selecting **Eigene Auswahl** copies the current global field list; later global changes do not modify that copy. The list can be reset, select all fields or be cleared.

**Eigene Anzeigeeinstellungen entfernen** removes the room's five overrides: `show_room_heading`, `details_label_mode`, `show_details`, `hide_missing_details`, `detail_fields`. Sensor assignments, name/icon, child points and card-level defaults remain intact.

Default fields without a global/local list: `reason`, `humidity`, `delta_g_m3`, `surface_rh`, `opening_state`, `measurement_frame_reason`. Zero values remain visible. Session fields require active ventilation; CO₂ requires an available measurement. These conditions still apply with placeholders enabled. Outdoor weather details are independent.

## Room heading and details label

The room heading contains an indoor room's icon and name. It can be shown/hidden globally and per room. Configure global visibility under **Innenräume → Vorgaben für alle Innenräume → Überschriften und Beschriftungen**; the disclosure text is under **Aufklappbare Raumdetails → Text zum Aufklappen**.

| `details_label_mode` | Disclosure text when details are present |
| --- | --- |
| `auto` | `Details` with a visible room heading, otherwise the room name |
| `room_name` | Room name |
| `details` | `Details` |
| `auto_hide_empty` | Same text as `auto`; additionally omits the fallback name row when no details are displayable and the room heading is hidden |

With the first three modes, hiding the heading while no details remain still leaves a narrow, noninteractive room-name row. `auto_hide_empty` removes that fallback; it does not hide an explicitly enabled heading and does not remove existing details.

```yaml
show_room_heading: false
details_label_mode: auto_hide_empty
rooms:
  - recommendation_entity: sensor.freshairiq_living_room_action
    name: Living Room
  - recommendation_entity: sensor.freshairiq_bathroom_action
    name: Bathroom
    show_room_heading: true
```

The configured room name takes precedence over the payload name; without either, the fallback is `Raum`. To remove an indoor name completely, hide its heading and use `auto_hide_empty` with no displayable details, for example `show_details: false` or `detail_fields: []`. If details remain, the name remains their disclosure label in automatic compact mode.

## Indoor and outdoor column headings

Visibility is independent: `show_header` applies indoors; `outdoor.show_header` outdoors. Both default to `true`. Hiding captions does not hide the room/outdoor heading, readings or weather details.

```yaml
show_header: true
column_labels:
  recommendation: Ventilation
  absolute_humidity: Abs. humidity
  temperature: Room temperature
  mould: Mould risk
outdoor:
  show_header: true
  column_labels:
    humidity: Humidity
    absolute_humidity: Abs. humidity
    temperature: Outdoor temperature
    dew_point: Dew point
```

| Location | Allowed keys | Default captions |
| --- | --- | --- |
| `column_labels` | `recommendation`, `absolute_humidity`, `temperature`, `mould` | Empfehlung, Abs. Feuchte, Temperatur, Schimmelrisiko |
| `outdoor.column_labels` | `humidity`, `absolute_humidity`, `temperature`, `dew_point` | Relative Feuchte, Abs. Feuchte, Temperatur, Taupunkt |

Missing, empty or whitespace-only text uses defaults. Captions change neither sensors, column order nor colors, and also appear in tile tooltips and accessible labels.

Indoor path: **Innenräume → Vorgaben für alle Innenräume → Überschriften und Beschriftungen → Spaltenbeschriftungen bearbeiten**. Outdoor path: **Außenbereich → Messwerte und Spaltenbeschriftungen → [column]**; each group pairs its sensor and caption. **Standardbeschriftungen verwenden** resets text only. Captions remain editable while hidden.

## Outdoor values and weather

```yaml
outdoor:
  name: Outdoor
  icon: mdi:weather-partly-cloudy
  show_room_heading: false
  show_header: true
  humidity_entity: sensor.outdoor_humidity
  absolute_humidity_entity: sensor.outdoor_absolute_humidity
  temperature_entity: sensor.outdoor_temperature
  dew_point_entity: sensor.outdoor_dew_point
  column_labels:
    temperature: Outdoor temperature
  weather_entity: weather.home
  show_weather: true
  show_forecast: true
  forecast_type: daily
```

| Outdoor option | Meaning |
| --- | --- |
| `show_room_heading` | Outdoor icon/name heading; default `true`, independent of the global indoor setting |
| `show_header` | Outdoor column captions; default `true` |
| `name`, `icon` | Custom heading text/icon; without a name, `Draußen` is used |
| `weather_entity` | Optional weather entity for collapsible weather details |
| `show_weather`, `show_forecast` | Both default to `true` |
| `forecast_type` | `daily`, `hourly`, `twice_daily`; integration support required |

Editor: **Außenbereich → Überschrift und Beschriftungen**. **Außenüberschrift mit Icon anzeigen** affects only name/icon; hiding it leaves no replacement name row. Readings, column captions and weather details remain independent. Names/icons can still be edited while hidden.

All outdoor sensors are optional; missing/unavailable values display `–`. No dew point is calculated. Use `dew_point_entity`, not `dewpoint_entity`.

Weather path: **Außenbereich → Wetter**. A weather entity is required. The forecast card loads when outdoor details open, independently of indoor `show_details`. Disabled controls retain their stored values.

## Tile font size and automatic height

Editor: **Aussehen → Wertekacheln**, with separate **Innenwerte** and **Außenwerte** controls.

```yaml
appearance:
  indoor_tile:
    font_size: 13
    padding_vertical: 6
  outdoor_tile:
    font_size: 13
    padding_vertical: 6
```

| Option | Meaning | Allowed values |
| --- | --- | --- |
| `appearance.indoor_tile.font_size` | Indoor tile text size | 8–48 px |
| `appearance.outdoor_tile.font_size` | Outdoor tile text size | 8–48 px |
| `appearance.indoor_tile.padding_vertical` | Indoor padding at each top/bottom edge | 0–40 px |
| `appearance.outdoor_tile.padding_vertical` | Outdoor padding at each top/bottom edge | 0–40 px |

Decimal values are allowed. `padding_vertical: 6` means 6 px above and 6 px below the text, not 6 px in total. `0` is an explicit value; omission/clearing means automatic.

There is no fixed tile minimum height. Required height is the text block height (including line height/wrapping) plus twice the vertical padding. All four value tiles in one indoor or outdoor row share the height required by the tallest tile. Shorter content is centered and can have more free space than the configured padding. Different room rows may have different heights. Outdoor captions have a separate shared grid row, so wrapped captions do not produce uneven value tiles.

### Responsive defaults, not automatic scaling of custom values

| Setting when omitted | Normal viewport | Narrow viewport, at most 380 CSS px |
| --- | --- | --- |
| Tile font size | 14 px | 12 px |
| Padding at each top/bottom edge | 9 px | 8 px |

The breakpoint uses browser viewport width, not device detection or card width. A smartphone wider than 380 CSS px can therefore use the normal defaults. An explicit custom value is used unchanged at every viewport width; there is no proportional mobile conversion. You can leave font size automatic while explicitly setting padding, or vice versa.

Tile controls do not change the card title, room heading, column captions or detail text. Keep reading/tapping comfortable when choosing small values.

`min_height` from earlier local tile-size tests is accepted for compatibility but ignored. It is absent from the editor and is removed when a valid appearance edit is committed. Do not use it to request a fixed height.

## Measurement colors

Editor: **Messwertfarben**. Recommendation and mould use state colors. Numeric measurements use color ranges, with separate indoor/outdoor controls where applicable. Indoor colors default to enabled; outdoor colors require explicit activation. Disabling colors retains the rules.

Numeric ranges have exactly one base (`above: null`) and unique numeric lower bounds. The highest matching bound is inclusive. An empty color means neutral tint, not the default state color.

```yaml
color_rules:
  temperature:
    enabled: true
    ranges:
      - above: null
        color: "#90CAF9"
      - above: 18
        color: "#A5D6A7"
      - above: 24
        color: "#FFE082"
    outdoor_enabled: true
    outdoor_ranges:
      - above: null
        color: "#90CAF9"
      - above: 0
        color: "#80DEEA"
```

Other categories: `absolute_humidity`, `relative_humidity`, `dew_point`; state maps: `color_rules.recommendation.states` and `color_rules.mould.states`. Relative humidity and dew point color controls apply outdoors. Bounds refer to the displayed readings/units and are not health or mould assessments. Quote YAML hex colors.

Neutral tint is configured under **Aussehen → Wertekacheln → Kacheln ohne Messwertfarbe** using the top-level `neutral_tint_strength` key. It affects only tiles without an active measurement color. At 0% their fill is transparent; text remains opaque.

## Appearance

Appearance affects this card instance only. Spacing, dividers, card background, border/corners and shadow concepts correspond to the [Room Card](room-card.md#appearance), but this card has its own controls and automatic tile-height behavior.

```yaml
appearance:
  padding: 16
  indoor_item_gap: 8
  outdoor_item_gap: 8
  section_spacing: 4
  dividers:
    enabled: true
    width: 1
    color: "var(--divider-color)"
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

| Option under `appearance` | Meaning / automatic behavior |
| --- | --- |
| `padding` | Room/outdoor-row padding: 16 px, narrow view 12 px; title/indoor column headings receive the same horizontal inset |
| `indoor_item_gap` | Indoor tile gaps and aligned headings: 8 px, narrow view 5 px |
| `outdoor_item_gap` | Outdoor horizontal tile gap: 8 px, narrow view 5 px; caption/value row separation is independent |
| `item_gap` | Shared YAML fallback; explicit indoor/outdoor gaps take precedence |
| `section_spacing` | Extra spacing, default 0, in addition to existing padding; children retain their previous 14 px plus this value |
| `indoor_tile`, `outdoor_tile` | Tile text/padding settings described above |
| `dividers.enabled`, `.width`, `.color` | Enabled by default, 1 px, theme `--divider-color` |
| `background.mode`, `.color` | `theme`, `transparent`, `custom`; custom requires a color |
| `border.enabled`, `.width`, `.color` | Theme border when not overridden; a custom border uses 1 px and theme color by default |
| `border.radius` | Theme radius when omitted, fallback 16 px; independent of border visibility |
| `shadow.mode`, `.value` | `default` retains theme shadow; modes below |

Explicit gaps/padding apply at all viewport widths; omitted properties keep responsive defaults. Spacing/radius: 0–100 px; border/divider widths: 0–10 px. `0` is valid. `section_spacing` adds spacing rather than replacing legacy spacing. Room Card keys `status_item_gap`/`device_item_gap` do not apply here.

**Abstände zurücksetzen** clears spacing overrides only. The individual **Automatisch** action clears only that field; if `item_gap` remains in YAML it becomes the effective fallback for an automatically reset indoor/outdoor gap. **Gesamtes Aussehen zurücksetzen** clears `appearance` and `neutral_tint_strength`, not measurement colors or content settings.

Background changes affect the outer card surface, not measurement-colored or neutral tile fills. The border can return to theme independently of radius. Invalid required custom colors/shadows remain local until corrected; their automatic reset safely restores the theme/default mode.

### Shadows

| Mode | CSS value |
| --- | --- |
| `default` | Unchanged theme shadow; may be invisible depending on theme |
| `none` | No shadow |
| `subtle` | `0 1px 3px rgba(0, 0, 0, 0.18)` |
| `soft` | `0 4px 12px rgba(0, 0, 0, 0.22)` |
| `strong` | `0 8px 24px rgba(0, 0, 0, 0.30)` |
| `floating` | `0 12px 32px rgba(0, 0, 0, 0.35)` |
| `custom` | Valid CSS value under `shadow.value` |

The four presets match the Room Card. **Als eigenen Schatten bearbeiten** copies a preset to the editable CSS field. Example: `shadow: {mode: custom, value: "0 4px 16px rgba(0,0,0,0.25)"}`. Enter a value, not a CSS rule/semicolons. Compare `none`/`floating` with the border disabled. Shadows extend outside; padding creates no exterior clearance and parent containers may clip them.

## Full example

Merge this into one card configuration; do not add duplicate `appearance`, `outdoor` or `rooms` keys. Replace all entity IDs with your own.

```yaml
type: custom:shfd-freshairiq-room-card
title: ""
neutral_tint_strength: 12
show_header: false
show_room_heading: false
details_label_mode: auto_hide_empty
show_details: true
hide_missing_details: true
detail_fields:
  - reason
  - humidity
column_labels:
  recommendation: Ventilation
rooms:
  - recommendation_entity: sensor.freshairiq_living_room_action
    name: Living Room
  - recommendation_entity: sensor.freshairiq_bathroom_action
    name: Bathroom
    show_details: false
outdoor:
  name: Outdoor
  show_room_heading: false
  show_header: false
  temperature_entity: sensor.outdoor_temperature
  humidity_entity: sensor.outdoor_humidity
  absolute_humidity_entity: sensor.outdoor_absolute_humidity
  dew_point_entity: sensor.outdoor_dew_point
  weather_entity: weather.home
appearance:
  indoor_tile:
    font_size: 13
    padding_vertical: 6
  outdoor_tile:
    font_size: 13
    padding_vertical: 6
  indoor_item_gap: 8
  outdoor_item_gap: 8
  shadow:
    mode: soft
```

The title and upper room/outdoor headings are hidden. Living Room retains its name as the disclosure label if details exist. Bathroom has neither details nor a fallback name row. Outdoor weather remains available if configured. All four tiles share their own row's height, not a global height across all rooms.

## Interaction and troubleshooting

- Preview versus saving: valid changes update the preview; permanently save with Home Assistant's **Speichern**. There is no separate appearance-apply step.
- A field stays unchanged in the preview: check its inline error, finish the input or reset it. Invalid text is not committed; the previous valid value remains active.
- Wrong version after updating: replace the file actually loaded by the resource, update the resource version parameter where applicable and fully reload the browser page. Do not load a second card copy next to the collection.
- Missing `auto_hide_empty`, `indoor_tile` or `outdoor_tile` support indicates that the executed JavaScript does not include those options. Check the loaded resource before changing working YAML.
- Global changes do not affect a room: inspect **Von den Vorgaben abweichen**, or use **Eigene Anzeigeeinstellungen entfernen**.
- No details: check `show_details`, `detail_fields: []`, missing data and conditional fields.
- Room name remains visible: inspect global/local `show_room_heading` and the details mode. Existing details intentionally retain their label in compact automatic mode.
- Outdoor name remains visible: use `outdoor.show_room_heading: false`; neither global `show_room_heading` nor `outdoor.show_header` controls it.
- No card title: clear/omit `title`. No column captions: check indoor/outdoor `show_header` independently; blank captions use defaults rather than hiding the captions.
- Mobile values do not shrink: explicit tile values apply unchanged everywhere; automatic narrow defaults use a viewport breakpoint of 380 CSS px.
- Unequal heights across rooms: expected with content-based height. Values in the same row remain equal-height.
- Missing readings: check action sensor/payload and dedicated sensors. Missing weather: check entity, integration, forecast type and outdoor disclosure.
- Payload-derived values open the action sensor's more-info dialog; dedicated sensors open their own dialog. Automatic resolution of separate payload detail targets is not implemented.
- Existing YAML keys remain usable. The deliberate visual change is automatic tile height instead of the earlier fixed minimums; the editor also no longer has a separate appearance-apply button.
