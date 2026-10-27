# SHFD Custom Cards

A collection of custom Home Assistant dashboard cards by
SmartHome for Dummies (SHFD).

The included integration serves the card files directly from
`custom_components/shfd_custom_cards`. No files need to be
placed in the `www` directory.

## Available cards

| Card | Documentation |
| --- | --- |
| Room Card | [Installation and configuration](custom_components/shfd_custom_cards/frontend/room_card/README.md) |

Each card has its own documentation covering features,
dependencies, resource URLs and configuration.

## Installation

1. Download this repository using **Code → Download ZIP**
   and extract the archive.
2. Copy `custom_components/shfd_custom_cards` into your
   Home Assistant configuration directory:

   ```text
   <config>/custom_components/shfd_custom_cards/
   ```

3. Add the following entry to `configuration.yaml`:

   ```yaml
   shfd_custom_cards:
   ```

4. Restart Home Assistant.
5. Follow the documentation of the card you want to use
   to install its dependencies and register its dashboard resource.

`<config>` refers to the directory containing your active
`configuration.yaml`.

## Updating

Back up your existing installation, then replace the integration
files with the new version.

Restart Home Assistant after changes to Python files or the
integration manifest. Reload your browser after JavaScript changes;
clear the cache if an older version remains loaded.

Manual installations do not update automatically from GitHub.

## License

MIT License. See [LICENSE](LICENSE).
