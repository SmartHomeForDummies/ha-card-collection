/** SHFD Markdown Table Card: Home Assistant picker integration. */
const moduleUrl = new URL(import.meta.url);
const version = moduleUrl.searchParams.get("hacstag") || moduleUrl.searchParams.get("v");
const cardUrl = new URL("./shfd-markdown-table-card.js", import.meta.url);
if (version) cardUrl.searchParams.set("v", version);
await import(cardUrl.href);

const TAG = "shfd-markdown-table-card";
const Card = customElements.get(TAG);
if (!Card) throw new Error("SHFD Markdown Table Card was not registered.");

/** Static example data: no entity lookup, service call or template request. */
export function buildMarkdownTablePreviewConfig() {
  return {
    type: "custom:" + TAG,
    title: "Beispieltabelle",
    row_header: "Raum",
    row_count: 2,
    column_count: 2,
    layout: { text: "single", spacing: "compact" },
    appearance: { font_size: 12 },
    columns: [
      { name: "Temperatur", align: "right" },
      {
        name: "Status",
        rules: {
          mode: "states",
          targets: { icon: true, text: false, background: false },
          states: [
            { value: "Zu", color: "#4caf50", icon: "mdi:window-closed-variant" },
            { value: "Offen", color: "#ff9800", icon: "mdi:window-open-variant" }
          ]
        }
      }
    ],
    rows: [
      { name: "Wohnen", cells: [{ type: "text", text: "21,0 °C" }, { type: "text", text: "Zu" }] },
      { name: "Bad", cells: [{ type: "text", text: "22,4 °C" }, { type: "text", text: "Offen" }] }
    ]
  };
}

Card.getStubConfig = buildMarkdownTablePreviewConfig;
window.customCards = window.customCards || [];
const matching = window.customCards.filter(card => card.type === TAG || card.type === "custom:" + TAG);
const pickerOptions = {
  type: TAG,
  name: "SHFD Markdown-Tabelle",
  preview: true,
  description: "Tabellen mit Entitäten, Templates, Farben und Icons. Vorschau mit statischen Beispieldaten."
};
if (matching.length) {
  Object.assign(matching[0], pickerOptions);
  for (const duplicate of matching.slice(1)) {
    const index = window.customCards.indexOf(duplicate);
    if (index >= 0) window.customCards.splice(index, 1);
  }
} else window.customCards.push(pickerOptions);
