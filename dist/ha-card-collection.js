/**
 * SHFD Custom Cards
 * Dashboard card collection entry point.
 */

const entryUrl = new URL(import.meta.url);
// Manual installations without a version parameter use a stable fallback.
const version = entryUrl.searchParams.get("hacstag")
  || entryUrl.searchParams.get("v")
  || "0.3.0-beta.5";

function versionedUrl(filename) {
  const url = new URL(filename, import.meta.url);
  url.searchParams.set("v", version);
  return url.href;
}

await import(versionedUrl("./raumkarte.js"));

const RoomCard = customElements.get("raum-karte");
if (RoomCard) {
  RoomCard.getConfigElement = async function () {
    await import(versionedUrl("./raumkarte-editor.js"));
    return document.createElement("raum-karte-editor");
  };
}

// Picker types do not include the YAML-only "custom:" prefix.
for (const card of window.customCards || []) {
  if (card.type === "custom:raum-karte") {
    card.type = "raum-karte";
  }
}
