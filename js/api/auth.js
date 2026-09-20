import { apiPost, apiGet, apiMultipart } from './apiClient.js';

export async function registrarUsuario({ name, identityDocument, phoneNumber, email, password }) {
  return apiPost('/auth/register', { name, identityDocument, phoneNumber, email, password });
}

export async function iniciarSesion({ email, password }) {
  return apiPost('/auth/login', { email, password });
}

export async function obtenerPerfil(token, signal) {
  return apiGet('/auth/profile', { auth: true, signal });
}

export async function obtenerUsuarios() {
  return apiGet('/admin/clients', { auth: true });
}

export async function actualizarFotoPerfil(file) {
  const formData = new FormData();
  formData.append('picture', file);
  return apiMultipart('/auth/profile/picture', formData, { auth: true, method: 'PUT' });
}
