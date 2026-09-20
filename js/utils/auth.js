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

export function tokenExpirado() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

export function sesionExpirada() {
  return estaLogueado() && tokenExpirado();
}

export function cerrarSesion() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(TOKEN_KEY);
  window.location.href = '../index.html';
}

export async function obtenerPerfilCompleto(signal) {
  const session = obtenerDatosSesion();
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    try {
      const p = await apiGet('/auth/profile', { auth: true, signal });
      return {
        id: p.id || session.id,
        nombre: p.name || session.nombre,
        correo: p.email || session.correo,
        cedula: p.identityDocument || session.cedula || '',
        telefono: p.phoneNumber || session.telefono || '',
        urlPicture: p.urlPicture || session.urlPicture || '',
      };
    } catch {
      return session;
    }
  }
  return session;
}
