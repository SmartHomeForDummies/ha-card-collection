/** SHFD Custom Cards: shared dashboard entry point. */
const entryUrl = new URL(import.meta.url);
const version = entryUrl.searchParams.get("hacstag") || entryUrl.searchParams.get("v");

function versionedUrl(filename) {
  const url = new URL(filename, import.meta.url);
  if (version) url.searchParams.set("v", version);
  return url.href;
}

await import(versionedUrl("./raumkarte.js"));

const RoomCard = customElements.get("raum-karte");
if (RoomCard) {
  RoomCard.getConfigElement = async function () {
    return document.createElement("raum-karte-editor");
  };
}

await import(versionedUrl("./raumkarte-picker.js"));
await import(versionedUrl("./freshairiq-card-picker.js"));

for (const card of window.customCards || []) {
  if (card.type === "custom:raum-karte") card.type = "raum-karte";
}
