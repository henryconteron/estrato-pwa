# Estrato · Cuaderno geológico offline

PWA en español para registrar estaciones desde el teléfono. HTML/CSS/JS vanilla, sin backend, sin cuentas, sin servicios de pago, sin bibliotecas externas y sin proceso de compilación. Los datos y fotos nunca se envían a un servidor.

Sitio de instalación: **https://henryconteron.github.io/estrato-pwa/**.
Código fuente: **https://github.com/henryconteron/estrato-pwa**.

## Archivos

- `index.html`: interfaz, estilos, IndexedDB, cámara/GPS/brújula, mapa offline, CSV, ZIP, GeoJSON y JSON.
- `manifest.webmanifest`: nombre, identidad, alcance e instalación.
- `sw.js`: caché versionada del app shell, con estrategia cache-first.
- `icon-192.png` e `icon-512.png`: iconos PNG generados con Python estándar; el dibujo está dentro de la zona segura para iconos maskable.
- `README.md`: esta guía.

## Prueba local

Desde la carpeta que contiene `index.html`:

```sh
python -m http.server 8000 --bind 127.0.0.1
```

Abre `http://localhost:8000/` en Chrome. No abras `index.html` con `file://`: el service worker necesita HTTPS o la excepción segura de localhost. Un teléfono que accede a la IP del computador por HTTP **no** tiene esa excepción; para probar sensores desde el teléfono, publica en HTTPS.

Espera **Lista para usar offline** antes de desconectarte. La primera apertura necesita conexión para descargar los archivos. Una vez preparada la caché, crear, editar, ver, borrar, buscar, importar y exportar funcionan sin conexión. No hay mapas remotos, fuentes remotas ni llamadas a API. El indicador online/offline refleja la señal del navegador, no una comprobación de acceso real a internet.

### Chrome DevTools → Application

1. Abre DevTools y selecciona **Application → Manifest**. Comprueba nombre, `start_url`, `scope`, modo `standalone`, y ambos iconos; no debe haber errores de instalabilidad. No se incluyen capturas promocionales: puede faltar la presentación enriquecida del diálogo de instalación, pero la instalación básica sigue disponible.
2. En **Service Workers**, comprueba que `sw.js` está activado y controla la página. La primera instalación toma el control mediante `clients.claim()`.
3. En **Cache Storage**, comprueba una caché `estrato-…-v1.3.0` con la portada, `index.html`, manifiesto e iconos.
4. En **IndexedDB**, abre la base `estrato-field-notebook` (versión 2) y sus almacenes `stations`, `photos`, `meta`, `drafts`, `trash` y `history`. Las fotos se guardan como objetos **Blob**, nunca rutas de archivos ni localStorage.
5. Crea una estación con una foto, recarga y comprueba su detalle. Marca **Offline** en Service Workers o en Network y recarga: la app y la foto deben seguir funcionando. Crea otra estación y exporta CSV, ZIP y JSON mientras estás offline.
6. Prueba rumbo 361°, buzamiento 91°, latitud 91° y longitud 181°: deben aparecer errores claros y no guardarse.
7. Descarga JSON, borra una estación y vuelve a importarlo. Verifica registro y foto. Prueba también JSON inválido: los datos previos deben conservarse.
8. Sal del modo Offline. Comprueba en **Sensors** GPS simulado y ubicación no disponible; cámara y brújula reales requieren también una prueba en teléfono.

El navegador puede variar sus criterios o no ofrecer `beforeinstallprompt`; el botón «Cómo instalar» explica la instalación manual. Los requisitos de manifiesto y contexto seguro se documentan en [MDN: PWAs instalables](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable).

## Instalar en el celular

**Android / Chrome:** abre la URL HTTPS, espera el estado offline listo, pulsa «Instalar Estrato» en Exportar cuando esté disponible, o usa el menú de Chrome → Instalar app / Añadir a pantalla de inicio.

**iPhone / Safari:** abre la URL HTTPS en Safari → Compartir → Añadir a pantalla de inicio → Añadir. Abre la app desde su icono, espera el estado offline listo y verifica tus datos allí. Evita navegadores internos de otras apps. El almacenamiento entre la pestaña y la app instalada puede variar según iOS; exporta/importa JSON si necesitas transferirlo.

Antes de salir: abre desde el icono, activa modo avión, cierra/reabre y registra una estación de prueba. El GPS puede funcionar sin red si el dispositivo y el sistema ofrecen una posición; su disponibilidad o rapidez no están garantizadas. Las coordenadas siempre se pueden escribir a mano.

## Uso y almacenamiento

- Latitud y longitud WGS84 en grados decimales, obligatorias. Altitud opcional en metros. Rumbo 0–360°, buzamiento 0–90° y dirección de buzamiento opcional como azimut 0–360°.
- La fecha/hora se genera al iniciar una estación y se conserva al editar; el CSV/JSON usan ISO 8601 UTC y la interfaz muestra la hora local del dispositivo.
- El ID sugerido se muestra antes de guardar; el definitivo se asigna en una transacción IndexedDB junto a la estación y sus fotos. No se reutilizan IDs borrados. Dos pestañas no asignan el mismo ID al crear estaciones.
- La litología es libre y obligatoria. El autocompletado recoge valores de las estaciones guardadas.
- GPS: alta precisión, sin posición cacheada, espera máxima de 25 segundos. Muestra precisión ± metros; al cambiar latitud o longitud a mano, se elimina la precisión anterior. Si el GPS no proporciona altitud, queda vacía.
- Brújula: solicita permiso en iOS desde un toque del usuario. Usa `webkitCompassHeading` o eventos absolutos; ignora orientación relativa. Deja de escuchar tras una lectura o 9 segundos. Es una sugerencia: mantén el teléfono plano y comprueba calibración, declinación y sentido con un instrumento de campo. No se aplica corrección de declinación magnética.
- Cámara: usa la cámara trasera si existe; al cerrar la vista se liberan sus recursos. Denegar el permiso muestra una alternativa. La galería es un selector de archivos del sistema; algunas cancelaciones o permisos del sistema no producen un error que la web pueda detectar.
- Hasta cinco fotos, reducidas proporcionalmente a **1280 px de lado mayor**, JPEG de calidad 0.82, sin ampliar fotos pequeñas. La orientación se decodifica antes de dibujar. El canvas elimina metadatos EXIF. Archivos de origen de hasta 50 MB; HEIC depende del soporte del navegador. Usa JPEG si falla.
- El formulario tiene **borrador automático en IndexedDB**, incluyendo fotos. Los campos se guardan tras 350 ms sin cambios y al ocultar la app; cada foto se respalda después de comprimirla. Espera «Borrador guardado» antes de cerrar: una interrupción inmediata durante la compresión o antes de completar la escritura aún puede perder el último cambio. Al reabrir, recupera el borrador desde Nueva. «Guardar estación» finaliza el registro y elimina su borrador. «Limpiar» lo descarta con confirmación. Cada pestaña mantiene un borrador separado; recuperar uno lo mueve de forma atómica a la pestaña actual.
- La app solicita `navigator.storage.persist()` al abrir y permite volver a solicitarlo en Exportar. El navegador decide si concede la persistencia; tampoco protege de un borrado manual de datos. [MDN: almacenamiento persistente](https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/persist).
- El uso estimado incluye IndexedDB y caché del origen y puede incluir otros sitios del mismo dominio. Si el navegador no ofrece una estimación, se muestran bytes de registros/fotos.
- Se requiere almacenamiento del navegador habilitado. Evita modo privado. Cada navegador/perfil/dispositivo/origen tiene su propia colección. Cambiar de dominio o borrar datos del sitio exige restaurar desde JSON.
- Cada estación tiene identidad interna UUID y contador de revisión. Una edición detecta si otra pestaña guardó o eliminó esa estación y conserva tu borrador, en vez de sobrescribirla. Puedes revisar el registro o usar «Guardar como nueva». No hay sincronización entre dispositivos.
- **Papelera:** «Borrar» mueve estación y fotos a Lista → Papelera. No se vacía automáticamente. Restaurar conserva la identidad y las fotos; si el ID está ocupado se asigna otro. Eliminar definitivamente requiere confirmación y borra también la versión anterior de esa estación.
- **Versión anterior:** cada edición guarda el registro y sus fotos anteriores. En Ver estación → Recuperar versión anterior puedes intercambiar ambas versiones. Se conserva una versión anterior por estación; no es un historial ilimitado. Recuperar una versión no cambia la identidad ni la fecha original y crea una nueva revisión.

## Exportaciones y recuperación

**CSV:** UTF-8 con BOM, delimitador coma, comillas escapadas y saltos CRLF. Columnas:

```text
id,fecha,lat,lon,alt,precision_m,litologia,rumbo,buzamiento,dir_buzamiento,tipo,observaciones,nombres_fotos
```

Si Excel no separa columnas por su configuración regional, usa Datos → Desde texto/CSV → UTF-8 → delimitador coma. Los campos de texto que podrían interpretarse como fórmulas llevan un apóstrofo preventivo; el JSON conserva el texto original. `nombres_fotos` separa nombres con punto y coma.

**ZIP:** archivo ZIP32 construido inline sin bibliotecas: modo STORE, CRC32, nombres UTF-8, CSV y fotos en la raíz. Las fotos se nombran `EST-001_01.jpg`, `EST-001_02.jpg`, etc. JPEG ya está comprimido. Límites ZIP32: 65 535 archivos y menos de 4 GB; colecciones grandes también pueden agotar memoria del teléfono. El ZIP/CSV son para trabajar con datos y **no se importan** en la app.

**JSON:** respaldo completo **versión 2**, incluye estaciones, identidades internas, revisiones, fotos, contador monotónico, papelera, versiones anteriores, borradores sin finalizar y capas del mapa. Las fotos se codifican como data URLs base64 sólo en el archivo exportado; en IndexedDB siguen siendo blobs. Base64 incrementa el tamaño aproximadamente un tercio. Exporta después de cada jornada y guarda una copia fuera del navegador. CSV y ZIP incluyen únicamente las estaciones finalizadas activas, sin papelera, versiones ni borradores.

**Importación:** acepta JSON de Estrato **v1 y v2**, hasta 250 MB. Valida datos y contenido real de todas las fotos antes de abrir una vista previa. El formulario actual se conserva.

- Dos estaciones de distinta identidad nunca se reemplazan por compartir `EST-001`: se renumera la importada y se conserva el ID de origen.
- Para la misma identidad con cambios, **Conservar ambas versiones** es la opción predeterminada: crea una copia de identidad nueva. **Actualizar la misma identidad** sustituye sus datos/fotos, mantiene su ID local y guarda el estado actual como versión anterior recuperable.
- Un registro idéntico ya existente se omite. Volver a importar la misma versión conservada como copia no genera otra copia igual.
- Los respaldos v1 no contienen identidad: sólo se reconoce como existente un registro con ID/origen, datos y fotos idénticos. Los diferentes se agregan por separado, sin sobrescribir estaciones por su número.
- La papelera y las versiones se añaden sin borrar las locales. Importar una entrada de papelera nunca elimina una estación activa. Los borradores de clave ya existente se conservan localmente; los demás aparecen para recuperar.
- El respaldo v2 de otro celular puede contener un borrador de edición cuya base ya no coincide. Se mantiene la comprobación de revisión: si no es posible editar con seguridad, usa «Guardar como nueva».
- La escritura completa es atómica. Si la colección cambia en otra pestaña durante la vista previa, se rechaza la importación para que vuelvas a revisarla. Un error o falta de espacio revierte toda la escritura.
- Los IDs futuros respetan el mayor contador local/importado y los números de estaciones importadas. Haz un respaldo antes de restaurar versiones antiguas. Los respaldos v2 requieren Estrato v1.1 o posterior; la app antigua sólo reconoce v1.

## Publicar en GitHub Pages (HTTPS)

1. Crea un repositorio público, por ejemplo `estrato`. En GitHub Free los repositorios públicos permiten Pages sin contratar servicios.
2. Sube **los seis archivos de esta carpeta directamente a la raíz del repositorio**, sin una carpeta `outputs` adicional. No necesitas instalar paquetes ni compilar.
3. Abre **Settings → Pages → Build and deployment → Source → Deploy from a branch**.
4. Elige la rama **main**, carpeta **/(root)** y pulsa **Save**.
5. Espera la publicación y abre `https://TU_USUARIO.github.io/estrato/` (GitHub puede tardar unos minutos). Las rutas `./` hacen que la app funcione también dentro de la subcarpeta del repositorio.
6. Activa **Enforce HTTPS** en Settings → Pages si se ofrece. GPS, cámara y service worker requieren contexto seguro; HTTP remoto no sirve.
7. Entra con el teléfono, espera **Lista para usar offline**, instala y realiza la prueba en modo avión.

Consulta [GitHub: configurar la fuente de publicación](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) y [GitHub: proteger Pages con HTTPS](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https).

## Actualizaciones y caché

1. Cada vez que cambies HTML, iconos o manifiesto, incrementa `VERSION` en `sw.js` (la actual es `v1.3.0`; siguiente ejemplo `v1.3.1`) y publica todos los archivos juntos.
2. La instalación de la nueva caché usa `cache: 'reload'` para evitar archivos antiguos de la caché HTTP. La nueva versión espera; no se fuerza una recarga mientras estás registrando.
3. Con conexión, abre **Exportar → Buscar actualización**. Cuando esté disponible, guarda o descarta el formulario y pulsa **Aplicar actualización**. La app activa el worker nuevo y recarga. IndexedDB se conserva.
4. Al activarse, se eliminan solamente cachés antiguas de Estrato para ese alcance; no otras PWAs del mismo dominio.
5. Si necesitas forzar desde DevTools: **Application → Service Workers → Update**, luego **skipWaiting** y recarga. Guarda el formulario antes. Puedes borrar solo la caché de Estrato para diagnóstico, con conexión, y recargar. **No uses Clear site data / borrar IndexedDB** para actualizar: perderías las estaciones.

Cache-first significa que una recarga normal sigue usando la versión instalada hasta activar la nueva. Detalles en [MDN: uso de service workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers).

## Verificación realizada

Probado el 29 de septiembre de 2026 con servidor estático `python -m http.server`, Chrome 154.0.8037.92 y un perfil de prueba independiente. La instalación se verificó mediante el protocolo de Chrome DevTools (`Page.getAppManifest` y `Page.getInstallabilityErrors`): manifiesto válido y cero errores de instalabilidad. Se inspeccionaron service worker, los cinco recursos cacheados y los blobs de IndexedDB.

Pruebas aprobadas:

- Vista móvil de 390 px sin desbordamiento; revisión visual en modo claro y oscuro.
- Validaciones obligatorias y rangos; valores extremos válidos de rumbo/buzamiento.
- Selección de seis fotos limitada a cinco; reducción de 2400 × 1200 a 1280 × 640 px; persistencia de JPEG como Blob.
- Guardar, recargar, ver fotos, editar conservando fecha, borrar, buscar y filtrar por litología.
- CSV con BOM, UTF-8, comillas, saltos de línea y neutralización de fórmulas.
- ZIP abierto con un lector independiente de Python: CRC correcto, CSV idéntico y cinco fotos idénticas al respaldo JSON.
- JSON restaura fotos, combina estaciones, conserva el contador y rechaza coordenadas/fotos corruptas sin modificar datos.
- Dos guardados simultáneos reciben IDs distintos; un ID eliminado no se reutiliza.
- GPS simulado y denegado, limpieza de precisión tras entrada manual, cámara simulada y denegada, lectura de brújula simulada.
- Red bloqueada y confirmada mediante una petición no cacheada fallida: recarga del shell, fotos, nueva estación y exportación ZIP/JSON funcionan offline. El estado cambia a «Sin conexión».
- Instalación bajo `/estrato/`, como un repositorio de GitHub Pages: rutas, scope y start_url correctos.
- Publicación simulada de v1.0.1: espera de actualización, protección del formulario, activación, recarga, eliminación de caché antigua y conservación de IndexedDB; la versión nueva funciona offline.
- Sin errores JavaScript no capturados durante las pruebas.

No se ha instalado físicamente en Android/iPhone ni se han probado sensores reales o el diálogo de permisos de iOS. Usa la lista de comprobación anterior en tu teléfono antes de una jornada de campo.

## Actualización v1.1: compatibilidad y pruebas

La base anterior se migra de forma transaccional a versión 2, conservando estaciones, fotos, fechas e IDs; agrega identidad interna y revisión a cada estación. No hace falta borrar datos ni reinstalar. Antes de aplicar, guarda o descarta el formulario. Si otra pestaña impide migrar, ciérrala y vuelve a abrir Estrato. Descarga un respaldo externo antes de cualquier actualización.

Pruebas adicionales aprobadas en Chrome con datos y perfiles de prueba independientes:

- Actualización real desde el shell v1 a v1.1 mediante service worker: foto y estación intactas, contador intacto, identidad añadida y caché anterior retirada.
- Borrador con cinco fotos comprimidas: recuperación después de recargar; eliminación del borrador al finalizar el registro.
- Cierre completo y reapertura del navegador: recuperación de borrador y foto.
- Papelera con fotos y restauración; recuperación de versión anterior con cambio en el número de fotos.
- Ediciones simultáneas: rechazo de sobrescritura y conservación de borrador; guardar como nueva identidad.
- Respaldo v2 restaurado en un navegador vacío: estaciones, papelera, versiones, borrador y todas sus fotos.
- Importación de dos `EST-001` de distintos celulares: ambos registros conservados, ID importado renumerado.
- Conservar ambas versiones, repetir importación sin duplicados y actualizar explícitamente la misma identidad con recuperación de versión anterior.
- Respaldos v1 compatibles; datos/fotos inválidos y cancelación sin cambios; rechazo si otra pestaña cambia la colección durante la vista previa.
- Fallo real de transacción IndexedDB después de escribir datos parciales: estación y contador revertidos, borrador conservado.
- Offline: recuperar borrador/foto, leer fotos, restaurar papelera y exportar JSON v2.
- ZIP/CSV verificados con lector independiente; instalación sin errores, interfaz móvil clara/oscura y ausencia de errores JavaScript no capturados.


## Mapa offline · v1.2

La navegación ahora tiene **Nueva, Lista, Mapa y Exportar**. La pestaña Mapa dibuja las estaciones activas directamente desde IndexedDB; no consulta servidores, no utiliza bibliotecas externas y no descarga mapas de terceros. La vista inicial es una **cuadrícula WGS84**, no un mapa de calles, relieve o satélite. Para mostrar referencias de una zona hay que importar previamente una capa GeoJSON que las contenga.

- **Ver estaciones** encuadra los puntos que coinciden con el filtro de litología. Los puntos llevan ID y colores por litología; puntos próximos pueden compartir color, y siempre pueden identificarse por ID, etiqueta y selector.
- Arrastra con un dedo, amplía con dos o usa los botones +/−. Con teclado: flechas para desplazarte, +/− para zoom y Home para encuadrar estaciones. Las cuatro pestañas admiten flechas, Home y End. La lista desplegable permite seleccionar puntos superpuestos; tocarlos repetidamente alterna entre puntos cercanos.
- Toca un punto o selecciona una estación para abrir **Ver datos y fotos**. Los filtros del mapa y de la lista son independientes. La papelera y los borradores no se dibujan como estaciones.
- **Mi ubicación** solicita una única lectura GPS de alta precisión, muestra ± metros y hora, y centra el mapa. No guarda una estación, no modifica el formulario ni sigue el recorrido. La distancia hasta el punto seleccionado es geodésica aproximada en línea recta, no una ruta transitable; se calcula desde la última lectura. La ubicación se pierde al cerrar o recargar y no va en los respaldos. Los errores de permiso o disponibilidad dejan visible la colección.
- El visor usa un plano de coordenadas con ajuste horizontal por la latitud de referencia, norte arriba y escala aproximada. Es adecuado para ubicar puntos y comparar una zona local; no sustituye un SIG ni permite medir áreas. Admite estaciones hasta ±90° y encuadra puntos cercanos a ambos lados del meridiano 180°.

### Preparar referencias para usar sin red

En **Mapa → Capas guardadas → Importar capa GeoJSON**, selecciona un archivo `.geojson` o `.json`. Puede contener límites geológicos, ríos, caminos o puntos de referencia. Si partes de otro sistema de coordenadas, exporta o reproyecta el archivo a **WGS84 / EPSG:4326** antes de importarlo: las posiciones deben estar en orden **[longitud, latitud]**, en grados. No se reproyectan coordenadas UTM. Un CRS declarado diferente se rechaza; un archivo sin CRS se interpreta como WGS84.

Se admiten Point, MultiPoint, LineString, MultiLineString, Polygon con huecos, MultiPolygon y GeometryCollection; FeatureCollection, Feature o geometría individual. Líneas requieren al menos dos posiciones y anillos cerrados al menos cuatro. Las capas conservan su geometría 2D y un nombre de elemento, no todos sus atributos originales; conserva el archivo fuente si necesitas esos atributos. No se dibujan etiquetas de elementos de referencia.

Límites por dispositivo: **8 capas**, hasta **20 MB por archivo**, **10.000 elementos** y **100.000 coordenadas por capa**. Simplifica o divide capas grandes para evitar lentitud en celulares. Un archivo inválido no modifica las capas guardadas. Cada capa tiene visibilidad, **Ver zona**, **Exportar capa** y **Retirar capa** con confirmación. Retirar una capa no borra estaciones. Exporta antes de retirarla si necesitas recuperarla; no hay papelera de capas.

Las capas se guardan en `meta`, clave `mapLayers`, dentro de la misma base IndexedDB versión 2. No hay cambio de versión de base respecto de v1.1. Un respaldo JSON v2 de v1.2 incluye `mapLayers`. Los respaldos antiguos sin ese campo siguen funcionando y **no eliminan capas locales**. La vista previa indica cuántas capas se añadirán; las idénticas por nombre y geometría se omiten. Si sumar ambas colecciones excede ocho capas, la importación se rechaza sin cambios. Una capa distinta con identidad coincidente se conserva por separado. La importación de capas y estaciones forma parte de la misma transacción y detecta cambios de otra pestaña durante la vista previa. Para restaurar capas, usa v1.2 o posterior: versiones previas ignoran ese campo.

Usa datos autorizados para tu finalidad y conserva su atribución cuando corresponda. El servidor estándar `tile.openstreetmap.org` no permite descargar zonas para uso offline; esta app no lo utiliza ni incorpora una función de descarga de sus imágenes. Consulta la [política oficial de OpenStreetMap](https://operations.osmfoundation.org/policies/tiles/). La capacidad de ver caminos o unidades geológicas depende del contenido del archivo importado.

### Exportar a QGIS

**Exportar → Descargar GeoJSON** produce un FeatureCollection de todas las estaciones activas, con UUID como identidad de elemento, coordenadas **[lon, lat]** y altitud opcional como tercera coordenada. Las propiedades incluyen ID, fecha, datos geológicos, precisión, observaciones y nombres de fotos. No contiene blobs ni imágenes; usa ZIP para llevar las fotos y JSON para restaurar toda la app. La exportación funciona offline y usa WGS84. Puedes abrirla en un SIG o importarla como capa de referencia en otro dispositivo; importar una capa no convierte sus puntos en estaciones editables.

### Pruebas de v1.2

Pruebas aprobadas en Chrome con un perfil independiente y servidor estático local:

- Mapa vacío, cuatro pestañas y navegación por teclado; tres estaciones de dos litologías, filtros, selección de puntos, zoom y detalle con foto.
- GPS simulado, permiso denegado y distancia hasta una estación sin guardar ni modificar registros.
- Capas con polígonos/huecos, líneas, multipuntos, multipolígonos y colecciones; visibilidad persistente, recarga y rechazo de coordenadas/CRS inválidos o capas duplicadas.
- Encuadre en el meridiano 180°, latitudes polares, gesto de dos dedos y revisión visual en móvil de 390 px, sin desbordamiento, en claro y oscuro.
- Exportación GeoJSON verificada: orden de coordenadas, tres puntos, atributos y nombres de fotos.
- Respaldo con capa, estaciones y foto restaurado en navegador vacío; repetición sin duplicar capas.
- Red bloqueada: recarga, mapa, capas, datos, fotos y descarga GeoJSON disponibles.
- Manifiesto válido, cero errores de instalabilidad y cero errores JavaScript no capturados.
- Regresión de borradores, papelera, versiones anteriores, concurrencia, importaciones v1/v2 y exportaciones CSV/ZIP/JSON aprobada.

GPS real, sensores y funcionamiento en Android/iPhone siguen requiriendo la prueba física indicada arriba. Antes de una jornada, verifica en modo avión tanto los puntos como las capas que necesitas.


## Identidad visual · v1.3

Estrato incorpora una identidad de libreta geológica: emblema propio de estratos cruzados por una falla, cabecera con pliegues, tonos de basalto, papel, óxido y ocre, títulos de atlas y fichas con numeración y detalles de encuadernación. Los iconos instalables de 192/512 px usan el mismo emblema y se generan con Python estándar, sin recursos remotos. La interfaz mantiene una columna, las cuatro pestañas, botones grandes y modo oscuro automático. Las tipografías son del sistema y el dibujo es SVG/CSS inline; todo queda en el shell offline.

Esta actualización cambia presentación e iconos. Conserva la base de datos, el formato de respaldos y las estaciones existentes. El caché nuevo es v1.3.0; actualiza desde Exportar → Buscar actualización → Aplicar actualización después de guardar el formulario.

Se revisaron las cuatro pestañas en 320, 360, 390, 768 y 1280 px, sin desbordamiento horizontal; formularios, fichas y diálogos en modos claro y oscuro. Los pares principales de texto, ayudas y botones superan 4,5:1 de contraste calculado. Se verificó guardar y abrir estaciones desde la interfaz y se ejecutó nuevamente la prueba de mapa, capas, fotos, gestos táctiles, exportación y respaldo offline. El manifiesto conserva su identidad y las rutas de instalación.
