// Listado local de clientes
let listaClientes = [
    {
        id: 1,
        iniciales: 'CB',
        nombre: 'Carlos Bermeo',
        reservas: 14,
        email: 'carlos.bermeo@gmail.com',
        telefono: '+57 300 123 4567',
        tipo: 'Frecuente'
    },
    {
        id: 2,
        iniciales: 'AG',
        nombre: 'Andrés Gómez',
        reservas: 8,
        email: 'andres.gomez@hotmail.com',
        telefono: '+57 310 987 6543',
        tipo: 'Estándar'
    },
    {
        id: 3,
        iniciales: 'ML',
        nombre: 'Mariana López',
        reservas: 22,
        email: 'mariana.l@outlook.com',
        telefono: '+57 320 456 7890',
        tipo: 'VIP'
    },
    {
        id: 4,
        iniciales: 'JR',
        nombre: 'Javier Rodríguez',
        reservas: 5,
        email: 'j.rodriguez@gmail.com',
        telefono: '+57 315 555 1234',
        tipo: 'Estándar'
    }
];

document.addEventListener ('DOMContentLoaded', () => {
    // Inicializamos los íconos de Lucide
    lucide.createIcons ();

    // Renderizado de las gráficas
    const incomeChart = renderGraficoBarra ();
    renderGraficoDoughnut ();

    // Activación de módulos responsivos e interactivos
    activarMenuMovil ();
    activarNavegacionMenu ();
    activarFiltrosTiempo (incomeChart);
    activarCerrarSesion ();

    // Pintado dinámico de clientes y modal
    renderClientesGrid ();
    activarModalGeneral ();
});

// Despliega y oculta la barra lateral en celulares
function activarMenuMovil () {
    const toggleBtn = document.getElementById ('mobileToggleBtn');
    const sidebar = document.getElementById ('sidebar');
    const overlay = document.getElementById ('sidebarOverlay');

    function cerrarMenu () {
        sidebar.classList.remove ('open');
        overlay.classList.remove ('active');
    }

    if (toggleBtn && sidebar && overlay) {
        toggleBtn.addEventListener ('click', () => {
            sidebar.classList.toggle ('open');
            overlay.classList.toggle ('active');
        });

        overlay.addEventListener ('click', cerrarMenu);
    }
}

// Alterna de forma limpia entre las diferentes vistas
function activarNavegacionMenu () {
    const itemsMenu = document.querySelectorAll ('.sidebar-nav .nav-item');
    const sidebar = document.getElementById ('sidebar');
    const overlay = document.getElementById ('sidebarOverlay');

    const vistaActiva = document.querySelector ('.view-section.active');
    if (vistaActiva) {
        setTimeout (() => vistaActiva.classList.add ('visible'), 50);
    }

    itemsMenu.forEach (item => {
        item.addEventListener ('click', (e) => {
            e.preventDefault ();

            if (item.classList.contains ('active')) return;

            const target = item.getAttribute ('data-target');
            const vistaSiguiente = document.getElementById (target);
            const vistaActual = document.querySelector ('.view-section.active');

            itemsMenu.forEach (i => i.classList.remove ('active'));
            item.classList.add ('active');

            // Si se navega en un celular, cerramos la barra lateral
            if (window.innerWidth <= 768 && sidebar && overlay) {
                sidebar.classList.remove ('open');
                overlay.classList.remove ('active');
            }

            if (vistaActual) {
                vistaActual.classList.remove ('visible');

                setTimeout (() => {
                    vistaActual.classList.remove ('active');

                    if (vistaSiguiente) {
                        vistaSiguiente.classList.add ('active');
                        setTimeout (() => vistaSiguiente.classList.add ('visible'), 30);
                    }
                }, 250);
            }
        });
    });
}

// Acción del botón para cerrar sesión
function activarCerrarSesion () {
    const btnLogout = document.getElementById ('logoutBtn');
    if (btnLogout) {
        btnLogout.addEventListener ('click', (e) => {
            e.preventDefault ();
            const respuesta = confirm ('¿Deseas cerrar tu sesión actual?');
            if (respuesta) {
                alert ('Sesión cerrada correctamente.');
                window.location.reload ();
            }
        });
    }
}

// Renderiza las tarjetas de clientes incluyendo botones para Editar y Eliminar directamente en la vista
function renderClientesGrid () {
    const contenedor = document.getElementById ('clientesGridPreview');
    if (!contenedor) return;

    contenedor.innerHTML = '';

    listaClientes.forEach (cliente => {
        const card = document.createElement ('div');
        card.className = 'card user-card-full';

        card.innerHTML = `
      <div class="user-card-header">
        <div class="avatar">${cliente.iniciales}</div>
        <div>
          <h4>${cliente.nombre}</h4>
          <span class="badge-tag green">${cliente.tipo}</span>
        </div>
      </div>

      <div class="user-card-body">
        <p class="text-muted"><strong>Email:</strong> ${cliente.email}</p>
        <p class="text-muted"><strong>Teléfono:</strong> ${cliente.telefono}</p>
        <p class="text-muted"><strong>Reservas:</strong> ${cliente.reservas} completadas</p>
      </div>

      <div class="user-card-actions">
        <button class="btn-action btn-detail" onclick="abrirPerfilCliente(${cliente.id})">
          <i data-lucide="eye"></i> Ver
        </button>
        <button class="btn-action btn-edit" onclick="editarCliente(${cliente.id})">
          <i data-lucide="edit-3"></i> Editar
        </button>
        <button class="btn-action btn-delete" onclick="eliminarCliente(${cliente.id})">
          <i data-lucide="trash-2"></i> Eliminar
        </button>
      </div>
    `;

        contenedor.appendChild (card);
    });

    lucide.createIcons ();
}

// Muestra el expediente del cliente en el modal
window.abrirPerfilCliente = function (id) {
    const cliente = listaClientes.find (c => c.id === id);
    if (!cliente) return;

    const modal = document.getElementById ('infoModal');
    const modalTitle = document.getElementById ('modalTitle');
    const modalBody = document.getElementById ('modalBody');

    modalTitle.textContent = 'Ficha Técnica del Cliente';

    modalBody.innerHTML = `
    <div class="cliente-detalle-header">
      <div class="avatar cliente-avatar-lg">${cliente.iniciales}</div>
      <div>
        <h3>${cliente.nombre}</h3>
        <span class="badge-tag green">${cliente.tipo}</span>
      </div>
    </div>
    
    <div class="cliente-info-box">
      <p class="cliente-info-item"><strong>Correo electrónico:</strong> ${cliente.email}</p>
      <p class="cliente-info-item"><strong>Número de contacto:</strong> ${cliente.telefono}</p>
      <p class="cliente-info-item"><strong>Historial de uso:</strong> ${cliente.reservas} reservas en la sede.</p>
    </div>
  `;

    modal.classList.add ('open');
};

// Modifica un cliente y actualiza todas las vistas
window.editarCliente = function (id) {
    const cliente = listaClientes.find (c => c.id === id);
    if (!cliente) return;

    const nuevoNombre = prompt ('Ingresa el nuevo nombre:', cliente.nombre);
    if (nuevoNombre && nuevoNombre.trim () !== '') {
        cliente.nombre = nuevoNombre.trim ();

        const partes = cliente.nombre.split (' ');
        cliente.iniciales = partes.map (p => p[0]).join ('').substring (0, 2).toUpperCase ();

        const nuevoTelefono = prompt ('Ingresa el nuevo número de teléfono:', cliente.telefono);
        if (nuevoTelefono && nuevoTelefono.trim () !== '') {
            cliente.telefono = nuevoTelefono.trim ();
        }

        const nuevoEmail = prompt ('Ingresa el nuevo correo electrónico:', cliente.email);
        if (nuevoEmail && nuevoEmail.trim () !== '') {
            cliente.email = nuevoEmail.trim ();
        }

        // Actualizamos tanto las tarjetas del directorio como el modal si está abierto
        renderClientesGrid ();

        const modalBody = document.getElementById ('modalBody');
        if (document.getElementById ('infoModal').classList.contains ('open') && document.querySelector ('.tabla-modal')) {
            renderTablaClientesModal (modalBody);
        }
    }
};

// Elimina un cliente y actualiza todas las vistas
window.eliminarCliente = function (id) {
    const cliente = listaClientes.find (c => c.id === id);
    if (!cliente) return;

    if (confirm (`¿Estás seguro de que deseas eliminar a ${cliente.nombre}?`)) {
        listaClientes = listaClientes.filter (c => c.id !== id);
        renderClientesGrid ();

        const modalBody = document.getElementById ('modalBody');
        if (document.getElementById ('infoModal').classList.contains ('open') && document.querySelector ('.tabla-modal')) {
            renderTablaClientesModal (modalBody);
        }
    }
};

// Controlador general del modal flotante
function activarModalGeneral () {
    const modal = document.getElementById ('infoModal');
    const modalTitle = document.getElementById ('modalTitle');
    const modalBody = document.getElementById ('modalBody');
    const closeBtn = document.getElementById ('closeModalBtn');
    const botonesVerMas = document.querySelectorAll ('.btn-ver-mas');

    botonesVerMas.forEach (btn => {
        btn.addEventListener ('click', () => {
            const clave = btn.getAttribute ('data-modal');

            if (clave === 'clientes') {
                modalTitle.textContent = 'Gestión Global de Clientes';
                renderTablaClientesModal (modalBody);
                modal.classList.add ('open');
            } else {
                const info = datosGeneralesModales[clave];
                if (info) {
                    modalTitle.textContent = info.titulo;
                    modalBody.innerHTML = info.contenido;
                    modal.classList.add ('open');
                }
            }
        });
    });

    closeBtn.addEventListener ('click', () => modal.classList.remove ('open'));
    modal.addEventListener ('click', (e) => {
        if (e.target === modal) modal.classList.remove ('open');
    });
}

// Crea la tabla de administración en el modal (adaptable a tarjetas en celular)
function renderTablaClientesModal (contenedor) {
    if (!contenedor) return;

    let html = `
    <p class="text-muted modal-subtext">Directorio general. Selecciona una acción para administrar el cliente:</p>
    <div class="tabla-modal-wrapper">
      <table class="tabla-modal">
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

    listaClientes.forEach (c => {
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
    lucide.createIcons ();
}

// Información estática para los modales informativos
const datosGeneralesModales = {
    dashboard: {
        titulo: 'Informe Completo del Dashboard',
        contenido: `<p>Métricas de ingresos, nivel de ocupación por tipo de cancha y proyecciones del mes.</p>`
    },
    reservas: {
        titulo: 'Listado de Reservas',
        contenido: `<p>Administración de reservas agendadas, control de pagos e historial de la sede.</p>`
    },
    canchas: {
        titulo: 'Estado de Canchas',
        contenido: `<p>Mantenimiento preventivo, horarios de disponibilidad y tarifas activas.</p>`
    }
};

// Gráfica de Barras para ingresos
function renderGraficoBarra () {
    const ctx = document.getElementById ('incomeChart')?.getContext ('2d');
    if (!ctx) return null;

    return new Chart (ctx, {
        type: 'bar',
        data: {
            labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'],
            datasets: [
                {label: 'Cancha 1', data: [300, 450, 320, 500], backgroundColor: '#16a34a', borderRadius: 4},
                {label: 'Cancha 2', data: [200, 300, 250, 400], backgroundColor: '#9333ea', borderRadius: 4},
                {label: 'Cancha 3', data: [150, 200, 180, 220], backgroundColor: '#ea580c', borderRadius: 4}
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {color: '#0f172a', boxWidth: 12, padding: 8, font: {size: 11, family: 'Plus Jakarta Sans'}}
                }
            },
            scales: {
                x: {ticks: {color: '#64748b', font: {size: 10}}, grid: {color: '#f1f5f9'}},
                y: {ticks: {color: '#64748b', font: {size: 10}}, grid: {color: '#f1f5f9'}}
            }
        }
    });
}

// Gráfica de Dona
function renderGraficoDoughnut () {
    const ctx = document.getElementById ('doughnutChart')?.getContext ('2d');
    if (!ctx) return null;

    return new Chart (ctx, {
        type: 'doughnut',
        data: {
            labels: ['Cancha 1', 'Cancha 2', 'Cancha 3'],
            datasets: [{
                data: [45, 35, 20],
                backgroundColor: ['#16a34a', '#9333ea', '#ea580c'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {color: '#0f172a', boxWidth: 12, padding: 8, font: {size: 11, family: 'Plus Jakarta Sans'}}
                }
            }
        }
    });
}

// Filtro interactivo de periódos
function activarFiltrosTiempo (chart) {
    const contenedor = document.getElementById ('periodFilterGroup');
    if (!contenedor || !chart) return;

    contenedor.addEventListener ('click', (e) => {
        if (!e.target.classList.contains ('btn-time')) return;

        contenedor.querySelectorAll ('.btn-time').forEach (b => b.classList.remove ('active'));
        e.target.classList.add ('active');

        const periodo = e.target.getAttribute ('data-period');

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
        chart.update ();
    });
}