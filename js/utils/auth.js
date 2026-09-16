import { apiGet } from '../api/apiClient.js';

const TOKEN_KEY = 'devportes_token';
const SESSION_KEY = 'devportes_sesion_activa';

export function estaLogueado() {
  return !!localStorage.getItem(SESSION_KEY);
}

export function obtenerDatosSesion() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || '{}');
  } catch {
    return {};
  }
}

export function cerrarSesion() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(TOKEN_KEY);
  window.location.href = '../index.html';
}

export async function obtenerPerfilCompleto() {
  const session = obtenerDatosSesion();
  const token = localStorage.getItem(TOKEN_KEY);

  if (token && token !== 'local-token') {
    try {
      const p = await apiGet('/auth/profile', { auth: true });
      return {
        nombre: p.name || session.nombre,
        correo: p.email || session.correo,
        cedula: p.identityDocument || session.cedula || '',
        telefono: p.phoneNumber || session.telefono || '',
      };
    } catch {
      return session;
    }
  }
  return session;
}
