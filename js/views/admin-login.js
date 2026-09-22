import { iniciarSesion } from '../api/auth.js';
import { isNetworkError } from '../api/apiClient.js';
import { showToast } from '../componets/toast.js';

const KEY_ADMIN_SESSION = 'devportes_admin_sesion';
const KEY_TOKEN = 'devportes_admin_token';

document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem(KEY_ADMIN_SESSION)) {
    window.location.href = 'panel-administrador.html';
    return;
  }

  const form = document.querySelector('.login-form');
  const emailInput = document.getElementById('adminEmail');
  const passwordInput = document.getElementById('adminPassword');
  const btnSubmit = document.getElementById('btnAdminLogin');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    if (!email || !password) {
      showToast('Completa todos los campos.', 'advertencia');
      return;
    }

    btnSubmit.classList.add('loading');

    try {
      const respuesta = await iniciarSesion({ email, password });

      const adminProfile = {
        nombre: respuesta.nameUser || 'Administrador',
        correo: email,
        rol: 'admin',
      };

      localStorage.setItem(KEY_ADMIN_SESSION, JSON.stringify(adminProfile));
      localStorage.setItem(KEY_TOKEN, respuesta.token);
      localStorage.removeItem('devportes_token');
      window.location.href = 'panel-administrador.html';
    } catch (error) {
      btnSubmit.classList.remove('loading');
      if (!isNetworkError(error)) {
        if (error.status === 401) {
          showToast('Credenciales incorrectas. Verifica tu correo y contraseña.', 'advertencia');
        } else {
          showToast(error.message || 'Error al conectar con el servidor.', 'error');
        }
      }
    }
  });
});
