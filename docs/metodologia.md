# Metodología y procedencia

## Alcance y fecha

Revisión documental al 22/10/2026, edición 1.0. No equivale a monitoreo continuo ni a una certificación exhaustiva de vigencia jurídica. El registro `data/fuentes.json` separa fuentes completas, ayuda recuperada por buscador y pistas incompletas.

## Estadística

La serie principal y las tasas se transcriben de S01: reporte INDAGA/OBNASEC 2019–2025 publicado el 25/07/2026, gráfico 6 p. 30 y tabla 1 p. 47 (páginas impresas). Corte al 31/12/2025, actualización al 30/06/2026. Unidad: denuncias policiales según fecha y lugar de ocurrencia, no cantidad de víctimas únicas. Tasas: por 100.000 habitantes, denominador de población INEI proyectada para cada año. Se usan las tasas publicadas, no se reconstruyen poblaciones a partir de cifras redondeadas.

El anexo de S01, pp. 66–67, señala extracción homologada y tratamiento estadístico de duplicados aplicados a 2025; los años previos mantienen criterios anteriores. La barra de 2025 se separa visualmente y hay advertencia contigua. No se presenta una variación porcentual como cambio puro del riesgo.

La serie fiscal semestral S02 se conserva aparte. Comparar primeros semestres entre sí es posible dentro de esa fuente, sujeto a sus límites, pero no se suman registros fiscales a policiales ni se empalman las series. La cifra fiscal de 2025 es preliminar.

## Geografía

Geometría: servicio público de Provías Descentralizado, campo `fuente=INEI`, 25 polígonos departamentales. Consulta realizada el 22/10/2026:

https://gis.proviasdes.gob.pe/server/rest/services/Hosted/DEPARTAMENTOS/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&maxAllowableOffset=0.02&f=geojson

Se retuvieron únicamente `coddep`, `departamen`, `fuente` y geometría, con simplificación del servidor a 0,02 grados y proyección WGS84. Render equirectangular local para visualización, no para mediciones o deslinde. Se atribuye la fuente pública; no se presume exclusividad ni propiedad sobre el original.

S01 publica 26 unidades: 23 departamentos distintos de Lima, Callao y dos unidades de Lima. El mapa tiene 25 geometrías: 24 departamentos y Callao. Lima se raya y no recibe una tasa combinada; no se suman ni promedian tasas. Su selector ofrece Región Lima y Lima Metropolitana. Callao tiene su geometría y una referencia ampliada explícitamente rotulada. La tabla accesible contiene las 26 unidades. No se infieren domicilios de víctimas a partir de sedes judiciales.

## Selección de casos y deduplicación

Muestra intencional de cinco casos con notas institucionales íntegramente consultadas. Se buscó variedad de mecanismos: billetera, cuenta bancaria, retiro, efectivo, pagos sucesivos y contraste de estados procesales. No hay muestreo probabilístico ni porcentajes nacionales. Entidades mencionadas no son un ranking.

Un registro representa un caso narrativo, no una transferencia. Antes de agregar una noticia, cotejar fecha, jurisdicción, modalidad, montos y secuencia contra los registros existentes; las republicaciones quedan como fuentes del mismo registro. En esta edición se inspeccionaron los cinco y no se identificó coincidencia entre ellos; las identidades se omiten en la salida pública.

Se diferencia fuente fiscal, decisión judicial reportada y sentencia firme. La fuente S13 es una nota del Poder Judicial, no el expediente íntegro. En todos los registros la firmeza no se verificó. Fecha desconocida se conserva como `null`, con la precisión explicada. El monto desconocido nunca se convierte en cero. C003 separa un depósito controlado de S/ 5; C004 no desglosa S/ 900 entre canales porque la fuente no lo hace; C005 no estima un acumulado semanal.

## Verificación de fuentes

Las notas S12/S14/S15/S16 devolvieron errores 418 en algunas aperturas del navegador de investigación. Se descargó el HTML público con curl y se inspeccionó completo. S13 se leyó íntegramente en la herramienta de investigación. Los documentos S01 y S03 se descargaron y extrajeron con `pdftotext -layout`. No se publica el HTML bruto de casos porque contiene datos personales que no son necesarios para este proyecto.

S18 devolvió un desafío HTML bajo una URL PDF; queda pendiente. S19 se identificó por buscador, pero su descarga no permitió extraer el texto con fiabilidad; queda pendiente. No se usan sus fragmentos para afirmar incumplimientos. S09 y S10 son documentación técnica o de ayuda recuperada por buscador y se identifica esa limitación. Una página corporativa describe producto, no eficacia en Perú.

## Clasificación de responsabilidad

La matriz distingue obligación normativa, procedimiento legal, problema de control documentado, anuncio empresarial y herramienta de producto. Las métricas son propuestas de evaluación. No equivalen a incumplimientos ya probados. La revisión legal es selectiva: aplicar una norma a un caso exige considerar vigencia, ámbito, modificatorias y expediente.

## Protección de datos y mantenimiento

No se publican teléfonos, cuentas, domicilios, nombres de víctimas ni de investigados. Las fuentes enlazadas pueden contenerlos; aquí no se reproducen. No hay analítica, formulario de denuncia ni envío de datos del visitante. Los filtros funcionan localmente. El número de Yape visible es del autor, ya publicado en su repositorio y expresamente solicitado por él.

Para cada cambio: actualizar fuente y fecha de consulta, explicar la corrección, ejecutar validaciones y revisar móvil y escritorio. Si un caso cambia de estado, conservar el historial en Git y corregir la ficha visible. Ante una suplantación o atribución equivocada, retirar primero el dato cuestionado mientras se revisa. Las contribuciones económicas no compran conclusiones.

## Ampliación del 22 de octubre de 2026

La revisión en tres frentes paralelos se conserva en `research/2026-10-22/`, con trazas de consultas, exclusiones y limitaciones. Los agentes no son fuentes independientes. El reporte SIDPOL de julio de 2026 (página23, glosario18) aporta una comparación enero–julio2025/2026, con26unidades regionales y totales16.202/12.174. Elaborado14/08/2026, actualizado31/07/2026; fecha exacta de publicación no identificada. El catálogo septiembre no se pudo descargar y no aporta cifras a la web. Se preservan separadas las series anuales, fiscales, conteos parciales y tasas. La disminución de denuncias no se interpreta causalmente.

`consolidate_research.py` reproduce la selección editorial a partir de los dosieres. Las fuentes adicionales están en dichos dosieres; las seis hipótesis están en `data/hipotesis.json`. La mención policial eSIM carece de atribución a proveedor o peritaje; no modifica los campos desconocidos de los cinco casos originales.

## Proyección al cierre de2026

Escenarios aritméticos, sin probabilidades: `12174 + (12174 / 7) × multiplicador × 5`. El tramo agosto–diciembre incluye meses transcurridos pero no verificados. El escenario constante resulta en20.870 denuncias redondeadas. No se ajustan estacionalidad, subregistro o cambios de clasificación. No son víctimas estimadas ni intervalos de confianza. El umbral de duplicación usa26.728 como referente anual2025 de otra edición, con cautela explícita de comparabilidad. Las proyecciones regionales se redondean de forma independiente. Madre de Dios duplica en la comparación observada de iguales meses; no se presume duplicación anual.

## Respuesta rápida con aprobaciones digitales

`data/respuesta_rapida.json` conserva propuesta editorial, metas condicionadas, fuentes y traza. Dos agentes revisaron el marco financiero y telecom en `research/2026-10-22/propuesta_financiera.json` y `propuesta_telecom.json`. Se separan normas consultadas, proyectos no promulgados verificados y metas de gestión. No se concluyó una consolidación exhaustiva de geolocalización ni lectura íntegra de algunos anexos.

Las referencias NIST/NFI son evidencia técnica extranjera, no habilitación jurídica peruana. Políticas WhatsApp/Telegram no garantizan respuesta ni datos disponibles. Una firma digital aplicable debe verificarse con certificados y requisitos del trámite; la demostración en GitHub Pages solo representa roles en memoria. La evaluación de impacto se propone como condición del piloto, sin afirmar que sea una obligación general del artículo40 del DS016-2024-JUS.
