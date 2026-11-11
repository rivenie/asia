# Asia Piscinas — Rediseño web

Sitio de una sola página, sin dependencias (HTML + CSS + JavaScript puro). El contenido sale de asiapiscinas.com y de su landing (landing.asiapiscinas.com).

## Cómo verlo
- **Rápido:** abre `index.html` en el navegador.
- **Recomendado:** sírvelo con un servidor local. Así el efecto de agua del inicio funciona con refracción real (al abrirlo como archivo local solo se ven los brillos de las ondas):
  ```bash
  cd asia-piscinas && python3 -m http.server 8080
  ```
  Luego abre http://localhost:8080

## Publicar
Sube la carpeta tal cual a cualquier hosting estático (Netlify, Vercel, GitHub Pages, cPanel…).

## Estructura
```
index.html
assets/css/styles.css   → diseño (variables de color en :root)
assets/js/main.js       → interacciones
assets/img/             → imágenes optimizadas del sitio original
```

## Elementos interactivos
| Elemento | Dónde |
|---|---|
| Agua con ondas que siguen al cursor (canvas) | Inicio |
| Tarjetas flotantes arrastrables (doble clic = volver a su sitio) | Inicio |
| Cinta de texto cuya velocidad responde al scroll | Bajo el inicio |
| Medidor de "profundidad" del scroll (pantallas ≥ 1400 px) | Lateral derecho |
| Tarjetas con inclinación 3D y brillo | Servicios, Equipo |
| Proceso con scroll horizontal fijado | Proceso |
| Configurador "Diseña tu piscina": esquina arrastrable, m², m³, litros, plazo y envío por WhatsApp | Diseña tu piscina |
| Carrusel de productos arrastrable con inercia y filtros | Tienda |
| Mazo de testimonios que se desliza con el dedo o el ratón | Testimonios |
| Formulario que arma el mensaje para WhatsApp o correo | Contacto |

Se respeta `prefers-reduced-motion`: con movimiento reducido, las animaciones se desactivan.

## Datos que conviene revisar
- **Años de experiencia:** la web original dice "más de 13 años", fundada en 2007, y la landing dice "más de 10 años". Aquí se usa "Desde 2007".
- **Garantía:** "10 años en estructura y 2 en equipos" sale de las preguntas frecuentes de la landing.
- **Cliente "Condominio Tierra Sur":** en la web original la etiqueta dice "Tierra Bonita", pero el logo dice "Tierra Sur".
- **Testimonios:** se usaron los 3 de la web y el de la Sra. López de la landing. Se dejaron fuera los que hablaban de "Corporación de la Cruz" y de construcción de casas.
- **Precios:** no se muestran (la web original tampoco los tiene). El botón "Solicitar" abre WhatsApp con el nombre del producto.
- **Fotos del equipo:** son las mismas de la web original (parecen de banco de imágenes). Conviene reemplazarlas por fotos reales.
