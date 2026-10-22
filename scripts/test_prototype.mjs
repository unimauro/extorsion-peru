import assert from 'node:assert/strict';
import {initialState,transition,resetCase,restoreState,actions} from '../assets/prototype-engine.mjs';
let state=initialState();const id='DEMO-001';
const go=(actionId,role=actions[actionId].role,caseId=id)=>{const r=transition(state,{caseId,role,actionId,reason:'Motivo ficticio de prueba',at:'2026-10-22T19:00:00Z'});state=r.state;return r;};
assert.equal(go('uif_approve','banco').ok,false);assert.equal(state.cases[0].bank,'draft');
assert.equal(go('bank_execute').ok,false);
go('preserve');go('submit');assert.equal(state.cases[0].bank,'pending_uif');
go('uif_approve');assert.equal(go('bank_execute').ok,true); // no artificial prior judicial/fiscal veto
assert.equal(go('bank_execute').ok,false); // duplicate execution
assert.equal(state.cases[0].telco,'pending_osiptel'); // independent lane
assert.equal(go('judge_revoke').ok,true);assert.equal(state.cases[0].bank,'release_pending');go('bank_release');assert.equal(state.cases[0].bank,'released');
go('osiptel_approve');go('telco_incident');assert.equal(go('telco_execute').ok,false);go('osiptel_retry');go('telco_execute');go('pnp_restore');go('osiptel_restore');go('telco_restore');assert.equal(state.cases[0].telco,'restored');
go('preserve','pnp','DEMO-002');assert.equal(go('submit','pnp','DEMO-002').ok,false);go('supplement','pnp','DEMO-002');go('submit','pnp','DEMO-002');go('uif_approve','uif','DEMO-002');go('judge_revoke','juez','DEMO-002');assert.equal(go('bank_execute','banco','DEMO-002').ok,false);
assert.equal(restoreState(JSON.stringify(state)).cases[0].bank,'released');
const manipulated=JSON.parse(JSON.stringify(state));manipulated.cases[0].bank='frozen';assert.equal(restoreState(JSON.stringify(manipulated)),null);
assert.equal(restoreState('{invalid'),null);
const before=state.events.length;state=resetCase(state,id);assert.equal(state.events.length,before+1);assert.equal(state.cases[0].file,'draft');assert.equal(state.cases[1].bank,'cancelled');
assert.equal(restoreState(JSON.stringify(state)).events.length,state.events.length);
for(const ev of state.events){assert.ok(ev.before&&ev.after&&ev.actor&&ev.reason&&ev.at);}
let rejected=initialState();for(const actionId of ['preserve','submit','uif_reject','osiptel_reject'])rejected=transition(rejected,{caseId:id,role:actions[actionId].role,actionId,reason:'Prueba'}).state;
assert.equal(transition(rejected,{caseId:id,role:'banco',actionId:'bank_execute',reason:'Prueba'}).ok,false);
assert.equal(transition(rejected,{caseId:id,role:'telco',actionId:'telco_execute',reason:'Prueba'}).ok,false);
console.log('OK: permisos, evidencia insuficiente, rutas independientes, duplicados, revocación antes/después de ejecución, incidencias, reactivación, rechazos, persistencia y traza.');
