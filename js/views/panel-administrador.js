import { obtenerCanchas, guardarCanchas } from '../api/canchas.js';

// Listado local de clientes
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
    nombre: 'Andrés Gómez',
    reservas: 8,
    email: 'andres.gomez@hotmail.com',
    telefono: '+57 310 987 6543',
    tipo: 'Estándar',
  },
  {
    id: 3,
    iniciales: 'ML',
    nombre: 'Mariana López',
    reservas: 22,
    email: 'mariana.l@outlook.com',
    telefono: '+57 320 456 7890',
    tipo: 'VIP',
  },
  {
    id: 4,
    iniciales: 'JR',
    nombre: 'Javier Rodríguez',
    reservas: 5,
    email: 'j.rodriguez@gmail.com',
    telefono: '+57 315 555 1234',
    tipo: 'Estándar',
  },
];

document.addEventListener('DOMContentLoaded', () => {
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
  renderCanchasGrid();
  activarFormularioCanchas();
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
      abrirModalConfirmacion('¿Deseas cerrar tu sesión actual?', () => {
        window.location.reload();
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
        <div class="card-info-row"><span class="text-muted">Teléfono:</span> <strong>${cliente.telefono}</strong></div>
        <div class="card-info-row"><span class="text-muted">Reservas:</span> <strong>${cliente.reservas} realizadas</strong></div>
      </div>

      <div class="user-card-actions">
        <button class="btn-action btn-detail" onclick="abrirPerfilCliente(${cliente.id})"><i data-lucide="eye"></i> Ver</button>
        <button class="btn-action btn-edit" onclick="editarCliente(${cliente.id})"><i data-lucide="edit-3"></i> Editar</button>
        <button class="btn-action btn-delete" onclick="eliminarCliente(${cliente.id})"><i data-lucide="trash-2"></i> Eliminar</button>
      </div>
    `;

    contenedor.appendChild(card);
  });

  if (window.lucide) lucide.createIcons();
}

// Renderiza las tarjetas de canchas con miniatura de foto usando LocalStorage
function renderCanchasGrid() {
  const contenedor = document.getElementById('canchasGridPreview');
  if (!contenedor) return;

  contenedor.innerHTML = '';
  const canchas = obtenerCanchas();

  canchas.forEach((cancha) => {
    const card = document.createElement('div');
    card.className = 'card user-card-full';

    const badgeClass = cancha.estado === 'Disponible' ? 'green' : 'orange';
    const tarifaNumerica = cancha.tarifa || parseInt(cancha.precio?.replace(/\D/g, '') || '0', 10) || 0;
    const nombreMostrar = cancha.titulo || cancha.nombre;
    const imagenSrc = cancha.imagen || 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?auto=format';

    card.innerHTML = `
      <div class="user-card-header" style="display: flex; align-items: center; gap: 12px">
        <img
          src="${imagenSrc}"
          alt="${nombreMostrar}"
          style="width: 48px; height: 48px; object-fit: cover; border-radius: 8px; flex-shrink: 0" />
        <div style="flex: 1; overflow: hidden">
          <h4 style="font-size: 1rem; font-weight: 700; margin: 0; text-overflow: ellipsis; white-space: nowrap; overflow: hidden">
            ${nombreMostrar}
          </h4>
          <span class="badge-tag ${badgeClass}">${cancha.estado}</span>
        </div>
      </div>

      <div class="user-card-body" style="margin: 12px 0">
        <div class="card-info-row">
          <span class="text-muted">Deporte:</span>
          <strong>${cancha.tipo}</strong>
        </div>
        <div class="card-info-row">
          <span class="text-muted">Capacidad:</span>
          <strong>${cancha.capacidad} personas</strong>
        </div>
        <div class="card-info-row">
          <span class="text-muted">Tarifa:</span>
          <strong class="text-green">$${tarifaNumerica.toLocaleString('es-CO')}/hr</strong>
        </div>
      </div>

      <div class="user-card-actions">
        <button class="btn-action btn-detail" onclick="abrirPerfilCancha(${cancha.id})"><i data-lucide="eye"></i> Ver</button>
        <button class="btn-action btn-edit" onclick="editarCancha(${cancha.id})"><i data-lucide="edit-3"></i> Editar</button>
        <button class="btn-action btn-delete" onclick="eliminarCancha(${cancha.id})"><i data-lucide="trash-2"></i> Eliminar</button>
      </div>
    `;

    contenedor.appendChild(card);
  });

  if (window.lucide) lucide.createIcons();
}

function activarFormularioCanchas() {
  const form = document.getElementById('formNuevaCancha');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nombre = document.getElementById('canchaNombre').value.trim();
    const tipo = document.getElementById('canchaTipo').value.trim();
    const capacidad = parseInt(document.getElementById('canchaCapacidad').value, 10);
    const tarifa = parseFloat(document.getElementById('canchaTarifa').value);
    const imagenInput = document.getElementById('canchaImagen');
    const imagenUrl =
      imagenInput && imagenInput.value.trim()
        ? imagenInput.value.trim()
        : 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?auto=format';

    if (!nombre || !tipo || isNaN(capacidad) || isNaN(tarifa)) return;

    const canchas = obtenerCanchas();
    const nuevoId = canchas.length > 0 ? Math.max(...canchas.map((c) => c.id)) + 1 : 1;

    const nuevaCancha = {
      id: nuevoId,
      titulo: nombre,
      nombre: nombre,
      tipo: tipo,
      superficie: 'Sintética Standard',
      precio: `$${tarifa.toLocaleString('es-CO')}`,
      tarifa: tarifa,
      capacidad: capacidad,
      estado: 'Disponible',
      imagen: imagenUrl,
      descripcion: 'Espacio deportivo acondicionado recientemente para partidos generales.',
      detalles: [`Capacidad ideal: ${capacidad} personas`, 'Iluminación estándar', 'Petos y balón básico incluidos'],
    };

    canchas.push(nuevaCancha);
    guardarCanchas(canchas);
    form.reset();

    renderCanchasGrid();

    const modalBody = document.getElementById('modalBody');
    if (document.getElementById('infoModal').classList.contains('open') && document.querySelector('.tabla-modal-canchas')) {
      renderTablaCanchasModal(modalBody);
    }
  });
}

window.abrirPerfilCancha = function (id) {
  const canchas = obtenerCanchas();
  const cancha = canchas.find((c) => c.id === id);
  if (!cancha) return;

  const modal = document.getElementById('infoModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');

  const tarifaNumerica = cancha.tarifa || parseInt(cancha.precio?.replace(/\D/g, '') || '0', 10) || 0;
  const imagenSrc = cancha.imagen || 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?auto=format';

  modalTitle.textContent = 'Detalles del Espacio Deportivo';
  modalBody.innerHTML = `
    <div style="text-align: center; margin-bottom: 12px">
      <img
        src="${imagenSrc}"
        alt="${cancha.titulo || cancha.nombre}"
        style="width: 100%; max-height: 180px; object-fit: cover; border-radius: 8px; border: 1px solid #e2e8f0" />
    </div>
    <div class="cliente-detalle-header">
      <div>
        <h3 style="font-size: 1.2rem; margin-bottom: 4px">${cancha.titulo || cancha.nombre}</h3>
        <span class="badge-tag ${cancha.estado === 'Disponible' ? 'green' : 'orange'}">${cancha.estado}</span>
      </div>
    </div>

    <div class="cliente-info-box" style="margin-top: 1rem">
      <p class="cliente-info-item"><strong>Deporte / Categoría:</strong> ${cancha.tipo}</p>
      <p class="cliente-info-item"><strong>Capacidad Permitida:</strong> ${cancha.capacidad} personas</p>
      <p class="cliente-info-item"><strong>Tarifa por Hora:</strong> $${tarifaNumerica.toLocaleString('es-CO')}</p>
    </div>
  `;

  modal.classList.add('open');
};

window.editarCancha = function (id) {
  const canchas = obtenerCanchas();
  const cancha = canchas.find((c) => c.id === id);
  if (!cancha) return;

  const modal = document.getElementById('infoModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  const tarifaNumerica = cancha.tarifa || parseInt(cancha.precio?.replace(/\D/g, '') || '0', 10) || 0;
  const imagenActual = cancha.imagen || 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?auto=format';

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
        <input type="text" id="editNombre" class="form-input" value="${cancha.titulo || cancha.nombre}" required />
      </div>
      <div class="form-group">
        <label>Deporte / Categoría:</label>
        <input type="text" id="editTipo" class="form-input" value="${cancha.tipo}" required />
      </div>
      <div class="form-group">
        <label>Capacidad (Personas):</label>
        <input type="number" id="editCapacidad" class="form-input" value="${cancha.capacidad}" required />
      </div>
      <div class="form-group">
        <label>Tarifa por Hora ($):</label>
        <input type="number" id="editTarifa" class="form-input" value="${tarifaNumerica}" required />
      </div>
      <div class="form-group">
        <label>Estado:</label>
        <select id="editEstado" class="form-input">
          <option value="Disponible" ${cancha.estado === 'Disponible' ? 'selected' : ''}>Disponible</option>
          <option value="Mantenimiento" ${cancha.estado === 'Mantenimiento' ? 'selected' : ''}>Mantenimiento</option>
        </select>
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
    imgPreview.src = inputImagen.value.trim() || 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?auto=format';
  });

  document.getElementById('formEditarCanchaModal').addEventListener('submit', (e) => {
    e.preventDefault();
    const canchasActuales = obtenerCanchas();
    const idx = canchasActuales.findIndex((c) => c.id === id);

    if (idx !== -1) {
      const nuevoNombre = document.getElementById('editNombre').value.trim();
      const nuevaTarifa = parseFloat(document.getElementById('editTarifa').value);

      canchasActuales[idx].titulo = nuevoNombre;
      canchasActuales[idx].nombre = nuevoNombre;
      canchasActuales[idx].imagen = document.getElementById('editImagen').value.trim();
      canchasActuales[idx].tipo = document.getElementById('editTipo').value.trim();
      canchasActuales[idx].capacidad = parseInt(document.getElementById('editCapacidad').value, 10);
      canchasActuales[idx].tarifa = nuevaTarifa;
      canchasActuales[idx].precio = `$${nuevaTarifa.toLocaleString('es-CO')}`;
      canchasActuales[idx].estado = document.getElementById('editEstado').value;

      guardarCanchas(canchasActuales);
      renderCanchasGrid();
    }
    cerrarModal();
  });
};

window.eliminarCancha = function (id) {
  const canchas = obtenerCanchas();
  const cancha = canchas.find((c) => c.id === id);
  if (!cancha) return;

  const nombreMostrar = cancha.titulo || cancha.nombre;
  abrirModalConfirmacion(`¿Estás seguro de que deseas eliminar la <strong>${nombreMostrar}</strong> del catálogo?`, () => {
    const canchasActuales = obtenerCanchas();
    const canchasFiltradas = canchasActuales.filter((c) => c.id !== id);
    guardarCanchas(canchasFiltradas);

    renderCanchasGrid();

    const modalBody = document.getElementById('modalBody');
    if (document.getElementById('infoModal').classList.contains('open') && document.querySelector('.tabla-modal-canchas')) {
      renderTablaCanchasModal(modalBody);
    }
  });
};

window.abrirPerfilCliente = function (id) {
  const cliente = listaClientes.find((c) => c.id === id);
  if (!cliente) return;

  const modal = document.getElementById('infoModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');

  modalTitle.textContent = 'Ficha Técnica del Cliente';
  modalBody.innerHTML = `
    <div class="cliente-detalle-header" style="display: flex; align-items: center; gap: 12px">
      <div class="avatar" style="width: 48px; height: 48px; font-size: 1.1rem">${cliente.iniciales}</div>
      <div>
        <h3 style="font-size: 1.1rem; margin: 0">${cliente.nombre}</h3>
        <span class="badge-tag green">${cliente.tipo}</span>
      </div>
    </div>

    <div class="cliente-info-box" style="margin-top: 1rem">
      <p class="cliente-info-item"><strong>Correo electrónico:</strong> ${cliente.email}</p>
      <p class="cliente-info-item"><strong>Número de contacto:</strong> ${cliente.telefono}</p>
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
        <label>Teléfono:</label>
        <input type="text" id="editClienteTelefono" class="form-input" value="${cliente.telefono}" required />
      </div>
      <div class="form-group">
        <label>Correo Electrónico:</label>
        <input type="email" id="editClienteEmail" class="form-input" value="${cliente.email}" required />
      </div>
      <div class="form-group">
        <label>Tipo de Cliente:</label>
        <select id="editClienteTipo" class="form-input">
          <option value="Estándar" ${cliente.tipo === 'Estándar' ? 'selected' : ''}>Estándar</option>
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

  abrirModalConfirmacion(`¿Estás seguro de que deseas eliminar a <strong>${cliente.nombre}</strong>?`, () => {
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

  modalTitle.textContent = 'Confirmar Acción';
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
        modalTitle.textContent = 'Gestión Global de Clientes';
        renderTablaClientesModal(modalBody);
        modal.classList.add('open');
      } else if (clave === 'canchas') {
        modalTitle.textContent = 'Catálogo General de Canchas';
        renderTablaCanchasModal(modalBody);
        modal.classList.add('open');
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
    <p class="text-muted modal-subtext">Directorio general. Selecciona una acción para administrar el cliente:</p>
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

function renderTablaCanchasModal(contenedor) {
  if (!contenedor) return;

  const canchas = obtenerCanchas();

  let html = `
    <p class="text-muted modal-subtext">Catálogo general de espacios deportivos registrados:</p>
    <div class="tabla-modal-wrapper">
      <table class="tabla-modal tabla-modal-canchas">
        <thead>
          <tr>
            <th>Cancha</th>
            <th>Tipo / Capacidad</th>
            <th>Tarifa</th>
            <th class="td-acciones">Acciones</th>
          </tr>
        </thead>
        <tbody>
  `;

  canchas.forEach((c) => {
    const badgeClass = c.estado === 'Disponible' ? 'green' : 'orange';
    const tarifaNumerica = c.tarifa || parseInt(c.precio?.replace(/\D/g, '') || '0', 10) || 0;
    const nombreMostrar = c.titulo || c.nombre;
    const imagenSrc = c.imagen || 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?auto=format';

    html += `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 8px;">
            <img src="${imagenSrc}" alt="${nombreMostrar}" style="width: 32px; height: 32px; object-fit: cover; border-radius: 4px;" />
            <div>
              <strong>${nombreMostrar}</strong> <br><span class="badge-tag ${badgeClass}">${c.estado}</span>
            </div>
          </div>
        </td>
        <td><span class="text-muted">${c.tipo}</span><br><span class="text-muted">${c.capacidad} personas</span></td>
        <td>$${tarifaNumerica.toLocaleString('es-CO')}/hr</td>
        <td class="td-acciones">
          <button class="btn-action btn-edit" onclick="editarCancha(${c.id})">
            <i data-lucide="edit-3"></i> Editar
          </button>
          <button class="btn-action btn-delete" onclick="eliminarCancha(${c.id})">
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
    contenido: `<p>Métricas de ingresos, nivel de ocupación por tipo de cancha y proyecciones del mes.</p>`,
  },
  reservas: {
    titulo: 'Listado de Reservas',
    contenido: `<p>Administración de reservas agendadas, control de pagos e historial de la sede.</p>`,
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
