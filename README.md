# Estrato · Cuaderno geológico offline

PWA en español para registrar estaciones desde el teléfono. HTML/CSS/JS vanilla, sin backend, sin cuentas, sin servicios de pago, sin bibliotecas externas y sin proceso de compilación. Los datos y fotos nunca se envían a un servidor.

Sitio de instalación: **https://henryconteron.github.io/estrato-pwa/**.
Código fuente: **https://github.com/henryconteron/estrato-pwa**.

## Archivos

- `index.html`: interfaz, estilos, IndexedDB, cámara/GPS/brújula, CSV, ZIP y JSON.
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

Espera **Lista para usar offline** antes de desconectarte. La primera apertura necesita conexión para descargar los archivos. Una vez preparada la caché, crear, editar, ver, borrar, buscar, importar y exportar funcionan sin conexión. No hay mapas, fuentes remotas ni llamadas a API. El indicador online/offline refleja la señal del navegador, no una comprobación de acceso real a internet.

### Chrome DevTools → Application

1. Abre DevTools y selecciona **Application → Manifest**. Comprueba nombre, `start_url`, `scope`, modo `standalone`, y ambos iconos; no debe haber errores de instalabilidad. No se incluyen capturas promocionales: puede faltar la presentación enriquecida del diálogo de instalación, pero la instalación básica sigue disponible.
2. En **Service Workers**, comprueba que `sw.js` está activado y controla la página. La primera instalación toma el control mediante `clients.claim()`.
3. En **Cache Storage**, comprueba una caché `estrato-…-v1.0.0` con la portada, `index.html`, manifiesto e iconos.
4. En **IndexedDB**, abre la base `estrato-field-notebook` y sus almacenes `stations`, `photos` y `meta`. `photos` contiene objetos **Blob**, nunca rutas de archivos ni localStorage.
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
- El formulario se conserva al cambiar de pestaña, pero **no es un borrador persistente**. Guarda antes de cerrar. Se advierte al salir con cambios donde el navegador lo permite.
- La app solicita `navigator.storage.persist()` al abrir y permite volver a solicitarlo en Exportar. El navegador decide si concede la persistencia; tampoco protege de un borrado manual de datos. [MDN: almacenamiento persistente](https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/persist).
- El uso estimado incluye IndexedDB y caché del origen y puede incluir otros sitios del mismo dominio. Si el navegador no ofrece una estimación, se muestran bytes de registros/fotos.
- Se requiere almacenamiento del navegador habilitado. Evita modo privado. Cada navegador/perfil/dispositivo/origen tiene su propia colección. Cambiar de dominio o borrar datos del sitio exige restaurar desde JSON.
- La edición de la misma estación desde dos pestañas usa el último guardado. Usa una pestaña para editar e importar; no hay sincronización entre dispositivos.

## Exportaciones y recuperación

**CSV:** UTF-8 con BOM, delimitador coma, comillas escapadas y saltos CRLF. Columnas:

```text
id,fecha,lat,lon,alt,precision_m,litologia,rumbo,buzamiento,dir_buzamiento,tipo,observaciones,nombres_fotos
```

Si Excel no separa columnas por su configuración regional, usa Datos → Desde texto/CSV → UTF-8 → delimitador coma. Los campos de texto que podrían interpretarse como fórmulas llevan un apóstrofo preventivo; el JSON conserva el texto original. `nombres_fotos` separa nombres con punto y coma.

**ZIP:** archivo ZIP32 construido inline sin bibliotecas: modo STORE, CRC32, nombres UTF-8, CSV y fotos en la raíz. Las fotos se nombran `EST-001_01.jpg`, `EST-001_02.jpg`, etc. JPEG ya está comprimido. Límites ZIP32: 65 535 archivos y menos de 4 GB; colecciones grandes también pueden agotar memoria del teléfono. El ZIP/CSV son para trabajar con datos y **no se importan** en la app.

**JSON:** respaldo completo de versión 1, incluye fotos como data URLs base64, contador monotónico e información de estaciones. Al exportarlo no modifica el almacenamiento interno de fotos, que continúa usando blobs en IndexedDB. Base64 incrementa el tamaño del archivo aproximadamente un tercio. Exporta después de cada jornada y guarda en Archivos, un disco o un lugar externo al navegador.

**Importación:** acepta únicamente JSON de Estrato versión 1, hasta 250 MB. Valida IDs únicos, fecha, rangos, tipos y contenido real de cada foto (JPEG/PNG/WebP, máximo 1280 px). Primero valida todo; luego solicita confirmación con cantidad de IDs que reemplazará. Combina estaciones y conserva las ausentes del respaldo. Sustituye registros y fotos de IDs coincidentes únicamente al confirmar. La escritura completa es atómica: un error o falta de espacio aborta la transacción. Los IDs futuros respetan el mayor contador local/importado. Haz un respaldo de la colección actual antes de restaurar versiones antiguas.

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

1. Cada vez que cambies HTML, iconos o manifiesto, incrementa `VERSION` en `sw.js` (por ejemplo `v1.0.1`) y publica todos los archivos juntos.
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
