# SHFD Raumkarte

[English](../room-card.md) · [Deutsch](room-card.md)

Eine konfigurierbare Home-Assistant-Raumkarte mit visuellem Editor.

Kombiniere Raumstatus, Beleuchtung, Szenen, Schalter, Rollläden, Thermostate, Mediaplayer und Wecker in einer Karte. Leere Bereiche werden ausgeblendet.

![SHFD Raumkarte mit Statusanzeigen und Raumsteuerungen](../images/room-card.png)

## Installation

Installiere [Mushroom](https://github.com/piitaya/lovelace-mushroom) und [UIX](https://github.com/Lint-Free-Technology/uix). Registriere anschließend den Collection-Einstiegspunkt als JavaScript-Modul-Ressource:

```text
/hacsfiles/ha-card-collection/ha-card-collection.js
```

Für eine manuelle Installation verwende:

```text
/local/ha-card-collection/ha-card-collection.js
```

Registriere `raumkarte.js` nicht separat. Lade Home Assistant nach Änderungen an den Ressourcen neu.

## Karte hinzufügen

Wähle **SHFD Raumkarte** im Kartenwähler oder füge die Karte in YAML hinzu:

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

## Konfiguration

| Option | Beschreibung |
| --- | --- |
| `raum` | Raumtitel; erforderlich |
| `anwesenheit` | Optionale Personen-Entität für die Anwesenheitsanzeige |
| `title_color` | Optionale dynamische Farbregeln für den Titel |
| `layout` | Optionale Reihenfolge, Spalten und Sichtbarkeit der Bereiche |
| `status_items` | Fenster, Tür, Bewegung, Rauch, Schloss, Temperatur, Feuchtigkeit und Lüftung |
| `wecker` | Weckerzeiten und optionale Lichtwecker-Automatisierungen |
| `szenen` | Szenen |
| `lampen` | Lampen |
| `schalter` | Schalter |
| `rolllaeden` | Rollläden und Abdeckungen |
| `thermostate` | Klima-Entitäten |
| `mediaplayer` | Mediaplayer |

Jeder Eintrag in einem Bereich benötigt eine `entity`. Die meisten Bereiche unterstützen zusätzlich einen optionalen `name`. Einträge ohne Entität werden ausgeblendet.

## Layout

Mit `layout` änderst du Reihenfolge, Spaltenanzahl und Sichtbarkeit der Inhaltsbereiche. Der Kopf wird immer zuerst angezeigt.

```yaml
layout:
  order:
    - lampen
    - status_items
    - szenen

  sections:
    lampen:
      columns: 2

    status_items:
      columns: 4

    wecker:
      visible: false
```

| Option | Beschreibung |
| --- | --- |
| `order` | Geordnete Liste der Bereichsschlüssel; ausgelassene Bereiche behalten ihre Standardreihenfolge |
| `sections.<key>.columns` | Grid-Spalten von 1 bis 6 |
| `sections.<key>.visible` | Auf `false` setzen, um einen Bereich auszublenden |

Verfügbare Bereichsschlüssel sind `status_items`, `wecker`, `szenen`, `lampen`, `schalter`, `rolllaeden`, `thermostate` und `mediaplayer`.

Ausgeblendete Bereiche behalten ihre konfigurierten Einträge. Leere Bereiche bleiben ausgeblendet, auch wenn `visible` auf `true` steht.

## Titelfarben

Die Titelfarbe kann sich ändern, wenn Lampen mit passenden Labels eingeschaltet sind:

```yaml
title_color:
  room_label: Wohnzimmer
  default: "var(--primary-text-color)"
  rules:
    - label: Hauptbeleuchtung
      color: "#FFD600"
```

Die erste passende Regel gewinnt. Unterstützte Farben sind Hex-Werte, CSS-Farbnamen und einfache CSS-Variablen.

## Wecker

Wecker-Entitäten müssen die Attribute `hour` und `minute` bereitstellen. Optional kannst du eine Lichtwecker-Automatisierung hinzufügen:

```yaml
wecker:
  - entity: input_datetime.schlafzimmer_wecker
    name: Wecker
    lichtwecker: automation.schlafzimmer_lichtwecker
    lichtwecker_name: Lichtwecker
```

## Fehlerbehebung

- **Karte fehlt:** Prüfe, ob der Collection-Einstiegspunkt als JavaScript-Modul registriert ist.
- **Keine Styles oder Steuerungen:** Stelle sicher, dass Mushroom und UIX installiert und geladen sind.
- **Editor öffnet sich nicht:** Stelle sicher, dass `raumkarte.js` installiert ist, und lade die komplette Browser-Seite neu.
- **Änderungen erscheinen nicht:** Lade die komplette Home-Assistant-Seite neu und leere bei Bedarf den Browser-Cache.
- **Layout-Fehler:** Prüfe, dass `layout.order` keine unbekannten oder doppelten Bereichsschlüssel enthält und `columns` zwischen 1 und 6 liegt.
