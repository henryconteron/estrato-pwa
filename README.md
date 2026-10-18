<p align="center">
  <img src="./estrato-banner-v2.png" alt="Estrato · Cuaderno geológico de campo" width="820">
</p>

# Estrato

**Cuaderno geológico de campo, instalable y disponible sin conexión.** Registra estaciones, mediciones estructurales, fotografías y muestras desde el teléfono. Organiza campañas, revisa tus puntos en un mapa y exporta los datos para seguir trabajando en Excel o QGIS.

**[Abrir Estrato](https://henryconteron.github.io/estrato-pwa/)** · **[Ver código](https://github.com/henryconteron/estrato-pwa)**

Creado por **[Henry Conteron](https://github.com/henryconteron)**, geólogo y autor del proyecto.

## Qué ofrece

- **Registro de campo:** ubicación WGS84, litología, notas, fecha, precisión del GPS y hasta cinco fotografías por estación.
- **Estructuras:** una orientación principal y mediciones adicionales planares o lineales, con método, calidad, notas y fotos vinculadas a cada lectura.
- **Muestras y campañas:** códigos de bolsa, estados, fotografías, filtros y búsqueda.
- **Mapa offline:** puntos guardados, capas GeoJSON y una imagen georreferenciada como fondo local. No descarga mapas remotos.
- **Revisión:** avisos para datos que conviene comprobar y rosa de rumbos con recuento por lectura planar.
- **Salidas de trabajo:** CSV, GeoJSON, ZIP con fotografías, informe HTML imprimible y respaldo JSON completo.
- **Uso sin conexión:** la interfaz se guarda en el dispositivo; los registros y fotografías permanecen en IndexedDB del navegador.

## Instalar y comenzar

1. Abre **[Estrato](https://henryconteron.github.io/estrato-pwa/)** desde Chrome en Android o Safari en iPhone y espera el mensaje **«Lista para usar offline»**.
2. Usa **Instalar app** en el menú de Chrome, o **Compartir → Añadir a pantalla de inicio** en Safari.
3. Crea una estación en **Nueva**. Si prefieres explorar primero, carga la demostración con datos ficticios desde la app.
4. Al terminar la jornada, descarga un **respaldo JSON** y consérvalo fuera del teléfono.

El GPS y la brújula dependen de los permisos y sensores del dispositivo. Revisa las lecturas con instrumentos de campo. Estrato no sincroniza entre dispositivos: cada navegador conserva su propia colección y el JSON permite trasladarla.

## Archivos y privacidad

Estrato es una PWA en HTML, CSS y JavaScript, sin servidor de datos ni cuenta. El código de esta versión no envía estaciones, fotos ni coordenadas a un servicio externo. Borrar los datos del sitio o cambiar de navegador puede eliminar la colección local si no tienes un respaldo.

| Formato | Uso |
| --- | --- |
| CSV | Tabla de estaciones y mediciones para hoja de cálculo. |
| GeoJSON | Puntos WGS84 y atributos para SIG. |
| ZIP | CSV y fotografías con nombres vinculados a cada estación o muestra. |
| HTML | Informe de campaña imprimible y utilizable sin conexión. |
| JSON | Respaldo completo para restaurar estaciones, fotos, borradores y papelera. |

## Estado del proyecto

**Versión 1.11.1.** La app funciona como PWA y aún está en desarrollo. Las pruebas automatizadas con datos sintéticos cubren el registro, varias mediciones, fotos vinculadas, edición, exportaciones, respaldo, restauración, uso sin conexión y ancho móvil. GPS, cámara y brújula requieren comprobación en teléfonos reales antes de una publicación en tiendas.

La [investigación comparativa y ruta de producto](./INVESTIGACION_COMPETITIVA_Y_RUTA.md) recoge oportunidades para convertir Estrato en una herramienta de campo más completa.

## Desarrollo local

No hay proceso de compilación. Desde la raíz del repositorio:

```sh
python -m http.server 8000 --bind 127.0.0.1
```

Abre `http://127.0.0.1:8000/`. El modo offline y los sensores requieren HTTPS o localhost; abrir `index.html` como archivo no activa el service worker.

El recorrido automatizado está en [`tests/field-workflow.e2e.cjs`](./tests/field-workflow.e2e.cjs). Requiere Chrome y `playwright-core`, un servidor local en el puerto 8767 y un perfil de navegador aislado. La app en sí no depende de Playwright.

## Autor y créditos

**Henry Conteron** — idea, dirección del producto y desarrollo de Estrato. [Perfil de GitHub](https://github.com/henryconteron).

Las imágenes de marca y el código de esta aplicación forman parte de este repositorio. Las capas, mapas e imágenes que importe cada usuario conservan la atribución de sus fuentes originales.
