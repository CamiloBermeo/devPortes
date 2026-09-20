import { showToast } from '../componets/toast.js';
import { showConfirm, escapeHtml } from '../componets/confirm-modal.js';
import { obtenerDatosSesion, cerrarSesion, estaLogueado, tokenExpirado, obtenerPerfilCompleto } from '../utils/auth.js';
import { handleSessionExpired } from '../utils/session-manager.js';
import { apiPut, isNetworkError, isAbortError } from '../api/apiClient.js';
import { actualizarFotoPerfil } from '../api/auth.js';
import { obtenerEstadisticasUsuario } from '../api/statistics.js';
import {
  obtenerReservasPendientes,
  obtenerHistorialReservas,
  cancelarReserva
} from '../api/reservations.js';

document.addEventListener('DOMContentLoaded', () => {
  /* =====================================================
     PROTEGER ACCESO AL PERFIL
     ===================================================== */

  const token = localStorage.getItem('devportes_token');
  if (!estaLogueado() || !token) {
    window.location.replace('./login.html?redirect=usuario');
    return;
  }

  if (tokenExpirado()) {
    handleSessionExpired();
    return;
  }
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
      cedula: session.cedula || session.identityDocument || '',
      urlPicture: session.urlPicture || ''
    }
  };
  let reservasPendientesActuales = [];
  const pageLoadController = new AbortController();
  window.addEventListener('pagehide', () => pageLoadController.abort(), { once: true });

  // Poblar DOM con datos de sesión
  const nombreUsuarioEl = document.getElementById('nombreUsuario');
  const emailUsuarioEl = document.getElementById('emailUsuario');
  const telefonoUsuarioEl = document.getElementById('telefonoUsuario');

  if (nombreUsuarioEl) nombreUsuarioEl.textContent = state.usuario.nombre;
  if (emailUsuarioEl) emailUsuarioEl.textContent = state.usuario.email;
  if (telefonoUsuarioEl) telefonoUsuarioEl.textContent = state.usuario.telefono;

  const perfilFoto = document.getElementById('perfilFoto');
  const avatarFallback = document.getElementById('avatarFallback');
  const avatarLoading = document.getElementById('avatarLoading');
  const btnCambiarFoto = document.getElementById('btnCambiarFoto');
  const inputFotoPerfil = document.getElementById('inputFotoPerfil');
  function mostrarFotoPerfil(url) {
    if (!perfilFoto) return;
    if (!url) {
      perfilFoto.hidden = true;
      if (avatarFallback) {
        avatarFallback.textContent = obtenerIniciales(state.usuario.nombre);
        avatarFallback.hidden = false;
      }
      return;
    }
    perfilFoto.src = url;
    perfilFoto.hidden = false;
    if (avatarFallback) avatarFallback.hidden = true;
  }

  function obtenerIniciales(nombre) {
    return String(nombre || 'Usuario')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte[0].toUpperCase())
      .join('');
  }

  function aplicarPerfilUsuario(perfil) {
    if (!perfil) return;
    state.usuario = {
      ...state.usuario,
      ...perfil,
      nombre: perfil.nombre || state.usuario.nombre,
      email: perfil.correo || perfil.email || state.usuario.email,
      urlPicture: perfil.urlPicture || state.usuario.urlPicture || '',
    };

    if (nombreUsuarioEl) nombreUsuarioEl.textContent = state.usuario.nombre;
    if (emailUsuarioEl) emailUsuarioEl.textContent = state.usuario.email;
    if (telefonoUsuarioEl) telefonoUsuarioEl.textContent = state.usuario.telefono;

    if (state.usuario.urlPicture) {
      mostrarFotoPerfil(state.usuario.urlPicture);
    }

    const sesionActual = JSON.parse(localStorage.getItem('devportes_sesion_activa') || '{}');
    localStorage.setItem('devportes_sesion_activa', JSON.stringify({
      ...sesionActual,
      nombre: state.usuario.nombre,
      correo: state.usuario.email,
      email: state.usuario.email,
      telefono: state.usuario.telefono,
      cedula: state.usuario.cedula,
      urlPicture: state.usuario.urlPicture,
    }));
  }

  if (state.usuario.urlPicture) mostrarFotoPerfil(state.usuario.urlPicture);
  else if (perfilFoto && !perfilFoto.getAttribute('src')) mostrarFotoPerfil('');

  obtenerPerfilCompleto(pageLoadController.signal)
    .then(aplicarPerfilUsuario)
    .catch(() => {
      // La información de sesión ya está disponible como fallback visual.
    });

  cargarEstadisticasUsuario();

  async function cargarEstadisticasUsuario() {
    const estado = document.getElementById('resumenEstado');
    const reservas = document.getElementById('totalReservasUsuario');
    const horas = document.getElementById('horasJugadasUsuario');
    const favorita = document.getElementById('canchaFavoritaUsuario');

    try {
      const estadisticas = await obtenerEstadisticasUsuario(pageLoadController.signal);
      if (reservas) reservas.textContent = String(estadisticas.totalReservations ?? 0);
      if (horas) horas.textContent = `${estadisticas.playedHours ?? 0}h`;
      if (favorita) favorita.textContent = estadisticas.favoriteField || 'N/A';
      if (estado) estado.hidden = true;
    } catch (error) {
      if (isAbortError(error)) return;
      console.error('Error al cargar estadísticas del usuario:', error);
      if (estado) {
        estado.textContent = 'No se pudieron cargar tus estadísticas.';
        estado.hidden = false;
      }
    } finally {
      [reservas, horas, favorita].forEach((element) => {
        element?.classList.remove('resumen-dato-loading');
      });
    }
  }

  perfilFoto?.addEventListener('error', () => {
    perfilFoto.hidden = true;
    if (avatarFallback) {
      avatarFallback.textContent = obtenerIniciales(state.usuario.nombre);
      avatarFallback.hidden = false;
    }
  });

  btnCambiarFoto?.addEventListener('click', () => inputFotoPerfil?.click());
  inputFotoPerfil?.addEventListener('change', async () => {
    const file = inputFotoPerfil.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showToast('Selecciona una imagen JPG, PNG o WebP.', 'advertencia');
      inputFotoPerfil.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('La imagen no puede superar los 5 MB.', 'advertencia');
      inputFotoPerfil.value = '';
      return;
    }
    btnCambiarFoto.disabled = true;
    btnCambiarFoto.classList.add('loading');
    if (avatarLoading) avatarLoading.hidden = false;
    try {
      const respuesta = await actualizarFotoPerfil(file);
      const urlPicture = respuesta?.urlPicture;
      if (!urlPicture) throw new Error('El servidor no devolvió la URL de la imagen.');
      if (respuesta?.token) localStorage.setItem('devportes_token', respuesta.token);
      state.usuario.urlPicture = urlPicture;
      mostrarFotoPerfil(urlPicture);
      const sesionActual = JSON.parse(localStorage.getItem('devportes_sesion_activa') || '{}');
      localStorage.setItem('devportes_sesion_activa', JSON.stringify({ ...sesionActual, urlPicture }));
      showToast('Foto de perfil actualizada correctamente.', 'exito');
    } catch (error) {
      if (!isNetworkError(error)) showToast(error.message || 'No se pudo actualizar la foto.', 'error');
    } finally {
      btnCambiarFoto.disabled = false;
      btnCambiarFoto.classList.remove('loading');
      if (avatarLoading) avatarLoading.hidden = true;
      inputFotoPerfil.value = '';
    }
  });

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
     GESTION DE ESTADOS (LOADING / ERROR / VACIO / EXITO)
     ===================================================== */

  function mostrarEstadoPendientes(estado) {
    const loading = document.getElementById('pendientesLoading');
    const error = document.getElementById('pendientesError');
    const vacio = document.getElementById('pendientesVacio');
    const lista = document.getElementById('listaReservas');

    loading?.classList.add('d-none');
    error?.classList.add('d-none');
    vacio?.classList.add('d-none');
    lista?.classList.add('d-none');

    switch (estado) {
      case 'cargando':
        loading?.classList.remove('d-none');
        break;
      case 'error':
        error?.classList.remove('d-none');
        break;
      case 'vacio':
        if (lista) lista.innerHTML = '';
        vacio?.classList.remove('d-none');
        break;
      case 'exito':
        if (lista) lista.classList.remove('d-none');
        break;
    }
  }

  function mostrarEstadoHistorial(estado) {
    const loading = document.getElementById('historialLoading');
    const error = document.getElementById('historialError');
    const vacio = document.getElementById('historialVacio');
    const tabla = document.getElementById('tablaHistorial');

    loading?.classList.add('d-none');
    error?.classList.add('d-none');
    vacio?.classList.add('d-none');
    if (tabla) tabla.classList.add('d-none');

    switch (estado) {
      case 'cargando':
        loading?.classList.remove('d-none');
        break;
      case 'error':
        error?.classList.remove('d-none');
        break;
      case 'vacio':
        vacio?.classList.remove('d-none');
        break;
      case 'exito':
        tabla?.classList.remove('d-none');
        break;
    }
  }

  /* =====================================================
     CARGAR RESERVAS PENDIENTES
     ===================================================== */

  async function cargarReservasPendientes() {
    mostrarEstadoPendientes('cargando');

    try {
      const reservas = await obtenerReservasPendientes(pageLoadController.signal);
      reservasPendientesActuales = reservas;
      if (reservas.length === 0) {
        mostrarEstadoPendientes('vacio');
        return;
      }
      renderizarReservasPendientes(reservas);
      mostrarEstadoPendientes('exito');
    } catch (error) {
      if (isAbortError(error)) return;
      console.error('Error al cargar reservas pendientes:', error);
      mostrarEstadoPendientes('error');
    }
  }

  function renderizarReservasPendientes(reservas) {
    const lista = document.getElementById('listaReservas');
    if (!lista) return;

    lista.innerHTML = reservas.map((r) => `
      <div class="reserva-pendiente" data-reserva-id="${r.id}">
        <div class="reserva-datos">
          <h4>${r.cancha}</h4>
          <div class="reserva-detalles">
            <span><i class="bi bi-calendar3"></i>${r.fecha}</span>
            <span><i class="bi bi-clock"></i>${r.hora}${r.horaFin ? ` - ${r.horaFin.substring(0, 5)}` : ''}</span>
            <span><i class="bi bi-people"></i>${r.tipo}</span>
            <span><i class="bi bi-cash-stack"></i>${formatearPrecioUsuario(r.totalPago)}</span>
          </div>
        </div>
        <div class="reserva-acciones">
          ${r.qrUbicacion ? `
            <button type="button" class="btn-secundario btn-ver-qr" data-id="${r.id}">
              <i class="bi bi-qr-code me-1"></i>Ver QR
            </button>
          ` : ''}
          <button type="button" class="btn-cancelar" data-id="${r.id}">
            <i class="bi bi-x-circle"></i>
            Cancelar reserva
          </button>
        </div>
      </div>
    `).join('');

    actualizarContadorPendientes();
  }

  const modalQrUbicacion = document.getElementById('modalQrUbicacion');
  const btnCerrarQrUbicacion = document.getElementById('btnCerrarQrUbicacion');
  let lastFocusedQr = null;

  function abrirModalQrUbicacion(reserva) {
    if (!modalQrUbicacion || !reserva.qrUbicacion) return;

    document.getElementById('qrUbicacionSede').textContent = reserva.sede || 'Sede';
    document.getElementById('qrUbicacionDireccion').textContent = reserva.direccion || 'Dirección no disponible';
    document.getElementById('qrUbicacionImagen').src = reserva.qrUbicacion;
    const abrir = document.getElementById('qrUbicacionAbrir');
    if (reserva.urlUbicacion) {
      abrir.href = reserva.urlUbicacion;
      abrir.hidden = false;
    } else {
      abrir.removeAttribute('href');
      abrir.hidden = true;
    }
    lastFocusedQr = document.activeElement;
    modalQrUbicacion.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function cerrarModalQrUbicacion() {
    if (!modalQrUbicacion) return;
    modalQrUbicacion.hidden = true;
    document.body.style.overflow = '';
    lastFocusedQr?.focus();
  }

  btnCerrarQrUbicacion?.addEventListener('click', cerrarModalQrUbicacion);
  modalQrUbicacion?.addEventListener('click', (evento) => {
    if (evento.target === modalQrUbicacion) cerrarModalQrUbicacion();
  });

  /* =====================================================
     CARGAR HISTORIAL DE RESERVAS
     ===================================================== */

  async function cargarHistorialReservas() {
    mostrarEstadoHistorial('cargando');

    try {
      const reservas = await obtenerHistorialReservas(pageLoadController.signal);
      if (reservas.length === 0) {
        mostrarEstadoHistorial('vacio');
        return;
      }
      renderizarHistorial(reservas);
      mostrarEstadoHistorial('exito');
    } catch (error) {
      if (isAbortError(error)) return;
      console.error('Error al cargar historial:', error);
      mostrarEstadoHistorial('error');
    }
  }

  function renderizarHistorial(reservas) {
    const tbody = document.getElementById('historialBody');
    if (!tbody) return;

    tbody.innerHTML = reservas.map((r) => {
      const claseEstado = r.estado.toLowerCase().replace(/\s/g, '');
      return `
        <tr data-total-pago="${r.totalPago}" data-saldo-pendiente="${r.saldoPendiente}">
          <td>${r.fecha}</td>
          <td>${r.cancha}</td>
          <td>${r.hora}${r.horaFin ? ` - ${r.horaFin.substring(0, 5)}` : ''}</td>
          <td>${r.tipo}</td>
          <td><span class="estado-badge ${claseEstado}">${r.estadoTexto}</span></td>
          <td><button type="button" class="btn-secundario btn-detalle" data-id="${r.id}">Ver Detalle</button></td>
        </tr>
      `;
    }).join('');
  }

  function formatearPrecioUsuario(valor) {
    return Number(valor || 0).toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    });
  }

  function reservaDataPago(tr) {
    const total = Number(tr?.dataset.totalPago || 0);
    const saldo = Number(tr?.dataset.saldoPendiente || 0);
    return `${formatearPrecioUsuario(total)} · pendiente ${formatearPrecioUsuario(saldo)}`;
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

    limpiarErroresFormulario();

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
     VALIDACIÓN DE CAMPOS DEL MODAL
     ===================================================== */

  const inputNombre = document.getElementById('inputNombre');
  const inputEmail = document.getElementById('inputEmail');
  const inputTelefono = document.getElementById('inputTelefono');
  const inputCedula = document.getElementById('inputCedula');

  function marcarInvalido(inputEl, mensaje) {
    const group = inputEl.closest('.campo-formulario');
    if (!group) return;
    group.classList.remove('is-valid');
    group.classList.add('is-invalid');
    const tooltip = group.querySelector('.tooltip-error');
    if (tooltip && mensaje) tooltip.textContent = mensaje;
  }

  function marcarValido(inputEl) {
    const group = inputEl.closest('.campo-formulario');
    if (!group) return;
    group.classList.remove('is-invalid');
    group.classList.add('is-valid');
  }

  function limpiarErroresFormulario() {
    document.querySelectorAll('#formEditarPerfil .campo-formulario').forEach((g) => {
      g.classList.remove('is-invalid', 'is-valid');
    });
  }

  function validarNombreEdit() {
    const v = inputNombre.value.trim();
    if (v === '') { marcarInvalido(inputNombre, 'El nombre es obligatorio'); return false; }
    if (v.length < 2 || v.length > 80) { marcarInvalido(inputNombre, 'Entre 2 y 80 caracteres'); return false; }
    marcarValido(inputNombre);
    return true;
  }

  function validarEmailEdit() {
    const v = inputEmail.value.trim();
    if (v === '') { marcarInvalido(inputEmail, 'El correo es obligatorio'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { marcarInvalido(inputEmail, 'Ingresa un correo válido'); return false; }
    marcarValido(inputEmail);
    return true;
  }

  function validarTelefonoEdit() {
    const v = inputTelefono.value.trim();
    if (v === '') { marcarInvalido(inputTelefono, 'El teléfono es requerido'); return false; }
    if (!/^\d{10}$/.test(v)) { marcarInvalido(inputTelefono, 'Debe tener 10 dígitos'); return false; }
    marcarValido(inputTelefono);
    return true;
  }

  function validarCedulaEdit() {
    const v = inputCedula.value.trim();
    if (v === '') { marcarInvalido(inputCedula, 'La cédula es requerida'); return false; }
    if (!/^\d{3,12}$/.test(v)) { marcarInvalido(inputCedula, 'Solo números (3-12 dígitos)'); return false; }
    marcarValido(inputCedula);
    return true;
  }

  inputNombre?.addEventListener('input', validarNombreEdit);
  inputEmail?.addEventListener('input', validarEmailEdit);
  inputTelefono?.addEventListener('input', () => {
    inputTelefono.value = inputTelefono.value.replace(/\D/g, '');
    validarTelefonoEdit();
  });
  inputCedula?.addEventListener('input', () => {
    inputCedula.value = inputCedula.value.replace(/\D/g, '');
    validarCedulaEdit();
  });

  /* =====================================================
     CERRAR SESIÓN
     ===================================================== */

  const btnCerrarSesion = document.getElementById('btnCerrarSesion');
  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener('click', async () => {
      const confirmar = await showConfirm(
        '¿Estás seguro de que deseas cerrar sesión?',
        'Cerrar sesión'
      );
      if (confirmar) {
        cerrarSesion();
      }
    });
  }

  /* =====================================================
     GUARDAR CAMBIOS DEL PERFIL
     ===================================================== */

  if (formEditarPerfil) {
    formEditarPerfil.addEventListener('submit', async (evento) => {
      evento.preventDefault();
      limpiarErroresFormulario();

      const esNombreValido = validarNombreEdit();
      const esEmailValido = validarEmailEdit();
      const esTelefonoValido = validarTelefonoEdit();
      const esCedulaValida = validarCedulaEdit();

      if (!esNombreValido || !esEmailValido || !esTelefonoValido || !esCedulaValida) {
        return;
      }

      const nombre = inputNombre.value.trim();
      const email = inputEmail.value.trim();
      const telefono = inputTelefono.value.trim();
      const cedula = inputCedula.value.trim();

      try {
        const respuesta = await apiPut('/auth/profile', {
          name: nombre,
          email,
          phoneNumber: telefono,
          identityDocument: cedula
        }, { auth: true });

        // Actualizar token JWT en localStorage (el email cambió → el subject del JWT también)
        if (respuesta?.token) {
          localStorage.setItem('devportes_token', respuesta.token);
        }

        // Actualizar datos de sesión en localStorage para que persistan al recargar
        const sesionActual = JSON.parse(localStorage.getItem('devportes_sesion_activa') || '{}');
        const sesionActualizada = {
          ...sesionActual,
          nombre,
          correo: email,
          email,
          telefono,
          cedula,
          urlPicture: respuesta?.urlPicture || state.usuario.urlPicture || sesionActual.urlPicture || ''
        };
        localStorage.setItem('devportes_sesion_activa', JSON.stringify(sesionActualizada));

        state.usuario = { ...state.usuario, nombre, email, telefono, cedula };

        const nombreUsuario = document.getElementById('nombreUsuario');
        const emailUsuario = document.getElementById('emailUsuario');
        const telefonoUsuario = document.getElementById('telefonoUsuario');

        if (nombreUsuario) nombreUsuario.textContent = nombre;
        if (emailUsuario) emailUsuario.textContent = email;
        if (telefonoUsuario) telefonoUsuario.textContent = telefono;

        closeModal();
        limpiarErroresFormulario();
        showToast('Perfil actualizado correctamente!', 'exito');
        emit('perfil:actualizado', state.usuario);
      } catch (error) {
        console.error('Error al actualizar perfil:', error);

        if (isNetworkError(error)) {
          return;
        }

        const campo = error.data?.field;
        const mensaje = error.message || 'Error al actualizar. Intenta de nuevo.';

        if (error.status === 404 || error.status === 405) {
          showToast('Esta funcionalidad no está disponible aún.', 'advertencia');
          return;
        } else if (error.status === 500) {
          showToast('Error del servidor. Intenta más tarde.', 'error');
          return;
        } else if (campo === 'email') {
          marcarInvalido(inputEmail, mensaje);
        } else if (campo === 'identityDocument') {
          marcarInvalido(inputCedula, mensaje);
        } else if (campo === 'phoneNumber') {
          marcarInvalido(inputTelefono, mensaje);
        } else if (campo === 'name') {
          marcarInvalido(inputNombre, mensaje);
        } else {
          showToast(mensaje, 'error');
        }
      }
    });
  }

  /* =====================================================
     CANCELAR RESERVAS PENDIENTES - DELEGACION DE EVENTOS
     ===================================================== */

  document.addEventListener('click', async (evento) => {
    const btnQr = evento.target.closest('.btn-ver-qr');
    if (btnQr) {
      const reserva = reservasPendientesActuales.find((item) => String(item.id) === String(btnQr.dataset.id));
      if (reserva) abrirModalQrUbicacion(reserva);
      return;
    }

    const btnCancelar = evento.target.closest('.btn-cancelar');
    if (!btnCancelar) return;

    evento.preventDefault();

    const reserva = btnCancelar.closest('.reserva-pendiente');
    if (!reserva) return;

    const canchaEl = reserva.querySelector('h4');
    const nombreCancha = canchaEl ? canchaEl.textContent.trim() : 'esta reserva';
    const reservaId = btnCancelar.dataset.id;

    const confirmar = await showConfirm(
      `Deseas cancelar la reserva de <strong>${escapeHtml(nombreCancha)}</strong>?`,
      'Cancelar reserva',
      { allowHtml: true }
    );

    if (!confirmar) return;

    try {
      await cancelarReserva(reservaId);
      reserva.remove();
      actualizarContadorPendientes();
      showToast('La reserva ha sido cancelada correctamente', 'exito');
      emit('reserva:cancelada', { id: reservaId, cancha: nombreCancha });
      cargarHistorialReservas();
    } catch (error) {
      console.error('Error al cancelar reserva:', error);
      showToast('No se pudo cancelar la reserva. Intenta de nuevo.', 'error');
    }
  });

  /* =====================================================
     ACTUALIZAR CONTADOR DE RESERVAS
     ===================================================== */

  function actualizarContadorPendientes() {
    const contador = document.getElementById('contadorPendientes');
    const reservas = document.querySelectorAll('.reserva-pendiente');

    if (contador) {
      contador.textContent = reservas.length;
    }

    if (reservas.length === 0) {
      mostrarEstadoPendientes('vacio');
    }
  }

  /* =====================================================
     BOTONES "VER DETALLE" - MODAL
     ===================================================== */

  const modalDetalle = document.getElementById('modalDetalle');
  const btnCerrarDetalle = document.getElementById('btnCerrarDetalle');
  let lastFocusedDetalle = null;

  function openDetalle(tr, idReserva) {
    if (!modalDetalle) return;

    const celdas = tr.querySelectorAll('td');
    const reserva = {
      id: idReserva,
      cancha: celdas[1]?.textContent.trim() || '',
      fecha: celdas[0]?.textContent.trim() || '',
      hora: celdas[2]?.textContent.trim() || '',
      tipo: celdas[3]?.textContent.trim() || '',
      estado: celdas[4]?.textContent.trim() || '',
      jugador: state.usuario.nombre || '—',
      pago: reservaDataPago(tr)
    };

    document.getElementById('detalleId').textContent = reserva.id;
    document.getElementById('detalleCancha').textContent = reserva.cancha;
    document.getElementById('detalleFecha').textContent = reserva.fecha;
    document.getElementById('detalleHora').textContent = reserva.hora;
    document.getElementById('detalleTipo').textContent = reserva.tipo;

    const estadoEl = document.getElementById('detalleEstado');
    const estadoNorm = reserva.estado.toLowerCase().trim();
    if (estadoNorm === 'completada') {
      estadoEl.innerHTML = `<span class="estado-badge completada">${reserva.estado}</span>`;
    } else if (estadoNorm === 'cancelada') {
      estadoEl.innerHTML = `<span class="estado-badge cancelada">${reserva.estado}</span>`;
    } else if (estadoNorm === 'confirmada') {
      estadoEl.innerHTML = `<span class="estado-badge confirmada">${reserva.estado}</span>`;
    } else if (estadoNorm === 'pendiente') {
      estadoEl.innerHTML = `<span class="estado-badge pendiente">${reserva.estado}</span>`;
    } else {
      estadoEl.textContent = reserva.estado;
    }

    document.getElementById('detalleJugador').textContent = reserva.jugador;
    document.getElementById('detallePago').textContent = reserva.pago;

    lastFocusedDetalle = document.activeElement;
    modalDetalle.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeDetalle() {
    if (!modalDetalle) return;
    modalDetalle.hidden = true;
    document.body.style.overflow = '';
    if (lastFocusedDetalle) lastFocusedDetalle.focus();
  }

  document.addEventListener('click', (evento) => {
    const btnDetalle = evento.target.closest('.btn-detalle');
    if (!btnDetalle) return;

    const idReserva = btnDetalle.dataset.id;
    const tr = btnDetalle.closest('tr');
    if (tr) openDetalle(tr, idReserva);
  });

  if (btnCerrarDetalle) {
    btnCerrarDetalle.addEventListener('click', closeDetalle);
  }

  if (modalDetalle) {
    modalDetalle.addEventListener('click', (evento) => {
      if (evento.target === modalDetalle) closeDetalle();
    });
  }

  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && modalDetalle && !modalDetalle.hidden) {
      closeDetalle();
    }
    if (evento.key === 'Escape' && modalQrUbicacion && !modalQrUbicacion.hidden) {
      cerrarModalQrUbicacion();
    }
  });

  /* =====================================================
     BOTON "RESERVAR NUEVA CANCHA" (si existe)
     ===================================================== */

  const botonNuevaReserva = document.getElementById('btn-nueva-reserva');
  if (botonNuevaReserva) {
    botonNuevaReserva.addEventListener('click', () => {
      showToast('Abriendo asistente de reservas...', 'info');
      // window.location.href = "../views/reservar-cancha.html";
    });
  }

  /* =====================================================
     SINCRONIZAR MODO OSCURO / TEMA (placeholder)
     ===================================================== */

  // Escuchar cambios de tema del sistema
  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      emit('theme:change', { dark: e.matches });
    });
  }

  /* =====================================================
     BOTONES REINTENTAR
     ===================================================== */

  document.getElementById('btnReintentarPendientes')?.addEventListener('click', () => cargarReservasPendientes());
  document.getElementById('btnReintentarHistorial')?.addEventListener('click', () => cargarHistorialReservas());

  let ultimaActualizacionReservas = 0;
  async function actualizarReservasAlVolver() {
    const ahora = Date.now();
    if (ahora - ultimaActualizacionReservas < 1000) return;
    ultimaActualizacionReservas = ahora;
    await Promise.all([cargarReservasPendientes(), cargarHistorialReservas()]);
  }

  window.addEventListener('pageshow', actualizarReservasAlVolver);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') actualizarReservasAlVolver();
  });

  /* =====================================================
     CARGAR DATOS AL INICIAR
     ===================================================== */

  cargarReservasPendientes();
  cargarHistorialReservas();

  /* =====================================================
     EXPONER API PUBLICA
     ===================================================== */

  window.UsuarioPanel = {
    state,
    showToast,
    emit,
    on,
    openModal,
    closeModal,
    cargarReservasPendientes,
    cargarHistorialReservas
  };

  console.log('[UsuarioPanel] Inicializado - API disponible en window.UsuarioPanel');
});
