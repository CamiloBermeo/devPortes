import { apiGet, apiDelete } from './apiClient.js';

function normalizarReservaPendiente(raw) {
  return {
    id: raw.id,
    cancha: raw.cancha || raw.fieldName || '',
    fecha: raw.fecha || raw.date || '',
    hora: raw.hora || raw.time || '',
    tipo: raw.tipo || raw.matchType || 'Individual',
  };
}

function normalizarReservaHistorial(raw) {
  return {
    id: raw.id,
    fecha: raw.fecha || raw.date || '',
    cancha: raw.cancha || raw.fieldName || '',
    hora: raw.hora || raw.time || '',
    tipo: raw.tipo || raw.matchType || 'Individual',
    estado: raw.estado || raw.status || 'Pendiente',
  };
}

export async function obtenerReservasPendientes() {
  try {
    const data = await apiGet('/reservations/pending', { auth: true });
    const reservas = Array.isArray(data) ? data : [];
    return reservas.map(normalizarReservaPendiente);
  } catch (error) {
    console.warn('Fallo al obtener reservas pendientes:', error);
    throw error;
  }
}

export async function obtenerHistorialReservas() {
  try {
    const data = await apiGet('/reservations/history', { auth: true });
    const reservas = Array.isArray(data) ? data : [];
    return reservas.map(normalizarReservaHistorial);
  } catch (error) {
    console.warn('Fallo al obtener historial de reservas:', error);
    throw error;
  }
}

export async function cancelarReserva(id) {
  const numId = Number(id);
  return apiDelete(`/reservations/${numId}`, { auth: true });
}
