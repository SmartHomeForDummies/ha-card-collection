/**
 * SHFD Custom Cards
 * Dashboard card collection entry point.
 */

import "./raumkarte.js";

// Picker types do not include the YAML-only "custom:" prefix.
// Normalize the registration from the card module before the picker uses it.
for (const card of window.customCards || []) {
  if (card.type === "custom:raum-karte") {
    card.type = "raum-karte";
  }
}
