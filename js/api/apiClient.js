import { API_URL } from './config.js';
import { handleSessionExpired } from '../utils/session-manager.js';
import { showToast } from '../componets/toast.js';

const USER_TOKEN_KEY = 'devportes_usuario_token';
const ADMIN_TOKEN_KEY = 'devportes_admin_token';

function isAdminContext() {
  return window.location.pathname.includes('admin-login.html') || window.location.pathname.includes('panel-administrador');
}

function getToken() {
  return localStorage.getItem(isAdminContext() ? ADMIN_TOKEN_KEY : USER_TOKEN_KEY);
}

export function getHeaders({ auth = false, multipart = false } = {}) {
  const headers = {};

  if (!multipart) {
    headers['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

export function isNetworkError(error) {
  return error instanceof TypeError && /fetch|network/i.test(error.message);
}

export function isAbortError(error) {
  return error?.name === 'AbortError';
}

let pageIsLeaving = false;
window.addEventListener('pagehide', () => {
  pageIsLeaving = true;
});
window.addEventListener('pageshow', () => {
  pageIsLeaving = false;
});

async function safeFetch(url, options) {
  try {
    return await fetch(url, options);
  } catch (error) {
    if (!pageIsLeaving && !isAbortError(error) && isNetworkError(error)) {
      showToast('No se pudo conectar con el servidor. Verifica tu conexión.', 'error');
    }
    throw error;
  }
}

async function handleResponse(response, { auth = false } = {}) {
  if (response.status === 401 || response.status === 403) {
    if (auth) {
      handleSessionExpired();
      throw new Error('Sesion expirada. Inicia sesion nuevamente.');
    }
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const mensaje = data.message || data.messages?.join(', ') || `Error ${response.status}`;
    const error = new Error(mensaje);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export async function apiGet(endpoint, { auth = false, signal = null, cache } = {}) {
  const response = await safeFetch(`${API_URL}${endpoint}`, {
    method: 'GET',
    headers: getHeaders({ auth }),
    signal,
    ...(cache ? { cache } : {}),
  });
  return handleResponse(response, { auth });
}

export async function apiPost(endpoint, body, { auth = false } = {}) {
  const response = await safeFetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: getHeaders({ auth }),
    body: JSON.stringify(body),
  });
  return handleResponse(response, { auth });
}

export async function apiPut(endpoint, body, { auth = false } = {}) {
  const response = await safeFetch(`${API_URL}${endpoint}`, {
    method: 'PUT',
    headers: getHeaders({ auth }),
    body: JSON.stringify(body),
  });
  return handleResponse(response, { auth });
}

export async function apiPatch(endpoint, { auth = false } = {}) {
  const response = await safeFetch(`${API_URL}${endpoint}`, {
    method: 'PATCH',
    headers: getHeaders({ auth }),
  });
  return handleResponse(response, { auth });
}

export async function apiMultipart(endpoint, formData, { auth = false, method = 'POST' } = {}) {
  const response = await safeFetch(`${API_URL}${endpoint}`, {
    method,
    headers: getHeaders({ auth, multipart: true }),
    body: formData,
  });
  return handleResponse(response, { auth });
}

export async function apiDelete(endpoint, { auth = false } = {}) {
  const response = await safeFetch(`${API_URL}${endpoint}`, {
    method: 'DELETE',
    headers: getHeaders({ auth }),
  });
  if (response.status === 204) {
    return null;
  }
  return handleResponse(response, { auth });
}

export { API_URL };
