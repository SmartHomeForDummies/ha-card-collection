# SHFD Custom Cards

A collection of custom Home Assistant dashboard cards by
SmartHome for Dummies (SHFD).

The cards are installed as a dashboard package.
No custom Python integration or `shfd_custom_cards:` YAML
configuration is required.

## Available cards

| Card | Documentation |
| --- | --- |
| Room Card | [Configuration and examples](docs/room-card.md) |

## Requirements

The Room Card requires the following frontend dependencies:

- Mushroom
- UIX

Install and configure these dependencies before using the card.

## Installation with HACS

1. Open HACS in Home Assistant.
2. Open the menu and select **Custom repositories**.
3. Add this repository:

   ```text
   https://github.com/SmartHomeForDummies/ha-card-collection
   ```

4. Select **Dashboard** as the repository type.
5. Add the repository and download **SHFD Custom Cards**.

### Dashboard resource

After downloading, check whether the following resource is
registered under **Settings → Dashboards → Resources**:

```text
/hacsfiles/ha-card-collection/ha-card-collection.js
```

The resource type must be **JavaScript Module**.

If the resource is missing, add it manually.
Do not add a duplicate if it is already registered.

Only the collection entry point needs to be registered.
Do not add `raumkarte.js` or `raumkarte-editor.js` as separate
dashboard resources.

Reload the browser page after installation.

## Manual installation

1. Create this directory in your Home Assistant configuration:

   ```text
   www/ha-card-collection/
   ```

2. Copy all JavaScript files from this repository's `dist/`
   directory into it. Keep the files together without renaming them.

3. Add the following dashboard resource:

   ```text
   /local/ha-card-collection/ha-card-collection.js
   ```

4. Select **JavaScript Module** as the resource type.
5. Reload the browser page.

## Add a Room Card

Add a manual card to your dashboard:

```yaml
type: custom:raum-karte
raum: Living Room
```

Use the visual editor to configure the card's sections,
entities and title colors.

See the card documentation for complete configuration examples.

## Migration from the previous integration

Previous versions served the cards through the
`shfd_custom_cards` Python integration.

The dashboard package replaces that integration.

1. Back up your existing dashboard configuration.
2. Install the dashboard package using one of the methods above.
3. Replace the old Room Card resource:

   ```text
   /shfd_custom_cards/room_card/raumkarte.js
   ```

   with the collection entry point for your installation method.

4. Remove the old resource entry, including any version query string.
   Do not load the old and new versions at the same time.
5. Remove the `shfd_custom_cards:` entry from your YAML configuration.
6. Restart Home Assistant to unload the old integration.
7. After confirming that the cards work, remove the old
   `custom_components/shfd_custom_cards/` directory.

Before removing the old integration, migrate any other resources
that still use `/shfd_custom_cards/` URLs.

The Room Card type remains `custom:raum-karte`.
Existing card configurations do not need to be renamed.

## Updates

For HACS installations, download updates through HACS.

For manual installations, replace all JavaScript files with
the files from the same release.

Reload the browser page after updating. If an old version is
still displayed, clear the browser cache and reload again.

## Troubleshooting

If Home Assistant reports that `raum-karte` does not exist:

- Check that the collection entry point is registered as a
  JavaScript Module.
- Check that all JavaScript files were downloaded or copied.
- Check that the required frontend dependencies are installed.
- Remove duplicate or outdated resource entries.
- Reload the browser page.
