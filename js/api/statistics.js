import { apiGet } from './apiClient.js';

export function obtenerEstadisticasPublicas({ signal } = {}) {
  return apiGet('/statistics/public', { signal });
}

export function obtenerEstadisticasUsuario(signal) {
  return apiGet('/statistics/me', { auth: true, signal });
}
