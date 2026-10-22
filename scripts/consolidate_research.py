"""Consolida la revisión editorial de los tres dosieres; no descarga ni actualiza fuentes."""
import json
from pathlib import Path
root = Path(__file__).resolve().parents[1]
folder = root/'research/2026-10-22'
read = lambda p: json.loads(p.read_text())
stat = read(folder/'estadisticas_2026.json')
bank = read(folder/'cobros_banca.json')
tel = read(folder/'comunicaciones_telco.json')
base = read(root/'data/fuentes.json')
sources = {s['id']:s for s in base+bank['sources']+tel['sources']+stat['fuentes']}
def ref(id):
 s=sources[id]
 return {'label': s.get('title',s.get('titulo',id)), 'url':s['url']}
def write(name,data):
 (root/'data'/f'{name}.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
def finding(category,title,summary,limit,id):
 r=ref(id)
 return dict(category=category,title=title,summary=summary,limitation=limit,source_url=r['url'],source_label=r['label'])
write('actualizacion_2026',{
 'reviewed_at':'2026-10-22','country':'Perú','verified_statistical_cutoff':'2026-07-31',
 'cutoff_explanation':'Revisión al 22 de octubre de 2026. El último conteo policial verificado llega al 31 de julio: 12.174 denuncias. Localizamos un catálogo de septiembre, pero no pudimos validar su archivo; no presentamos cifras hasta octubre como si estuvieran completas.',
 'findings':[
 finding('ESTADÍSTICAS · ENERO–JULIO','12.174 denuncias policiales en 2026','El mismo reporte SIDPOL registra 16.202 en enero–julio de 2025: una variación de −24,86%. Incluye extorsión y extorsión agravada.','Cifras provisionales. Menos denuncias no prueba menor victimización ni eficacia causal de bancos o telcos.','STAT2026-S01'),
 finding('BANCA · MAYO 2026','Campaña contra el préstamo de cuentas','Mininter y gremios financieros anunciaron una campaña para prevenir que terceros presten cuentas y billeteras al crimen organizado.','La campaña prueba una acción anunciada; no mide pagos evitados ni tiempos de congelamiento.','B01'),
 finding('BANCA · AGOSTO 2026','Convenio SBS–Ministerio Público','Se anunció cooperación para investigaciones, intercambio de información y capacitación, incluyendo la extorsión.','Se verificó el anuncio, no resultados concretos ni acceso irrestricto a movimientos.','B03'),
 finding('TELECOM · JULIO 2026','Verificación del límite de siete líneas','OSIPTEL anunció una norma con sistema centralizado y seis meses de adecuación para operadoras.','Al 22 de octubre no habían transcurrido seis meses desde el anuncio; no se infiere implementación completa.','TEL26-S02'),
 finding('eSIM · JULIO 2026','Una mención policial que exige más pruebas','Mininter mencionó tres eSIM junto a anotaciones de presunta extorsión en un operativo en San Martín de Porres.','Sin proveedor, aplicación, peritaje ni vínculo probado con amenazas. La propia nota no explica técnicamente el término eSIM.','TEL26-S05'),
 finding('COBROS · PUBLICADO EN FEBRERO 2026','Publicación de 2026, hechos de 2025','Una nota judicial de Ucayali describe cuentas bancarias, Plin y retiro en cajero según una declaración investigada.','No se incorpora a un conteo de hechos de 2026. Es una medida cautelar, no una condena ni prueba contra el banco.','B04')
 ]})
items=[]
def hypothesis(id,status,label,statement,assessment,support,counter,required,ids):
 items.append(dict(id=id,status_code=status,status_label=label,statement=statement,assessment=assessment,support=support,counterevidence=counter,required_evidence=required,sources=[ref(i) for i in ids]))
hypothesis('H01','supported','Respaldada: existencia','No todo cobro extorsivo se realiza en efectivo.','Hay casos públicos con depósitos, Yape y Plin. No tenemos una distribución nacional por canal.','Los cinco casos de la base y el dosier bancario documentan distintos mecanismos.','Una muestra intencional no estima qué canal concentra más dinero o víctimas.','Una muestra representativa con medios, montos, periodos y denominador.',['S13','S15','B04'])
hypothesis('H02','partial','Respaldo parcial','Las fallas de identificación dificultan seguir a los extorsionadores.','OSIPTEL documenta problemas de trazabilidad y antecedentes sancionadores. Falta medir el efecto específico en extorsión.','Diagnóstico regulatorio y sanciones administrativas por contratación y Renteseg.','Las cifras mezclan delitos y periodos; no prueban complicidad ni el efecto de cada falla.','Vincular infracción, línea, expediente, daño y respuesta, con comparación temporal.',['TEL26-S01','TEL26-S03'])
hypothesis('H03','unknown','No demostrada','Los bancos, telcos o sus dueños toleran deliberadamente la extorsión.','El uso de un servicio para delinquir y la existencia de obligaciones no acreditan por sí solos tolerancia consciente o responsabilidad penal.','Los canales formales aparecen en casos y existen deberes de identificación y prevención.','Hay campañas, normas, convenios y sanciones. Contradicen la ausencia absoluta de acción, pero no prueban que la respuesta sea suficiente.','Alertas recibidas, decisiones, incumplimientos acreditados, conocimiento y conducta de cada responsable.',['S04','B01','B03','TEL26-S03'])
hypothesis('H04','unknown','Efecto no medido','Cerrar cuentas y líneas reduce o termina la extorsión.','Es una intervención plausible; esta revisión no obtuvo una evaluación causal peruana que demuestre cuánto reduce el delito.','Existen procedimientos de inmovilización y baja de líneas.','Bloqueos, capacitaciones y menos denuncias no prueban por sí solos que cesen amenazas o cobros.','Fechas de bloqueo, fondos inmovilizados, reincidencia, sustitución de canales y un grupo de comparación.',['S05','S06','B03'])
hypothesis('H05','partial','Indicio limitado','Aplicaciones de eSIM participan en extorsiones en Perú.','Hay una mención policial puntual a eSIM; no permite atribuir participación a una aplicación o proveedor.','El operativo de julio de 2026 menciona tres eSIM.','No hay identificación del proveedor, peritaje ni vínculo demostrado con mensajes. Republicar la misma nota no es corroboración independiente.','Peritaje, servicio contratado, proveedor, uso concreto y respuesta a requerimientos.',['TEL26-S05','TEL26-S06','TEL26-S08'])
hypothesis('H06','unknown','No es prueba automática','El titular de la cuenta es necesariamente el autor de la extorsión.','Titularidad, control efectivo, conocimiento y participación deben distinguirse en cada investigación.','La recepción de dinero puede ser un elemento de investigación.','Las notas describen cuentas de terceros y decisiones cautelares distintas; una medida preventiva no es una sentencia.','Evidencia de control, comunicaciones, destino de fondos y resolución judicial pertinente.',['S13','B04'])
write('hipotesis',{'reviewed_at':'2026-10-22','method':'Contraste editorial: respaldo, contraevidencia o límite, y prueba pendiente. No equivale a fallo judicial.','items':items})
write('traza_tareas',{'reviewed_at':'2026-10-22','requested_through':'2026-10-22','method':'Tres agentes investigaron en paralelo estadísticas, cobros y comunicaciones. La integración editorial distingue hechos, anuncios, normas e hipótesis. Una fuente repetida no se cuenta como evidencia independiente. Las trazas detalladas incluyen búsquedas y accesos fallidos.', 'tasks':[
 {'id':'T01','title':'Estadísticas oficiales 2026','status':'Verificada hasta julio','result':'Lectura del PDF SIDPOL y control de las 26 filas: 16.202 / 12.174. Catálogo septiembre localizado, archivo pendiente de acceso.','output':'research/2026-10-22/estadisticas_2026.json','trace':'research/2026-10-22/traza_estadisticas.json'},
 {'id':'T02','title':'Cobros, banca y billeteras','status':'Investigación completada','result':'Seis fuentes y seis hallazgos; caso adicional de hechos 2025 publicado2026. Se distinguen actividades institucionales de impacto.','output':'research/2026-10-22/cobros_banca.json','trace':'research/2026-10-22/traza_banca.json'},
 {'id':'T03','title':'Comunicaciones, telcos y eSIM','status':'Investigación completada','result':'Nueve fuentes y ocho hallazgos. Se separan diagnóstico, norma, sanción, denuncia de tercero e indicio policial.','output':'research/2026-10-22/comunicaciones_telco.json','trace':'research/2026-10-22/traza_telecom.json'},
 {'id':'T04','title':'Contraste e integración editorial','status':'Integrado','result':'Seis hipótesis evaluadas, fechas y límites visibles, datos y trazas descargables. Publicación y comprobaciones técnicas registradas en GitHub Actions.','output':'data/hipotesis.json'}],
 'publication_audit_url':'https://github.com/unimauro/extorsion-peru/actions','plan':'research/2026-10-22/plan.json'})
manifest=read(root/'data/manifest.json')
manifest.update(version='1.1.0',statistical_period='2019–2025 completos; enero–julio2026 separado',statistical_2026_updated_at='2026-07-31',research_directory='research/2026-10-22',hypotheses_file='data/hipotesis.json')
write('manifest',manifest)
print('Consolidados: actualización 2026, seis hipótesis, traza y manifiesto.')
observed=stat['hallazgos'][0]['conteo']
baseline=next(x for x in read(root/'data/serie_anual.json') if x['year']==2025)['complaints']
monthly=observed/7
write('proyeccion_2026',{
 'reviewed_at':'2026-10-22','observed_cutoff':'2026-07-31','observed_months':7,'unobserved_months':5,
 'observed_complaints':observed,'observed_monthly_average':monthly,
 'baseline_2025_annual':baseline,'baseline_source_id':'S01','observed_source_url':stat['fuentes'][0]['url'],
 'method':'Escenarios aritméticos: observado enero–julio + (promedio mensual enero–julio × multiplicador × 5 meses agosto–diciembre).',
 'formula':'12174 + (12174 / 7) * multiplier * 5',
 'not_a_forecast':True,'confidence_interval':None,
 'limitations':['Agosto–diciembre se simulan por falta de conteo verificado, incluso los meses que ya transcurrieron al revisar el sitio.','Supone ritmo mensual constante dentro del tramo simulado. No ajusta estacionalidad, subregistro, cambios legales ni revisiones de SIDPOL.','Los escenarios no tienen probabilidades asignadas ni constituyen un intervalo de confianza.','El referente anual2025 procede de otra edición. La comparación es orientativa y no acredita equivalencia de clasificación con el reporte parcial2026.','Se proyectan denuncias registradas, no el total real de extorsiones ni víctimas.'],
 'scenarios':[{'multiplier':m,'projected_annual':round(observed+monthly*m*5),'simulated_remaining':round(monthly*m*5)} for m in [0.5,1,1.5,2,3,5]],
 'doubling_2025_reference':{'target':baseline*2,'required_aug_dec_total':baseline*2-observed,'required_monthly_average':(baseline*2-observed)/5,'required_multiplier':(baseline*2-observed)/5/monthly},
 'regions_linear':[{'region':r['region'],'observed_2026':r['enero_julio_2026'],'observed_2025_same_period':r['enero_julio_2025'],'same_period_change_pct':r['variacion_porcentual_calculada'],'projected_2026_constant_pace':round(r['enero_julio_2026']/7*12)} for r in stat['regiones']['filas']]
})
