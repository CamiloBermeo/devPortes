import { apiGet, apiPost, apiPut, apiPatch, apiMultipart } from './apiClient.js';
import { USE_MOCK, obtenerCanchasMock, guardarCanchasMock } from '../utils/mockData.js';

export function formatoTipo(cancha) {
  if (Array.isArray(cancha.tipo)) return cancha.tipo.join(' - ');
  return cancha.tipo || '';
}

export function tipoAArray(valor) {
  if (Array.isArray(valor)) return valor;
  if (typeof valor === 'string' && valor.trim()) return [valor.trim()];
  return [];
}

function normalizarCanchaBackend(raw) {
  return {
    id: raw.id,
    titulo: raw.name || '',
    nombre: raw.name || '',
    tipo: raw.sport ? tipoAArray(raw.sport) : [],
    superficie: raw.surface || '',
    precio: `$${Number(raw.hourlyRate || 0).toLocaleString('es-CO')}`,
    tarifa: Number(raw.hourlyRate || 0),
    capacidad: Number(raw.capacity || 0),
    estado: raw.state === 'DISPONIBLE' ? 'Disponible' : raw.state === 'MANTENIMIENTO' ? 'Mantenimiento' : 'Disponible',
    imagen: (raw.urlPictures && raw.urlPictures[0]) || (raw.url_pictures && raw.url_pictures[0]) || '',
    descripcion: raw.description || '',
    detalles: raw.details || [],
    locationId: raw.locationId || null,
  };
}

export async function obtenerCanchas() {
  if (USE_MOCK) return obtenerCanchasMock();
  const data = await apiGet('/field/all');
  const canchas = Array.isArray(data) ? data : data.canchas || [];
  return canchas.map(normalizarCanchaBackend);
}

export async function crearCancha(data, images) {
  if (USE_MOCK) {
    const canchas = obtenerCanchasMock();
    const nuevoId = canchas.length > 0 ? Math.max(...canchas.map((c) => c.id)) + 1 : 1;
    const nuevaCancha = {
      id: nuevoId,
      titulo: data.name,
      nombre: data.name,
      tipo: tipoAArray(data.sport),
      superficie: data.surface,
      precio: `$${Number(data.hourlyRate).toLocaleString('es-CO')}`,
      tarifa: Number(data.hourlyRate),
      capacidad: Number(data.capacity),
      estado: 'Disponible',
      imagen: images && images.length > 0 ? URL.createObjectURL(images[0]) : '',
      descripcion: data.description,
      detalles: Array.isArray(data.details) ? data.details : [],
    };
    canchas.push(nuevaCancha);
    guardarCanchasMock(canchas);
    return nuevaCancha;
  }

  const formData = new FormData();
  formData.append('locationId', data.locationId);
  formData.append('name', data.name);
  formData.append('capacity', String(data.capacity));
  formData.append('sport', data.sport);
  formData.append('surface', data.surface);
  formData.append('description', data.description);
  formData.append('hourlyRate', String(data.hourlyRate));

  if (Array.isArray(data.details)) {
    data.details.forEach((detail) => formData.append('details', detail));
  }

  if (images && images.length > 0) {
    images.forEach((image) => formData.append('pictures', image));
  }

  return apiMultipart('/field/new', formData, { auth: true, method: 'POST' });
}

export async function editarCancha(id, data, existingUrls = [], newImages = []) {
  if (USE_MOCK) {
    const canchas = obtenerCanchasMock();
    const idx = canchas.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Cancha no encontrada');

    canchas[idx].titulo = data.name || canchas[idx].titulo;
    canchas[idx].nombre = data.name || canchas[idx].nombre;
    canchas[idx].tipo = data.sport ? tipoAArray(data.sport) : canchas[idx].tipo;
    canchas[idx].superficie = data.surface || canchas[idx].superficie;
    canchas[idx].tarifa = data.hourlyRate ? Number(data.hourlyRate) : canchas[idx].tarifa;
    canchas[idx].precio = `$${canchas[idx].tarifa.toLocaleString('es-CO')}`;
    canchas[idx].capacidad = data.capacity ? Number(data.capacity) : canchas[idx].capacidad;
    canchas[idx].estado = data.state || canchas[idx].estado;
    canchas[idx].descripcion = data.description || canchas[idx].descripcion;
    canchas[idx].detalles = Array.isArray(data.details) ? data.details : canchas[idx].detalles;

    guardarCanchasMock(canchas);
    return canchas[idx];
  }

  const formData = new FormData();
  if (data.locationId) formData.append('locationId', data.locationId);
  if (data.name) formData.append('name', data.name);
  if (data.capacity) formData.append('capacity', String(data.capacity));
  if (data.sport) formData.append('sport', data.sport);
  if (data.surface) formData.append('surface', data.surface);
  if (data.description) formData.append('description', data.description);
  if (data.hourlyRate) formData.append('hourlyRate', String(data.hourlyRate));
  if (data.state) formData.append('state', data.state);

  existingUrls.forEach((url) => formData.append('UrlPictures', url));

  if (newImages.length > 0) {
    newImages.forEach((image) => formData.append('pictures', image));
  }

  if (Array.isArray(data.details)) {
    data.details.forEach((detail) => formData.append('details', detail));
  }

  return apiMultipart(`/field/edit/${id}`, formData, { auth: true, method: 'PUT' });
}

export async function eliminarCancha(id) {
  if (USE_MOCK) {
    const canchas = obtenerCanchasMock();
    const filtradas = canchas.filter((c) => c.id !== id);
    guardarCanchasMock(filtradas);
    return;
  }

  return apiPatch(`/field/${id}/state`, { auth: true });
}
