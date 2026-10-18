# Estrato: investigación competitiva y ruta de producto

**Fecha:** 18 de octubre de 2026  
**Objetivo:** decidir cómo evolucionar Estrato hacia una herramienta integral para geólogos y geocientíficos de campo.

## Alcance y método

Revisión de documentación pública y fichas de aplicaciones, complementada con análisis estático del APK oficial de QField y lectura del código fuente público de QField y StraboField. No instalé ni ejecuté APKs. Let’sGeo prohíbe expresamente la ingeniería inversa en sus términos, así que sus funciones se tomaron únicamente de la ficha pública. Las afirmaciones basadas en fichas son capacidades anunciadas; no equivalen a una prueba de uso.

### Evidencia y límites del APK

- Descarga oficial: QField v4.3.6 para Android arm64, 107.425.282 bytes; SHA-256 del APK: `691D4237A1971C0891AC5A07CA55BD97B407F056BEDDD68405DB092F727C461B`.
- La huella SHA-256 del certificado extraído (`5a7dd946a4b700c081a5bd375dbc8f0d11aa89d53832567ce5b8a92088e0e898`) coincide con la huella publicada por QField para autenticar sus paquetes Android.
- REA clasificó el artefacto como APK y recorrió su inventario. Contiene 1.826 entradas ZIP; se observan bibliotecas nativas Qt 6, `libqfield`, recursos de GDAL y bases de referencia PROJ/QGIS. Esto apoya la lectura de que QField empaqueta un SIG móvil nativo amplio, no un cuaderno geológico ligero.
- Evidencia REA: artefacto `ev_58abaec8f0c22f29c0c0971398eee5086e9a9ae0b14ddad61ae7226a17bdf3b5`; resumen `ev_ca06140aedf9b0d7beb4750fbd73be219ff94795f2c044eacc9c79d7c3b279d6`; inventario `ev_3572a273a9753dedea0907986c33feca771e4c21c9fe50d02bab2c5c1f3b1d4a`.
- El cliente REA no tenía JADX disponible y apktool tampoco estaba instalado. Por ello no se decodificó el manifiesto ni se reconstruyó el flujo interno de la app; el inventario ZIP no prueba cómo se comporta en ejecución. La lectura funcional de QField se contrastó con su repositorio y documentación públicos.

El repositorio público de StraboField está bajo licencia MIT y ofrece más evidencia que una ficha: README, formularios de captura y gestión del estado. La última versión visible en `package.json` es 2.31.8. No encontramos un APK adjunto a su última publicación; se analizó el código fuente en lugar de descargar una copia de terceros.

## Estrato hoy

La base del producto ya es sólida para una libreta offline: campañas y estaciones, coordenadas y precisión GPS, fotos, orientación básica, guías por litología, revisión de datos, muestras y bolsas, mapa y capas GeoJSON, fondos de imagen georreferenciados manualmente, rosas de rumbos, informes autónomos y exportación CSV/ZIP/GeoJSON más respaldo JSON completo. Los datos quedan localmente en el navegador.

Las fronteras actuales también son claras: el modelo v1.11 permite varias lecturas planares y lineales por estación, con método, calidad anotada, notas y fotos asociadas, pero aún no captura cinemática de fallas ni rake ligado a un plano; el estado de una muestra es manual, sin cadena de custodia ni laboratorio; el mapa base es una imagen PNG/JPEG preparada de antemano (no MBTiles, GeoTIFF ni GeoPackage); la salida geoespacial es GeoJSON y no GeoPackage; no hay sincronización de equipo. La PWA y sus sensores reales de Android/iPhone siguen necesitando una prueba física.

## Qué ofrece el mercado

| Aplicación | Capacidades que declara | Lectura para Estrato |
|---|---|---|
| [StraboField](https://strabospot.org/strabofield_landing) | Captura offline de puntos, líneas y polígonos, notas/fotos/esquemas, orientaciones, observaciones jerárquicas, mapas base, columnas estratigráficas, vocabularios y exportación. | Competidor directo para libreta científica. Offline, fotos y mediciones por sí solos no diferencian Estrato. |
| [FieldMove Clino](https://play.google.com/store/apps/details?id=com.mve.fieldmove.clino) | Brújula/clinómetro, medidas estructurales, estereoneta, mapas offline, notas y exportación. | Referencia para la captura estructural y su análisis en campo. |
| [geoDB Field](https://play.google.com/store/apps/details?id=com.geodb.field) | Muestras con GPS/fotos, logging de perforaciones, cartografía, estructuras, operación offline y sincronización. La ficha de iOS describe códigos de barras para estándares, blancos y duplicados, además de trabajo con muestras y control de calidad. | La trazabilidad y el QA/QC de muestras son flujos centrales en exploración, no campos secundarios de una estación. |
| [Let’sGeo](https://play.google.com/store/apps/details?id=world.letsgeo.app) | Geología y estructuras, perforación, parámetros geotécnicos, mapas offline, conversión de coordenadas, GPS track, archivos GIS y archivos de proyecto portables. | La amplitud profesional existe; una interfaz con todo mezclado sería difícil de usar. |
| [RockGeo](https://play.google.com/store/apps/details?id=com.geofieldai) | Mapeo offline, puntos, muestras, audio, estructuras, secciones, herramientas geotécnicas, reportes, portal sincronizado e IA opcional. | Competidor que se posiciona como flujo desde campo hasta informe; sus funciones anunciadas no fueron verificadas en uso. |
| [QField](https://docs.qfield.org/how-to/advanced-how-tos/standalone-datasets/) | SIG de propósito general con soporte de GeoPackage, GeoJSON, KML/KMZ, Shapefile, GPX, GeoTIFF y más. | Estrato debe entregar datos que abran bien en QGIS/QField, no intentar reemplazar un SIG de escritorio. |

## Qué reveló la revisión más profunda

### StraboField: la referencia más cercana a una libreta geológica

Su modelo separa el lugar de las observaciones: un *spot* puede tener geometría de punto, línea o polígono; se pueden anidar spots para agrupar espacialmente y usar etiquetas para relacionar conceptos entre lugares. El README también describe mapas personalizados y offline, imágenes georreferenciadas, columnas estratigráficas, exportación y captura sin conexión. Su estructura de formularios contiene mediciones planares y lineales, control de calidad de la medida, tipo de elemento, campos geológicos condicionales y formularios de muestras. El código persiste parte del estado localmente y mantiene módulos separados para mapas offline, proyectos, spots, muestras y QA/QC.

**Lección para Estrato:** no basta con convertir una estación en un formulario más largo. Conviene permitir varias observaciones tipadas dentro de una estación y relacionarlas con etiquetas, muestras, fotos y geometrías propias. Las categorías deben venir de perfiles activables y vocabularios configurables. El diseño debe tomar ideas funcionales, no copiar sus textos, pantallas ni activos.

### QField: gran interoperabilidad y herramientas SIG

El paquete Android está firmado con el certificado oficial y contiene bibliotecas Qt 6 y componentes geoespaciales nativos, con recursos GDAL, PROJ y QGIS. La documentación y el código público describen trabajo sin conexión, captura sobre capas GIS, herramientas de medición, posicionamiento, vista 3D, conexión GNSS/NTRIP y sincronización opcional por QFieldCloud.

**Lección para Estrato:** priorizar formatos portables y un flujo de ida y vuelta con QGIS, en vez de reproducir el alcance de un SIG general. GeoPackage debe ser el siguiente salto geoespacial; más adelante, GeoTIFF y mapas de teselas offline con licencias/fuentes claras. Para orientación, separar el dato científico, la lectura cruda del sensor y la corrección aplicada.

### FieldMove Clino: captura estructural y mediciones

Su guía de usuario y ficha pública describen medición de orientaciones, mapas base georreferenciados, fotos y notas, exportaciones y estereonetas. Es una referencia útil para el flujo de medición estructural; la documentación no demuestra por sí sola la precisión de un teléfono concreto.

**Lección para Estrato:** registrar instrumento y método, norte de referencia, declinación/corrección, calibración y precisión reportada. Mantener visibles los datos y advertencias para que el usuario pueda juzgar la medida; no presentar un celular como sustituto certificado de una brújula geológica.

### Límites y oportunidad de Estrato

Los competidores más fuertes se reparten entre un SIG generalista (QField), una libreta geológica flexible (StraboField) y una herramienta de orientación (FieldMove Clino). Estrato puede unir una captura de estaciones y observaciones geológicas, trazabilidad de muestras y exportación interoperable en un flujo corto, offline y enfocado primero en cartografía y geología estructural. Esta es una **inferencia de posicionamiento** basada en las capacidades publicadas y el código consultado, no una afirmación de que el mercado carezca de toda otra app con esa combinación.

## Decisión de producto

Construir **una app modular con un núcleo común y perfiles de trabajo**. El núcleo resuelve proyectos/campañas, estaciones, coordenadas y CRS, mapas offline, medios, respaldo, trazabilidad, revisión y exportación. Encima se activan perfiles para cartografía geológica, geología estructural, muestreo/exploración, geotecnia/perforación y monitoreo ambiental/volcánico. Cada perfil presenta solo los formularios y herramientas de esa tarea.

Una estructura común de datos que permita crecer sin convertir el formulario actual en una lista interminable:

`Proyecto → campaña/jornada → estación → observaciones geológicas y mediciones → muestras → evidencias → revisión`

Las observaciones deben poder ser varias por estación y tipadas. Cada medición debe conservar el método, unidades, datum/CRS, precisión, quién/cuándo la registró y la evidencia asociada. Los avisos de calidad ayudan a revisar; no certifican resultados ni reemplazan criterio profesional.

## Ruta priorizada

### P0 · Confianza en el campo

- Prueba guiada en Android y iPhone reales: cámara, permisos, brújula, GPS, uso en modo avión, reinicio y recuperación del respaldo.
- Preparación antes de salir: confirmar área/capas disponibles offline, espacio libre, batería y un respaldo exportado.
- Mantener la opción local sin cuenta; documentar con claridad dónde se guardan los datos y cómo moverlos a otro equipo.

### P1 · Modo de geología estructural

- Una estación puede contener varias medidas planares y lineales, sin sobrescribir su orientación principal.
- Planos: tipo de estructura, rumbo, buzamiento y dirección de buzamiento. Lineaciones: tendencia/inmersión o rake ligado al plano, donde corresponda.
- Para fallas: sentido de movimiento, indicadores cinemáticos, confianza, método de medida y foto anotada como evidencia.
- Capturar la lectura de sensor y su incertidumbre; declarar norte magnético/verdadero y la corrección aplicada. Evitar presentar el sensor del teléfono como sustituto certificado de una brújula geológica.
- Vista de estereoneta y análisis asociados a medidas seleccionadas, con filtros, conteos, datos excluidos y exportación reproducible.

**Primer incremento recomendado:** varias medidas estructurales por estación, exportación CSV/GeoJSON y revisión de consistencia. Conecta con las rosas y los avisos de Estrato y con tu experiencia en fallas.

**Estado en Estrato v1.11.0:** esta primera base quedó implementada localmente. Hay captura y edición de planos y lineaciones con método, calidad anotada, notas y fotos vinculadas; la rosa cuenta cada rumbo planar y lo rastrea a estación/número; CSV, GeoJSON, informe y respaldo JSON v5 contienen las medidas. Se preserva la lectura de los respaldos v1–v4 y la base IndexedDB v2. Esta iteración no incluye rake, indicadores cinemáticos, estereoneta, correcciones o incertidumbre del sensor y todavía requiere revisión en dispositivo y validación con observaciones reales.

### P2 · Trazabilidad de muestras y QA/QC

- Etiquetas QR/código de barras generadas y leídas sin conexión; el código enlaza proyecto, campaña, estación y muestra.
- Tipos de muestra configurables; estándares/blancos/duplicados; responsable y fechas de recolección, transferencia y recepción en laboratorio; laboratorio, análisis y resultados como campos trazables.
- Manifiesto imprimible/CSV y fotos ligadas a la muestra. El código escaneado debe validarse y marcar duplicados antes de salir al laboratorio.

### P3 · Flujo SIG y geotecnia

- Importar/exportar GeoPackage con geometrías, atributos, CRS y metadatos; probar el intercambio en QGIS. Después sumar GeoTIFF y paquetes de teselas offline con sus licencias/fuentes.
- Perfil de perforación/geotecnia separado del mapeo de afloramientos: intervalos, litología, recuperación, RQD y discontinuidades. Hacer configurables los esquemas y documentar las normas aplicables antes de codificar valores normativos.
- Informes PDF/HTML reproducibles y paquetes de entrega con datos, fotos, diccionario de campos y fuentes cartográficas.

### P4 · Equipo y análisis avanzado

- Sincronización opcional entre dispositivos con resolución explícita de conflictos; el modo de datos solo locales debe continuar disponible.
- Registro de recorridos, voz, croquis anotables, columnas y secciones en etapas. Añadir colaboración, análisis avanzados o asistente de IA solo cuando un piloto confirme la necesidad y los datos de referencia estén validados.

## Criterio de lanzamiento

Antes de agregar módulos, validar el perfil estructural con una salida real y usuarios geólogos. Medir: tiempo para registrar una estación, medidas incompletas o corregidas, pérdida/duplicación tras trabajar sin señal, facilidad de recuperar datos y éxito al abrir la exportación en QGIS. Publicar resultados y límites de la prueba en el portafolio.

No se recomienda intentar que la primera versión resuelva todas las disciplinas. La primera promesa comprobable puede ser: **“Estrato registra estaciones, fallas y muestras sin señal, conserva evidencia y entrega datos revisables en QGIS.”** Las tiendas móviles vienen después de validar ese flujo en dispositivos reales y de preparar empaquetado, privacidad, soporte y distribución.

## Fuentes

- StraboField: [página oficial](https://strabospot.org/strabofield_landing), [repositorio MIT](https://github.com/StraboSpot/StraboField), [formularios de orientación planar](https://github.com/StraboSpot/StraboField/blob/master/src/assets/forms/measurement/planar-orientation.json), [persistencia local](https://github.com/StraboSpot/StraboField/blob/master/src/store/ConfigureStore.js) y [App Store](https://apps.apple.com/ec/app/strabofield/id1555903455?platform=ipad).
- QField: [repositorio oficial](https://github.com/opengisch/QField), [publicaciones y APKs firmados](https://github.com/opengisch/QField/releases), [documentación de datos independientes](https://docs.qfield.org/how-to/advanced-how-tos/standalone-datasets/) y [posicionamiento](https://github.com/opengisch/QField/blob/master/src/app/qml/QfPositioningSettings.qml).
- Let’sGeo: [acuerdo de usuario](https://letsgeo.world/terms.php), que prohíbe la ingeniería inversa.
- Guía de usuario de FieldMove Clino: [Android PDF](https://www.mve.com/media/3219/fieldmove_clino_android_march_2024.pdf).
- [FieldMove Clino en Google Play](https://play.google.com/store/apps/details?id=com.mve.fieldmove.clino).
- [geoDB Field en Google Play](https://play.google.com/store/apps/details?id=com.geodb.field) y [App Store](https://apps.apple.com/us/app/geodb-field/id6758226989).
- [Let’sGeo en Google Play](https://play.google.com/store/apps/details?id=world.letsgeo.app) y [App Store](https://apps.apple.com/us/app/letsgeo/id6755918405).
- [RockGeo en Google Play](https://play.google.com/store/apps/details?id=com.geofieldai).
- [Formatos que abre QField](https://docs.qfield.org/how-to/advanced-how-tos/standalone-datasets/).
