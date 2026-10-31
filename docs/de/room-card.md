# SHFD Raumkarte

[English](../room-card.md) · [Deutsch](room-card.md)

Eine Home-Assistant-Raumkarte mit integriertem visuellem Editor: Status, Beleuchtung, Szenen, Schalter, Rollläden, Thermostate, Medien, Wecker und eigene Bereiche. Leere Bereiche und Einträge ohne Entität bleiben ausgeblendet.

![SHFD Raumkarte](../images/room-card.png)

## Installation und Einstieg

Installiere [Mushroom](https://github.com/piitaya/lovelace-mushroom) und [UIX](https://github.com/Lint-Free-Technology/uix). Registriere den Collection-Einstiegspunkt als JavaScript-Modul:

```text
/hacsfiles/ha-card-collection/ha-card-collection.js
```

Manuell: `/local/ha-card-collection/ha-card-collection.js`. Bei dieser Installation `raumkarte.js` nicht zusätzlich registrieren. Separate Editor-, CSS- oder Farberweiterungsdateien sind nicht erforderlich. Nach Ressourcenänderungen die vollständige Browser-Seite neu laden.

Wähle SHFD Raumkarte im Kartenwähler oder verwende:

```yaml
type: custom:raum-karte
raum: Wohnzimmer
status_items:
  - entity: binary_sensor.wohnzimmer_fenster
    name: Fenster
    kind: window
lampen:
  - entity: light.wohnzimmer_decke
    name: Deckenlicht
```

## Vorschau im Kartenwähler

Der Picker verwendet echte verfügbare Entitäten und bevorzugt einen gemeinsamen Home-Assistant-Bereich. Die direkte Bereichszuordnung einer Entität hat Vorrang vor der Zuordnung ihres Geräts. Der Bereich mit der vielseitigsten passenden Ausstattung wird gewählt; fehlende Gerätetypen werden nicht aus anderen Bereichen ergänzt.

Die Vorschau enthält höchstens einen Fenster-/Türkontakt, je einen Temperatur- und Feuchtigkeitssensor, zwei Lichter sowie ein Thermostat oder alternativ einen Rollladen. Statusnamen sind Fenster, Tür, Temperatur und Luftfeuchte. Lichtnamen bleiben erhalten; unterschiedliche Geräte und Hauptleuchten werden gegenüber Segmenten bevorzugt. Ohne Gerätezuordnung ist diese Unterscheidung nicht sicher möglich.

Luftfeuchtigkeit wird über `device_class: humidity` erkannt, nicht nur über `%`. Ungültige Messwerte und verfügbare Registry-Markierungen für versteckte, deaktivierte oder Diagnose-/Konfigurationsentitäten werden berücksichtigt. Ohne nutzbare Bereichszuordnung entsteht eine neutrale Raumübersicht. Es werden keine Entitäten oder Messwerte erfunden. Die Auswahl ist eine bearbeitbare Startkonfiguration, keine dauerhafte automatische Raumzuordnung; enthaltene Bedienelemente steuern echte Entitäten.

## Konfiguration

| Option | Bedeutung |
| --- | --- |
| `raum` | Erforderlicher Raumtitel |
| `anwesenheit` | Optionale `person`-Entität |
| `title_color` | Dynamische Titelfarben |
| `layout` | Bereichsreihenfolge, Spalten, Sichtbarkeit |
| `appearance` | Darstellung dieser Karteninstanz |
| `status_items` | Statusanzeigen und Messwerte |
| `wecker` | Wecker und Lichtwecker-Automatisierungen |
| `szenen`, `lampen`, `schalter` | Szenen, Lichter, Schalter |
| `rolllaeden`, `thermostate`, `mediaplayer` | Covers, Klima, Medien |
| `custom_sections` | Eigene Bereiche |

Einträge benötigen zum Anzeigen `entity` und unterstützen meist optional `name`. Leere Einträge sind beim Bearbeiten erlaubt. YAML-Schlüssel sind in beiden Dokumentationssprachen identisch.

## Eigene Bereiche und Layout

```yaml
custom_sections:
  - key: sensoren
    title: Sensoren
    domain: sensor
    columns: 3
    visible: true
    items:
      - entity: sensor.wohnzimmer_temperatur
        name: Temperatur
        icon: mdi:thermometer
        icon_color: "#FFB74D"
layout:
  order:
    - status_items
    - sensoren
    - lampen
  sections:
    sensoren:
      columns: 2
    wecker:
      visible: false
```

`key` muss eindeutig, nicht leer und verschieden von festen Bereichsschlüsseln sein. `title` ist erforderlich, dient aber nur Editor/Layout: eigene Bereiche haben im Dashboard keine zusätzliche Überschrift und kein Bereichs-Icon. `columns` erlaubt 1–6, Standard 3; `visible` ist standardmäßig `true`. `items` unterstützen `entity`, `name`, `icon`, `icon_color`.

`domain` begrenzt nur die Entitätsauswahl im Editor; weglassen oder `""` bedeutet Beliebig. Ein Filterwechsel löscht keine Einträge. Eigene Einträge sind generische Mushroom-Entitätskarten mit Detailansicht beim Antippen, keine spezialisierten Licht-/Szenen-/Cover-Steuerungen.

Feste Schlüssel: `status_items`, `wecker`, `szenen`, `lampen`, `schalter`, `rolllaeden`, `thermostate`, `mediaplayer`. Hinzu kommen eigene `key`-Werte. Jeder eigene Bereich ist einzeln verschiebbar. Fehlende Schlüssel in `order` werden anschließend in Standardreihenfolge ergänzt; Duplikate sind unzulässig. `layout.sections.<key>` überschreibt `columns` und `visible`. Leere Bereiche bleiben unsichtbar; ausgeblendete Einträge bleiben gespeichert. Der Kopf steht immer zuerst.

Im Editor: Layout → Nach oben/Nach unten → Layout übernehmen.

## Statusarten

| `kind` | Zustände / Darstellung |
| --- | --- |
| `window`, `door` | `on` offen, `off` geschlossen; Icon und Farbe je Zustand |
| `motion` | `on` erkannt, `off` keine Bewegung/abwesend |
| `smoke` | `on` Alarm, `off` OK |
| `lock` | `locked`, `unlocked`, `locking`, `unlocking`, `jammed`, `open`, `opening` |
| `ventilation` | `wait`, `ventilate`, `ok`, `do_not_ventilate`, `close`; festes Icon, Zustandsfarben |
| `temperature`, `humidity` | Messwert; festes Icon, wertabhängige Farbe |

Lüftungszustände hängen vom Sensor ab. Zusätzliche ausdrücklich konfigurierte Zustände sind per YAML möglich, aber nicht als zusätzliche Zustandszeilen im Editor.

```yaml
status_items:
  - entity: binary_sensor.wohnzimmer_fenster
    name: Fenster
    kind: window
    states:
      "on":
        label: Offen
        icon: mdi:window-open-variant
        color: "#EF9A9A"
      "off":
        label: Geschlossen
        icon: mdi:window-closed-variant
        color: "#A5D6A7"
```

`label`, `icon`, `color` sind optional. Nicht überschriebene Werte verwenden die Vorgaben; explizites `color: ""` bedeutet neutral. Ein festes `icon`/`icon_color` am Eintrag überschreibt die entsprechende Zustandsregel, nicht aber die Fehleranzeige. Das Lüftungs-Icon bleibt immer fest.

### Fehlerzustände

`unknown` zeigt Unbekannt; `unavailable`, `none` und leere Zustände zeigen Nicht verfügbar. Nicht erkannte und nicht ausdrücklich konfigurierte Zustände zeigen Unerwarteter Zustand mit dem Rohwert. Alle erhalten graues Haupticon und rotes Ausrufezeichen-Badge. Bei Messwertarten werden nur numerische Werte normal dargestellt; ungültige Werte werden nicht als `0` behandelt. Ein beliebiges `error` wird somit nicht mehr als Grün/OK dargestellt.

## Messwertfarben und Farbauswahl

```yaml
status_items:
  - entity: sensor.wohnzimmer_temperatur
    name: Temperatur
    kind: temperature
    colors_enabled: true
    ranges:
      - above: null
        color: "#90CAF9"
      - above: 18
        color: "#A5D6A7"
      - above: 24
        color: "#FFE082"
      - above: 26
        color: "#FFB74D"
```

Genau ein `above: null` ist der Grundbereich. Numerische Untergrenzen müssen eindeutig sein. Die höchste passende Grenze gewinnt unabhängig von der Reihenfolge und gilt inklusive: 18 gehört bereits zu `above: 18`. Leere Farbe bedeutet neutral; `colors_enabled: false` deaktiviert Farben ohne Löschen der Regeln. Fehler bleiben grau.

Ohne `ranges`: Temperatur Grundfarbe `#90CAF9`, ab 18 `#A5D6A7`, 24 `#FFE082`, 26 `#FFB74D`, 28 `#EF9A9A`; Feuchtigkeit Grundfarbe `#90CAF9`, ab 40 `#A5D6A7`, 70 `#FFE082`, 85 `#FFB74D`. Vorgaben beziehen sich auf °C bzw. relative Feuchte in %. Keine Einheitenumrechnung; bei anderen Einheiten Grenzen anpassen. Farben sind Darstellungshilfen, keine Gesundheits-/Schimmelbewertung.

Alte `below`-/`from`-/`to`-Regeln bleiben mit ihrer bisherigen Reihenfolge wirksam. Der Editor weist darauf hin. Standardfarben wiederherstellen ersetzt diese Regeln und entfernt eine ältere feste `icon_color`-Überschreibung. Der einzige Grundbereich ist gegen Entfernen geschützt.

Farbfelder bieten Color-Picker und Texteingabe für CSS-Farben einschließlich Hex, Namen, `rgb(...)`, `hsl(...)` und einfacher Theme-Variablen. Hex-Werte in YAML zitieren. Leere optionale feste Farben entfernen die Überschreibung; Szenen fallen ohne `icon_color` auf ihre Standardfarbe zurück.

## Darstellung

Alle Optionen unter `appearance` gelten nur für diese Karte. Ohne Überschreibungen bleibt das bisherige Aussehen erhalten; `0` ist gültig. Farben über den vorhandenen Color-Picker wählen.

```yaml
appearance:
  padding: 6
  status_item_gap: 8
  device_item_gap: 10
  section_spacing: 16
  dividers:
    enabled: true
    width: 1
    color: "rgba(255,255,255,0.12)"
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

Dieses Beispiel setzt einen eigenen Bereichsabstand; es ist nicht die unveränderte Standardkonfiguration.

| Option | Bedeutung / Standard |
| --- | --- |
| `padding` | Abstand zum Kartenrand, 6 px |
| `status_item_gap` | Grid-Abstand zwischen Statusanzeigen, 8 px |
| `device_item_gap` | Grid-Abstand in Geräte- und eigenen Bereichen, 10 px |
| `item_gap` | Gemeinsamer YAML-Fallback für beide Grids; spezifische Werte haben Vorrang |
| `section_spacing` | Eigener Freiraum zwischen Inhaltsbereichen; ohne Option bleiben bisherige Abstände erhalten |
| `dividers.enabled`, `.width`, `.color` | Trennlinien: `true`, 1 px, `rgba(255,255,255,0.12)` |
| `background.mode`, `.color` | `theme` (Standard), `transparent`, `custom`; eigene Farbe bei `custom` erforderlich |
| `border.enabled`, `.width`, `.color`, `.radius` | Rahmen: `true`, 1 px, `rgba(255,255,255,0.20)`, 18 px |
| `shadow.mode`, `.value` | Standard `default`; siehe Schattenvorlagen |

Abstände und Radius: 0–100 px; Rahmen-/Linienstärke: 0–10 px. Der Grid-Abstand wirkt zwischen Einträgen, nicht innerhalb einer Mushroom-Karte; bei nur einem Eintrag gibt es keinen Abstand zu einem zweiten. `section_spacing` ersetzt die bisherigen Bereichs-/Stack-Abstände; die Linienbreite kommt hinzu, der Kopf bleibt unverändert. Leere Bereiche erzeugen keine Linien, unter dem letzten sichtbaren Bereich gibt es keine Linie.

Im Editor ist Bisherige Bereichsabstände beibehalten standardmäßig aktiv. Erst beim Ausschalten wird ein eigener Abstand mit 16 px als Startwert verwendet; 16 ist nicht der gemessene bisherige Gesamtabstand. Standardabstände wiederherstellen setzt nur Abstände zurück. Darstellung übernehmen speichert die Änderungen. Darstellung auf Standard zurücksetzen entfernt nur `appearance`, nicht Entitäten, Statusfarben oder Layout. Das Öffnen des Editors speichert keine angezeigten Vorgabewerte.

### Schattenvorlagen

| `shadow.mode` | CSS-Wert |
| --- | --- |
| `default` | Bisheriger kombinierter Raumkarten-Schatten |
| `none` | Kein Schatten |
| `subtle` | `0 1px 3px rgba(0, 0, 0, 0.18)` |
| `soft` | `0 4px 12px rgba(0, 0, 0, 0.22)` |
| `strong` | `0 8px 24px rgba(0, 0, 0, 0.30)` |
| `floating` | `0 12px 32px rgba(0, 0, 0, 0.35)` |
| `custom` | Eigener gültiger CSS-Wert in `shadow.value` |

Vorlagen lassen sich über Als eigenen Schatten bearbeiten ins CSS-Feld übernehmen. Beispiel: `shadow: {mode: custom, value: "0 4px 16px rgba(0,0,0,0.25)"}`. Keine vollständige CSS-Regel und kein Semikolon eingeben. Bei dunklem Hintergrund kann Schwarz unauffällig sein; zum Test Rahmen ausschalten und zwischen `none` und `floating` vergleichen. Schatten benötigen außen sichtbare Fläche und können durch übergeordnete Container abgeschnitten werden. `padding` schafft nur Innenabstand. Transparenter Hintergrund macht nicht Texte/Icons transparent.

## Titelfarben und Wecker

```yaml
title_color:
  room_label: Wohnzimmer
  default: "var(--primary-text-color)"
  rules:
    - label: Hauptbeleuchtung
      color: "#FFD600"
wecker:
  - entity: input_datetime.schlafzimmer_wecker
    name: Wecker
    lichtwecker: automation.schlafzimmer_lichtwecker
    lichtwecker_name: Lichtwecker
```

Die erste Titelfarbregel mit eingeschalteter Lampe und beiden Labels gewinnt; ohne `room_label` gilt der Raumname, ohne Treffer `default`. Im Editor Farbregeln übernehmen verwenden. Wecker benötigen `hour` und `minute`; die Lichtwecker-Automatisierung ist optional.

## Fehlerbehebung

- Fehlende Karte/Styles: Collection-Ressource, Mushroom und UIX prüfen; keine alte Farberweiterung parallel laden.
- Änderungen fehlen: Übernehmen anklicken, vollständige Browser-Seite neu laden, gegebenenfalls Cache leeren.
- Farbe greift nicht: Rohzustand und feste Überschreibungen prüfen; Fehleranzeige hat Vorrang.
- Eigener Bereich bleibt unten: einzeln im Layout verschieben und Layout übernehmen.
- Bereich gelöscht: bei Bedarf dessen Schlüssel aus `layout.order` und `layout.sections` entfernen.
- Layoutfehler: nur bekannte, eindeutige Bereichsschlüssel und 1–6 Spalten verwenden.
- Weitere Hinweise zur anderen Abstandssemantik: [Klimakarte](freshairiq-climate-room-card.md).
