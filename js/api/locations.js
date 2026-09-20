import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from './apiClient.js';

export async function obtenerUbicaciones() {
  const data = await apiGet('/location/locations');
  return data.locations || [];
}

export async function crearUbicacion(data) {
  return apiPost('/location/new-location', data, { auth: true });
}

export async function editarUbicacion(id, data) {
  return apiPut(`/location/${id}`, data, { auth: true });
}

export async function toggleEstadoUbicacion(id) {
  return apiPatch(`/location/${id}/state`, { auth: true });
}

export async function eliminarUbicacion(id) {
  return apiDelete(`/location/${id}`, { auth: true });
}
