import { apiGet } from './apiClient.js';

export function obtenerEstadisticasPublicas() {
  return apiGet('/statistics/public');
}

export function obtenerEstadisticasUsuario() {
  return apiGet('/statistics/me', { auth: true });
}
