# Diccionario de datos

Codificación UTF-8; CSV con BOM para facilitar apertura en hojas de cálculo. JSON `null` y campo vacío CSV significan **desconocido/no informado**, nunca cero. Listas y objetos se serializan como JSON en celdas CSV. Fechas ISO; precisión mensual `YYYY-MM` cuando no se conoce día. La tasa usa punto decimal en datos y coma en la interfaz.

## Casos (`casos.json` / `.csv`)

| Campo | Definición |
|---|---|
| id, title | ID estable C001… y título editorial |
| event_date, event_date_precision | Fecha del hecho y qué hito representa; no sustituir por publicación |
| published_at, accessed_at | Publicación de fuente principal y consulta |
| region, location, geographic_precision | Ubicación pública general y su precisión; puede indicar jurisdicción, no lugar de victimización |
| modality | Modalidad descrita en la fuente |
| communication_channels | Canales expresamente documentados; desconocido si falta |
| sim_type, telecom_operator, esim_provider | Tipo de SIM, operadora y proveedor eSIM: desconocidos en esta muestra |
| payment_methods | Canales y operaciones documentadas; retiro se diferencia de pago de la víctima |
| entities_mentioned | Entidades o marcas que la fuente nombra; no expresa responsabilidad |
| demanded_pen | Primera exigencia monetaria documentada, en soles |
| paid_pen | Pago ordinario documentado; null si no se conoce acumulado |
| controlled_payment_pen | Depósito coordinado con la PNP, separado del cobro ordinario |
| recovered_pen, frozen_pen, seized_pen | Dinero recuperado, congelado o incautado expresamente informado; todos desconocidos aquí |
| currency, amount_note | PEN y contexto de montos, exigencias posteriores y falta de desglose |
| procedural_stage | Estado según nota: prisión preventiva, comparecencia o sentencia informada |
| final_judgment_confirmed | Booleano que indica si se verificó firmeza; false no implica que no exista firmeza |
| summary, account_control | Síntesis y distinción de titularidad/control; no nombres personales |
| source_ids, source_url, evidence_locator | IDs de fuentes, URL principal y localizador reproducible |
| limitations | Límites particulares de inferencia |

## Serie anual

`year`, `period_start`, `period_end`: año completo. `complaints`: conteo SIDPOL publicado. `rate_per_100k`: tasa publicada por 100.000 habitantes. `updated_at`: actualización de la fuente. `methodology_break`: true en 2025, cuando se aplicó la metodología descrita en S01. `source_id`: S01.

## Regiones

`code`: código departamental; 15R y 15M son códigos editoriales para los dos desgloses de Lima, **no ubigeos oficiales**. `region`, `year`, `rate_per_100k`, `source_id`, `denominator`, `geography_note`: nombre, período, tasa publicada, fuente, base poblacional y delimitación. No hay conteos regionales ni poblaciones brutas reconstruidas. No sumar tasas para obtener el total nacional.

## Serie fiscal semestral

`year`, `semester`, `complaints`, `source_id`, `preliminary`: serie del Ministerio Público reproducida por INEI (S02), separada de SIDPOL. Solo existe el primer semestre de 2025 en este archivo.

## Telecomunicaciones

`operator`, `inconsistent_lines`, `source_id`, `published_at`, `scope`: empresa, saldo reportado de líneas con inconsistencias, fuente, publicación y alcance. No son hechos de extorsión ni porcentajes sobre todas las líneas de cada empresa.

## Fuentes

`id`, `title`, `publisher`, `url`, `published_at`, `accessed_at`, `locator`, `scope`, `verification`, `limitations`: referencia, fechas, alcance, verificación y límites. No contar las pistas pendientes como pruebas verificadas.

## Responsabilidades

`actor`, `category`, `action`, `source_id`, `locator`, `metric`, `evidence_limit`: actor, naturaleza de la afirmación, deber/actuación, fuente y artículo/apartado, indicador propuesto y lo que la evidencia no demuestra.

## Archivos de la ampliación2026

- `data/actualizacion_2026.json`: fecha de revisión, corte estadístico verificado y hallazgos con URL y límites.
- `data/hipotesis.json`: seis afirmaciones, evaluación editorial, respaldo, contraevidencia, prueba pendiente y fuentes.
- `data/traza_tareas.json`: tareas, resultados, archivos y enlaces a trazas detalladas.
- `research/2026-10-22/estadisticas_2026.json`: `regiones.filas` contiene conteos SIDPOL enero–julio2025/2026; variación porcentual es `(2026/2025-1)*100`. Unidades geográficas según fuente.
- Dosieres `cobros_banca.json` y `comunicaciones_telco.json`: hallazgos, fechas, fuentes, estado de verificación, límites y exclusiones. Sus IDs de fuentes son propios y no se confunden con los del registro original.
