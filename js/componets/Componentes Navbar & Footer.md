# H1 nav_footer.js

Este proyecto utiliza **Web Components (Custom Elements)** nativos de JavaScript

para renderizar el menú de navegación (`<app-navbar>`) y el pie de página
(`<app-footer>`) de forma centralizada sin frameworks externos.

## Uso Rápido en HTML

Para incluir el menú y el footer en cualquier archivo `.html`, simplemente
inserta las etiquetas personalizadas y enlaza el archivo `components.js`:

```HTML
<!doctype html>
<html lang="es">
  <head>
    <!-- Tus estilos -->
  </head>
  <body>

    <!-- 1. Insertar Navbar -->
    <app-navbar></app-navbar>

    <main>
      <!-- En lo que vayas a trabajar -->
    </main>

    <!-- 2. Insertar Footer -->
    <app-footer></app-footer>

    <!-- 3. Cargar el script de componentes al final -->
    <script src="js/components.js" defer></script>
  </body>
</html>
```

## ¿Cómo Funciona `js/components.js`?

### 1. Manejo Automático de Rutas

El script detecta si el usuario está ubicado en la raíz `./` o dentro de la
subcarpeta `./pages/` verificando `window.location.pathname`. Ajusta las rutas
dinámicamente usando dos prefijos:

- **`basePath`**: Se usa para regresar a la raíz (`./` o `../`).
- **`pagesPath`**: Se usa para ir a la carpeta de páginas (`./pages/` o `./`).

### 2. Detección de Página Activa (`active`)

Calcula automáticamente el nombre del archivo actual (`currentPage`) y aplica un
operador ternario en los enlaces del HTML:

```JavaScript
// Si es la página actual -> Aplica estilos verdes/negrita
// Si NO es la página actual -> Aplica estilo por defecto
currentPage === 'nosotros.html' ? 'fw-bold text-brand-mid-green' : 'nav-link-custom'
```

## ✏️ ¿Cómo agregar o modificar un enlace?

Abre `js/components.js` y edita la plantilla en el método `connectedCallback()`:

1. **Si agregas una nueva página en la carpeta `/pages/` (ej:
   `contacto.html`):**

   HTML

   ```
   <li class="nav-item">
     <a class="nav-link ${currentPage === 'contacto.html' ? 'fw-bold text-brand-mid-green' : 'nav-link-custom'} transition-base px-2" href="${pagesPath}contacto.html">
       Contacto
     </a>
   </li>
   ```

1. Al guardar, todas las páginas del sitio web mostrarán automáticamente el
   nuevo enlace.
