import { apiGet, apiPost, apiPatch } from './apiClient.js';

function normalizarReservaAdmin(raw) {
  return {
    id: raw.id,
    cancha: raw.fieldName || raw.cancha || '',
    fecha: raw.date || raw.fecha || '',
    horaInicio: raw.startTime || raw.hora || '',
    horaFin: raw.endTime || '',
    tipo: raw.matchType || raw.tipo || 'Individual',
    estado: raw.status || raw.estado || 'PENDIENTE',
    cliente: raw.clientName || raw.cliente || 'Cliente no disponible',
    emailCliente: raw.clientEmail || '',
    totalHoras: raw.totalHours ?? 0,
    totalPago: raw.totalPay ?? 0,
    saldoPendiente: raw.remainingPayment ?? 0,
    estadoTexto: formatearEstadoReserva(raw.status || raw.estado || 'PENDIENTE'),
  };
}

export function formatearEstadoReserva(estado) {
  return {
    PENDIENTE: 'Pendiente',
    PENDIENTE_PRIMER_PAGO: 'Pendiente de primer pago',
    COMPLETADA: 'Completada',
    CANCELADA: 'Cancelada',
  }[estado] || estado;
}

function formatearFechaReserva(fecha) {
  if (!fecha || !fecha.includes('-')) return fecha || '';
  const [year, month, day] = fecha.split('-');
  return `${day}/${month}/${year}`;
}

function normalizarDatosReserva(raw) {
  return {
    id: raw.id,
    cancha: raw.fieldName || raw.cancha || '',
    fecha: formatearFechaReserva(raw.date || raw.fecha || ''),
    hora: raw.hora || raw.time || raw.startTime || '',
    horaFin: raw.endTime || '',
    tipo: raw.tipo || raw.matchType || 'Individual',
    estado: raw.estado || raw.status || 'PENDIENTE',
    estadoTexto: formatearEstadoReserva(raw.estado || raw.status || 'PENDIENTE'),
    totalPago: raw.totalPay ?? 0,
    saldoPendiente: raw.remainingPayment ?? 0,
  };
}

export async function obtenerTodasLasReservas() {
  const data = await apiGet('/reservations/all', { auth: true, cache: 'no-store' });
  return (Array.isArray(data) ? data : []).map(normalizarReservaAdmin);
}

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
    const data = await apiGet('/reservations/pending', { auth: true, cache: 'no-store' });
    const reservas = Array.isArray(data) ? data : [];
    return reservas.map(normalizarDatosReserva);
  } catch (error) {
    console.warn('Fallo al obtener reservas pendientes:', error);
    throw error;
  }
}

export async function obtenerHistorialReservas() {
  try {
    const data = await apiGet('/reservations/history', { auth: true, cache: 'no-store' });
    const reservas = Array.isArray(data) ? data : [];
    return reservas.map(normalizarDatosReserva);
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

export async function registrarPagoFinal(reservationId, paymentMethodId, notes = '') {
  return apiPost('/payment-method/reservations/final-payment', {
    reservationId: Number(reservationId),
    paymentMethodId: Number(paymentMethodId),
    notes,
  }, { auth: true });
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
