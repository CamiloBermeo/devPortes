import { obtenerCanchas, crearCancha, editarCancha as editarCanchaApi, eliminarCancha as eliminarCanchaApi, formatoTipo, tipoAArray } from '../api/canchas.js';
import { obtenerUbicaciones, crearUbicacion, editarUbicacion as editarUbicacionApi, toggleEstadoUbicacion } from '../api/locations.js';
import { USE_MOCK } from '../utils/mockData.js';

const KEY_ADMIN_SESSION = 'devportes_admin_sesion';

let listaClientes = [
  {
    id: 1,
    iniciales: 'CB',
    nombre: 'Carlos Bermeo',
    reservas: 14,
    email: 'carlos.bermeo@gmail.com',
    telefono: '+57 300 123 4567',
    tipo: 'Frecuente',
  },
  {
    id: 2,
    iniciales: 'AG',
    nombre: 'Andres Gomez',
    reservas: 8,
    email: 'andres.gomez@hotmail.com',
    telefono: '+57 310 987 6543',
    tipo: 'Estandar',
  },
  {
    id: 3,
    iniciales: 'ML',
    nombre: 'Mariana Lopez',
    reservas: 22,
    email: 'mariana.l@outlook.com',
    telefono: '+57 320 456 7890',
    tipo: 'VIP',
  },
  {
    id: 4,
    iniciales: 'JR',
    nombre: 'Javier Rodriguez',
    reservas: 5,
    email: 'j.rodriguez@gmail.com',
    telefono: '+57 315 555 1234',
    tipo: 'Estandar',
  },
];

let ubicaciones = [];

function normalizarCancha(raw) {
  if (USE_MOCK) return raw;

  return {
    id: raw.id,
    titulo: raw.name || raw.titulo || '',
    nombre: raw.name || raw.nombre || '',
    tipo: raw.sport ? tipoAArray(raw.sport) : raw.tipo || [],
    superficie: raw.surface || raw.superficie || '',
    precio: `$${Number(raw.hourlyRate || raw.tarifa || 0).toLocaleString('es-CO')}`,
    tarifa: Number(raw.hourlyRate || raw.tarifa || 0),
    capacidad: Number(raw.capacity || raw.capacidad || 0),
    estado: raw.state === 'DISPONIBLE' ? 'Disponible' : raw.state === 'MANTENIMIENTO' ? 'Mantenimiento' : raw.estado || 'Disponible',
    imagen: (raw.urlPictures && raw.urlPictures[0]) || (raw.url_pictures && raw.url_pictures[0]) || raw.imagen || '',
    descripcion: raw.description || raw.descripcion || '',
    detalles: raw.details || raw.detalles || [],
    locationId: raw.locationId || null,
  };
}

function mapearEstadoFrontend(estadoFrontend) {
  return estadoFrontend === 'Disponible' ? 'DISPONIBLE' : 'MANTENIMIENTO';
}

function obtenerNombreUbicacion(id) {
  const u = ubicaciones.find((loc) => loc.id === id);
  return u ? u.name : `Sede #${id}`;
}

function generarOpcionesSelectUbicacion(selectedId) {
  return ubicaciones.map((u) =>
    `<option value="${u.id}" ${u.id === selectedId ? 'selected' : ''}>${u.name}${u.headquarters ? ' - ' + u.headquarters : ''}</option>`
  ).join('');
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

document.addEventListener('DOMContentLoaded', async () => {
  const adminSession = localStorage.getItem(KEY_ADMIN_SESSION);
  if (!adminSession) {
    window.location.href = 'admin-login.html';
    return;
  }

  if (window.lucide) {
    lucide.createIcons();
  }

  const incomeChart = renderGraficoBarra();
  renderGraficoDoughnut();

  activarMenuMovil();
  activarNavegacionMenu();
  if (incomeChart) activarFiltrosTiempo(incomeChart);
  activarCerrarSesion();

  renderClientesGrid();

  try {
    ubicaciones = await obtenerUbicaciones();
  } catch (err) {
    ubicaciones = [];
  }

  await renderCanchasGrid();
  await renderSedesGrid();
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
    });
  });
}

function activarCerrarSesion() {
  const btnLogout = document.getElementById('logoutBtn');
  if (btnLogout) {
    btnLogout.addEventListener('click', (e) => {
      e.preventDefault();
      abrirModalConfirmacion('Deseas cerrar tu sesion actual?', () => {
        localStorage.removeItem(KEY_ADMIN_SESSION);
        localStorage.removeItem('devportes_token');
        window.location.href = 'admin-login.html';
      });
    });
  }
}

function renderClientesGrid() {
  const contenedor = document.getElementById('clientesGridPreview');
  if (!contenedor) return;

  contenedor.innerHTML = '';

  listaClientes.forEach((cliente) => {
    const card = document.createElement('div');
    card.className = 'card user-card-full';

    card.innerHTML = `
      <div class="user-card-header">
        <div class="avatar">${cliente.iniciales}</div>
        <div>
          <h4 style="font-size: 1rem; font-weight: 700">${cliente.nombre}</h4>
          <span class="badge-tag green">${cliente.tipo}</span>
        </div>
      </div>

      <div class="user-card-body" style="margin: 12px 0">
        <div class="card-info-row"><span class="text-muted">Email:</span> <strong>${cliente.email}</strong></div>
        <div class="card-info-row"><span class="text-muted">Telefono:</span> <strong>${cliente.telefono}</strong></div>
        <div class="card-info-row"><span class="text-muted">Reservas:</span> <strong>${cliente.reservas} realizadas</strong></div>
      </div>

      <div class="user-card-actions">
        <button class="btn-action btn-detail" onclick="abrirPerfilCliente(${cliente.id})"><i data-lucide="eye"></i> Ver</button>
        <button class="btn-action btn-delete" onclick="eliminarCliente(${cliente.id})"><i data-lucide="trash-2"></i> Eliminar</button>
      </div>
    `;

    contenedor.appendChild(card);
  });

  if (window.lucide) lucide.createIcons();
}

async function renderCanchasGrid() {
  const contenedor = document.getElementById('canchasGridPreview');
  if (!contenedor) return;

  contenedor.innerHTML = '<p class="text-muted" style="padding: 1rem; text-align: center">Cargando canchas...</p>';

  try {
    const canchasRaw = await obtenerCanchas();
    const canchas = Array.isArray(canchasRaw) ? canchasRaw.map(normalizarCancha) : [];

    contenedor.innerHTML = '';

    if (canchas.length === 0) {
      contenedor.innerHTML = '<p class="text-muted" style="padding: 1rem; text-align: center">No hay canchas registradas.</p>';
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
    contenedor.innerHTML = `<p class="text-muted" style="padding: 1rem; text-align: center">Error al cargar canchas: ${error.message}</p>`;
  }
}

window.abrirModalCrearCancha = function () {
  const modal = document.getElementById('infoModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  const defaultImg =
    'https://raw.githubusercontent.com/CamiloBermeo/devPortes/develop/assets/img/canchas/baloncesto-coliseo.webp';

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
        <label>URL de la Imagen / Foto:</label>
        <input type="url" id="crearImagen" class="form-input" value="${defaultImg}" required />
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
        <input type="number" id="crearTarifa" class="form-input" placeholder="45000" required />
      </div>
      <div class="form-group">
        <label>Capacidad (Personas):</label>
        <input type="number" id="crearCapacidad" class="form-input" placeholder="22" required />
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
        <button type="submit" class="btn-primary-modal">Crear Cancha</button>
      </div>
    </form>
  `;

  modal.classList.add('open');

  const inputImagen = document.getElementById('crearImagen');
  const imgPreview = document.getElementById('crearPreviewImg');
  inputImagen.addEventListener('input', () => {
    imgPreview.src = inputImagen.value.trim() || defaultImg;
  });

  document.getElementById('formCrearCanchaModal').addEventListener('submit', async (e) => {
    e.preventDefault();

    const titulo = document.getElementById('crearTitulo').value.trim();
    const tipo = document.getElementById('crearTipo').value.trim();
    const superficie = document.getElementById('crearSuperficie').value.trim();
    const tarifa = parseFloat(document.getElementById('crearTarifa').value);
    const capacidad = parseInt(document.getElementById('crearCapacidad').value, 10);
    const estado = document.getElementById('crearEstado').value;
    const imagen = document.getElementById('crearImagen').value.trim() || defaultImg;
    const descripcion = document.getElementById('crearDescripcion').value.trim();
    const detallesRaw = document.getElementById('crearDetalles').value.trim();
    const detalles = detallesRaw ? detallesRaw.split('\n').filter((l) => l.trim()) : [];
    const locationId = parseInt(document.getElementById('crearLocationId').value, 10);

    if (!locationId) {
      alert('Debes seleccionar una sede para la cancha.');
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
      await crearCancha(dataCancha, []);
      cerrarModal();
      await conScrollPreservado(() => renderCanchasGrid());
    } catch (error) {
      alert('Error al crear cancha: ' + error.message);
    }
  });
};

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
    alert('Error al cargar cancha: ' + error.message);
  }
};

window.abrirEditarCancha = async function (id) {
  try {
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
          <label>URL de la Imagen / Foto:</label>
          <input type="url" id="editImagen" class="form-input" value="${imagenActual}" required />
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
          <input type="number" id="editTarifa" class="form-input" value="${cancha.tarifa}" required />
        </div>
        <div class="form-group">
          <label>Capacidad (Personas):</label>
          <input type="number" id="editCapacidad" class="form-input" value="${cancha.capacidad}" required />
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
          <button type="submit" class="btn-primary-modal">Guardar Cambios</button>
        </div>
      </form>
    `;

    modal.classList.add('open');

    const inputImagen = document.getElementById('editImagen');
    const imgPreview = document.getElementById('editPreviewImg');
    inputImagen.addEventListener('input', () => {
      imgPreview.src =
        inputImagen.value.trim() ||
        'https://raw.githubusercontent.com/CamiloBermeo/devPortes/develop/assets/img/canchas/baloncesto-coliseo.webp';
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
        details: document.getElementById('editDetalles').value.trim().split('\n').filter((l) => l.trim()),
        locationId: parseInt(document.getElementById('editLocationId').value, 10),
      };

      try {
        await editarCanchaApi(id, dataCancha, cancha.imagen ? [cancha.imagen] : [], []);
        cerrarModal();
        await conScrollPreservado(() => renderCanchasGrid());
      } catch (error) {
        alert('Error al editar cancha: ' + error.message);
      }
    });
  } catch (error) {
    alert('Error al cargar cancha: ' + error.message);
  }
};

window.eliminarCanchaConfirmada = function (id) {
  abrirModalConfirmacion('Estas seguro de que deseas eliminar esta cancha del catalogo?', async () => {
    try {
      await eliminarCanchaApi(id);
      await conScrollPreservado(() => renderCanchasGrid());
    } catch (error) {
      alert('Error al eliminar cancha: ' + error.message);
    }
  });
};

async function renderSedesGrid() {
  const contenedor = document.getElementById('sedesGridPreview');
  if (!contenedor) return;

  contenedor.innerHTML = '<p class="text-muted" style="padding: 1rem; text-align: center">Cargando sedes...</p>';

  try {
    ubicaciones = await obtenerUbicaciones();
    contenedor.innerHTML = '';

    if (ubicaciones.length === 0) {
      contenedor.innerHTML = '<p class="text-muted" style="padding: 1rem; text-align: center">No hay sedes registradas.</p>';
      return;
    }

    ubicaciones.forEach((sede) => {
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
    contenedor.innerHTML = `<p class="text-muted" style="padding: 1rem; text-align: center">Error al cargar sedes: ${error.message}</p>`;
  }
}

window.abrirModalCrearSede = function () {
  const modal = document.getElementById('infoModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');

  modalTitle.textContent = 'Crear Nueva Sede';
  modalBody.innerHTML = `
    <form id="formCrearSedeModal" class="form-modal-layout">
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
        <input type="url" id="crearSedeUrlQr" class="form-input" placeholder="https://..." />
      </div>
      <div class="form-group">
        <label>Descripcion:</label>
        <textarea id="crearSedeDescription" class="form-input" rows="3" placeholder="Describe la sede..."></textarea>
      </div>
      <div class="modal-form-actions">
        <button type="button" class="btn-secondary" onclick="cerrarModal()">Cancelar</button>
        <button type="submit" class="btn-primary-modal">Crear Sede</button>
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

    try {
      await crearUbicacion(data);
      cerrarModal();
      await conScrollPreservado(() => Promise.all([renderSedesGrid(), renderCanchasGrid()]));
    } catch (error) {
      alert('Error al crear sede: ' + error.message);
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
    <form id="formEditarSedeModal" class="form-modal-layout">
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
        <input type="url" id="editSedeUrlQr" class="form-input" value="${sede.urlQrAddress || ''}" />
      </div>
      <div class="form-group">
        <label>Descripcion:</label>
        <textarea id="editSedeDescription" class="form-input" rows="3">${sede.description || ''}</textarea>
      </div>
      <div class="form-group">
        <label>Descripción:</label>
        <textarea id="editDescripcion" class="form-input" rows="3">${cancha.descripcion || ''}</textarea>
      </div>
      <div class="form-group">
        <label>Detalles (uno por línea):</label>
        <textarea id="editDetalles" class="form-input" rows="4">${detallesRaw}</textarea>
      </div>
      <div class="modal-form-actions">
        <button type="button" class="btn-secondary" onclick="cerrarModal()">Cancelar</button>
        <button type="submit" class="btn-primary-modal">Guardar Cambios</button>
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

    try {
      await editarUbicacionApi(id, data);
      cerrarModal();
      await conScrollPreservado(() => Promise.all([renderSedesGrid(), renderCanchasGrid()]));
    } catch (error) {
      alert('Error al editar sede: ' + error.message);
    }
  });
};

window.eliminarSedeConfirmada = function (id) {
  const sede = ubicaciones.find((u) => u.id === id);
  if (!sede) return;

  abrirModalConfirmacion(`Estas seguro de que deseas eliminar la sede <strong>${sede.name}</strong>?`, async () => {
    try {
      await toggleEstadoUbicacion(id);
      await conScrollPreservado(() => Promise.all([renderSedesGrid(), renderCanchasGrid()]));
    } catch (error) {
      alert('Error al eliminar sede: ' + error.message);
    }
  });
};

window.abrirPerfilCliente = function (id) {
  const cliente = listaClientes.find((c) => c.id === id);
  if (!cliente) return;

  const modal = document.getElementById('infoModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');

  modalTitle.textContent = 'Ficha Tecnica del Cliente';
  modalBody.innerHTML = `
    <div class="cliente-detalle-header" style="display: flex; align-items: center; gap: 12px">
      <div class="avatar" style="width: 48px; height: 48px; font-size: 1.1rem">${cliente.iniciales}</div>
      <div>
        <h3 style="font-size: 1.1rem; margin: 0">${cliente.nombre}</h3>
        <span class="badge-tag green">${cliente.tipo}</span>
      </div>
    </div>

    <div class="cliente-info-box" style="margin-top: 1rem">
      <p class="cliente-info-item"><strong>Correo electronico:</strong> ${cliente.email}</p>
      <p class="cliente-info-item"><strong>Numero de contacto:</strong> ${cliente.telefono}</p>
      <p class="cliente-info-item"><strong>Historial de uso:</strong> ${cliente.reservas} reservas en la sede.</p>
    </div>
  `;

  modal.classList.add('open');
};

window.editarCliente = function (id) {
  const cliente = listaClientes.find((c) => c.id === id);
  if (!cliente) return;

  const modal = document.getElementById('infoModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');

  modalTitle.textContent = 'Editar Cliente';
  modalBody.innerHTML = `
    <form id="formEditarClienteModal" class="form-modal-layout">
      <div class="form-group">
        <label>Nombre Completo:</label>
        <input type="text" id="editClienteNombre" class="form-input" value="${cliente.nombre}" required />
      </div>
      <div class="form-group">
        <label>Telefono:</label>
        <input type="text" id="editClienteTelefono" class="form-input" value="${cliente.telefono}" required />
      </div>
      <div class="form-group">
        <label>Correo Electronico:</label>
        <input type="email" id="editClienteEmail" class="form-input" value="${cliente.email}" required />
      </div>
      <div class="form-group">
        <label>Tipo de Cliente:</label>
        <select id="editClienteTipo" class="form-input">
          <option value="Estandar" ${cliente.tipo === 'Estandar' ? 'selected' : ''}>Estandar</option>
          <option value="Frecuente" ${cliente.tipo === 'Frecuente' ? 'selected' : ''}>Frecuente</option>
          <option value="VIP" ${cliente.tipo === 'VIP' ? 'selected' : ''}>VIP</option>
        </select>
      </div>
      <div class="modal-form-actions">
        <button type="button" class="btn-secondary" onclick="cerrarModal()">Cancelar</button>
        <button type="submit" class="btn-primary-modal">Guardar Cambios</button>
      </div>
    </form>
  `;

  modal.classList.add('open');

  document.getElementById('formEditarClienteModal').addEventListener('submit', (e) => {
    e.preventDefault();
    cliente.nombre = document.getElementById('editClienteNombre').value.trim();
    cliente.telefono = document.getElementById('editClienteTelefono').value.trim();
    cliente.email = document.getElementById('editClienteEmail').value.trim();
    cliente.tipo = document.getElementById('editClienteTipo').value;

    const partes = cliente.nombre.split(' ');
    cliente.iniciales = partes
      .map((p) => p[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    renderClientesGrid();
    cerrarModal();
  });
};

window.eliminarCliente = function (id) {
  const cliente = listaClientes.find((c) => c.id === id);
  if (!cliente) return;

  abrirModalConfirmacion(`Estas seguro de que deseas eliminar a <strong>${cliente.nombre}</strong>?`, () => {
    listaClientes = listaClientes.filter((c) => c.id !== id);
    renderClientesGrid();

    const modalBody = document.getElementById('modalBody');
    if (document.getElementById('infoModal').classList.contains('open') && document.querySelector('.tabla-modal-clientes')) {
      renderTablaClientesModal(modalBody);
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
      } else {
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
    <p class="text-muted modal-subtext">Directorio general. Selecciona una accion para administrar el cliente:</p>
    <div class="tabla-modal-wrapper">
      <table class="tabla-modal tabla-modal-clientes">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Contacto</th>
            <th>Reservas</th>
            <th class="td-acciones">Acciones</th>
          </tr>
        </thead>
        <tbody>
  `;

  listaClientes.forEach((c) => {
    html += `
      <tr>
        <td><strong>${c.nombre}</strong> <br><span class="badge-tag green">${c.tipo}</span></td>
        <td><span class="text-muted">${c.telefono}</span><br><span class="text-muted">${c.email}</span></td>
        <td>${c.reservas}</td>
        <td class="td-acciones">
          <button class="btn-action btn-edit" onclick="editarCliente(${c.id})">
            <i data-lucide="edit-3"></i> Editar
          </button>
          <button class="btn-action btn-delete" onclick="eliminarCliente(${c.id})">
            <i data-lucide="trash-2"></i> Eliminar
          </button>
        </td>
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
  reservas: {
    titulo: 'Listado de Reservas',
    contenido: `<p>Administracion de reservas agendadas, control de pagos e historial de la sede.</p>`,
  },
};

function renderGraficoBarra() {
  const ctx = document.getElementById('incomeChart')?.getContext('2d');
  if (!ctx) return null;

  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'],
      datasets: [
        { label: 'Cancha 1', data: [300, 450, 320, 500], backgroundColor: '#16a34a', borderRadius: 4 },
        { label: 'Cancha 2', data: [200, 300, 250, 400], backgroundColor: '#9333ea', borderRadius: 4 },
        { label: 'Cancha 3', data: [150, 200, 180, 220], backgroundColor: '#ea580c', borderRadius: 4 },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { color: '#0f172a', boxWidth: 12, padding: 8, font: { size: 11, family: 'Plus Jakarta Sans' } },
        },
      },
      scales: {
        x: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: '#f1f5f9' } },
        y: { ticks: { color: '#64748b', font: { size: 10 } }, grid: { color: '#f1f5f9' } },
      },
    },
  });
}

function renderGraficoDoughnut() {
  const ctx = document.getElementById('doughnutChart')?.getContext('2d');
  if (!ctx) return null;

  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Cancha 1', 'Cancha 2', 'Cancha 3'],
      datasets: [
        {
          data: [45, 35, 20],
          backgroundColor: ['#16a34a', '#9333ea', '#ea580c'],
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#0f172a', boxWidth: 12, padding: 8, font: { size: 11, family: 'Plus Jakarta Sans' } },
        },
      },
    },
  });
}

function activarFiltrosTiempo(chart) {
  const contenedor = document.getElementById('periodFilterGroup');
  if (!contenedor || !chart) return;

  contenedor.addEventListener('click', (e) => {
    if (!e.target.classList.contains('btn-time')) return;

    contenedor.querySelectorAll('.btn-time').forEach((b) => b.classList.remove('active'));
    e.target.classList.add('active');

    const periodo = e.target.getAttribute('data-period');

    if (periodo === 'dia') {
      chart.data.labels = ['8 AM', '12 PM', '4 PM', '8 PM'];
      chart.data.datasets[0].data = [40, 80, 120, 200];
      chart.data.datasets[1].data = [30, 50, 90, 150];
      chart.data.datasets[2].data = [20, 40, 60, 100];
    } else if (periodo === 'semana') {
      chart.data.labels = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
      chart.data.datasets[0].data = [300, 450, 320, 500];
      chart.data.datasets[1].data = [200, 300, 250, 400];
      chart.data.datasets[2].data = [150, 200, 180, 220];
    } else if (periodo === 'mes') {
      chart.data.labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
      chart.data.datasets[0].data = [1200, 1500, 1800, 1400, 1900, 2100];
      chart.data.datasets[1].data = [900, 1100, 1300, 1000, 1400, 1600];
      chart.data.datasets[2].data = [600, 700, 850, 800, 950, 1100];
    }
    chart.update();
  });
}
