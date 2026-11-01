# SHFD Markdown-Tabellenkarte

[English](../markdown-table-card.md) · [Deutsch](markdown-table-card.md) · [Collection](../../README.md)

Konfigurierbare Tabellen für Entitätszustände, Attribute, Jinja und Text. Native Home-Assistant-Komponenten; Mushroom, UIX und FreshAirIQ sind nicht erforderlich.

## Vorschau

![Vorschau der SHFD Markdown-Tabellenkarte](https://raw.githubusercontent.com/SmartHomeForDummies/ha-card-collection/9799b54a8365fc3421ed2fceb5171ca471a32733/docs/images/markdown-table-card.png)

## Installation und Einstieg

Der [Collection-Installation](../../README.md#installation-with-hacs) folgen. Zusammenpassende `dist/`-Dateien gemeinsam installieren und nur `ha-card-collection.js` registrieren. Branch-Änderungen sind nicht automatisch Teil eines veröffentlichten Releases.

**SHFD Markdown-Tabelle** im Picker wählen. Die Vorschau liefert bearbeitbare statische Beispiele, keine Live-Messungen. Dafür sind keine Entitätssuche, Serviceaufrufe oder Template-Anfragen nötig.

```yaml
type: custom:shfd-markdown-table-card
title: Raumübersicht
row_header: Raum
columns:
  - name: Temperatur
    precision: 1
rows:
  - name: Wohnzimmer
    cells:
      - type: entity
        entity: sensor.wohnzimmer_temperatur
```

ID ersetzen. Antippen einer verfügbaren Entität öffnet den Detaildialog. YAML-Schlüssel sind in beiden Sprachen identisch.

## Editor

- **Tabelle:** Titel, Abmessungen, Beschriftung/Sichtbarkeit der Überschriften.
- **Tabellenlayout:** Textdarstellung, Zeilenabstand, Breiten einschließlich Raum, Scrollen.
- **Gestaltung:** Schrift, Linien, Überschriften- und wechselnde Zeilenfüllungen.
- **Inhalte und Formatierung:** Zellauswahl, Quellen, Anzeigevorgaben/-ausnahmen, Regeln, Aktionen.

Gültige Änderungen aktualisieren die Vorschau sofort; dauerhaft mit Home Assistants Speichern-Schaltfläche sichern. Keine allgemeine Übernehmen-Schaltfläche. Destruktive Zeilen-/Spaltenaktionen und Regelersetzung haben Bestätigungen. Rückgängig/Wiederholen umfasst 20 Sitzungsschritte; Schließen/externe Änderungen können den Verlauf zurücksetzen. Zwischenablagen sind intern, keine Betriebssystem-Zwischenablage.

Verkleinern blendet gespeicherte Zellen aus; Vergrößern stellt sie wieder her. Löschen entfernt Daten. Ganze Zeilen-/Spaltenoperationen können ausgeblendete Inhalte einschließen; Regelübertragung betrifft nur sichtbare Zellen.

## Quellen und Anzeige

Wurzeloptionen: `title` (leer blendet ihn aus), `row_header`, `row_count`, `column_count`, `show_row_headers`, `show_column_headers`. Anzahlen können aus den Listen ermittelt werden; beide Sichtbarkeiten sind standardmäßig `true`. Eine Zeile besitzt `name` und `cells` in Wertspalten-Reihenfolge.

| Quelle | Zellfelder |
| --- | --- |
| Entität | `type: entity`, `entity`; optional `attribute`, eigener Einheitentext `unit` |
| Jinja | `type: template`, `template` |
| Text | `type: text`, `text`; Fett/Kursiv, Inline-Code, Links; kein Roh-HTML/Bilder |

Quellenwechsel behält inaktive Eingaben. Templates/Text werden nicht numerisch umformatiert oder übersetzt. Jinja erhält `row.name`, `column.name`, die bei 1 beginnenden `row.index`, `column.index`, `row_index`, `column_index` und den verfügbaren Anzeigenamen in `user`.

Anzeigevererbung: Zelle → Spalte → `defaults` → eingebauter Standard. Optionen: `precision` 0–6 Nachkommastellen (weggelassen: automatisch), `show_unit` (Standard `true`), `translate_state` (Standard `false`), `align` (`left`, `center`, `right`; Standard `left`). Übersetzt werden nichtnumerische Entitätszustände, keine Attribute. Attribute erhalten die Zustandseinheit nicht automatisch. Einheitentexte rechnen keine Werte um. Standard übernehmen entfernt eine Ausnahme.

## Layout und Gestaltung

`layout.text`: `single` (Standard) oder `multi`. Je Spalte: `wrap: truncate` einzeilig mit `…`; `wrap: normal` mehrzeilig; weglassen übernimmt den Standard. Älteres `nowrap` wird ebenfalls einzeilig mit Auslassungspunkten dargestellt. Der vollständige einzeilige Text bleibt als Tooltip verfügbar. Mehrzeilig bricht an Wortgrenzen und bei Bedarf in langen Wörtern um; die Höhe wächst automatisch.

Spalten-`width` weglassen für automatische Breite; fest sind ganze 40–1000 px, die nicht zusammengedrückt werden. Breite Tabellen scrollen horizontal. Keine Zellbreiten/festen Zeilenhöhen. `layout.row_header` erlaubt eigene `width` und `text`. `layout.spacing`: `compact`, `normal` (Standard), `airy`.

Unter `appearance`: `font_size` 8–32 px (Standard 14), optionales `max_height` 120–1200 px für den sichtbaren Bereich, boolesche `grid`, `striped`, `sticky_headers` (Standard `true`). Füllobjekte: `column_header_background`, `row_header_background`, `row_backgrounds.odd`/`.even`; jeweils `mode` (`theme`, `transparent`, `custom`), `color`, ganzzahliges `opacity` 0–100. Eigene Farbe erfordert einen Farbwert. Kontrast und transparente fixierte Überschriften prüfen.

Layout zurücksetzen erhält Inhalte, Regeln, Ausrichtung und Scroll-Einstellungen. Ältere globale Breiten-/Umbruchangaben bleiben durch Migration lesbar.

## Farb- und Icon-Regeln

`rules` an Wertspalten/Zellen, nicht Zeilenbeschriftungen. Zellregeln ersetzen den gesamten Spaltensatz. Zellregeln weglassen übernimmt die Spalte; `rules: {enabled: false}` schaltet ohne Rückfall auf die Spalte aus.

Messwertregeln als Bestandteil einer Spalte oder Zelle:

```yaml
rules:
  mode: ranges
  ranges:
    - above: null
      color: "#90CAF9"
    - above: 18
      color: "#A5D6A7"
    - above: 24
      color: "#FFE082"
  targets:
    icon: true
    text: false
    background: true
  background_opacity: 20
```

Genau ein Grundbereich, eindeutige numerische Grenzen; die höchste passende Grenze gilt einschließlich und unabhängig von der Reihenfolge. Ungültige Messwerte zählen nicht als 0. Numerische Templates müssen reine Zahlen ohne Einheit liefern.

Zustandsregeln verwenden `mode: states` und `states: [{value: "on", color: "#A5D6A7", icon: "mdi:window-open-variant"}]`. Verglichen wird der exakte Rohwert vor Übersetzung/Rundung. Vorschläge erlauben freie Eingaben und garantieren nicht alle künftig möglichen Zustände.

`targets.icon` ist standardmäßig `true`; ohne Icon erscheint ein Statuspunkt. Text-/Hintergrundziel sind standardmäßig `false`. Leere Farbe bedeutet keine Regelfarbe. `background_opacity`: 0–100, Standard 20; positive Regelfüllungen überlagern wechselnde Zeilenfüllungen. Hexfarben in Anführungszeichen setzen. Keine Einheitenumrechnung; Grenzen und Kontrast prüfen.

## Regeln übertragen

Unter **Nur Farb- und Icon-Regeln übertragen**: Quelle wählen → Wirksame Regeln kopieren → Zielzellen auswählen → Matrixzellen/Zeile/Spalte markieren → Übertragung prüfen → Regeln auf N Zellen anwenden. Matrixklick markiert im Zielmodus statt zu bearbeiten; Pfeiltasten bewegen den Fokus, Enter/Leertaste aktiviert eine Zelle. Abbrechen verändert nichts.

Aktive geerbte Regeln sind kopierbar. Ziele erhalten unabhängige eigene Kopien statt bisheriger Regeln, auch ausgeschalteter. Quellen, Templates, Text, Einheiten, Nachkommastellen und andere Anzeigevorgaben bleiben erhalten. Ein Rückgängig-Schritt stellt Vorgang und vorherige Vererbung wieder her. Kopien folgen späteren Quelländerungen nicht; für gemeinsame Pflege Spaltenregeln verwenden.

Maximal 500 sichtbare Ziele; zu große Auswahl wird vollständig abgewiesen. Konfigurationsänderungen beenden veraltete Auswahlen; geänderte Bestätigungen/Hinweise erfordern erneute Prüfung. Keine Zustandsumbenennung/Einheitenumrechnung; Hinweise ersetzen keine fachliche Prüfung. Zwischenablage wird beim Schließen geleert.

## Grenzen und Fehlerbehebung

Maximal 100 gespeicherte Zeilen, 20 Wertspalten plus optionale Zeilenüberschrift, 100 aktive sichtbare Templates, 50 Einträge je Zustands-/Bereichsliste.

Picker fehlt: passende Lader-/Karten-/Picker-Dateien, doppelte Ressourcen und vollständiges Neuladen prüfen. Statische Werte: Beispiele ersetzen. Farben: Rohwert, Vererbung, Darstellungsziele und Einheiten prüfen. Templatefehler erscheinen an der Zelle; ausgeblendete Templates werden nicht abonniert.

Entwicklungsdokumentation ist keine Browserfreigabe. Vorschau, native Selektoren, Themes, Touch/Tastatur und echte Backenddaten lokal prüfen.
