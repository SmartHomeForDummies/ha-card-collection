# SHFD FreshAirIQ Raumkarte

[English](../freshairiq-climate-room-card.md) · [Deutsch](freshairiq-climate-room-card.md)

Raumklima, Lüftungsempfehlung, Schimmelrisiko und optionale Außenwerte mit integriertem Editor.

![FreshAirIQ Klimakarte](../images/climate-card.png)

## Einstieg und Voraussetzungen

Die automatische Datenübernahme verwendet die [FreshAirIQ-Integration](https://github.com/rupascha/freshairiq) und das Attribut `freshairiq_room_payload` des Aktionssensors. Einzelne Messwerte können über eigene Sensoren überschrieben werden. Die Klimakarte rendert ihre Kacheln selbst; für die Collection einschließlich der normalen Raumkarte beachte auch deren [Installationshinweise](room-card.md#installation-und-einstieg).

Lade den Collection-Einstiegspunkt als JavaScript-Modul: `/hacsfiles/ha-card-collection/ha-card-collection.js`, manuell `/local/ha-card-collection/ha-card-collection.js`. Keine zusätzliche Editor-/Darstellungsdatei registrieren. Keine zweite Klimakarten-Kopie zusätzlich zur Collection laden. Wähle SHFD FreshAirIQ Raumkarte oder verwende:

```yaml
type: custom:shfd-freshairiq-room-card
title: Raumklima
rooms:
  - recommendation_entity: sensor.freshairiq_wohnzimmer_aktion
```

Die Innenzeile zeigt Empfehlung, absolute Feuchte, Temperatur und Schimmelrisiko. Ersetze die Beispiel-ID durch deinen Aktionssensor. YAML-Schlüssel sind in Deutsch und Englisch identisch. Der aktuelle Editor verwendet deutsche Beschriftungen; die folgenden Pfade entsprechen diesen tatsächlichen Beschriftungen.

## Editorstruktur und direkte Vorschau

Der Editor hat fünf aufklappbare Hauptbereiche:

| Bereich im Editor | Inhalt |
| --- | --- |
| Kartentitel | Optionaler Titel, Titelschriftgröße und Titelfarbe |
| Innenräume | Vorgaben für alle Innenräume, Aktionssensoren und individuelle Raum-Einstellungen |
| Außenbereich | Außenüberschrift, Spaltenbeschriftungen, Sensoren und Wetter |
| Aussehen | Kachelschrift/-Innenabstände, neutrale Tönung, Abstände, Trennlinien, Kartenfläche, Rahmen und Schatten |
| Messwertfarben | Zustandsfarben und numerische Farbbereiche |

Zugeklappte Überschriften zeigen Zusammenfassungen, beispielsweise Raumanzahl oder eigene Einstellungen. Raumabschnitte verwenden nach Möglichkeit den konfigurierten beziehungsweise aus dem Payload ermittelten Namen und kennzeichnen übernommene Vorgaben oder eigene Anzeigeeinstellungen.

Gültige Änderungen aktualisieren die Vorschau ohne zusätzliche Übernehmen-Schaltfläche für die Darstellung. Gültige Zahlenwerte des Aussehens und Farben werden während der Eingabe angewendet. Normale Textfelder, Entitäts-IDs und numerische Farbbereichs-Untergrenzen werden beim Abschließen der Eingabe übernommen, beispielsweise beim Verlassen des Feldes. Schalter und Auswahllisten wirken unmittelbar. Dauerhaft gespeichert wird die Karte mit **Speichern** im Home-Assistant-Dialog; eine aktualisierte Vorschau allein speichert das Dashboard nicht.

Ungültige oder unvollständige Zahlen-, Farb- und eigene Schatteneingaben zeigen einen Hinweis direkt am Feld. Sie ersetzen nicht den letzten gültigen Vorschauwert. Eingabe korrigieren oder die jeweilige Rücksetzfunktion verwenden. Eine fehlende/nicht verfügbare Entität kann einen Hinweis anzeigen, ohne die Zuordnung zu entfernen. Das Öffnen des Editors erzeugt keine Überschreibungen und speichert keine angezeigten Standardwerte.

### Automatische Werte und einzelne Rücksetzungen

- **Automatisch** entfernt die jeweilige numerische Überschreibung und stellt das responsive beziehungsweise Theme-/Standardverhalten wieder her. Andere Einstellungen bleiben erhalten. Ein leeres Zahlenfeld hat dieselbe Wirkung.
- **Automatisch** bei einer Theme-Farbe stellt deren automatische Farbe wieder her. Bei einem erforderlichen eigenen Hintergrund-/Schattenwert wählt die Rücksetzung auch den passenden Theme-/Standardmodus, damit die Konfiguration gültig bleibt.
- **Standard** bei einer Zustandsfarbe entfernt die ausdrückliche Überschreibung und stellt die automatische Farbauflösung wieder her, einschließlich gegebenenfalls vorhandener älterer Farbkonfiguration.
- **Neutral** leert eine Farbe, wenn ein leerer Farbwert eine neutral getönte Kachel bedeutet. Das ist etwas anderes als das Wiederherstellen der Standard-Zustandsfarbe.
- Text-/Entitätsfelder bieten eine passende Leeren-/Rücksetzfunktion. Ein leerer Kartentitel blendet die Titelzeile aus und erzeugt keinen automatischen Ersatztitel.

Deaktivierte abhängige Felder behalten gespeicherte Werte. Rücksetzschaltflächen benennen ihren Umfang. **Eigene Anzeigeeinstellungen entfernen** betrifft nur die Anzeige-Ausnahmen eines Raums, nicht dessen Sensoren/Name/Icon oder die globalen Vorgaben. **Gesamtes Aussehen zurücksetzen** entfernt `appearance` und `neutral_tint_strength`; Räume, Sensoren, Beschriftungen, Detailoptionen und Messwert-Farbregeln bleiben erhalten.

## Räume und allgemeine Optionen

| Option | Bedeutung / Standard |
| --- | --- |
| `rooms` | Liste der Innenräume; pro Raum Aktionssensor unter `recommendation_entity` zuordnen |
| `title` | Optionale Kartenüberschrift; weglassen oder `title: ""` verwenden, um die Titelzeile mit ihrem eigenen Innenabstand zu entfernen |
| `title_font_size` | Standard 20 px; im Editor ganze Zahlen von 10 bis 72; unabhängig von der Kachelschrift |
| `title_color` | Optionale CSS-Titelfarbe, sonst Theme |
| `neutral_tint_strength` | Neutrale Kacheltönung 0–100 %, Standard 12; 0 transparent |
| `show_header` | Nur Innen-Spaltenbeschriftungen, Standard `true` |
| `show_room_heading` | Innen-Raumüberschriften mit Icon und Namen, Standard `true`; gilt nicht automatisch für außen |
| `details_label_mode` | Aufklapptext für Innenraumdetails, Standard `auto`; Modi siehe unten |
| `column_labels` | Eigene Innen-Spaltenbeschriftungen; fehlender/leerer Text verwendet den Standard |
| `show_details` | Globale Sichtbarkeit der Innenraumdetails, Standard `true` |
| `hide_missing_details` | Fehlende Detailwerte standardmäßig ausblenden (`true`); `false` zeigt Platzhalter |
| `detail_fields` | Globale Innenraum-Detailfeldauswahl; je Raum ersetzbar |
| `appearance` | Darstellung ausschließlich dieser Karteninstanz |

Raumoptionen: `recommendation_entity`, optional `name`, `icon`, `temperature_entity`, `absolute_humidity_entity`, `mould_entity`, `humidity_entity`. Name/Icon und Innenmesswerte stammen ohne Überschreibung aus dem Payload. Eigene Sensoren ersetzen die entsprechenden Payload-Werte. Zusätzlich unterstützt jeder Raum `show_room_heading`, `details_label_mode`, `show_details`, `hide_missing_details` und `detail_fields`.

Zusätzliche Messstellen unter `children` bleiben über YAML unterstützt. Ohne eigene Anzeige-/Detailüberschreibung übernehmen sie die Karten-Vorgaben und nicht die individuellen Überschreibungen des übergeordneten Raums. Beim Verschieben bleiben die Einstellungen beim jeweiligen Raum.

Editorpfade: **Kartentitel** für den Kartentitel; **Innenräume → [Raum]** für Aktionssensor, **Name und Icon anpassen**, **Messwertsensoren ersetzen** und **Von den Vorgaben abweichen**.

## Globale und individuelle Raumdetails

Editorpfad für Vorgaben: **Innenräume → Vorgaben für alle Innenräume → Aufklappbare Raumdetails**. Sie gelten, solange ein Raum die jeweilige Option nicht selbst überschreibt.

| Option am Raum | Verhalten |
| --- | --- |
| `show_details` fehlt | Globale Sichtbarkeit übernehmen |
| `show_details: true` | Details auch bei global deaktivierten Details aktivieren |
| `show_details: false` | Details dieses Raums deaktivieren |
| `hide_missing_details` fehlt | Globale Behandlung fehlender Werte übernehmen |
| `hide_missing_details: true` / `false` | Fehlende Werte lokal ausblenden / als Platzhalter anzeigen |
| `detail_fields` fehlt | Globale Feldauswahl dynamisch übernehmen |
| `detail_fields: [...]` | Globale Liste vollständig ersetzen; keine Zusammenführung |
| `detail_fields: []` | Bewusst keine Felder; kein aufklappbarer Detailbereich |

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

Wohnzimmer folgt globalen Änderungen. Bad nutzt eigene Felder und Platzhalter, übernimmt aber die Sichtbarkeit. Keller hat keine Details. Auch bei aktivierten Details entfällt der Bereich, wenn keine anzeigbaren Felder übrig bleiben.

Je Raum: **Innenräume → [Raum] → Von den Vorgaben abweichen**. Übernommene Optionen zeigen die aktuell wirksame Vorgabe. **Eigene Auswahl** kopiert die aktuelle globale Feldliste; spätere globale Änderungen verändern diese Kopie nicht. Die Liste kann auf Standard gesetzt, vollständig ausgewählt oder geleert werden.

**Eigene Anzeigeeinstellungen entfernen** entfernt die fünf Raumüberschreibungen `show_room_heading`, `details_label_mode`, `show_details`, `hide_missing_details`, `detail_fields`. Sensorzuordnungen, Name/Icon, zusätzliche Messstellen und Karten-Vorgaben bleiben erhalten.

Standardfelder ohne globale/lokale Liste: `reason`, `humidity`, `delta_g_m3`, `surface_rh`, `opening_state`, `measurement_frame_reason`. Nullwerte bleiben sichtbar. Sitzungswerte benötigen eine aktive Lüftung; CO₂ benötigt eine verfügbare Messung. Diese Bedingungen gelten auch bei eingeschalteten Platzhaltern. Außendetails mit Wetter bleiben unabhängig.

## Raumzeile und Detailbeschriftung

Die Raumüberschrift enthält Icon und Namen eines Innenraums. Sie lässt sich global und je Raum anzeigen/ausblenden. Globale Sichtbarkeit: **Innenräume → Vorgaben für alle Innenräume → Überschriften und Beschriftungen**. Aufklapptext: **Aufklappbare Raumdetails → Text zum Aufklappen**.

| `details_label_mode` | Aufklapptext bei vorhandenen Details |
| --- | --- |
| `auto` | `Details` bei sichtbarer Raumüberschrift, sonst Raumname |
| `room_name` | Raumname |
| `details` | `Details` |
| `auto_hide_empty` | Derselbe Text wie bei `auto`; zusätzlich entfällt die Ersatz-Namenszeile, wenn keine Details anzeigbar sind und die Raumüberschrift ausgeblendet ist |

Die ersten drei Modi behalten bei ausgeblendeter Überschrift ohne Details eine schmale, nicht aufklappbare Namenszeile. `auto_hide_empty` entfernt diese Ersatzzeile; der Modus blendet keine ausdrücklich eingeschaltete Überschrift aus und entfernt keine vorhandenen Details.

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

Der konfigurierte Raumname hat Vorrang vor dem Payload-Namen; fehlen beide, gilt `Raum`. Soll der Innenraumname vollständig entfallen, die Überschrift ausschalten und `auto_hide_empty` ohne anzeigbare Details verwenden, beispielsweise mit `show_details: false` oder `detail_fields: []`. Bei vorhandenen Details bleibt der Name im automatischen Kompaktmodus deren Aufklapptext.

## Spaltenüberschriften innen und außen

Die Sichtbarkeit ist unabhängig: `show_header` gilt innen; `outdoor.show_header` außen. Beide sind standardmäßig `true`. Ausblenden entfernt nicht die Raum-/Außenüberschrift, Messwerte oder Wetterdetails.

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

Fehlende, leere oder nur aus Leerzeichen bestehende Texte verwenden den Standard. Beschriftungen ändern weder Sensoren noch Spaltenreihenfolge oder Farben und erscheinen auch in Kachel-Tooltips und zugänglichen Beschriftungen.

Innen: **Innenräume → Vorgaben für alle Innenräume → Überschriften und Beschriftungen → Spaltenbeschriftungen bearbeiten**. Außen: **Außenbereich → Messwerte und Spaltenbeschriftungen → [Spalte]**; jede Gruppe enthält Sensor und Beschriftung gemeinsam. **Standardbeschriftungen verwenden** setzt nur Texte zurück. Beschriftungen bleiben auch ausgeblendet bearbeitbar.

## Außenwerte und Wetter

```yaml
outdoor:
  name: Draußen
  icon: mdi:weather-partly-cloudy
  show_room_heading: false
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

| Außenoption | Bedeutung |
| --- | --- |
| `show_room_heading` | Außenüberschrift mit Icon/Name; Standard `true`, unabhängig von der globalen Innenraumoption |
| `show_header` | Außen-Spaltenbeschriftungen; Standard `true` |
| `name`, `icon` | Eigener Überschriftstext/eigenes Icon; ohne Name gilt `Draußen` |
| `weather_entity` | Optionale Wetterentität für aufklappbare Wetterdetails |
| `show_weather`, `show_forecast` | Beide standardmäßig `true` |
| `forecast_type` | `daily`, `hourly`, `twice_daily`; Unterstützung der Integration erforderlich |

Editor: **Außenbereich → Überschrift und Beschriftungen**. **Außenüberschrift mit Icon anzeigen** betrifft ausschließlich Name/Icon; beim Ausblenden entsteht keine Ersatz-Namenszeile. Messwerte, Spaltenbeschriftungen und Wetterdetails bleiben unabhängig. Name/Icon bleiben ausgeblendet bearbeitbar.

Alle Außensensoren sind optional; fehlende/nicht verfügbare Werte erscheinen als `–`. Es wird kein Taupunkt berechnet. Verwende `dew_point_entity`, nicht `dewpoint_entity`.

Wetterpfad: **Außenbereich → Wetter**. Eine Wetterentität ist erforderlich. Die Vorhersagekarte lädt beim Öffnen der Außendetails, unabhängig von `show_details` für Innenräume. Deaktivierte Felder behalten gespeicherte Werte.

## Kachelschrift und automatische Höhe

Editor: **Aussehen → Wertekacheln**, getrennt für **Innenwerte** und **Außenwerte**.

```yaml
appearance:
  indoor_tile:
    font_size: 13
    padding_vertical: 6
  outdoor_tile:
    font_size: 13
    padding_vertical: 6
```

| Option | Bedeutung | Zulässige Werte |
| --- | --- | --- |
| `appearance.indoor_tile.font_size` | Schriftgröße der Innenkacheln | 8–48 px |
| `appearance.outdoor_tile.font_size` | Schriftgröße der Außenkacheln | 8–48 px |
| `appearance.indoor_tile.padding_vertical` | Innenabstand je oberer/unterer Kante innen | 0–40 px |
| `appearance.outdoor_tile.padding_vertical` | Innenabstand je oberer/unterer Kante außen | 0–40 px |

Dezimalwerte sind möglich. `padding_vertical: 6` bedeutet 6 px oberhalb und 6 px unterhalb des Textes, nicht zusammen 6 px. `0` ist ein eigener Wert; weglassen/leeren bedeutet automatisch.

Es gibt keine feste Kachel-Mindesthöhe. Die benötigte Höhe ergibt sich aus der Höhe des Textblocks einschließlich Zeilenhöhe/Umbruch plus zweimal dem vertikalen Innenabstand. Alle vier Wertekacheln einer Innen- oder Außenzeile übernehmen die von der höchsten Kachel benötigte Zeilenhöhe. Kürzere Inhalte bleiben mittig und können mehr Freiraum als den eingestellten Innenabstand haben. Verschiedene Raumzeilen dürfen unterschiedlich hoch sein. Außenbeschriftungen liegen in einer eigenen gemeinsamen Grid-Zeile; umgebrochene Beschriftungen erzeugen deshalb keine unterschiedlich hohen Wertekacheln.

### Responsive Standardwerte, keine automatische Umrechnung eigener Werte

| Einstellung ohne Überschreibung | Normale Ansichtsbreite | Schmale Ansicht bis einschließlich 380 CSS-px |
| --- | --- | --- |
| Kachelschriftgröße | 14 px | 12 px |
| Innenabstand je oberer/unterer Kante | 9 px | 8 px |

Der Umschaltpunkt richtet sich nach der Browserfensterbreite, nicht nach Geräteerkennung oder Kartenbreite. Ein Smartphone mit mehr als 380 CSS-px Ansichtsbreite kann daher die normalen Standardwerte verwenden. Eigene Werte gelten bei jeder Ansichtsbreite unverändert; es gibt keine proportionale Mobilumrechnung. Schriftgröße kann automatisch bleiben, während der Innenabstand ausdrücklich gesetzt wird, oder umgekehrt.

Die Kacheloptionen ändern weder Kartentitel noch Raumüberschrift, Spaltenbeschriftungen oder Detailtext. Bei kleinen Werten auf gute Les- und Antippbarkeit achten.

`min_height` aus früheren lokalen Kachelgrößen-Tests wird aus Kompatibilitätsgründen angenommen, aber ignoriert. Es gibt kein Editorfeld dafür; bei einer gültig übernommenen Änderung des Aussehens wird der Schlüssel entfernt. Nicht zum Anfordern einer festen Höhe verwenden.

## Messwertfarben

Editor: **Messwertfarben**. Empfehlung und Schimmel verwenden Zustandsfarben. Numerische Messwerte verwenden Farbbereiche, soweit passend mit getrennten Innen-/Außenoptionen. Innenfarben sind standardmäßig aktiv; Außenfarben müssen ausdrücklich aktiviert werden. Ausschalten behält die Regeln bei.

Numerische Bereiche haben genau einen Grundbereich (`above: null`) und eindeutige numerische Untergrenzen. Die höchste passende Untergrenze gilt inklusive. Eine leere Farbe bedeutet neutrale Tönung, nicht die Standard-Zustandsfarbe.

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

Weitere Kategorien: `absolute_humidity`, `relative_humidity`, `dew_point`; Zustandszuordnungen: `color_rules.recommendation.states` und `color_rules.mould.states`. Farboptionen für relative Feuchte und Taupunkt betreffen Außenwerte. Grenzen beziehen sich auf angezeigte Messwerte/Einheiten und sind keine Gesundheits- oder Schimmelbewertung. Hex-Farben in YAML zitieren.

Die neutrale Tönung steht unter **Aussehen → Wertekacheln → Kacheln ohne Messwertfarbe** und verwendet den obersten Schlüssel `neutral_tint_strength`. Sie betrifft nur Kacheln ohne aktive Messwertfarbe. Bei 0 % ist deren Füllung transparent; der Text bleibt deckend.

## Darstellung

Die Darstellung betrifft nur diese Karteninstanz. Abstände, Trennlinien, Kartenhintergrund, Rahmen/Ecken und Schatten entsprechen konzeptionell der [Raumkarte](room-card.md#darstellung); diese Karte hat jedoch eigene Bedienelemente und eine automatische Kachelhöhe.

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

| Option unter `appearance` | Bedeutung / automatisches Verhalten |
| --- | --- |
| `padding` | Innenabstand der Raum-/Außenzeilen: 16 px, schmale Ansicht 12 px; Titel/Innen-Spaltenüberschriften erhalten denselben seitlichen Abstand |
| `indoor_item_gap` | Innen-Kachelabstände und Ausrichtung der Überschriften: 8 px, schmale Ansicht 5 px |
| `outdoor_item_gap` | Horizontaler Außen-Kachelabstand: 8 px, schmale Ansicht 5 px; Abstand zwischen Beschriftungs- und Wertezeile ist unabhängig |
| `item_gap` | Gemeinsamer YAML-Fallback; eigene Innen-/Außenabstände haben Vorrang |
| `section_spacing` | Zusatzabstand, Standard 0, zusätzlich zum vorhandenen Innenabstand; Messstellen unter children behalten ihre bisherigen 14 px plus diesen Wert |
| `indoor_tile`, `outdoor_tile` | Kachelschrift/-Innenabstände wie oben beschrieben |
| `dividers.enabled`, `.width`, `.color` | Standardmäßig aktiv, 1 px, Theme `--divider-color` |
| `background.mode`, `.color` | `theme`, `transparent`, `custom`; eigener Hintergrund benötigt eine Farbe |
| `border.enabled`, `.width`, `.color` | Ohne Überschreibung Theme-Rahmen; eigener Rahmen standardmäßig 1 px mit Theme-Farbe |
| `border.radius` | Ohne Angabe Theme-Radius, Fallback 16 px; unabhängig von der Rahmen-Sichtbarkeit |
| `shadow.mode`, `.value` | `default` belässt den Theme-Schatten; Modi siehe unten |

Eigene Abstände/Innenabstände gelten bei allen Ansichtsbreiten; weggelassene Werte behalten responsive Vorgaben. Abstände/Radius: 0–100 px; Rahmen-/Linienstärken: 0–10 px. `0` ist gültig. `section_spacing` ergänzt vorhandene Abstände, statt sie zu ersetzen. Raumkarten-Schlüssel `status_item_gap`/`device_item_gap` gelten hier nicht.

**Abstände zurücksetzen** entfernt nur Abstandsüberschreibungen. **Automatisch** am einzelnen Feld entfernt nur dessen Wert. Bleibt `item_gap` im YAML bestehen, wird es nach dem automatischen Zurücksetzen eines Innen-/Außenabstands wieder als Fallback wirksam. **Gesamtes Aussehen zurücksetzen** entfernt `appearance` und `neutral_tint_strength`, nicht Messwertfarben oder Inhaltsoptionen.

Hintergrundänderungen betreffen die äußere Kartenfläche, nicht die farbigen oder neutral getönten Kachelfüllungen. Der Rahmen lässt sich unabhängig vom Radius ans Theme zurückgeben. Ungültige erforderliche eigene Farben/Schatten bleiben bis zur Korrektur lokal; ihre automatische Rücksetzung wählt sicher den Theme-/Standardmodus.

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

Die vier Vorlagen entsprechen der Raumkarte. **Als eigenen Schatten bearbeiten** kopiert eine Vorlage ins editierbare CSS-Feld. Beispiel: `shadow: {mode: custom, value: "0 4px 16px rgba(0,0,0,0.25)"}`. Nur den Wert eingeben, keine CSS-Regel/Semikolons. Zum Testen Rahmen ausschalten und `none`/`floating` vergleichen. Schatten liegen außen; Innenabstand schafft keinen Außenplatz und übergeordnete Container können sie abschneiden.

## Vollständiges Beispiel

In eine gemeinsame Kartenkonfiguration einfügen; `appearance`, `outdoor` oder `rooms` nicht doppelt anlegen. Alle Entitäts-IDs durch die eigenen ersetzen.

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
  recommendation: Lüftung
rooms:
  - recommendation_entity: sensor.freshairiq_wohnzimmer_aktion
    name: Wohnzimmer
  - recommendation_entity: sensor.freshairiq_bad_aktion
    name: Bad
    show_details: false
outdoor:
  name: Draußen
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

Titel und obere Raum-/Außenüberschriften sind ausgeblendet. Wohnzimmer behält bei vorhandenen Details seinen Namen als Aufklapptext. Bad hat weder Details noch eine Ersatz-Namenszeile. Außenwetter bleibt bei entsprechender Konfiguration verfügbar. Die vier Kacheln übernehmen jeweils die Höhe ihrer eigenen Zeile, keine globale Höhe über alle Räume hinweg.

## Bedienung und Fehlerbehebung

- Vorschau und Speichern unterscheiden: gültige Änderungen aktualisieren die Vorschau; dauerhaft mit **Speichern** im Home-Assistant-Dialog speichern. Es gibt keinen zusätzlichen Übernehmen-Schritt für das Aussehen.
- Ein Feld verändert die Vorschau nicht: Inline-Fehler prüfen, Eingabe abschließen oder zurücksetzen. Ungültiger Text wird nicht übernommen; der vorherige gültige Wert bleibt aktiv.
- Falsche Version nach einem Update: die tatsächlich geladene Ressourcendatei ersetzen, gegebenenfalls den Ressourcen-Versionsparameter ändern und die Browser-Seite vollständig neu laden. Keine zweite Kartenkopie zusätzlich zur Collection laden.
- Fehlt Unterstützung für `auto_hide_empty`, `indoor_tile` oder `outdoor_tile`, enthält das ausgeführte JavaScript diese Optionen nicht. Zuerst die geladene Ressource prüfen, statt funktionierendes YAML zu ändern.
- Globale Änderung wirkt nicht auf einen Raum: **Von den Vorgaben abweichen** prüfen oder **Eigene Anzeigeeinstellungen entfernen** verwenden.
- Keine Details: `show_details`, `detail_fields: []`, fehlende Daten und bedingte Felder prüfen.
- Raumname bleibt sichtbar: globale/lokale Einstellung `show_room_heading` und Detailmodus prüfen. Vorhandene Details behalten im automatischen Kompaktmodus absichtlich ihre Beschriftung.
- Außenname bleibt sichtbar: `outdoor.show_room_heading: false` verwenden; weder globales `show_room_heading` noch `outdoor.show_header` steuert ihn.
- Kein Kartentitel: `title` leeren/weglassen. Keine Spaltenbeschriftungen: `show_header` innen/außen unabhängig prüfen; leere Beschriftungen verwenden den Standard, statt sie auszublenden.
- Eigene Werte schrumpfen mobil nicht: ausdrücklich gesetzte Kachelwerte gelten überall unverändert; automatische schmale Vorgaben verwenden einen Umschaltpunkt bei 380 CSS-px Ansichtsbreite.
- Unterschiedliche Höhen zwischen Räumen: bei inhaltsabhängiger Höhe beabsichtigt. Wertekacheln derselben Zeile bleiben gleich hoch.
- Fehlende Messwerte: Aktionssensor/Payload und eigene Sensoren prüfen. Fehlendes Wetter: Entität, Integration, Vorhersagetyp und Außendetails prüfen.
- Payload-Werte öffnen die Detailansicht des Aktionssensors; eigene Sensoren öffnen ihre eigene Detailansicht. Eine automatische Auflösung separater Detailziele für Payload-Werte ist nicht implementiert.
- Bestehende YAML-Schlüssel bleiben nutzbar. Die bewusste visuelle Änderung ist die automatische Kachelhöhe statt früherer fester Mindesthöhen; der Editor benötigt außerdem keine zusätzliche Übernehmen-Schaltfläche für das Aussehen mehr.
