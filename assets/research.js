'use strict';
(async function researchEdition(){
  const $=s=>document.querySelector(s), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const read=async name=>{const r=await fetch(`data/${name}.json`);if(!r.ok)throw Error(name);return r.json();};
  try{
    const [update,hypotheses,trace]=await Promise.all(['actualizacion_2026','hipotesis','traza_tareas'].map(read));
    $('#cutoff-explainer').textContent=update.cutoff_explanation;
    $('#update-findings').innerHTML=update.findings.map(f=>`<article class="update-finding"><p class="eyebrow">${esc(f.category)}</p><h3>${esc(f.title)}</h3><p>${esc(f.summary)}</p><p class="micro"><b>Alcance:</b> ${esc(f.limitation)}</p><a href="${esc(f.source_url)}" target="_blank" rel="noopener noreferrer">${esc(f.source_label)} ↗</a></article>`).join('');
    try{
      const response=await fetch('research/2026-10-22/estadisticas_2026.json');
      if(!response.ok)throw Error('estadisticas_2026');
      const stats=await response.json(), rows=stats.regiones.filas;
      const finding=stats.hallazgos.find(f=>f.id==='STAT2026-H01');
      const source=stats.fuentes.find(f=>f.id===finding.fuente_id);
      const number=new Intl.NumberFormat('es-ES'), decimal=new Intl.NumberFormat('es-ES',{maximumFractionDigits:2});
      const maxRegion=Math.max(...rows.flatMap(r=>[r.enero_julio_2025,r.enero_julio_2026]));
      const cell=(value,color)=>`<span>${number.format(value)}</span><span aria-hidden="true" style="display:block;width:100%;min-width:5rem;height:.45rem;background:#ece8df;margin-top:.35rem;border-radius:2px"><span style="display:block;height:100%;width:${value/maxRegion*100}%;background:${color};border-radius:2px"></span></span>`;
      const regional=document.createElement('section');
      regional.className='regional-comparison update-finding';
      regional.setAttribute('aria-labelledby','regional-comparison-title');
      regional.style.marginTop='1.5rem';
      regional.innerHTML=`<p class="eyebrow">Denuncias policiales · enero–julio</p><h3 id="regional-comparison-title">2026 frente al mismo periodo de 2025</h3><p><strong>${number.format(finding.conteo)} en 2026</strong> frente a <strong>${number.format(finding.comparacion.conteo)} en 2025</strong>: ${decimal.format(finding.comparacion.variacion_porcentual_calculada)} % de denuncias registradas.</p><p class="micro">Corte y actualización: 31 de julio de 2026. Elaboración del reporte: 14 de agosto de 2026. Cifras provisionales de extorsión y extorsión agravada. Menos denuncias no demuestra por sí solo menos extorsiones ni el efecto de una política.</p><details><summary>Comparar las ${rows.length} unidades regionales</summary><p class="micro">Cada barra usa la misma escala. Los conteos de ambos años cubren enero–julio; Lima Metropolitana y Región Lima se muestran por separado, como en la fuente.</p><div role="region" aria-label="Comparación regional de denuncias policiales por extorsión" tabindex="0" style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;text-align:left"><caption style="text-align:left;padding:.75rem 0">Denuncias policiales por extorsión · enero–julio de 2025 y 2026</caption><thead><tr><th scope="col" style="padding:.65rem">Región</th><th scope="col" style="padding:.65rem">2025</th><th scope="col" style="padding:.65rem">2026</th><th scope="col" style="padding:.65rem">Variación</th></tr></thead><tbody>${rows.map(r=>`<tr style="border-top:1px solid #ded8cb"><th scope="row" style="padding:.65rem;font-weight:500">${esc(r.region)}</th><td style="padding:.65rem">${cell(r.enero_julio_2025,'#8b7655')}</td><td style="padding:.65rem">${cell(r.enero_julio_2026,'#b52f2a')}</td><td style="padding:.65rem;white-space:nowrap">${r.variacion_porcentual_calculada>0?'+':''}${decimal.format(r.variacion_porcentual_calculada)} %</td></tr>`).join('')}</tbody><tfoot><tr style="border-top:2px solid #8b7655"><th scope="row" style="padding:.65rem">Total Perú</th><td style="padding:.65rem">${number.format(finding.comparacion.conteo)}</td><td style="padding:.65rem">${number.format(finding.conteo)}</td><td style="padding:.65rem;white-space:nowrap">${decimal.format(finding.comparacion.variacion_porcentual_calculada)} %</td></tr></tfoot></table></div></details><p class="micro"><a href="${esc(source.url)}#page=23" target="_blank" rel="noopener noreferrer">Fuente: MININTER / SIDPOL, página 23 ↗</a> · <a href="research/2026-10-22/estadisticas_2026.json">Descargar datos y metodología JSON ↗</a></p>`;
      $('#update-findings').insertAdjacentElement('afterend',regional);
    }catch(e){
      console.error('No se pudo cargar la comparación regional',e);
      const notice=document.createElement('p');
      notice.className='micro regional-comparison-error';
      notice.textContent='No se pudo cargar la comparación regional de enero–julio. Recarga la página para intentarlo de nuevo.';
      $('#update-findings').insertAdjacentElement('afterend',notice);
    }
    $('#hypotheses').innerHTML=hypotheses.items.map(h=>`<article class="hypothesis"><div class="hypothesis-top"><span class="case-id">${esc(h.id)}</span><span class="verdict ${esc(h.status_code)}">${esc(h.status_label)}</span></div><h3>${esc(h.statement)}</h3><p class="hypothesis-answer"><b>Respuesta:</b> ${esc(h.answer)}</p><p>${esc(h.assessment)}</p>${h.new_evidence&&h.new_evidence.length?`<ul class="hypothesis-new">${h.new_evidence.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}<details><summary>Ver respaldo, límites y prueba pendiente</summary><p><b>Evidencia a favor:</b> ${esc(h.support)}</p><p><b>Contraevidencia o límite:</b> ${esc(h.counterevidence)}</p><p><b>Para confirmarla:</b> ${esc(h.required_evidence)}</p><div class="evidence-links">${h.sources.map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)} ↗</a>`).join('')}</div></details></article>`).join('');
    $('#trace-tasks').innerHTML=trace.tasks.map(t=>`<li><span class="trace-state">${esc(t.status)}</span><div><h3>${esc(t.id)} · ${esc(t.title)}</h3><p>${esc(t.result)}</p><a href="${esc(t.output)}">Ver resultado JSON ↗</a></div></li>`).join('');
    $('#trace-method').textContent=trace.method;
  }catch(e){console.error(e);$('#research-error').hidden=false;}
})();
