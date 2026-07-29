aca es el unico lugr donde esta permitido usar fetch() o sea peticiones http al backend

# Carpeta: js/api/

## Propósito
Aquí vive **únicamente** la comunicación de red con el backend de Spring Boot. Esta carpeta contiene todas las funciones que hacen peticiones HTTP mediante `fetch()`.

**Regla de Oro:** Queda **estrictamente prohibido manipular el DOM** dentro de los archivos de esta carpeta. No uses `document.getElementById()`, `innerHTML`, ni muestres alertas aquí. Estas funciones solo reciben parámetros, llaman al backend y retornan los datos puros (JSON) o lanzan errores.

## Directrices Estrictas
1. **El único hogar de `fetch()`:** Ningún archivo fuera de esta carpeta tiene permitido ejecutar `fetch()`.
2. **Centralización de URL:** Consume siempre la constante `API_URL` importada desde `js/api/config.js`. Cero URLs escritas "a mano" en otros archivos.
3. **Manejo de Respuestas:** Valida siempre `response.ok`. Si el backend responde con un error HTTP (4xx o 5xx), debes lanzar una excepción (`throw new Error(...)`) para que la vista correspondiente atrape el fallo y se lo muestre al usuario.

## Ejemplos de Archivos
* `config.js` (Exporta la URL base del servidor, ej. `http://localhost:8080/api`).
* `canchas.js` (Contiene `obtenerCanchas()`, `obtenerCanchaPorId()`).
* `reservas.js` (Contiene `crearReserva()`, `cancelarReserva()`).

## Ejemplo de Código (js/api/canchas.js)

import { API_URL } from './config.js';

// CORRECTO: Solo hace la petición y retorna los datos
export async function obtenerCanchas() {
    const response = await fetch(`${API_URL}/canchas`);
    
    if (!response.ok) {
        throw new Error('No se pudo obtener el listado de canchas.');
    }
    
    return await response.json(); // Retorna los datos puros a la vista
}