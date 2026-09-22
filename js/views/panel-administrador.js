import {
  obtenerCanchas,
  crearCancha,
  editarCancha as editarCanchaApi,
  eliminarCancha as eliminarCanchaApi,
  formatoTipo,
  tipoAArray,
} from '../api/canchas.js';
import {
  obtenerUbicaciones,
  crearUbicacion,
  editarUbicacion as editarUbicacionApi,
  toggleEstadoUbicacion,
  eliminarUbicacion,
} from '../api/locations.js';
import { obtenerPosts, crearPost, editarPost, eliminarPost } from '../api/gallery.js';
import { obtenerUsuarios } from '../api/auth.js';
import { obtenerTodasLasReservas, obtenerMetodosPago, registrarPagoFinal } from '../api/reservations.js';
import { showToast } from '../componets/toast.js';

const KEY_ADMIN_SESSION = 'devportes_admin_sesion';

let listaClientes = [];
let listaReservas = [];

let ubicaciones = [];
let cargaUbicaciones = null;
let dashboardCharts = { income: null, distribution: null };
let dashboardPeriod = 'semana';
let filtrosReservasActivados = false;
const seccionesCargadas = new Set();
const cargasSecciones = new Map();

function normalizarCancha(raw) {
  return {
    id: raw.id,
    titulo: raw.name || raw.titulo || '',
    nombre: raw.name || raw.nombre || '',
    tipo: raw.sport ? tipoAArray(raw.sport) : raw.tipo || [],
    superficie: raw.surface || raw.superficie || '',
    precio: `$${Number(raw.hourlyRate || raw.tarifa || 0).toLocaleString('es-CO')}`,
    tarifa: Number(raw.hourlyRate || raw.tarifa || 0),
    capacidad: Number(raw.capacity || raw.capacidad || 0),
    estado:
      raw.state === 'DISPONIBLE' ? 'Disponible' : raw.state === 'MANTENIMIENTO' ? 'Mantenimiento' : raw.estado || 'Disponible',
    imagen: (raw.urlPictures && raw.urlPictures[0]) || (raw.url_pictures && raw.url_pictures[0]) || raw.imagen || '',
    descripcion: raw.description || raw.descripcion || '',
    detalles: raw.details || raw.detalles || [],
    locationId: raw.locationId || null,
    visible: raw.visible !== false,
  };
}

function mapearEstadoFrontend(estadoFrontend) {
  return estadoFrontend === 'Disponible' ? 'DISPONIBLE' : 'MANTENIMIENTO';
}

function setFormBtnLoading(form, loading) {
  const btn = form?.matches('button') ? form : form?.querySelector('[type="submit"], .btn-primary-modal');
  if (!btn) return;
  btn.classList.toggle('loading', loading);
  btn.disabled = loading;
}

function establecerCargaDashboard(cargando) {
  const dashboard = document.getElementById('dashboard-view');
  if (!dashboard) return;
  dashboard.classList.toggle('dashboard-loading', cargando);
  if (!cargando) {
    dashboard.querySelectorAll('.skeleton').forEach((elemento) => elemento.remove());
  }
}

function obtenerNombreUbicacion(id) {
  const u = ubicaciones.find((loc) => String(loc.id) === String(id));
  return u ? u.name : `Sede #${id}`;
}

function generarOpcionesSelectUbicacion(selectedId) {
  if (ubicaciones.length === 0) {
    return '<option value="">No hay sedes disponibles</option>';
  }

  return ubicaciones
    .map(
      (u) =>
        `<option value="${u.id}" ${String(u.id) === String(selectedId) ? 'selected' : ''}>${u.name}${u.headquarters ? ' - ' + u.headquarters : ''}${u.visible === false ? ' (Inactiva)' : ''}</option>`,
    )
    .join('');
}

async function cargarUbicacionesAdmin() {
  if (ubicaciones.length > 0) return ubicaciones;
  if (cargaUbicaciones) return cargaUbicaciones;

  cargaUbicaciones = obtenerUbicaciones()
    .then((data) => {
      ubicaciones = Array.isArray(data) ? data : [];
      return ubicaciones;
    })
    .finally(() => {
      cargaUbicaciones = null;
    });

  return cargaUbicaciones;
}

function validarUrl(url, { requerida = false } = {}) {
  if (!url) return !requerida;

  try {
    const parsedUrl = new URL(url);
    return ['http:', 'https:'].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
}

async function conScrollPreservado(fn) {
  const main = document.querySelector('.main-content');
  const scrollPos = main ? main.scrollTop : window.scrollY;
  await fn();
  if (main) {
    main.scrollTop = scrollPos;
  } else {
    window.scrollTo(0, scrollPos);
  }
}

function mostrarSkeletonsGrid(contenedor, cantidad, etiqueta) {
  contenedor.setAttribute('aria-busy', 'true');
  contenedor.setAttribute('aria-label', `Cargando ${etiqueta}`);
  contenedor.innerHTML = Array.from(
    { length: cantidad },
    () => '<div class="admin-skeleton-card" aria-hidden="true"></div>',
  ).join('');
}

function ocultarSkeletons(contenedor) {
  contenedor.removeAttribute('aria-busy');
  contenedor.removeAttribute('aria-label');
}

document.addEventListener('DOMContentLoaded', async () => {
  const adminSession = localStorage.getItem(KEY_ADMIN_SESSION);
  if (!adminSession) {
    window.location.href = 'admin-login.html';
    return;
  }

  if (window.lucide) {
    lucide.createIcons();
  }

  inicializarFechasDashboard();
  dashboardCharts.income = renderGraficoBarra();
  dashboardCharts.distribution = renderGraficoDoughnut();

  activarMenuMovil();
  activarNavegacionMenu();
  activarFiltrosDashboard();
  activarCerrarSesion();

  const cargarReservasDashboard = renderReservas().finally(() => {
    establecerCargaDashboard(false);
    actualizarDashboard();
  });
  activarActualizacionAutomaticaReservas();

  await cargarReservasDashboard;
  seccionesCargadas.add('reservas');
  activarModalGeneral();
});

function activarMenuMovil() {
  const toggleBtn = document.getElementById('mobileToggleBtn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');

  function cerrarMenu() {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
  }

  if (toggleBtn && sidebar && overlay) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('active');
    });

    overlay.addEventListener('click', cerrarMenu);
  }
}

function activarNavegacionMenu() {
  const itemsMenu = document.querySelectorAll('.sidebar-nav .nav-item');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');

  const vistaActiva = document.querySelector('.view-section.active');
  if (vistaActiva) {
    setTimeout(() => vistaActiva.classList.add('visible'), 50);
  }

  itemsMenu.forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();

      if (item.classList.contains('active')) return;

      const target = item.getAttribute('data-target');
      const vistaSiguiente = document.getElementById(target);
      const vistaActual = document.querySelector('.view-section.active');

      itemsMenu.forEach((i) => i.classList.remove('active'));
      item.classList.add('active');

      if (window.innerWidth <= 768 && sidebar && overlay) {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
      }

      if (vistaActual) {
        vistaActual.classList.remove('visible');

        setTimeout(() => {
          vistaActual.classList.remove('active');

          if (vistaSiguiente) {
            vistaSiguiente.classList.add('active');
            setTimeout(() => vistaSiguiente.classList.add('visible'), 30);
          }
        }, 250);
      }

      cargarSeccionAdmin(target).catch(() => {});
    });
  });
}

function cargarSeccionAdmin(target) {
  const seccion = {
    'reservas-view': 'reservas',
    'sedes-view': 'sedes',
    'canchas-view': 'canchas',
    'galeria-view': 'galeria',
    'clientes-view': 'clientes',
  }[target];

  if (!seccion || seccionesCargadas.has(seccion)) return Promise.resolve();
  if (cargasSecciones.has(seccion)) return cargasSecciones.get(seccion);

  const carga = (async () => {
    if (seccion === 'reservas') {
      await renderReservas();
    } else if (seccion === 'sedes') {
      await renderSedesGrid();
    } else if (seccion === 'canchas') {
      await cargarSeccionAdmin('sedes');
      await renderCanchasGrid();
    } else if (seccion === 'galeria') {
      await renderGaleriaGrid();
    } else if (seccion === 'clientes') {
      await renderClientesGrid();
    }
    seccionesCargadas.add(seccion);
  })().catch((error) => {
    cargasSecciones.delete(seccion);
    throw error;
  });

  cargasSecciones.set(seccion, carga);
  return carga;
}

function activarCerrarSesion() {
  const btnLogout = document.getElementById('logoutBtn');
  if (btnLogout) {
    btnLogout.addEventListener('click', (e) => {
      e.preventDefault();
      abrirModalConfirmacion('Deseas cerrar tu sesion actual?', () => {
        localStorage.removeItem(KEY_ADMIN_SESSION);
        localStorage.removeItem('devportes_admin_token');
        window.location.href = 'admin-login.html';
      });
    });
  }
}

function inicialesDe(nombre) {
  return nombre
    .split(' ')
    .map((p) => p[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

function normalizarCliente(raw) {
  return {
    id: raw.id,
    nombre: raw.name,
    email: raw.email,
    telefono: raw.phoneNumber,
    tipo: raw.classification || raw.role,
    state: raw.state,
  };
}

function formatearHoraAdmin(hora) {
  return hora ? hora.substring(0, 5) : '-';
}

function formatearDineroAdmin(valor) {
  return `$${Number(valor || 0).toLocaleString('es-CO')}`;
}

function pagoRegistrado(reserva) {
  return Math.max(Number(reserva.totalPago || 0) - Number(reserva.saldoPendiente || 0), 0);
}

function resumenPagoReserva(reserva) {
  const pagado = formatearDineroAdmin(pagoRegistrado(reserva));
  const saldo = formatearDineroAdmin(reserva.saldoPendiente);

  if (reserva.estado === 'CANCELADA') {
    return `Pagado ${pagado} · saldo no cobrado ${saldo}`;
  }

  return Number(reserva.saldoPendiente) > 0 ? `Pendiente ${saldo} · pagado ${pagado}` : `Pago completo · ${pagado}`;
}

function renderReservasTabla() {
  const contenedor = document.getElementById('reservationsTableContainer');
  const search = document.getElementById('reservationSearch')?.value.trim().toLowerCase() || '';
  const status = document.getElementById('reservationStatusFilter')?.value || '';
  if (!contenedor) return;

  const reservas = listaReservas.filter((reserva) => {
    const coincideTexto = !search || `${reserva.cliente} ${reserva.cancha}`.toLowerCase().includes(search);
    return coincideTexto && (!status || reserva.estado === status);
  });

  if (reservas.length === 0) {
    contenedor.innerHTML = '<p class="empty-state text-muted">No hay reservas que coincidan con los filtros.</p>';
    return;
  }

  contenedor.innerHTML = `
    <table class="tabla-modal reservations-table">
      <thead>
        <tr>
          <th>Fecha y hora</th>
          <th>Cliente</th>
          <th>Cancha</th>
          <th>Estado</th>
          <th class="td-acciones">Acción</th>
        </tr>
      </thead>
      <tbody>
        ${reservas
          .map(
            (reserva) => `
          <tr>
            <td data-label="Fecha y hora" class="reservation-date-cell"><strong>${escapeHtml(formatearFechaAdmin(reserva.fecha))}</strong><span class="reservation-time"><i data-lucide="clock-3"></i>${formatearHoraAdmin(reserva.horaInicio)} - ${formatearHoraAdmin(reserva.horaFin)}</span></td>
            <td data-label="Cliente" class="reservation-client-cell"><strong>${escapeHtml(reserva.cliente)}</strong><span class="text-muted">${escapeHtml(reserva.emailCliente || 'Sin correo')}</span></td>
            <td data-label="Cancha"><span class="reservation-field"><i data-lucide="map-pin"></i>${escapeHtml(reserva.cancha)}</span></td>
            <td data-label="Estado"><span class="reservation-status ${reserva.estado.toLowerCase()}">${escapeHtml(reserva.estadoTexto)}</span><span class="reservation-balance ${reserva.estado === 'CANCELADA' ? 'is-cancelled' : ''}">${resumenPagoReserva(reserva)}</span></td>
            <td data-label="Acción" class="td-acciones">
              <button class="btn-action btn-detail" onclick="abrirDetalleReserva(${reserva.id})"><i data-lucide="eye"></i> Ver detalle</button>
              ${Number(reserva.saldoPendiente) > 0 && reserva.estado !== 'CANCELADA' ? `<button class="btn-action btn-payment" onclick="abrirPagoFinalReserva(${reserva.id})"><i data-lucide="banknote"></i> Terminar pago</button>` : ''}
            </td>
          </tr>
        `,
          )
          .join('')}
      </tbody>
    </table>
  `;
  if (window.lucide) lucide.createIcons();
}

async function renderReservas() {
  const contenedor = document.getElementById('reservationsTableContainer');
  if (!contenedor) return;
  contenedor.setAttribute('aria-busy', 'true');
  contenedor.setAttribute('aria-label', 'Cargando reservas');
  contenedor.innerHTML = `
    <div class="admin-loading-table" aria-hidden="true">
      ${Array.from({ length: 6 }, () => '<span></span>').join('')}
    </div>
  `;
  try {
    listaReservas = await obtenerTodasLasReservas();
    ajustarRangoInicialDashboard();
    const resumen = document.getElementById('reservationSummary');
    if (resumen) resumen.textContent = `${listaReservas.length} reserva${listaReservas.length === 1 ? '' : 's'} registradas`;
    renderReservasTabla();
    actualizarDashboard();
  } catch (error) {
    contenedor.innerHTML = '<p class="empty-state text-muted">No fue posible cargar las reservas.</p>';
    showToast(`Error al cargar reservas: ${error.message}`, 'error');
    establecerCargaDashboard(false);
  } finally {
    contenedor.removeAttribute('aria-busy');
    contenedor.removeAttribute('aria-label');
  }
  if (!filtrosReservasActivados) {
    document.getElementById('reservationSearch')?.addEventListener('input', renderReservasTabla);
    document.getElementById('reservationStatusFilter')?.addEventListener('change', renderReservasTabla);
    filtrosReservasActivados = true;
  }
}

function activarActualizacionAutomaticaReservas() {
  const refrescarSiVisible = () => {
    if (document.visibilityState === 'visible') renderReservas();
  };
  window.addEventListener('pageshow', refrescarSiVisible);
  document.addEventListener('visibilitychange', refrescarSiVisible);
}

async function renderClientesGrid() {
  const contenedor = document.getElementById('clientesGridPreview');
  if (!contenedor) return;

  mostrarSkeletonsGrid(contenedor, 4, 'clientes');

  try {
    const data = await obtenerUsuarios();
    listaClientes = Array.isArray(data) ? data.map(normalizarCliente) : [];
  } catch (err) {
    listaClientes = [];
    ocultarSkeletons(contenedor);
    contenedor.innerHTML = '<p class="text-muted" style="padding: 1rem; text-align: center">Error al cargar clientes.</p>';
    return;
  }

  ocultarSkeletons(contenedor);
  contenedor.innerHTML = '';

  if (listaClientes.length === 0) {
    contenedor.innerHTML = '<p class="text-muted" style="padding: 1rem; text-align: center">No hay clientes registrados.</p>';
    return;
  }

  listaClientes.forEach((cliente) => {
    const card = document.createElement('div');
    card.className = 'card user-card-full';
    const iniciales = inicialesDe(cliente.nombre);

    card.innerHTML = `
      <div class="user-card-header">
        <div class="avatar">${iniciales}</div>
        <div>
          <h4 style="font-size: 1rem; font-weight: 700">${escapeHtml(cliente.nombre)}</h4>
          <span class="badge-tag green">${escapeHtml(cliente.tipo)}</span>
        </div>
      </div>

      <div class="user-card-body" style="margin: 12px 0">
        <div class="card-info-row"><span class="text-muted">Email:</span> <strong>${escapeHtml(cliente.email)}</strong></div>
        <div class="card-info-row"><span class="text-muted">Telefono:</span> <strong>${escapeHtml(cliente.telefono || '-')}</strong></div>
      </div>

      <div class="user-card-actions">
        <button class="btn-action btn-detail" onclick="abrirPerfilCliente(${cliente.id})"><i data-lucide="eye"></i> Ver</button>
      </div>
    `;

    contenedor.appendChild(card);
  });

  if (window.lucide) lucide.createIcons();
}

async function renderCanchasGrid() {
  const contenedor = document.getElementById('canchasGridPreview');
  if (!contenedor) return;

  mostrarSkeletonsGrid(contenedor, 4, 'canchas');

  try {
    const canchasRaw = await obtenerCanchas();
    const canchas = Array.isArray(canchasRaw)
      ? canchasRaw
          .map(normalizarCancha)
          .filter((cancha) => cancha.visible !== false)
          .filter((cancha) => {
            const sede = ubicaciones.find((location) => String(location.id) === String(cancha.locationId));
            return sede ? sede.visible !== false : true;
          })
      : [];

    ocultarSkeletons(contenedor);
    contenedor.innerHTML = '';

    if (canchas.length === 0) {
      contenedor.innerHTML = '<p class="empty-state text-muted">No hay canchas activas para mostrar.</p>';
      return;
    }

    canchas.forEach((cancha) => {
      const card = document.createElement('div');
      card.className = 'card user-card-full';

      const badgeClass = cancha.estado === 'Disponible' ? 'green' : 'orange';
      const imagenSrc =
        cancha.imagen ||
        'https://raw.githubusercontent.com/CamiloBermeo/devPortes/develop/assets/img/canchas/baloncesto-coliseo.webp';

      card.innerHTML = `
        <div class="user-card-header" style="display: flex; align-items: center; gap: 12px">
          <img
            src="${imagenSrc}"
            alt="${cancha.titulo}"
            style="width: 48px; height: 48px; object-fit: cover; border-radius: 8px; flex-shrink: 0" />
          <div style="flex: 1; overflow: hidden">
            <h4 style="font-size: 1rem; font-weight: 700; margin: 0; text-overflow: ellipsis; white-space: nowrap; overflow: hidden">
              ${cancha.titulo}
            </h4>
            <span class="badge-tag ${badgeClass}">${cancha.estado}</span>
          </div>
        </div>

        <div class="user-card-body" style="margin: 12px 0">
          <div class="card-info-row">
            <span class="text-muted">Deporte:</span>
            <strong>${formatoTipo(cancha)}</strong>
          </div>
          <div class="card-info-row">
            <span class="text-muted">Capacidad:</span>
            <strong>${cancha.capacidad} personas</strong>
          </div>
          <div class="card-info-row">
            <span class="text-muted">Tarifa:</span>
            <strong class="text-green">$${cancha.tarifa.toLocaleString('es-CO')}/hr</strong>
          </div>
          <div class="card-info-row">
            <span class="text-muted">Sede:</span>
            <strong>${obtenerNombreUbicacion(cancha.locationId)}</strong>
          </div>
        </div>

        <div class="user-card-actions">
          <button class="btn-action btn-detail" onclick="abrirPerfilCancha(${cancha.id})"><i data-lucide="eye"></i> Ver</button>
          <button class="btn-action btn-edit" onclick="abrirEditarCancha(${cancha.id})"><i data-lucide="edit-3"></i> Editar</button>
          <button class="btn-action btn-delete" onclick="eliminarCanchaConfirmada(${cancha.id})"><i data-lucide="trash-2"></i> Eliminar</button>
        </div>
      `;

      contenedor.appendChild(card);
    });

    if (window.lucide) lucide.createIcons();
  } catch (error) {
    ocultarSkeletons(contenedor);
    contenedor.innerHTML = `<p class="text-muted" style="padding: 1rem; text-align: center">Error al cargar canchas: ${error.message}</p>`;
  }
}

window.abrirModalCrearCancha = async function () {
  try {
    await cargarUbicacionesAdmin();
  } catch (error) {
    showToast('Error al cargar sedes: ' + error.message, 'error');
    return;
  }

  if (ubicaciones.length === 0) {
    showToast('No hay sedes disponibles. Crea una sede antes de registrar una cancha.', 'advertencia');
    return;
  }

  const modal = document.getElementById('infoModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  const defaultImg = '../assets/img/canchas/baloncesto-coliseo.webp';

  modalTitle.textContent = 'Crear Nueva Cancha';
  modalBody.innerHTML = `
    <form id="formCrearCanchaModal" class="form-modal-layout">
      <div style="text-align: center; margin-bottom: 12px">
        <img
          id="crearPreviewImg"
          src="${defaultImg}"
          alt="Vista previa"
          style="width: 100%; max-height: 160px; object-fit: cover; border-radius: 8px; border: 1px solid #e2e8f0" />
      </div>
      <div class="form-group">
        <label>Imagen de la Cancha:</label>
        <input type="file" id="crearImagenFile" class="form-input" accept="image/*" />
        <small class="text-muted">Si no seleccionas una imagen, se usara una imagen predeterminada.</small>
      </div>
      <div class="form-group">
        <label>Nombre del Espacio:</label>
        <input type="text" id="crearTitulo" class="form-input" placeholder="Ej: Cancha 11 - Cesped" required />
      </div>
      <div class="form-group">
        <label>Deporte / Categoria (separar con coma):</label>
        <input type="text" id="crearTipo" class="form-input" placeholder="Ej: Futbol 11, Padel" required />
      </div>
      <div class="form-group">
        <label>Superficie:</label>
        <input type="text" id="crearSuperficie" class="form-input" placeholder="Ej: Cesped Sintetico 4G" required />
      </div>
      <div class="form-group">
        <label>Tarifa por Hora ($):</label>
        <input type="number" id="crearTarifa" class="form-input" placeholder="45000" min="0" step="100" required />
      </div>
      <div class="form-group">
        <label>Capacidad (Personas):</label>
        <input type="number" id="crearCapacidad" class="form-input" placeholder="22" min="1" step="1" required />
      </div>
      <div class="form-group">
        <label>Estado:</label>
        <select id="crearEstado" class="form-input">
          <option value="Disponible">Disponible</option>
          <option value="Mantenimiento">Mantenimiento</option>
        </select>
      </div>
      <div class="form-group">
        <label>Sede / Ubicacion:</label>
        <select id="crearLocationId" class="form-input" required>
          <option value="">Selecciona una sede...</option>
          ${generarOpcionesSelectUbicacion(null)}
        </select>
      </div>
      <div class="form-group">
        <label>Descripcion:</label>
        <textarea id="crearDescripcion" class="form-input" rows="3" placeholder="Describe el espacio deportivo..."></textarea>
      </div>
      <div class="form-group">
        <label>Detalles (uno por linea):</label>
        <textarea
          id="crearDetalles"
          class="form-input"
          rows="4"
          placeholder="Capacidad ideal: 22 personas&#10;Iluminacion LED&#10;Petos y balon incluidos"></textarea>
      </div>
      <div class="modal-form-actions">
        <button type="button" class="btn-secondary" onclick="cerrarModal()">Cancelar</button>
        <button type="submit" class="btn-primary-modal"><span class="btn-label">Crear Cancha</span><span class="btn-spinner"><i class="bi bi-arrow-repeat"></i> Guardando...</span></button>
      </div>
    </form>
  `;

  modal.classList.add('open');

  const inputImagenFile = document.getElementById('crearImagenFile');
  const imgPreview = document.getElementById('crearPreviewImg');
  inputImagenFile.addEventListener('change', () => {
    const file = inputImagenFile.files[0];
    if (file) {
      imgPreview.src = URL.createObjectURL(file);
    }
  });

  document.getElementById('formCrearCanchaModal').addEventListener('submit', async (e) => {
    e.preventDefault();

    const titulo = document.getElementById('crearTitulo').value.trim();
    const tipo = document.getElementById('crearTipo').value.trim();
    const superficie = document.getElementById('crearSuperficie').value.trim();
    const tarifa = parseFloat(document.getElementById('crearTarifa').value);
    const capacidad = parseInt(document.getElementById('crearCapacidad').value, 10);
    const estado = document.getElementById('crearEstado').value;
    const imagenFileSeleccionada = document.getElementById('crearImagenFile').files[0];
    const descripcion = document.getElementById('crearDescripcion').value.trim();
    const detallesRaw = document.getElementById('crearDetalles').value.trim();
    const detalles = detallesRaw ? detallesRaw.split('\n').filter((l) => l.trim()) : [];
    const locationId = parseInt(document.getElementById('crearLocationId').value, 10);

    if (!Number.isFinite(tarifa) || tarifa < 0) {
      showToast('La tarifa por hora no puede ser negativa.', 'advertencia');
      document.getElementById('crearTarifa').focus();
      return;
    }

    if (!Number.isInteger(capacidad) || capacidad < 1) {
      showToast('La capacidad debe ser un número entero mayor que cero.', 'advertencia');
      document.getElementById('crearCapacidad').focus();
      return;
    }

    if (!locationId) {
      showToast('Debes seleccionar una sede para la cancha.', 'advertencia');
      return;
    }

    const dataCancha = {
      name: titulo,
      sport: tipo,
      surface: superficie,
      hourlyRate: tarifa,
      capacity: capacidad,
      state: mapearEstadoFrontend(estado),
      description: descripcion,
      details: detalles,
      locationId: locationId,
    };

    try {
      setFormBtnLoading(e.target, true);
      const imagenFile = imagenFileSeleccionada || (await obtenerImagenPlaceholder(defaultImg));
      await crearCancha(dataCancha, [imagenFile]);
      cerrarModal();
      await conScrollPreservado(() => renderCanchasGrid());
    } catch (error) {
      setFormBtnLoading(e.target, false);
      showToast('Error al crear cancha: ' + error.message, 'error');
    }
  });
};

async function obtenerImagenPlaceholder(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('No fue posible cargar la imagen predeterminada.');
  }

  const blob = await response.blob();
  return new File([blob], 'cancha-placeholder.webp', {
    type: blob.type || 'image/webp',
  });
}

window.abrirPerfilCancha = async function (id) {
  try {
    const canchasRaw = await obtenerCanchas();
    const canchas = Array.isArray(canchasRaw) ? canchasRaw.map(normalizarCancha) : [];
    const cancha = canchas.find((c) => c.id === id);
    if (!cancha) return;

    const modal = document.getElementById('infoModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    const imagenSrc =
      cancha.imagen ||
      'https://raw.githubusercontent.com/CamiloBermeo/devPortes/develop/assets/img/canchas/baloncesto-coliseo.webp';

    modalTitle.textContent = 'Detalles del Espacio Deportivo';
    modalBody.innerHTML = `
      <div style="text-align: center; margin-bottom: 12px">
        <img
          src="${imagenSrc}"
          alt="${cancha.titulo}"
          style="width: 100%; max-height: 180px; object-fit: cover; border-radius: 8px; border: 1px solid #e2e8f0" />
      </div>
      <div class="cliente-detalle-header">
        <div>
          <h3 style="font-size: 1.2rem; margin-bottom: 4px">${cancha.titulo}</h3>
          <span class="badge-tag ${cancha.estado === 'Disponible' ? 'green' : 'orange'}">${cancha.estado}</span>
        </div>
      </div>

      <div class="cliente-info-box" style="margin-top: 1rem">
        <p class="cliente-info-item"><strong>Deporte / Categoria:</strong> ${formatoTipo(cancha)}</p>
        <p class="cliente-info-item"><strong>Capacidad Permitida:</strong> ${cancha.capacidad} personas</p>
        <p class="cliente-info-item"><strong>Tarifa por Hora:</strong> $${cancha.tarifa.toLocaleString('es-CO')}</p>
      </div>
    `;

    modal.classList.add('open');
  } catch (error) {
    showToast('Error al cargar cancha: ' + error.message, 'error');
  }
};

window.abrirEditarCancha = async function (id) {
  try {
    await cargarUbicacionesAdmin();
    const canchasRaw = await obtenerCanchas();
    const canchas = Array.isArray(canchasRaw) ? canchasRaw.map(normalizarCancha) : [];
    const cancha = canchas.find((c) => c.id === id);
    if (!cancha) return;

    const modal = document.getElementById('infoModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const imagenActual =
      cancha.imagen ||
      'https://raw.githubusercontent.com/CamiloBermeo/devPortes/develop/assets/img/canchas/baloncesto-coliseo.webp';
    const detallesRaw = Array.isArray(cancha.detalles) ? cancha.detalles.join('\n') : '';

    modalTitle.textContent = 'Editar Cancha / Escenario';
    modalBody.innerHTML = `
      <form id="formEditarCanchaModal" class="form-modal-layout">
        <div style="text-align: center; margin-bottom: 12px;">
          <img id="editPreviewImg" src="${imagenActual}" alt="Vista previa" style="width: 100%; max-height: 160px; object-fit: cover; border-radius: 8px; border: 1px solid #e2e8f0;" />
        </div>
        <div class="form-group">
          <label>Imagen de la Cancha:</label>
          <input type="file" id="editImagenFile" class="form-input" accept="image/*" />
          <input type="hidden" id="editImagenUrl" value="${imagenActual}" />
        </div>
        <div class="form-group">
          <label>Nombre del Espacio:</label>
          <input type="text" id="editNombre" class="form-input" value="${cancha.titulo}" required />
        </div>
        <div class="form-group">
          <label>Deporte / Categoria (separar con coma):</label>
          <input type="text" id="editTipo" class="form-input" value="${formatoTipo(cancha)}" required />
        </div>
        <div class="form-group">
          <label>Superficie:</label>
          <input type="text" id="editSuperficie" class="form-input" value="${cancha.superficie}" required />
        </div>
        <div class="form-group">
          <label>Tarifa por Hora ($):</label>
          <input type="number" id="editTarifa" class="form-input" value="${cancha.tarifa}" min="0" step="100" required />
        </div>
        <div class="form-group">
          <label>Capacidad (Personas):</label>
          <input type="number" id="editCapacidad" class="form-input" value="${cancha.capacidad}" min="1" step="1" required />
        </div>
        <div class="form-group">
          <label>Estado:</label>
          <select id="editEstado" class="form-input">
            <option value="Disponible" ${cancha.estado === 'Disponible' ? 'selected' : ''}>Disponible</option>
            <option value="Mantenimiento" ${cancha.estado === 'Mantenimiento' ? 'selected' : ''}>Mantenimiento</option>
          </select>
        </div>
        <div class="form-group">
          <label>Sede / Ubicacion:</label>
          <select id="editLocationId" class="form-input" required>
            <option value="">Selecciona una sede...</option>
            ${generarOpcionesSelectUbicacion(cancha.locationId)}
          </select>
        </div>
        <div class="form-group">
          <label>Descripcion:</label>
          <textarea id="editDescripcion" class="form-input" rows="3">${cancha.descripcion}</textarea>
        </div>
        <div class="form-group">
          <label>Detalles (uno por linea):</label>
          <textarea id="editDetalles" class="form-input" rows="4">${detallesRaw}</textarea>
        </div>
        <div class="modal-form-actions">
          <button type="button" class="btn-secondary" onclick="cerrarModal()">Cancelar</button>
          <button type="submit" class="btn-primary-modal"><span class="btn-label">Guardar Cambios</span><span class="btn-spinner"><i class="bi bi-arrow-repeat"></i> Guardando...</span></button>
        </div>
      </form>
    `;

    modal.classList.add('open');

    const inputImagenFile = document.getElementById('editImagenFile');
    const imgPreview = document.getElementById('editPreviewImg');
    inputImagenFile.addEventListener('change', () => {
      const file = inputImagenFile.files[0];
      if (file) {
        imgPreview.src = URL.createObjectURL(file);
      }
    });

    document.getElementById('formEditarCanchaModal').addEventListener('submit', async (e) => {
      e.preventDefault();

      const dataCancha = {
        name: document.getElementById('editNombre').value.trim(),
        sport: document.getElementById('editTipo').value.trim(),
        surface: document.getElementById('editSuperficie').value.trim(),
        hourlyRate: parseFloat(document.getElementById('editTarifa').value),
        capacity: parseInt(document.getElementById('editCapacidad').value, 10),
        state: mapearEstadoFrontend(document.getElementById('editEstado').value),
        description: document.getElementById('editDescripcion').value.trim(),
        details: document
          .getElementById('editDetalles')
          .value.trim()
          .split('\n')
          .filter((l) => l.trim()),
        locationId: parseInt(document.getElementById('editLocationId').value, 10),
      };

      if (!Number.isFinite(dataCancha.hourlyRate) || dataCancha.hourlyRate < 0) {
        showToast('La tarifa por hora no puede ser negativa.', 'advertencia');
        document.getElementById('editTarifa').focus();
        return;
      }

      if (!Number.isInteger(dataCancha.capacity) || dataCancha.capacity < 1) {
        showToast('La capacidad debe ser un número entero mayor que cero.', 'advertencia');
        document.getElementById('editCapacidad').focus();
        return;
      }

      try {
        setFormBtnLoading(e.target, true);
        const editImagenFile = document.getElementById('editImagenFile').files[0];
        const editImagenUrl = document.getElementById('editImagenUrl').value;
        if (editImagenFile) {
          await editarCanchaApi(id, dataCancha, [], [editImagenFile]);
        } else {
          await editarCanchaApi(id, dataCancha, editImagenUrl ? [editImagenUrl] : [], []);
        }
        cerrarModal();
        await conScrollPreservado(() => renderCanchasGrid());
      } catch (error) {
        setFormBtnLoading(e.target, false);
        showToast('Error al editar cancha: ' + error.message, 'error');
      }
    });
  } catch (error) {
    showToast('Error al cargar cancha: ' + error.message, 'error');
  }
};

window.eliminarCanchaConfirmada = function (id) {
  abrirModalConfirmacion(
    'Estas seguro de que deseas eliminar esta cancha del panel? Las reservas existentes se conservaran.',
    async () => {
      try {
        await eliminarCanchaApi(id);
        await conScrollPreservado(() => renderCanchasGrid());
        showToast('Cancha eliminada del panel.', 'exito');
      } catch (error) {
        showToast('Error al eliminar cancha: ' + error.message, 'error');
      }
    },
  );
};

// ==========================================
// GALERÍA - CRUD DE PUBLICACIONES
// ==========================================

function formatearFechaAdmin(fechaStr) {
  if (!fechaStr) return 'Sin fecha';
  try {
    const [anio, mes, dia] = fechaStr.split('-').map(Number);
    if (!anio || !mes || !dia) return fechaStr;
    const fecha = new Date(anio, mes - 1, dia);
    return fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return fechaStr;
  }
}

function formatearFechaLargaAdmin(fechaStr) {
  if (!fechaStr) return 'Sin fecha';
  try {
    const [anio, mes, dia] = fechaStr.split('-').map(Number);
    if (!anio || !mes || !dia) return fechaStr;
    const fecha = new Date(anio, mes - 1, dia);
    return fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return fechaStr;
  }
}

async function renderGaleriaGrid() {
  const contenedor = document.getElementById('galeriaGridPreview');
  if (!contenedor) return;

  mostrarSkeletonsGrid(contenedor, 4, 'publicaciones');

  try {
    const posts = await obtenerPosts();
    const lista = Array.isArray(posts) ? posts : [];

    ocultarSkeletons(contenedor);
    contenedor.innerHTML = '';

    if (lista.length === 0) {
      contenedor.innerHTML =
        '<p class="text-muted" style="padding: 1rem; text-align: center">No hay publicaciones en la galería.</p>';
      return;
    }

    lista.forEach((post) => {
      const card = document.createElement('div');
      card.className = 'card user-card-full';

      const imagenSrc =
        (post.urlPictures && post.urlPictures[0]) ||
        'https://raw.githubusercontent.com/CamiloBermeo/devPortes/refs/heads/main/assets/img/torneodefutbol.jpg';

      const numFotos = post.urlPictures ? post.urlPictures.length : 0;
      const badgeFotos = numFotos > 1 ? `<span class="badge-tag green" style="margin-left: 6px">${numFotos} fotos</span>` : '';

      card.innerHTML = `
        <div class="user-card-header" style="display: flex; align-items: center; gap: 12px">
          <img
            src="${imagenSrc}"
            alt="${post.name}"
            style="width: 48px; height: 48px; object-fit: cover; border-radius: 8px; flex-shrink: 0" />
          <div style="flex: 1; overflow: hidden">
            <h4 style="font-size: 1rem; font-weight: 700; margin: 0; text-overflow: ellipsis; white-space: nowrap; overflow: hidden">
              ${post.name}
            </h4>
            <span class="text-muted" style="font-size: 0.8rem">${formatearFechaAdmin(post.eventDate)}${badgeFotos}</span>
          </div>
        </div>

        <div class="user-card-body" style="margin: 12px 0">
          <div class="card-info-row">
            <span class="text-muted">Fotos:</span>
            <strong>${numFotos} imagen${numFotos !== 1 ? 'es' : ''}</strong>
          </div>
          <div style="margin-top: 6px">
            <span class="text-muted" style="font-size: 0.8rem">Descripción:</span>
            <p style="font-size: 0.88rem; margin: 2px 0 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden">${post.description || 'Sin descripción'}</p>
          </div>
        </div>

        <div class="user-card-actions">
          <button class="btn-action btn-detail" onclick="abrirVerPostAdmin(${post.id})"><i data-lucide="eye"></i> Ver</button>
          <button class="btn-action btn-edit" onclick="abrirEditarPostAdmin(${post.id})"><i data-lucide="edit-3"></i> Editar</button>
          <button class="btn-action btn-delete" onclick="eliminarPostConfirmadoAdmin(${post.id})"><i data-lucide="trash-2"></i> Eliminar</button>
        </div>
      `;

      contenedor.appendChild(card);
    });

    if (window.lucide) lucide.createIcons();
  } catch (error) {
    ocultarSkeletons(contenedor);
    contenedor.innerHTML = `<p class="text-muted" style="padding: 1rem; text-align: center">Error al cargar galería: ${error.message}</p>`;
  }
}

window.abrirModalCrearPost = function () {
  const modal = document.getElementById('infoModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  const defaultImg = 'https://raw.githubusercontent.com/CamiloBermeo/devPortes/refs/heads/main/assets/img/torneodefutbol.jpg';

  modalTitle.textContent = 'Crear Nueva Publicación';
  modalBody.innerHTML = `
    <form id="formCrearPostModal" class="form-modal-layout">
      <div style="text-align: center; margin-bottom: 12px">
        <div id="crearPostPreviewGrid" class="preview-grid-admin" style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: center">
          <img id="crearPostPreviewImg" src="${defaultImg}" alt="Vista previa"
            style="width: 100%; max-height: 160px; object-fit: cover; border-radius: 8px; border: 1px solid #e2e8f0" />
        </div>
      </div>
      <div class="form-group">
        <label>Fotos del evento:</label>
        <input type="file" id="crearPostFiles" class="form-input" accept="image/*" multiple />
        <div style="font-size: 0.8rem; color: #64748b; margin-top: 4px">Puedes seleccionar una o varias imágenes.</div>
      </div>
      <div id="crearPostPreviewsContainer" style="display: flex; gap: 8px; flex-wrap: wrap"></div>
      <div class="form-group">
        <label>Título del evento:</label>
        <input type="text" id="crearPostNombre" class="form-input" placeholder="Ej: Torneo Relámpago de Verano" required />
      </div>
      <div class="form-group">
        <label>Fecha del evento:</label>
        <input type="date" id="crearPostFecha" class="form-input" required />
      </div>
      <div class="form-group">
        <label>Descripción:</label>
        <textarea id="crearPostDescripcion" class="form-input" rows="3" placeholder="Describe qué ocurrió en el evento..." required></textarea>
      </div>
      <div class="modal-form-actions">
        <button type="button" class="btn-secondary" onclick="cerrarModal()">Cancelar</button>
        <button type="submit" class="btn-primary-modal"><span class="btn-label">Crear Publicación</span><span class="btn-spinner"><i class="bi bi-arrow-repeat"></i> Guardando...</span></button>
      </div>
    </form>
  `;

  modal.classList.add('open');

  document.getElementById('crearPostFecha').value = new Date().toISOString().split('T')[0];

  const filesInput = document.getElementById('crearPostFiles');
  const previewImg = document.getElementById('crearPostPreviewImg');
  const previewsContainer = document.getElementById('crearPostPreviewsContainer');

  let crearPostSelectedFiles = [];

  function renderCrearPostPreviews() {
    previewsContainer.innerHTML = '';
    if (crearPostSelectedFiles.length > 0) {
      previewImg.style.display = 'none';
      crearPostSelectedFiles.forEach((file, idx) => {
        const url = URL.createObjectURL(file);
        const wrapper = document.createElement('div');
        wrapper.className = 'photo-thumb-wrapper';
        const thumb = document.createElement('img');
        thumb.src = url;
        thumb.style.cssText = 'width: 60px; height: 60px; object-fit: cover; border-radius: 6px; border: 1px solid #e2e8f0';
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'edit-post-remove-btn';
        removeBtn.textContent = '×';
        removeBtn.addEventListener('click', () => {
          URL.revokeObjectURL(url);
          crearPostSelectedFiles.splice(idx, 1);
          renderCrearPostPreviews();
        });
        wrapper.appendChild(thumb);
        wrapper.appendChild(removeBtn);
        previewsContainer.appendChild(wrapper);
      });
    } else {
      previewImg.style.display = '';
    }
  }

  filesInput.addEventListener('change', () => {
    crearPostSelectedFiles = Array.from(filesInput.files || []);
    renderCrearPostPreviews();
  });

  document.getElementById('formCrearPostModal').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('crearPostNombre').value.trim();
    const fecha = document.getElementById('crearPostFecha').value;
    const descripcion = document.getElementById('crearPostDescripcion').value.trim();
    const files = crearPostSelectedFiles;

    if (!nombre || !fecha || !descripcion) {
      showToast('Completa todos los campos requeridos.', 'advertencia');
      return;
    }

    if (files.length === 0) {
      showToast('Debes adjuntar al menos una foto.', 'advertencia');
      return;
    }

    try {
      setFormBtnLoading(e.target, true);
      await crearPost({ name: nombre, description: descripcion, eventDate: fecha }, files);
      cerrarModal();
      await conScrollPreservado(() => renderGaleriaGrid());
      showToast('Publicación creada con éxito.', 'exito');
    } catch (error) {
      setFormBtnLoading(e.target, false);
      showToast('Error al crear publicación: ' + error.message, 'error');
    }
  });
};

window.abrirVerPostAdmin = async function (id) {
  try {
    const posts = await obtenerPosts();
    const lista = Array.isArray(posts) ? posts : [];
    const post = lista.find((p) => Number(p.id) === Number(id));
    if (!post) return;

    const modal = document.getElementById('infoModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    const fotos =
      post.urlPictures && post.urlPictures.length > 0
        ? post.urlPictures
        : ['https://raw.githubusercontent.com/CamiloBermeo/devPortes/refs/heads/main/assets/img/torneodefutbol.jpg'];

    const slidesHtml = fotos
      .map(
        (url, idx) =>
          `<div style="text-align: center; margin-bottom: 8px">
        <img src="${url}" alt="${post.name} - Foto ${idx + 1}"
          style="width: 100%; max-height: 280px; object-fit: contain; border-radius: 8px; border: 1px solid #e2e8f0; background: #f8f9fa" />
      </div>`,
      )
      .join('');

    modalTitle.textContent = 'Detalle de Publicación';
    modalBody.innerHTML = `
      <div>${slidesHtml}</div>
      <div class="cliente-info-box" style="margin-top: 1rem">
        <p class="cliente-info-item"><strong>Título:</strong> ${post.name}</p>
        <p class="cliente-info-item"><strong>Fecha:</strong> ${formatearFechaLargaAdmin(post.eventDate)}</p>
        <p class="cliente-info-item"><strong>Fotos:</strong> ${fotos.length} imagen${fotos.length !== 1 ? 'es' : ''}</p>
        <p class="cliente-info-item"><strong>Descripción:</strong> ${post.description || 'Sin descripción'}</p>
      </div>
    `;

    modal.classList.add('open');
  } catch (error) {
    showToast('Error al cargar publicación: ' + error.message, 'error');
  }
};

window.abrirEditarPostAdmin = async function (id) {
  try {
    const posts = await obtenerPosts();
    const lista = Array.isArray(posts) ? posts : [];
    const post = lista.find((p) => Number(p.id) === Number(id));
    if (!post) return;

    const modal = document.getElementById('infoModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    const fotosExistentes = Array.isArray(post.urlPictures) ? [...post.urlPictures] : [];
    const primerFoto =
      fotosExistentes[0] ||
      'https://raw.githubusercontent.com/CamiloBermeo/devPortes/refs/heads/main/assets/img/torneodefutbol.jpg';

    modalTitle.textContent = 'Editar Publicación';
    modalBody.innerHTML = `
      <form id="formEditarPostModal" class="form-modal-layout">
        <div style="text-align: center; margin-bottom: 12px">
          <img id="editPostPreviewImg" src="${primerFoto}" alt="Vista previa"
            style="width: 100%; max-height: 160px; object-fit: cover; border-radius: 8px; border: 1px solid #e2e8f0" />
        </div>
        <div class="form-group">
          <label>Fotos existentes:</label>
          <div id="editPostExistingPreview" style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px">
            ${fotosExistentes
              .map(
                (url, idx) => `
              <div style="position: relative; display: inline-block">
                <img src="${url}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; border: 1px solid #e2e8f0" />
                <button type="button" class="edit-post-remove-btn" data-idx="${idx}"
                  style="position: absolute; top: -4px; right: -4px; width: 18px; height: 18px; border-radius: 50%; background: #ef4444; color: #fff; border: none; font-size: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center">×</button>
              </div>
            `,
              )
              .join('')}
          </div>
        </div>
        <div class="form-group">
          <label>Agregar nuevas fotos:</label>
          <input type="file" id="editPostFiles" class="form-input" accept="image/*" multiple />
        </div>
        <div id="editPostNewPreviews" style="display: flex; gap: 8px; flex-wrap: wrap"></div>
        <div class="form-group">
          <label>Título del evento:</label>
          <input type="text" id="editPostNombre" class="form-input" value="${post.name}" required />
        </div>
        <div class="form-group">
          <label>Fecha del evento:</label>
          <input type="date" id="editPostFecha" class="form-input" value="${post.eventDate || ''}" required />
        </div>
        <div class="form-group">
          <label>Descripción:</label>
          <textarea id="editPostDescripcion" class="form-input" rows="3" required>${post.description || ''}</textarea>
        </div>
        <div class="modal-form-actions">
          <button type="button" class="btn-secondary" onclick="cerrarModal()">Cancelar</button>
          <button type="submit" class="btn-primary-modal"><span class="btn-label">Guardar Cambios</span><span class="btn-spinner"><i class="bi bi-arrow-repeat"></i> Guardando...</span></button>
        </div>
      </form>
    `;

    modal.classList.add('open');

    let urlsActuales = [...fotosExistentes];

    modalBody.querySelectorAll('.edit-post-remove-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        urlsActuales.splice(idx, 1);
        const container = document.getElementById('editPostExistingPreview');
        if (container && container.children[idx]) {
          container.children[idx].remove();
        }
        const previewImg = document.getElementById('editPostPreviewImg');
        if (previewImg && urlsActuales.length > 0) {
          previewImg.src = urlsActuales[0];
        } else if (previewImg) {
          previewImg.src =
            'https://raw.githubusercontent.com/CamiloBermeo/devPortes/refs/heads/main/assets/img/torneodefutbol.jpg';
        }
      });
    });

    const filesInput = document.getElementById('editPostFiles');
    const newPreviews = document.getElementById('editPostNewPreviews');

    let editPostNewFiles = [];

    function renderEditPostNewPreviews() {
      newPreviews.innerHTML = '';
      editPostNewFiles.forEach((file, idx) => {
        const url = URL.createObjectURL(file);
        const wrapper = document.createElement('div');
        wrapper.className = 'photo-thumb-wrapper';
        const thumb = document.createElement('img');
        thumb.src = url;
        thumb.style.cssText = 'width: 60px; height: 60px; object-fit: cover; border-radius: 6px; border: 1px solid #e2e8f0';
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'edit-post-remove-btn';
        removeBtn.textContent = '×';
        removeBtn.addEventListener('click', () => {
          URL.revokeObjectURL(url);
          editPostNewFiles.splice(idx, 1);
          renderEditPostNewPreviews();
        });
        wrapper.appendChild(thumb);
        wrapper.appendChild(removeBtn);
        newPreviews.appendChild(wrapper);
      });
    }

    filesInput.addEventListener('change', () => {
      editPostNewFiles = Array.from(filesInput.files || []);
      renderEditPostNewPreviews();
    });

    document.getElementById('formEditarPostModal').addEventListener('submit', async (e) => {
      e.preventDefault();

      const nombre = document.getElementById('editPostNombre').value.trim();
      const fecha = document.getElementById('editPostFecha').value;
      const descripcion = document.getElementById('editPostDescripcion').value.trim();
      const newFiles = editPostNewFiles;

      if (!nombre || !fecha || !descripcion) {
        showToast('Completa todos los campos requeridos.', 'advertencia');
        return;
      }

      if (urlsActuales.length === 0 && newFiles.length === 0) {
        showToast('Debes tener al menos una foto en la publicación.', 'advertencia');
        return;
      }

      try {
        setFormBtnLoading(e.target, true);
        await editarPost(id, { name: nombre, description: descripcion, eventDate: fecha }, urlsActuales, newFiles);
        cerrarModal();
        await conScrollPreservado(() => renderGaleriaGrid());
        showToast('Publicación actualizada correctamente.', 'exito');
      } catch (error) {
        setFormBtnLoading(e.target, false);
        showToast('Error al editar publicación: ' + error.message, 'error');
      }
    });
  } catch (error) {
    showToast('Error al cargar publicación: ' + error.message, 'error');
  }
};

window.eliminarPostConfirmadoAdmin = function (id) {
  abrirModalConfirmacion('¿Estás seguro de que deseas eliminar esta publicación? Esta acción no se puede deshacer.', async () => {
    try {
      await eliminarPost(id);
      await conScrollPreservado(() => renderGaleriaGrid());
      showToast('Publicación eliminada correctamente.', 'exito');
    } catch (error) {
      showToast('Error al eliminar publicación: ' + error.message, 'error');
    }
  });
};

async function renderSedesGrid() {
  const contenedor = document.getElementById('sedesGridPreview');
  if (!contenedor) return;

  mostrarSkeletonsGrid(contenedor, 4, 'sedes');

  try {
    await cargarUbicacionesAdmin();
    const ubicacionesVisibles = ubicaciones.filter((sede) => sede.visible !== false);
    ocultarSkeletons(contenedor);
    contenedor.innerHTML = '';

    if (ubicacionesVisibles.length === 0) {
      contenedor.innerHTML = '<p class="empty-state text-muted">No hay sedes activas para mostrar.</p>';
      return;
    }

    ubicacionesVisibles.forEach((sede) => {
      const card = document.createElement('div');
      card.className = 'card user-card-full';

      const badgeClass = sede.state ? 'green' : 'orange';
      const badgeText = sede.state ? 'Activa' : 'Inactiva';

      card.innerHTML = `
        <div class="user-card-header">
          <div class="avatar" style="background: #ede9fe; color: #7c3aed">
            <i data-lucide="map-pin"></i>
          </div>
          <div style="flex: 1; overflow: hidden">
            <h4 style="font-size: 1rem; font-weight: 700; margin: 0; text-overflow: ellipsis; white-space: nowrap; overflow: hidden">
              ${sede.name}
            </h4>
            <span class="badge-tag ${badgeClass}">${badgeText}</span>
          </div>
        </div>

        <div class="user-card-body" style="margin: 12px 0">
          ${sede.headquarters ? `<div class="card-info-row"><span class="text-muted">Ubicación:</span> <strong>${sede.headquarters}</strong></div>` : ''}
          ${sede.address ? `<div class="card-info-row"><span class="text-muted">Direccion:</span> <strong>${sede.address}</strong></div>` : ''}
          ${sede.description ? `<div class="card-info-row" style="flex-direction: column; gap: 6px;"><span class="text-muted">Descripcion:</span> <strong>${sede.description}</strong></div>` : ''}
        </div>

        <div class="user-card-actions">
          <button class="btn-action btn-detail" onclick="abrirPerfilSede(${sede.id})"><i data-lucide="eye"></i> Ver</button>
          <button class="btn-action btn-edit" onclick="abrirEditarSede(${sede.id})"><i data-lucide="edit-3"></i> Editar</button>
          <button class="btn-action btn-delete" onclick="eliminarSedeConfirmada(${sede.id})"><i data-lucide="trash-2"></i> Eliminar</button>
        </div>
      `;

      contenedor.appendChild(card);
    });

    if (window.lucide) lucide.createIcons();
  } catch (error) {
    ocultarSkeletons(contenedor);
    contenedor.innerHTML = `<p class="text-muted" style="padding: 1rem; text-align: center">Error al cargar sedes: ${error.message}</p>`;
  }
}

window.abrirModalCrearSede = function () {
  const modal = document.getElementById('infoModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');

  modalTitle.textContent = 'Crear Nueva Sede';
  modalBody.innerHTML = `
    <form id="formCrearSedeModal" class="form-modal-layout" novalidate>
      <div class="form-group">
        <label>Nombre:</label>
        <input type="text" id="crearSedeNombre" class="form-input" placeholder="Ej: Sede Norte" required />
      </div>
      <div class="form-group">
        <label>Ubicación:</label>
        <input type="text" id="crearSedeHeadquarters" class="form-input" placeholder="Ej: Sede Norte" />
      </div>
      <div class="form-group">
        <label>Direccion:</label>
        <input type="text" id="crearSedeAddress" class="form-input" placeholder="Ej: Calle 45 #12-34" />
      </div>
      <div class="form-group">
        <label>URL QR:</label>
        <input type="url" id="crearSedeUrlQr" class="form-input" placeholder="https://..." required />
      </div>
      <div class="form-group">
        <label>Descripcion:</label>
        <textarea id="crearSedeDescription" class="form-input" rows="3" placeholder="Describe la sede..."></textarea>
      </div>
      <div class="modal-form-actions">
        <button type="button" class="btn-secondary" onclick="cerrarModal()">Cancelar</button>
        <button type="submit" class="btn-primary-modal"><span class="btn-label">Crear Sede</span><span class="btn-spinner"><i class="bi bi-arrow-repeat"></i> Guardando...</span></button>
      </div>
    </form>
  `;

  modal.classList.add('open');

  document.getElementById('formCrearSedeModal').addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
      name: document.getElementById('crearSedeNombre').value.trim(),
      headquarters: document.getElementById('crearSedeHeadquarters').value.trim(),
      address: document.getElementById('crearSedeAddress').value.trim(),
      urlQrAddress: document.getElementById('crearSedeUrlQr').value.trim(),
      description: document.getElementById('crearSedeDescription').value.trim(),
    };

    if (!validarUrl(data.urlQrAddress, { requerida: true })) {
      showToast('Ingresa una URL válida para generar el código QR.', 'advertencia');
      document.getElementById('crearSedeUrlQr').focus();
      return;
    }

    try {
      setFormBtnLoading(e.target, true);
      await crearUbicacion(data);
      cerrarModal();
      await conScrollPreservado(() => Promise.all([renderSedesGrid(), renderCanchasGrid()]));
    } catch (error) {
      setFormBtnLoading(e.target, false);
      showToast('Error al crear sede: ' + error.message, 'error');
    }
  });
};

window.abrirPerfilSede = function (id) {
  const sede = ubicaciones.find((u) => u.id === id);
  if (!sede) return;

  const modal = document.getElementById('infoModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');

  const badgeClass = sede.state ? 'green' : 'orange';
  const badgeText = sede.state ? 'Activa' : 'Inactiva';

  modalTitle.textContent = 'Detalles de la Sede';
  modalBody.innerHTML = `
    <div class="cliente-detalle-header">
      <div class="avatar" style="width: 48px; height: 48px; font-size: 1.1rem; background: #ede9fe; color: #7c3aed">
        <i data-lucide="map-pin"></i>
      </div>
      <div>
        <h3 style="font-size: 1.1rem; margin: 0">${sede.name}</h3>
        <span class="badge-tag ${badgeClass}">${badgeText}</span>
      </div>
    </div>

    <div class="cliente-info-box" style="margin-top: 1rem">
      ${sede.headquarters ? `<p class="cliente-info-item"><strong>Ubicación:</strong> ${sede.headquarters}</p>` : ''}
      ${sede.address ? `<p class="cliente-info-item"><strong>Direccion:</strong> ${sede.address}</p>` : ''}
      ${sede.urlQrAddress ? `<p class="cliente-info-item"><strong>URL QR:</strong> <a href="${sede.urlQrAddress}" target="_blank">${sede.urlQrAddress}</a></p>` : ''}
      ${sede.description ? `<p class="cliente-info-item"><strong>Descripcion:</strong> ${sede.description}</p>` : ''}
    </div>
  `;

  modal.classList.add('open');
  if (window.lucide) lucide.createIcons();
};

window.abrirEditarSede = function (id) {
  const sede = ubicaciones.find((u) => u.id === id);
  if (!sede) return;

  const modal = document.getElementById('infoModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');

  modalTitle.textContent = 'Editar Sede';
  modalBody.innerHTML = `
    <form id="formEditarSedeModal" class="form-modal-layout" novalidate>
      <div class="form-group">
        <label>Nombre:</label>
        <input type="text" id="editSedeNombre" class="form-input" value="${sede.name}" required />
      </div>
      <div class="form-group">
        <label>Ubicación:</label>
        <input type="text" id="editSedeHeadquarters" class="form-input" value="${sede.headquarters || ''}" />
      </div>
      <div class="form-group">
        <label>Direccion:</label>
        <input type="text" id="editSedeAddress" class="form-input" value="${sede.address || ''}" />
      </div>
      <div class="form-group">
        <label>URL QR:</label>
        <input type="url" id="editSedeUrlQr" class="form-input" value="${sede.urlAddress || sede.urlQrAddress || ''}" />
      </div>
      <div class="form-group">
        <label>Descripcion:</label>
        <textarea id="editSedeDescription" class="form-input" rows="3">${sede.description || ''}</textarea>
      </div>
      <div class="modal-form-actions">
        <button type="button" class="btn-secondary" onclick="cerrarModal()">Cancelar</button>
        <button type="submit" class="btn-primary-modal"><span class="btn-label">Guardar Cambios</span><span class="btn-spinner"><i class="bi bi-arrow-repeat"></i> Guardando...</span></button>
      </div>
    </form>
  `;

  modal.classList.add('open');

  document.getElementById('formEditarSedeModal').addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
      name: document.getElementById('editSedeNombre').value.trim(),
      headquarters: document.getElementById('editSedeHeadquarters').value.trim(),
      address: document.getElementById('editSedeAddress').value.trim(),
      urlQrAddress: document.getElementById('editSedeUrlQr').value.trim(),
      description: document.getElementById('editSedeDescription').value.trim(),
    };

    if (!validarUrl(data.urlQrAddress)) {
      showToast('Ingresa una URL válida o deja el campo vacío para conservar la ubicación actual.', 'advertencia');
      document.getElementById('editSedeUrlQr').focus();
      return;
    }

    try {
      setFormBtnLoading(e.target, true);
      await editarUbicacionApi(id, data);
      cerrarModal();
      await conScrollPreservado(() => Promise.all([renderSedesGrid(), renderCanchasGrid()]));
    } catch (error) {
      setFormBtnLoading(e.target, false);
      showToast('Error al editar sede: ' + error.message, 'error');
    }
  });
};

window.eliminarSedeConfirmada = function (id) {
  const sede = ubicaciones.find((u) => u.id === id);
  if (!sede) return;

  abrirModalConfirmacion(
    `Estas seguro de que deseas eliminar la sede <strong>${sede.name}</strong> del panel? Las reservas existentes se conservaran.`,
    async () => {
      try {
        await eliminarUbicacion(id);
        await conScrollPreservado(() => Promise.all([renderSedesGrid(), renderCanchasGrid()]));
        showToast('Sede eliminada del panel.', 'exito');
      } catch (error) {
        showToast('Error al eliminar sede: ' + error.message, 'error');
      }
    },
  );
};

window.abrirPerfilCliente = function (id) {
  const cliente = listaClientes.find((c) => c.id === id);
  if (!cliente) return;

  const modal = document.getElementById('infoModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');

  const iniciales = inicialesDe(cliente.nombre);

  modalTitle.textContent = 'Ficha Tecnica del Cliente';
  modalBody.innerHTML = `
    <div class="cliente-detalle-header" style="display: flex; align-items: center; gap: 12px">
      <div class="avatar" style="width: 48px; height: 48px; font-size: 1.1rem">${iniciales}</div>
      <div>
        <h3 style="font-size: 1.1rem; margin: 0">${escapeHtml(cliente.nombre)}</h3>
        <span class="badge-tag green">${escapeHtml(cliente.tipo)}</span>
      </div>
    </div>

    <div class="cliente-info-box" style="margin-top: 1rem">
      <p class="cliente-info-item"><strong>Correo electronico:</strong> ${escapeHtml(cliente.email)}</p>
      <p class="cliente-info-item"><strong>Numero de contacto:</strong> ${escapeHtml(cliente.telefono || '-')}</p>
    </div>
  `;

  modal.classList.add('open');
};

window.abrirDetalleReserva = function (id) {
  const reserva = listaReservas.find((item) => Number(item.id) === Number(id));
  if (!reserva) return;

  const modal = document.getElementById('infoModal');
  document.getElementById('modalTitle').textContent = 'Detalle de la reserva';
  document.getElementById('modalBody').innerHTML = `
    <div class="reservation-detail">
      <div class="reservation-detail-heading">
        <div>
          <span class="reservation-status ${reserva.estado.toLowerCase()}">${escapeHtml(reserva.estadoTexto)}</span>
          <h3>${escapeHtml(reserva.cancha)}</h3>
          <p class="text-muted">${escapeHtml(formatearFechaAdmin(reserva.fecha))} · ${formatearHoraAdmin(reserva.horaInicio)} - ${formatearHoraAdmin(reserva.horaFin)}</p>
        </div>
      </div>
      <div class="reservation-detail-grid">
        <div><span class="text-muted">Cliente</span><strong>${escapeHtml(reserva.cliente)}</strong></div>
        <div><span class="text-muted">Correo</span><strong>${escapeHtml(reserva.emailCliente || '-')}</strong></div>
        <div><span class="text-muted">Duración</span><strong>${reserva.totalHoras} hora${reserva.totalHoras === 1 ? '' : 's'}</strong></div>
        <div><span class="text-muted">Modalidad</span><strong>${escapeHtml(reserva.tipo)}</strong></div>
        <div><span class="text-muted">Total de la reserva</span><strong>${formatearDineroAdmin(reserva.totalPago)}</strong></div>
        <div><span class="text-muted">Pagado hasta ahora</span><strong>${formatearDineroAdmin(pagoRegistrado(reserva))}</strong></div>
        <div><span class="text-muted">${reserva.estado === 'CANCELADA' ? 'Saldo no cobrado' : 'Saldo pendiente'}</span><strong>${formatearDineroAdmin(reserva.saldoPendiente)}</strong></div>
      </div>
      ${
        reserva.estado === 'CANCELADA'
          ? `
        <div class="reservation-cancellation-notice">
          <i data-lucide="info"></i>
          <span>La reserva fue cancelada. El valor pagado registrado no confirma que se haya realizado un reembolso.</span>
        </div>
      `
          : ''
      }
    </div>
  `;
  modal.classList.add('open');
  if (window.lucide) lucide.createIcons();
};

window.abrirPagoFinalReserva = async function (id) {
  const reserva = listaReservas.find((item) => Number(item.id) === Number(id));
  if (!reserva || Number(reserva.saldoPendiente) <= 0) return;

  const modal = document.getElementById('infoModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  modalTitle.textContent = 'Registrar pago final';
  modalBody.innerHTML = `
    <div class="final-payment-modal">
      <div class="final-payment-hero">
        <div class="final-payment-icon"><i data-lucide="wallet-cards"></i></div>
        <p class="final-payment-kicker">Cliente presente</p>
        <h3>Completar pago de la reserva</h3>
        <p>Registra el saldo restante que el cliente está pagando en este momento.</p>
      </div>
      <div class="final-payment-summary">
        <div><span class="text-muted">Cliente</span><strong>${escapeHtml(reserva.cliente)}</strong></div>
        <div><span class="text-muted">Reserva</span><strong>${escapeHtml(reserva.cancha)} · ${escapeHtml(formatearFechaAdmin(reserva.fecha))}</strong></div>
        <div class="final-payment-amount"><span>Saldo a cobrar</span><strong>${formatearDineroAdmin(reserva.saldoPendiente)}</strong></div>
      </div>
      <div class="form-group">
        <label for="finalPaymentMethod">Método de pago</label>
        <select id="finalPaymentMethod" class="form-input">
          <option value="">Cargando métodos...</option>
        </select>
      </div>
      <div class="form-group">
        <label for="finalPaymentNotes">Nota (opcional)</label>
        <input id="finalPaymentNotes" class="form-input" placeholder="Ej: Pago recibido en efectivo" />
      </div>
      <div class="modal-form-actions">
        <button type="button" class="btn-secondary" onclick="cerrarModal()">Cancelar</button>
        <button type="button" class="btn-primary-modal" id="btnConfirmarPagoFinal"><span class="btn-label">Confirmar pago</span><span class="btn-spinner"><i class="bi bi-arrow-repeat"></i> Registrando...</span></button>
      </div>
    </div>
  `;
  modal.classList.add('open');
  if (window.lucide) lucide.createIcons();

  try {
    const metodos = await obtenerMetodosPago();
    const select = document.getElementById('finalPaymentMethod');
    if (!select) return;
    select.innerHTML = metodos
      .filter((metodo) => metodo.state !== false)
      .map((metodo) => `<option value="${metodo.id}">${escapeHtml(metodo.paymentMethodName)}</option>`)
      .join('');
    if (!select.options.length) {
      select.innerHTML = '<option value="">No hay métodos disponibles</option>';
    }
  } catch (error) {
    const select = document.getElementById('finalPaymentMethod');
    if (select) select.innerHTML = '<option value="">No fue posible cargar métodos</option>';
    showToast(`Error al cargar métodos de pago: ${error.message}`, 'error');
    return;
  }

  document.getElementById('btnConfirmarPagoFinal')?.addEventListener('click', async (event) => {
    const button = event.currentTarget;
    const methodId = document.getElementById('finalPaymentMethod')?.value;
    if (!methodId) {
      showToast('Selecciona un método de pago.', 'advertencia');
      return;
    }
    setFormBtnLoading(button.closest('.final-payment-modal'), true);
    try {
      const pago = await registrarPagoFinal(reserva.id, methodId, document.getElementById('finalPaymentNotes')?.value.trim());
      if (pago && (Number(pago.remainingPayment) > 0 || pago.reservationStatus !== 'COMPLETADA')) {
        throw new Error('El backend no confirmó la finalización de la reserva.');
      }
      cerrarModal();
      showToast('Pago final registrado. La reserva está completada.', 'exito');
      await renderReservas();
    } catch (error) {
      setFormBtnLoading(button.closest('.final-payment-modal'), false);
      showToast(`Error al registrar el pago: ${error.message}`, 'error');
    }
  });
};

window.cerrarModal = function () {
  const modal = document.getElementById('infoModal');
  if (modal) modal.classList.remove('open');
};

function abrirModalConfirmacion(mensajeHTML, callbackConfirmar) {
  const modal = document.getElementById('infoModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');

  modalTitle.textContent = 'Confirmar Accion';
  modalBody.innerHTML = `
    <div style="text-align: center; padding: 10px 0">
      <p style="font-size: 1rem; color: #334155; margin-bottom: 1.5rem">${mensajeHTML}</p>
      <div class="modal-form-actions" style="justify-content: center">
        <button class="btn-secondary" onclick="cerrarModal()">Cancelar</button>
        <button id="btnConfirmarAccion" class="btn-danger-modal">Confirmar</button>
      </div>
    </div>
  `;

  modal.classList.add('open');

  document.getElementById('btnConfirmarAccion').addEventListener('click', () => {
    callbackConfirmar();
    cerrarModal();
  });
}

function activarModalGeneral() {
  const modal = document.getElementById('infoModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  const closeBtn = document.getElementById('closeModalBtn');
  const botonesVerMas = document.querySelectorAll('.btn-ver-mas');

  botonesVerMas.forEach((btn) => {
    btn.addEventListener('click', () => {
      const clave = btn.getAttribute('data-modal');

      if (clave === 'clientes') {
        modalTitle.textContent = 'Gestion Global de Clientes';
        renderTablaClientesModal(modalBody);
        modal.classList.add('open');
      } else if (clave === 'crear-cancha') {
        abrirModalCrearCancha();
      } else if (clave === 'crear-sede') {
        abrirModalCrearSede();
      } else if (clave === 'crear-post') {
        abrirModalCrearPost();
      } else if (clave !== 'reservas') {
        const info = datosGeneralesModales[clave];
        if (info) {
          modalTitle.textContent = info.titulo;
          modalBody.innerHTML = info.contenido;
          modal.classList.add('open');
        }
      }
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', cerrarModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) cerrarModal();
    });
  }
}

function renderTablaClientesModal(contenedor) {
  if (!contenedor) return;

  let html = `
    <p class="text-muted modal-subtext">Directorio general de clientes registrados:</p>
    <div class="tabla-modal-wrapper">
      <table class="tabla-modal tabla-modal-clientes">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Contacto</th>
            <th>Clasificacion</th>
          </tr>
        </thead>
        <tbody>
  `;

  listaClientes.forEach((c) => {
    const iniciales = inicialesDe(c.nombre);
    html += `
      <tr>
        <td><strong>${escapeHtml(c.nombre)}</strong> <br><span class="badge-tag green">${escapeHtml(c.tipo)}</span></td>
        <td><span class="text-muted">${escapeHtml(c.email)}</span><br><span class="text-muted">${escapeHtml(c.telefono || '-')}</span></td>
        <td>${escapeHtml(c.tipo)}</td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  contenedor.innerHTML = html;
  if (window.lucide) lucide.createIcons();
}

const datosGeneralesModales = {
  dashboard: {
    titulo: 'Informe Completo del Dashboard',
    contenido: `<p>Metricas de ingresos, nivel de ocupacion por tipo de cancha y proyecciones del mes.</p>`,
  },
};

function formatearDineroDashboard(valor) {
  return Number(valor || 0).toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  });
}

function ajustarRangoInicialDashboard() {
  const desde = document.getElementById('fechaDesde');
  const hasta = document.getElementById('fechaHasta');
  if (!desde || !hasta || listaReservas.length === 0) return;

  const fechas = listaReservas
    .map((reserva) => normalizarFechaDashboard(reserva.fecha))
    .filter(Boolean)
    .sort();
  if (!fechas.length) return;

  const fechaMinima = fechas[0];
  const fechaMaxima = fechas[fechas.length - 1];
  const hoy = new Date();
  const inicioMesActual = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().slice(0, 10);
  const finMesActual = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().slice(0, 10);
  const hayReservasEsteMes = fechas.some((fecha) => fecha >= inicioMesActual && fecha <= finMesActual);

  if (!hayReservasEsteMes) {
    desde.value = fechaMinima;
    hasta.value = fechaMaxima;
  }
}

function normalizarFechaDashboard(fecha) {
  if (!fecha) return '';
  const texto = String(fecha).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) return texto;
  const fechaLatina = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (fechaLatina) return `${fechaLatina[3]}-${fechaLatina[2]}-${fechaLatina[1]}`;
  return texto.slice(0, 10);
}

function inicializarFechasDashboard() {
  const desde = document.getElementById('fechaDesde');
  const hasta = document.getElementById('fechaHasta');
  if (!desde || !hasta) return;
  const hoy = new Date();
  const iso = (fecha) => fecha.toISOString().slice(0, 10);
  desde.value = iso(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
  hasta.value = iso(new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0));
}

function ingresoCobrado(reserva) {
  return pagoRegistrado(reserva);
}

function reservasDashboardFiltradas() {
  const desde = document.getElementById('fechaDesde')?.value || '';
  const hasta = document.getElementById('fechaHasta')?.value || '';
  return listaReservas.filter(
    (reserva) =>
      reserva.estado !== 'CANCELADA' &&
      (!desde || normalizarFechaDashboard(reserva.fecha) >= desde) &&
      (!hasta || normalizarFechaDashboard(reserva.fecha) <= hasta),
  );
}

function actualizarKpisDashboard(reservas) {
  const ingresos = new Map();
  reservas.forEach((reserva) => {
    ingresos.set(reserva.cancha, (ingresos.get(reserva.cancha) || 0) + ingresoCobrado(reserva));
  });
  const ranking = [...ingresos.entries()].sort((a, b) => b[1] - a[1]);
  const total = ranking.reduce((suma, [, valor]) => suma + valor, 0);
  const canceladas = listaReservas.filter(
    (reserva) =>
      reserva.estado === 'CANCELADA' &&
      (!document.getElementById('fechaDesde')?.value ||
        normalizarFechaDashboard(reserva.fecha) >= document.getElementById('fechaDesde').value) &&
      (!document.getElementById('fechaHasta')?.value ||
        normalizarFechaDashboard(reserva.fecha) <= document.getElementById('fechaHasta').value),
  );
  const pagadoCanceladas = canceladas.reduce((suma, reserva) => suma + pagoRegistrado(reserva), 0);

  document.getElementById('kpiIngresosTotales').textContent = formatearDineroDashboard(total);
  document.getElementById('kpiComparativa').textContent =
    `${reservas.length} reserva${reservas.length === 1 ? '' : 's'} activa${reservas.length === 1 ? '' : 's'} · ${formatearDineroDashboard(pagadoCanceladas)} en canceladas`;

  [1, 2, 3].forEach((posicion) => {
    const item = ranking[posicion - 1];
    document.getElementById(`kpiCancha${posicion}Titulo`).textContent = item?.[0] || 'Sin datos';
    document.getElementById(`kpiCancha${posicion}Valor`).textContent = item ? formatearDineroDashboard(item[1]) : '—';
    document.getElementById(`kpiCancha${posicion}Sub`).textContent =
      item && total ? `${Math.round((item[1] / total) * 100)}% del total` : 'Sin datos';
  });
}

function clavePeriodo(fecha, periodo) {
  fecha = normalizarFechaDashboard(fecha);
  if (!fecha) return 'Sin fecha';
  if (periodo === 'dia') return fecha;
  if (periodo === 'mes') return fecha.slice(0, 7);
  const date = new Date(`${fecha}T00:00:00`);
  const primerDia = new Date(date.getFullYear(), 0, 1);
  const semana = Math.ceil(((date - primerDia) / 86400000 + primerDia.getDay() + 1) / 7);
  return `${date.getFullYear()}-Sem ${semana}`;
}

function actualizarGraficosDashboard(reservas) {
  if (!dashboardCharts.income || !dashboardCharts.distribution) return;
  const colores = ['#16a34a', '#9333ea', '#ea580c', '#0284c7', '#db2777', '#ca8a04'];
  const etiquetas = [...new Set(reservas.map((reserva) => clavePeriodo(reserva.fecha, dashboardPeriod)))].sort();
  const canchas = [...new Set(reservas.map((reserva) => reserva.cancha))];

  dashboardCharts.income.data.labels = etiquetas.length ? etiquetas : ['Sin datos'];
  dashboardCharts.income.data.datasets = canchas.map((cancha, indice) => ({
    label: cancha,
    data: etiquetas.map((etiqueta) =>
      reservas
        .filter((reserva) => reserva.cancha === cancha && clavePeriodo(reserva.fecha, dashboardPeriod) === etiqueta)
        .reduce((suma, reserva) => suma + ingresoCobrado(reserva), 0),
    ),
    backgroundColor: colores[indice % colores.length],
    borderRadius: 5,
  }));
  dashboardCharts.income.update();

  dashboardCharts.distribution.data.labels = canchas.length ? canchas : ['Sin datos'];
  dashboardCharts.distribution.data.datasets[0].data = canchas.length
    ? canchas.map((cancha) =>
        reservas.filter((reserva) => reserva.cancha === cancha).reduce((suma, reserva) => suma + ingresoCobrado(reserva), 0),
      )
    : [1];
  dashboardCharts.distribution.data.datasets[0].backgroundColor = canchas.length
    ? canchas.map((_, indice) => colores[indice % colores.length])
    : ['#e2e8f0'];
  dashboardCharts.distribution.update();
}

function actualizarDashboard() {
  const reservas = reservasDashboardFiltradas();
  actualizarKpisDashboard(reservas);
  actualizarGraficosDashboard(reservas);
  console.info('[Dashboard] métricas actualizadas', {
    reservasCargadas: listaReservas.length,
    reservasIncluidas: reservas.length,
    desde: document.getElementById('fechaDesde')?.value || '',
    hasta: document.getElementById('fechaHasta')?.value || '',
    periodo: dashboardPeriod,
    ingresosTotales: reservas.reduce((total, reserva) => total + ingresoCobrado(reserva), 0),
  });
}

function renderGraficoBarra() {
  const ctx = document.getElementById('incomeChart')?.getContext('2d');
  if (!ctx || typeof window.Chart !== 'function') return null;
  return new Chart(ctx, {
    type: 'bar',
    data: { labels: ['Cargando...'], datasets: [] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'top' } },
      scales: {
        x: { ticks: { color: '#64748b' }, grid: { color: '#f1f5f9' } },
        y: {
          beginAtZero: true,
          ticks: { color: '#64748b', callback: (value) => formatearDineroDashboard(value) },
          grid: { color: '#f1f5f9' },
        },
      },
    },
  });
}

function renderGraficoDoughnut() {
  const ctx = document.getElementById('doughnutChart')?.getContext('2d');
  if (!ctx || typeof window.Chart !== 'function') return null;
  return new Chart(ctx, {
    type: 'doughnut',
    data: { labels: ['Cargando...'], datasets: [{ data: [1], backgroundColor: ['#e2e8f0'], borderWidth: 0 }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' } },
    },
  });
}

function activarFiltrosDashboard() {
  const contenedor = document.getElementById('periodFilterGroup');
  if (!contenedor) return;
  contenedor.addEventListener('click', (evento) => {
    const boton = evento.target.closest('.btn-time');
    if (!boton) return;
    contenedor.querySelectorAll('.btn-time').forEach((item) => item.classList.remove('active'));
    boton.classList.add('active');
    dashboardPeriod = boton.dataset.period || 'semana';
    actualizarDashboard();
  });
  document.getElementById('fechaDesde')?.addEventListener('change', actualizarDashboard);
  document.getElementById('fechaHasta')?.addEventListener('change', actualizarDashboard);
}
