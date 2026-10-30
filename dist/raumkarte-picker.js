/** Picker integration for SHFD Raumkarte. Load via the collection. */
const moduleUrl = new URL(import.meta.url);
const version = moduleUrl.searchParams.get("hacstag") || moduleUrl.searchParams.get("v");
const cardUrl = new URL("./raumkarte.js", import.meta.url);
if (version) cardUrl.searchParams.set("v", version);
await import(cardUrl.href);

const TYPE = "custom:raum-karte";
const Card = customElements.get("raum-karte");
if (!Card) throw new Error("SHFD Raumkarte was not registered.");

const baseStubConfig = Card.getStubConfig.bind(Card);

function isAvailable(state) {
  return !!state && !['unknown', 'unavailable', 'none', ''].includes(state.state);
}

function firstEntity(hass, domain, predicate = () => true) {
  return Object.keys(hass?.states || {})
    .filter((entityId) => entityId.startsWith(domain))
    .sort()
    .find((entityId) => isAvailable(hass.states[entityId]) && predicate(hass.states[entityId]));
}

function temperatureEntity(hass) {
  return firstEntity(hass, 'sensor.', (state) =>
    state.attributes?.device_class === 'temperature'
    || ['°C', '°F'].includes(state.attributes?.unit_of_measurement)
  );
}

function humidityEntity(hass) {
  return firstEntity(hass, 'sensor.', (state) =>
    state.attributes?.device_class === 'humidity'
    || state.attributes?.unit_of_measurement === '%'
  );
}

function demoConfig(hass) {
  const light = firstEntity(hass, 'light.');
  const climate = firstEntity(hass, 'climate.');
  const temperature = temperatureEntity(hass);
  const humidity = humidityEntity(hass);

  const statusItems = [];
  if (temperature) statusItems.push({ entity: temperature, kind: 'temperature', name: 'Temperatur' });
  if (humidity) statusItems.push({ entity: humidity, kind: 'humidity', name: 'Luftfeuchtigkeit' });

  return {
    ...baseStubConfig(),
    raum: 'Wohnzimmer',
    status_items: statusItems,
    lampen: light ? [{ entity: light }] : [],
    thermostate: climate ? [{ entity: climate }] : [],
  };
}

Card.getStubConfig = function (hass) {
  return demoConfig(hass);
};

window.customCards = window.customCards || [];
const registration = window.customCards.find((card) => card.type === TYPE);
const pickerOptions = {
  type: TYPE,
  name: 'SHFD Raumkarte',
  preview: true,
  description: 'Dashboard-unabhängige Raumkarte mit Status, Licht, Szenen, Heizung, Medien, Rollläden und Wecker.',
};
if (registration) Object.assign(registration, pickerOptions);
else window.customCards.push(pickerOptions);
