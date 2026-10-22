'use strict';
const $ = (s) => document.querySelector(s);
const number = n => new Intl.NumberFormat('en-US').format(n).replaceAll(',', '.');
const decimal = n => n.toFixed(1).replace('.', ',');
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalize = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const money = value => value == null ? 'No informado' : `S/ ${number(value)}`;
const colors = v => v < 25 ? '#dce9e2' : v < 50 ? '#a8c7b2' : v < 100 ? '#5b9881' : v < 150 ? '#e7a071' : '#c45b3f';
async function get(name) { const r = await fetch(`data/${name}`); if (!r.ok) throw Error(`${name}: HTTP ${r.status}`); return r.json(); }
async function main(){
  const [regions,geo,series,cases,sources,matrix,telcos] = await Promise.all(['regiones.json','departamentos.geojson','serie_anual.json','casos.json','fuentes.json','responsabilidades.json','telecom.json'].map(get));
  const bySource = Object.fromEntries(sources.map(s=>[s.id,s]));
  $('#region-select').innerHTML = regions.map(r=>`<option value="${r.code}">${esc(r.region)}</option>`).join('');
  $('#regions-table').innerHTML = regions.map(r=>`<tr><th scope="row">${esc(r.region)}</th><td>${decimal(r.rate_per_100k)}</td></tr>`).join('');
  function chooseRegion(code){
    const r = regions.find(r=>r.code===code); if(!r) return;
    $('#region-select').value=code;
    const ratio=r.rate_per_100k/77.8;
    $('#region-detail').innerHTML=`<p class="eyebrow">TASA PUBLICADA · 2025</p><h3>${esc(r.region)}</h3><strong class="rate-number">${decimal(r.rate_per_100k)}</strong><span class="rate-unit">denuncias por cada 100.000 habitantes</span><p class="national-comparison">Tasa nacional: <b>77,8</b><br>${decimal(ratio)} veces la tasa nacional.</p><p class="micro">${esc(r.geography_note)}. ${esc(r.denominator)}.</p>`;
    document.querySelectorAll('.region').forEach(p=>{ const selected=p.dataset.code===(code.startsWith('15')?'15':code); p.classList.toggle('selected',selected); p.setAttribute('aria-pressed',String(selected)); });
  }
  // Proyección equirectangular local: geometría oficial simplificada, sin tiles ni rastreo.
  function xy(p){return [(p[0]+82)*27+15,(-p[1])*27+15];}
  function ringPath(ring){return ring.map((p,i)=>`${i?'L':'M'}${xy(p).map(x=>x.toFixed(2)).join(',')}`).join(' ')+' Z';}
  function pathGeometry(g){if(g.type==='Polygon')return g.coordinates.map(ringPath).join(' '); if(g.type==='MultiPolygon')return g.coordinates.flatMap(p=>p.map(ringPath)).join(' '); throw Error('Geometría no admitida');}
  const paths=geo.features.map(f=>{const c=f.properties.coddep,r=regions.find(r=>r.code===c); const name=c==='15'?'Lima: consultar las dos tasas':r?.region; return `<path class="region" data-code="${c}" d="${pathGeometry(f.geometry)}" fill="${r?colors(r.rate_per_100k):'url(#hatch)'}" fill-rule="evenodd" role="button" tabindex="0" aria-pressed="false" aria-label="${esc(name)}${r?', '+decimal(r.rate_per_100k)+' por cien mil habitantes':''}"><title>${esc(name)}${r?': '+decimal(r.rate_per_100k):''}</title></path>`;}).join('');
  $('#map').innerHTML=`<svg viewBox="0 0 410 535" aria-label="Tasas de denuncias de extorsión por región, año 2025"><defs><pattern id="hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="5" fill="#e5e9df"/><line x1="0" y1="0" x2="0" y2="5" stroke="#8d9c90" stroke-width="1.4"/></pattern></defs><text x="15" y="365" transform="rotate(-55 15 365)" style="font-size:10px;letter-spacing:2px">OCÉANO PACÍFICO</text>${paths}<circle cx="42" cy="417" r="5" fill="${colors(74.9)}" stroke="#173d39"/><text x="54" y="421">Callao: 74,9</text><text x="42" y="439" style="font-size:9px">Referencia ampliada; ver selector</text></svg>`;
  document.querySelectorAll('.region').forEach(p=>{const act=()=>chooseRegion(p.dataset.code==='15'?'15M':p.dataset.code);p.addEventListener('click',act);p.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();act();}});});
  $('#region-select').addEventListener('change',e=>chooseRegion(e.target.value));chooseRegion('24');
  $('#trend').innerHTML=series.map(s=>`<div class="year-bar" aria-label="${s.year}: ${number(s.complaints)} denuncias${s.methodology_break?', cambio metodológico':''}"><div class="bar-column" style="height:${s.complaints/26728*100}%"><span class="bar-number">${number(s.complaints)}</span></div><span class="year-label">${s.year}${s.methodology_break?' *':''}</span></div>`).join('');
  $('#series-table').innerHTML=series.map(s=>`<tr><th scope="row">${s.year}</th><td>${number(s.complaints)}</td><td>${decimal(s.rate_per_100k)}</td></tr>`).join('');
  const payments=[...new Set(cases.flatMap(c=>c.payment_methods))].sort();
  $('#payment-filter').insertAdjacentHTML('beforeend',payments.map(p=>`<option>${esc(p)}</option>`).join(''));
  function renderCases(){
    const query=normalize($('#case-search').value.trim()), payment=$('#payment-filter').value,stage=$('#stage-filter').value;
    const filtered=cases.filter(c=>(!payment||c.payment_methods.includes(payment))&&(!stage||c.procedural_stage.startsWith(stage))&&(!query||normalize(JSON.stringify(c)).includes(query)));
    $('#case-count').textContent=`${filtered.length} de ${cases.length} casos · muestra no representativa`;
    $('#case-list').innerHTML=filtered.length?filtered.map(c=>`<article class="case-card" id="${c.id}"><div class="case-top"><span class="case-id">${c.id} · ${esc(c.region)}</span><span class="case-status">${esc(c.procedural_stage)}</span></div><h3>${esc(c.title)}</h3><p>${esc(c.summary)}</p><div class="case-meta">${c.payment_methods.map(x=>`<span class="tag">${esc(x)}</span>`).join('')}<span class="tag">Fuente: ${esc(c.published_at)}</span></div><div class="amount-row"><div><small>Exigencia inicial</small><strong>${money(c.demanded_pen)}</strong></div><div><small>Pago ordinario documentado</small><strong>${money(c.paid_pen)}</strong></div><div><small>Comunicación</small><span>${esc(c.communication_channels.join(' · '))}</span></div></div><details><summary>Ver evidencia, contexto y límites</summary><p><b>Montos:</b> ${esc(c.amount_note)}</p><p><b>Control de la cuenta:</b> ${esc(c.account_control)}</p><p><b>Hecho:</b> ${esc(c.event_date||'Desconocido')}. ${esc(c.event_date_precision)}.<br><b>Ubicación:</b> ${esc(c.location)}. ${esc(c.geographic_precision)}.</p><p><b>Entidades mencionadas:</b> ${esc(c.entities_mentioned.join(', '))}. Banco subyacente no inferido por marca.</p><p><b>Límites:</b> ${esc(c.limitations)} Montos recuperados, congelados e incautados: desconocidos. Operadora y tipo de SIM: desconocidos.</p><p><b>Localizador:</b> ${esc(c.evidence_locator)}. Consulta: ${c.accessed_at}.</p><a href="${esc(c.source_url)}" target="_blank" rel="noopener noreferrer">Leer fuente institucional ${c.source_ids[0]} ↗</a></details></article>`).join(''):'<p class="empty">No hay casos que coincidan. Prueba otro canal o limpia los filtros.</p>';
  }
  ['#case-search','#payment-filter','#stage-filter'].forEach(id=>$(id).addEventListener(id==='#case-search'?'input':'change',renderCases));
  $('#reset-filters').addEventListener('click',()=>{['#case-search','#payment-filter','#stage-filter'].forEach(id=>$(id).value='');renderCases();});renderCases();
  $('#telco-chart').innerHTML=telcos.map(t=>`<div class="telco-row"><div><span>${esc(t.operator)}</span><strong>${number(t.inconsistent_lines)}</strong></div><div class="telco-track"><div class="telco-fill" style="width:${t.inconsistent_lines/172034*100}%"></div></div></div>`).join('')+'<p class="micro">Unidad: líneas con inconsistencias, no denuncias por extorsión.<br>Fuente: OSIPTEL · <a href="data/telecom.csv" download>Descargar CSV ↓</a></p>';
  $('#matrix').innerHTML=matrix.map(r=>`<article class="obligation"><p class="eyebrow">${esc(r.category)}</p><h3>${esc(r.actor)}</h3><p>${esc(r.action)}</p><p class="metric"><b>Qué se debe medir:</b> ${esc(r.metric)}</p><p class="limit">${esc(r.evidence_limit)}</p><a href="#${r.source_id}">${r.source_id} · ${esc(r.locator)} ↗</a></article>`).join('');
  $('#sources').innerHTML=sources.map(s=>`<details class="source" id="${s.id}"><summary><span class="source-id">${s.id}</span><span>${esc(s.title)}</span><span class="source-state">${esc(s.verification)}</span></summary><div class="source-body"><p><b>${esc(s.publisher)}</b> · Publicación: ${esc(s.published_at||'Fecha no informada')} · Consulta: ${s.accessed_at}</p><p><b>Verificación:</b> ${esc(s.verification)}.</p><p><b>Localizador:</b> ${esc(s.locator)}.</p><p>${esc(s.scope)}</p>${s.limitations?`<p><b>Límites:</b> ${esc(s.limitations)}</p>`:''}<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">Abrir documento original ↗</a></div></details>`).join('');
  function revealSource(){const id=location.hash.slice(1);if(/^S\d{2}$/.test(id)){const d=document.getElementById(id);if(d)d.open=true;}}
  window.addEventListener('hashchange',revealSource);revealSource();
  $('#copy-yape').addEventListener('click',async()=>{try{await navigator.clipboard.writeText('940584307');$('#copy-status').textContent='Número copiado: 940 584 307.';}catch{$('#copy-status').textContent='Puedes copiar manualmente: 940 584 307.';}});
}
main().catch(e=>{console.error(e);const el=$('#load-error');el.hidden=false;el.innerHTML='No se pudieron cargar los datos. Recarga la página o consulta los <a href="https://github.com/unimauro/observatorio-extorsion-peru/tree/main/data">archivos públicos en GitHub</a>.';});
