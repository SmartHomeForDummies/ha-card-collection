# SHFD FreshAirIQ Room Card

[English](freshairiq-climate-room-card.md) · [Deutsch](de/freshairiq-climate-room-card.md)

The **SHFD FreshAirIQ Room Card** displays room climate, ventilation recommendations and optional outdoor values in a compact dashboard card.

![FreshAirIQ Room Card with room climate, recommendation and outdoor values](images/climate-card.png)

## Requirements

This card requires the [FreshAirIQ integration](https://github.com/rupascha/freshairiq).

The card reads the room name, icon, measurements and ventilation recommendation from the `freshairiq_room_payload` attribute of the selected FreshAirIQ action sensor. Without the integration, no room data is available.

For the full visual experience, install **Mushroom** and **UIX** as well.

## Add the card

Select **SHFD FreshAirIQ Raumkarte** in the card picker, or add the card manually:

```yaml
type: custom:shfd-freshairiq-room-card
rooms:
  - recommendation_entity: sensor.freshairiq_wohnzimmer_aktion
```

Replace `sensor.freshairiq_wohnzimmer_aktion` with the FreshAirIQ action sensor for your room.

By default, the card displays:

- Recommendation
- Absolute humidity
- Temperature
- Mould risk

## Rooms

Each entry under `rooms` requires a `recommendation_entity`.

```yaml
rooms:
  - recommendation_entity: sensor.freshairiq_wohnzimmer_aktion
    name: Living room
    icon: mdi:sofa
```

| Option | Description |
| --- | --- |
| `recommendation_entity` | Required FreshAirIQ action sensor |
| `name` | Optional room name; if omitted, the name from the FreshAirIQ payload is used |
| `icon` | Optional MDI icon; if omitted, the icon from the payload is used |
| `temperature_entity` | Optional temperature sensor overriding the payload value |
| `absolute_humidity_entity` | Optional absolute-humidity sensor |
| `mould_entity` | Optional mould-risk sensor |
| `humidity_entity` | Optional relative-humidity sensor |

## General options

```yaml
type: custom:shfd-freshairiq-room-card
title: Room climate
title_font_size: 20
title_color: "var(--primary-text-color)"
neutral_tint_strength: 12
show_header: true
show_details: true
hide_missing_details: false
rooms:
  - recommendation_entity: sensor.freshairiq_wohnzimmer_aktion
```

| Option | Description |
| --- | --- |
| `title` | Optional heading above the card |
| `title_font_size` | Heading font size; default 20, allowed range 10–72 |
| `title_color` | Optional CSS color for the heading |
| `neutral_tint_strength` | Tint strength for neutral tiles in percent; default 12, allowed range 0–100 |
| `show_header` | Shows column headings for indoor rooms; default `true` |
| `show_details` | Enables expandable room details; default `true` |
| `hide_missing_details` | Hides details without an available value; default `false` |
| `detail_fields` | List of detail fields to display |

## Outdoor values

The outdoor row is optional.

```yaml
outdoor:
  name: Outdoor
  icon: mdi:weather-partly-cloudy
  temperature_entity: sensor.outdoor_temperature
  humidity_entity: sensor.outdoor_humidity
  absolute_humidity_entity: sensor.outdoor_absolute_humidity
  dewpoint_entity: sensor.outdoor_dew_point
  weather_entity: weather.home
  show_weather: true
  show_forecast: true
  forecast_type: daily
```

| Option | Description |
| --- | --- |
| `name` | Label for the outdoor row; default is “Outdoor” |
| `icon` | MDI icon for the outdoor row |
| `temperature_entity` | Optional outdoor temperature sensor |
| `humidity_entity` | Optional relative outdoor-humidity sensor |
| `absolute_humidity_entity` | Optional absolute outdoor-humidity sensor |
| `dewpoint_entity` | Optional dew-point sensor |
| `weather_entity` | Weather entity for the embedded weather card |
| `show_weather` | Shows the weather card in the outdoor details; default `true` |
| `show_forecast` | Shows the forecast in the weather card; default `true` |
| `forecast_type` | `daily`, `hourly` or `twicedaily`; default `daily` |

The weather card is displayed only when the selected weather entity exists and the selected forecast type is supported by the weather integration.

## Details and colors

Under **Raumdetails**, choose which values appear in the expandable details area. Under **Farben & Grenzwerte**, customize colors for the recommendation, mould risk and indoor or outdoor values.

The color ranges are visual guidance only and are not a medical or health assessment.

## Full example

```yaml
type: custom:shfd-freshairiq-room-card
title: Room climate
neutral_tint_strength: 12
show_details: true
rooms:
  - recommendation_entity: sensor.freshairiq_wohnzimmer_aktion
    name: Living room
outdoor:
  temperature_entity: sensor.outdoor_temperature
  humidity_entity: sensor.outdoor_humidity
  weather_entity: weather.home
```
