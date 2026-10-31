# SHFD FreshAirIQ Room Card

[English](freshairiq-climate-room-card.md) · [Deutsch](de/freshairiq-climate-room-card.md)

Room climate, ventilation recommendations, mould risk and optional outdoor values with an integrated editor.

![FreshAirIQ Climate Card](images/climate-card.png)

## Getting started and requirements

Automatic data extraction uses the [FreshAirIQ integration](https://github.com/rupascha/freshairiq) and its action sensor's `freshairiq_room_payload` attribute. Individual readings can be overridden with dedicated sensors. The Climate Card renders its own tiles; for the collection including the regular Room Card, also see its [installation instructions](room-card.md#installation-and-getting-started).

Load the collection entry point as a JavaScript Module: `/hacsfiles/ha-card-collection/ha-card-collection.js`, or manually `/local/ha-card-collection/ha-card-collection.js`. Register no extra editor/appearance file. Select SHFD FreshAirIQ Raumkarte or use:

```yaml
type: custom:shfd-freshairiq-room-card
title: Room climate
rooms:
  - recommendation_entity: sensor.freshairiq_living_room_action
```

Indoor rows show recommendation, absolute humidity, temperature and mould risk. Replace the sample ID with your action sensor. YAML keys are identical in both languages; current editor labels are German.

## Rooms and general options

| Option | Meaning / default |
| --- | --- |
| `rooms` | Indoor room list; assign a FreshAirIQ action sensor under `recommendation_entity` per room |
| `title` | Optional card heading |
| `title_font_size` | 20 px, allowed 10–72 |
| `title_color` | Optional CSS heading color; otherwise theme |
| `neutral_tint_strength` | Neutral tile tint 0–100%, default 12; 0 is transparent |
| `show_header` | Column headings, default `true` |
| `show_details` | Room details, default `true` |
| `hide_missing_details` | Hide missing details, default `true`; `false` shows placeholders |
| `detail_fields` | Global room-detail field selection |
| `appearance` | Appearance of this card instance only |

Room options: `recommendation_entity`, optional `name`, `icon`, `temperature_entity`, `absolute_humidity_entity`, `mould_entity`, `humidity_entity`. Room name/icon come from the payload unless overridden. Explicit sensors replace the corresponding payload values. Additional measurement points under `children` remain supported and are edited through YAML.

## Outdoor values and weather

```yaml
outdoor:
  name: Outdoor
  icon: mdi:weather-partly-cloudy
  temperature_entity: sensor.outdoor_temperature
  humidity_entity: sensor.outdoor_humidity
  absolute_humidity_entity: sensor.outdoor_absolute_humidity
  dew_point_entity: sensor.outdoor_dew_point
  weather_entity: weather.home
  show_weather: true
  show_forecast: true
  forecast_type: daily
```

All outdoor sensors are optional; missing/unavailable values display `–`. No dew point is calculated. The correct key is `dew_point_entity`, not `dewpoint_entity`. Without a name, the current UI uses Draußen.

Weather details require `weather_entity`. `show_weather` and `show_forecast` default to `true`. `forecast_type` accepts `daily`, `hourly`, `twice_daily` and must be supported by the weather integration. The weather card loads when outdoor details open, independently of indoor `show_details`.

## Room details and measurement colors

Raumdetails selects fields globally. Default fields: `reason`, `humidity`, `delta_g_m3`, `surface_rh`, `opening_state`, `measurement_frame_reason`. Missing values are hidden by default; zero values remain visible. Session values appear during active ventilation, CO₂ when available. Heading, colors and neutral tint are configured under Allgemein or Farben & Grenzwerte.

Indoor and outdoor colors can be enabled independently. Indoor colors default to enabled; outdoor colors require explicit activation. Numeric ranges have exactly one base (`above: null`) and unique numeric lower bounds; the highest matching bound is inclusive. An empty color uses neutral tile tint. Disabling colors does not delete rules.

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

Other categories: `absolute_humidity`, `relative_humidity`, `dew_point`; state colors for recommendations and mould under `recommendation.states` and `mould.states`. `relative_humidity` and `dew_point` apply outdoors. Bounds refer to the readings and units used; colors are not health or mould assessments. Quote YAML hex colors. The color picker with text input is also used for appearance settings.

## Appearance

The same groups as the [Room Card](room-card.md#appearance): spacing, dividers, background, border/corners and shadows. Without `appearance`, existing CSS, theme border/shadow and responsive gaps remain unchanged.

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

| Option | Meaning / previous default |
| --- | --- |
| `padding` | Room/outdoor-row padding; 16 px, mobile 12 px. Heading/column labels receive the same horizontal inset |
| `indoor_item_gap` | Indoor tile gaps and matching column headings; 8 px, mobile 5 px |
| `outdoor_item_gap` | Outdoor tile gaps; 8 px, mobile 5 px |
| `item_gap` | Shared YAML fallback; indoor/outdoor values take precedence |
| `section_spacing` | Extra row spacing; default 0 in addition to existing padding; extra measurement points add it to their previous 14 px |
| `dividers.enabled`, `.width`, `.color` | Visible by default, 1 px, theme `--divider-color` |
| `background.mode`, `.color` | `theme`, `transparent`, `custom`; custom requires a color |
| `border.enabled`, `.width`, `.color` | Theme border unless overridden; custom border defaults to 1 px and theme color |
| `border.radius` | Theme radius unless overridden; fallback 16 px |
| `shadow.mode`, `.value` | `default` retains theme shadow; further modes below |

Explicit gaps apply at all screen sizes; omitted settings retain responsive behavior. Spacing/radius: 0–100 px; border/divider widths: 0–10 px. `0` is valid. Unlike the Room Card, `section_spacing` here adds spacing rather than replacing legacy section spacing. Room Card keys `status_item_gap`/`device_item_gap` do not apply here; use `indoor_item_gap`/`outdoor_item_gap`.

Use Darstellung übernehmen in the editor to apply changes. Opening it does not persist displayed defaults. Standardabstände wiederherstellen resets spacing only. Darstellung auf Standard zurücksetzen removes only `appearance`; rooms, outdoor sensors, details, ranges and neutral tint remain. Background options affect only the outer surface, not colored or neutrally tinted tiles. Border behavior can return to the theme independently of radius.

### Shadows

| Mode | CSS value |
| --- | --- |
| `default` | Unchanged theme shadow; may be invisible depending on theme |
| `none` | No shadow |
| `subtle` | `0 1px 3px rgba(0, 0, 0, 0.18)` |
| `soft` | `0 4px 12px rgba(0, 0, 0, 0.22)` |
| `strong` | `0 8px 24px rgba(0, 0, 0, 0.30)` |
| `floating` | `0 12px 32px rgba(0, 0, 0, 0.35)` |
| `custom` | A valid CSS value in `shadow.value` |

The four presets match the Room Card, while `default` preserves each card's own previous behavior. Als eigenen Schatten bearbeiten copies a preset into the editable field. Example: `shadow: {mode: custom, value: "0 4px 16px rgba(0,0,0,0.25)"}`. Enter a value, not a CSS rule or semicolons. Test with border disabled and compare `none`/`floating`. Shadows extend outside; padding does not add exterior space and parent containers can clip them.

## Full example

```yaml
type: custom:shfd-freshairiq-room-card
title: Room climate
neutral_tint_strength: 12
show_details: true
hide_missing_details: true
rooms:
  - recommendation_entity: sensor.freshairiq_living_room_action
    name: Living Room
outdoor:
  temperature_entity: sensor.outdoor_temperature
  humidity_entity: sensor.outdoor_humidity
  weather_entity: weather.home
appearance:
  indoor_item_gap: 10
  outdoor_item_gap: 10
  shadow:
    mode: soft
```

If changes are missing, apply appearance settings, reload the complete browser page and check cache. For missing data, check action sensor/payload and sensor assignments. For weather issues, check integration, forecast type and outdoor details. Appearance settings change neither entity states nor FreshAirIQ calculations.
