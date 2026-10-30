/** Picker integration for SHFD FreshAirIQ Raumkarte. Load via the collection. */
const moduleUrl = new URL(import.meta.url);
const version = moduleUrl.searchParams.get("hacstag") || moduleUrl.searchParams.get("v");
const cardUrl = new URL("./freshairiq-climate-room-card.js", import.meta.url);
if (version) cardUrl.searchParams.set("v", version);
await import(cardUrl.href);

const TYPE = "shfd-freshairiq-room-card";
const Card = customElements.get(TYPE);
if (!Card) throw new Error("SHFD FreshAirIQ Raumkarte was not registered.");

function supportsEntity(hass, entityId) {
  if (typeof entityId !== "string" || !entityId.startsWith("sensor.")) return false;
  const state = hass?.states?.[entityId];
  if (!state || ["unknown", "unavailable", ""].includes(state.state)) return false;
  const payload = state.attributes?.freshairiq_room_payload;
  const options = state.attributes?.options;
  return !!payload && typeof payload === "object" && !Array.isArray(payload)
    && Array.isArray(options) && options.includes("ventilate") && options.includes("wait")
    && (payload.temperature !== undefined || payload.absolute_humidity !== undefined);
}

function initialConfig(entityId) {
  return {
    type: "custom:" + TYPE,
    title: "Raumklima",
    title_font_size: 20,
    neutral_tint_strength: 12,
    show_header: true,
    show_details: true,
    rooms: entityId ? [{ recommendation_entity: entityId }] : [],
  };
}

Card.getStubConfig = function (hass) {
  const entityId = Object.keys(hass?.states || {}).sort()
    .find((id) => supportsEntity(hass, id));
  return initialConfig(entityId);
};

window.customCards = window.customCards || [];
const registration = window.customCards.find((card) => card.type === TYPE);
const pickerOptions = {
  type: TYPE,
  name: "SHFD FreshAirIQ Raumkarte",
  preview: true,
  description: "Raumklimaübersicht für FreshAirIQ mit Außenwerten, Wetterkarte und konfigurierbaren Details und Farben.",
  getEntitySuggestion(hass, entityId) {
    return supportsEntity(hass, entityId)
      ? { config: initialConfig(entityId) }
      : null;
  },
};
if (registration) Object.assign(registration, pickerOptions);
else window.customCards.push(pickerOptions);
