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
| `show_header` | Nur Innen-Spaltenüberschriften, Standard `true` |
| `show_room_heading` | Raumzeile mit Icon und Raumnamen für Innenräume, Standard `true` |
| `details_label_mode` | Beschriftung des aufklappbaren Detailbereichs, Standard `auto` |
| `column_labels` | Eigene Innen-Spaltenbeschriftungen; fehlende oder leere Texte verwenden den Standard |
| `show_details` | Globale Vorgabe für Raumdetails, Standard `true` |
| `hide_missing_details` | Globale Vorgabe: fehlende Details ausblenden, Standard `true`; `false` zeigt Platzhalter |
| `detail_fields` | Globale Auswahl der Raumdetailfelder; lokal pro Raum überschreibbar |
| `appearance` | Darstellung ausschließlich dieser Karteninstanz |

Raumoptionen: `recommendation_entity`, optional `name`, `icon`, `temperature_entity`, `absolute_humidity_entity`, `mould_entity`, `humidity_entity`. Name und Icon stammen ohne Überschreibung aus dem Payload. Explizite Sensoren ersetzen die entsprechenden Payload-Werte. Zusätzlich sind `show_room_heading`, `details_label_mode`, `show_details`, `hide_missing_details` und `detail_fields` je Raum möglich. Zusätzliche Messstellen unter `children` bleiben über YAML unterstützt; ihre Detailoptionen übernehmen ohne eigene Überschreibung die globalen Vorgaben, nicht die individuellen Vorgaben des übergeordneten Raums.

## Globale und individuelle Raumdetails

Globale Einstellungen bleiben der Standard. Jede der drei Raumoptionen überschreibt nur die entsprechende globale Option; das Weglassen eines Schlüssels bedeutet Vererbung.

| Option am Raum | Verhalten |
| --- | --- |
| `show_details` fehlt | Globale Sichtbarkeit übernehmen |
| `show_details: true` | Details für diesen Raum aktivieren, auch wenn global deaktiviert |
| `show_details: false` | Details dieses Raums deaktivieren |
| `hide_missing_details` fehlt | Globale Behandlung fehlender Werte übernehmen |
| `hide_missing_details: true` / `false` | Fehlende Werte lokal ausblenden / als Platzhalter anzeigen |
| `detail_fields` fehlt | Globale Feldauswahl dynamisch übernehmen |
| `detail_fields: [...]` | Eigene Liste statt der globalen Liste; keine Zusammenführung |
| `detail_fields: []` | Bewusst keine Felder; es erscheint kein Detailsbereich |

```yaml
show_details: true
hide_missing_details: true
detail_fields:
  - reason
  - humidity
  - delta_g_m3
rooms:
  - recommendation_entity: sensor.freshairiq_wohnzimmer_aktion
    name: Wohnzimmer
  - recommendation_entity: sensor.freshairiq_bad_aktion
    name: Bad
    detail_fields:
      - reason
      - humidity
      - surface_rh
      - moisture_source_message
    hide_missing_details: false
  - recommendation_entity: sensor.freshairiq_keller_aktion
    name: Keller
    show_details: false
```

Wohnzimmer folgt allen globalen Änderungen. Bad nutzt eine eigene Feldauswahl und Platzhalter, übernimmt aber die globale Sichtbarkeit. Keller hat keine Details. Auch bei aktivierten Details erscheint kein Bereich, wenn keine anzeigbaren Felder übrig bleiben.

Im Editor: Innenräume → gewünschter Raum → Raumdetails. Details anzeigen und Fehlende Detailwerte bieten jeweils Global übernehmen oder eine lokale Auswahl. Unter Detailfelder zwischen Globale Auswahl verwenden und Eigene Auswahl für diesen Raum wechseln. Beim Wechsel auf Eigene Auswahl wird die aktuelle globale Liste kopiert; danach gelten globale Listenänderungen nicht automatisch für diese lokale Liste. Die lokale Auswahl kann auf Standard gesetzt, vollständig ausgewählt oder geleert werden.

Globale Einstellungen wieder übernehmen entfernt ausschließlich die drei lokalen Detailoptionen. Raumname, Aktionssensor, Sensorüberschreibungen und globale Vorgaben bleiben erhalten. Das Öffnen des Editors erzeugt keine lokalen Überschreibungen.

Standardfelder ohne globale oder lokale Liste: `reason`, `humidity`, `delta_g_m3`, `surface_rh`, `opening_state`, `measurement_frame_reason`. Nullwerte bleiben sichtbar. Sitzungswerte erscheinen nur bei aktiver Lüftung, CO₂ nur bei verfügbarer Messung; diese Bedingungen gelten auch bei lokaler Auswahl und eingeschalteten Platzhaltern. Außendetails mit Wetter bleiben unabhängig von den Innenraumdetails.

## Raumzeile und Detailbeschriftung

Die Raumzeile zeigt Icon und Raumname eines Innenraums. Sie lässt sich global und je Raum ein- oder ausblenden. Die Beschriftung des Detailbereichs ist davon unabhängig.

| Option | Bedeutung / Standard |
| --- | --- |
| `show_room_heading` | Raumzeile anzeigen; Standard `true` |
| `details_label_mode` | `auto`, `room_name`, `details` oder `auto_hide_empty`; Standard `auto` |

| Modus | Verhalten |
| --- | --- |
| `auto` | Bei sichtbarer Raumzeile `Details`, sonst der Raumname |
| `room_name` | Immer der Raumname |
| `details` | Immer `Details` |
| `auto_hide_empty` | Wie `auto`; ohne anzeigbare Details entfällt bei ausgeblendeter Raumzeile auch die untere Namenszeile |

```yaml
show_room_heading: false
details_label_mode: auto_hide_empty
```

Für eine kompakte Ansicht ohne Raumnamen müssen beide Optionen gesetzt sein. Sind Details vorhanden, erscheint der Raumname weiterhin als aufklappbare Detailbeschriftung. Sind keine Details anzeigbar, entfällt die Namenszeile vollständig; Messwerte und Trennlinien bleiben erhalten.

Jeder Raum kann beide Optionen einzeln überschreiben. Fehlt ein Schlüssel, gilt die globale Einstellung. Die Raumzeile kann auch bei `auto_hide_empty` sichtbar bleiben.

```yaml
show_room_heading: false
details_label_mode: auto_hide_empty
rooms:
  - recommendation_entity: sensor.freshairiq_wohnzimmer_aktion
    name: Wohnzimmer
  - recommendation_entity: sensor.freshairiq_bad_aktion
    name: Bad
    show_room_heading: true
```

Im Editor: Allgemein → Raumzeile und Detailbeschriftung für globale Vorgaben. Je Raum: Innenräume → gewünschter Raum → Raumzeile und Detailbeschriftung. Dort kann jede Option global übernommen oder lokal gesetzt werden. „Globale Raumzeilen-Einstellungen übernehmen“ entfernt nur die beiden lokalen Überschreibungen.

## Spaltenüberschriften innen und außen

Die Sichtbarkeit ist unabhängig: `show_header` gilt innen; `outdoor.show_header` gilt außen. Beide sind ohne Angabe `true`. Ausblenden entfernt nur Spaltenbeschriftungen, nicht Raum-/Außenname, Messwerte oder Wetterdetails.

```yaml
show_header: true
column_labels:
  recommendation: Lüftung
  absolute_humidity: Abs. Feuchte
  temperature: Raumtemperatur
  mould: Schimmelrisiko
outdoor:
  show_header: true
  column_labels:
    humidity: Luftfeuchte
    absolute_humidity: Abs. Feuchte
    temperature: Außentemperatur
    dew_point: Taupunkt
```

| Position | Zulässige Schlüssel | Standardtexte |
| --- | --- | --- |
| `column_labels` | `recommendation`, `absolute_humidity`, `temperature`, `mould` | Empfehlung, Abs. Feuchte, Temperatur, Schimmelrisiko |
| `outdoor.column_labels` | `humidity`, `absolute_humidity`, `temperature`, `dew_point` | Relative Feuchte, Abs. Feuchte, Temperatur, Taupunkt |

Fehlende, leere oder nur aus Leerzeichen bestehende Beschriftungen verwenden den Standard. Beschriftungen sind Texte; sie ändern weder Sensorzuordnung noch Spaltenreihenfolge oder Farben. Eigene Texte werden auch in Kachel-Tooltips und zugänglichen Beschriftungen verwendet.

Innen: Allgemein → Beschriftungen der Innenspalten. Außen: Außenwerte → Gruppe der jeweiligen Spalte. Jede Außengruppe enthält direkt zusammen Spaltenüberschrift und Sensor-Entität. Standardbeschriftungen wiederherstellen setzt nur Texte zurück; Sensoren, Sichtbarkeit und Wetterkonfiguration bleiben erhalten. Beschriftungen lassen sich auch bei ausgeblendeten Überschriften vorbereiten.

## Außenwerte und Wetter

```yaml
outdoor:
  name: Draußen
  icon: mdi:weather-partly-cloudy
  show_header: true
  humidity_entity: sensor.outdoor_humidity
  absolute_humidity_entity: sensor.outdoor_absolute_humidity
  temperature_entity: sensor.outdoor_temperature
  dew_point_entity: sensor.outdoor_dew_point
  column_labels:
    temperature: Außentemperatur
  weather_entity: weather.home
  show_weather: true
  show_forecast: true
  forecast_type: daily
```

Alle Außensensoren sind optional; fehlende/nicht verfügbare Werte erscheinen als `–`. Es wird kein Taupunkt berechnet. Der korrekte Schlüssel ist `dew_point_entity`, nicht `dewpoint_entity`. Der Außenname ist ohne Angabe Draußen. Die paarweise Darstellung im Editor ändert die bestehende YAML-Struktur nicht.

Wetterdetails benötigen `weather_entity`. `show_weather` und `show_forecast` sind standardmäßig `true`. `forecast_type` erlaubt `daily`, `hourly`, `twice_daily` und muss von der Wetterintegration unterstützt werden. Die Wetterkarte wird beim Öffnen der Außendetails geladen und ist unabhängig von `show_details` für Innenräume.

## Messwertfarben

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

Weitere Kategorien: `absolute_humidity`, `relative_humidity`, `dew_point`; Zustandsfarben für Empfehlung und Schimmel unter `color_rules.recommendation.states` bzw. `color_rules.mould.states`. `relative_humidity` und `dew_point` betreffen Außenwerte. Grenzen beziehen sich auf die verwendeten Messwerte und Einheiten; Farben sind keine Gesundheits- oder Schimmelbewertung. Hex-Farben in YAML zitieren. Titel, Farben und neutrale Tönung sind unter Allgemein bzw. Farben & Grenzwerte einstellbar. Der Color-Picker mit Texteingabe bleibt auch für Darstellungseinstellungen verfügbar.

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

Im Editor Darstellung übernehmen anklicken. Angezeigte Default-Zahlen werden durch das Öffnen nicht gespeichert. Standardabstände wiederherstellen betrifft nur Abstände. Darstellung auf Standard zurücksetzen entfernt nur `appearance`; Räume, Außensensoren, globale/lokale Details, Beschriftungen, Farbbereiche und neutrale Tönung bleiben erhalten. Hintergrundoptionen ändern nur die äußere Fläche, nicht die farbigen oder neutral getönten Kacheln. Rahmen lässt sich unabhängig vom Radius ans Theme zurückgeben.

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
show_header: true
show_room_heading: false
details_label_mode: auto_hide_empty
show_details: true
hide_missing_details: true
detail_fields:
  - reason
  - humidity
column_labels:
  recommendation: Lüftung
rooms:
  - recommendation_entity: sensor.freshairiq_wohnzimmer_aktion
    name: Wohnzimmer
  - recommendation_entity: sensor.freshairiq_bad_aktion
    name: Bad
    detail_fields:
      - reason
      - surface_rh
outdoor:
  temperature_entity: sensor.outdoor_temperature
  humidity_entity: sensor.outdoor_humidity
  show_header: true
  column_labels:
    temperature: Außentemperatur
  weather_entity: weather.home
appearance:
  indoor_item_gap: 10
  outdoor_item_gap: 10
  shadow:
    mode: soft
```

## Bedienung und Fehlerbehebung

- Fehlende Änderungen: passende Übernehmen-Schaltfläche verwenden, Browser-Seite vollständig neu laden und Cache prüfen.
- Globale Detailänderung wirkt nicht auf einen Raum: lokale Überschreibung prüfen oder Globale Einstellungen wieder übernehmen wählen.
- Keine Details: `show_details`, leere Feldauswahl, fehlende Daten und bedingte Felder prüfen.
- Raumname bleibt trotz `auto_hide_empty` sichtbar: `show_room_heading` muss zusätzlich `false` sein; prüfe auch lokale Raumüberschreibungen.
- Keine Überschriften: `show_header` und `outdoor.show_header` unabhängig prüfen; leere Texte blenden keine Überschrift aus.
- Fehlende Daten: Aktionssensor/Payload und Sensorzuordnungen prüfen. Fehlendes Wetter: Integration, Forecast-Typ und Außendetails prüfen.
- Payload-Werte öffnen beim Antippen weiterhin die Detailansicht des Aktionssensors; explizit konfigurierte Sensoren öffnen ihre eigene Detailansicht. Eine automatische Auflösung separater Detailziele ist noch nicht implementiert.
- Darstellungsoptionen ändern keine Entitätszustände und keine FreshAirIQ-Berechnungen. Bestehende Konfigurationen ohne neue Optionen behalten das bisherige Verhalten.
