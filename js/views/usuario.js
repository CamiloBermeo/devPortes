import { showToast } from '../componets/toast.js';
import { showConfirm } from '../componets/confirm-modal.js';
import { obtenerDatosSesion } from '../utils/auth.js';

document.addEventListener('DOMContentLoaded', () => {
  /* =====================================================
     ESTADO GLOBAL - Cargar desde sesión
     ===================================================== */

  const session = obtenerDatosSesion();
  const state = {
    usuario: {
      nombre: session.nombre || 'Usuario',
      usuario: session.usuario || session.correo?.split('@')[0] || session.email?.split('@')[0] || 'usuario',
      email: session.correo || session.email || '',
      telefono: session.telefono || '',
      cedula: session.cedula || session.identityDocument || ''
    }
  };

  // Poblar DOM con datos de sesión
  const nombreUsuarioEl = document.getElementById('nombreUsuario');
  const emailUsuarioEl = document.getElementById('emailUsuario');
  const telefonoUsuarioEl = document.getElementById('telefonoUsuario');

  if (nombreUsuarioEl) nombreUsuarioEl.textContent = state.usuario.nombre;
  if (emailUsuarioEl) emailUsuarioEl.textContent = state.usuario.email;
  if (telefonoUsuarioEl) telefonoUsuarioEl.textContent = state.usuario.telefono;

  /* =====================================================
     CUSTOM EVENTS PARA COMUNICACIÓN ENTRE COMPONENTES
     ===================================================== */

  function emit(eventName, detail) {
    document.dispatchEvent(new CustomEvent(`usuario:${eventName}`, { detail }));
  }

  function on(eventName, handler) {
    document.addEventListener(`usuario:${eventName}`, (e) => handler(e.detail));
  }

  /* =====================================================
     1. MODAL EDITAR PERFIL - CON FOCUS TRAP
     ===================================================== */

  const btnEditarPerfil = document.getElementById('btnEditarPerfil');
  const modalPerfil = document.getElementById('modalPerfil');
  const btnCerrarModal = document.getElementById('btnCerrarModal');
  const btnCancelarEdicion = document.getElementById('btnCancelarEdicion');
  const formEditarPerfil = document.getElementById('formEditarPerfil');

  let lastFocusedElement = null;
  let focusableElements = [];

  function getFocusableElements() {
    return modalPerfil.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
  }

  function trapFocus(event) {
    if (event.key !== 'Tab') return;

    focusableElements = getFocusableElements();
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }

  function openModal() {
    if (!modalPerfil) return;

    // Poblar formulario con datos actuales
    const inputNombre = document.getElementById('inputNombre');
    const inputEmail = document.getElementById('inputEmail');
    const inputTelefono = document.getElementById('inputTelefono');
    const inputCedula = document.getElementById('inputCedula');

    if (inputNombre) inputNombre.value = state.usuario.nombre;
    if (inputEmail) inputEmail.value = state.usuario.email;
    if (inputTelefono) inputTelefono.value = state.usuario.telefono;
    if (inputCedula) inputCedula.value = state.usuario.cedula;

    lastFocusedElement = document.activeElement;
    modalPerfil.hidden = false;
    document.body.style.overflow = 'hidden';

    focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    document.addEventListener('keydown', trapFocus);
    emit('modal:open', { modal: 'perfil' });
  }

  function closeModal() {
    if (!modalPerfil) return;

    modalPerfil.hidden = true;
    document.body.style.overflow = '';
    document.removeEventListener('keydown', trapFocus);

    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }

    emit('modal:close', { modal: 'perfil' });
  }

  if (btnEditarPerfil && modalPerfil) {
    btnEditarPerfil.addEventListener('click', openModal);
  }

  if (btnCerrarModal) {
    btnCerrarModal.addEventListener('click', closeModal);
  }

  if (btnCancelarEdicion) {
    btnCancelarEdicion.addEventListener('click', closeModal);
  }

  if (modalPerfil) {
    modalPerfil.addEventListener('click', (evento) => {
      if (evento.target === modalPerfil) {
        closeModal();
      }
    });
  }

  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && modalPerfil && !modalPerfil.hidden) {
      closeModal();
    }
  });

  /* =====================================================
     2. GUARDAR CAMBIOS DEL PERFIL
     ===================================================== */

  if (formEditarPerfil) {
    formEditarPerfil.addEventListener('submit', (evento) => {
      evento.preventDefault();

      const nombre = document.getElementById('inputNombre').value.trim();
      const email = document.getElementById('inputEmail').value.trim();
      const telefono = document.getElementById('inputTelefono').value.trim();
      const cedula = document.getElementById('inputCedula').value.trim();

      // Validación básica
      if (!nombre || !email || !telefono || !cedula) {
        showToast('Por favor completa todos los campos', 'error');
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showToast('El correo electrónico no es válido', 'error');
        return;
      }

      // Actualizar estado
      state.usuario = { ...state.usuario, nombre, email, telefono, cedula };

      // Persistir en localStorage (sesión activa)
      const sessionActual = obtenerDatosSesion();
      const sessionActualizada = {
        ...sessionActual,
        nombre,
        correo: email,
        email,
        telefono,
        cedula,
        identityDocument: cedula
      };
      localStorage.setItem('devportes_sesion_activa', JSON.stringify(sessionActualizada));

      // Actualizar DOM del perfil
      const nombreUsuario = document.getElementById('nombreUsuario');
      const emailUsuario = document.getElementById('emailUsuario');
      const telefonoUsuario = document.getElementById('telefonoUsuario');

      if (nombreUsuario) nombreUsuario.textContent = nombre;
      if (emailUsuario) emailUsuario.textContent = email;
      if (telefonoUsuario) telefonoUsuario.textContent = telefono;

      closeModal();
      showToast('¡Perfil actualizado correctamente!', 'exito');

      emit('perfil:actualizado', state.usuario);
    });
  }

  /* =====================================================
     3. CANCELAR RESERVAS PENDIENTES - DELEGACIÓN DE EVENTOS
     ===================================================== */

  document.addEventListener('click', async (evento) => {
    const btnCancelar = evento.target.closest('.btn-cancelar');
    if (!btnCancelar) return;

    evento.preventDefault();

    const reserva = btnCancelar.closest('.reserva-pendiente');
    if (!reserva) return;

    const canchaEl = reserva.querySelector('h4');
    const nombreCancha = canchaEl ? canchaEl.textContent.trim() : 'esta reserva';
    const reservaId = btnCancelar.dataset.id;

    const confirmar = await showConfirm(
      `¿Estás seguro de que deseas cancelar la reserva de <strong>${nombreCancha}</strong>?`,
      'Cancelar reserva'
    );

    if (!confirmar) return;

    reserva.remove();
    actualizarContadorPendientes();
    showToast('La reserva ha sido cancelada correctamente', 'exito');

    emit('reserva:cancelada', { id: reservaId, cancha: nombreCancha });
  });

  /* =====================================================
     4. ACTUALIZAR CONTADOR DE RESERVAS
     ===================================================== */

  function actualizarContadorPendientes() {
    const contador = document.getElementById('contadorPendientes');
    const reservas = document.querySelectorAll('.reserva-pendiente');

    if (contador) {
      contador.textContent = reservas.length;
    }

    if (reservas.length === 0) {
      const tarjetaPendientes = document.querySelector('.tarjeta-pendientes');
      if (tarjetaPendientes && !tarjetaPendientes.querySelector('.sin-reservas')) {
        const mensaje = document.createElement('p');
        mensaje.className = 'sin-reservas';
        mensaje.textContent = 'No tienes reservas pendientes.';
        mensaje.style.cssText = `
          text-align: center;
          color: var(--texto-gris);
          padding: var(--space-lg);
          font-size: clamp(13px, 1.4vw, 14px);
        `;
        tarjetaPendientes.appendChild(mensaje);
      }
    } else {
      const mensajeExistente = document.querySelector('.sin-reservas');
      if (mensajeExistente) mensajeExistente.remove();
    }
  }

  /* =====================================================
     5. BOTONES "VER DETALLE" - DELEGACIÓN
     ===================================================== */

  document.addEventListener('click', (evento) => {
    const btnDetalle = evento.target.closest('.btn-detalle');
    if (!btnDetalle) return;

    const idReserva = btnDetalle.dataset.id;
    showToast(`Cargando información de la reserva #${idReserva}`, 'info');

    emit('reserva:detalle', { id: idReserva });
  });

  /* =====================================================
     6. BOTÓN "RESERVAR NUEVA CANCHA" (si existe)
     ===================================================== */

  const botonNuevaReserva = document.getElementById('btn-nueva-reserva');
  if (botonNuevaReserva) {
    botonNuevaReserva.addEventListener('click', () => {
      showToast('Abriendo asistente de reservas...', 'info');
      // window.location.href = "../views/reservar-cancha.html";
    });
  }

  /* =====================================================
     7. SINCRONIZAR MODO OSCURO / TEMA (placeholder)
     ===================================================== */

  // Escuchar cambios de tema del sistema
  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      emit('theme:change', { dark: e.matches });
    });
  }

  /* =====================================================
     8. EXPONER API PÚBLICA
     ===================================================== */

  window.UsuarioPanel = {
    state,
    showToast,
    emit,
    on,
    openModal,
    closeModal,
    actualizarContadorPendientes
  };

  console.log('[UsuarioPanel] Inicializado - API disponible en window.UsuarioPanel');
});
