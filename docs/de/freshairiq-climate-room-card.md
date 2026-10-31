# SHFD FreshAirIQ Raumkarte

[English](../freshairiq-climate-room-card.md) · [Deutsch](freshairiq-climate-room-card.md)

Raumklima, Lüftungsempfehlung, Schimmelrisiko und optionale Außenwerte mit integriertem Editor.

![FreshAirIQ Klimakarte](../images/climate-card.png)

## Einstieg und Voraussetzungen

Die automatische Datenübernahme verwendet die [FreshAirIQ-Integration](https://github.com/rupascha/freshairiq) und das Attribut `freshairiq_room_payload` des Aktionssensors. Einzelne Messwerte können über eigene Sensoren überschrieben werden. Die Klimakarte rendert ihre Kacheln selbst; für die Collection einschließlich der normalen Raumkarte beachte auch deren [Installationshinweise](room-card.md#installation-und-einstieg).

Lade den Collection-Einstiegspunkt als JavaScript-Modul: `/hacsfiles/ha-card-collection/ha-card-collection.js`, manuell `/local/ha-card-collection/ha-card-collection.js`. Keine zusätzliche Editor-/Darstellungsdatei registrieren. Wähle SHFD FreshAirIQ Raumkarte oder verwende:

```yaml
type: custom:shfd-freshairiq-room-card
title: Raumklima
rooms:
  - recommendation_entity: sensor.freshairiq_wohnzimmer_aktion
```

Die Innenzeile zeigt Empfehlung, absolute Feuchte, Temperatur und Schimmelrisiko. Ersetze die Beispiel-ID durch deinen FreshAirIQ-Aktionssensor. YAML-Schlüssel sind in Deutsch und Englisch identisch; der aktuelle Editor verwendet deutsche Beschriftungen.

## Räume und allgemeine Optionen

| Option | Bedeutung / Standard |
| --- | --- |
| `rooms` | Liste der Innenräume; pro Raum FreshAirIQ-Aktionssensor unter `recommendation_entity` zuordnen |
| `title` | Optionale Kartenüberschrift |
| `title_font_size` | 20 px, zulässig 10–72 |
| `title_color` | Optionale CSS-Titelfarbe, sonst Theme |
| `neutral_tint_strength` | Neutrale Kacheltönung 0–100 %, Standard 12; 0 transparent |
| `show_header` | Spaltenüberschriften, Standard `true` |
| `show_details` | Raumdetails, Standard `true` |
| `hide_missing_details` | Fehlende Details ausblenden, Standard `true`; `false` zeigt Platzhalter |
| `detail_fields` | Globale Auswahl der Raumdetailfelder |
| `appearance` | Darstellung ausschließlich dieser Karteninstanz |

Raumoptionen: `recommendation_entity`, optional `name`, `icon`, `temperature_entity`, `absolute_humidity_entity`, `mould_entity`, `humidity_entity`. Name und Icon stammen ohne Überschreibung aus dem Payload. Explizite Sensoren ersetzen die entsprechenden Payload-Werte. Zusätzliche Messstellen unter `children` bleiben unterstützt und werden über YAML bearbeitet.

## Außenwerte und Wetter

```yaml
outdoor:
  name: Draußen
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

Alle Außensensoren sind optional; fehlende/nicht verfügbare Werte erscheinen als `–`. Es wird kein Taupunkt berechnet. Der korrekte Schlüssel ist `dew_point_entity`, nicht `dewpoint_entity`. Der Außenname ist ohne Angabe Draußen.

Wetterdetails benötigen `weather_entity`. `show_weather` und `show_forecast` sind standardmäßig `true`. `forecast_type` erlaubt `daily`, `hourly`, `twice_daily` und muss von der Wetterintegration unterstützt werden. Die Wetterkarte wird beim Öffnen der Außendetails geladen und ist unabhängig von `show_details` für Innenräume.

## Raumdetails und Messwertfarben

Unter Raumdetails werden Felder global gewählt. Standardauswahl: `reason`, `humidity`, `delta_g_m3`, `surface_rh`, `opening_state`, `measurement_frame_reason`. Fehlende Werte werden standardmäßig ausgeblendet; Nullwerte bleiben sichtbar. Sitzungswerte erscheinen nur bei aktiver Lüftung, CO₂ bei verfügbarer Messung. Titel, Farben und neutrale Tönung sind unter Allgemein bzw. Farben & Grenzwerte einstellbar.

Innen- und Außenfarben lassen sich unabhängig aktivieren. Innenfarben sind standardmäßig aktiv; Außenfarben müssen ausdrücklich eingeschaltet werden. Messwertbereiche haben genau einen Grundbereich (`above: null`) und eindeutige numerische Untergrenzen; die höchste passende Untergrenze gilt inklusive. Leere Farbe bedeutet neutrale Kacheltönung. Ausschalten löscht keine Regeln.

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

Weitere Kategorien: `absolute_humidity`, `relative_humidity`, `dew_point`; Zustandsfarben für Empfehlung und Schimmel unter `recommendation.states` bzw. `mould.states`. `relative_humidity` und `dew_point` betreffen Außenwerte. Grenzen beziehen sich auf die verwendeten Messwerte und Einheiten; Farben sind keine Gesundheits- oder Schimmelbewertung. Hex-Farben in YAML zitieren. Der Color-Picker mit Texteingabe bleibt auch für Darstellungseinstellungen verfügbar.

## Darstellung

Dieselben Gruppen wie in der [Raumkarte](room-card.md#darstellung): Abstände, Trennlinien, Hintergrund, Rahmen/Ecken und Schatten. Ohne `appearance` bleiben bisheriges CSS, Theme-Rahmen/-Schatten und mobile Abstände erhalten.

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

| Option | Bedeutung / bisheriger Standard |
| --- | --- |
| `padding` | Innenabstand der Raum-/Außenzeilen; 16 px, mobil 12 px. Titel/Spaltenüberschriften erhalten denselben seitlichen Abstand |
| `indoor_item_gap` | Abstand zwischen Innenwert-Kacheln und Ausrichtung der Spaltenüberschriften; 8 px, mobil 5 px |
| `outdoor_item_gap` | Abstand zwischen Außenwert-Kacheln; 8 px, mobil 5 px |
| `item_gap` | Gemeinsamer YAML-Fallback; Innen-/Außenwerte haben Vorrang |
| `section_spacing` | Zusätzlicher Zeilenabstand; Standard 0 zusätzlich zum bestehenden Innenabstand; bei zusätzlichen Messstellen zusätzlich zu deren bisherigen 14 px |
| `dividers.enabled`, `.width`, `.color` | Standard sichtbar, 1 px, Theme `--divider-color` |
| `background.mode`, `.color` | `theme`, `transparent`, `custom`; bei `custom` Farbe erforderlich |
| `border.enabled`, `.width`, `.color` | Ohne Überschreibung Theme-Rahmen; eigener Rahmen nutzt standardmäßig 1 px und Theme-Farbe |
| `border.radius` | Ohne Überschreibung Theme-Radius, Fallback 16 px |
| `shadow.mode`, `.value` | `default` belässt den Theme-Schatten; weitere Modi siehe unten |

Explizite Abstände gelten auf allen Bildschirmgrößen; weggelassene Einstellungen behalten das responsive Verhalten. Zulässig: Abstände/Radius 0–100 px, Rahmen-/Linienstärke 0–10 px. `0` ist gültig. Anders als in der Raumkarte ist `section_spacing` hier ein Zusatzabstand und kein Ersatz aller bisherigen Bereichsabstände. Raumkarten-Schlüssel `status_item_gap`/`device_item_gap` gelten hier nicht; verwende `indoor_item_gap`/`outdoor_item_gap`.

Im Editor Darstellung übernehmen anklicken. Angezeigte Default-Zahlen werden durch das Öffnen nicht gespeichert. Standardabstände wiederherstellen betrifft nur Abstände. Darstellung auf Standard zurücksetzen entfernt nur `appearance`; Räume, Außensensoren, Details, Farbbereiche und neutrale Tönung bleiben erhalten. Hintergrundoptionen ändern nur die äußere Fläche, nicht die farbigen oder neutral getönten Kacheln. Rahmen lässt sich unabhängig vom Radius ans Theme zurückgeben.

### Schatten

| Modus | CSS-Wert |
| --- | --- |
| `default` | Unveränderter Theme-Schatten; kann je nach Theme unsichtbar sein |
| `none` | Kein Schatten |
| `subtle` | `0 1px 3px rgba(0, 0, 0, 0.18)` |
| `soft` | `0 4px 12px rgba(0, 0, 0, 0.22)` |
| `strong` | `0 8px 24px rgba(0, 0, 0, 0.30)` |
| `floating` | `0 12px 32px rgba(0, 0, 0, 0.35)` |
| `custom` | Gültiger CSS-Wert unter `shadow.value` |

Die vier Vorlagen stimmen mit der Raumkarte überein, der Modus `default` erhält aber jeweils das eigene bisherige Verhalten. Als eigenen Schatten bearbeiten kopiert eine Vorlage ins freie Feld. Beispiel: `shadow: {mode: custom, value: "0 4px 16px rgba(0,0,0,0.25)"}`. Nur den Wert eingeben, keine CSS-Regel oder Semikolons. Zum Testen Rahmen aus und `none`/`floating` vergleichen. Schatten liegen außen; Innenabstand schafft keinen Außenplatz, übergeordnete Container können abschneiden.

## Vollständiges Beispiel

```yaml
type: custom:shfd-freshairiq-room-card
title: Raumklima
neutral_tint_strength: 12
show_details: true
hide_missing_details: true
rooms:
  - recommendation_entity: sensor.freshairiq_wohnzimmer_aktion
    name: Wohnzimmer
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

Bei fehlenden Änderungen Darstellung übernehmen, Browser-Seite vollständig neu laden und Cache prüfen. Bei fehlenden Daten Aktionssensor/Payload und Sensorzuordnungen prüfen. Bei fehlendem Wetter Integration, Forecast-Typ und Außendetails prüfen. Darstellungsoptionen ändern keine Entitätszustände und keine FreshAirIQ-Berechnungen.
