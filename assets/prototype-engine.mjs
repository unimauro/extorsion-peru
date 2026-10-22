export const roles={pnp:'Policía',fiscal:'Fiscalía',juez:'Juzgado',uif:'UIF',banco:'Banco',osiptel:'OSIPTEL',telco:'Telco',auditor:'Auditoría'};
export const labels={draft:'Borrador',preserved:'Evidencia preservada',submitted:'Solicitudes enviadas',pending:'Pendiente',reviewed:'Revisión registrada',pending_uif:'Pendiente de UIF',pending_osiptel:'Pendiente de OSIPTEL',ordered:'Orden emitida',frozen:'Fondos inmovilizados · simulado',incident:'Incidencia de ejecución',rejected:'Solicitud rechazada',confirmed:'Convalidación simulada',revoked:'Revocación simulada',release_pending:'Liberación pendiente',released:'Fondos liberados · simulado',cancelled:'Orden cancelada',blocked:'Línea dada de baja · simulado',restore_requested:'Reactivación solicitada',restore_ordered:'Reactivación ordenada',restored:'Línea reactivada · simulado'};
export function initialState(){return {version:1,cases:[
 {id:'DEMO-001',title:'Amenaza y destino de cobro corroborados',summary:'Comercio ficticio recibe una exigencia de dinero. La evidencia de este ejercicio ya fue corroborada.',sufficient:true,file:'draft',fiscal:'pending',bank:'draft',telco:'draft',review:'pending',amount:1500,account:'CTA-DEMO-A',line:'LINEA-DEMO-A'},
 {id:'DEMO-002',title:'Captura aislada e identidad por comprobar',summary:'Solo hay una captura ficticia sin contexto. Se debe subsanar antes de enviar solicitudes; el titular podría estar suplantado.',sufficient:false,file:'draft',fiscal:'pending',bank:'draft',telco:'draft',review:'pending',amount:800,account:'CTA-DEMO-B',line:'LINEA-DEMO-B'}],events:[]};}
const action=(role,label,can,change,scope,reason)=>({role,label,can,change,scope,reason});
export const actions={
 preserve:action('pnp','Preservar evidencia',c=>c.file==='draft',c=>{c.file='preserved';},'expediente','Originales ficticios y procedencia registrados'),
 supplement:action('pnp','Añadir corroboración ficticia',c=>c.file==='preserved'&&!c.sufficient,c=>{c.sufficient=true;},'expediente','Contexto y vínculo de los identificadores corroborados en el ejercicio'),
 submit:action('pnp','Enviar solicitudes a ambas rutas',c=>c.file==='preserved'&&c.sufficient,c=>{c.file='submitted';c.bank='pending_uif';c.telco='pending_osiptel';},'expediente','Expediente ficticio suficiente; urgencia y vínculo revisados'),
 fiscal_review:action('fiscal','Registrar revisión fiscal',c=>c.file==='submitted'&&c.fiscal==='pending',c=>{c.fiscal='reviewed';},'expediente','Revisión fiscal de coordinación registrada; no sustituye decisiones de otras autoridades'),
 uif_approve:action('uif','Emitir orden de inmovilización',c=>c.bank==='pending_uif',c=>{c.bank='ordered';},'financiera','Presupuestos de la medida motivados en el escenario; se deriva al control judicial'),
 uif_reject:action('uif','Rechazar solicitud financiera',c=>c.bank==='pending_uif',c=>{c.bank='rejected';},'financiera','No se acreditan los presupuestos de la medida en esta decisión simulada'),
 bank_execute:action('banco','Confirmar inmovilización',c=>c.bank==='ordered'&&c.review!=='revoked',c=>{c.bank='frozen';},'financiera','Orden válida recibida y ejecución ficticia confirmada'),
 bank_incident:action('banco','Registrar incidencia técnica',c=>c.bank==='ordered',c=>{c.bank='incident';},'financiera','Incidencia ficticia documentada; escalamiento sin dar por ejecutada la medida'),
 uif_retry:action('uif','Reenviar orden tras incidencia',c=>c.bank==='incident'&&c.review!=='revoked',c=>{c.bank='ordered';},'financiera','Incidencia resuelta en la simulación; orden reenviada sin duplicar medida'),
 judge_confirm:action('juez','Convalidar medida financiera',c=>c.review==='pending'&&['ordered','frozen','incident'].includes(c.bank),c=>{c.review='confirmed';},'judicial','Control judicial ficticio: convalidación motivada'),
 judge_revoke:action('juez','Revocar medida financiera',c=>['pending','confirmed'].includes(c.review)&&['ordered','frozen','incident'].includes(c.bank),c=>{c.review='revoked';c.bank=c.bank==='frozen'?'release_pending':'cancelled';},'judicial','Control judicial ficticio: se ordena levantar o cancelar la medida'),
 bank_release:action('banco','Confirmar liberación',c=>c.bank==='release_pending'&&c.review==='revoked',c=>{c.bank='released';},'financiera','Levantamiento ficticio ejecutado conforme a la revisión judicial'),
 osiptel_approve:action('osiptel','Validar y transmitir orden a Telco',c=>c.telco==='pending_osiptel',c=>{c.telco='ordered';},'telecom','Requerimiento competente validado y transmitido en el escenario'),
 osiptel_reject:action('osiptel','Devolver requerimiento telecom',c=>c.telco==='pending_osiptel',c=>{c.telco='rejected';},'telecom','Requerimiento ficticio incompleto: devolución motivada'),
 telco_execute:action('telco','Confirmar baja de línea',c=>c.telco==='ordered',c=>{c.telco='blocked';},'telecom','Baja ficticia ejecutada; constancia registrada sin borrar evidencia'),
 telco_incident:action('telco','Registrar incidencia telecom',c=>c.telco==='ordered',c=>{c.telco='incident';},'telecom','Incidencia ficticia escalada a OSIPTEL; no se marca como ejecutada'),
 osiptel_retry:action('osiptel','Reenviar orden telecom',c=>c.telco==='incident',c=>{c.telco='ordered';},'telecom','Incidencia resuelta; reenvío ficticio con referencia a la misma solicitud'),
 pnp_restore:action('pnp','Solicitar reactivación por corrección',c=>c.telco==='blocked',c=>{c.telco='restore_requested';},'telecom','Corrección ficticia sustentada por la entidad solicitante'),
 osiptel_restore:action('osiptel','Transmitir orden de reactivación',c=>c.telco==='restore_requested',c=>{c.telco='restore_ordered';},'telecom','Solicitud competente de corrección validada en el escenario'),
 telco_restore:action('telco','Confirmar reactivación',c=>c.telco==='restore_ordered',c=>{c.telco='restored';},'telecom','Reactivación ficticia completada y constancia registrada')
};
const copy=x=>JSON.parse(JSON.stringify(x));
export function transition(state,{caseId,role,actionId,reason,at=new Date().toISOString()}){
 const next=copy(state),c=next.cases.find(x=>x.id===caseId),a=actions[actionId];
 if(!c||!a||!roles[role])return {state,ok:false,error:'Caso, acción o rol desconocido.'};
 const before=copy(c);let error='';
 if(role!==a.role)error='El rol seleccionado no está habilitado para esta acción.';
 else if(!a.can(c))error='Faltan requisitos o el estado ya cambió. No se ejecutó la acción.';
 else if(typeof reason!=='string'||!reason.trim())error='Se requiere una motivación para la decisión.';
 if(!error)a.change(c);
 next.events.push({sequence:next.events.length+1,at,caseId,role,actor:roles[role]+' · usuario ficticio',actionId,action:a.label,scope:a.scope,outcome:error?'denegado':'registrado',reason:error||reason.trim(),before,after:copy(c),signature:'Constancia simulada; sin certificado ni firma digital real'});
 return {state:next,ok:!error,error};
}
export function resetCase(state,caseId,at=new Date().toISOString()){
 const fresh=initialState().cases.find(c=>c.id===caseId);if(!fresh)return state;
 const next=copy(state),index=next.cases.findIndex(c=>c.id===caseId),before=copy(next.cases[index]);next.cases[index]=fresh;
 next.events.push({sequence:next.events.length+1,at,caseId,role:'demo',actor:'Control del ejercicio',actionId:'reset',action:'Reiniciar caso ficticio',scope:'expediente',outcome:'registrado',reason:'Nuevo recorrido; se conserva la historia anterior',before,after:copy(fresh),signature:'Sin firma real'});return next;
}
export function restoreState(value){
 try{const d=JSON.parse(value);if(d.version!==1||!Array.isArray(d.cases)||d.cases.length!==2||!Array.isArray(d.events))return null;
 const fresh=initialState();for(let i=0;i<2;i++){const c=d.cases[i];if(c.id!==fresh.cases[i].id||typeof c.sufficient!=='boolean'||!['file','fiscal','bank','telco','review'].every(k=>c[k] in labels))return null;}
 // Replay verifies stored transitions instead of trusting mutated case state.
 let replay=initialState();for(const ev of d.events){if(typeof ev.at!=='string'||!Number.isFinite(Date.parse(ev.at)))return null;if(ev.actionId==='reset')replay=resetCase(replay,ev.caseId,ev.at);else{const result=transition(replay,{caseId:ev.caseId,role:ev.role,actionId:ev.actionId,reason:ev.reason,at:ev.at});if(result.state===replay)return null;replay=result.state;}}
 if(JSON.stringify(replay.cases)!==JSON.stringify(d.cases))return null;return replay;
 }catch{return null;}
}
