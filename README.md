# mira design arquitectura · web

Web hecha con HTML, CSS y JavaScript, sin frameworks ni instalación.
Para verla, abre `index.html` en el navegador (doble clic).

## Páginas

```
index.html        página principal, todo seguido: portada, tres fotos en movimiento, proyectos (paneles),
                  cómo trabajamos, el estudio (línea del tiempo, Jonathan y Maite, mapa 3D), preguntas y contacto
proyectos.html    proyectos que se deslizan a izquierda y derecha, con puntitos y filtros (proyectos.html#obra-nueva abre ya filtrado)
```

## Archivos

```
css/styles.css    estilos y animaciones
js/main.js        menú, transición entre páginas, apariciones, fotos en movimiento, línea del tiempo, desplegables, paneles y formulario
js/proyectos.js   lista de proyectos, filtros, carrusel con puntitos y ficha de cada proyecto
js/proceso.js     dibujo de la casa en «cómo trabajamos»
js/mapa.js        mapa 3D ligado al scroll (MapLibre + OpenFreeMap, datos de OpenStreetMap)
img/logo.png      logo del estudio
fonts/            fuentes Antonio y Bricolage Grotesque (licencia SIL Open Font License, incluida en la carpeta)
```

Las fuentes van dentro del proyecto, así que la web se ve igual aunque el navegador bloquee Google Fonts.

El menú de arriba y el pie están en las dos páginas. Si cambias un enlace o un teléfono, cámbialo en ambas.

## Datos reales (sacados de miradesign.es)

- Texto del estudio y la frase «apostar por la arquitectura de lo construido».
- Jonathan Ramos Martín y Maite Ramos Casado: biografías y descripción personal.
- Tipos de proyecto: arquitectura, interiorismo, obra nueva y rehabilitación.
- Dirección: c/ Luis de Vargas, 4, 2º D, 21001 Huelva.
- Email info@miradesign.es y teléfonos 605 541 360 (Jonathan) y 679 742 875 (Maite).

## Pendiente de sustituir (marcado en la web)

Todo lo que no es seguro lleva la etiqueta «ejemplo no real» o «imagen de ejemplo».

| Qué | Dónde | Cómo cambiarlo |
|---|---|---|
| Año de fundación (2012) | El estudio | `index.html`, línea del tiempo (`timeline`) |
| Los 8 proyectos | Proyectos | `js/proyectos.js`, lista `PROYECTOS` |
| Fases de trabajo | Cómo trabajamos | `index.html`, sección `proceso` |
| Preguntas y respuestas | Preguntas | `index.html`, sección `preguntas` |
| Política de privacidad, aviso legal, cookies | Formulario y pie | Crear las páginas y enlazarlas |
| Todas las fotografías (Unsplash) | Toda la web | Sustituir por fotos de obras del estudio |

Para quitar una marca, borra el `<span class="demo">…</span>` o el `<span class="photo-tag">…</span>` correspondiente.

## Mapa

Usa MapLibre y los mapas gratuitos de OpenFreeMap (datos de OpenStreetMap), sin cuenta ni clave, y necesita conexión a internet.
Al bajar por la página, el mapa va de España a Andalucía, la provincia de Huelva, la ciudad y el estudio; al subir, se deshace.
Si el navegador no puede mostrarlo, aparece la dirección con un enlace a Google Maps.
Las vistas del recorrido están en la lista `CAMARAS` de `js/mapa.js`.

## Formulario

Al enviar, abre el programa de correo del visitante con el mensaje listo para info@miradesign.es.
Si más adelante se quiere que envíe directamente, se puede conectar a un servicio como Formspree.
