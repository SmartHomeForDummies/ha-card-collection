# SHFD FreshAirIQ Raumkarte

[English](../freshairiq-climate-room-card.md) · [Deutsch](freshairiq-climate-room-card.md)

Die **SHFD FreshAirIQ Raumkarte** zeigt Raumklima, Lüftungsempfehlungen und optional Außenwerte in einer übersichtlichen Dashboard-Karte.

![FreshAirIQ Raumkarte mit Raumklima, Empfehlung und Außenwerten](../images/climate-card.png)

## Voraussetzungen

Diese Karte benötigt die [FreshAirIQ-Integration](https://github.com/rupascha/freshairiq).

Die Karte liest Raumname, Symbol, Messwerte und Lüftungsempfehlung aus dem Attribut `freshairiq_room_payload` des ausgewählten FreshAirIQ-Aktionssensors. Ohne die Integration sind keine Raumdaten verfügbar.

Für die vollständige Darstellung werden zusätzlich **Mushroom** und **UIX** benötigt.

## Karte hinzufügen

Wähle im Kartenwähler **SHFD FreshAirIQ Raumkarte** oder füge die Karte manuell hinzu:

```yaml
type: custom:shfd-freshairiq-room-card
rooms:
  - recommendation_entity: sensor.freshairiq_wohnzimmer_aktion
```

Ersetze `sensor.freshairiq_wohnzimmer_aktion` durch den FreshAirIQ-Aktionssensor deines Raums.

Standardmäßig zeigt die Karte:

- Empfehlung
- Absolute Feuchte
- Temperatur
- Schimmelrisiko

## Räume

Jeder Eintrag unter `rooms` benötigt eine `recommendation_entity`.

```yaml
rooms:
  - recommendation_entity: sensor.freshairiq_wohnzimmer_aktion
    name: Wohnzimmer
    icon: mdi:sofa
```

| Option | Beschreibung |
| --- | --- |
| `recommendation_entity` | Erforderlicher FreshAirIQ-Aktionssensor |
| `name` | Optionaler Raumname; ohne Wert wird der Name aus dem FreshAirIQ-Payload verwendet |
| `icon` | Optionales MDI-Icon; ohne Wert wird das Icon aus dem Payload verwendet |
| `temperature_entity` | Optionaler Temperatur-Sensor, der den Payload-Wert überschreibt |
| `absolute_humidity_entity` | Optionaler Sensor für absolute Feuchte |
| `mould_entity` | Optionaler Sensor für das Schimmelrisiko |
| `humidity_entity` | Optionaler Sensor für relative Feuchte |

## Allgemeine Optionen

```yaml
type: custom:shfd-freshairiq-room-card
title: Raumklima
title_font_size: 20
title_color: "var(--primary-text-color)"
neutral_tint_strength: 12
show_header: true
show_details: true
hide_missing_details: false
rooms:
  - recommendation_entity: sensor.freshairiq_wohnzimmer_aktion
```

| Option | Beschreibung |
| --- | --- |
| `title` | Optionale Überschrift über der Karte |
| `title_font_size` | Schriftgröße der Überschrift; Standard 20, zulässig 10–72 |
| `title_color` | Optionale CSS-Farbe für die Überschrift |
| `neutral_tint_strength` | Tönungsstärke neutraler Kacheln in Prozent; Standard 12, zulässig 0–100 |
| `show_header` | Zeigt die Spaltenüberschriften für Innenräume; Standard `true` |
| `show_details` | Aktiviert die aufklappbaren Raumdetails; Standard `true` |
| `hide_missing_details` | Blendet Details ohne verfügbaren Wert aus; Standard `false` |
| `detail_fields` | Liste der angezeigten Detailfelder |

## Außenwerte

Die Außenzeile ist optional.

```yaml
outdoor:
  name: Draußen
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

| Option | Beschreibung |
| --- | --- |
| `name` | Beschriftung der Außenzeile; Standard ist „Draußen“ |
| `icon` | MDI-Icon der Außenzeile |
| `temperature_entity` | Optionaler Außentemperatur-Sensor |
| `humidity_entity` | Optionaler Sensor für relative Außenfeuchte |
| `absolute_humidity_entity` | Optionaler Sensor für absolute Außenfeuchte |
| `dewpoint_entity` | Optionaler Taupunkt-Sensor |
| `weather_entity` | Wetter-Entität für die eingebettete Wetterkarte |
| `show_weather` | Zeigt die Wetterkarte in den Außendetails; Standard `true` |
| `show_forecast` | Zeigt die Vorhersage in der Wetterkarte; Standard `true` |
| `forecast_type` | `daily`, `hourly` oder `twicedaily`; Standard `daily` |

Die Wetterkarte wird nur angezeigt, wenn die gewählte Wetter-Entität vorhanden ist und der gewählte Vorhersagetyp von der Wetterintegration unterstützt wird.

## Details und Farben

Unter **Raumdetails** legst du fest, welche Werte im aufklappbaren Detailsbereich erscheinen. Unter **Farben & Grenzwerte** kannst du Farben für Empfehlung, Schimmelrisiko sowie Innen- und Außenwerte anpassen.

Die Farbbereiche sind eine visuelle Orientierung und keine medizinische oder gesundheitliche Bewertung.

## Vollständiges Beispiel

```yaml
type: custom:shfd-freshairiq-room-card
title: Raumklima
neutral_tint_strength: 12
show_details: true
rooms:
  - recommendation_entity: sensor.freshairiq_wohnzimmer_aktion
    name: Wohnzimmer
outdoor:
  temperature_entity: sensor.outdoor_temperature
  humidity_entity: sensor.outdoor_humidity
  weather_entity: weather.home
```
