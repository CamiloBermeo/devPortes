export function estaLogueado() {
  return !!localStorage.getItem('devportes_sesion_activa');
}

export function obtenerDatosSesion() {
  try { return JSON.parse(localStorage.getItem('devportes_sesion_activa') || '{}'); }
  catch { return {}; }
}

export function cerrarSesion() {
  localStorage.removeItem('devportes_sesion_activa');
  localStorage.removeItem('devportes_token');
  window.location.href = '../index.html';
}

export async function obtenerPerfilCompleto() {
  const session = obtenerDatosSesion();
  const token = localStorage.getItem('devportes_token');
  
  if (token && token !== 'local-token') {
    try {
      const { API_URL } = await import('../api/config.js');
      const res = await fetch(`${API_URL}/auth/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const p = await res.json();
        return { 
          nombre: p.name || session.nombre,
          correo: p.email || session.correo,
          cedula: p.identityDocument || session.cedula || '',
          telefono: p.phoneNumber || session.telefono || ''
        };
      }
    } catch { /* fallback */ }
  }
  return session;
}