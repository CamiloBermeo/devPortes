const ADMIN_CREDENTIALS = {
  email: 'admin@admin.com',
  password: 'Admin1234.',
};

const KEY_ADMIN_SESSION = 'devportes_admin_sesion';

document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem(KEY_ADMIN_SESSION)) {
    window.location.href = 'panel-administrador.html';
    return;
  }

  const form = document.querySelector('.login-form');
  const emailInput = document.getElementById('adminEmail');
  const passwordInput = document.getElementById('adminPassword');
  const errorDiv = document.getElementById('adminLoginError');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    errorDiv.style.display = 'none';

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    if (!email || !password) {
      showError('Completa todos los campos.');
      return;
    }

    if (email !== ADMIN_CREDENTIALS.email || password !== ADMIN_CREDENTIALS.password) {
      showError('Credenciales incorrectas. Verifica tu correo y contraseña.');
      return;
    }

    const adminProfile = {
      nombre: 'Administrador',
      correo: ADMIN_CREDENTIALS.email,
      rol: 'admin',
    };

    localStorage.setItem(KEY_ADMIN_SESSION, JSON.stringify(adminProfile));
    window.location.href = 'panel-administrador.html';
  });

  function showError(msg) {
    errorDiv.textContent = msg;
    errorDiv.style.display = 'block';
  }
});
