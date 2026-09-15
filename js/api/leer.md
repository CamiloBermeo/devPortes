# Carpeta: js/api/

Aca es el unico lugar donde esta permitido usar fetch() o sea peticiones HTTP al backend.

## Proposito

Aqui vive **unicamente** la comunicacion de red con el backend de Spring Boot.
Esta carpeta contiene todas las funciones que hacen peticiones HTTP mediante
`fetch()`.

**Regla de Oro:** Queda **estrictamente prohibido manipular el DOM** dentro de
los archivos de esta carpeta. No uses `document.getElementById()`, `innerHTML`,
ni muestres alertas aqui. Estas funciones solo reciben parametros, llaman al
backend y retornan los datos puros (JSON) o lanzan errores.

## Archivos

| Archivo | Funcion |
|---------|---------|
| `config.js` | URL base del backend (`API_URL`). Detecta localhost vs produccion. |
| `apiClient.js` | Wrapper central de fetch. Helpers: `apiGet`, `apiPost`, `apiPut`, `apiPatch`, `apiMultipart`. Maneja headers, errores y sesion. |
| `auth.js` | Endpoints de autenticacion: `registrarUsuario`, `iniciarSesion`, `obtenerPerfil`. |
| `canchas.js` | CRUD de canchas (fields): `obtenerCanchas`, `crearCancha`, `editarCancha`, `eliminarCancha`. Usa `USE_MOCK` para fallback. |
| `locations.js` | CRUD de ubicaciones: `obtenerUbicaciones`, `crearUbicacion`, `editarUbicacion`, `toggleEstadoUbicacion`. |

## Flujo de Datos

```
 Vista (views/*.js)
     |
     v
 API (api/*.js)  <-- usa apiClient.js para fetch
     |
     v
 Backend Spring Boot (localhost:8080/api/v1)
```

## Fallback Mock

El proyecto soporta un modo mock para funcionar sin backend:

- `js/utils/mockData.js` contiene el flag `USE_MOCK` y los datos mock
- `canchas.js` verifica `USE_MOCK` antes de hacer fetch al backend
- `login.js` usa `USE_MOCK` para decidir si guardar en localStorage como fallback
- Para activar/desactivar: cambiar `USE_MOCK` en `mockData.js` (`true`/`false`)

## Ejemplo de Codigo

```javascript
import { apiGet, apiPost } from './apiClient.js';

// GET con autenticacion
const canchas = await apiGet('/field/all', { auth: true });

// POST JSON
const nuevo = await apiPost('/location/new-location', { name: 'Sede Norte' }, { auth: true });

// POST con FormData (multipart)
import { apiMultipart } from './apiClient.js';
const formData = new FormData();
formData.append('name', 'Cancha 1');
formData.append('picture', fileInput.files[0]);
const resultado = await apiMultipart('/field/new', formData, { auth: true });
```
