# Validación de la edición 1.0

La validación automatizada se ejecuta con `python3 scripts/validate.py` y `node --check assets/app.js`. Comprueba esquema mínimo, referencias de fuentes, fechas, duplicados, correspondencia de geometrías y regiones, suma de líneas inconsistentes y distinción de montos. No constituye una auditoría de los registros oficiales originales.

La serie policial se transcribió del gráfico 6 de S01 y se cotejó con su narrativa. Las tasas se cotejaron con la tabla 1. La información fiscal proviene de S02 y se mantiene en archivo separado. La geometría tiene 25 unidades y el conjunto estadístico 26; el desfase de Lima es deliberado, explicado y comprobado.

Los enlaces de fuentes corresponden a páginas consultadas. S18 y S19 tienen problemas de acceso/extracción documentados. La disponibilidad futura de servicios externos no está garantizada. Los enlaces a archivos locales se comprueban en la validación.

Pruebas en navegador integrado realizadas el 22/10/2026: carga de 25 geometrías, 26 tasas, 5 fichas y 20 referencias; selección de Región Lima (139,9); filtro Efectivo (1 caso); combinación Efectivo + prisión preventiva (0 casos); limpieza (5 casos); búsqueda Sullana (1 caso) y expansión de su evidencia. No se observaron errores de consola. Se inspeccionaron escritorio y móvil; el ancho del documento coincidió con el viewport efectivo, sin desborde horizontal de la página. La navegación principal estrecha tiene desplazamiento horizontal propio.

No se atribuye cumplimiento WCAG completo: se implementan idioma, landmarks, etiquetas de formularios, foco visible, navegación por teclado del mapa, tabla alternativa, estados accesibles de filtros y reducción de movimiento. No se realizó auditoría con lector de pantalla.

## Edición 1.1 — 22/10/2026

- Validación editorial original y ampliación2026: correctas. Se comprobaron sumas de26filas regionales, variaciones, referencias y archivos de traza.
- Sintaxis de ambos scripts JavaScript: correcta. Empaquetado público incluye JSON de investigación.
- Prueba HTTP local: seis hipótesis, cuatro tareas, seis hallazgos y tabla2026 de26regiones cargados; sin errores/advertencias de consola. Vista de1280px sin desbordamiento horizontal.
- Se desplegó la tabla regional y se revisó visualmente su lectura y barras.
- La ejecución publicada y su commit se consultan en https://github.com/unimauro/extorsion-peru/actions.

## Escenarios de cierre2026

Validación de fórmulas y navegador: escenario1×=20.870; escenario2×=29.565; umbral de duplicación=53.456. El selector actualiza el resultado y la barra; sin errores de consola. Se verificaron26filas regionales y los límites de extrapolación.
