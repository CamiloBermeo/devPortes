import { API_URL } from './config.js';

export async function registrarUsuario({ name, identityDocument, phoneNumber, email, password }) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, identityDocument, phoneNumber, email, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Error al registrar usuario');
  }

  return response.json();
}

export async function iniciarSesion({ email, password }) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Credenciales incorrectas');
  }

  return response.json();
}

export async function obtenerPerfil(token) {
  const response = await fetch(`${API_URL}/auth/profile`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('No se pudo obtener el perfil');
  }

  return response.json();
}
