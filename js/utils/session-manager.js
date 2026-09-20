import { showToast } from '../componets/toast.js';

const TOKEN_KEY = 'devportes_token';
const SESSION_KEY = 'devportes_sesion_activa';
const ADMIN_SESSION_KEY = 'devportes_admin_sesion';

let expirationTimer = null;
let handlingExpiration = false;

function getTokenPayload() {
  const token = localStorage.getItem(TOKEN_KEY);
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

function isAdminSession() {
  return Boolean(localStorage.getItem(ADMIN_SESSION_KEY))
    || window.location.pathname.includes('panel-administrador');
}

function getLoginUrl() {
  const inPages = window.location.pathname.includes('/pages/');
  const prefix = inPages ? '' : 'pages/';
  return `${prefix}${isAdminSession() ? 'admin-login.html' : 'login.html'}`;
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(ADMIN_SESSION_KEY);
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
  if (localStorage.getItem(TOKEN_KEY) && tokenIsExpired()) {
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
