import { showToast } from '../componets/toast.js';

const USER_TOKEN_KEY = 'devportes_usuario_token';
const ADMIN_TOKEN_KEY = 'devportes_admin_token';
const SESSION_KEY = 'devportes_sesion_activa';
const ADMIN_SESSION_KEY = 'devportes_admin_sesion';

let expirationTimer = null;
let handlingExpiration = false;

function getTokenPayload() {
  const token = localStorage.getItem(isAdminContext() ? ADMIN_TOKEN_KEY : USER_TOKEN_KEY);
  if (!token) return null;

  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

function isLoginPage() {
  return /(?:^|\/)(?:login|admin-login)\.html$/.test(window.location.pathname);
}

function isAdminContext() {
  return window.location.pathname.includes('admin-login.html') || window.location.pathname.includes('panel-administrador');
}

function getTokenKey() {
  return isAdminContext() ? ADMIN_TOKEN_KEY : USER_TOKEN_KEY;
}

function isAdminSession() {
  return Boolean(localStorage.getItem(ADMIN_SESSION_KEY)) || isAdminContext();
}

function getLoginUrl() {
  const inPages = window.location.pathname.includes('/pages/');
  const prefix = inPages ? '' : 'pages/';
  return `${prefix}${isAdminSession() ? 'admin-login.html' : 'login.html'}`;
}

export function clearSession() {
  const admin = isAdminContext();
  localStorage.removeItem(admin ? ADMIN_TOKEN_KEY : USER_TOKEN_KEY);
  localStorage.removeItem(admin ? ADMIN_SESSION_KEY : SESSION_KEY);
  document.dispatchEvent(new CustomEvent('session-change'));
}

export function handleSessionExpired() {
  if (handlingExpiration) return;
  handlingExpiration = true;
  if (expirationTimer) clearTimeout(expirationTimer);
  clearSession();
  if (isLoginPage()) return;
  showToast('Tu sesión ha expirado. Inicia sesión nuevamente.', 'advertencia', 2500);
  setTimeout(() => {
    window.location.href = getLoginUrl();
  }, 1200);
}

export function tokenIsExpired() {
  const payload = getTokenPayload();
  return !payload || !payload.exp || Date.now() >= payload.exp * 1000;
}

function scheduleExpirationCheck() {
  if (expirationTimer) clearTimeout(expirationTimer);
  const payload = getTokenPayload();
  if (!payload?.exp) return;

  const delay = Math.max(0, payload.exp * 1000 - Date.now());
  expirationTimer = setTimeout(() => {
    if (tokenIsExpired()) handleSessionExpired();
    else scheduleExpirationCheck();
  }, delay);
}

function checkExpiration() {
  if (localStorage.getItem(getTokenKey()) && tokenIsExpired()) {
    handleSessionExpired();
    return;
  }
  scheduleExpirationCheck();
}

checkExpiration();
window.addEventListener('focus', checkExpiration);
window.addEventListener('pageshow', checkExpiration);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') checkExpiration();
});
