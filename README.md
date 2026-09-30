# Estrato · Cuaderno geológico offline

PWA en español para registrar estaciones desde el teléfono. HTML/CSS/JS vanilla, sin backend, sin cuentas, sin servicios de pago, sin bibliotecas externas y sin proceso de compilación. Los datos y fotos nunca se envían a un servidor.

Sitio de instalación: **https://henryconteron.github.io/estrato-pwa/**.
Código fuente: **https://github.com/henryconteron/estrato-pwa**.

## Archivos

- `index.html`: interfaz, estilos, IndexedDB, cámara/GPS/brújula, mapa base offline, medición de distancias, informe imprimible, demostración, CSV, ZIP, GeoJSON y JSON.
- `manifest.webmanifest`: nombre, identidad, alcance e instalación.
- `sw.js`: caché versionada del app shell, con estrategia cache-first.
- `icon-192.png` e `icon-512.png`: iconos PNG generados con Python estándar; el dibujo está dentro de la zona segura para iconos maskable.
- `estrato-logo-v2.png`: emblema de alta resolución con fondo transparente.
- `estrato-banner-v2.png`: cabecera de 2172 × 724 px (3:1).
- `identidad-estrato-prompts.md`: especificaciones de las imágenes.
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
3. En **Cache Storage**, comprueba una caché `estrato-…-v1.8.0` con la portada, `index.html`, manifiesto, iconos, logo y banner.
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


## Campañas y muestras · v1.4

En Nueva → Gestionar campañas crea un proyecto o jornada con nombre, zona, fechas y notas. Selecciona la campaña antes de guardar la estación. Las estaciones anteriores siguen intactas y aparecen en «Sin campaña»; puedes asignarlas al editar. Archivar una campaña oculta su selección para nuevas estaciones, pero conserva su consulta, exportación y edición de estaciones existentes. Reactivarla vuelve a habilitarla. No se eliminan campañas ni registros al archivar.

En «Muestras y bolsas» añade hasta 30 muestras por estación. Cada una tiene código de bolsa (hasta 80 caracteres), descripción (hasta 4.000), estado Recolectada / En laboratorio / Analizada / Descartada y hasta 5 fotos propias comprimidas a 1280 px. Un código vacío se asigna al guardar: EST-001-M01. Los códigos son únicos dentro de una estación; rotula la bolsa con campaña, estación y código. El estado es una anotación manual y no representa una integración con un laboratorio. El botón Cámara de muestra abre la captura del teléfono cuando el navegador la admite, y puede ofrecer selección de imágenes en otros equipos.

Las muestras y sus Blob de fotos se guardan dentro del registro IndexedDB de la estación: la edición, historial y papelera se actualizan en la misma transacción. Los borradores conservan campaña, muestras y fotos propias. No se usa localStorage. Las campañas se guardan en meta; la base sigue en versión 2, sin reconstruir ni borrar registros.

Lista permite filtrar por campaña y buscar también un código de muestra. Mapa dispone del mismo filtro junto al de litología. Las capas de referencia siguen siendo compartidas por todas las campañas. La pestaña Exportar selecciona campaña para CSV de estaciones, CSV de muestras, ZIP y GeoJSON; «Sin campaña» es también una selección válida. El CSV original conserva sus 13 columnas. El CSV de muestras añade campaña y estación a cada bolsa. El ZIP incluye estaciones.csv, muestras.csv, campanas.csv (con los IDs de sus estaciones) y fotos de ambos tipos: EST-001_01.jpg y EST-001_M01_01.jpg. La fila de muestras indica el nombre exacto de sus fotos. GeoJSON lleva el nombre de campaña y los metadatos de muestras, sin imágenes binarias.

El respaldo JSON **v3 siempre incluye toda la colección**, aunque se haya elegido una campaña para las otras exportaciones: campañas activas/archivadas, estaciones, muestras, fotos, borradores, papelera, versiones y capas. Requiere Estrato v1.4 o posterior para restaurarlo. También se admiten respaldos v1/v2, que quedan sin campaña ni muestras cuando esos datos no están presentes. Las importaciones muestran vista previa y conservan ambas versiones por defecto. Una campaña con igual identidad pero datos diferentes se conserva por separado, con sus referencias asociadas; reimportar el mismo respaldo no duplica campañas ni estaciones idénticas. Fotos inválidas o referencias a campañas inexistentes rechazan la importación completa.

El caché es **v1.4.0**. Guarda el formulario y usa Exportar → Buscar actualización → Aplicar actualización con conexión. Los datos de campo quedan en IndexedDB; la actualización del shell no los borra. Mantén respaldos JSON externos.

Validación: Chrome local mediante servidor estático y perfiles de prueba aislados. Instalabilidad aprobada por el protocolo de DevTools, uso offline con muestras/fotos, compresión, códigos duplicados, borradores tras recarga, edición/historial/papelera, filtros de campaña, CSV con BOM, integridad CRC del ZIP, GeoJSON y restauración v3 en navegador vacío. Probadas importaciones repetidas/conflictivas y respaldo v2. La actualización real del service worker desde v1.3 preservó identidad, fecha, fotos y contador. Se repitieron pruebas del mapa/capas y de importación/concurrencia; diseño claro/oscuro en 320, 390 y 768 px sin desbordamientos. Cámara y sensores reales de Android/iPhone requieren prueba física; los datos de estas pruebas no se publican.


## Registro rápido y revisión de campo · v1.5

En Nueva abre «Registro rápido y guías». Selecciona Sedimentaria, Ígnea o Metamórfica para ver cinco temas de observación. «Añadir guía a las notas» anexa apartados vacíos a las notas existentes, sin asignar litología ni medidas. Completa lo observado y elimina los apartados que no apliquen. Una guía sin completar mantiene el aviso de notas pendientes. La guía elegida se conserva en borradores, estaciones, versiones y respaldos mediante el campo opcional templateKey; el formato JSON sigue siendo v3. Respaldos v1/v2/v3 sin este campo siguen siendo válidos.

«Reutilizar geología de EST-…» toma la última estación guardada (mayor ID) de la campaña elegida; Sin campaña tiene su propio grupo. También puedes elegir un registro concreto desde Lista → Usar geología. Se copian campaña, litología, tipo de medida, notas y guía a una estación nueva. ID y fecha son nuevos; coordenadas, altitud, precisión GPS, rumbo, buzamiento, dirección, fotos y muestras quedan vacíos. Revisa siempre las notas copiadas para la nueva ubicación. Si hay un formulario pendiente, se confirma su descarte antes de iniciar otro; cancelar conserva todo. La copia se guarda como borrador automáticamente y solo se convierte en estación al pulsar Guardar.

La «Revisión de campo» aparece en el formulario y en Ver estación. Lista permite filtrar estaciones con avisos o con códigos repetidos. Los avisos se calculan con los datos actuales; no modifican las observaciones ni los registros. Comprueban:

- GPS con precisión mayor que ±20 m. Es un umbral orientativo de esta app, no una certificación de exactitud. Las coordenadas manuales sin precisión no se penalizan por ese motivo.
- Rumbo o buzamiento ausentes para un tipo de medida distinto de Otra. La dirección de buzamiento sigue siendo opcional.
- Notas vacías o que solo contienen apartados de una guía sin completar.
- Muestras sin descripción.
- Códigos de bolsa usados en más de una estación activa de la misma campaña (incluido el grupo Sin campaña). La comparación ignora espacios externos, mayúsculas y acentos. Los códigos de campañas diferentes no se comparan entre sí. Papelera, borradores y versiones anteriores no cuentan como estaciones activas.

Los avisos de calidad no bloquean guardar registros válidos. Los límites y campos obligatorios originales siguen activos: coordenadas y litología son obligatorias, los rangos numéricos se validan y los códigos repetidos dentro de una misma estación deben corregirse. Al editar, cambiar de campaña, importar, borrar o restaurar se recalcula la revisión; se excluye la propia estación durante una edición para no generar falsos duplicados.

La base sigue en IndexedDB versión 2 y los respaldos completos siguen en JSON v3. El caché es **v1.5.0**: guarda o descarta el formulario y usa Exportar → Buscar actualización → Aplicar actualización. No borres los datos del sitio para actualizar.

Pruebas locales en Chrome con perfiles aislados: tres guías sin inventar mediciones, anexado de notas sin sobrescribir, recuperación del borrador con guía, GPS simulado de 50 m con aviso y guardado permitido, copia de contexto con nuevo ID/fecha y datos de ubicación/medidas/fotos/muestras vacíos. Bolsas repetidas dentro de una campaña, exclusión de otras campañas y de la propia edición, actualización tras corregir/borrar/restaurar, cancelar descarte conservando el formulario, selección de última estación por campaña y umbral GPS >20 m. Restauración v3 en navegador vacío conserva guías y recalcula avisos. Todo probado offline; instalabilidad aprobada, cero errores JavaScript y diseño claro/oscuro a 320/390/768 px sin desbordamiento. La actualización real v1.4 → v1.5 conservó campaña, identidad, fecha, bolsas y fotos de estación/muestra; la base y contador permanecieron intactos. Se repitieron pruebas del mapa/capas y de campañas/muestras. No se publican datos de prueba. Los sensores físicos de Android/iPhone siguen requiriendo prueba en el dispositivo.

También pasó la regresión de importaciones y edición simultánea: cambios concurrentes no se sobrescriben, importaciones inválidas/canceladas no escriben datos y respaldos antiguos no duplican registros idénticos.

## Mapas base, informes y demostración · v1.6

### Mapa base offline

En Mapa abre «Mapa base offline». Importa una imagen **PNG o JPEG** de tu zona (máximo 20 MB y 40 megapíxeles de entrada). Debe representar un rectángulo con **norte arriba y coordenadas WGS84/EPSG:4326**, con distribución lineal de longitud/latitud. Escribe nombre, fuente/autor y coordenadas decimales de los bordes Oeste, Este, Sur y Norte. Usa imágenes que tengas permiso de utilizar. Oeste debe ser menor que Este, Sur menor que Norte, y el ancho longitudinal no puede superar 180°. No se admiten imágenes rotadas ni zonas que cruzan el antimeridiano. Una captura Mercator, una imagen con bordes/marcos o una fotografía de un mapa no se alinean correctamente: prepara, reproyecta y recorta el área útil en tu SIG antes de importarla. No se interpreta GeoTIFF, MBTiles ni archivos de georreferenciación.

La imagen se reduce a **2560 px de lado mayor** y se guarda como Blob en IndexedDB, dentro de `meta.baseMaps`. Hasta 4 fondos. El selector muestra uno a la vez; puedes cambiar opacidad o ver su zona completa. Fondo y opacidad seleccionados se recuerdan localmente en `meta.baseMapView`. Retirar un fondo pide confirmación y no borra estaciones. La cuadrícula, puntos, capas GeoJSON y GPS siguen funcionando. No se descargan teselas ni mapas de terceros: prepara las imágenes antes de salir. Comprueba la alineación con puntos conocidos; la app no puede verificar que los bordes indicados correspondan a la imagen.

«Medir distancia» permite tocar dos puntos. La distancia aproximada es geodésica en línea recta (Haversine); no representa longitud de sendero ni desnivel. Puedes arrastrar o ampliar durante la medición. Un tercer toque inicia otra. Para teclado: flechas para desplazar, +/- para ampliar y Enter para marcar el centro. «Terminar medición» limpia los puntos; no se guardan como registros.

### Informe de campaña

En Exportar elige una campaña, Todas o Sin campaña y pulsa **Descargar informe de campaña**. Obtendrás un HTML autónomo con imágenes incrustadas: abre el archivo descargado y pulsa **Imprimir / Guardar PDF**; el diálogo del navegador permite imprimir o elegir Guardar como PDF. En algunos celulares conviene abrir el archivo desde Archivos con el navegador o llevarlo al computador. El informe también se puede leer sin imprimir y sin conexión.

Incluye mapa con todas las estaciones seleccionadas, índice, coordenadas/altitud/precisión, orientaciones, notas, muestras, estados manuales, fotos de estaciones y bolsas y avisos de revisión. Usa el fondo seleccionado en Mapa si es compartido o corresponde a la campaña elegida; si no, intenta usar el fondo asociado a esa campaña. Muestra fuente y bordes del fondo. El mapa se ajusta al contenido del informe, independientemente de la vista actual; la escala es aproximada. No incluye capas GeoJSON de referencia, posición GPS actual ni mediciones temporales del mapa. Tampoco borradores, papelera o versiones anteriores. **El informe no reemplaza el respaldo JSON.** Puede ser grande si hay muchas fotografías. Al contener tus datos y fotos, decide tú con quién compartir el archivo.

### Campaña de prueba

En Exportar pulsa **Cargar demostración**. Se añade una campaña «DEMO · Quebrada de los Estratos» con 3 estaciones, 2 muestras, 5 imágenes sintéticas y un mapa geológico inventado. Las coordenadas son de entrenamiento: no representan observaciones reales. Incluye un GPS de ±35 m y una orientación incompleta para practicar la revisión. No usar la demo para navegar ni interpretar geología.

La carga es aditiva y atómica: conserva tus estaciones, fotos, versiones, papelera y formulario/borrador pendiente. Asigna los siguientes IDs disponibles. Repetir el botón abre la campaña de demostración existente y no la vuelve a crear. Si has editado sus ejemplos, se conservan esas ediciones. Necesita espacio para un fondo. El código de la demo se publica, pero los datos solo se generan en tu dispositivo al pulsar el botón. Puedes filtrar otra campaña para seguir trabajando, archivar la demo o mover sus estaciones a la papelera desde Lista. Las exportaciones de Todas incluyen la demo: elige tu campaña real cuando quieras excluirla.

### Respaldo y actualización

El respaldo completo ahora es **JSON v4**, incluyendo fondos como base64, sus bordes, fuente y asociación de campaña. Restaura también estaciones, muestras, fotos, borradores, papelera, historia, campañas y GeoJSON. Admite importaciones v1/v2/v3. Para recuperar un respaldo v4 usa **Estrato v1.6 o posterior**. Los fondos idénticos no se duplican al reimportar; los diferentes se conservan por separado, hasta el límite de 4. Fondos corruptos, límites/dimensiones inválidos o referencias a campañas inexistentes rechazan toda la importación antes de escribir. La preferencia de fondo visible es propia del dispositivo y no forma parte del respaldo.

El caché es **v1.6.0**; la base sigue en IndexedDB **versión 2**. Actualiza con conexión: guarda o descarta el formulario, Exportar → Buscar actualización → Aplicar actualización. No borres los datos del sitio. Conserva una copia JSON fuera del navegador.

### Verificación

Chrome con servidor estático local y perfiles aislados: demo aditiva/idempotente con estación y borrador previos intactos, medición por toque/teclado, recarga con red bloqueada y fondo/opacidad recuperados, informe autónomo con 3 fichas/2 bolsas/5 fotos y campaña filtrada, imágenes cargadas offline, diseño de impresión y textos escapados. Respaldo v4 restaurado en perfil vacío y reimportado sin duplicados; rechazo de mapas corruptos, bordes inválidos, dimensiones incorrectas y referencias inexistentes. Importación de una imagen de 3000 px reducida a 2560 y retiro sin borrar estaciones. Diseño claro/oscuro a 320/390/768 px sin desbordamiento, instalabilidad sin errores y cero errores JavaScript. Actualización real v1.5 → v1.6 conserva campaña, identidad, fechas, muestra y ambas fotos. Se repitieron las pruebas de guías, calidad, borradores, papelera, historial e importación concurrente. Sensores físicos de Android/iPhone e impresión desde cada sistema siguen requiriendo prueba en esos dispositivos.

## Análisis estructural · v1.7

En **Mapa → Análisis estructural · Rosa de rumbos** compara los rumbos guardados. La selección toma los filtros de campaña y litología de Mapa, incluyendo puntos fuera de la vista. Elige estratificación, falla, diaclasa, foliación, todas las estructuras de plano o explícitamente Otra (solo si representa el rumbo de un plano). No se analiza la papelera, historial ni borradores.

La rosa es **axial**: se agrupa el rumbo módulo 180° y se refleja el mismo sector al lado opuesto. 0°, 180° y 360° equivalen; cada estación cuenta una sola vez en el total. Puedes usar intervalos de 10°, 15° o 30°, que incluyen el borde inicial y excluyen el final. Un 10° exacto entra en 10–20° con intervalos de 10°. Un valor vacío o inválido se excluye y no se sustituye por 0°. No se inventa un buzamiento ni se requiere para contar un rumbo válido ya registrado.

El área de los sectores es proporcional al recuento: radio = radio máximo × raíz cuadrada(recuento / máximo). El anillo exterior representa el máximo de medidas en un intervalo; los anillos interiores representan 25%, 50% y 75% de esa frecuencia por área. La tabla accesible conserva recuentos, porcentajes y los IDs ordenados. El total de la tabla es n, aunque visualmente haya sectores opuestos. El resumen muestra rumbos válidos, faltantes, estaciones excluidas por tipo e intervalos con mayor frecuencia (incluyendo empates). Con menos de cinco medidas se indica que la muestra es pequeña. El pico depende del ancho de los intervalos; esta herramienta describe registros y no infiere esfuerzo, sentido de deslizamiento ni tendencias regionales.

**Descargar rosa PNG** genera una imagen de 1200 × 1240 px, en colores claros para imprimir, con tipo, n, intervalo y referencia de selección. **Descargar recuentos CSV** conserva UTF-8 con BOM, selección, tipo, intervalos, rangos opuestos, recuentos, porcentajes e IDs; su suma de recuentos es n. El análisis y las descargas funcionan sin conexión y no modifican los registros.

El informe de campaña incluye rosas separadas por estratificación, falla, diaclasa y foliación que tengan estaciones registradas. Usa intervalos fijos de 10° y todas las estaciones de la selección de Exportar, sin depender de filtros temporales del mapa. Otra no entra en el informe estructural. Si no hay rumbos válidos, se indica explícitamente; no se genera una orientación ficticia.

Concepto de rumbo de un plano: [USGS, Strike](https://www.usgs.gov/media/images/strikegif). La representación axial y los intervalos descritos arriba son las decisiones de implementación de Estrato; no representan un estándar de interpretación o certificación.

La base sigue en IndexedDB **v2**, los respaldos completos en JSON **v4**, y el caché pasa a **v1.7.0**. Actualiza con conexión desde Exportar → Buscar actualización → Aplicar actualización. Los registros e imágenes existentes se conservan. No se añaden datos de demostración automáticamente.

Verificación en Chrome local con perfiles aislados: límites 0/180/360 y bordes de intervalos, valores faltantes, grupos 10/15/30°, filtros campaña/litología/tipo, Otra solo explícita, empates y muestra pequeña. Recuentos e IDs trazables, CSV con BOM, PNG 1200 × 1240 px, actualización tras borrar/restaurar, informe con rosas del snapshot de campaña, recarga y descarga offline con red bloqueada. Diseño claro/oscuro a 320/390/768 px, tabla accesible, instalabilidad sin errores y cero errores JavaScript. Los datos sintéticos se usan solo en perfiles de prueba separados, sin agregarlos al navegador del usuario.


## Identidad visual · v1.8

La nueva cabecera usa un banner propio: tres estratos plegados cortados por una falla, curvas de nivel discretas y el nombre Estrato. El emblema transparente se entrega por separado; los iconos instalables de 192 y 512 px se derivan de él con un script de conversión. El símbolo queda dentro de la zona segura central de los iconos maskable.

Logo y banner se generaron con la herramienta integrada de imágenes. Los prompts y dimensiones están en `identidad-estrato-prompts.md`. Son recursos locales incluidos en el shell cache-first, sin fuentes ni imágenes remotas. Añaden aproximadamente 1.8 MB a la descarga inicial.

El caché actual es **v1.8.0**. Con conexión, usa **Exportar → Buscar actualización → Aplicar actualización**. La actualización cambia la interfaz y los recursos; conserva IndexedDB v2 y los respaldos JSON v4. El icono de una instalación existente puede tardar en refrescarse según el navegador o sistema. No borres los datos de la app para refrescar su apariencia.
