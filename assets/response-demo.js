'use strict';
(function responseDemo(){
  const root=document.getElementById('response-demo');
  if(!root)return;
  const roles=['Recepción','Analista PNP','Autoridad competente','Entidad ejecutora','Control y revisión'];
  const steps=[
    {action:'Recibir',role:0,state:'Recibido',detail:'Se recibe un reporte ficticio y se asigna el identificador DEMO-001.'},
    {action:'Preservar',role:1,state:'Preservado',detail:'Se registra la preservación simulada de mensajes y constancias ficticias, sin cargar archivos.'},
    {action:'Validar',role:1,state:'Validado',detail:'El escenario corroborado supera la revisión ficticia de suficiencia. No se evalúa a ninguna persona real.'},
    {action:'Autorizar',role:2,state:'Autorizado en la simulación',detail:'Se representa una revisión de competencia, fundamento, alcance y plazo. Esta decisión ficticia no habilita ninguna medida real.'},
    {action:'Ejecutar',role:3,state:'Ejecución simulada registrada',detail:'Se anota una respuesta ficticia. No se contacta a bancos, operadores ni autoridades y no se bloquea ningún servicio.'},
    {action:'Revisar',role:4,state:'Revisión simulada finalizada',detail:'Se verifica el registro del ejercicio, su alcance y la posibilidad de corregir o levantar una medida ficticia.'}
  ];
  let next=0,blocked=false,entries=[];
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  root.classList.add('response-demo');
  root.innerHTML=`<div class="rd-banner"><strong>SIMULACIÓN EDUCATIVA</strong><span>No es un trámite real</span></div>
    <h3 class="rd-title">Del reporte a una decisión revisable</h3>
    <p>Escenario ficticio DEMO-001: una persona comunica una exigencia de dinero mediante mensajes inventados. Recorre los controles de una respuesta digital y cambia de rol para completar cada etapa.</p>
    <p class="rd-notice">No ingreses datos reales. Este ejercicio usa únicamente opciones predefinidas; no recibe archivos, no envía información y no realiza ninguna operación externa. Elegir un rol no acredita identidad ni concede permisos reales.</p>
    <ol class="rd-steps" aria-label="Etapas del ejercicio">${steps.map((s,i)=>`<li data-rd-step="${i}"><span class="rd-step-number">${i+1}</span><span><strong>${s.action}</strong><small>${roles[s.role]}</small><small class="rd-step-state">Pendiente</small></span></li>`).join('')}</ol>
    <div class="rd-controls"><div><label for="rd-scenario">Evidencia del caso ficticio</label><select id="rd-scenario"><option value="corroborado">Caso corroborado (simulado)</option><option value="insuficiente">Evidencia insuficiente (simulada)</option></select><small>El escenario queda fijado al recibir. Para cambiarlo, reinicia.</small></div><div><label for="rd-role">Rol que representas</label><select id="rd-role">${roles.map((r,i)=>`<option value="${i}">${r}</option>`).join('')}</select><small>La siguiente etapa exige el rol que indica su tarjeta.</small></div></div>
    <div class="rd-authority"><strong>Competencias diferentes</strong><p>“Autoridad competente” es un rol didáctico genérico. La UIF, las autoridades del sector telecomunicaciones y los jueces tienen competencias, requisitos y procedimientos diferentes. La demo no los fusiona ni reproduce un procedimiento legal. Una medida real requiere identificar la autoridad y la vía que correspondan.</p></div>
    <p id="rd-status" class="rd-status" role="status" aria-live="polite" aria-atomic="true"></p>
    <div class="rd-actions"><button type="button" id="rd-next">Avanzar: recibir</button><button type="button" id="rd-reset" class="rd-secondary">Reiniciar simulación</button></div>
    <details class="rd-record" open><summary>Registro local del ejercicio</summary><p>Las horas corresponden al reloj de este navegador. El registro vive sólo en esta página y se borra al reiniciar o recargar. No es una firma digital, una prueba criptográfica ni una constancia oficial.</p><div class="rd-log-scroll" role="region" aria-label="Registro de transiciones simuladas" tabindex="0"><table><caption>Acciones, roles y estados de DEMO-001</caption><thead><tr><th scope="col">Hora local</th><th scope="col">Rol</th><th scope="col">Acción</th><th scope="col">Estado</th></tr></thead><tbody id="rd-log"></tbody></table></div></details>`;
  const get=id=>root.querySelector(`#${id}`);
  const scenario=get('rd-scenario'),role=get('rd-role'),status=get('rd-status'),button=get('rd-next');
  function log(action,state,actor){
    const date=new Date();
    entries.push({iso:date.toISOString(),time:date.toLocaleTimeString('es-PE',{hour:'2-digit',minute:'2-digit',second:'2-digit'}),action,state,actor});
    get('rd-log').innerHTML=entries.map(e=>`<tr><td><time datetime="${e.iso}">${e.time}</time></td><td>${escape(e.actor)}</td><td>${escape(e.action)}</td><td>${escape(e.state)}</td></tr>`).join('');
  }
  function render(message){
    root.querySelectorAll('[data-rd-step]').forEach((node,i)=>{
      node.classList.toggle('rd-complete',i<next);
      node.classList.toggle('rd-current',i===next&&!blocked);
      node.classList.toggle('rd-blocked',i===next&&blocked);
      if(i===next)node.setAttribute('aria-current','step');else node.removeAttribute('aria-current');
      node.querySelector('.rd-step-state').textContent=i<next?'Completado':i===next&&blocked?'Bloqueado':i===next?'Siguiente etapa':'Pendiente';
    });
    scenario.disabled=next>0||blocked;
    button.disabled=blocked||next===steps.length;
    button.textContent=blocked?'Flujo bloqueado':next===steps.length?'Simulación completada':`Avanzar: ${steps[next].action.toLowerCase()}`;
    status.textContent=message;
    status.classList.toggle('rd-status-blocked',blocked);
  }
  button.addEventListener('click',()=>{
    if(blocked||next>=steps.length)return;
    const step=steps[next],actor=roles[Number(role.value)];
    if(Number(role.value)!==step.role){
      log(`Intento de ${step.action.toLowerCase()}`,'Sin transición: rol no habilitado en la demo',actor);
      render(`No se avanzó. Para ${step.action.toLowerCase()}, selecciona el rol ${roles[step.role]}.`);
      return;
    }
    if(next===2&&scenario.value==='insuficiente'){
      blocked=true;
      log(step.action,'Evidencia insuficiente: autorización bloqueada',actor);
      render('La evidencia ficticia es insuficiente. El flujo se detiene en validación: no se puede autorizar ni ejecutar. Reinicia para probar otro escenario.');
      return;
    }
    log(step.action,step.state,actor);
    next+=1;
    render(step.detail+(next<steps.length?` Sigue ${steps[next].action.toLowerCase()} con el rol ${roles[steps[next].role]}.`:' Ejercicio completado; no se realizó ninguna acción real.'));
  });
  function reset(){
    next=0;blocked=false;entries=[];scenario.value='corroborado';role.value='0';
    log('Inicio','Pendiente de recepción','Simulación');
    render('Elige un escenario. Para comenzar, representa a Recepción y pulsa Avanzar: recibir.');
  }
  get('rd-reset').addEventListener('click',reset);
  reset();
})();
