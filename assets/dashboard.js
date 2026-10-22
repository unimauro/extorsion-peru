'use strict';
(function dashboard(){
const $ = s => document.querySelector(s);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num = n => new Intl.NumberFormat('en-US').format(n).replaceAll(',', '.');
const dec = n => n.toFixed(1).replace('.', ',');
const money = v => v == null ? 'No informado' : `S/ ${num(v)}`;
const fmtDate = s => s ? s.split('-').reverse().join('/') : '—';
const css = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const link = (url, text) => url ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(text)} ↗</a>` : esc(text);
async function get(name){ const r = await fetch(`data/${name}`); if(!r.ok) throw Error(`${name}: HTTP ${r.status}`); return r.json(); }

// Tema: respeta el sistema; el botón fija claro u oscuro y se recuerda si el navegador lo permite.
function setupTheme(redraw){
  let saved = null; try { saved = localStorage.getItem('ep-theme'); } catch(e) {}
  if(saved) document.documentElement.dataset.theme = saved;
  $('#theme-btn').addEventListener('click', () => {
    const t = document.documentElement.dataset.theme;
    const dark = t ? t === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.dataset.theme = dark ? 'light' : 'dark';
    try { localStorage.setItem('ep-theme', document.documentElement.dataset.theme); } catch(e) {}
    redraw();
  });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', redraw);
}

// Tooltip compartido: el área sensible es la fila o columna completa, más grande que la marca.
function tooltip(box){
  const tip = document.createElement('div'); tip.className = 'tip'; tip.setAttribute('role','status'); box.appendChild(tip);
  box.querySelectorAll('[data-tip]').forEach(el => {
    const show = ev => {
      const r = box.getBoundingClientRect(), t = el.getBoundingClientRect();
      tip.textContent = el.dataset.tip; tip.classList.add('on');
      const x = ev && ev.clientX ? ev.clientX - r.left : t.left - r.left + t.width/2;
      tip.style.left = Math.min(Math.max(x, 110), r.width - 110) + 'px';
      tip.style.top = (t.top - r.top + 4) + 'px';
    };
    el.addEventListener('mousemove', show); el.addEventListener('focus', () => show());
    el.addEventListener('mouseleave', () => tip.classList.remove('on')); el.addEventListener('blur', () => tip.classList.remove('on'));
  });
}
const tableFor = (head, rows) => `<details class="table-toggle"><summary>Ver como tabla</summary><table><thead><tr>${head.map((h,i)=>`<th${i?' class="n"':''}>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map((c,i)=>`<td${i?' class="n"':''}>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></details>`;

// Marcas con extremo redondeado de 4px y base recta.
const columnPath = (x, y, w, h) => { const r = Math.min(4, h, w/2); return `M${x},${y+h}V${y+r}Q${x},${y} ${x+r},${y}H${x+w-r}Q${x+w},${y} ${x+w},${y+r}V${y+h}Z`; };
const barPath = (x, y, w, h) => { const r = Math.min(4, w, h/2); return `M${x},${y}H${x+w-r}Q${x+w},${y} ${x+w},${y+r}V${y+h-r}Q${x+w},${y+h} ${x+w-r},${y+h}H${x}Z`; };
const niceMax = v => { const p = Math.pow(10, Math.floor(Math.log10(v))); return Math.ceil(v / p * 2) / 2 * p; };
const compact = v => v >= 1000 ? (v/1000).toFixed(v % 1000 ? 1 : 0).replace('.', ',') + ' mil' : String(v);

function columns(box, rows, {highlight, note} = {}){
  const W = Math.max(300, box.clientWidth || 440), H = 250, L = 46, B = 28, T = 22, max = niceMax(Math.max(...rows.map(r=>r.v)));
  const band = (W - L) / rows.length, bw = Math.min(38, band * .55), y = v => T + (H - T - B) * (1 - v / max);
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(box.dataset.label)}">`;
  s += [0, max/2, max].map(t => `<line class="gridline" x1="${L}" x2="${W}" y1="${y(t)}" y2="${y(t)}"/><text x="${L-8}" y="${y(t)+4}" text-anchor="end">${compact(t)}</text>`).join('');
  rows.forEach((r, i) => {
    const x = L + band*i + (band - bw)/2, fill = highlight && highlight(r) ? css('--tape') : css('--steel');
    s += `<g tabindex="0" data-tip="${esc(r.tip)}"><rect x="${L+band*i}" y="${T}" width="${band}" height="${H-T-B}" fill="transparent"/><path d="${columnPath(x, y(r.v), bw, H - B - y(r.v))}" fill="${fill}"/></g><text x="${x+bw/2}" y="${H-9}" text-anchor="middle">${esc(r.k)}</text>`;
    if(r.label) s += `<text class="val" x="${x+bw/2}" y="${y(r.v)-7}" text-anchor="middle">${esc(r.label)}</text>`;
  });
  box.innerHTML = s + `<line class="axis" x1="${L}" x2="${W}" y1="${H-B}" y2="${H-B}"/></svg>` + (note ? `<p class="note">${esc(note)}</p>` : ''); tooltip(box);
}

function bars(box, rows, {ref, refLabel, fmt = num, color, labelW = 170} = {}){
  const W = Math.max(300, box.clientWidth || 560), rowH = 28, L = Math.min(labelW, W * .42), R = 74, T = 4, H = T + rows.length*rowH + (ref ? 22 : 4);
  const max = niceMax(Math.max(...rows.map(r=>r.v), ref || 0)), x = v => L + (W - L - R) * v / max;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(box.dataset.label)}">`;
  if(ref) s += `<line x1="${x(ref)}" x2="${x(ref)}" y1="${T-2}" y2="${T+rows.length*rowH}" stroke="${css('--ink-2')}" stroke-width="1.5"/><text x="${x(ref)}" y="${H-4}" text-anchor="middle">${esc(refLabel)}</text>`;
  rows.forEach((r, i) => {
    const y = T + i*rowH, bh = 16;
    s += `<g tabindex="0" data-tip="${esc(r.tip || `${r.k}: ${fmt(r.v)}`)}"><rect x="0" y="${y}" width="${W}" height="${rowH}" fill="transparent"/><text class="lbl" x="${L-10}" y="${y+rowH/2+4}" text-anchor="end">${esc(r.k)}</text><path d="${barPath(L, y+(rowH-bh)/2, Math.max(3, x(r.v)-L), bh)}" fill="${r.color || color || css('--steel')}"/><text class="val" x="${Math.max(x(r.v), L+3)+7}" y="${y+rowH/2+4}">${esc(fmt(r.v))}</text></g>`;
  });
  box.innerHTML = s + '</svg>'; tooltip(box);
}

async function main(){
  const [d, series, regions, geo, hyp] = await Promise.all(['dashboard.json','serie_anual.json','regiones.json','departamentos.geojson','hipotesis.json'].map(get));
  const cases = d.cases, lawById = Object.fromEntries(d.laws.map(l => [l.id, l])), src = Object.fromEntries(d.sources.map(s => [s.id, s]));
  const shortName = n => { const t = n.replace(/\s*\([^()]*\)\s*$/, ''); return t.length > 48 ? n.split(' (')[0] : t; };
  const lawLink = id => lawById[id] ? link(lawById[id].url, shortName(lawById[id].name)) : esc(id);
  $('#reviewed').textContent = fmtDate(d.reviewed_at);

  function hero(){
    const sameDay = cases.filter(c => c.speed_kind === 'captura' && c.speed_days === 0).length;
    $('#hero-figures').innerHTML = [
      {v:String(d.target_h), u:'h', l:'plazo legal máximo que proponemos', key:true},
      {v:num(sameDay), l:`de ${cases.length} casos documentados ya tuvieron captura el mismo día`},
      {v:'24', u:'h', l:'lo que hoy puede tardar cada paso por ley'}
    ].map(f => `<div class="figure${f.key?' accent':''}"><div class="v">${f.v}${f.u?`<small>${f.u}</small>`:''}</div><div class="l">${esc(f.l)}</div></div>`).join('');
    const steps = d.route.filter(r => r.reform && r.legal_max_h);
    const scale = 24, px = h => Math.min(h, scale) / scale * 100;
    const dur = h => h < 1 ? `${Math.round(h * 60)} min` : Number.isInteger(h) ? `${h} h` : `${Math.floor(h)} h ${Math.round(h % 1 * 60)}`;
    $('#hero-compare').innerHTML = `<h2>Hoy frente a la propuesta</h2><p class="hc-sub">Plazo máximo de cada paso desde que se recibe el pedido, en una escala de 24 h. Todo cabe en 4 h desde la denuncia.</p>${steps.map(r => `<div class="hc-row"><span class="hc-name">${esc(r.title)}</span><span class="hc-track" role="img" aria-label="${esc(r.title)}: hoy ${esc(r.current)}, propuesta ${dur(r.end_h - r.start_h)}"><span class="hc-today" style="width:${px(r.legal_max_h)}%"></span><span class="hc-prop" style="width:${px(r.end_h - r.start_h)}%"></span></span><span class="hc-vals"><b>${dur(r.end_h - r.start_h)}</b><s>${esc(r.current)}</s></span></div>`).join('')}<div class="hc-axis" aria-hidden="true"><span style="left:0">0</span><span style="left:${px(4)}%">4 h</span><span style="left:50%">12 h</span><span style="left:100%">24 h</span></div><div class="hc-key"><span><i class="k-prop"></i>Propuesta</span><span><i class="k-today"></i>Hoy</span></div>`;
    $('#tape').innerHTML = d.tape.map(t => `<li><b>${esc(t.v)}</b>${esc(t.t)}${t.max !== '—' ? `<span class="max">hoy: ${esc(t.max)}</span>` : ''}</li>`).join('');
    const autoLabel = {auto:'Lo hace el sistema y queda registrado', asistido:'El sistema prepara, una persona aprueba', humano:'Decide y actúa una persona'};
    $('#automation').innerHTML = ['auto','asistido','humano'].map(k => `<div class="auto-col"><h3><span class="auto-pill ${k}">${k === 'auto' ? 'Automático' : k === 'asistido' ? 'Asistido' : 'Humano'}</span>${esc(autoLabel[k])}</h3>${d.automation.filter(a => a.level === k).map(a => `<article><h4>${esc(a.title)}</h4><p>${esc(a.text)}</p></article>`).join('')}</div>`).join('');
    const tier = {ley:'Requiere ley', reglamento:'Decreto supremo', administrativo:'Resolución o protocolo'};
    $('#reforms').innerHTML = `<thead><tr><th>Paso</th><th>Hoy</th><th>Propuesta</th><th>Norma que lo fija</th><th>Quién puede cambiarlo</th></tr></thead><tbody>${d.reforms.map(r => `<tr><td class="step">${esc(r.step)}</td><td class="today">${esc(r.today)}</td><td class="prop">${esc(r.proposed)}</td><td>${esc(r.instrument)}</td><td><span class="tier ${r.tier}">${tier[r.tier]}</span><br><span class="micro">${esc(r.who)}</span></td></tr>`).join('')}</tbody>`;
    $('#hypotheses').innerHTML = hyp.items.map(h => `<article class="hyp"><div class="top"><span class="hid">${esc(h.id)}</span><span class="verdict-tag ${esc(h.status_code)}">${esc(h.status_label)}</span></div><h3>${esc(h.statement)}</h3><p class="answer">${esc(h.answer)}</p>${h.new_evidence && h.new_evidence.length ? `<ul>${h.new_evidence.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : `<p class="micro">${esc(h.support)}</p>`}<details><summary>En contra y qué falta para confirmarla</summary><p><b>En contra o límite:</b> ${esc(h.counterevidence)}</p><p><b>Para confirmarla:</b> ${esc(h.required_evidence)}</p><p class="micro">${h.sources.map(x => link(x.url, x.label)).join(' · ')}</p></details></article>`).join('');
    $('#requirements').innerHTML = d.requirements.map((r, i) => `<article class="req-col lvl${i}"><h3>${esc(r.level)}</h3><p class="micro">${esc(r.who)}</p><ul>${r.items.map(x => `<li>${esc(x)}</li>`).join('')}</ul></article>`).join('');
  }

  // Mapa: proyección equirectangular local de la geometría oficial simplificada, como en la investigación.
  function map(){
    const pts = geo.features.flatMap(f => (f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates).flat(1).flat(1));
    const minX = Math.min(...pts.map(p=>p[0])), maxX = Math.max(...pts.map(p=>p[0])), minY = Math.min(...pts.map(p=>p[1])), maxY = Math.max(...pts.map(p=>p[1]));
    const W = 420, k = W / (maxX - minX), H = (maxY - minY) * k;
    const xy = p => [(p[0]-minX)*k, (maxY-p[1])*k];
    const ring = r => r.map((p,i) => `${i?'L':'M'}${xy(p).map(v=>v.toFixed(1)).join(',')}`).join('') + 'Z';
    const polys = f => f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
    const rate = code => (regions.find(r => r.code === (code === '15' ? '15M' : code)) || {}).rate_per_100k;
    const shade = v => v == null ? css('--map-0') : css(v < 25 ? '--map-0' : v < 50 ? '--map-1' : v < 100 ? '--map-2' : v < 150 ? '--map-3' : '--map-4');
    const name = code => code === '15' ? 'Lima' : (regions.find(r => r.code === code) || {}).region || code;
    const byCode = {}; cases.forEach(c => (byCode[c.region_code] = byCode[c.region_code] || []).push(c));
    let s = `<svg viewBox="-10 -10 ${W+20} ${H+20}" role="img" aria-label="Mapa del Perú">`;
    s += geo.features.map(f => `<path class="dep" d="${polys(f).map(p => p.map(ring).join('')).join('')}" fill="${shade(rate(f.properties.coddep))}" fill-rule="evenodd"><title>${esc(name(f.properties.coddep))}: ${rate(f.properties.coddep) == null ? 'sin tasa' : dec(rate(f.properties.coddep)) + ' denuncias por 100.000'}</title></path>`).join('');
    Object.entries(byCode).forEach(([code, list], i) => {
      const f = geo.features.find(f => f.properties.coddep === code); if(!f) return;
      const outer = polys(f).map(p => p[0]).sort((a,b) => b.length - a.length)[0];
      let [cx, cy] = xy([outer.reduce((a,p)=>a+p[0],0)/outer.length, outer.reduce((a,p)=>a+p[1],0)/outer.length]);
      const r = 9 + Math.sqrt(list.length) * 4.5;
      if(code === '07') { cx -= 22; cy += 4; }
      const tip = `${name(code)}: ${list.length} ${list.length === 1 ? 'caso' : 'casos'} · ${list.slice(0,3).map(c => c.title).join(' | ')}${list.length > 3 ? '…' : ''}`;
      s += `<g class="pin" tabindex="0" role="button" data-tip="${esc(tip)}" data-code="${code}" style="--i:${i}"><circle class="ring" cx="${cx}" cy="${cy}" r="8"/><circle class="core" cx="${cx}" cy="${cy}" r="${r}"/><text x="${cx}" y="${cy+4}" text-anchor="middle">${list.length}</text></g>`;
    });
    const box = $('#map');
    box.innerHTML = s + `</svg><figcaption class="map-legend"><span><i></i>Casos resueltos documentados</span><span><span class="ramp">${['--map-0','--map-1','--map-2','--map-3','--map-4'].map(v=>`<span style="background:${css(v)}"></span>`).join('')}</span>Denuncias por 100.000 hab., 2025 (de menos a más)</span></figcaption>`;
    const tip = document.createElement('div'); tip.className = 'map-tip'; box.appendChild(tip);
    box.querySelectorAll('.pin').forEach(p => {
      const show = () => { const r = box.getBoundingClientRect(), t = p.getBoundingClientRect(); tip.textContent = p.dataset.tip; tip.style.left = Math.min(Math.max(t.left - r.left + t.width/2, 130), r.width - 130) + 'px'; tip.style.top = (t.top - r.top) + 'px'; tip.classList.add('on'); };
      p.addEventListener('mouseenter', show); p.addEventListener('focus', show);
      p.addEventListener('mouseleave', () => tip.classList.remove('on')); p.addEventListener('blur', () => tip.classList.remove('on'));
      const go = () => { caseFilter = 'Todas'; regionFilter = p.dataset.code; caseList(); $('#case-list').scrollIntoView({behavior:'smooth', block:'start'}); };
      p.addEventListener('click', go); p.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
  }

  // Plan: las primeras 4 h ocupan el 62% del ancho; de 4 a 72 h, el 30%; de 72 h a 15 días, el resto.
  let stage = 1;
  const T = d.target_h, hx = h => h <= T ? h / T * 62 : h <= 72 ? 62 + (h - T) / (72 - T) * 30 : 92 + (h - 72) / 288 * 8;
  function gantt(){
    const ticks = [[0,'0'],[0.5,'30 min'],[1,'1 h'],[2,'2 h'],[3,'3 h'],[T,`${T} h`],[24,'24 h'],[72,'72 h'],[360,'15 d']];
    $('#gantt').innerHTML = `<div class="gantt-axis" aria-hidden="true">${ticks.map(([h,t]) => `<span class="${h===T?'goal':[0.5,1,3,24].includes(h)?'minor':''}" style="left:${hx(h)}%">${t}</span>`).join('')}</div><div class="gantt-body"><span class="goal-line" style="left:calc(var(--lane-label) + (100% - var(--lane-label)) * ${hx(T)/100})" aria-hidden="true"></span>` +
      d.route.map((r, i) => `<button type="button" class="lane${r.blocking ? '' : ' after'}" aria-pressed="${i===stage}" data-i="${i}"><span class="lane-name">${esc(r.title)}<small><span class="auto-dot ${r.automation}" aria-hidden="true"></span>${esc({auto:'Automático', asistido:'Asistido', humano:'Humano'}[r.automation])} · ${esc(r.who)}</small></span><span class="track">${r.legal_max_h ? `<span class="legal" style="left:${hx(r.start_h)}%;width:${hx(r.legal_max_h) - hx(r.start_h)}%" title="Hoy: ${esc(r.current)}"></span>` : ''}<span class="bar ${r.blocking ? '' : 'meta'}" style="left:${hx(r.start_h)}%;width:${hx(r.end_h) - hx(r.start_h)}%"></span><span class="bar-lbl" style="${r.end_h > 72 ? `right:${100 - hx(r.start_h) + 1}%` : `left:calc(${hx(r.end_h)}% + 8px)`}">${esc(r.clock)}</span></span></button>`).join('') +
      `</div><div class="gantt-key"><span><i style="background:${css('--tape')}"></i>Plazo máximo propuesto</span><span><i class="ghost"></i>Lo que permite la norma hoy</span><span><i style="background:${css('--steel')}"></i>Corre después, sin frenar la intervención</span></div>`;
    $('#gantt').querySelectorAll('.lane').forEach(b => b.onclick = () => { stage = +b.dataset.i; gantt(); });
    const r = d.route[stage];
    $('#stage-detail').innerHTML = `<span class="when ${r.blocking ? '' : 'meta'}">${esc(r.clock)} · hoy: ${esc(r.current)}</span><h3>${esc(r.title)}</h3><p class="who">${esc({auto:'Automático', asistido:'El sistema prepara y una persona aprueba', humano:'Decide y actúa una persona'}[r.automation])} · ${esc(r.who)}</p><ol>${r.actions.map(a => `<li>${esc(a)}</li>`).join('')}</ol><p class="law-links">Respaldo: ${r.law_ids.map(lawLink).join(' · ')}</p><p class="caveat">${esc(r.note)}</p>`;
  }

  function charts(){
    const kinds = {captura:['--resolved','Captura desde la denuncia o el hecho'], cota_primera_medida:['--steel','Como máximo, hasta la primera medida judicial'], investigacion:['--alert','Investigación de una organización completa']};
    const days = v => v === 0 ? 'mismo día' : v >= 60 ? `${Math.round(v/30)} meses` : `${v} días`;
    const timed = cases.filter(c => c.speed_days != null).sort((a,b) => a.speed_days - b.speed_days);
    const sp = $('#chart-speed'); sp.dataset.label = 'Días hasta la captura o la medida judicial';
    bars(sp, timed.map(c => ({k:`${c.region.split(' (')[0]} · ${c.id}`, v:c.speed_days, color:css(kinds[c.speed_kind][0]), tip:`${c.title}: ${days(c.speed_days)}. ${c.time_note}`})), {fmt:days, labelW:190});
    sp.insertAdjacentHTML('afterbegin', `<div class="legend">${Object.values(kinds).map(([v,t]) => `<span><i style="background:${css(v)}"></i>${t}</span>`).join('')}</div>`);
    sp.insertAdjacentHTML('beforeend', '<p class="note">Un caso con denuncia inmediata se resuelve en horas; desarticular una organización completa tomó de 8 meses a más de 2 años.</p>');
    const tc = {}; cases.forEach(c => c.tags.forEach(t => tc[t] = (tc[t]||0) + 1));
    const tech = $('#chart-techniques'); tech.dataset.label = 'Técnicas en casos resueltos';
    bars(tech, Object.entries(tc).sort((a,b)=>b[1]-a[1]).map(([k,v]) => ({k, v, tip:`${k}: ${v} de ${cases.length} casos`})), {color:css('--tape'), labelW:200});

    const annual = $('#chart-annual'); annual.dataset.label = 'Denuncias anuales 2019 a 2025';
    columns(annual, series.map(r => ({k:String(r.year), v:r.complaints, label: [2019, 2023, 2025].includes(r.year) ? compact(r.complaints) : '', tip:`${r.year}: ${num(r.complaints)} denuncias, ${dec(r.rate_per_100k)} por 100.000${r.methodology_break?'; cambio metodológico':''}`})), {highlight: r => r.k === '2025', note:'2025 incorpora un cambio metodológico; compararlo con años previos es orientativo.'});
    annual.insertAdjacentHTML('beforeend', tableFor(['Año','Denuncias','Tasa'], series.map(r => [r.year, num(r.complaints), dec(r.rate_per_100k)])));
    const ytd = $('#chart-ytd'); ytd.dataset.label = 'Enero a julio 2025 y 2026';
    const pct = dec((d.ytd.current/d.ytd.previous - 1) * 100);
    columns(ytd, [{k:`Ene–jul ${d.ytd.year-1}`, v:d.ytd.previous, label:num(d.ytd.previous), tip:`${d.ytd.year-1}: ${num(d.ytd.previous)}`}, {k:`Ene–jul ${d.ytd.year}`, v:d.ytd.current, label:`${num(d.ytd.current)} (${pct}%)`, tip:`${d.ytd.year}: ${num(d.ytd.current)}`}], {highlight: r => r.k.endsWith(d.ytd.year), note: d.ytd.caveat});
    const reg = $('#chart-regions'); reg.dataset.label = 'Tasa regional 2025';
    const sorted = [...regions].sort((a,b) => b.rate_per_100k - a.rate_per_100k);
    bars(reg, sorted.slice(0, 10).map(r => ({k:r.region, v:r.rate_per_100k, color: r.rate_per_100k > 77.8 ? css('--alert') : css('--steel')})), {ref:77.8, refLabel:'Nacional 77,8', fmt:dec, labelW:150});
    reg.insertAdjacentHTML('beforeend', tableFor(['Jurisdicción','Tasa 2025'], sorted.map(r => [r.region, dec(r.rate_per_100k)])));
    const counts = {}; cases.forEach(c => new Set(c.payment_methods).forEach(p => counts[p] = (counts[p]||0) + 1));
    const pay = $('#chart-payments'); pay.dataset.label = 'Medios de pago en casos';
    bars(pay, Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(([k,v]) => ({k, v, tip:`${k}: ${v} de ${cases.length} casos`})), {labelW:150});
  }

  let caseFilter = 'Todas', regionFilter = null;
  function caseList(){
    const tc = {}; cases.forEach(c => c.tags.forEach(t => tc[t] = (tc[t]||0) + 1));
    const all = [['Todas', cases.length], ...Object.entries(tc).sort((a,b)=>b[1]-a[1])];
    $('#case-filters').innerHTML = all.map(([t, n]) => `<button class="chip" type="button" aria-pressed="${t===caseFilter && !regionFilter}" data-t="${esc(t)}">${esc(t)}<span class="c">${n}</span></button>`).join('') + (regionFilter ? `<button class="chip" type="button" aria-pressed="true" data-clear="1">Región: ${esc(cases.find(c=>c.region_code===regionFilter).region.split(' (')[0])} ✕</button>` : '');
    $('#case-filters').querySelectorAll('button').forEach(b => b.onclick = () => { if(b.dataset.clear) regionFilter = null; else { caseFilter = b.dataset.t; regionFilter = null; } caseList(); });
    const speed = c => c.speed_days == null ? `<div class="speed na">s/d<small>sin fecha comparable</small></div>` : c.speed_days === 0 ? `<div class="speed fast">Mismo día<small>hasta la captura</small></div>` : c.speed_kind === 'investigacion' ? `<div class="speed slow">${Math.round(c.speed_days/30)} meses<small>de investigación</small></div>` : `<div class="speed">≤ ${c.speed_days} días<small>hasta medida judicial</small></div>`;
    const rows = cases.filter(c => (caseFilter === 'Todas' || c.tags.includes(caseFilter)) && (!regionFilter || c.region_code === regionFilter)).sort((a,b) => (a.speed_days ?? 9e9) - (b.speed_days ?? 9e9) || (b.published_at||'').localeCompare(a.published_at||''));
    $('#case-list').innerHTML = rows.map(c => `<details class="case"><summary>${speed(c)}<div><h4>${esc(c.title)}</h4><div class="where">${esc(c.region)} · publicado ${fmtDate(c.published_at)} · ${esc(c.id)}</div></div><div class="tags">${c.tags.map(t=>`<span>${esc(t)}</span>`).join('')}</div><span class="chev" aria-hidden="true"></span></summary>
      <div class="case-body"><div><h5>Qué pasó</h5><p>${esc(c.summary || c.modality)}</p><p><b>Canal:</b> ${esc(c.channel || 'no informado')}. <b>Pago:</b> ${esc(c.payment_methods.join(', '))}.</p>${c.techniques.length ? `<h5>Cómo se resolvió</h5><p>${esc(c.techniques.join('; '))}.</p>` : ''}</div>
      <div><h5>Resultado</h5><p>${esc(c.outcome)}.</p><div class="money"><div><b>${money(c.demanded_pen)}</b>exigido</div>${c.paid_pen ? `<div><b>${money(c.paid_pen)}</b>pagado</div>` : ''}${c.detainees ? `<div><b>${num(c.detainees)}</b>${c.detainees === 1 ? 'persona' : 'personas'}</div>` : ''}${c.sentence_years ? `<div><b>${dec(c.sentence_years).replace(',0','')} años</b>pena mayor</div>` : ''}</div><p class="micro">${esc(c.time_note)}</p></div>
      <div><h5>Fuente y límites</h5><p>${link(c.source_url, 'Abrir la fuente')}<br><span class="micro">${esc(c.evidence_locator)}</span></p><p class="micro">${esc(c.limitations)}</p></div></div></details>`).join('') || '<p class="empty">No hay casos con ese filtro.</p>';
    $('#aggregates').innerHTML = d.aggregates.map(a => `<article><div class="v">${esc(a.value)}</div><p class="m">${esc(a.metric)}</p><p class="micro">${esc(a.detail)}${a.detail.includes(a.period) ? '' : '. ' + esc(a.period)}.</p><p class="micro">${esc(a.caveat)} ${link(a.source_url, 'Fuente')}</p></article>`).join('');
  }

  const levels = {ok:'Decide', conv:'Urgente', orden:'Pide', ejecuta:'Ejecuta', no:''};
  const levelText = {ok:'Decide por sí mismo', conv:'Actúa de urgencia y un juez convalida después', orden:'Solicita; decide otra autoridad', ejecuta:'Ejecuta por deber legal lo que otro ordena'};
  function roles(){
    $('#matrix-key').innerHTML = Object.entries(levelText).map(([k, t]) => `<span><span class="cell ${k}">${levels[k]}</span>${esc(t)}</span>`).join('');
    const rows = d.roles.filter(r => Object.keys(r.matrix).length);
    $('#matrix').innerHTML = `<thead><tr><th scope="col">Rol</th>${d.capabilities.map(c => `<th scope="col">${esc(c.label)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr><th scope="row">${esc(r.role.split(' (')[0])}<small>${esc(r.profile || r.institution)}</small></th>${d.capabilities.map(c => { const v = r.matrix[c.id] || 'no'; return `<td><span class="cell ${v}" title="${esc(r.role.split(' (')[0])}: ${esc(c.label)}. ${esc(levelText[v] || 'No le corresponde')}">${levels[v] || '·'}</span></td>`; }).join('')}</tr>`).join('')}</tbody>`;
    $('#role-list').innerHTML = d.roles.map(r => `<details class="role"><summary><span>${esc(r.role)}<small>${esc(r.institution)}</small></span><span aria-hidden="true">+</span></summary><ul>${r.can_do.map(x => `<li>${esc(x)}</li>`).join('')}${r.needs_authorization_for.map(x => `<li class="need">Necesita autorización: ${esc(x)}</li>`).join('')}</ul></details>`).join('');
  }

  function laws(){
    const order = ['Comunicaciones','Finanzas','Cámaras','Proceso penal','Penas','Organización','Víctimas','Datos personales','Proyectos'];
    const groups = order.map(a => [a, d.laws.filter(l => l.area === a)]).filter(g => g[1].length);
    const cols = [[],[],[]], size = [0,0,0];
    groups.forEach(g => { const i = size.indexOf(Math.min(...size)); cols[i].push(g); size[i] += g[1].length + 2; });
    const procedural = ['Comunicaciones','Finanzas','Cámaras','Proceso penal'];
    const judge = (v, area) => v === true ? '<span class="badge j">Requiere juez</span>' : v === false ? (procedural.includes(area) ? '<span class="badge nj">Sin orden judicial</span>' : '') : /convalid/.test(v) ? '<span class="badge nj">Juez convalida después</span>' : '';
    $('#laws').innerHTML = cols.map(col => `<div>${col.map(([area, list]) => `<div class="law-col"><h3>${esc(area)}<span>${list.length}</span></h3>${list.map(l => `<details class="law"><summary><div class="t">${esc(shortName(l.name))}</div><div class="s">${esc(l.short)}</div><div class="badges"><span class="badge ${l.type === 'vigente' ? 'v' : 'p'}">${l.type === 'vigente' ? 'Vigente' : 'Proyecto'}</span>${judge(l.needs_judge, l.area)}</div></summary><div class="law-body"><p>${esc(l.what_it_enables)}</p><dl><dt>Pide</dt><dd>${esc(l.who_requests)}</dd><dt>Decide</dt><dd>${esc(l.who_decides)}</dd><dt>Plazo</dt><dd>${esc(l.deadline)}</dd></dl><p class="micro">${link(l.url, l.name)}${l.locator ? ' · ' + esc(l.locator) : ''} · verificación: ${esc(l.verification)}</p><p class="micro">${esc(l.limitations)}</p></div></details>`).join('')}</div>`).join('')}</div>`).join('');
  }

  let techSel = 4;
  const pace = {minutos:1, horas:2, 'días':3, semanas:4};
  function tech(){
    const paceHTML = s => `<span class="pace p${pace[s]}"><i>${[1,2,3,4].map(n => `<span class="${n <= pace[s] ? 'on' : ''}"></span>`).join('')}</i>${esc(s)}</span>`;
    $('#tech-tabs').innerHTML = d.tech.map((t, i) => `<button type="button" role="tab" aria-selected="${i===techSel}" data-i="${i}"><b>${esc(t.start)}</b><span class="micro">${esc(t.label)}</span>${paceHTML(t.speed_class)}</button>`).join('');
    $('#tech-tabs').querySelectorAll('button').forEach(b => b.onclick = () => { techSel = +b.dataset.i; tech(); });
    const t = d.tech[techSel], rel = {alta:'--resolved', media:'--tape', baja:'--alert'};
    $('#tech-panel').innerHTML = `<div class="rel-key"><span><i style="background:${css('--resolved')}"></i>Confiabilidad alta</span><span><i style="background:${css('--tape')}"></i>Media</span><span><i style="background:${css('--alert')}"></i>Baja para llegar al autor</span></div>
      <div class="flow">${t.steps.map(s => `<div class="node"><div class="node-card"><div class="rel" style="background:${css(rel[s.reliability] || '--muted')}"></div><div class="in"><p class="to">${esc(s.to)}</p><p class="from">desde ${esc(s.from.toLowerCase())}</p><dl><dt>Dato</dt><dd>${esc(s.data)}</dd><dt>Lo tiene</dt><dd>${esc(s.holder)}</dd><dt>Vía legal</dt><dd>${esc(s.legal_route)}</dd><dt>Tiempo</dt><dd><b>${esc(s.time)}</b></dd><dt>Confiabilidad: ${esc(s.reliability)}</dt><dd>${esc(s.reliability_note)}</dd><dt>Puede fallar por</dt><dd>${esc(s.failure_modes)}</dd></dl>${s.source_ids.length ? `<p class="micro" style="margin:10px 0 0">${s.source_ids.filter(id => src[id]).map(id => link(src[id].url, src[id].title)).join(' · ')}</p>` : ''}</div></div></div>`).join('')}</div>
      <p class="verdict">${esc(t.verdict)}</p>`;
  }

  function limits(){ $('#limits').innerHTML = d.limits.map(l => `<article><h3>${esc(l.title)}</h3><p>${esc(l.text)}</p></article>`).join(''); }

  // Solo se redibuja lo que depende de colores calculados al cambiar el tema.
  // Barra lateral: marca la sección visible y abre o cierra el menú en móvil.
  function sidebar(){
    const links = [...document.querySelectorAll('#side-nav a')], side = $('#sidebar'), btn = $('#menu-btn');
    const close = () => { side.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); };
    btn.addEventListener('click', () => { const open = side.classList.toggle('open'); btn.setAttribute('aria-expanded', String(open)); });
    links.forEach(a => a.addEventListener('click', close));
    document.addEventListener('keydown', e => { if(e.key === 'Escape') close(); });
    const obs = new IntersectionObserver(entries => entries.forEach(e => { if(e.isIntersecting) links.forEach(a => a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + e.target.id))); }), {rootMargin:'-40% 0px -55% 0px'});
    links.forEach(a => { const t = document.querySelector(a.getAttribute('href')); if(t) obs.observe(t); });
  }

  const paint = () => { map(); gantt(); charts(); tech(); };
  let lastW = innerWidth, timer;
  addEventListener('resize', () => { if(Math.abs(innerWidth - lastW) < 40) return; lastW = innerWidth; clearTimeout(timer); timer = setTimeout(charts, 150); });
  sidebar();
  setupTheme(paint);
  hero(); paint(); caseList(); roles(); laws(); limits();
}
main().catch(err => { $('#hero-figures').innerHTML = `<p class="loading">No se pudieron cargar los datos (${esc(err.message)}). Abre el sitio desde un servidor HTTP.</p>`; console.error(err); });
})();
