import { apiGet, apiPost, apiPatch } from './apiClient.js';

function normalizarReservaPendiente(raw) {
  return {
    id: raw.id,
    cancha: raw.cancha || raw.fieldName || '',
    fecha: raw.fecha || raw.date || '',
    hora: raw.hora || raw.time || raw.startTime || '',
    tipo: raw.tipo || raw.matchType || 'Individual',
  };
}

function normalizarReservaHistorial(raw) {
  return {
    id: raw.id,
    fecha: raw.fecha || raw.date || '',
    cancha: raw.cancha || raw.fieldName || '',
    hora: raw.hora || raw.time || raw.startTime || '',
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
  return apiPatch(`/reservations/${numId}/cancel`, { auth: true });
}

export async function obtenerFechasDisponibles(anio, mes) {
  const data = await apiGet(`/reservation/available-dates/${anio}/${mes}`, { auth: true });
  return {
    availableDates: data.availableDates || [],
    fullDates: data.fullDates || [],
    datesWithReservations: data.datesWithReservations || [],
  };
}

export async function obtenerHorasDisponibles(fecha, signal) {
  const data = await apiGet(`/reservation/available-dates-times/${fecha}`, { auth: true, signal });
  return data.reservationHours || [];
}

export async function obtenerMetodosPago() {
  const data = await apiGet('/payment-method/all', { auth: true });
  return data.paymentMethod || [];
}

export async function crearReserva({ userId, fieldId, reservationDate, startTime, endTime, totalHours, totalPay, remainingPayment }) {
  return apiPost('/reservation/new', {
    userId,
    fieldId,
    reservationDate,
    startTime,
    endTime,
    totalHours,
    totalPay,
    remainingPayment,
  }, { auth: true });
}
