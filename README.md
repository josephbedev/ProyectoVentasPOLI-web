# Proyecto Ventas POLI — Entrega 2

**Grupo 14 · Herramientas de Programación Móvil**

Primera versión web de las mejoras propuestas para el proyecto Ventas POLI, desarrollada con **HTML, CSS, JavaScript y la librería jQuery**. Se visualiza en cualquier navegador abriendo `index.html`, sin instalar software adicional (no requiere Boca ni servidor).

🔗 **Sitio publicado:** https://areiza-zenith.github.io/ProyectoVentasPOLI-web/

---

## Relación con la Entrega 1

En la Entrega 1 la clase Java `GenerateInfoFiles` generaba archivos planos pseudoaleatorios (`productos.txt`, `vendedores.txt` y un archivo de ventas por vendedor). Esta versión web reproduce esa lógica en JavaScript y agrega una interfaz para consultar la información y descargar los mismos archivos, con los mismos formatos:

| Archivo | Formato |
|---|---|
| `productos.txt` | `ID;Nombre;Precio` |
| `vendedores.txt` | `TipoDocumento;NúmeroDocumento;Nombres;Apellidos` |
| `ventas_<nombre>_<documento>.txt` | Primera línea `tipo;documento`, luego `IDProducto;Cantidad;` |

Las ventas siempre referencian productos que existen en la lista de productos generada.

---

## Funcionalidades

- **Resumen** (`index.html`): tarjetas con totales, mejor vendedor y ranking de vendedores por valor vendido.
- **Productos** (`productos.html`): tabla con búsqueda en vivo, ordenamiento por columna y descarga de `productos.txt`.
- **Vendedores** (`vendedores.html`): tabla con búsqueda en vivo, ordenamiento por columna y descarga de `vendedores.txt`.
- **Ventas** (`ventas.html`): selector de vendedor, detalle de ventas con subtotales, total y descarga de su archivo de ventas.
- **Regenerar datos**: botón disponible en todas las páginas que crea un conjunto nuevo de datos pseudoaleatorios.
- **Diseño responsive** y **modo oscuro automático** según la preferencia del sistema.

---

## Tecnologías

- HTML5
- CSS3 (variables, Flexbox, Grid, media queries)
- JavaScript
- jQuery 3.7.1 (cargado por CDN, con copia local de respaldo opcional)
- GitHub Pages para la publicación

---

## Estructura del proyecto

```
ProyectoVentasPOLI-web/
├── index.html        → resumen y ranking
├── productos.html    → tabla de productos
├── vendedores.html   → tabla de vendedores
├── ventas.html       → ventas por vendedor
├── css/
│   └── style.css     → diseño
└── js/
    └── app.js        → toda la lógica (jQuery)
```

## Cómo ejecutarlo

1. Descargar o clonar el repositorio.
2. Abrir `index.html` en el navegador (doble clic).
3. Navegar con el menú superior.

> jQuery se carga desde un CDN, por lo que se necesita conexión a internet. Para uso sin conexión, colocar `jquery.min.js` en la carpeta `js/`; la página lo usa automáticamente como respaldo.

---

## Explicación del código

### HTML

Las cuatro páginas comparten la misma estructura:

```html
<body data-page="productos">
  <header> título, menú y botón "Regenerar datos" </header>
  <main> contenido propio de cada página </main>
  <footer> ... </footer>
  <script src="...jquery.min.js"></script>
  <script src="js/app.js"></script>
</body>
```

- **`data-page`**: atributo personalizado que jQuery lee con `$('body').data('page')` para saber en qué página está. Así las 4 páginas comparten el mismo `app.js` y cada una ejecuta solo su parte.
- **Tablas vacías**: el HTML solo trae el `<thead>` y un `<tbody>` vacío; jQuery llena las filas con los datos.
- **`data-k`** en los encabezados (`<th data-k="precio">`): indica el campo por el que se ordena al hacer clic.
- **Orden de scripts**: primero jQuery y luego `app.js`, porque este último usa `$`.
- **Respaldo de jQuery**: si el CDN falla, se carga una copia local.

  ```html
  <script>window.jQuery||document.write('<script src="js/jquery.min.js"><\/script>')</script>
  ```

### CSS

- **Variables** (`:root{--bg:...; --ac:...}`): los colores se definen una vez y se reutilizan con `var(--ac)`.
- **Modo oscuro**: `@media (prefers-color-scheme: dark)` redefine las variables según el tema del sistema.
- **Flexbox**: en el `header` y en la barra de herramientas `.tools` (buscador y botón).
- **CSS Grid**: `.cards` usa `repeat(auto-fit, minmax(200px, 1fr))` para acomodar las tarjetas según el ancho.
- **`.card { display: none }`**: las tarjetas inician ocultas para que jQuery las muestre con animación.
- **Responsive**: `@media (max-width: 600px)` reduce el espaciado de las tablas en celulares.
- **Detalles**: `tbody tr:hover` resalta la fila y `th[data-k] { cursor: pointer }` indica columnas ordenables.

### JavaScript con jQuery (`js/app.js`)

**Inicio.** Todo el código está dentro de `$(function () { ... })`, que ejecuta el script cuando el HTML ya cargó (equivale a `$(document).ready`).

**Datos y utilidades.** Listas de nombres, apellidos y productos, y funciones auxiliares:

```js
var rnd   = function (a, b) { ... };  // entero aleatorio entre a y b
var pick  = function (a) { ... };     // elemento aleatorio de una lista
var money = function (n) { return '$' + n.toLocaleString('es-CO'); };
var full  = function (v) { return v.nombres + ' ' + v.apellidos; };
```

**`generar()`.** Crea 15 productos, 8 vendedores y entre 4 y 10 ventas por vendedor (cada una con un producto existente y una cantidad). Guarda todo en `localStorage` para que las 4 páginas compartan los mismos datos.

**`prod(id)` y `total(doc)`.** Buscan un producto por su ID (`$.grep`) y calculan las unidades y el valor total vendido por un vendedor (`$.each`).

**`descargar(nombre, texto)`.** Crea un enlace con `$('<a>')`, le asigna un `Blob` con `.attr()`, lo agrega con `.appendTo('body')`, le da clic por código y lo elimina con `.remove()`.

**`tabla(rows, cols, fmt)`.** Construye las filas HTML con `$.each` y las inserta con `.html()`; si no hay resultados muestra "Sin resultados".

**`listado(data, cols, fmt)`.** Agrega búsqueda y ordenamiento reutilizables en Productos y Vendedores:

- `.on('input')` en el buscador filtra la tabla mientras se escribe.
- `.on('click')` en los encabezados lee el campo con `.data('k')` y alterna entre orden ascendente y descendente.

**Lógica por página.** Cada bloque `if (page === '...')` se ejecuta solo en su página:

- **Resumen:** `$.map` calcula el total por vendedor, se ordena para obtener el ranking y las tarjetas aparecen con `.delay()` y `.fadeIn()`.
- **Productos / Vendedores:** usan `listado()` y un botón que arma el archivo `.txt` con `$.map(...).join('\n')`.
- **Ventas:** `.on('change')` en el selector redibuja la tabla y el total; `.trigger('change')` lo dispara al inicio para no dejar la tabla vacía.
- **Regenerar datos:** `generar()` y `location.reload()`.

---

## jQuery utilizado

| Función jQuery | Para qué se usa |
|---|---|
| `$(function(){})` | Esperar a que cargue la página |
| `$('#id')`, `$('.clase')`, `$('nav a')` | Seleccionar elementos |
| `$('<a>')` | Crear elementos nuevos |
| `.html()`, `.text()` | Cambiar el contenido |
| `.attr()`, `.data()` | Leer y asignar atributos |
| `.addClass()` | Agregar clases CSS |
| `.on('click' / 'input' / 'change')` | Manejar eventos |
| `.trigger()` | Disparar un evento por código |
| `.val()` | Leer el valor de un campo |
| `.appendTo()`, `.remove()` | Agregar y quitar elementos |
| `.hide()`, `.fadeIn()`, `.delay()` | Animaciones |
| `$.each`, `.each` | Recorrer listas |
| `$.map` | Transformar listas |
| `$.grep` | Filtrar listas |

---
