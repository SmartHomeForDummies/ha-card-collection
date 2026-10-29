/**
 * SHFD Custom Cards
 * Dashboard card collection entry point.
 */

import "./raumkarte.js?v=0.3.0-beta.5";

// Keep both dependency URLs versioned for collection installations.
const RoomCard = customElements.get("raum-karte");
if (RoomCard) {
  RoomCard.getConfigElement = async function () {
    await import("./raumkarte-editor.js?v=0.3.0-beta.5");
    return document.createElement("raum-karte-editor");
  };
}

// Picker types do not include the YAML-only "custom:" prefix.
// Normalize the registration from the card module before the picker uses it.
for (const card of window.customCards || []) {
  if (card.type === "custom:raum-karte") {
    card.type = "raum-karte";
  }
}
