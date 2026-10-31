/**
 * SHFD Raumkarte picker integration: realistic room selection, short status
 * labels and device-diverse lights. Replaces the previous picker module.
 * Load through the collection, alongside raumkarte.js.
 */
const moduleUrl = new URL(import.meta.url);
const version = moduleUrl.searchParams.get("hacstag") || moduleUrl.searchParams.get("v");
const cardUrl = new URL("./raumkarte.js", import.meta.url);
if (version) cardUrl.searchParams.set("v", version);
await import(cardUrl.href);

const TYPE = "custom:raum-karte";
const Card = customElements.get("raum-karte");
if (!Card) throw new Error("SHFD Raumkarte was not registered.");
const BASE_STUB = Symbol.for("shfd.raumkarte.picker.baseStub");
if (!Card[BASE_STUB]) Card[BASE_STUB] = Card.getStubConfig.bind(Card);
const baseStubConfig = Card[BASE_STUB];
const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;
const unavailable = new Set(["unknown", "unavailable", "none", ""]);
const coverClasses = new Set(["blind", "curtain", "shade", "shutter"]);
const climateStates = new Set(["off", "heat", "cool", "heat_cool", "auto", "dry", "fan_only"]);
const STATUS_NAMES = Object.freeze({
  window: "Fenster", door: "Tür", temperature: "Temperatur", humidity: "Luftfeuchte",
});

function registryMap(value, idKey) {
  if (Array.isArray(value)) return new Map(value
    .filter(row => row && typeof row[idKey] === "string").map(row => [row[idKey], row]));
  if (value && typeof value === "object") return new Map(Object.entries(value)
    .filter(([, row]) => row && typeof row === "object"));
  return new Map();
}
function finiteMeasurement(value) {
  return typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value));
}
function category(entityId, state) {
  const domain = entityId.split(".", 1)[0], attributes = state.attributes || {};
  const deviceClass = attributes.device_class;
  if (domain === "sensor" && finiteMeasurement(state.state)) {
    if (deviceClass === "humidity") return "humidity";
    if (deviceClass === "temperature") return "temperature";
    if (!deviceClass && ["°C", "°F"].includes(attributes.unit_of_measurement)) return "temperature";
  }
  if (domain === "binary_sensor" && ["on", "off"].includes(state.state)) {
    if (deviceClass === "window") return "window";
    if (deviceClass === "door") return "door";
  }
  if (domain === "light" && ["on", "off"].includes(state.state)) return "light";
  if (domain === "climate" && climateStates.has(state.state)) return "climate";
  if (domain === "cover" && coverClasses.has(deviceClass)
      && ["open", "closed", "opening", "closing"].includes(state.state)) return "cover";
  return null;
}
function areaFor(entry, devices) {
  if (entry?.area_id) return entry.area_id;
  return entry?.device_id ? devices.get(entry.device_id)?.area_id || null : null;
}
function visibleEntry(entry) {
  return !entry || (!entry.disabled_by && !entry.hidden_by && !entry.entity_category);
}
function displayName(row) {
  const name = row.state.attributes?.friendly_name;
  return typeof name === "string" && name.trim() ? name.trim() : row.entityId;
}

// Names are a ranking hint only, never grounds for excluding a real light.
// Without device metadata, separate entity IDs do not prove separate devices.
function isSegmentLight(row) {
  const pattern = /(?:^|[\s_.:/-])(?:segment|seg|zone|channel|kanal)(?:[\s_.:/-]*\d+)?(?=$|[\s_.:/-])/i;
  return pattern.test(row.entityId) || pattern.test(displayName(row));
}

/** Prefer main lights on distinct known devices; do not infer device identity
 * from similar names. Unknown-device entities are a fallback between known
 * distinct devices and known duplicates. A second pass allows same-device
 * entities only if needed to fill the two preview slots.
 */
function chooseLights(candidates) {
  const lights = candidates.filter(row => row.kind === "light")
    .sort((a, b) => Number(isSegmentLight(a)) - Number(isSegmentLight(b))
      || compare(a.entityId, b.entityId));
  const selected = [], usedDevices = new Set(), usedEntities = new Set();
  const add = row => {
    selected.push(row); usedEntities.add(row.entityId);
    if (row.deviceId) usedDevices.add(row.deviceId);
  };
  // First select one main light if available; metadata wins ties only.
  const first = lights.find(row => !isSegmentLight(row) && row.deviceId)
    || lights.find(row => !isSegmentLight(row)) || lights[0];
  if (first) add(first);
  while (selected.length < 2) {
    const remaining = lights.filter(row => !usedEntities.has(row.entityId));
    if (!remaining.length) break;
    const distinct = remaining.filter(row => row.deviceId && !usedDevices.has(row.deviceId));
    const unknown = remaining.filter(row => !row.deviceId);
    // Another independent main light is best. Prefer an unknown main over a
    // known independent segment; choose a known independent segment before
    // reusing an already represented device.
    const next = distinct.find(row => !isSegmentLight(row))
      || unknown.find(row => !isSegmentLight(row))
      || distinct[0] || unknown[0] || remaining[0];
    add(next);
  }
  return selected;
}

function choose(candidates) {
  const sorted = [...candidates].sort((a, b) => compare(a.entityId, b.entityId));
  const first = kind => sorted.find(row => row.kind === kind);
  const contact = first("window") || first("door");
  const temperature = first("temperature"), humidity = first("humidity");
  const lights = chooseLights(sorted);
  const climate = first("climate"), cover = climate ? undefined : first("cover");
  const selected = [contact, temperature, humidity, ...lights, climate || cover].filter(Boolean);
  const groups = [contact, temperature, humidity, lights[0], climate || cover].filter(Boolean).length;
  return { selected, groups };
}

/** Pure synchronous selection using optional registry snapshots.
 * No service calls, registry writes, synthetic entity IDs, or state changes.
 */
export function buildRoomPreviewConfig(hass, stub = baseStubConfig()) {
  const entities = registryMap(hass?.entities, "entity_id");
  const devices = registryMap(hass?.devices, "id");
  const areas = registryMap(hass?.areas, "area_id");
  const states = hass?.states && typeof hass.states === "object" ? hass.states : {};
  const candidates = [];
  for (const entityId of Object.keys(states).sort(compare)) {
    const state = states[entityId];
    if (!state || typeof state.state !== "string" || unavailable.has(state.state.trim())) continue;
    const entry = entities.get(entityId);
    if (!visibleEntry(entry)) continue;
    const kind = category(entityId, state);
    if (!kind) continue;
    candidates.push({entityId, state, kind, areaId: areaFor(entry, devices), deviceId: entry?.device_id || null});
  }
  const grouped = new Map();
  for (const row of candidates) {
    if (!row.areaId) continue;
    if (!grouped.has(row.areaId)) grouped.set(row.areaId, []);
    grouped.get(row.areaId).push(row);
  }
  const ranked = [...grouped].map(([areaId, rows]) => ({areaId, ...choose(rows)}))
    .sort((a, b) => b.groups - a.groups || b.selected.length - a.selected.length || compare(a.areaId, b.areaId));
  const winner = ranked[0];
  const selected = winner ? winner.selected : choose(candidates).selected;
  const areaName = winner ? areas.get(winner.areaId)?.name : null;
  const config = {
    ...structuredClone(stub), type: TYPE,
    raum: typeof areaName === "string" && areaName.trim() ? areaName.trim() : "Raumübersicht",
    anwesenheit: "", status_items: [], wecker: [], szenen: [], lampen: [], schalter: [],
    rolllaeden: [], thermostate: [], mediaplayer: [], custom_sections: [],
  };
  delete config.layout;
  for (const row of selected) {
    if (STATUS_NAMES[row.kind]) {
      config.status_items.push({entity: row.entityId, name: STATUS_NAMES[row.kind], kind: row.kind});
    } else {
      const item = {entity: row.entityId, name: displayName(row)};
      if (row.kind === "light") config.lampen.push(item);
      else if (row.kind === "climate") config.thermostate.push(item);
      else if (row.kind === "cover") config.rolllaeden.push(item);
    }
  }
  return config;
}
Card.getStubConfig = function (hass) { return buildRoomPreviewConfig(hass); };
window.customCards = window.customCards || [];
const matching = window.customCards.filter(card => card.type === TYPE || card.type === "raum-karte");
const pickerOptions = {
  type: TYPE, name: "SHFD Raumkarte", preview: true,
  description: "Raumkarte mit echten Beispiel-Entitäten aus einem gemeinsamen Bereich, Status, Licht und optional Heizung oder Rollladen.",
};
if (matching.length) {
  Object.assign(matching[0], pickerOptions);
  for (const duplicate of matching.slice(1)) {
    const index = window.customCards.indexOf(duplicate);
    if (index >= 0) window.customCards.splice(index, 1);
  }
} else window.customCards.push(pickerOptions);
