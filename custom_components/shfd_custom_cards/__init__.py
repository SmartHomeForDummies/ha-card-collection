"""Eigene Dashboard-Karten als statische Frontend-Dateien bereitstellen."""

from pathlib import Path
import logging

import voluptuous as vol

from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.typing import ConfigType

DOMAIN = "shfd_custom_cards"
URL_BASE = "/shfd_custom_cards"

_LOGGER = logging.getLogger(__name__)

CONFIG_SCHEMA = vol.Schema(
    {
        vol.Optional(DOMAIN): cv.empty_config_schema(DOMAIN),
    },
    extra=vol.ALLOW_EXTRA,
)


async def async_setup(
    hass: HomeAssistant,
    config: ConfigType,
) -> bool:
    """Den Frontend-Ordner unter einem eigenen HTTP-Pfad bereitstellen."""

    frontend_path = Path(__file__).parent / "frontend"

    if not await hass.async_add_executor_job(frontend_path.is_dir):
        _LOGGER.error(
            "Frontend-Ordner fehlt: %s",
            frontend_path,
        )
        return False

    await hass.http.async_register_static_paths(
        [
            StaticPathConfig(
                url_path=URL_BASE,
                path=str(frontend_path),
                cache_headers=False,
            )
        ]
    )

    _LOGGER.info(
        "Eigene Karten werden unter %s/ aus %s bereitgestellt",
        URL_BASE,
        frontend_path,
    )

    return True