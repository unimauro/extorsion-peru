# Observatorio de la Extorsión en Perú

Investigación ciudadana sobre dinero, comunicaciones y rendición de cuentas. Autor: Carlos Mauro Cárdenas Fernández (`unimauro`).

**Web:** https://unimauro.github.io/observatorio-extorsion-peru/

Primera edición, revisada el **22 de octubre de 2026**. La estadística principal cubre 2019–2025; los casos seleccionados son publicaciones de 2025–2026. No es un servicio de denuncia ni un registro de personas acusadas.

## Contenido

- Serie policial anual y tasas regionales del reporte INDAGA/OBNASEC publicado en julio de 2026, con advertencia sobre el cambio metodológico de 2025.
- Mapa interactivo de tasas por cada 100.000 habitantes; Lima Metropolitana y Región Lima se consultan por separado y Callao no se suma a Lima.
- Cinco casos institucionales con canales, montos, estados procesales y límites.
- Recorrido explicativo del dinero, matriz de obligaciones, políticas empresariales y resultados pendientes.
- Datos JSON/CSV, registro de 20 fuentes y pistas (no todas íntegramente verificadas), metodología, diccionario y borradores de acceso a información.
- Apoyo al autor mediante Yape y Buy Me a Coffee, procedentes de su repositorio público. No son aportes directos a víctimas.

## Ejecutar y comprobar

Web estática, sin dependencias de JavaScript ni servicios de terceros en el navegador. Requiere Python 3 para servir y validar; Node.js para comprobar sintaxis.

```sh
python3 scripts/validate.py
node --check assets/app.js
python3 -m http.server 4173
```

Abrir http://localhost:4173. No abrir `index.html` con `file://`, porque el navegador necesita cargar los JSON por HTTP.

`python3 scripts/seed_data.py` reproduce los JSON y CSV editoriales desde transcripciones identificadas. No descarga ni actualiza automáticamente la evidencia. La geometría se conserva en `data/departamentos.geojson`; su procedencia y consulta están documentadas en `docs/metodologia.md`.

## Publicación

GitHub Pages se configura con **GitHub Actions**. El workflow valida y empaqueta solamente `index.html`, `assets/`, `data/` y `docs/` en `_site/`, y usa las acciones oficiales de Pages. Un push a `main` despliega la edición; revisar la ejecución y la URL antes de declararla publicada. No necesita secretos personalizados.

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
