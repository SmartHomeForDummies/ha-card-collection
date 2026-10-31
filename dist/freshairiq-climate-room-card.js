// SHFD FreshAirIQ Raumkarte — local live-editor test 2026-10-31
// Five editor sections, inline validation, direct preview, per-field automatic reset.
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

const CLIMATE_INDOOR_COLUMNS = [
 ['recommendation_entity','recommendation','Empfehlung'],
 ['absolute_humidity_entity','absolute_humidity','Abs. Feuchte'],
 ['temperature_entity','temperature','Temperatur'],
 ['mould_entity','mould','Schimmelrisiko'],
];
const CLIMATE_OUTDOOR_COLUMNS = [
 ['humidity_entity','humidity','Relative Feuchte'],
 ['absolute_humidity_entity','absolute_humidity','Abs. Feuchte'],
 ['temperature_entity','temperature','Temperatur'],
 ['dew_point_entity','dew_point','Taupunkt'],
];
const CLIMATE_LABEL_MODES = [
 ['auto','Automatisch'],['room_name','Immer Raumname'],
 ['details','Immer „Details“'],['auto_hide_empty','Automatisch, ohne Details keine Namenszeile'],
];
const CLIMATE_TILE_LIMITS = Object.freeze({
 font_size:{min:8,max:48,label:'Schriftgröße (px)',automatic:'Leer = automatisch: 14 px, bei schmaler Ansicht 12 px'},
 padding_vertical:{min:0,max:40,label:'Innenabstand oben und unten (px)',automatic:'Leer = automatisch: je 9 px, bei schmaler Ansicht je 8 px'},
});
function climateColumnLabel(config,key,outdoor=false,fallback) {
 const def=(outdoor?CLIMATE_OUTDOOR_COLUMNS:CLIMATE_INDOOR_COLUMNS).find(d=>d[0]===key);
 const custom=def?(outdoor?config.outdoor?.column_labels:config.column_labels)?.[def[1]]:undefined;
 return typeof custom==='string'&&custom.trim()?custom.trim():fallback??def?.[2]??key;
}
function climateRoomDetails(config,room={}) {
 return {show:room.show_details??config.show_details??true,hideMissing:room.hide_missing_details??config.hide_missing_details??true,fields:room.detail_fields??config.detail_fields??DEFAULT_DETAILS};
}
function climateRoomPresentation(config,room={}) {
 return {heading:room.show_room_heading??config.show_room_heading??true,labelMode:room.details_label_mode??config.details_label_mode??'auto'};
}
function validateClimateRoomOptions(config) {
 const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
 const fail=(p,m)=>{throw Error(p+': '+m);};
 const boolean=(v,p)=>{if(v!==undefined&&typeof v!=='boolean')fail(p,'muss true oder false sein.');};
 const fields=(v,p)=>{if(v!==undefined&&(!Array.isArray(v)||v.some(x=>typeof x!=='string')))fail(p,'muss eine Liste von Detailfeld-Schlüsseln sein.');};
 const mode=(v,p)=>{if(v!==undefined&&!CLIMATE_LABEL_MODES.some(([id])=>id===v))fail(p,'muss auto, room_name, details oder auto_hide_empty sein.');};
 const labels=(v,defs,p)=>{if(v===undefined)return;if(!object(v))fail(p,'muss ein Objekt sein.');for(const[k,t]of Object.entries(v)){if(!defs.some(d=>d[1]===k))fail(p+'.'+k,'unbekannte Spalte.');if(typeof t!=='string')fail(p+'.'+k,'muss ein Text sein.');}};
 for(const key of ['show_header','show_room_heading','show_details','hide_missing_details'])boolean(config[key],key);
 fields(config.detail_fields,'detail_fields');mode(config.details_label_mode,'details_label_mode');labels(config.column_labels,CLIMATE_INDOOR_COLUMNS,'column_labels');
 if(config.outdoor!==undefined){if(!object(config.outdoor))fail('outdoor','muss ein Objekt sein.');for(const key of ['show_header','show_room_heading'])boolean(config.outdoor[key],'outdoor.'+key);labels(config.outdoor.column_labels,CLIMATE_OUTDOOR_COLUMNS,'outdoor.column_labels');}
 const visit=(r,p)=>{if(!object(r))fail(p,'muss ein Raumobjekt sein.');for(const key of ['show_room_heading','show_details','hide_missing_details'])boolean(r[key],p+'.'+key);fields(r.detail_fields,p+'.detail_fields');mode(r.details_label_mode,p+'.details_label_mode');if(r.children!==undefined){if(!Array.isArray(r.children))fail(p+'.children','muss eine Liste sein.');r.children.forEach((c,i)=>visit(c,p+'.children['+i+']'));}};
 (config.rooms||[]).forEach((r,i)=>visit(r,'rooms['+i+']'));
}
function climateTileCss(appearance={}) {
 const rules=[];
 for(const side of ['indoor','outdoor']) {
  const key=side+'_tile',tile=appearance[key],path='appearance.'+key;
  if(tile===undefined)continue;
  if(tile===null||typeof tile!=='object'||Array.isArray(tile))throw Error(path+': muss ein Objekt sein.');
  const declarations=[];
  for(const[field,value]of Object.entries(tile)) {
   const legacy=field==='min_height';
   if(!legacy&&!Object.hasOwn(CLIMATE_TILE_LIMITS,field))throw Error(path+'.'+field+': unbekannte Option.');
   if(value===undefined)continue;
   const limit=legacy?{min:0,max:240}:CLIMATE_TILE_LIMITS[field];
   if(typeof value!=='number'||!Number.isFinite(value)||value<limit.min||value>limit.max)throw Error(path+'.'+field+': muss eine Zahl zwischen '+limit.min+' und '+limit.max+' sein.');
   if(legacy)continue;
   if(field==='font_size')declarations.push('font-size:'+value+'px');
   if(field==='padding_vertical')declarations.push('padding-top:'+value+'px','padding-bottom:'+value+'px');
  }
  if(declarations.length)rules.push('.grid.'+side+'-grid .cell{'+declarations.join(';')+'}');
 }
 return rules.join('\n');
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
  const a = shape(value, 'appearance', ['padding', 'section_spacing', 'item_gap', 'indoor_item_gap', 'outdoor_item_gap', 'indoor_tile', 'outdoor_tile', 'dividers', 'background', 'border', 'shadow']);
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
  const tileCss = climateTileCss(a); if(tileCss) rules.push(tileCss);
  if (padding !== undefined) {
    rules.push(`.section{padding:${padding}px}.title,.header{padding-left:${padding}px;padding-right:${padding}px}`);
  }
  if (spacing !== undefined) {
    rules.push(`.section+.section,.header+.section,.section+.header{margin-top:${spacing}px}.child{margin-top:${14 + spacing}px}`);
  }
  if (gap !== undefined) rules.push(`.grid{gap:${gap}px}.grid.outdoor-grid{row-gap:4px}`);
  if (indoorGap !== undefined) rules.push(`.grid.indoor-grid{gap:${indoorGap}px}`);
  if (outdoorGap !== undefined) rules.push(`.grid.outdoor-grid{column-gap:${outdoorGap}px}`);
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
.cell{display:flex;align-items:center;justify-content:center;min-width:0;min-height:0;padding:9px 5px;border:0;border-radius:10px;background:var(--neutral,rgba(128,128,128,.12));color:var(--primary-text-color);font:inherit;font-size:14px;font-weight:600;line-height:1.3;text-align:center;overflow-wrap:anywhere;white-space:pre-line}button.cell{cursor:pointer;-webkit-tap-highlight-color:transparent}button:focus-visible,summary:focus-visible{outline:2px solid var(--primary-color);outline-offset:2px}
.grid.indoor-grid,.grid.outdoor-grid{align-items:stretch}.grid.outdoor-grid{row-gap:4px}.grid.outdoor-grid>.out-label{margin-bottom:0}
.out-field{min-width:0}.out-label{display:flex;align-items:center;justify-content:center;min-height:30px;margin-bottom:4px;text-align:center;color:var(--secondary-text-color);font-size:11px;line-height:1.2;overflow-wrap:anywhere}.out-field .cell{width:100%}
.details{margin-top:10px;color:var(--secondary-text-color);font-size:13px;line-height:1.5}summary{cursor:pointer}.details-content{display:grid;gap:8px;padding-top:10px}.detail-row{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px;align-items:start}.detail-label{font-weight:500}.detail-value{text-align:right;white-space:pre-line;overflow-wrap:anywhere;color:var(--primary-text-color)}.detail-row.long{grid-template-columns:1fr;gap:2px}.detail-row.long .detail-value{text-align:left}.warning .detail-value{color:var(--warning-color,#b7791f)}
.room-identity{margin-top:10px;color:var(--secondary-text-color);font-size:13px;line-height:1.5;overflow-wrap:anywhere}
.child{margin-top:14px;padding-top:14px;border-top:1px solid var(--divider-color,#ffffff18)}.child .room-heading{font-size:1em}.empty{padding:16px}.weather-host{min-width:0;--ha-card-box-shadow:none;--ha-card-border-width:0px;--ha-card-border-radius:0px}
@media(max-width:380px){.title{padding:12px 12px 8px}.header{padding:10px 12px;font-size:11px}.section{padding:12px}.grid{gap:5px}.cell{padding:8px 3px;font-size:12px}}
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
 _roomName(room,payload=this._payload(room)) {
  const text=v=>typeof v==='string'?v.trim():'';
  return text(room.name)||text(payload.name)||'Raum';
 }
 _roomDetailsLabel(room) {
  const p=climateRoomPresentation(this._config,room);
  return p.labelMode==='room_name'||(['auto','auto_hide_empty'].includes(p.labelMode)&&!p.heading)?this._roomName(room):'Details';
 }
 _details(room,outdoor,path){if(!detailsAllowed(this._config,room,outdoor))return null;const rows=[];const add=(label,text,long=false,warning=false)=>{const row=el('div',`detail-row${long?' long':''}${warning?' warning':''}`);row.append(el('span','detail-label',label),el('span','detail-value',text));rows.push(row);};if(outdoor){const host=el('div','weather-host');host.dataset.weatherHost='true';rows.push(host);}else{const p=this._payload(room),s=this._state(room.recommendation_entity),usable=!!s&&s.state!=='unavailable',options=climateRoomDetails(this._config,room),selected=options.fields;for(const def of DETAIL_DEFS){if(!selected.includes(def[0]))continue;const result=this._detailText(def,room,p,usable);if(result.skip||result.text===null&&options.hideMissing)continue;add(def[1],result.text??'–',['text','entities'].includes(def[3]),def[0]==='measurement_frame_reason'&&p.measurement_frame_quality==='stale');}}if(!rows.length)return null;const details=el('details','details'),body=el('div','details-content');details.dataset.path=path;details.append(el('summary','',outdoor?'Wetterdetails':this._roomDetailsLabel(room)));body.append(...rows);details.append(body);if(outdoor)details.addEventListener('toggle',()=>{if(details.open)this._mountWeather();});return details;}
 _room(room,outdoor=false,child=false,path='') {
  const payload=outdoor?{}:this._payload(room),section=el('section',child?'child':'section');
  const presentation=outdoor?{heading:room.show_room_heading??true}:climateRoomPresentation(this._config,room);
  const text=v=>typeof v==='string'?v.trim():'';
  const name=outdoor?text(room.name)||'Draußen':this._roomName(room,payload);
  if(presentation.heading){const heading=el('div','room-heading'),icon=el('ha-icon');icon.setAttribute('icon',text(room.icon)||text(payload.icon)||(outdoor?'mdi:weather-partly-cloudy':'mdi:home-thermometer'));heading.append(icon,el('span','',name));section.append(heading);}
  const grid=el('div',outdoor?'grid outdoor-grid':'grid indoor-grid');
  if(outdoor&&this._config.outdoor?.show_header!==false)for(const[key,label]of OUT_FIELDS)grid.append(el('div','out-label',climateColumnLabel(this._config,key,true,label)));
  for(const[key]of outdoor?OUT_FIELDS:FIELDS)grid.append(this._cell(room,key,outdoor));
  section.append(grid);
  const details=this._details(room,outdoor,path);
  if(details)section.append(details);
  else if(!outdoor&&!presentation.heading&&presentation.labelMode!=='auto_hide_empty')section.append(el('div','room-identity',name));
  (room.children||[]).forEach((row,index)=>section.append(this._room(row,false,true,`${path}/children/${index}`)));
  return section;
 }
 async _mountWeather(){const host=this.shadowRoot.querySelector('[data-weather-host]');if(!host||!host.closest('details')?.open||!this.isConnected)return;const outdoor=this._config.outdoor;if(!outdoor?.weather_entity||outdoor.show_weather===false)return;const config={type:'weather-forecast',entity:outdoor.weather_entity,show_current:true,show_forecast:outdoor.show_forecast!==false,forecast_type:['daily','hourly','twice_daily'].includes(outdoor.forecast_type)?outdoor.forecast_type:'daily'},signature=JSON.stringify(config);if(this._weatherCard&&signature===this._weatherSignature){this._weatherCard.hass=this._hass;if(this._weatherCard.parentNode!==host)host.replaceChildren(this._weatherCard);return;}const token=++this._weatherToken;host.replaceChildren(el('div','','Wetterkarte wird geladen …'));try{if(typeof window.loadCardHelpers!=='function')throw Error('Home-Assistant-Kartenhelfer nicht verfügbar. Bitte Seite vollständig neu laden.');const helpers=await window.loadCardHelpers();if(token!==this._weatherToken||!this.isConnected)return;if(typeof helpers.createCardElement!=='function')throw Error('Wetterkarte konnte nicht erstellt werden.');const card=helpers.createCardElement(config);card.hass=this._hass;this._weatherCard=card;this._weatherSignature=signature;const current=this.shadowRoot.querySelector('[data-weather-host]');if(current&&current.closest('details')?.open)current.replaceChildren(card);}catch(error){if(token===this._weatherToken){const current=this.shadowRoot.querySelector('[data-weather-host]');if(current)current.replaceChildren(el('div','warning',`Wetterkarte: ${error.message}`));}}}
 _render(){if(!this._config)return;this._weatherToken++;const opened=new Set([...this.shadowRoot.querySelectorAll('details[open]')].map(d=>d.dataset.path)),card=el('ha-card');card.style.setProperty('--neutral',neutralBackground(this._config.neutral_tint_strength));if(this._config.title){const title=el('h2','title',this._config.title),size=Number(this._config.title_font_size);if(Number.isFinite(size)&&size>=10&&size<=72)title.style.setProperty('--title-size',`${size}px`);if(validColor(this._config.title_color))title.style.setProperty('--title-color',this._config.title_color);card.append(title);}if(this._config.outdoor)card.append(this._room(this._config.outdoor,true,false,'outdoor'));if(this._config.show_header!==false&&(this._config.rooms||[]).length){const header=el('div','grid header indoor-grid');for(const [key,,label]of CLIMATE_INDOOR_COLUMNS)header.append(el('div','',climateColumnLabel(this._config,key,false,label)));card.append(header);}(this._config.rooms||[]).forEach((r,i)=>card.append(this._room(r,false,false,`rooms/${i}`)));if(!this._config.outdoor&&!this._config.rooms?.length)card.append(el('div','empty','Bitte im Editor einen Raum hinzufügen.'));this.shadowRoot.replaceChildren(el('style','',CARD_CSS+(this._appearanceCss?'\n'+this._appearanceCss:'')),card);for(const d of this.shadowRoot.querySelectorAll('details'))d.open=opened.has(d.dataset.path);this._mountWeather();}
}
const EDITOR_CSS=`.appearance-controls{min-width:0}.dependent-controls{min-width:0;border:0;padding:0;margin:0}.dependent-controls:disabled{opacity:.5}.field-row{display:flex;gap:8px;align-items:center}.field-row input{flex:1;min-width:0}.field-row button{flex:none}.color-row{grid-template-columns:44px minmax(0,1fr) auto}.field-error{font-size:12px;line-height:1.45;color:var(--error-color,#db4437);margin:6px 0}.field-error[hidden]{display:none}.value-status{margin:5px 0}.editor-validation-error{padding:10px;color:var(--error-color,#db4437)}.section-panel>summary{overflow-wrap:anywhere}legend{font-weight:500}.appearance-controls:disabled{opacity:.5}.appearance-shadow-example{display:block;white-space:normal;overflow-wrap:anywhere;font-size:12px;margin:8px 0}:host{display:block}*{box-sizing:border-box}label{display:block;margin:10px 0}input[type=text],input[type=number],select{width:100%;display:block;padding:9px;background:var(--secondary-background-color);color:var(--primary-text-color);border:1px solid var(--divider-color);border-radius:6px;font:inherit}fieldset{min-width:0;margin:14px 0;border:1px solid var(--divider-color);border-radius:8px}button{margin:5px;padding:8px;cursor:pointer}.check{display:flex;gap:8px;align-items:center}.check input{flex:none}.color-row{display:grid;grid-template-columns:44px minmax(0,1fr) auto;gap:8px;align-items:center}input[type=color]{width:44px;height:38px;padding:0;border:0;background:none}.rule{display:grid;grid-template-columns:minmax(70px,1fr) minmax(100px,2fr) auto;gap:6px;align-items:center}.help{font-size:12px;color:var(--secondary-text-color);line-height:1.5}.error{font-size:12px;color:var(--error-color,#db4437);line-height:1.5}summary{cursor:pointer;font-weight:600;padding:10px 0}.section-panel{border-bottom:1px solid var(--divider-color);padding-bottom:8px}.color-controls{margin:0;padding:0;border:0}.color-controls:disabled{opacity:.45}.color-controls:disabled button{cursor:default}.tint-row{display:grid;grid-template-columns:minmax(0,1fr) 85px 20px;gap:10px;align-items:center}.tint-row input[type=range]{width:100%;accent-color:var(--primary-color)}`;
class SHFDFreshAirIQRoomCardEditor extends HTMLElement{
 constructor(){super();this.attachShadow({mode:'open'});this._open=new Set();}
 set hass(h){this._hass=h;this._suggestions();this._refreshSummaries();}
 setConfig(c){if(this._config&&JSON.stringify(c)===JSON.stringify(this._config))return;this._config=clone(c);this._lastEmittedSignature=JSON.stringify(c);this._render();}
 _emit(){
  this._refreshSummaries();
  try{validateClimateRoomOptions(this._config);climateAppearanceCss(this._config.appearance);}catch(error){
   let note=this.shadowRoot.querySelector('.editor-validation-error');
   if(!note){note=el('p','editor-validation-error');note.setAttribute('role','alert');this.shadowRoot.append(note);}
   note.textContent='Nicht angewendet: '+error.message+'. Die Vorschau bleibt beim letzten gültigen Stand.';return false;
  }
  const note=this.shadowRoot.querySelector('.editor-validation-error');if(note)note.remove();
  const signature=JSON.stringify(this._config);if(signature===this._lastEmittedSignature)return true;
  this._lastEmittedSignature=signature;
  this.dispatchEvent(new CustomEvent('config-changed',{detail:{config:clone(this._config)},bubbles:true,composed:true}));return true;
 }
 _suggestions(){const ids=Object.keys(this._hass?.states||{}).sort(),sig=ids.join('|');if(sig===this._ids)return;this._ids=sig;for(const domain of['sensor','weather']){const list=this.shadowRoot.querySelector(`#climate-${domain}`);if(list)list.replaceChildren(...ids.filter(id=>id.startsWith(domain+'.')).map(id=>{const o=el('option');o.value=id;return o;}));}}
 _button(parent,text,fn){const b=el('button','',text);b.type='button';b.onclick=fn;parent.append(b);return b;}
 _check(parent,title,checked,fn){const label=el('label','check'),input=el('input');input.type='checkbox';input.checked=checked;input.onchange=()=>{fn(input.checked);this._emit();};label.append(input,document.createTextNode(title));parent.append(label);}
 _select(parent,title,value,options,fn){const label=el('label','',title),select=el('select');for(const[key,text]of options){const option=el('option','',text);option.value=key;select.append(option);}select.value=value;select.onchange=()=>{fn(select.value);this._emit();};label.append(select);parent.append(label);}
 _panel(parent,key,title,top=false){const panel=el('details',top?'section-panel':'');panel.dataset.key=key;panel.open=this._open.has(key);panel.append(el('summary','',title));parent.append(panel);return panel;}
 _category(kind){this._config.color_rules??={};return this._config.color_rules[kind]??={};}
 _ranges(parent,kind,outdoor=false){
  const key=outdoor?'outdoor_ranges':'ranges',current=()=>rangesFor(this._config,kind,outdoor),rows=current(),notice=el('div','error');notice.setAttribute('role','status');if(!Array.isArray(rows)){notice.textContent='Farbbereiche sind keine Liste. Bitte Standardwerte wiederherstellen.';parent.append(notice);return;}
  notice.textContent=rangeIssues(rows).join(' ');parent.append(notice,el('p','help','Genau ein Grundbereich; jede numerische Untergrenze nur einmal. Höchste passende Untergrenze gilt inklusive. Leere Farbe = neutral. Bestehende ungültige Regeln bitte korrigieren oder zurücksetzen.'));const save=next=>{this._category(kind)[key]=next;};
  const entries=rows.map((row,index)=>({row,index})).sort((a,b)=>{const x=rangeLimit(a.row),y=rangeLimit(b.row);return(x===null?Infinity:x)-(y===null?Infinity:y)||a.index-b.index;});
  for(const{row:r,index:i}of entries){if(!r||typeof r!=='object')continue;const line=el('div','rule'),label=el('label','',r.above===null?'Grundbereich':'Ab Wert'),input=el('input');input.type='number';input.step='any';input.placeholder='Alle';input.value=r.above??'';input.oninput=()=>this._fieldError(input);input.onchange=()=>{if(input.validity.badInput||!input.checkValidity()){this._fieldError(input,input.validationMessage||'Bitte eine gültige Untergrenze eingeben.');return;}const value=input.value===''?null:Number(input.value),next=clone(current());if(next.some((v,j)=>j!==i&&(value===null?v?.above===null:v?.above!==null&&numeric(v?.above)===value))){input.setCustomValidity(value===null?'Es darf nur einen Grundbereich geben.':'Diese Untergrenze ist bereits vorhanden.');this._fieldError(input,input.validationMessage||'Bitte eine gültige Untergrenze eingeben.');return;}if(r.above===null&&value!==null&&!next.some((v,j)=>j!==i&&v?.above===null)){input.setCustomValidity('Der einzige Grundbereich muss erhalten bleiben.');this._fieldError(input,input.validationMessage||'Bitte eine gültige Untergrenze eingeben.');return;}this._fieldError(input);next[i].above=value;save(next);this._emit();this._render();};label.append(input);line.append(label);this._colorInput(line,'Farbe',r.color??'',v=>{const next=clone(current());next[i].color=v;save(next);});const remove=this._button(line,'×',()=>{const next=clone(current());next.splice(i,1);save(next);this._emit();this._render();});remove.title='Farbbereich entfernen';remove.disabled=r.above===null&&rows.filter(v=>v?.above===null).length===1;parent.append(line);}
  if(!rows.some(r=>r?.above===null))this._button(parent,'Grundbereich hinzufügen',()=>{const next=clone(current());next.unshift({above:null,color:''});save(next);this._emit();this._render();});
  this._button(parent,'Bereich hinzufügen',()=>{const next=clone(current()),used=new Set(next.filter(r=>r?.above!==null).map(r=>numeric(r?.above)));let value=0;while(used.has(value))value++;next.push({above:value,color:'#A5D6A7'});save(next);this._emit();this._render();});
 }
 _colors(parent){const outer=this._panel(parent,'colors','Farben & Grenzwerte',true);outer.append(el('p','help','Innen- und Außenfarben unabhängig aktivieren. An = Standardfarben oder eigene Farben; Aus = transparente neutrale Tönung. Einstellungen bleiben erhalten. Wertebereiche sind Darstellungshilfen, keine Schimmel- oder Gesundheitsbewertung. Zahlenregeln gelten für °C, % beziehungsweise g/m³.'));
  for(const[kind,title]of[['recommendation','Empfehlung'],['absolute_humidity','Absolute Feuchte (g/m³)'],['temperature','Temperatur (°C)'],['mould','Schimmelrisiko'],['relative_humidity','Relative Außenfeuchte (%)'],['dew_point','Außentaupunkt (°C)']]){const panel=this._panel(outer,'color-'+kind,title),stateBased=['recommendation','mould'].includes(kind),hasIndoor=stateBased||['temperature','absolute_humidity'].includes(kind);if(hasIndoor){const controls=el('fieldset','color-controls'),enabled=this._config.color_rules?.[kind]?.enabled!==false;controls.disabled=!enabled;this._check(panel,'Farben für Innenräume aktivieren',enabled,v=>{this._category(kind).enabled=v;controls.disabled=!v;});if(stateBased){for(const[key,label]of Object.entries(kind==='recommendation'?ACTIONS:RISKS).filter(([key])=>key!=='unknown'))this._colorInput(controls,`${label} (${key})`,stateColor(this._config,kind,key),v=>{const c=this._category(kind);c.states??={};c.states[key]=v;});}else this._ranges(controls,kind,false);panel.append(controls);this._button(panel,'Innenfarben zurücksetzen',()=>{resetSide(this._config,kind,false);this._emit();this._render();});}if(!stateBased){const controls=el('fieldset','color-controls'),enabled=this._config.color_rules?.[kind]?.outdoor_enabled===true;controls.disabled=!enabled;this._check(panel,'Farben für Außenwerte aktivieren',enabled,v=>{this._category(kind).outdoor_enabled=v;controls.disabled=!v;});this._ranges(controls,kind,true);panel.append(controls);this._button(panel,'Außenfarben zurücksetzen',()=>{resetSide(this._config,kind,true);this._emit();this._render();});}}
 }

 _appearance(parent) {
  const panel=this._panel(parent,'appearance','Aussehen',true);
  panel.append(el('p','help','Gültige Änderungen aktualisieren die Vorschau direkt. Zahlen und Farben werden bei gültiger Eingabe angewendet; Texte beim Abschließen der Eingabe. Dauerhaft gespeichert wird erst mit „Speichern“ im Home-Assistant-Dialog.'));
  const get=path=>path.split('.').reduce((v,key)=>v?.[key],this._config.appearance);
  const setPath=(object,path,value)=>{
   const keys=path.split('.'),parents=[];let node=object;
   for(const key of keys.slice(0,-1)){if(!node[key]||typeof node[key]!=='object'||Array.isArray(node[key]))node[key]={};parents.push([node,key]);node=node[key];}
   if(value===undefined)delete node[keys.at(-1)];else node[keys.at(-1)]=value;
   for(const[parent,key]of parents.reverse())if(!Object.keys(parent[key]).length)delete parent[key];
  };
  const commit=(change,input)=>{
   const next=clone(this._config.appearance||{});change(next);
   for(const key of ['indoor_tile','outdoor_tile']){const tile=next[key];if(tile&&typeof tile==='object'&&!Array.isArray(tile)){delete tile.min_height;if(!Object.keys(tile).length)delete next[key];}}
   try{climateAppearanceCss(next);}catch(error){if(input)this._fieldError(input,error.message);return false;}
   if(Object.keys(next).length)this._config.appearance=next;else delete this._config.appearance;
   if(input)this._fieldError(input);return this._emit();
  };
  const write=(path,value,input)=>commit(next=>setPath(next,path,value),input);
  const number=(host,path,title,automatic,min=0,max=100)=>this._numberControl(host,title,get(path),{min,max,automatic,shared:true},(value,input)=>write(path,value,input));
  const color=(host,path,title,requiredMode)=>this._colorInput(host,title,get(path),(value,input)=>write(path,value||undefined,input),'Leer = Theme-Farbe',{
   resetLabel:'Automatisch',reset:input=>{
    if(commit(next=>{setPath(next,path,undefined);if(requiredMode)setPath(next,requiredMode.path,requiredMode.value);},input))this._render();
   }
  });
  const select=(host,path,title,fallback,choices,extra)=>this._select(host,title,get(path)??fallback,choices,value=>{
   if(commit(next=>{setPath(next,path,value);if(extra)extra(next,value);}))this._render();
  });
  const tiles=this._panel(panel,'appearance-tiles','Wertekacheln');
  tiles.append(el('p','help','Die benötigte Kachelhöhe ergibt sich aus Texthöhe + 2 × Innenabstand. Die Kachel mit dem größten Platzbedarf bestimmt die gemeinsame Zeilenhöhe. Verschiedene Räume dürfen unterschiedlich hoch sein. Es gibt keine feste Mindesthöhe.'));
  tiles.append(el('p','help','Automatisch verwendet die bisherigen Schrift- und Abstandswerte. Eigene Werte gelten auf allen Bildschirmgrößen. Die schmale Ansicht gilt bis 380 CSS-Pixel Browserfensterbreite. Sehr kleine Schriften und Kacheln erschweren das Lesen und Antippen.'));
  if(this._config.appearance?.indoor_tile?.min_height!==undefined||this._config.appearance?.outdoor_tile?.min_height!==undefined)tiles.append(el('p','help','min_height aus älteren Testversionen wird nicht angewendet und bei einer gültigen Änderung des Aussehens entfernt.'));
  for(const[key,title]of [['indoor_tile','Innenwerte'],['outdoor_tile','Außenwerte']]){
   const box=el('fieldset');box.append(el('legend','',title));tiles.append(box);
   for(const[field,limit]of Object.entries(CLIMATE_TILE_LIMITS)){
    const input=number(box,key+'.'+field,limit.label,limit.automatic,limit.min,limit.max);input.setAttribute('aria-label',title+': '+limit.label);
    if(field==='padding_vertical')box.append(el('p','help','Der Wert gilt jeweils oben und unten: 6 px entsprechen zusammen 12 px Innenabstand.'));
   }
   this._button(box,title+': Schrift und Innenabstand zurücksetzen',()=>{if(commit(next=>delete next[key]))this._render();});
  }
  const tint=this._panel(tiles,'neutral-tiles','Kacheln ohne Messwertfarbe');this._tintControl(tint);
  this._button(tiles,'Kachelschrift und Innenabstände zurücksetzen',()=>{if(commit(next=>{delete next.indoor_tile;delete next.outdoor_tile;}))this._render();});
  const spacing=this._panel(panel,'appearance-spacing','Abstände und Trennlinien');
  number(spacing,'padding','Abstand zum Kartenrand (px)','Automatisch: 16 px, bei schmaler Ansicht 12 px');
  number(spacing,'indoor_item_gap','Abstand zwischen Innenkacheln (px)',get('item_gap')!==undefined?'YAML-Vorgabe item_gap: '+get('item_gap')+' px':'Automatisch: 8 px, bei schmaler Ansicht 5 px');
  number(spacing,'outdoor_item_gap','Abstand zwischen Außenkacheln (px)',get('item_gap')!==undefined?'YAML-Vorgabe item_gap: '+get('item_gap')+' px':'Automatisch: 8 px, bei schmaler Ansicht 5 px');
  number(spacing,'section_spacing','Zusätzlicher Abstand zwischen Bereichen (px)','Automatisch: 0 px zusätzlich zum vorhandenen Innenabstand');
  this._button(spacing,'Abstände zurücksetzen',()=>{if(commit(next=>{for(const key of ['padding','section_spacing','item_gap','indoor_item_gap','outdoor_item_gap'])delete next[key];}))this._render();});
  const dividers=el('fieldset');dividers.append(el('legend','','Trennlinien'));spacing.append(dividers);
  this._check(dividers,'Trennlinien anzeigen',get('dividers.enabled')!==false,value=>{if(write('dividers.enabled',value))this._render();});
  const dc=el('fieldset','dependent-controls');dc.disabled=get('dividers.enabled')===false;dividers.append(dc);
  number(dc,'dividers.width','Linienstärke (px)','Automatisch: 1 px; 0 blendet die Linie aus',0,10);
  color(dc,'dividers.color','Linienfarbe');
  const surface=this._panel(panel,'appearance-surface','Kartenfläche, Rahmen und Schatten');
  const bg=el('fieldset');bg.append(el('legend','','Hintergrund'));surface.append(bg);
  select(bg,'background.mode','Kartenhintergrund','theme',[['theme','Theme verwenden'],['transparent','Transparent'],['custom','Eigene Farbe']],(next,value)=>{if(value==='custom'&&!next.background.color)next.background.color='#202124';});
  if(get('background.mode')==='custom'){
   color(bg,'background.color','Hintergrundfarbe',{path:'background.mode',value:'theme'});
   bg.append(el('p','help','Eigene Farbe benötigt einen gültigen Farbwert. „Automatisch“ verwendet wieder den Theme-Hintergrund. Messwertfarben bleiben unverändert.'));
  }
  const border=el('fieldset');border.append(el('legend','','Rahmen und Ecken'));surface.append(border);
  const customBorder=['enabled','width','color'].some(key=>get('border.'+key)!==undefined);
  const borderMode=customBorder?(get('border.enabled')===false?'off':'on'):'theme';
  this._select(border,'Rahmen',borderMode,[['theme','Theme-Rahmen verwenden'],['on','Eigenen Rahmen anzeigen'],['off','Rahmen ausblenden']],value=>{
   if(commit(next=>{if(value==='theme'){for(const key of ['enabled','width','color'])setPath(next,'border.'+key,undefined);}else setPath(next,'border.enabled',value==='on');}))this._render();
  });
  number(border,'border.radius','Eckenradius (px)','Automatisch: Theme-Radius, Ersatzwert 16 px');
  const bc=el('fieldset','dependent-controls');bc.disabled=borderMode!=='on';border.append(bc);
  number(bc,'border.width','Rahmenstärke (px)','Automatisch: 1 px; 0 blendet den Rahmen aus',0,10);
  color(bc,'border.color','Rahmenfarbe');
  const shadow=el('fieldset');shadow.append(el('legend','','Schatten'));surface.append(shadow);
  select(shadow,'shadow.mode','Schattenstil','default',[
   ['default','Bisheriger Schatten (Theme)'],['none','Kein Schatten'],...Object.entries(CLIMATE_SHADOW_PRESETS).map(([key,preset])=>[key,preset.label]),['custom','Eigener CSS-Schatten']
  ],(next,value)=>{if(value==='custom'&&!next.shadow.value)next.shadow.value=CLIMATE_SHADOW_PRESETS.soft.value;});
  const preset=CLIMATE_SHADOW_PRESETS[get('shadow.mode')];
  if(preset){shadow.append(el('code','appearance-shadow-example',preset.value));this._button(shadow,'Als eigenen Schatten bearbeiten',()=>{if(commit(next=>{setPath(next,'shadow.mode','custom');setPath(next,'shadow.value',preset.value);}))this._render();});}
  if(get('shadow.mode')==='custom'){
   const label=el('label','','CSS box-shadow (erweitert)'),row=el('div','field-row'),input=el('input');input.type='text';input.maxLength=512;input.value=get('shadow.value')??'';
   input.oninput=()=>write('shadow.value',input.value.trim()||undefined,input);input.onchange=input.oninput;
   const reset=this._button(row,'Automatisch',()=>{if(commit(next=>{setPath(next,'shadow.mode','default');setPath(next,'shadow.value',undefined);},input))this._render();});
   row.append(input,reset);label.append(row);shadow.append(label);this._fieldError(input);
   shadow.append(el('p','help','Nur den CSS-Schattenwert eingeben, keine Regel oder Semikolons. Unvollständige Werte werden nicht auf die Vorschau angewendet.'));
  }
  panel.append(el('p','help','„Gesamtes Aussehen zurücksetzen“ entfernt die eigenen Darstellungseinstellungen und die neutrale Kacheltönung. Räume, Sensoren, Beschriftungen und Messwertfarben bleiben erhalten.'));
  this._button(panel,'Gesamtes Aussehen zurücksetzen',()=>{delete this._config.appearance;delete this._config.neutral_tint_strength;this._emit();this._render();});
 }
 _fieldError(input,message='') {
  if(!input._climateError){
   const note=el('p','field-error');note.id='climate-error-'+(this._feedbackCounter=(this._feedbackCounter||0)+1);note.setAttribute('role','status');
   input._climateError=note;
   const host=input.closest?.('label')||input.parentNode;
   host?.append(note);input.setAttribute('aria-describedby',note.id);
  }
  input._climateError.textContent=message?message+' Die Vorschau behält den letzten gültigen Wert.':'';
  input._climateError.hidden=!message;input.setCustomValidity(message);input.setAttribute('aria-invalid',message?'true':'false');
  return !message;
 }
 _numberControl(parent,title,value,options,commit) {
  const label=el('label','',title),row=el('div','field-row'),input=el('input'),status=el('p','help value-status');
  input.type='number';input.min=String(options.min??0);input.max=String(options.max??100);input.step=String(options.step??'any');
  input.value=value??'';input.placeholder=options.automatic||'Leer = automatisch';input.setAttribute('aria-label',options.aria||title);
  const sync=accepted=>{status.textContent=accepted===undefined?(options.automatic||'Automatisch'):'Eigener Wert: '+accepted+(options.unit??' px')+(options.shared?' — auf allen Bildschirmgrößen':'');reset.disabled=accepted===undefined&&input.value===''&&!input.validity.badInput;};
  const apply=()=>{
   reset.disabled=false;
   if(input.validity.badInput)return this._fieldError(input,'Bitte eine vollständige Zahl eingeben.');
   const raw=input.value.trim(),next=raw===''?undefined:Number(raw);
   if(next!==undefined&&(!Number.isFinite(next)||next<Number(input.min)||next>Number(input.max)))return this._fieldError(input,'Bitte einen Wert zwischen '+input.min+' und '+input.max+' eingeben.');
   if(next!==undefined&&options.step===1&&!Number.isInteger(next))return this._fieldError(input,'Bitte eine ganze Zahl eingeben.');
   this._fieldError(input);
   try{if(commit(next,input)===false)return false;}catch(error){return this._fieldError(input,error.message);}
   sync(next);return true;
  };
  const reset=this._button(row,'Automatisch',()=>{
   this._fieldError(input);
   try{if(commit(undefined,input)===false)return;}catch(error){this._fieldError(input,error.message);return;}
   input.value='';sync(undefined);
  });reset.setAttribute('aria-label',title+': Automatisch verwenden');
  row.append(input);row.children[0]===reset&&row.append(reset);
  label.append(row,status);parent.append(label);this._fieldError(input);sync(value);
  input.oninput=apply;input.onchange=apply;
  return input;
 }
 _text(parent,title,value,fn,domain) {
  const label=el('label','',title),row=el('div','field-row'),input=el('input');input.type='text';input.value=value??'';input.autocomplete='off';
  if(domain)input.setAttribute('list','climate-'+(domain===true?'sensor':domain));
  const hint=el('p','help');hint.hidden=true;
  const validate=()=>{
   const text=input.value.trim();
   if(domain&&text&&!/^[a-z_][a-z0-9_]*\.[a-z0-9_]+$/.test(text))return this._fieldError(input,'Bitte eine vollständige Entitäts-ID wie sensor.wohnzimmer_temperatur eingeben.');
   this._fieldError(input);
   if(domain&&text&&this._hass?.states){const state=this._hass.states[text];hint.textContent=!state?'Diese Entität wurde aktuell nicht gefunden. Die Zuordnung kann trotzdem gespeichert werden.':['unknown','unavailable'].includes(state.state)?'Entität vorhanden, aktuell ohne verfügbaren Wert. Die Zuordnung bleibt erhalten.':'';hint.hidden=!hint.textContent;}
   else hint.hidden=true;
   return true;
  };
  input.oninput=()=>{reset.disabled=input.value==='';validate();};
  input.onchange=()=>{if(!validate())return;fn(input.value.trim());this._emit();reset.disabled=input.value==='';};
  const reset=this._button(row,domain||title==='Titel'?'Leeren':'Automatisch',()=>{input.value='';validate();fn('');this._emit();reset.disabled=true;});
  reset.disabled=input.value==='';reset.setAttribute('aria-label',title+': eigene Eingabe entfernen');
  row.append(input);row.append(reset);label.append(row,hint);parent.append(label);this._fieldError(input);
  return input;
 }
 _colorInput(parent,title,value,fn,placeholder='Leer = neutral',options={}) {
  const label=el('label','',title),row=el('div','color-row'),picker=el('input'),text=el('input');
  picker.type='color';picker.value=/^#[0-9a-f]{6}$/i.test(value)?value:'#808080';picker.setAttribute('aria-label',title+': Farbe auswählen');
  text.type='text';text.value=value??'';text.placeholder=placeholder;
  const status=el('p','help value-status');
  const sync=()=>{status.textContent=text.value?'Farbwert: '+text.value:placeholder;reset.disabled=!options.reset&&text.value==='';};
  const apply=()=>{
   const value=text.value.trim();
   if(value&&!validColor(value)){reset.disabled=false;return this._fieldError(text,'Bitte eine gültige CSS-Farbe eingeben, zum Beispiel #90CAF9 oder var(--primary-color).');}
   this._fieldError(text);
   try{if(fn(value,text)===false)return false;}catch(error){return this._fieldError(text,error.message);}
   if(/^#[0-9a-f]{6}$/i.test(value))picker.value=value;
   this._emit();sync();return true;
  };
  const reset=this._button(row,options.resetLabel||(/Theme|automatisch/i.test(placeholder)?'Automatisch':'Neutral'),()=>{
   this._fieldError(text);
   if(options.reset){options.reset(text);return;}
   text.value='';apply();
  });reset.setAttribute('aria-label',title+': '+(options.resetLabel||'eigenen Farbwert entfernen'));
  row.append(picker,text,reset);label.append(row,status);parent.append(label);this._fieldError(text);sync();
  picker.oninput=()=>{text.value=picker.value;apply();};picker.onchange=picker.oninput;
  text.oninput=apply;text.onchange=apply;
  return text;
 }
 _tintControl(parent) {
  const box=el('fieldset');box.append(el('legend','','Hintergrundtönung'));parent.append(box);
  const slider=el('input');slider.type='range';slider.min='0';slider.max='100';slider.step='1';slider.value=String(tintStrength(this._config.neutral_tint_strength));slider.setAttribute('aria-label','Hintergrundtönung: Regler');box.append(slider);
  const input=this._numberControl(box,'Hintergrundtönung (%)',this._config.neutral_tint_strength,{min:0,max:100,step:1,unit:' %',automatic:'Automatisch: 12 %'},value=>{
   if(value===undefined)delete this._config.neutral_tint_strength;else this._config.neutral_tint_strength=value;
   slider.value=String(value??12);this._emit();return true;
  });
  slider.oninput=()=>{input.value=slider.value;input.oninput();};slider.onchange=slider.oninput;
  box.append(el('p','help','Gilt nur für Kacheln ohne Messwertfarbe: 0 % transparent, 100 % deckende Theme-Akzentfarbe. Text bleibt deckend.'));
 }
 _refreshSummaries() {
  if(!this._config||!this.shadowRoot)return;
  const panels=[...this.shadowRoot.querySelectorAll('details[data-key]')];
  const set=(key,title,note)=>{const p=panels.find(p=>p.dataset.key===key),summary=p?.querySelector('summary');if(summary)summary.textContent=title+(note?' — '+note:'');};
  const title=typeof this._config.title==='string'?this._config.title.trim():'';
  set('general','Kartentitel',title||'ausgeblendet');
  const rooms=this._config.rooms||[];set('rooms','Innenräume',rooms.length+' '+(rooms.length===1?'Raum':'Räume'));
  const out=this._config.outdoor;set('outdoor','Außenbereich',out?(out.show_room_heading===false?'eingerichtet, Überschrift aus':'eingerichtet'):'nicht eingerichtet');
  set('appearance','Aussehen',(Object.keys(this._config.appearance||{}).length||this._config.neutral_tint_strength!==undefined)?'individuell eingestellt':'Standardwerte');
  const inActive=['recommendation','mould','temperature','absolute_humidity'].some(k=>this._config.color_rules?.[k]?.enabled!==false);
  const outActive=['temperature','absolute_humidity','relative_humidity','dew_point'].some(k=>this._config.color_rules?.[k]?.outdoor_enabled===true);
  set('colors','Messwertfarben',inActive&&outActive?'Innen- und Außenfarben aktiv':inActive?'Innenfarben aktiv':outActive?'Außenfarben aktiv':'ausgeschaltet');
  rooms.forEach((r,i)=>{
   const payload=this._hass?.states?.[r.recommendation_entity]?.attributes?.freshairiq_room_payload;
   const name=(typeof r.name==='string'&&r.name.trim())||(typeof payload?.name==='string'&&payload.name.trim())||'Raum '+(i+1);
   const own=['show_room_heading','details_label_mode','show_details','hide_missing_details','detail_fields'].filter(k=>r[k]!==undefined);
   const note=own.length===0?'Vorgaben übernommen':own.length===1&&own[0]==='detail_fields'?'Eigene Detailfelder':'Eigene Anzeigeeinstellungen ('+own.length+')';
   set('room-'+i,name,note);
  });
 }
 _general(parent) {
  const panel=this._panel(parent,'general','Kartentitel',true);
  this._text(panel,'Titel',this._config.title,value=>{this._config.title=value;this._render();});
  panel.append(el('p','help','Leer lassen, um die gesamte Titelzeile einschließlich ihres eigenen Innenabstands auszublenden.'));
  if(typeof this._config.title==='string'&&this._config.title.trim()) {
   const style=this._panel(panel,'title-style','Schrift und Farbe');
   this._numberControl(style,'Schriftgröße (px)',this._config.title_font_size,{min:10,max:72,step:1,automatic:'Automatisch: 20 px'},value=>{if(value===undefined)delete this._config.title_font_size;else this._config.title_font_size=value;this._emit();return true;});
   this._colorInput(style,'Titelfarbe',this._config.title_color,value=>{if(value)this._config.title_color=value;else delete this._config.title_color;},'Leer = Theme-Farbe');
  }
 }
 _columnLabels(parent,target,outdoor,key) {
  const panel=this._panel(parent,key,'Spaltenbeschriftungen bearbeiten');
  panel.append(el('p','help','Leere Texte verwenden die Standardbeschriftung. Die Texte ändern weder Sensorzuordnung noch Spaltenreihenfolge. Auch bei ausgeblendeten Spaltenbeschriftungen bearbeitbar.'));
  for(const[,column,label]of outdoor?CLIMATE_OUTDOOR_COLUMNS:CLIMATE_INDOOR_COLUMNS) {
   const input=this._text(panel,label,target.column_labels?.[column],value=>{
    if(value)(target.column_labels??={})[column]=value;
    else if(target.column_labels){delete target.column_labels[column];if(!Object.keys(target.column_labels).length)delete target.column_labels;}
   });input.placeholder=label;
  }
  this._button(panel,'Standardbeschriftungen verwenden',()=>{delete target.column_labels;this._emit();this._render();});
 }
 _detailFields(parent,target,key,selected) {
  const panel=this._panel(parent,key,'Angezeigte Detailfelder ('+DETAIL_DEFS.filter(d=>selected.includes(d[0])).length+')');
  panel.append(el('p','help','Nullwerte bleiben sichtbar. Sitzungswerte benötigen eine aktive Lüftung; CO₂ benötigt eine verfügbare Messung. Eine leere Auswahl erzeugt keinen aufklappbaren Detailbereich.'));
  for(const group of new Set(DETAIL_DEFS.map(d=>d[2]))) {
   const box=el('fieldset');box.append(el('legend','',group));
   for(const[id,label]of DETAIL_DEFS.filter(d=>d[2]===group))this._check(box,label,selected.includes(id),checked=>{
    const fields=new Set(target.detail_fields??selected);if(checked)fields.add(id);else fields.delete(id);
    target.detail_fields=DETAIL_DEFS.map(d=>d[0]).filter(id=>fields.has(id));
    const summary=panel.querySelector('summary');if(summary)summary.textContent='Angezeigte Detailfelder ('+target.detail_fields.length+')';
   });panel.append(box);
  }
  for(const[label,list]of [['Standardauswahl',DEFAULT_DETAILS],['Alle auswählen',DETAIL_DEFS.map(d=>d[0])],['Auswahl leeren',[]]])this._button(panel,label,()=>{target.detail_fields=[...list];this._emit();this._render();});
 }
 _detailSettings(parent) {
  const box=el('fieldset');box.append(el('legend','','Aufklappbare Raumdetails'));parent.append(box);
  this._check(box,'Details anzeigen',this._config.show_details!==false,value=>{this._config.show_details=value;this._render();});
  const controls=el('fieldset','dependent-controls');controls.disabled=this._config.show_details===false;
  this._select(controls,'Text zum Aufklappen',this._config.details_label_mode??'auto',CLIMATE_LABEL_MODES,value=>this._config.details_label_mode=value);
  controls.append(el('p','help','Automatisch: „Details“ bei sichtbarer Raumüberschrift, sonst Raumname. Die vierte Auswahl entfernt ohne anzeigbare Details zusätzlich die untere Namenszeile; eine eingeschaltete Raumüberschrift bleibt sichtbar.'));
  this._select(controls,'Fehlende Detailwerte',String(this._config.hide_missing_details!==false),[['true','Ausblenden'],['false','Als Platzhalter anzeigen']],value=>this._config.hide_missing_details=value==='true');
  this._detailFields(controls,this._config,'global-detail-fields',this._config.detail_fields??DEFAULT_DETAILS);
  box.append(controls);
  if(controls.disabled)box.append(el('p','help','Die folgenden Detailoptionen sind deaktiviert. Gespeicherte Einstellungen bleiben erhalten. Einzelne Räume können Details weiterhin ausdrücklich aktivieren.'));
 }
 _roomLocalSettings(parent,room,index) {
  const panel=this._panel(parent,'room-'+index+'-local','Von den Vorgaben abweichen');
  const gp=climateRoomPresentation(this._config),gd=climateRoomDetails(this._config);
  const save=(key,value)=>{if(value==='global')delete room[key];else room[key]=value==='true'?true:value==='false'?false:value;this._render();};
  const bool=(host,key,title,current,trueLabel,falseLabel)=>this._select(host,title,room[key]===undefined?'global':String(room[key]),[
   ['global','Vorgabe übernehmen — aktuell: '+(current?trueLabel:falseLabel)],['true',trueLabel],['false',falseLabel]
  ],value=>save(key,value));
  bool(panel,'show_room_heading','Raumüberschrift',gp.heading,'Anzeigen','Ausblenden');
  bool(panel,'show_details','Details',gd.show,'Anzeigen','Ausblenden');
  const controls=el('fieldset','dependent-controls');controls.disabled=!climateRoomDetails(this._config,room).show;
  const globalMode=CLIMATE_LABEL_MODES.find(([id])=>id===gp.labelMode)?.[1]||gp.labelMode;
  this._select(controls,'Text zum Aufklappen',room.details_label_mode??'global',[
   ['global','Vorgabe übernehmen — aktuell: '+globalMode],...CLIMATE_LABEL_MODES
  ],value=>save('details_label_mode',value));
  bool(controls,'hide_missing_details','Fehlende Detailwerte',gd.hideMissing,'Ausblenden','Als Platzhalter anzeigen');
  const own=Array.isArray(room.detail_fields);
  this._select(controls,'Detailfelder',own?'custom':'global',[
   ['global','Vorgabe übernehmen — aktuell: '+gd.fields.length+' Felder'],['custom','Eigene Auswahl']
  ],value=>{if(value==='custom')room.detail_fields=[...gd.fields];else delete room.detail_fields;this._render();});
  if(own){controls.append(el('p','help','Die eigene Auswahl ersetzt die Vorgabe vollständig. Spätere Änderungen der Vorgabe ergänzen diese Liste nicht automatisch.'));this._detailFields(controls,room,'room-'+index+'-fields',room.detail_fields);}
  else controls.append(el('p','help','Die Detailfelder folgen den Vorgaben für alle Innenräume.'));
  panel.append(controls);
  this._button(panel,'Eigene Anzeigeeinstellungen entfernen',()=>{
   for(const key of ['show_room_heading','show_details','details_label_mode','hide_missing_details','detail_fields'])delete room[key];
   this._emit();this._render();
  });
  panel.append(el('p','help','Das Zurücksetzen betrifft nur diese Anzeige-Ausnahmen. Raumname, Icon, Sensoren und die Vorgaben für alle Innenräume bleiben unverändert.'));
 }
 _rooms(parent) {
  const panel=this._panel(parent,'rooms','Innenräume',true);
  const defaults=this._panel(panel,'indoor-defaults','Vorgaben für alle Innenräume');
  defaults.append(el('p','help','Diese Vorgaben gelten für Innenräume ohne eigene Anzeigeeinstellungen. Zusätzliche Messstellen unter children übernehmen ebenfalls diese Vorgaben, nicht die individuellen Einstellungen ihres übergeordneten Raums.'));
  const labels=el('fieldset');labels.append(el('legend','','Überschriften und Beschriftungen'));defaults.append(labels);
  this._check(labels,'Raumüberschrift mit Icon anzeigen',this._config.show_room_heading!==false,value=>this._config.show_room_heading=value);
  this._check(labels,'Spaltenbeschriftungen anzeigen',this._config.show_header!==false,value=>this._config.show_header=value);
  this._columnLabels(labels,this._config,false,'indoor-column-labels');this._detailSettings(defaults);
  (this._config.rooms||[]).forEach((room,index)=>{
   const box=this._panel(panel,'room-'+index,'Raum '+(index+1));
   const update=(key,value)=>{if(value)room[key]=value;else delete room[key];};
   this._text(box,'FreshAirIQ-Aktionssensor',room.recommendation_entity,value=>update('recommendation_entity',value),true);
   box.append(el('p','help','Name, Icon und Messwerte werden aus freshairiq_room_payload übernommen, sofern keine eigene Zuordnung gesetzt ist.'));
   const identity=this._panel(box,'room-'+index+'-identity','Name und Icon anpassen');
   this._text(identity,'Raumname',room.name,value=>update('name',value)).placeholder='Leer = automatisch aus Payload';
   this._text(identity,'Icon (mdi:...)',room.icon,value=>update('icon',value)).placeholder='Leer = automatisch';
   const sensors=this._panel(box,'room-'+index+'-sensors','Messwertsensoren ersetzen');
   for(const[key,label]of FIELDS.filter(([key])=>key!=='recommendation_entity'))this._text(sensors,label,room[key],value=>update(key,value),true).placeholder='Leer = Wert aus Payload';
   this._text(sensors,'Relative Feuchte für Details',room.humidity_entity,value=>update('humidity_entity',value),true).placeholder='Leer = Wert aus Payload';
   this._roomLocalSettings(box,room,index);
   if(room.children?.length)box.append(el('p','help','Zusätzliche Messstellen bleiben erhalten und sind weiterhin über YAML bearbeitbar.'));
   const up=this._button(box,'Nach oben',()=>{if(index<1)return;const rooms=this._config.rooms;[rooms[index-1],rooms[index]]=[rooms[index],rooms[index-1]];this._emit();this._render();});up.disabled=index===0;
   const down=this._button(box,'Nach unten',()=>{const rooms=this._config.rooms;if(index>=rooms.length-1)return;[rooms[index+1],rooms[index]]=[rooms[index],rooms[index+1]];this._emit();this._render();});down.disabled=index===(this._config.rooms.length-1);
   this._button(box,'Raum entfernen',()=>{this._config.rooms.splice(index,1);this._emit();this._render();});
  });
  this._button(panel,'+ Raum hinzufügen',()=>{(this._config.rooms??=[]).push({});this._open.add('rooms');this._open.add('room-'+(this._config.rooms.length-1));this._emit();this._render();});
 }
 _outdoor(parent) {
  const panel=this._panel(parent,'outdoor','Außenbereich',true),room=this._config.outdoor;
  if(!room){this._button(panel,'Außenbereich hinzufügen',()=>{this._config.outdoor={name:'Draußen',icon:'mdi:weather-partly-cloudy'};this._open.add('outdoor');this._emit();this._render();});return;}
  const update=(key,value)=>{if(value)room[key]=value;else delete room[key];};
  const headings=this._panel(panel,'outdoor-headings','Überschrift und Beschriftungen');
  this._check(headings,'Außenüberschrift mit Icon anzeigen',room.show_room_heading!==false,value=>room.show_room_heading=value);
  this._check(headings,'Spaltenbeschriftungen anzeigen',room.show_header!==false,value=>room.show_header=value);
  headings.append(el('p','help','Die Überschrift und die Spaltenbeschriftungen sind unabhängig. Messwerte und Wetterdetails bleiben erhalten. Die Vorgaben für Innenräume gelten hier nicht.'));
  const identity=this._panel(headings,'outdoor-identity','Name und Icon bearbeiten');
  this._text(identity,'Name',room.name,value=>update('name',value)).placeholder='Draußen';
  this._text(identity,'Icon (mdi:...)',room.icon,value=>update('icon',value)).placeholder='mdi:weather-partly-cloudy';
  const values=this._panel(panel,'outdoor-values','Messwerte und Spaltenbeschriftungen');
  values.append(el('p','help','Sensor und Beschriftung gehören jeweils zu einer Spalte. Fehlende oder nicht verfügbare Messwerte erscheinen als –. Der Taupunkt wird nicht berechnet.'));
  for(const[entity,key,label]of CLIMATE_OUTDOOR_COLUMNS){
   const group=this._panel(values,'outdoor-column-'+key,label);
   this._text(group,'Sensor',room[entity],value=>update(entity,value),true);
   this._text(group,'Spaltenbeschriftung',room.column_labels?.[key],value=>{if(value)(room.column_labels??={})[key]=value;else if(room.column_labels){delete room.column_labels[key];if(!Object.keys(room.column_labels).length)delete room.column_labels;}}).placeholder=label;
  }
  this._button(values,'Standardbeschriftungen verwenden',()=>{delete room.column_labels;this._emit();this._render();});
  const weather=this._panel(panel,'outdoor-weather','Wetter');
  this._text(weather,'Wetterentität',room.weather_entity,value=>{update('weather_entity',value);this._render();},'weather');
  this._check(weather,'Aufklappbare Wetterkarte anzeigen',room.show_weather!==false,value=>{room.show_weather=value;this._render();});
  const options=el('fieldset','dependent-controls');options.disabled=!room.weather_entity||room.show_weather===false;
  this._check(options,'Vorhersage anzeigen',room.show_forecast!==false,value=>{room.show_forecast=value;this._render();});
  const forecast=el('fieldset','dependent-controls');forecast.disabled=room.show_forecast===false;
  this._select(forecast,'Vorhersagetyp',room.forecast_type||'daily',[['daily','Täglich'],['hourly','Stündlich'],['twice_daily','Zweimal täglich']],value=>room.forecast_type=value);
  options.append(forecast);weather.append(options,el('p','help','Benötigt eine Wetterentität. Vorhersagetypen müssen von der Wetterintegration unterstützt werden. Deaktivieren behält die gespeicherten Optionen bei.'));
  this._button(panel,'Außenbereich entfernen',()=>{delete this._config.outdoor;this._emit();this._render();});
 }
 _colors(parent) {
  const outer=this._panel(parent,'colors','Messwertfarben',true);
  outer.append(el('p','help','Farben kennzeichnen Werte und Zustände. Sie ändern keine FreshAirIQ-Berechnungen. Ohne Messwertfarbe gilt die Hintergrundtönung unter Aussehen → Wertekacheln. Ausschalten behält die Regeln bei.'));
  for(const[kind,title]of [['recommendation','Empfehlung'],['mould','Schimmelrisiko'],['temperature','Temperatur (°C)'],['absolute_humidity','Absolute Feuchte (g/m³)'],['relative_humidity','Relative Feuchte außen (%)'],['dew_point','Taupunkt außen (°C)']]){
   const panel=this._panel(outer,'color-'+kind,title),stateBased=['recommendation','mould'].includes(kind),indoor=stateBased||['temperature','absolute_humidity'].includes(kind);
   const side=outdoor=>{
    const host=stateBased?panel:this._panel(panel,'color-'+kind+(outdoor?'-outdoor':'-indoor'),outdoor?'Außenwerte':'Innenwerte');
    const enabled=outdoor?this._config.color_rules?.[kind]?.outdoor_enabled===true:this._config.color_rules?.[kind]?.enabled!==false;
    const controls=el('fieldset','color-controls');controls.disabled=!enabled;
    this._check(host,'Farben aktivieren',enabled,value=>{this._category(kind)[outdoor?'outdoor_enabled':'enabled']=value;controls.disabled=!value;});
    if(stateBased){for(const[key,label]of Object.entries(kind==='recommendation'?ACTIONS:RISKS).filter(([key])=>key!=='unknown'))this._colorInput(controls,label,stateColor(this._config,kind,key),value=>{(this._category(kind).states??={})[key]=value;},'Leer = neutrale Kachel',{resetLabel:'Standard',reset:()=>{const category=this._category(kind);if(category.states){delete category.states[key];if(!Object.keys(category.states).length)delete category.states;}this._emit();this._render();}});}
    else this._ranges(controls,kind,outdoor);
    host.append(controls);
    this._button(host,stateBased?(kind==='recommendation'?'Empfehlungsfarben zurücksetzen':'Schimmelfarben zurücksetzen'):(outdoor?'Außenfarben zurücksetzen':'Innenfarben zurücksetzen'),()=>{resetSide(this._config,kind,outdoor);this._emit();this._render();});
   };
   if(indoor)side(false);if(!stateBased)side(true);
  }
 }
 _render(){if(!this._config)return;for(const d of this.shadowRoot.querySelectorAll('details[data-key]')){if(d.open)this._open.add(d.dataset.key);else this._open.delete(d.dataset.key);}const form=el('div');this._general(form);this._rooms(form);this._outdoor(form);this._appearance(form);this._colors(form);const lists=['sensor','weather'].map(domain=>{const list=el('datalist');list.id=`climate-${domain}`;return list;});this.shadowRoot.replaceChildren(el('style','',EDITOR_CSS),form,...lists);this._ids=null;this._suggestions();this._refreshSummaries();}
}
if(!customElements.get('shfd-freshairiq-room-card-editor'))customElements.define('shfd-freshairiq-room-card-editor',SHFDFreshAirIQRoomCardEditor);
if(!customElements.get('shfd-freshairiq-room-card'))customElements.define('shfd-freshairiq-room-card',SHFDFreshAirIQRoomCard);
window.customCards=window.customCards||[];if(!window.customCards.some(c=>c.type==='shfd-freshairiq-room-card'))window.customCards.push({type:'shfd-freshairiq-room-card',name:'SHFD FreshAirIQ Raumkarte',preview:false,description:'FreshAirIQ Raumübersicht mit variabler neutraler Tönung, Raumdetails, Wetterkarte und unabhängigen Innen- und Außenfarben.'});
