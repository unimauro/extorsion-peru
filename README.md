# Extorsión Perú

Investigación ciudadana sobre dinero, comunicaciones y rendición de cuentas. Autor: Carlos Mauro Cárdenas Fernández (`unimauro`).

**Web:** https://unimauro.github.io/extorsion-peru/

Edición ampliada, revisada el **22 de octubre de 2026**. La estadística principal cubre 2019–2025; los casos seleccionados son publicaciones de 2025–2026. No es un servicio de denuncia ni un registro de personas acusadas.

## Contenido

- Serie policial anual y tasas regionales del reporte INDAGA/OBNASEC publicado en julio de 2026, con advertencia sobre el cambio metodológico de 2025.
- Mapa interactivo de tasas por cada 100.000 habitantes; Lima Metropolitana y Región Lima se consultan por separado y Callao no se suma a Lima.
- Cinco casos institucionales con canales, montos, estados procesales y límites.
- Recorrido explicativo del dinero, matriz de obligaciones, políticas empresariales y resultados pendientes.
- Datos JSON/CSV, registro de 20 fuentes y pistas (no todas íntegramente verificadas), metodología, diccionario y borradores de acceso a información.
- Apoyo al autor mediante Yape y Buy Me a Coffee, procedentes de su repositorio público. No son aportes directos a víctimas.

## Actualización de 2026

Tres agentes investigaron en paralelo estadísticas, cobros/banca y comunicaciones. Los dosieres y las trazas están en [research/2026-10-22](research/2026-10-22/). El conteo SIDPOL verificado llega al **31/07/2026: 12.174 denuncias**, frente a **16.202** en enero–julio de 2025. La revisión llega al 22/10/2026; no existe aquí un conteo validado hasta octubre. El catálogo de septiembre quedó pendiente de acceso. El mapa de tasas mantiene su periodo anual 2025; la comparación regional 2026 usa conteos, por separado.

La sección `#proyeccion` permite simular el cierre de2026 y consultar la extrapolación regional. Conserva observado y simulado separados; no es un pronóstico estadístico. Los supuestos están en `data/proyeccion_2026.json`.

La web incorpora seis hipótesis con respaldo, contraevidencia y prueba pendiente. El caso adicional del dosier bancario corresponde a hechos de 2025 y no se suma al explorador de cinco casos ni a estadísticas nacionales. Las fuentes nuevas se conservan en cada dosier, además del registro original de 20 fuentes y pistas.

## Ejecutar y comprobar

Web estática, sin dependencias de JavaScript ni servicios de terceros en el navegador. Requiere Python 3 para servir y validar; Node.js para comprobar sintaxis.

```sh
python3 scripts/consolidate_research.py
python3 scripts/validate.py
python3 scripts/validate_research.py
node --check assets/app.js
node --check assets/research.js
python3 -m http.server 4173
```

Abrir http://localhost:4173. No abrir `index.html` con `file://`, porque el navegador necesita cargar los JSON por HTTP.

`python3 scripts/seed_data.py` reproduce los JSON y CSV editoriales desde transcripciones identificadas. Después ejecutar `python3 scripts/consolidate_research.py` para restaurar el manifiesto y los JSON de la edición ampliada. Ninguno descarga ni actualiza automáticamente la evidencia. La geometría se conserva en `data/departamentos.geojson`; su procedencia y consulta están documentadas en `docs/metodologia.md`.

## Publicación

GitHub Pages se configura con **GitHub Actions**. El workflow valida y empaqueta solamente `index.html`, `assets/`, `data/`, `docs/` y `research/` en `_site/`, y usa las acciones oficiales de Pages. Un push a `main` despliega la edición; revisar la ejecución y la URL antes de declararla publicada. No necesita secretos personalizados.

## Documentación

- [Investigación y hallazgos](docs/investigacion.md)
- [Metodología y procedencia](docs/metodologia.md)
- [Diccionario de variables](docs/diccionario.md)
- [Borradores de solicitudes, no enviados](docs/solicitudes-informacion.md)
- [Pendientes y mantenimiento](docs/backlog.md)
- [Validaciones](docs/validacion.md)

Los casos no permiten estimar proporciones nacionales de medios de pago. La mención de una empresa no prueba complicidad. Una prisión preventiva no es una condena; una sentencia reportada no implica firmeza verificada. No se publica información identificable de víctimas o investigados.

## Aportar y corregir

Abre un issue con el ID del registro y una fuente pública, sin teléfonos, cuentas, DNI, domicilios, amenazas ni capturas privadas. Los issues son públicos. Para añadir un caso, usar el esquema y justificar su deduplicación; para modificar cifras, documentar edición, corte y cambios metodológicos. No recibimos denuncias personales.

Código original: licencia MIT. Las fuentes externas conservan sus derechos. Las transcripciones estadísticas se distribuyen con atribución de origen; la geometría es una capa pública de Provías con atributo INEI y no es apta para delimitación oficial. Véase [procedencia](docs/metodologia.md).

## Respuesta rápida con aprobaciones digitales

La sección `#respuesta` incorpora una propuesta de software institucional, fuentes legales y técnicas, metas de 30/90/180 días condicionadas y una demostración de permisos con expediente ficticio. No tramita denuncias ni conecta servicios reales. Datos en `data/respuesta_rapida.json`; revisión normativa paralela en `research/2026-10-22/propuesta_*.json`. Validar con `python3 scripts/validate_response.py`.

Se distingue titularidad de control efectivo. No se crea un score de personas por antecedentes ni un sistema de vigilancia masiva. Los peritajes de rostro/voz y las solicitudes de datos requieren evaluación por caso, competencia y autorización aplicable.

## Dashboard: desarticular la extorsión

`dashboard.html` reúne en una página pública: 20 casos resueltos (5 del explorador original y 15 nuevos de 2025–2026) con técnica, plazo y resultado; un plan de 6 horas desde la denuncia que compara, etapa por etapa, la meta propuesta con el máximo legal vigente (24 h para ubicar el celular, congelar la cuenta y entregar videos); qué automatiza el sistema y qué decide siempre una persona (congelar, autorizar la entrega controlada, capturar); y lo que hace falta para cumplirlo: sin cambiar leyes, con convenios e integración técnica o con cambio normativo; una matriz de 16 roles y 11 facultades (decide, urgente con convalidación judicial, solicita, ejecuta); 28 normas vigentes y 6 proyectos separados; y seis cadenas de rastreo (llamada, WhatsApp, audio, cámaras, Yape/Plin, cripto) con confiabilidad, vía legal, tiempo y fallas.

Los datos salen de tres dosieres nuevos en `research/2026-10-22/` (`mapa_legal.json`, `casos_resueltos.json`, `rastreo_tecnico.json`) y se componen con `python3 scripts/build_dashboard.py`; `python3 scripts/validate_dashboard.py` comprueba que el JSON publicado sea reproducible y que todo tenga fuente. Usa la fuente Archivo desde Google Fonts y sin otras dependencias externas.

Los casos son una muestra intencional de respuestas que funcionaron: no estiman la tasa nacional de casos resueltos. Varias normas y cifras están marcadas como indexadas o no verificadas en el propio dosier; revisarlas antes de citarlas como definitivas.

## Prototipo completo por roles

Abrir `prototipo.html` desde el servidor local o GitHub Pages. Incluye Policía, Fiscalía, Juzgado, UIF, Banco, OSIPTEL, Telco y Auditoría, dos casos ficticios, decisiones motivadas, rutas independientes, incidencias, rechazo, revocación/liberación y reactivación. Exporta la traza JSON del caso. Conserva el recorrido en el navegador cuando el almacenamiento está disponible.

Probar el motor con `node scripts/test_prototype.mjs`. La especificación está en `data/prototipo_flujos.json`. El selector representa roles pero no autentica personas; la traza no tiene firma ni protección institucional. No hay conectores reales ni datos privados.
