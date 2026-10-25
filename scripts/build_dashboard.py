"""Compone data/dashboard.json a partir de los dosieres de investigación y de la capa editorial del dashboard."""
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
research = root / 'research/2026-10-22'
load = lambda p: json.loads(p.read_text(encoding='utf-8'))

legal = load(research / 'mapa_legal.json')
resolved = load(research / 'casos_resueltos.json')
tracing = load(research / 'rastreo_tecnico.json')
banks_dossier = load(research / 'bancos_billeteras.json')
base_cases = load(root / 'data/casos.json')
update = load(root / 'data/actualizacion_2026.json')

# Agrupa medios de pago con nombres comparables entre fichas antiguas y nuevas.
PAYMENT = {'Transferencia bancaria': 'Cuenta bancaria', 'Depósito bancario': 'Cuenta bancaria', 'Retiro en efectivo': 'Efectivo'}

def base_case(c):
    extra = resolved['base_case_tags'][c['id']]
    return {
        'id': c['id'], 'title': c['title'], 'published_at': c['published_at'], 'region': c['region'], 'modality': c['modality'],
        'channel': ', '.join(c['communication_channels']), 'payment_methods': sorted({PAYMENT.get(p, p) for p in c['payment_methods']}),
        'tags': extra['tags'], 'techniques': [], 'speed_days': None, 'speed_kind': None, 'time_note': c['event_date_precision'],
        'outcome': c['procedural_stage'] + ('' if c['final_judgment_confirmed'] else '; firmeza no verificada'),
        'sentence_years': extra['sentence_years'], 'detainees': extra['detainees'], 'demanded_pen': c['demanded_pen'], 'paid_pen': c['paid_pen'],
        'summary': c['summary'], 'source_url': c['source_url'], 'evidence_locator': c['evidence_locator'], 'verification': 'leído', 'limitations': c['limitations'],
    }

AREA = {
    'const-2-5': 'Finanzas', 'const-2-10': 'Comunicaciones', 'dl-1182': 'Comunicaciones', 'cpp-230': 'Comunicaciones', 'cpp-230a': 'Comunicaciones',
    'cpp-231': 'Comunicaciones', 'cpp-232-234': 'Proceso penal', 'cpp-235': 'Finanzas', 'cpp-209-259-266': 'Proceso penal', 'cpp-340': 'Proceso penal',
    'cpp-341': 'Proceso penal', 'cpp-247-248': 'Víctimas', 'ley-27697': 'Comunicaciones', 'dl-1218': 'Cámaras', 'dl-1338': 'Comunicaciones',
    'dl-1723': 'Comunicaciones', 'ley-30077': 'Organización', 'ley-30096': 'Proceso penal', 'cp-200': 'Penas', 'cp-200a': 'Penas', 'dl-1735': 'Organización',
    'ley-32490': 'Organización', 'ley-32348': 'Organización', 'psav': 'Finanzas', 'ley-32209': 'Finanzas', 'dl-1732': 'Finanzas',
    'osiptel-lineas': 'Comunicaciones', 'ds-016-2024-jus': 'Datos personales',
}
# Completa normas que el dosier legal dejó sin URL con las fuentes oficiales ya leídas en dosieres previos.
FILL = {
    'ley-32209': {'url': 'https://leyes.congreso.gob.pe/Documentos/2021_2026/ADLP/Texto_Consolidado/32209-TXM.pdf', 'deadline': 'PNP pide a la UIF dentro de 24 h de recibir la información; fiscal informado en 24 h; juez convalida o revoca en 24 h (guía RM 1636-2025-IN)', 'verification': 'leído (dosier financiero y guía RM 1636-2025-IN)'},
    'dl-1732': {'url': 'https://busquedas.elperuano.pe/dispositivo/NL/2486266-6', 'verification': 'leído (dosier financiero)', 'who_requests': 'Autoridades acreditadas (PNP, Ministerio Público, entre otras, según la norma)'},
    'osiptel-lineas': {'url': 'https://www.osiptel.gob.pe/portal-del-usuario/noticias/osiptel-empresas-operadoras-estan-obligadas-a-verificar-tope-de-7-lineas-moviles-de-personas-naturales-durante-contratacion/', 'verification': 'leído (dosier telecom)'},
    'ds-016-2024-jus': {'url': 'https://www3.congreso.gob.pe/Docs/DGP/DIDP/files/ds_016-2024-jus.pdf', 'locator': 'Artículo V; artículo 40', 'verification': 'leído (dosier de respuesta rápida)'},
}

def law(l):
    row = {**l, **FILL.get(l['id'], {}), 'type': 'vigente', 'area': AREA[l['id']]}
    if not str(row.get('url', '')).startswith('https://'):
        row['url'] = None
    return row

laws = [law(l) for l in legal['laws']]
laws += [{'id': f'bill-{i+1}', 'name': b['name'], 'type': 'proyecto', 'area': 'Proyectos', 'short': b['status'], 'what_it_enables': b['note'],
          'who_requests': '—', 'who_decides': 'Congreso', 'deadline': 'Sin plazo', 'needs_judge': 'no aplica', 'url': b['url'], 'locator': b['status'],
          'verification': 'indexado', 'limitations': 'Un proyecto no es ley; verificar su estado antes de citarlo.'} for i, b in enumerate(legal['bills'])]

CAPABILITIES = [
    {'id': 'detener', 'label': 'Detener en flagrancia'},
    {'id': 'geoloc', 'label': 'Ubicar el celular'},
    {'id': 'comunicaciones', 'label': 'Intervenir comunicaciones'},
    {'id': 'celular', 'label': 'Revisar celular del detenido'},
    {'id': 'lineas', 'label': 'Dar de baja líneas o IMEI'},
    {'id': 'congelar', 'label': 'Congelar fondos'},
    {'id': 'bancario', 'label': 'Movimientos bancarios'},
    {'id': 'titularidad', 'label': 'Titular de la cuenta'},
    {'id': 'camaras', 'label': 'Obtener videos'},
    {'id': 'encubierta', 'label': 'Entrega vigilada o agente encubierto'},
    {'id': 'proteccion', 'label': 'Proteger a la víctima'},
]
# ok: decide por sí mismo · conv: actúa de urgencia y luego convalida un juez · orden: solicita y otra autoridad decide
# ejecuta: cumple por deber legal lo que otra autoridad ordena · no: no le corresponde
MATRIX = {
    'pnp-investigador': {'detener': 'ok', 'geoloc': 'conv', 'comunicaciones': 'orden', 'celular': 'orden', 'lineas': 'orden', 'congelar': 'orden', 'bancario': 'orden', 'titularidad': 'orden', 'camaras': 'ok', 'encubierta': 'orden', 'proteccion': 'ejecuta'},
    'pnp-unidad-especializada-telecom': {'geoloc': 'conv', 'comunicaciones': 'ejecuta'},
    'pnp-divindat': {'detener': 'ok', 'comunicaciones': 'orden', 'celular': 'orden', 'encubierta': 'orden'},
    'fiscal-flagrancia-turno': {'detener': 'orden', 'geoloc': 'conv', 'comunicaciones': 'orden', 'celular': 'ok', 'lineas': 'orden', 'bancario': 'orden', 'titularidad': 'orden', 'camaras': 'ok', 'encubierta': 'ok', 'proteccion': 'ok'},
    'juez-ip': {'detener': 'ok', 'geoloc': 'ok', 'comunicaciones': 'ok', 'celular': 'ok', 'lineas': 'orden', 'congelar': 'ok', 'bancario': 'ok', 'proteccion': 'ok'},
    'perito': {'comunicaciones': 'ejecuta', 'celular': 'ejecuta', 'camaras': 'ejecuta'},
    'operadora-requerimientos': {'geoloc': 'ejecuta', 'comunicaciones': 'ejecuta', 'lineas': 'ejecuta'},
    'osiptel': {'lineas': 'ok'},
    'analista-uif': {'congelar': 'ok', 'bancario': 'ok', 'titularidad': 'ok'},
    'oficial-cumplimiento': {'congelar': 'ejecuta', 'bancario': 'ejecuta', 'titularidad': 'ejecuta'},
    'udavit': {'proteccion': 'ejecuta'},
    'municipal-cctv': {'camaras': 'ejecuta'},
    'titular-camara-privada': {'camaras': 'ejecuta'},
}
PROFILE = {
    'pnp-investigador': 'Investigador de campo, de turno 24/7',
    'pnp-unidad-especializada-telecom': 'Analista de telecomunicaciones',
    'pnp-divindat': 'Analista digital y ciberpolicía',
    'fiscal-flagrancia-turno': 'Abogado fiscal que conduce la investigación',
    'juez-ip': 'Magistrado de garantías',
    'perito': 'Especialista forense certificado',
    'operadora-requerimientos': 'Equipo legal y técnico privado',
    'analista-uif': 'Analista de inteligencia financiera',
    'oficial-cumplimiento': 'Responsable de prevención de lavado',
    'udavit': 'Psicólogos, abogados y trabajadores sociales',
    'municipal-cctv': 'Operadores de cámaras y serenazgo',
}
roles = [{**r, 'matrix': MATRIX.get(r['id'], {}), 'profile': PROFILE.get(r['id'])} for r in legal['roles']]

# Propuesta: máximo legal de 4 horas desde la denuncia. Cada etapa compara el plazo vigente (legal_max_h)
# con el máximo que proponemos fijar por norma (end_h). legal_max_h es None cuando hoy no hay plazo.
# blocking=False marca controles que corren después sin frenar la intervención.
# automation: 'auto' lo hace el sistema; 'asistido' el sistema prepara y una persona competente aprueba; 'humano' requiere personas.
TARGET_H = 4
ROUTE = [
    {'id': 'denuncia', 'clock': '0:00–0:30', 'start_h': 0, 'end_h': 0.5, 'legal_max_h': None, 'current': 'sin plazo', 'blocking': True, 'automation': 'asistido', 'title': 'Denuncia y pedidos', 'who': 'Víctima, policía de guardia, fiscal de turno', 'deadline_type': 'propuesta',
     'actions': ['La víctima denuncia por la Línea 111, el 105, una comisaría o un canal digital, y sube capturas, audios y comprobantes.', 'El sistema extrae números, billeteras, montos y horas; un policía de guardia los confirma y evalúa el riesgo.', 'El policía firma digitalmente los pedidos de ubicación, congelamiento, videos y titularidad, que salen a la vez; el fiscal recibe copia.', 'La línea extorsiva no se da de baja todavía: mientras siga activa ayuda a ubicar al autor.'],
     'law_ids': ['cpp-247-248', 'cp-200a', 'dl-1735', 'ley-32209'], 'note': 'Propuesta: máximo de 30 minutos desde la denuncia para validar y enviar los pedidos. Hoy la PNP tiene hasta 24 h para pedir el congelamiento.', 'reform': 'R1'},
    {'id': 'ubicar', 'clock': '0:30–1:30', 'start_h': 0.5, 'end_h': 1.5, 'legal_max_h': 24, 'current': '24 h', 'blocking': True, 'automation': 'auto', 'title': 'Ubicar el celular', 'who': 'Unidad especializada, operadora', 'deadline_type': 'propuesta',
     'actions': ['La operadora entrega antena, sector y localización por un canal automatizado.', 'Propuesta: máximo 1 h desde que recibe el pedido, en lugar de 24 h.', 'Si el número es extranjero o de internet, la operadora entrega lo que tenga de la ruta de entrada y el sistema prioriza dinero y cámaras.'],
     'law_ids': ['dl-1182', 'cpp-230'], 'note': 'Requiere modificar el DL 1182 (rango de ley): Congreso o facultades delegadas.', 'reform': 'R2'},
    {'id': 'dinero', 'clock': '0:30–2:00', 'start_h': 0.5, 'end_h': 2, 'legal_max_h': 24, 'current': '24 h', 'blocking': True, 'automation': 'asistido', 'title': 'Congelar el dinero', 'who': 'Analista UIF, banco o billetera', 'deadline_type': 'propuesta',
     'actions': ['Un analista de la UIF de guardia decide en máximo 1 h (hoy no tiene plazo); esa decisión no se automatiza.', 'El banco o la billetera retiene el saldo en máximo 30 minutos desde la orden electrónica.', 'El juez sigue convalidando o revocando en 24 h; si revoca, el dinero se libera en el día.'],
     'law_ids': ['ley-32209', 'cpp-235'], 'note': 'Hoy la UIF no tiene plazo para decidir. Los plazos están en el reglamento (DS 020-2017-JUS, modificado por el DS 007-2025-JUS): el Ejecutivo puede fijarlos, aunque conviene hacerlo por ley.', 'reform': 'R3'},
    {'id': 'videos', 'clock': '0:30–1:30', 'start_h': 0.5, 'end_h': 1.5, 'legal_max_h': 24, 'current': '24 h', 'blocking': True, 'automation': 'auto', 'title': 'Asegurar los videos', 'who': 'Sistema, municipios, comercios, bancos', 'deadline_type': 'propuesta',
     'actions': ['El sistema avisa a las cámaras registradas en la zona y a la hora del hecho.', 'Propuesta: entrega en máximo 1 h en casos de extorsión, en lugar de 24 h.', 'Se pide el video del cajero o agente a la hora exacta del retiro.'],
     'law_ids': ['dl-1218', 'ley-32490'], 'note': 'El plazo de 24 h está en el reglamento DS 007-2020-IN, art. 17: lo puede cambiar el Ejecutivo.', 'reform': 'R4'},
    {'id': 'titular', 'clock': '0:30–2:30', 'start_h': 0.5, 'end_h': 2.5, 'legal_max_h': 72, 'current': '3 días hábiles', 'blocking': True, 'automation': 'auto', 'title': 'Identificar al titular de la cuenta', 'who': 'SBS, entidades financieras', 'deadline_type': 'propuesta',
     'actions': ['Consulta de titularidad financiera de la cuenta receptora y de otras cuentas del mismo titular.', 'Propuesta: máximo 2 h cuando hay extorsión en curso, en lugar de 3 días hábiles.', 'El titular formal no es necesariamente el autor: se investiga quién controla la cuenta.'],
     'law_ids': ['dl-1732'], 'note': 'El plazo de 3 días hábiles está en la Res. SBS 01586-2026, art. 7.4: la SBS puede acortarlo. Hoy la consulta no acepta números de celular, así que no cubre bien Yape o Plin (reforma R6). Se dibuja 3 días hábiles como 72 h.', 'reform': 'R5'},
    {'id': 'captura', 'clock': '2:00–4:00', 'start_h': 2, 'end_h': 4, 'legal_max_h': 72, 'current': '72 h de flagrancia', 'blocking': True, 'automation': 'humano', 'title': 'Entrega controlada y captura', 'who': 'Fiscal, PNP', 'deadline_type': 'meta',
     'actions': ['Con ubicación, dinero congelado y videos, el fiscal autoriza una entrega vigilada en el siguiente contacto del extorsionador.', 'Captura en flagrancia; en extorsión la flagrancia por identificación dura 72 h, así que no se pierde si el operativo toma más.', 'Revisión inmediata del celular del detenido con autorización fiscal (art. 230-A).'],
     'law_ids': ['cpp-340', 'cpp-209-259-266', 'cpp-230a', 'cp-200a'], 'note': 'Esto no puede ser plazo legal: la captura depende de que el extorsionador vuelva a contactar o cobrar. Es meta operativa.', 'reform': None},
    {'id': 'control', 'clock': '4–72 h', 'start_h': 4, 'end_h': 72, 'legal_max_h': 72, 'current': '24 + 24 + 24 h', 'blocking': False, 'automation': 'humano', 'title': 'Control judicial y cierre de líneas', 'who': 'Juez, fiscal, OSIPTEL, operadoras', 'deadline_type': 'legal',
     'actions': ['El juez convalida la geolocalización y el congelamiento. Corre en paralelo: no frena lo anterior.', 'No proponemos acortarlo: es la garantía contra errores y suplantaciones.', 'Ya con el autor identificado, OSIPTEL ordena dar de baja las líneas y bloquear los IMEI.'],
     'law_ids': ['dl-1182', 'ley-32209', 'cpp-209-259-266', 'dl-1338'], 'note': 'Si el titular no era el autor, se revoca y se libera el dinero.', 'reform': None},
    {'id': 'red', 'clock': '3–15 días', 'start_h': 72, 'end_h': 360, 'legal_max_h': None, 'current': 'sin plazo', 'blocking': False, 'automation': 'humano', 'title': 'Llegar a la red', 'who': 'Fiscalía especializada, peritos, UIF', 'deadline_type': 'meta',
     'actions': ['Seguir la cadena de cuentas mula y los números de otras víctimas hallados en los equipos.', 'Prisión preventiva o proceso inmediato; si hay organización, fiscalía especializada y técnicas especiales.'],
     'law_ids': ['ley-30077', 'ley-32348', 'cpp-341'], 'note': 'Desarticular organizaciones completas tomó de 8 a 25 meses en los casos documentados; aquí no se promete ese plazo.', 'reform': None},
]

TAPE = [
    {'v': '1 h', 'max': '24 h', 't': 'para ubicar el celular', 'law': 'dl-1182'},
    {'v': '1 h 30', 'max': '24 h', 't': 'para congelar la cuenta', 'law': 'ley-32209'},
    {'v': '1 h', 'max': '24 h', 't': 'para entregar los videos', 'law': 'dl-1218'},
    {'v': '2 h', 'max': 'hasta 3 días hábiles', 't': 'para identificar al titular', 'law': 'dl-1732'},
    {'v': '4 h', 'max': 'hasta 3 días', 't': 'máximo legal total que proponemos', 'law': 'dl-1735'},
]

AUTOMATION = [
    {'level': 'auto', 'title': 'Leer las capturas y comprobantes', 'text': 'Extraer números, billeteras, montos y horas de las imágenes que sube la víctima. Una persona confirma cada dato.'},
    {'level': 'auto', 'title': 'Armar y enviar los pedidos', 'text': 'Formularios llenados con los datos confirmados y enviados a la vez, con firma digital, acuse de recibo y hora registrada.'},
    {'level': 'auto', 'title': 'Recibir la ubicación y la titularidad', 'text': 'Canales automatizados con operadoras y entidades financieras, como el que el CPP ya prevé para intervenciones judiciales.'},
    {'level': 'auto', 'title': 'Avisar a las cámaras cercanas', 'text': 'Aviso de preservación a las cámaras registradas en la zona y a la hora del hecho, antes de que se sobrescriban.'},
    {'level': 'auto', 'title': 'Contar el plazo de 4 horas', 'text': 'Reloj por expediente, alertas al jefe de guardia cuando un paso se atrasa y registro de quién incumplió y por qué.'},
    {'level': 'asistido', 'title': 'Validar la denuncia', 'text': 'Un policía de guardia confirma coherencia y riesgo. Sin esa validación no sale ningún pedido.'},
    {'level': 'asistido', 'title': 'Decidir el congelamiento', 'text': 'El analista de la UIF decide con lo que el sistema le muestra; luego un juez convalida o revoca.'},
    {'level': 'humano', 'title': 'Autorizar la entrega controlada y capturar', 'text': 'El fiscal autoriza y la policía interviene en el terreno. Ningún sistema detiene a nadie.'},
    {'level': 'humano', 'title': 'Identificar a una persona en video o por la voz', 'text': 'Son pericias con margen de error; nunca una coincidencia automática basta para detener.'},
]

# Reformas para que 4 horas sea plazo legal y no solo meta. 'who' indica quién puede aprobar el cambio.
REFORMS = [
    {'id': 'R1', 'step': 'Validar la denuncia y enviar los pedidos', 'today': 'Sin plazo; la guía de la PNP da 24 h al oficial de enlace para pedir el congelamiento', 'proposed': '30 min', 'instrument': 'Guía RM 1636-2025-IN (paso 5) y protocolo PNP–Ministerio Público del DL 1735', 'who': 'Mininter, PNP y Ministerio Público', 'tier': 'administrativo'},
    {'id': 'R2', 'step': 'Ubicar el celular', 'today': '24 h para la operadora (DL 1182, art. 4.3, texto de la Ley 31284)', 'proposed': '1 h, e incluir números extranjeros y de internet en lo que la operadora tenga', 'instrument': 'DL 1182, art. 4.3 (rango de ley)', 'who': 'Congreso, o el Ejecutivo con la delegación de facultades aprobada el 21-10-2026 (aún sin publicar), que según el Mininter apunta a modificar el DL 1182', 'tier': 'ley'},
    {'id': 'R3', 'step': 'Congelar el dinero', 'today': 'La UIF no tiene plazo para decidir; la entidad informa la ejecución en 24 h; el juez resuelve en 24 h', 'proposed': 'UIF decide en 1 h; el banco retiene en 30 min; el juez sigue con 24 h', 'instrument': 'Reglamento de la Ley 27693 (DS 020-2017-JUS), arts. 8-A a 10-A incorporados por el DS 007-2025-JUS', 'who': 'Poder Ejecutivo por decreto supremo; mejor por ley para que el plazo tenga rango legal', 'tier': 'reglamento'},
    {'id': 'R4', 'step': 'Entregar los videos', 'today': '24 h si el hecho se descubre después; la ley ya dice "de manera inmediata"', 'proposed': '1 h en extorsión', 'instrument': 'DS 007-2020-IN, art. 17.1.b (reglamento del DL 1218)', 'who': 'Poder Ejecutivo', 'tier': 'reglamento'},
    {'id': 'R5', 'step': 'Identificar al titular de la cuenta', 'today': 'Hasta 3 días hábiles; responde solo si la persona es cliente o no', 'proposed': '2 h, en tiempo real como pide el propio DL 1732', 'instrument': 'Res. SBS 01586-2026, art. 7.4', 'who': 'SBS, por resolución', 'tier': 'administrativo'},
    {'id': 'R6', 'step': 'Consultar por número de celular (Yape, Plin)', 'today': 'La consulta no acepta números de celular y deja fuera a emisores de dinero electrónico; solo para lavado y delitos precedentes', 'proposed': 'Aceptar el número de la billetera y cubrir a todos los emisores en casos de extorsión', 'instrument': 'DL 1732, arts. 3 y 5', 'who': 'Congreso o Ejecutivo con facultades delegadas', 'tier': 'ley'},
    {'id': 'R7', 'step': 'Plazo total y garantías', 'today': 'No existe un plazo total', 'proposed': '4 h desde la denuncia; registro de tiempos; liberación en el día si el juez revoca; sanción por denuncia falsa (CP art. 402)', 'instrument': 'Ley nueva de plazos de respuesta en extorsión', 'who': 'Congreso', 'tier': 'ley'},
    {'id': 'R8', 'step': 'Retención automática del monto denunciado (opcional)', 'today': 'No existe: ninguna norma permite al banco retener por una denuncia de extorsión', 'proposed': 'Retener solo el monto denunciado por máximo 4 h tras la validación policial; se libera sola si la UIF no confirma', 'instrument': 'Ley nueva (la Constitución exige ley para restringir la propiedad)', 'who': 'Congreso', 'tier': 'ley'},
    {'id': 'R9', 'step': 'Transparencia por banco y billetera', 'today': 'Nadie publica cuántas cuentas de cada entidad se denunciaron, congelaron o cerraron por extorsión', 'proposed': 'Reporte trimestral por entidad: cuentas reportadas, congeladas, cerradas y horas hasta ejecutar la orden', 'instrument': 'Resolución SBS (Reglamento de Gestión de Riesgos LA/FT)', 'who': 'SBS', 'tier': 'administrativo'},
]

# Sin estas condiciones, un máximo de 4 horas se incumpliría desde el primer día.
REQUIREMENTS = [
    {'level': 'Capacidad antes de exigir', 'who': 'PNP, Ministerio Público, UIF', 'items': [
        'Guardia 24/7 en la unidad de geolocalización, la UIF y la fiscalía de turno.',
        'Expediente digital que lea las capturas, arme los pedidos y los envíe con firma digital.',
        'Presupuesto y personal asignados por la ley, no solo el plazo.']},
    {'level': 'Integración técnica', 'who': 'Operadoras, bancos y billeteras, municipios', 'items': [
        'Canal automatizado con cada operadora para geolocalización.',
        'Órdenes electrónicas de la UIF a bancos y billeteras, con retención automática del saldo.',
        'Registro de cámaras y acceso en tiempo real a las centrales municipales.']},
    {'level': 'Entrada en vigor escalonada', 'who': 'Congreso y Poder Ejecutivo', 'items': [
        'Piloto de 90 días en una región con mucha extorsión para medir tiempos reales.',
        'Todos los plazos máximos rigen a los 180 días, cuando los canales estén operativos.',
        'Publicación mensual de la mediana y el percentil 95 de cada paso.']},
]

LIMITS = [
    {'title': 'Un número o una cuenta son pistas, no culpables', 'text': 'Las líneas y cuentas suelen estar a nombre de terceros: chips registrados en lote, cuentas prestadas o alquiladas, identidades suplantadas. Hay que probar quién las controla.'},
    {'title': 'WhatsApp no se puede leer', 'text': 'El cifrado de extremo a extremo impide acceder al contenido. Los datos de cuenta llegan en horas solo ante riesgo vital; por la vía ordinaria, en semanas o meses.'},
    {'title': 'El reconocimiento facial falla con video de calle', 'text': 'En Lima, entre 2017 y 2019, se resolvió el 3,6% de los pedidos de identificación facial con cámaras municipales. Una coincidencia automática nunca basta para detener.'},
    {'title': 'La voz se puede clonar', 'text': 'Los detectores de voz sintética generalizan mal. Un audio es prueba de apoyo, nunca prueba única.'},
    {'title': 'Automatizar no es decidir solo', 'text': 'Una denuncia falsa podría usarse para congelar la cuenta de un inocente. Por eso ningún pedido sale sin validación humana, la UIF decide caso por caso, un juez revisa en 24 h y cada acción queda registrada con su autor.'},
    {'title': 'Rápido con control judicial', 'text': 'La geolocalización, el congelamiento y la revisión del celular avanzan sin esperar, pero un juez convalida en 24 h. Ese control evita bloquear a víctimas de suplantación.'},
    {'title': 'Una ley no basta si no se implementa', 'text': 'El subsistema especializado contra la extorsión (DL 1735) depende de presupuesto y no se verificó que su protocolo y su banco de datos estén operativos.'},
    {'title': 'Las cifras oficiales no siempre cuadran', 'text': ' '.join(w['text'] for w in resolved['data_quality_warnings'])},
    {'title': 'Una muestra, no una estadística', 'text': 'Los casos son una selección intencional de respuestas que funcionaron. No dicen qué proporción de extorsiones se resuelve.'},
    {'title': 'Sin vigilancia masiva ni listas públicas', 'text': 'El proyecto no propone puntuar personas por antecedentes ni publicar sospechosos. Las medidas se piden caso por caso, con competencia y autorización.'},
]


# Bancos y billeteras: solo datos con fuente; lo que no se publica se muestra como vacío, no como cero.
UIF_REPORT = 'https://www.sbs.gob.pe/Portals/0/INFORME%20N%2000001%20%202026%20%20UIFSBSPRI.pdf'
BANKS = {
    'ranking_exists': banks_dossier['official_ranking_exists'],
    'verdict': 'Hay leyes que obligan a los bancos y algunas medidas anunciadas, pero ninguna entidad publica cuántas cuentas de extorsión detectó, congeló o cerró. Con datos públicos no se puede probar que no hagan nada; sí que no rinden cuentas.',
    'figures': [
        {'v': '0', 'l': 'rankings oficiales de extorsión por banco o billetera', 'd': 'Ni PNP, Fiscalía, UIF, SBS, Indecopi ni Congreso publican datos por entidad.', 'url': UIF_REPORT},
        {'v': 'S/ 1,39 M', 'l': 'congelados por la UIF con la PNP en casos de extorsión, sicariato y secuestro', 'd': 'Más US$ 73 171, 87 bienes y 14 billeteras cripto, acumulado al 31/05/2026. Sin decir en qué bancos.', 'url': UIF_REPORT},
        {'v': '8 de 144', 'l': 'congelamientos convalidados desde 2016 los pidió la Policía', 'd': 'Todos los delitos, enero 2016 a mayo 2026.', 'url': UIF_REPORT},
        {'v': '453', 'l': 'cuentas intervenidas en casos de extorsión y sicariato', 'd': 'Declaración de la UIF, octubre 2025. Sin desglose por entidad.', 'url': 'https://gestion.pe/tu-dinero/uif-empieza-a-congelar-bienes-de-personas-y-empresas-por-lavado-de-dinero-de-extorsiones-3-claves-lavado-de-dinero-de-extorsiones-lavado-de-activos-uif-congela-bienes-por-extorsiones-sbs-bancos-noticia/'},
    ],
    # Agrupa el medio de pago de cada caso documentado por la entidad que lo opera.
    'entity_of': {'Yape': 'Yape (BCP)', 'Plin': 'Plin (BBVA, Interbank y otros)', 'Cuenta bancaria': 'Banco no informado', 'Efectivo': 'Efectivo', 'No informado': 'Medio no informado', 'Sin pago (tentativa)': 'Sin pago (tentativa)'},
    'scale': [
        {'entity': 'Yape (BCP)', 'metric': '16,4 millones de usuarios activos al mes (1T2026)', 'url': 'https://grupocredicorp.com/yape-alcanzo-16-4-millones-de-usuarios-activos-mensuales-consolidando-su-cobertura-a-nivel-nacional/'},
        {'entity': 'Yape frente a Plin', 'metric': '284 frente a 44 millones de operaciones en setiembre 2023 (BCRP, vía prensa)', 'url': 'https://www.peru-retail.com/plin-alcanza-a-yape-en-numero-de-usuarios-como-van-las-operaciones-y-transacciones-diarias/'},
    ],
    'scale_note': 'Yape mueve la gran mayoría de las operaciones con billetera, así que aparecer más en casos no prueba por sí solo que sea más riesgoso.',
    'scorecard': [
        {'entity': 'Yape (BCP)', 'action': 'Puede cerrar cuentas por extorsión y vetar la reafiliación (oct. 2025). Botón anónimo «Reportar extorsión» en la app (nov. 2025).', 'publishes': False, 'state': 'medida', 'url': 'https://www.infobae.com/peru/2025/11/21/yape-habilita-funcionalidad-para-reportar-a-extorsionadores-podran-cerrar-cuentas/'},
        {'entity': 'BCP, BBVA, Interbank, Scotiabank', 'action': 'Integran el mecanismo de intercambio de información con UIF, PNP y Fiscalía (desde 2024). La guía de alertas de extorsión seguía en desarrollo a junio 2026.', 'publishes': False, 'state': 'parcial', 'url': UIF_REPORT},
        {'entity': 'Plin', 'action': 'No se encontraron medidas públicas específicas contra cobros extorsivos.', 'publishes': False, 'state': 'nada', 'url': 'https://plin.pe/'},
        {'entity': 'Banco de la Nación, cajas, Bim', 'action': 'No se encontraron medidas públicas específicas. Asbanc, cajas y microfinancieras se sumaron a una campaña del Mininter contra el préstamo de cuentas (mayo 2026).', 'publishes': False, 'state': 'nada', 'url': 'https://www.gob.pe/institucion/mininter/noticias/1390775-mininter-lanza-campana-tu-cuenta-tu-responsabilidad-para-frenar-el-uso-de-cuentas-bancarias-por-el-crimen-organizado'},
    ],
    'obligations': [
        {'t': 'Congelar a pedido de la Policía', 'd': 'Ley 32209 y DS 007-2025-JUS: el banco ejecuta la orden de la UIF sin avisar al titular. No fija horas para ejecutarla.', 'law': 'Ley 32209'},
        {'t': 'Decir quién es el titular', 'd': 'DL 1732 y Res. SBS 01586-2026: responder en máximo 3 días hábiles; adecuación hasta octubre 2026.', 'law': 'Res. SBS 01586-2026'},
        {'t': 'Reportar operaciones sospechosas', 'd': 'Los bancos envían el 71% de los reportes a la UIF, pero no se publica cuántos son por extorsión.', 'law': 'Ley 27693'},
    ],
    'gaps': ['Cuántas cuentas de cada banco o billetera recibieron pagos extorsivos', 'Cuántas cerró Yape o cualquier otra entidad', 'Cuántas horas tarda un banco en ejecutar un congelamiento', 'Multas de la SBS a bancos por fallas antilavado ligadas a extorsión: ninguna encontrada'],
    'ask': 'Que la SBS obligue a publicar cada trimestre, por entidad, las cuentas reportadas, congeladas y cerradas por extorsión, y las horas hasta ejecutar cada orden (reforma R9).',
    'caveat': 'Los casos documentados son una muestra intencional: sirven para ver qué medios aparecen, no para calcular cuotas por banco.',
}

# Código INEI del departamento donde la fuente sitúa el caso, para marcarlo en el mapa.
REGION_CODE = [('Lima', '15'), ('Callao', '07'), ('Piura', '20'), ('Tumbes', '24'), ('Junín', '12'), ('Tacna', '23'), ('La Libertad', '13'), ('Arequipa', '04'), ('Huánuco', '10')]
def region_code(region):
    return next(code for name, code in REGION_CODE if region.startswith(name))

out = {
    'version': '1.0', 'reviewed_at': '2026-10-22',
    'hero_note': 'Fuentes oficiales y prensa verificada, revisión al 22/10/2026. Los casos son una muestra intencional de respuestas que funcionaron, no la tasa nacional de casos resueltos. Una prisión preventiva no es condena; las sentencias informadas no tienen firmeza verificada.',
    'ytd': {'year': 2026, 'current': 12174, 'previous': 16202, 'caveat': update['findings'][0]['limitation'], 'source_url': update['findings'][0]['source_url']},
    'payment_groups': {'Transferencia bancaria': 'Cuenta bancaria', 'Depósito bancario': 'Cuenta bancaria', 'Retiro en efectivo': 'Efectivo'},
    'cases': [{**c, 'region_code': region_code(c['region'])} for c in [base_case(c) for c in base_cases] + resolved['cases']],
    'aggregates': resolved['aggregates'],
    'target_h': TARGET_H, 'route': ROUTE, 'tape': TAPE, 'requirements': REQUIREMENTS, 'automation': AUTOMATION, 'reforms': REFORMS, 'banks': BANKS, 'bill': 'docs/propuesta_ley_4_horas.md',
    'route_note': 'Plazos propuestos por el proyecto, no vigentes. El control judicial corre después sin frenar la intervención.',
    'capabilities': CAPABILITIES, 'roles': roles, 'laws': laws,
    'tech': tracing['chains'], 'sources': tracing['sources'], 'limits': LIMITS,
    'dossiers': ['research/2026-10-22/mapa_legal.json', 'research/2026-10-22/casos_resueltos.json', 'research/2026-10-22/rastreo_tecnico.json', 'research/2026-10-22/verificacion_4_horas.json', 'research/2026-10-22/hipotesis_respuestas.json', 'research/2026-10-22/bancos_billeteras.json'],
}
(root / 'data/dashboard.json').write_text(json.dumps(out, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
print(f"data/dashboard.json: {len(out['cases'])} casos, {len(laws)} normas, {len(roles)} roles, {len(out['tech'])} cadenas")
