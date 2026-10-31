// SHFD FreshAirIQ Raumkarte — prototype 0.1.11-dev
const FIELDS=[['recommendation_entity','Empfehlung'],['absolute_humidity_entity','Absolute Feuchte'],['temperature_entity','Temperatur'],['mould_entity','Schimmelrisiko']];
const OUT_FIELDS=[['humidity_entity','Relative Feuchte'],['absolute_humidity_entity','Abs. Feuchte'],['temperature_entity','Temperatur'],['dew_point_entity','Taupunkt']];
const ACTIONS={check_sensor:'Sensor prüfen',close:'Schließen',continue_ventilating:'Weiterlüften',ventilate:'Lüften',do_not_ventilate:'Nicht lüften',wait:'Warten',okay:'In Ordnung',ventilate_for_cooling:'Zum Kühlen lüften',monitor_only:'Nur beobachten',ventilate_indirectly:'Indirekt lüften',open_fully:'Vollständig öffnen',unknown:'Unbekannt'};
const RISKS={low:'Gering',slightly_elevated:'Leicht erhöht',elevated:'Erhöht',high:'Hoch',very_high:'Sehr hoch',unknown:'Unbekannt'};
const A_COLORS={check_sensor:'#EF9A9A',close:'#FFB74D',continue_ventilating:'#90CAF9',ventilate:'#90CAF9',do_not_ventilate:'#EF9A9A',wait:'#FFE082',okay:'#A5D6A7',ventilate_for_cooling:'#80DEEA',monitor_only:'#B0BEC5',ventilate_indirectly:'#90CAF9',open_fully:'#90CAF9'};
const R_COLORS={low:'#A5D6A7',slightly_elevated:'#FFE082',elevated:'#FFB74D',high:'#EF9A9A',very_high:'#E57373'};
const DEFAULT_RULES={temperature:[{above:null,color:'#90CAF9'},{above:18,color:'#A5D6A7'},{above:24,color:'#FFE082'},{above:26,color:'#FFB74D'},{above:28,color:'#EF9A9A'}],absolute_humidity:[{above:null,color:'#90CAF9'},{above:7,color:'#A5D6A7'},{above:10,color:'#FFE082'},{above:12,color:'#FFB74D'},{above:14,color:'#EF9A9A'}],relative_humidity:[{above:null,color:'#90CAF9'},{above:40,color:'#A5D6A7'},{above:70,color:'#FFE082'},{above:85,color:'#FFB74D'}],dew_point:[{above:null,color:'#90CAF9'},{above:0,color:'#80DEEA'},{above:10,color:'#A5D6A7'},{above:16,color:'#FFE082'},{above:20,color:'#FFB74D'}]};
const OUT_DEFAULTS={...DEFAULT_RULES,temperature:[{above:null,color:'#90CAF9'},{above:0,color:'#80DEEA'},{above:10,color:'#A5D6A7'},{above:20,color:'#FFE082'},{above:28,color:'#FFB74D'}]};
const DEFS={recommendation_entity:['action','',false],absolute_humidity_entity:['absolute_humidity','g/m³',true],temperature_entity:['temperature','°C',true],mould_entity:['mould_level','',false],humidity_entity:['humidity','%',true],dew_point_entity:[null,'°C',true]};
const DETAIL_DEFS=[
 ['reason','Begründung der Empfehlung','Empfehlung & Raumklima','text'],['humidity','Relative Luftfeuchtigkeit','Empfehlung & Raumklima','number','%'],['reference_humidity','Absolute Referenzfeuchtigkeit','Empfehlung & Raumklima','number','g/m³'],['delta_g_m3','Feuchteunterschied zur Referenz','Empfehlung & Raumklima','number','g/m³'],['surface_rh','Berechnete Oberflächenfeuchtigkeit','Empfehlung & Raumklima','number','%'],['humidity_trend_pct_h','Feuchtigkeitstrend','Empfehlung & Raumklima','number','Prozentpunkte/h'],
 ['theoretical_potential_ml','Theoretisches Entfeuchtungspotenzial','Lüftung & Prognose','number','ml'],['realistic_potential_ml','Realistisches Entfeuchtungspotenzial','Lüftung & Prognose','number','ml'],['potential_horizon_min','Potenzial-Zeithorizont','Lüftung & Prognose','number','min'],['forecast_5_min_moisture_effect_ml','Prognostizierter Feuchteentzug in 5 Minuten','Lüftung & Prognose','number','ml'],['forecast_5_min_temperature_change_c','Prognostizierte Temperaturänderung in 5 Minuten','Lüftung & Prognose','number','°C'],['forecast_horizon_min','Prognosezeitraum','Lüftung & Prognose','number','min'],['forecast_temperature_change_c','Prognostizierte Temperaturänderung im Prognosezeitraum','Lüftung & Prognose','number','°C'],
 ['opening_state','Öffnungszustand','Fenster & Lüftungsvorgang','opening'],['active','Lüftung aktiv','Fenster & Lüftungsvorgang','boolean'],['close_recommended','Schließen empfohlen','Fenster & Lüftungsvorgang','boolean'],['session_elapsed_min','Laufzeit des Lüftungsvorgangs','Fenster & Lüftungsvorgang','number','min',p=>p.active===true],['session_recommended_duration_min','Empfohlene Lüftungsdauer','Fenster & Lüftungsvorgang','number','min',p=>p.active===true],['temperature_change_c','Temperaturänderung im Lüftungsvorgang','Fenster & Lüftungsvorgang','number','°C',p=>p.active===true],['minutes_since_last_ventilation','Zeit seit der letzten Lüftung','Fenster & Lüftungsvorgang','duration'],['contact_entities','Zugeordnete Fensterkontakte','Fenster & Lüftungsvorgang','entities'],
 ['co2','CO₂-Konzentration','Luftqualität & Feuchtequellen','number','ppm',p=>p.co2_available===true],['moisture_source_active','Feuchtequelle aktiv','Luftqualität & Feuchtequellen','boolean'],['moisture_source_message','Hinweis zur Feuchtequelle','Luftqualität & Feuchtequellen','text'],['moisture_source_recovery','Erholungsphase nach Feuchtequelle','Luftqualität & Feuchtequellen','boolean'],
 ['last_measurement_at','Letzte Messung','Datenqualität & Lernen','date'],['measurement_frame_quality','Qualität des Messwertsatzes','Datenqualität & Lernen','quality'],['measurement_frame_reason','Hinweis zur Messwertqualität','Datenqualität & Lernen','text'],['learning_status','Lernstatus','Datenqualität & Lernen','learning'],['learning_diagnosis','Lerndiagnose','Datenqualität & Lernen','text'],['last_learning_valid','Letzte Lernmessung gültig','Datenqualität & Lernen','boolean'],['learning_samples','Lernmessungen','Datenqualität & Lernen','integer']];
const DEFAULT_DETAILS=['reason','humidity','delta_g_m3','surface_rh','opening_state','measurement_frame_reason'];
const clone=x=>structuredClone(x),norm=x=>String(x??'').trim().toLowerCase().replace(/[ -]+/g,'_');
const missing=s=>!s||['unknown','unavailable',''].includes(s.state);
const numeric=v=>{if(v==null||typeof v==='boolean'||typeof v==='string'&&v.trim()==='')return null;const n=Number(v);return Number.isFinite(n)?n:null;};
const absent=v=>v==null||typeof v==='string'&&(v.trim()===''||['unknown','unavailable'].includes(norm(v)))||Array.isArray(v)&&!v.length;
function el(tag,cls='',text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
function validColor(v){return typeof v==='string'&&CSS.supports('color',v);}
function tintStrength(value){const n=numeric(value);return n===null?12:Math.min(100,Math.max(0,Math.round(n)));}
function neutralBackground(value){const n=tintStrength(value);if(n===0)return'transparent';return CSS.supports('background','color-mix(in srgb, red 12%, transparent)')?`color-mix(in srgb, var(--primary-color, #808080) ${n}%, transparent)`:`rgba(128, 128, 128, ${n/100})`;}
function oldColorKey(kind,value){return kind==='mould'?`risk_${value}`:value==='close'?'action_close':value==='check_sensor'?'action_warning':['ventilate','continue_ventilating','ventilate_indirectly','open_fully','ventilate_for_cooling'].includes(value)?'action_active':null;}
function stateColor(config,kind,value){const states=config.color_rules?.[kind]?.states||{},defaults=kind==='recommendation'?A_COLORS:R_COLORS,key=oldColorKey(kind,value);return Object.hasOwn(states,value)?states[value]:(key&&config.colors?.[key])||defaults[value]||'';}
function rangesFor(config,kind,outdoor){const c=config.color_rules?.[kind]||{};return outdoor?c.outdoor_ranges??OUT_DEFAULTS[kind]:c.ranges??config.thresholds?.[kind]??DEFAULT_RULES[kind];}
function rangeLimit(row){return row?.above===null?-Infinity:numeric(row?.above);}
function rangeIssues(rows){
 if(!Array.isArray(rows))return['Farbbereiche müssen eine Liste sein.'];
 const issues=[],seen=new Set();let bases=0;
 for(const row of rows){if(!row||typeof row!=='object'){issues.push('Ungültiger Farbbereich.');continue;}if(row.above===null){bases++;continue;}const n=numeric(row.above);if(n===null){issues.push('Jede Untergrenze muss eine gültige Zahl sein.');continue;}if(seen.has(n))issues.push(`Die Untergrenze ${n} ist mehrfach vorhanden.`);seen.add(n);}
 if(bases===0)issues.push('Ein Grundbereich fehlt. Bitte einen Grundbereich hinzufügen.');if(bases>1)issues.push('Es darf nur einen Grundbereich geben.');if(!rows.length)issues.push('Keine Farbbereiche definiert.');return [...new Set(issues)];
}
function resetSide(config,kind,outdoor=false){config.color_rules??={};const category=config.color_rules[kind]??={};if(kind==='recommendation')category.states={...A_COLORS};else if(kind==='mould')category.states={...R_COLORS};else category[outdoor?'outdoor_ranges':'ranges']=clone(outdoor?OUT_DEFAULTS[kind]:DEFAULT_RULES[kind]);}

// Column labels only change visible/accessibility text, never sensor mapping.
const CLIMATE_INDOOR_COLUMNS = [
 ['recommendation_entity', 'recommendation', 'Empfehlung'],
 ['absolute_humidity_entity', 'absolute_humidity', 'Abs. Feuchte'],
 ['temperature_entity', 'temperature', 'Temperatur'],
 ['mould_entity', 'mould', 'Schimmelrisiko'],
];
const CLIMATE_OUTDOOR_COLUMNS = [
 ['humidity_entity', 'humidity', 'Relative Feuchte'],
 ['absolute_humidity_entity', 'absolute_humidity', 'Abs. Feuchte'],
 ['temperature_entity', 'temperature', 'Temperatur'],
 ['dew_point_entity', 'dew_point', 'Taupunkt'],
];
function climateColumnLabel(config, entityKey, outdoor = false, fallback) {
 const def = (outdoor ? CLIMATE_OUTDOOR_COLUMNS : CLIMATE_INDOOR_COLUMNS).find(d => d[0] === entityKey);
 const labels = outdoor ? config.outdoor?.column_labels : config.column_labels;
 const custom = def ? labels?.[def[1]] : undefined;
 return typeof custom === 'string' && custom.trim() ? custom.trim() : fallback ?? def?.[2] ?? entityKey;
}
function climateRoomDetails(config, room = {}) {
 return {
  show: room.show_details ?? config.show_details ?? true,
  hideMissing: room.hide_missing_details ?? config.hide_missing_details ?? true,
  fields: room.detail_fields ?? config.detail_fields ?? DEFAULT_DETAILS,
 };
}

// Compact indoor presentation: each option independently inherits from the
// card-level default. Outdoor rows and column-heading switches are independent.
function climateRoomPresentation(config, room = {}) {
 return {
  heading: room.show_room_heading ?? config.show_room_heading ?? true,
  labelMode: room.details_label_mode ?? config.details_label_mode ?? 'auto',
 };
}

function validateClimateRoomOptions(config) {
 const object = v => v !== null && typeof v === 'object' && !Array.isArray(v);
 const fail = (path, message) => { throw Error(path + ': ' + message); };
 const boolean = (v, path) => { if (v !== undefined && typeof v !== 'boolean') fail(path, 'muss true oder false sein.'); };
 const fields = (v, path) => {
  if (v !== undefined && (!Array.isArray(v) || v.some(id => typeof id !== 'string'))) fail(path, 'muss eine Liste von Detailfeld-Schlüsseln sein.');
 };
 const labels = (v, defs, path) => {
  if (v === undefined) return;
  if (!object(v)) fail(path, 'muss ein Objekt sein.');
  const allowed = new Set(defs.map(d => d[1]));
  for (const [key, text] of Object.entries(v)) {
   if (!allowed.has(key)) fail(path + '.' + key, 'unbekannte Spalte.');
   if (typeof text !== 'string') fail(path + '.' + key, 'muss ein Text sein.');
  }
 };
 const labelMode = (value, path) => {
  if (value !== undefined && !['auto', 'room_name', 'details', 'auto_hide_empty'].includes(value)) fail(path, 'muss auto, room_name, details oder auto_hide_empty sein.');
 };
 boolean(config.show_room_heading, 'show_room_heading');
 labelMode(config.details_label_mode, 'details_label_mode');
 boolean(config.show_header, 'show_header');
 boolean(config.show_details, 'show_details');
 boolean(config.hide_missing_details, 'hide_missing_details');
 fields(config.detail_fields, 'detail_fields');
 labels(config.column_labels, CLIMATE_INDOOR_COLUMNS, 'column_labels');
 if (config.outdoor !== undefined) {
  if (!object(config.outdoor)) fail('outdoor', 'muss ein Objekt sein.');
  boolean(config.outdoor.show_header, 'outdoor.show_header');
  labels(config.outdoor.column_labels, CLIMATE_OUTDOOR_COLUMNS, 'outdoor.column_labels');
 }
 const visit = (room, path) => {
  if (!object(room)) fail(path, 'muss ein Raumobjekt sein.');
  boolean(room.show_room_heading, path + '.show_room_heading');
  labelMode(room.details_label_mode, path + '.details_label_mode');
  boolean(room.show_details, path + '.show_details');
  boolean(room.hide_missing_details, path + '.hide_missing_details');
  fields(room.detail_fields, path + '.detail_fields');
  if (room.children !== undefined) {
   if (!Array.isArray(room.children)) fail(path + '.children', 'muss eine Liste sein.');
   room.children.forEach((child, index) => visit(child, path + '.children[' + index + ']'));
  }
 };
 (config.rooms || []).forEach((room, index) => visit(room, 'rooms[' + index + ']'));
}

function detailsAllowed(config,room,outdoor){return outdoor?!!room.weather_entity&&room.show_weather!==false:climateRoomDetails(config,room).show;}
function ink(color,host){const span=el('span');span.style.color=color;span.style.display='none';host.shadowRoot.append(span);const resolved=getComputedStyle(span).color;span.remove();const canvas=document.createElement('canvas');canvas.width=canvas.height=1;const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)return'#17202a';ctx.fillStyle='#FFFFFF';ctx.fillRect(0,0,1,1);ctx.fillStyle=resolved;ctx.fillRect(0,0,1,1);const rgb=[...ctx.getImageData(0,0,1,1).data].slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;});return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2]>.179?'#000000':'#FFFFFF';}

// Per-instance appearance. No overrides means the original responsive CSS and
// theme border/shadow remain untouched. Colors and layout never change data.
const CLIMATE_SHADOW_PRESETS = Object.freeze({
  subtle: { label: 'Dezent', value: '0 1px 3px rgba(0, 0, 0, 0.18)' },
  soft: { label: 'Weich', value: '0 4px 12px rgba(0, 0, 0, 0.22)' },
  strong: { label: 'Deutlich', value: '0 8px 24px rgba(0, 0, 0, 0.30)' },
  floating: { label: 'Schwebend', value: '0 12px 32px rgba(0, 0, 0, 0.35)' },
});
function climateAppearanceCss(value) {
  const object = v => v !== null && typeof v === 'object' && !Array.isArray(v);
  const error = (path, message) => { throw Error(path + ': ' + message); };
  const shape = (v, path, keys) => {
    if (v === undefined) return {};
    if (!object(v)) error(path, 'muss ein Objekt sein.');
    for (const k of Object.keys(v)) if (!keys.includes(k)) error(path + '.' + k, 'unbekannte Option.');
    return v;
  };
  const a = shape(value, 'appearance', ['padding', 'section_spacing', 'item_gap', 'indoor_item_gap', 'outdoor_item_gap', 'dividers', 'background', 'border', 'shadow']);
  const d = shape(a.dividers, 'appearance.dividers', ['enabled', 'width', 'color']);
  const bg = shape(a.background, 'appearance.background', ['mode', 'color']);
  const b = shape(a.border, 'appearance.border', ['enabled', 'width', 'color', 'radius']);
  const s = shape(a.shadow, 'appearance.shadow', ['mode', 'value']);
  const dimension = (n, path, max = 100) => {
    if (n !== undefined && (typeof n !== 'number' || !Number.isFinite(n) || n < 0 || n > max)) error(path, 'muss eine Zahl zwischen 0 und ' + max + ' sein.');
    return n;
  };
  const boolean = (n, path) => { if (n !== undefined && typeof n !== 'boolean') error(path, 'muss true oder false sein.'); };
  const css = (v, property, path) => {
    if (v === undefined) return;
    if (typeof v !== 'string' || !v.trim() || v.length > 512 || /[;{}<>\\]/.test(v)
        || /\/\*|\*\/|url\s*\(|expression\s*\(|@/i.test(v) || !CSS.supports(property, v.trim())) error(path, 'ungültiger CSS-Wert.');
    return v.trim();
  };
  const mode = (v, options, path) => { if (v !== undefined && !options.includes(v)) error(path, 'ungültige Auswahl.'); };
  const padding = dimension(a.padding, 'appearance.padding');
  const spacing = dimension(a.section_spacing, 'appearance.section_spacing');
  const gap = dimension(a.item_gap, 'appearance.item_gap');
  const indoorGap = dimension(a.indoor_item_gap, 'appearance.indoor_item_gap');
  const outdoorGap = dimension(a.outdoor_item_gap, 'appearance.outdoor_item_gap');
  dimension(d.width, 'appearance.dividers.width', 10); boolean(d.enabled, 'appearance.dividers.enabled');
  dimension(b.width, 'appearance.border.width', 10); dimension(b.radius, 'appearance.border.radius'); boolean(b.enabled, 'appearance.border.enabled');
  css(d.color, 'color', 'appearance.dividers.color'); css(b.color, 'color', 'appearance.border.color');
  const bgColor = css(bg.color, 'color', 'appearance.background.color');
  const customShadow = css(s.value, 'box-shadow', 'appearance.shadow.value');
  mode(bg.mode, ['theme', 'transparent', 'custom'], 'appearance.background.mode');
  mode(s.mode, ['default', 'none', ...Object.keys(CLIMATE_SHADOW_PRESETS), 'custom'], 'appearance.shadow.mode');
  if (bg.mode === 'custom' && bgColor === undefined) error('appearance.background.color', 'erforderlich für einen eigenen Hintergrund.');
  if (s.mode === 'custom' && customShadow === undefined) error('appearance.shadow.value', 'erforderlich für einen eigenen Schatten.');
  const rules = [], card = [];
  if (padding !== undefined) {
    rules.push(`.section{padding:${padding}px}.title,.header{padding-left:${padding}px;padding-right:${padding}px}`);
  }
  if (spacing !== undefined) {
    rules.push(`.section+.section,.header+.section,.section+.header{margin-top:${spacing}px}.child{margin-top:${14 + spacing}px}`);
  }
  if (gap !== undefined) rules.push(`.grid{gap:${gap}px}`);
  if (indoorGap !== undefined) rules.push(`.grid.indoor-grid{gap:${indoorGap}px}`);
  if (outdoorGap !== undefined) rules.push(`.grid.outdoor-grid{gap:${outdoorGap}px}`);
  if (Object.keys(d).length) {
    rules.push(`.section+.section,.header+.section,.section+.header,.child{border-top:${d.enabled === false || d.width === 0 ? 'none' : `${d.width ?? 1}px solid ${d.color || 'var(--divider-color,#ffffff18)'}`}}`);
  }
  if (bg.mode) card.push(`background:${bg.mode === 'custom' ? bgColor : bg.mode === 'transparent' ? 'transparent' : 'var(--ha-card-background,var(--card-background-color))'}`);
  if (b.radius !== undefined) card.push(`border-radius:${b.radius}px`);
  if (b.enabled !== undefined || b.width !== undefined || b.color !== undefined) {
    card.push(`border:${b.enabled === false || b.width === 0 ? 'none' : `${b.width ?? 1}px solid ${b.color || 'var(--ha-card-border-color,var(--divider-color))'}`}`);
  }
  // "default" keeps the existing ha-card theme shadow, not the Room Card's
  // different default shadow. Presets and custom values are identical in both.
  if (s.mode === 'none') card.push('box-shadow:none');
  else if (s.mode === 'custom') card.push(`box-shadow:${customShadow}`);
  else if (CLIMATE_SHADOW_PRESETS[s.mode]) card.push(`box-shadow:${CLIMATE_SHADOW_PRESETS[s.mode].value}`);
  if (card.length) rules.push(`ha-card{${card.join(';')}}`);
  return rules.join('\n');
}

const CARD_CSS=`
:host{display:block}*{box-sizing:border-box}ha-card{display:block;padding:0;overflow:hidden;background:var(--ha-card-background,var(--card-background-color));color:var(--primary-text-color);border-radius:var(--ha-card-border-radius,16px)}
.title{margin:0;padding:16px 16px 12px;text-align:center;font-size:var(--title-size,20px);color:var(--title-color,var(--primary-text-color));font-weight:600;line-height:1.35;overflow-wrap:anywhere}
.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.header{padding:12px 16px;text-align:center;font-weight:600;font-size:13px;color:var(--secondary-text-color);overflow-wrap:anywhere}.section{padding:16px}.section+.section,.header+.section,.section+.header{border-top:1px solid var(--divider-color,#ffffff18)}
.room-heading{display:flex;align-items:center;gap:8px;margin:0 0 12px;font-size:1.15em;font-weight:600;line-height:1.35}.room-heading ha-icon{--mdc-icon-size:24px;flex:none;color:var(--secondary-text-color)}
.cell{display:flex;align-items:center;justify-content:center;min-width:0;min-height:60px;padding:9px 5px;border:0;border-radius:10px;background:var(--neutral,rgba(128,128,128,.12));color:var(--primary-text-color);font:inherit;font-size:14px;font-weight:600;line-height:1.3;text-align:center;overflow-wrap:anywhere;white-space:pre-line}button.cell{cursor:pointer;-webkit-tap-highlight-color:transparent}button:focus-visible,summary:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}
.out-field{min-width:0}.out-label{display:flex;align-items:center;justify-content:center;min-height:30px;margin-bottom:4px;text-align:center;color:var(--secondary-text-color);font-size:11px;line-height:1.2;overflow-wrap:anywhere}.out-field .cell{width:100%}
.details{margin-top:10px;color:var(--secondary-text-color);font-size:13px;line-height:1.5}summary{cursor:pointer}.details-content{display:grid;gap:8px;padding-top:10px}.detail-row{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px;align-items:start}.detail-label{font-weight:500}.detail-value{text-align:right;white-space:pre-line;overflow-wrap:anywhere;color:var(--primary-text-color)}.detail-row.long{grid-template-columns:1fr;gap:2px}.detail-row.long .detail-value{text-align:left}.warning .detail-value{color:var(--warning-color,#b7791f)}
.room-identity{margin-top:10px;color:var(--secondary-text-color);font-size:13px;line-height:1.5;overflow-wrap:anywhere}
.child{margin-top:14px;padding-top:14px;border-top:1px solid var(--divider-color,#ffffff18)}.child .room-heading{font-size:1em}.empty{padding:16px}.weather-host{min-width:0;--ha-card-box-shadow:none;--ha-card-border-width:0px;--ha-card-border-radius:0px}
@media(max-width:380px){.title{padding:12px 12px 8px}.header{padding:10px 12px;font-size:11px}.section{padding:12px}.grid{gap:5px}.cell{min-height:56px;padding:8px 3px;font-size:12px}}
`;
class SHFDFreshAirIQRoomCard extends HTMLElement{
 constructor(){super();this.attachShadow({mode:'open'});this._ink=new Map();this._weatherToken=0;}
 connectedCallback(){if(this._config){this._ink.clear();this._render();}}
 disconnectedCallback(){this._weatherToken++;}
 static getConfigElement(){return document.createElement('shfd-freshairiq-room-card-editor');}
 static getStubConfig(){return{type:'custom:shfd-freshairiq-room-card',show_header:true,show_details:true,neutral_tint_strength:12,rooms:[]};}
 setConfig(c){if(!c||(c.rooms!==undefined&&!Array.isArray(c.rooms)))throw Error('rooms muss eine Liste sein.');if(c.detail_fields!==undefined&&!Array.isArray(c.detail_fields))throw Error('detail_fields muss eine Liste sein.');validateClimateRoomOptions(c);const appearanceCss=climateAppearanceCss(c.appearance);this._config=clone(c);this._appearanceCss=appearanceCss;this._ink.clear();this._render();}
 set hass(h){const old=this._hass;this._hass=h;if(this._weatherCard)this._weatherCard.hass=h;if(!this._config)return;const ids=[];const collect=r=>{for(const[k]of[...FIELDS,['humidity_entity'],['dew_point_entity'],['weather_entity']])if(r[k])ids.push(r[k]);const p=h.states[r.recommendation_entity]?.attributes?.freshairiq_room_payload;for(const id of Array.isArray(p?.contact_entities)?p.contact_entities:[])ids.push(id);for(const c of r.children||[])collect(c);};if(this._config.outdoor)collect(this._config.outdoor);for(const r of this._config.rooms||[])collect(r);if(!old||old.locale!==h.locale||old.themes!==h.themes||ids.some(id=>old.states[id]!==h.states[id])){this._ink.clear();this._render();}}
 getCardSize(){const count=a=>a.reduce((n,r)=>n+1+count(r.children||[]),0);return 1+2*(count(this._config?.rooms||[])+(this._config?.outdoor?1:0));}
 _state(id){return this._hass?.states[id];}
 _payload(room){const p=this._state(room.recommendation_entity)?.attributes?.freshairiq_room_payload;return p&&typeof p==='object'&&!Array.isArray(p)?p:{};}
 _locale(){return this._hass?.locale?.language||'de';}
 _formatValue(raw,unit='',digits=1){const value=numeric(raw);if(value===null)return'–';let f;try{f=new Intl.NumberFormat(this._locale(),{minimumFractionDigits:digits,maximumFractionDigits:digits});}catch{f=new Intl.NumberFormat('de',{minimumFractionDigits:digits,maximumFractionDigits:digits});}return`${f.format(value)}${unit?' '+unit:''}`;}
 _roomValue(room,key,outdoor=false){const d=DEFS[key];if(!d)return{value:null,unit:'',entityId:null,available:false};const[attribute,unit,isNumber]=d,id=room[key],unavailable=entityId=>({value:null,unit,entityId:entityId||null,available:false});if(id){const s=this._state(id);if(!missing(s)){const value=isNumber?numeric(s.state):s.state;return{value,unit:s.attributes.unit_of_measurement||unit,entityId:id,available:value!==null};}if(!outdoor&&key==='recommendation_entity'&&s&&s.state!=='unavailable'){const value=this._payload(room).action;if(!absent(value))return{value,unit:'',entityId:id,available:true};}return unavailable(id);}if(outdoor)return unavailable(null);const source=this._state(room.recommendation_entity);if(!source||source.state==='unavailable'||!attribute)return unavailable(room.recommendation_entity);const raw=this._payload(room)[attribute],value=isNumber?numeric(raw):raw;return{value,unit,entityId:room.recommendation_entity||null,available:isNumber?value!==null:!absent(value)};}
 _color(kind,value,outdoor=false){const category=this._config.color_rules?.[kind]||{},enabled=outdoor?category.outdoor_enabled===true:category.enabled!==false;if(!enabled)return null;if(kind==='recommendation'||kind==='mould'){const color=stateColor(this._config,kind,value);return validColor(color)?color:null;}const rules=rangesFor(this._config,kind,outdoor);if(!Array.isArray(rules))return null;const match=rules.map((r,i)=>({row:r,limit:rangeLimit(r),index:i})).filter(r=>r.limit!==null&&Number(value)>=r.limit).sort((a,b)=>b.limit-a.limit||a.index-b.index)[0];return validColor(match?.row?.color)?match.row.color:null;}
 _cell(room,key,outdoor){const data=this._roomValue(room,key,outdoor);let text='–',color=null;if(data.available){if(key==='recommendation_entity'){let v=norm(data.value);if(v==='ok')v='okay';text=ACTIONS[v]||String(data.value);color=this._color('recommendation',v);}else if(key==='mould_entity'){const v=norm(data.value);text=RISKS[v]||String(data.value);color=this._color('mould',v);}else{const kind={temperature_entity:'temperature',absolute_humidity_entity:'absolute_humidity',humidity_entity:'relative_humidity',dew_point_entity:'dew_point'}[key];text=this._formatValue(data.value,data.unit);if(text!=='–')color=this._color(kind,data.value,outdoor);}}const defaultLabel=[...FIELDS,...OUT_FIELDS].find(([k])=>k===key)?.[1]||key,label=climateColumnLabel(this._config,key,outdoor,defaultLabel),cell=el(data.entityId?'button':'div','cell',text);cell.setAttribute('aria-label',`${label}: ${text}`);if(data.entityId){cell.type='button';cell.title=`${label}: ${text}\n${this._state(data.entityId)?.attributes?.friendly_name||data.entityId}`;cell.onclick=()=>this.dispatchEvent(new CustomEvent('hass-more-info',{detail:{entityId:data.entityId},bubbles:true,composed:true}));}if(color){cell.style.background=color;if(!this._ink.has(color))this._ink.set(color,ink(color,this));cell.style.color=this._ink.get(color);}return cell;}
 _detailText(def,room,p,usable){const[id,,,type,unit,predicate]=def;if(predicate&&(!usable||!predicate(p)))return{skip:true};let value=usable?p[id]:null;if(id==='humidity'){const d=this._roomValue(room,'humidity_entity');value=d.available?d.value:null;}if(absent(value))return{text:null};if(type==='number'||type==='integer')return{text:numeric(value)===null?null:this._formatValue(value,unit||'',type==='integer'?0:1)};if(type==='boolean')return{text:value===true?'Ja':value===false?'Nein':null};if(type==='entities')return{text:Array.isArray(value)?value.map(id=>this._state(id)?.attributes?.friendly_name||id).join('\n'):null};if(type==='date'){const d=new Date(value);if(!Number.isFinite(d.getTime()))return{text:null};try{return{text:new Intl.DateTimeFormat(this._locale(),{dateStyle:'short',timeStyle:'short'}).format(d)};}catch{return{text:d.toLocaleString('de-DE')};}}if(type==='duration'){const n=numeric(value);if(n===null||n<0)return{text:null};const m=Math.round(n),d=Math.floor(m/1440),h=Math.floor(m%1440/60),r=m%60;return{text:d?`${d} d ${h} h`:h?`${h} h ${r} min`:`${r} min`};}const maps={opening:{closed:'Geschlossen',open:'Geöffnet',tilted:'Gekippt',cross:'Querlüftung'},quality:{stale:'Veraltet / zeitlich versetzt',excellent:'Sehr gut',held:'Gehaltene Messwerte',insufficient:'Unzureichend',ok:'In Ordnung'},learning:{base_estimate:'Basisschätzung'}};return{text:maps[type]?.[norm(value)]||String(value)};}
 _roomName(room, payload = this._payload(room)) {
  const text = value => typeof value === 'string' ? value.trim() : '';
  return text(room.name) || text(payload.name) || 'Raum';
 }
 _roomDetailsLabel(room) {
  const presentation = climateRoomPresentation(this._config, room);
  return presentation.labelMode === 'room_name'
   || (['auto', 'auto_hide_empty'].includes(presentation.labelMode) && !presentation.heading)
   ? this._roomName(room) : 'Details';
 }
 _details(room,outdoor,path){if(!detailsAllowed(this._config,room,outdoor))return null;const rows=[];const add=(label,text,long=false,warning=false)=>{const row=el('div',`detail-row${long?' long':''}${warning?' warning':''}`);row.append(el('span','detail-label',label),el('span','detail-value',text));rows.push(row);};if(outdoor){const host=el('div','weather-host');host.dataset.weatherHost='true';rows.push(host);}else{const p=this._payload(room),s=this._state(room.recommendation_entity),usable=!!s&&s.state!=='unavailable',options=climateRoomDetails(this._config,room),selected=options.fields;for(const def of DETAIL_DEFS){if(!selected.includes(def[0]))continue;const result=this._detailText(def,room,p,usable);if(result.skip||result.text===null&&options.hideMissing)continue;add(def[1],result.text??'–',['text','entities'].includes(def[3]),def[0]==='measurement_frame_reason'&&p.measurement_frame_quality==='stale');}}if(!rows.length)return null;const details=el('details','details'),body=el('div','details-content');details.dataset.path=path;details.append(el('summary','',outdoor?'Wetterdetails':this._roomDetailsLabel(room)));body.append(...rows);details.append(body);if(outdoor)details.addEventListener('toggle',()=>{if(details.open)this._mountWeather();});return details;}
 _room(room, outdoor = false, child = false, path = '') {
  const payload = outdoor ? {} : this._payload(room);
  const section = el('section', child ? 'child' : 'section');
  const presentation = outdoor ? {heading: true} : climateRoomPresentation(this._config, room);
  const text = value => typeof value === 'string' ? value.trim() : '';
  const name = outdoor ? text(room.name) || 'Draußen' : this._roomName(room, payload);
  if (presentation.heading) {
   const heading = el('div', 'room-heading');
   const icon = el('ha-icon');
   icon.setAttribute('icon', text(room.icon) || text(payload.icon)
    || (outdoor ? 'mdi:weather-partly-cloudy' : 'mdi:home-thermometer'));
   heading.append(icon, el('span', '', name));
   section.append(heading);
  }
  const grid = el('div', outdoor ? 'grid outdoor-grid' : 'grid indoor-grid');
  for (const [key, label] of outdoor ? OUT_FIELDS : FIELDS) {
   if (outdoor) {
    const field = el('div', 'out-field');
    if (this._config.outdoor?.show_header !== false) {
     field.append(el('div', 'out-label', climateColumnLabel(this._config, key, true, label)));
    }
    field.append(this._cell(room, key, true));
    grid.append(field);
   } else grid.append(this._cell(room, key, false));
  }
  section.append(grid);
  const details = this._details(room, outdoor, path);
  if (details) section.append(details);
  else if (!outdoor && !presentation.heading && presentation.labelMode !== 'auto_hide_empty') {
   // Preserve identity in the original three modes; auto_hide_empty explicitly
   // omits this noninteractive row when no details can be displayed.
   section.append(el('div', 'room-identity', name));
  }
  (room.children || []).forEach((row, index) => {
   section.append(this._room(row, false, true, `${path}/children/${index}`));
  });
  return section;
 }
 async _mountWeather(){const host=this.shadowRoot.querySelector('[data-weather-host]');if(!host||!host.closest('details')?.open||!this.isConnected)return;const outdoor=this._config.outdoor;if(!outdoor?.weather_entity||outdoor.show_weather===false)return;const config={type:'weather-forecast',entity:outdoor.weather_entity,show_current:true,show_forecast:outdoor.show_forecast!==false,forecast_type:['daily','hourly','twice_daily'].includes(outdoor.forecast_type)?outdoor.forecast_type:'daily'},signature=JSON.stringify(config);if(this._weatherCard&&signature===this._weatherSignature){this._weatherCard.hass=this._hass;if(this._weatherCard.parentNode!==host)host.replaceChildren(this._weatherCard);return;}const token=++this._weatherToken;host.replaceChildren(el('div','','Wetterkarte wird geladen …'));try{if(typeof window.loadCardHelpers!=='function')throw Error('Home-Assistant-Kartenhelfer nicht verfügbar. Bitte Seite vollständig neu laden.');const helpers=await window.loadCardHelpers();if(token!==this._weatherToken||!this.isConnected)return;if(typeof helpers.createCardElement!=='function')throw Error('Wetterkarte konnte nicht erstellt werden.');const card=helpers.createCardElement(config);card.hass=this._hass;this._weatherCard=card;this._weatherSignature=signature;const current=this.shadowRoot.querySelector('[data-weather-host]');if(current&&current.closest('details')?.open)current.replaceChildren(card);}catch(error){if(token===this._weatherToken){const current=this.shadowRoot.querySelector('[data-weather-host]');if(current)current.replaceChildren(el('div','warning',`Wetterkarte: ${error.message}`));}}}
 _render(){if(!this._config)return;this._weatherToken++;const opened=new Set([...this.shadowRoot.querySelectorAll('details[open]')].map(d=>d.dataset.path)),card=el('ha-card');card.style.setProperty('--neutral',neutralBackground(this._config.neutral_tint_strength));if(this._config.title){const title=el('h2','title',this._config.title),size=Number(this._config.title_font_size);if(Number.isFinite(size)&&size>=10&&size<=72)title.style.setProperty('--title-size',`${size}px`);if(validColor(this._config.title_color))title.style.setProperty('--title-color',this._config.title_color);card.append(title);}if(this._config.outdoor)card.append(this._room(this._config.outdoor,true,false,'outdoor'));if(this._config.show_header!==false&&(this._config.rooms||[]).length){const header=el('div','grid header indoor-grid');for(const [key,,label]of CLIMATE_INDOOR_COLUMNS)header.append(el('div','',climateColumnLabel(this._config,key,false,label)));card.append(header);}(this._config.rooms||[]).forEach((r,i)=>card.append(this._room(r,false,false,`rooms/${i}`)));if(!this._config.outdoor&&!this._config.rooms?.length)card.append(el('div','empty','Bitte im Editor einen Raum hinzufügen.'));this.shadowRoot.replaceChildren(el('style','',CARD_CSS+(this._appearanceCss?'\n'+this._appearanceCss:'')),card);for(const d of this.shadowRoot.querySelectorAll('details'))d.open=opened.has(d.dataset.path);this._mountWeather();}
}
const EDITOR_CSS=`.appearance-controls{min-width:0}.appearance-controls:disabled{opacity:.5}.appearance-shadow-example{display:block;white-space:normal;overflow-wrap:anywhere;font-size:12px;margin:8px 0}:host{display:block}*{box-sizing:border-box}label{display:block;margin:10px 0}input[type=text],input[type=number],select{width:100%;display:block;padding:9px;background:var(--secondary-background-color);color:var(--primary-text-color);border:1px solid var(--divider-color);border-radius:6px;font:inherit}fieldset{min-width:0;margin:14px 0;border:1px solid var(--divider-color);border-radius:8px}button{margin:5px;padding:8px;cursor:pointer}.check{display:flex;gap:8px;align-items:center}.check input{flex:none}.color-row{display:grid;grid-template-columns:44px minmax(0,1fr);gap:8px;align-items:center}input[type=color]{width:44px;height:38px;padding:0;border:0;background:none}.rule{display:grid;grid-template-columns:minmax(70px,1fr) minmax(100px,2fr) auto;gap:6px;align-items:center}.help{font-size:12px;color:var(--secondary-text-color);line-height:1.5}.error{font-size:12px;color:var(--error-color,#db4437);line-height:1.5}summary{cursor:pointer;font-weight:600;padding:10px 0}.section-panel{border-bottom:1px solid var(--divider-color);padding-bottom:8px}.color-controls{margin:0;padding:0;border:0}.color-controls:disabled{opacity:.45}.color-controls:disabled button{cursor:default}.tint-row{display:grid;grid-template-columns:minmax(0,1fr) 85px 20px;gap:10px;align-items:center}.tint-row input[type=range]{width:100%;accent-color:var(--primary-color)}`;
class SHFDFreshAirIQRoomCardEditor extends HTMLElement{
 constructor(){super();this.attachShadow({mode:'open'});this._open=new Set();}
 set hass(h){this._hass=h;this._suggestions();}
 setConfig(c){this._config=clone(c);this._render();}
 _emit(){this.dispatchEvent(new CustomEvent('config-changed',{detail:{config:clone(this._config)},bubbles:true,composed:true}));}
 _suggestions(){const ids=Object.keys(this._hass?.states||{}).sort(),sig=ids.join('|');if(sig===this._ids)return;this._ids=sig;for(const domain of['sensor','weather']){const list=this.shadowRoot.querySelector(`#climate-${domain}`);if(list)list.replaceChildren(...ids.filter(id=>id.startsWith(domain+'.')).map(id=>{const o=el('option');o.value=id;return o;}));}}
 _button(parent,text,fn){const b=el('button','',text);b.type='button';b.onclick=fn;parent.append(b);return b;}
 _text(parent,title,value,fn,domain=''){const label=el('label','',title),input=el('input');input.type='text';input.value=value??'';if(domain){input.setAttribute('list',`climate-${domain===true?'sensor':domain}`);input.autocomplete='off';}input.onchange=()=>{fn(input.value.trim());this._emit();};label.append(input);parent.append(label);return input;}
 _check(parent,title,checked,fn){const label=el('label','check'),input=el('input');input.type='checkbox';input.checked=checked;input.onchange=()=>{fn(input.checked);this._emit();};label.append(input,document.createTextNode(title));parent.append(label);}
 _select(parent,title,value,options,fn){const label=el('label','',title),select=el('select');for(const[key,text]of options){const option=el('option','',text);option.value=key;select.append(option);}select.value=value;select.onchange=()=>{fn(select.value);this._emit();};label.append(select);parent.append(label);}
 _panel(parent,key,title,top=false){const panel=el('details',top?'section-panel':'');panel.dataset.key=key;panel.open=this._open.has(key);panel.append(el('summary','',title));parent.append(panel);return panel;}
 _colorInput(parent,title,value,fn,placeholder='Leer = neutral'){const label=el('label','',title),row=el('div','color-row'),picker=el('input'),text=el('input');picker.type='color';picker.value=/^#[0-9a-f]{6}$/i.test(value||'')?value:'#808080';text.type='text';text.value=value??'';text.placeholder=placeholder;const apply=v=>{if(fn(v)!==false)this._emit();};picker.onchange=()=>{text.value=picker.value;text.setCustomValidity('');apply(picker.value);};text.onchange=()=>{const v=text.value.trim();text.setCustomValidity(v&&!validColor(v)?'Gültige CSS-Farbe eingeben.':'');if(!text.checkValidity()){text.reportValidity();return;}if(/^#[0-9a-f]{6}$/i.test(v))picker.value=v;apply(v);};row.append(picker,text);label.append(row);parent.append(label);}
 _category(kind){this._config.color_rules??={};return this._config.color_rules[kind]??={};}
 _ranges(parent,kind,outdoor=false){
  const key=outdoor?'outdoor_ranges':'ranges',current=()=>rangesFor(this._config,kind,outdoor),rows=current(),notice=el('div','error');notice.setAttribute('role','status');if(!Array.isArray(rows)){notice.textContent='Farbbereiche sind keine Liste. Bitte Standardwerte wiederherstellen.';parent.append(notice);return;}
  notice.textContent=rangeIssues(rows).join(' ');parent.append(notice,el('p','help','Genau ein Grundbereich; jede numerische Untergrenze nur einmal. Höchste passende Untergrenze gilt inklusive. Leere Farbe = neutral. Bestehende ungültige Regeln bitte korrigieren oder zurücksetzen.'));const save=next=>{this._category(kind)[key]=next;};
  const entries=rows.map((row,index)=>({row,index})).sort((a,b)=>{const x=rangeLimit(a.row),y=rangeLimit(b.row);return(x===null?Infinity:x)-(y===null?Infinity:y)||a.index-b.index;});
  for(const{row:r,index:i}of entries){if(!r||typeof r!=='object')continue;const line=el('div','rule'),label=el('label','',r.above===null?'Grundbereich':'Ab Wert'),input=el('input');input.type='number';input.step='any';input.placeholder='Alle';input.value=r.above??'';input.oninput=()=>input.setCustomValidity('');input.onchange=()=>{if(input.validity.badInput||!input.checkValidity()){input.reportValidity();return;}const value=input.value===''?null:Number(input.value),next=clone(current());if(next.some((v,j)=>j!==i&&(value===null?v?.above===null:v?.above!==null&&numeric(v?.above)===value))){input.setCustomValidity(value===null?'Es darf nur einen Grundbereich geben.':'Diese Untergrenze ist bereits vorhanden.');input.reportValidity();return;}if(r.above===null&&value!==null&&!next.some((v,j)=>j!==i&&v?.above===null)){input.setCustomValidity('Der einzige Grundbereich muss erhalten bleiben.');input.reportValidity();return;}next[i].above=value;save(next);this._emit();this._render();};label.append(input);line.append(label);this._colorInput(line,'Farbe',r.color??'',v=>{const next=clone(current());next[i].color=v;save(next);});const remove=this._button(line,'×',()=>{const next=clone(current());next.splice(i,1);save(next);this._emit();this._render();});remove.title='Farbbereich entfernen';remove.disabled=r.above===null&&rows.filter(v=>v?.above===null).length===1;parent.append(line);}
  if(!rows.some(r=>r?.above===null))this._button(parent,'Grundbereich hinzufügen',()=>{const next=clone(current());next.unshift({above:null,color:''});save(next);this._emit();this._render();});
  this._button(parent,'Bereich hinzufügen',()=>{const next=clone(current()),used=new Set(next.filter(r=>r?.above!==null).map(r=>numeric(r?.above)));let value=0;while(used.has(value))value++;next.push({above:value,color:'#A5D6A7'});save(next);this._emit();this._render();});
 }
 _colors(parent){const outer=this._panel(parent,'colors','Farben & Grenzwerte',true);outer.append(el('p','help','Innen- und Außenfarben unabhängig aktivieren. An = Standardfarben oder eigene Farben; Aus = transparente neutrale Tönung. Einstellungen bleiben erhalten. Wertebereiche sind Darstellungshilfen, keine Schimmel- oder Gesundheitsbewertung. Zahlenregeln gelten für °C, % beziehungsweise g/m³.'));
  for(const[kind,title]of[['recommendation','Empfehlung'],['absolute_humidity','Absolute Feuchte (g/m³)'],['temperature','Temperatur (°C)'],['mould','Schimmelrisiko'],['relative_humidity','Relative Außenfeuchte (%)'],['dew_point','Außentaupunkt (°C)']]){const panel=this._panel(outer,'color-'+kind,title),stateBased=['recommendation','mould'].includes(kind),hasIndoor=stateBased||['temperature','absolute_humidity'].includes(kind);if(hasIndoor){const controls=el('fieldset','color-controls'),enabled=this._config.color_rules?.[kind]?.enabled!==false;controls.disabled=!enabled;this._check(panel,'Farben für Innenräume aktivieren',enabled,v=>{this._category(kind).enabled=v;controls.disabled=!v;});if(stateBased){for(const[key,label]of Object.entries(kind==='recommendation'?ACTIONS:RISKS).filter(([key])=>key!=='unknown'))this._colorInput(controls,`${label} (${key})`,stateColor(this._config,kind,key),v=>{const c=this._category(kind);c.states??={};c.states[key]=v;});}else this._ranges(controls,kind,false);panel.append(controls);this._button(panel,'Innenfarben zurücksetzen',()=>{resetSide(this._config,kind,false);this._emit();this._render();});}if(!stateBased){const controls=el('fieldset','color-controls'),enabled=this._config.color_rules?.[kind]?.outdoor_enabled===true;controls.disabled=!enabled;this._check(panel,'Farben für Außenwerte aktivieren',enabled,v=>{this._category(kind).outdoor_enabled=v;controls.disabled=!v;});this._ranges(controls,kind,true);panel.append(controls);this._button(panel,'Außenfarben zurücksetzen',()=>{resetSide(this._config,kind,true);this._emit();this._render();});}}
 }

 _appearance(parent) {
  const panel = this._panel(parent, 'appearance', 'Darstellung', true);
  const draft = clone(this._config.appearance || {});
  const form = el('form'); form.onsubmit = event => event.preventDefault(); panel.append(form);
  form.append(el('p', 'help', 'Gilt nur für diese Klimakarte. Änderungen mit Darstellung übernehmen speichern. Farben der Messwerte und die neutrale Kacheltönung bleiben davon unabhängig. Ohne eigene Einstellungen bleiben Theme und bisherige mobile Abstände erhalten.'));
  const body = el('div'); form.append(body);
  const get = path => path.split('.').reduce((v, key) => v?.[key], draft);
  const set = (path, value) => {
   const keys = path.split('.'); let target = draft;
   for (const key of keys.slice(0,-1)) target = target[key] ||= {};
   if (value === undefined) delete target[keys.at(-1)]; else target[keys.at(-1)] = value;
  };
  const group = title => { const box = el('fieldset'); box.append(el('legend','',title)); body.append(box); return box; };
  const number = (parent,path,title,fallback,help,max=100) => {
   const label=el('label','',title),input=el('input'); input.type='number';input.min='0';input.max=String(max);input.step='any';input.value=get(path)??fallback;
   input.oninput=()=>{if(!input.validity.badInput)set(path,input.value===''?undefined:Number(input.value));};
   input.onchange=()=>{if(input.value===''&&!input.validity.badInput)input.value=String(fallback);};
   label.append(input);parent.append(label,el('p','help',help));
  };
  const color = (parent,path,title) => this._colorInput(parent,title,get(path),v=>{set(path,v||undefined);return false;},'Leer = bisheriger Standard');
  const check = (parent,path,title,defaultValue=true) => {
   const label=el('label','check'),input=el('input');input.type='checkbox';input.checked=get(path)??defaultValue;
   input.onchange=()=>{set(path,input.checked);render();};label.append(input,document.createTextNode(title));parent.append(label);
  };
  const select=(parent,path,title,fallback,options,onChange)=>{
   const label=el('label','',title),input=el('select');for(const [value,title]of options){const option=el('option','',title);option.value=value;input.append(option);}input.value=get(path)??fallback;
   input.onchange=()=>{set(path,input.value);if(onChange)onChange(input.value);render();};label.append(input);parent.append(label);
  };
  const render=()=>{
   body.replaceChildren();
   const spacing=group('Abstände');
   number(spacing,'padding','Abstand zum Kartenrand (px)',16,'Innenabstand der Raum- und Außenzeilen. Bisheriger Standard: 16 px, auf schmalen Displays 12 px. Ein eigener Wert gilt auf allen Bildschirmgrößen. Titel und Spaltenüberschriften erhalten denselben seitlichen Abstand.');
   number(spacing,'indoor_item_gap','Abstand zwischen Innenwerten (px)',get('item_gap')??8,'Abstand zwischen Empfehlung, absoluter Feuchte, Temperatur und Schimmelrisiko. Standard: 8 px, mobil 5 px. 0 entfernt den zusätzlichen Kachelabstand.');
   number(spacing,'outdoor_item_gap','Abstand zwischen Außenwerten (px)',get('item_gap')??8,'Abstand zwischen den Kacheln der Außenzeile. Standard: 8 px, mobil 5 px. Ändert weder Werte noch Farben.');
   number(spacing,'section_spacing','Zusatzabstand zwischen Raumzeilen (px)',0,'Zusätzlicher Freiraum zwischen Raumzeilen, Außenzeile und Spaltenüberschrift. Standard: 0 px zusätzlich zum vorhandenen Innenabstand. Zusätzliche Messstellen behalten ihren bisherigen Abstand plus diesen Wert.');
   this._button(spacing,'Standardabstände wiederherstellen',()=>{for(const key of ['padding','section_spacing','item_gap','indoor_item_gap','outdoor_item_gap'])delete draft[key];render();});
   const dividers=group('Trennlinien');check(dividers,'dividers.enabled','Trennlinien anzeigen');
   const dc=el('fieldset','appearance-controls');dc.disabled=get('dividers.enabled')===false;dividers.append(dc);
   number(dc,'dividers.width','Linienstärke (px)',1,'Stärke der Trennlinien zwischen Zeilen und zusätzlichen Messstellen. 0 blendet sie aus.',10);
   color(dc,'dividers.color','Linienfarbe (leer = Theme)');
   const background=group('Hintergrund');
   select(background,'background.mode','Kartenhintergrund','theme',[['theme','Theme verwenden'],['transparent','Transparent'],['custom','Eigene Farbe']],mode=>{if(mode==='custom'&&!get('background.color'))set('background.color','#202124');});
   if(get('background.mode')==='custom')color(background,'background.color','Hintergrundfarbe');
   background.append(el('p','help','Ändert nur die äußere Kartenfläche. Messwertfarben und die unter Allgemein eingestellte neutrale Kacheltönung bleiben erhalten.'));
   const border=group('Rahmen und Ecken');
   const themeLabel=el('label','check'),theme=el('input');theme.type='checkbox';
   theme.checked=get('border.enabled')===undefined&&get('border.width')===undefined&&get('border.color')===undefined;
   theme.onchange=()=>{if(theme.checked){for(const key of ['enabled','width','color'])set('border.'+key,undefined);}else{set('border.enabled',true);set('border.width',1);}render();};
   themeLabel.append(theme,document.createTextNode('Bisherigen Theme-Rahmen verwenden (Standard)'));border.append(themeLabel);
   number(border,'border.radius','Eckenradius (px)',16,'Ohne eigene Einstellung gilt der Theme-Radius (Fallback 16 px). Ein eigener Wert gilt unabhängig vom Theme; 0 ergibt eckige Kanten.');
   const bc=el('fieldset','appearance-controls');bc.disabled=theme.checked;border.append(bc);check(bc,'border.enabled','Eigenen Rahmen anzeigen');
   const sizes=el('fieldset','appearance-controls');sizes.disabled=theme.checked||get('border.enabled')===false;bc.append(sizes);
   number(sizes,'border.width','Rahmenstärke (px)',1,'Stärke des eigenen Kartenrahmens. 0 blendet ihn aus.',10);color(sizes,'border.color','Rahmenfarbe (leer = Theme)');
   const shadow=group('Schatten');
   select(shadow,'shadow.mode','Schattenstil','default',[['default','Bisheriger Schatten (Theme)'],['none','Kein Schatten'],...Object.entries(CLIMATE_SHADOW_PRESETS).map(([key,preset])=>[key,preset.label]),['custom','Eigener CSS-Schatten']],mode=>{
    if(mode==='custom'&&!get('shadow.value'))set('shadow.value',CLIMATE_SHADOW_PRESETS.soft.value);
   });
   const selected=get('shadow.mode')??'default',preset=CLIMATE_SHADOW_PRESETS[selected];
   shadow.append(el('p','help','Dieselben Schattenvorlagen wie in der Raumkarte. Bisheriger Schatten belässt das vorhandene Theme-Verhalten unverändert.'));
   if(preset){shadow.append(el('code','appearance-shadow-example',preset.value));this._button(shadow,'Als eigenen Schatten bearbeiten',()=>{set('shadow.value',preset.value);set('shadow.mode','custom');render();});}
   if(selected==='custom'){
    const label=el('label','','CSS box-shadow (erweitert)'),input=el('input');input.type='text';input.maxLength=512;input.value=get('shadow.value')??'';input.oninput=()=>set('shadow.value',input.value.trim()||undefined);label.append(input);shadow.append(label);
   }
  };
  render();
  const error=el('p','error');error.setAttribute('role','status');form.append(error);
  this._button(form,'Darstellung übernehmen',()=>{
   if(!form.reportValidity())return;
   try{climateAppearanceCss(draft);}catch(e){error.textContent=e.message;return;}
   this._config={...this._config,appearance:clone(draft)};this._emit();this._render();
  });
  this._button(form,'Darstellung auf Standard zurücksetzen',()=>{const config={...this._config};delete config.appearance;this._config=config;this._emit();this._render();});
 }

 _detailSettings(parent){const panel=this._panel(parent,'room-details','Raumdetails',true);this._check(panel,'Raumdetails anzeigen',this._config.show_details!==false,v=>this._config.show_details=v);this._check(panel,'Fehlende Raumdetails automatisch ausblenden',this._config.hide_missing_details!==false,v=>this._config.hide_missing_details=v);panel.append(el('p','help','Globale Vorgaben für alle Innenräume ohne eigene Überschreibung. Individuelle Optionen findest du beim jeweiligen Raum unter Raumdetails. Nullwerte bleiben sichtbar. Sitzungswerte nur bei aktiver Lüftung; CO₂ nur bei verfügbarer Messung. Außenwetter wird unabhängig unter Außenwerte eingestellt.'));for(const group of new Set(DETAIL_DEFS.map(d=>d[2]))){const box=el('fieldset');box.append(el('legend','',group));for(const[id,label]of DETAIL_DEFS.filter(d=>d[2]===group))this._check(box,label,(this._config.detail_fields??DEFAULT_DETAILS).includes(id),checked=>{const selected=new Set(this._config.detail_fields??DEFAULT_DETAILS);if(checked)selected.add(id);else selected.delete(id);this._config.detail_fields=DETAIL_DEFS.map(d=>d[0]).filter(k=>selected.has(k));});panel.append(box);}for(const[text,value]of[['Standardauswahl',DEFAULT_DETAILS],['Alle auswählen',DETAIL_DEFS.map(d=>d[0])],['Auswahl leeren',[]]])this._button(panel,text,()=>{this._config.detail_fields=[...value];this._emit();this._render();});}
 _tintControl(parent){
  const box=el('fieldset');box.append(el('legend','','Neutrale Kacheln'));const label=el('div','','Tönungsstärke'),row=el('div','tint-row'),slider=el('input'),number=el('input');slider.type='range';number.type='number';for(const input of[slider,number]){input.min='0';input.max='100';input.step='1';input.value=String(tintStrength(this._config.neutral_tint_strength));input.setAttribute('aria-label','Tönungsstärke neutraler Kacheln in Prozent');}
  slider.oninput=()=>{number.setCustomValidity('');number.value=slider.value;};slider.onchange=()=>{this._config.neutral_tint_strength=Number(slider.value);this._emit();};
  number.oninput=()=>number.setCustomValidity('');number.onchange=()=>{if(number.validity.badInput||!number.checkValidity()){number.reportValidity();return;}if(number.value===''){delete this._config.neutral_tint_strength;slider.value='12';number.value='12';}else{slider.value=number.value;this._config.neutral_tint_strength=Number(number.value);}this._emit();};
  row.append(slider,number,el('span','','%'));box.append(label,row,el('p','help','0 % = vollständig transparent; 100 % = deckende Theme-Akzentfarbe. Standard: 12 %. Gilt nur für Kacheln ohne Zustandsfarbe; Text bleibt vollständig deckend.'));
  this._button(box,'Tönung zurücksetzen',()=>{delete this._config.neutral_tint_strength;this._emit();this._render();});parent.append(box);
 }
 _general(parent){const form=this._panel(parent,'general','Allgemein',true);this._text(form,'Titel (optional)',this._config.title,v=>this._config.title=v);const label=el('label','','Schriftgröße der Überschrift (10–72 px)'),size=el('input');size.type='number';size.min='10';size.max='72';size.step='1';size.placeholder='20';size.value=this._config.title_font_size??'';size.onchange=()=>{if(size.validity.badInput||!size.checkValidity()){size.reportValidity();return;}if(size.value==='')delete this._config.title_font_size;else this._config.title_font_size=Number(size.value);this._emit();};label.append(size);form.append(label);this._colorInput(form,'Überschriftfarbe (leer = Theme)',this._config.title_color,v=>{if(v)this._config.title_color=v;else delete this._config.title_color;},'Leer = Theme');this._check(form,'Spaltenüberschriften für Innenräume anzeigen',this._config.show_header!==false,v=>this._config.show_header=v);this._columnLabelSettings(form,this._config,false,'indoor-column-labels');this._presentationSettings(form);this._tintControl(form);}
 _outdoor(parent) {
  const panel = this._panel(parent, 'outdoor', 'Außenwerte', true);
  const room = this._config.outdoor;

  if (!room) {
   this._button(panel, 'Außenzeile hinzufügen', () => {
    this._config.outdoor = {
     name: 'Draußen',
     icon: 'mdi:weather-partly-cloudy',
    };
    this._emit();
    this._render();
   });
   return;
  }

  const update = (key, value) => {
   if (value) room[key] = value;
   else delete room[key];
  };

  this._text(panel, 'Name der Außenzeile', room.name,
   value => update('name', value));

  this._text(panel, 'Icon der Außenzeile (mdi:...)', room.icon,
   value => update('icon', value));

  this._check(
   panel,
   'Spaltenüberschriften für Außenwerte anzeigen',
   room.show_header !== false,
   value => room.show_header = value
  );

  panel.append(el(
   'p',
   'help',
   'Jede Gruppe gehört zu einer Außenspalte. Beschriftung und Sensor ' +
   'werden gemeinsam eingestellt. Leere Beschriftungen verwenden ' +
   'den Standard; fehlende Sensorwerte erscheinen als –.'
  ));

  const columns = [
   ['humidity_entity', 'humidity', 'Relative Feuchte'],
   ['absolute_humidity_entity', 'absolute_humidity', 'Absolute Feuchte'],
   ['temperature_entity', 'temperature', 'Temperatur'],
   ['dew_point_entity', 'dew_point', 'Taupunkt'],
  ];

  for (const [entityKey, labelKey, title] of columns) {
   const box = el('fieldset');
   box.append(el('legend', '', title));

   const defaultLabel = CLIMATE_OUTDOOR_COLUMNS
    .find(column => column[1] === labelKey)?.[2] || title;

   const caption = this._text(
    box,
    'Spaltenüberschrift',
    room.column_labels?.[labelKey],
    value => {
     if (value) {
      (room.column_labels ??= {})[labelKey] = value;
     } else if (room.column_labels) {
      delete room.column_labels[labelKey];

      if (!Object.keys(room.column_labels).length) {
       delete room.column_labels;
      }
     }
    }
   );

   caption.placeholder = defaultLabel;

   this._text(
    box,
    'Sensor-Entität',
    room[entityKey],
    value => update(entityKey, value),
    true
   );

   panel.append(box);
  }

  this._button(panel, 'Standardbeschriftungen wiederherstellen', () => {
   delete room.column_labels;
   this._emit();
   this._render();
  });

  panel.append(el(
   'p',
   'help',
   'Das Zurücksetzen betrifft nur die Beschriftungen. ' +
   'Sensorzuordnungen bleiben erhalten. Der Taupunkt wird nicht berechnet.'
  ));

  const weather = this._panel(panel, 'outdoor-weather', 'Wetterkarte');

  this._text(
   weather,
   'Wetterentität (optional)',
   room.weather_entity,
   value => update('weather_entity', value),
   'weather'
  );

  this._check(
   weather,
   'Wetterkarte in Außendetails anzeigen',
   room.show_weather !== false,
   value => room.show_weather = value
  );

  this._check(
   weather,
   'Vorhersage anzeigen',
   room.show_forecast !== false,
   value => room.show_forecast = value
  );

  this._select(
   weather,
   'Vorhersagetyp',
   room.forecast_type || 'daily',
   [
    ['daily', 'Täglich'],
    ['hourly', 'Stündlich'],
    ['twice_daily', 'Zweimal täglich'],
   ],
   value => room.forecast_type = value
  );

  weather.append(el(
   'p',
   'help',
   'Unabhängig vom Schalter Raumdetails. Nur Vorhersagetypen wählen, ' +
   'die die Wetterintegration unterstützt.'
  ));

  this._button(panel, 'Außenzeile entfernen', () => {
   delete this._config.outdoor;
   this._emit();
   this._render();
  });
 }


 _columnLabelSettings(parent, target, outdoor, key) {
  const panel = this._panel(parent, key, outdoor ? 'Beschriftungen der Außenspalten' : 'Beschriftungen der Innenspalten');
  panel.append(el('p', 'help', 'Nur die sichtbaren Texte ändern sich. Sensorzuordnung, Reihenfolge und Farben bleiben erhalten. Leere Texte verwenden die Standardbeschriftung. Die Sichtbarkeit wird unabhängig über den Schalter für Spaltenüberschriften eingestellt.'));
  for (const [, columnKey, defaultLabel] of outdoor ? CLIMATE_OUTDOOR_COLUMNS : CLIMATE_INDOOR_COLUMNS) {
   const input = this._text(panel, defaultLabel + ' (Standard: ' + defaultLabel + ')', target.column_labels?.[columnKey], value => {
    if (value) (target.column_labels ??= {})[columnKey] = value;
    else if (target.column_labels) {
     delete target.column_labels[columnKey];
     if (!Object.keys(target.column_labels).length) delete target.column_labels;
    }
   });
   input.placeholder = defaultLabel;
  }
  this._button(panel, 'Standardbeschriftungen wiederherstellen', () => {
   delete target.column_labels;
   this._emit(); this._render();
  });
 }


 _presentationSettings(parent) {
  const panel = this._panel(parent, 'room-presentation', 'Raumzeile und Detailbeschriftung');
  panel.append(el('p', 'help', 'Globale Vorgaben für Innenräume ohne eigene Überschreibung. Die Raumzeile enthält Icon und Raumname. Spaltenüberschriften und Außenzeile werden unabhängig eingestellt.'));
  this._check(panel, 'Raumzeile mit Icon und Raumnamen anzeigen', this._config.show_room_heading !== false, value => {
   this._config.show_room_heading = value;
  });
  this._select(panel, 'Beschriftung des Detailbereichs', this._config.details_label_mode ?? 'auto', [
   ['auto', 'Automatisch: Details bei sichtbarer Raumzeile, sonst Raumname'],
   ['room_name', 'Immer den Raumnamen verwenden'],
   ['details', 'Immer Details verwenden'],
   ['auto_hide_empty', 'Automatisch – ohne Details keine Namenszeile'],
  ], value => { this._config.details_label_mode = value; });
  panel.append(el('p', 'help', 'Bei ausgeblendeter Raumzeile bleibt ohne anzeigbare Details normalerweise eine schmale Namenszeile erhalten. Die vierte Auswahl Automatisch – ohne Details keine Namenszeile entfernt diese Zeile vollständig. Sind Details vorhanden, wird im kompakten Modus weiterhin der Raumname als aufklappbare Beschriftung angezeigt. Eine separat eingeschaltete Raumzeile bleibt sichtbar.'));
  this._button(panel, 'Standard für Raumzeile wiederherstellen', () => {
   delete this._config.show_room_heading;
   delete this._config.details_label_mode;
   this._emit(); this._render();
  });
 }

 _roomPresentationSettings(parent, room, index) {
  const panel = this._panel(parent, `room-${index}-presentation`, 'Raumzeile und Detailbeschriftung');
  const global = climateRoomPresentation(this._config);
  const modeText = {
   auto: 'automatisch', room_name: 'Raumname', details: 'Details',
   auto_hide_empty: 'automatisch, ohne Details keine Namenszeile',
  };
  const save = (key, value) => {
   if (value === 'global') delete room[key];
   else room[key] = key === 'show_room_heading' ? value === 'true' : value;
   this._render();
  };
  this._select(panel, 'Raumzeile', room.show_room_heading === undefined ? 'global' : String(room.show_room_heading), [
   ['global', 'Global übernehmen (' + (global.heading ? 'anzeigen' : 'ausblenden') + ')'],
   ['true', 'Für diesen Raum anzeigen'],
   ['false', 'Für diesen Raum ausblenden'],
  ], value => save('show_room_heading', value));
  this._select(panel, 'Detailbeschriftung', room.details_label_mode ?? 'global', [
   ['global', 'Global übernehmen (' + modeText[global.labelMode] + ')'],
   ['auto', 'Automatisch'],
   ['room_name', 'Raumname'],
   ['details', 'Details'],
   ['auto_hide_empty', 'Automatisch – ohne Details keine Namenszeile'],
  ], value => save('details_label_mode', value));
  panel.append(el('p', 'help', 'Automatisch verwendet bei ausgeblendeter Raumzeile den Raumnamen statt Details. Name aus der Raumkonfiguration hat Vorrang vor dem Payload-Namen; ohne beide gilt Raum. Die vierte Auswahl lässt bei fehlenden Details auch die untere Namenszeile entfallen. Zum vollständigen Ausblenden des Namens muss zusätzlich die Raumzeile ausgeschaltet sein. Detailfelder und Detail-Sichtbarkeit bleiben unter Raumdetails einstellbar.'));
  this._button(panel, 'Globale Raumzeilen-Einstellungen übernehmen', () => {
   delete room.show_room_heading; delete room.details_label_mode;
   this._emit(); this._render();
  });
 }

 _roomDetailSettings(parent, room, index) {
  const panel = this._panel(parent, `room-${index}-details`, 'Raumdetails');
  panel.append(el('p', 'help', 'Jede Option übernimmt die globale Vorgabe, solange hier keine eigene Einstellung gewählt ist. Eine eigene Feldauswahl ersetzt die globale Liste vollständig. Sie wird nicht mit ihr zusammengeführt.'));
  const globalShow = this._config.show_details !== false;
  const globalHide = this._config.hide_missing_details !== false;
  const updateBoolean = (key, value) => {
   if (value === 'global') delete room[key];
   else room[key] = value === 'true';
   this._render();
  };
  this._select(panel, 'Details anzeigen', room.show_details === undefined ? 'global' : String(room.show_details), [
   ['global', 'Global übernehmen (' + (globalShow ? 'anzeigen' : 'ausblenden') + ')'],
   ['true', 'Für diesen Raum anzeigen'],
   ['false', 'Für diesen Raum ausblenden'],
  ], value => updateBoolean('show_details', value));
  this._select(panel, 'Fehlende Detailwerte', room.hide_missing_details === undefined ? 'global' : String(room.hide_missing_details), [
   ['global', 'Global übernehmen (' + (globalHide ? 'ausblenden' : 'Platzhalter anzeigen') + ')'],
   ['true', 'Fehlende Werte ausblenden'],
   ['false', 'Platzhalter anzeigen'],
  ], value => updateBoolean('hide_missing_details', value));
  const ownFields = Array.isArray(room.detail_fields);
  this._select(panel, 'Detailfelder', ownFields ? 'custom' : 'global', [
   ['global', 'Globale Auswahl verwenden'], ['custom', 'Eigene Auswahl für diesen Raum'],
  ], value => {
   if (value === 'custom') room.detail_fields = [...(this._config.detail_fields ?? DEFAULT_DETAILS)];
   else delete room.detail_fields;
   this._render();
  });
  if (ownFields) {
   for (const group of new Set(DETAIL_DEFS.map(def => def[2]))) {
    const box = el('fieldset'); box.append(el('legend', '', group));
    for (const [id, label] of DETAIL_DEFS.filter(def => def[2] === group)) {
     this._check(box, label, room.detail_fields.includes(id), checked => {
      room.detail_fields = checked ? [...new Set([...room.detail_fields, id])] : room.detail_fields.filter(key => key !== id);
     });
    }
    panel.append(box);
   }
   for (const [label, fields] of [
    ['Standardauswahl für diesen Raum', DEFAULT_DETAILS],
    ['Alle Felder für diesen Raum', DETAIL_DEFS.map(def => def[0])],
    ['Auswahl für diesen Raum leeren', []],
   ]) this._button(panel, label, () => {
    room.detail_fields = [...fields]; this._emit(); this._render();
   });
   panel.append(el('p', 'help', 'Eine leere eigene Liste zeigt keine Details an. Globale Änderungen ergänzen eine eigene Liste nicht automatisch.'));
  } else {
   const selected = this._config.detail_fields ?? DEFAULT_DETAILS;
   const names = DETAIL_DEFS.filter(def => selected.includes(def[0])).map(def => def[1]);
   panel.append(el('p', 'help', 'Aktuelle globale Auswahl: ' + (names.join(', ') || 'keine Felder') + '. Änderungen an der globalen Auswahl gelten weiterhin für diesen Raum.'));
  }
  this._button(panel, 'Globale Einstellungen wieder übernehmen', () => {
   delete room.show_details; delete room.hide_missing_details; delete room.detail_fields;
   this._emit(); this._render();
  });
 }

 _rooms(parent){const panel=this._panel(parent,'rooms','Innenräume',true);(this._config.rooms||[]).forEach((room,index)=>{const box=el('fieldset');box.append(el('legend','',`Raum ${index+1}`));const update=(k,v)=>{if(v)room[k]=v;else delete room[k];};this._text(box,'FreshAirIQ-Aktionssensor',room.recommendation_entity,v=>update('recommendation_entity',v),true);box.append(el('p','help','Name, Icon und Messwerte automatisch aus freshairiq_room_payload. Leere Überschreibungen verwenden das Payload.'));const advanced=this._panel(box,`room-${index}-overrides`,'Name, Icon und Sensoren überschreiben');this._text(advanced,'Name (leer = automatisch)',room.name,v=>update('name',v));this._text(advanced,'Icon (leer = automatisch)',room.icon,v=>update('icon',v));for(const[k,label]of FIELDS.filter(([k])=>k!=='recommendation_entity'))this._text(advanced,label+' (optional)',room[k],v=>update(k,v),true);this._text(advanced,'Relative Feuchte (optional)',room.humidity_entity,v=>update('humidity_entity',v),true);this._roomPresentationSettings(box,room,index);this._roomDetailSettings(box,room,index);if(room.children?.length)box.append(el('p','help','Zusätzliche Messstellen bleiben erhalten; derzeit nur über YAML bearbeitbar.'));const up=this._button(box,'↑',()=>{if(index<=0)return;const a=this._config.rooms;[a[index-1],a[index]]=[a[index],a[index-1]];this._emit();this._render();});up.disabled=index===0;const down=this._button(box,'↓',()=>{const a=this._config.rooms;if(index>=a.length-1)return;[a[index+1],a[index]]=[a[index],a[index+1]];this._emit();this._render();});down.disabled=index===this._config.rooms.length-1;this._button(box,'Raum entfernen',()=>{this._config.rooms.splice(index,1);this._emit();this._render();});panel.append(box);});this._button(panel,'Raum hinzufügen',()=>{(this._config.rooms??=[]).push({});this._emit();this._render();});}
 _render(){if(!this._config)return;for(const d of this.shadowRoot.querySelectorAll('details[data-key]')){if(d.open)this._open.add(d.dataset.key);else this._open.delete(d.dataset.key);}const form=el('div');this._general(form);this._appearance(form);this._outdoor(form);this._rooms(form);this._detailSettings(form);this._colors(form);const lists=['sensor','weather'].map(domain=>{const list=el('datalist');list.id=`climate-${domain}`;return list;});this.shadowRoot.replaceChildren(el('style','',EDITOR_CSS),form,...lists);this._ids=null;this._suggestions();}
}
if(!customElements.get('shfd-freshairiq-room-card-editor'))customElements.define('shfd-freshairiq-room-card-editor',SHFDFreshAirIQRoomCardEditor);
if(!customElements.get('shfd-freshairiq-room-card'))customElements.define('shfd-freshairiq-room-card',SHFDFreshAirIQRoomCard);
window.customCards=window.customCards||[];if(!window.customCards.some(c=>c.type==='shfd-freshairiq-room-card'))window.customCards.push({type:'shfd-freshairiq-room-card',name:'SHFD FreshAirIQ Raumkarte',preview:false,description:'FreshAirIQ Raumübersicht mit variabler neutraler Tönung, Raumdetails, Wetterkarte und unabhängigen Innen- und Außenfarben.'});
