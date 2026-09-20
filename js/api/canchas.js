import { apiGet, apiPost, apiPut, apiPatch, apiDelete, apiMultipart } from './apiClient.js';

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
    sede: raw.locationName || raw.headquarters || '',
    direccion: raw.locationAddress || raw.address || '',
    visible: raw.visible !== false,
  };
}

export async function obtenerCanchas({ signal } = {}) {
  const data = await apiGet('/field/all', { signal });
  const canchas = Array.isArray(data) ? data : data.canchas || [];
  return canchas.map(normalizarCanchaBackend);
}

export async function crearCancha(data, images) {
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
  return apiDelete(`/field/${id}`, { auth: true });
}
