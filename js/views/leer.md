aca en esta carpeta es donde va la logica lgada con un archivo html  or ejemplo va la logica del main del reservas, del nosotros, del contactenos, etc

# Carpeta: js/views/

## Propósito
Aquí vive la **lógica de la interfaz de usuario** de cada página. Esta carpeta contiene el código que reacciona a las acciones del usuario (clics, envíos de formulario), procesa los eventos y pinta el HTML dinámicamente en la pantalla.

**Regla de Oro:** Esta es la **única carpeta autorizada para manipular el DOM** (`document.getElementById`, `innerHTML`, `addEventListener`). Sin embargo, tiene **estrictamente prohibido ejecutar `fetch()`** (debe importar las funciones de `js/api/`) o realizar formateos/cálculos genéricos (debe importar de `js/utils/`).

## Directrices Estrictas
1. **Correspondencia 1 a 1:** El nombre del archivo JS debe coincidir con la página HTML que controla (ej. `reservas.html` carga `reservas.js`).
2. **Rol de Orquestador:** Su trabajo es unir las piezas: pide datos a `js/api/`, los formatea con `js/utils/` y los inyecta en el HTML.
3. **Template Literals:** Para inyectar elementos al HTML, usa siempre backticks (`` ` ``). Queda prohibida la concatenación de cadenas con el signo `+`.

## Ejemplos de Archivos
* `main.js` (Lógica global del sitio, como el comportamiento del menú de navegación o el botón de cerrar sesión).
* `reservas.js` (Escucha la selección de fecha, pide las canchas a la API y dibuja el catálogo).
* `login.js` (Captura el formulario de inicio de sesión y procesa la respuesta del servidor).

## Ejemplo de Código (js/views/reservas.js)

import { obtenerCanchas } from '../api/canchas.js';
import { formatearMoneda } from '../utils/formatters.js';

document.addEventListener('DOMContentLoaded', async () => {
    const contenedor = document.getElementById('contenedor-canchas');

    try {
        // 1. Pide datos a la carpeta API (Cero fetch directo)
        const canchas = await obtenerCanchas();

        // 2. Manipula el DOM inyectando HTML formateado
        contenedor.innerHTML = canchas.map(cancha => `
            <div class="card mb-3">
                <div class="card-body">
                    <h5 class="card-title">${cancha.nombre}</h5>
                    <p class="card-text">Precio: ${formatearMoneda(cancha.precioHora)} / hora</p>
                    <button class="btn btn-primary" data-id="${cancha.id}">Reservar</button>
                </div>
            </div>
        `).join('');

    } catch (error) {
        // 3. Muestra retroalimentación visual si algo falla
        contenedor.innerHTML = `
            <div class="alert alert-danger" role="alert">
                ${error.message}
            </div>
        `;
    }
});