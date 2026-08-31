import { obtenerCanchas, formatoTipo, tipoAArray } from '../api/canchas.js';
import { renderizarSelectorCanchas } from '../componets/tarjeta_canchas.js';
import { estaLogueado, obtenerPerfilCompleto } from '../utils/auth.js';

document.addEventListener('DOMContentLoaded', async () => {
  // ---------------- Guard: requerir autenticación ----------------
  if (!estaLogueado()) {
    const currentParams = new URLSearchParams(window.location.search);
    const redirectParams = new URLSearchParams({
      redirect: 'reservas',
      ...Object.fromEntries(currentParams)
    });
    window.location.href = `./login.html?${redirectParams.toString()}&tab=register`;
    return;
  }

  // ---------------- inicio y referencias del formulario ----------------
  const pasos = Array.from(document.querySelectorAll('.paso-formulario'));
  const elementosPaso = Array.from(document.querySelectorAll('.paso'));
  const botonesSiguiente = Array.from(document.querySelectorAll('.boton-siguiente'));
  const botonesAnterior = Array.from(document.querySelectorAll('.boton-anterior'));
  const botonReiniciar = document.getElementById('botonReiniciar');

  const calendarDays = document.getElementById('calendarDays');
  const currentMonthLabel = document.getElementById('currentMonthLabel');
  const horariosDisponibles = document.getElementById('horariosDisponibles');
  const prevMonthBtn = document.getElementById('prevMonthBtn');
  const nextMonthBtn = document.getElementById('nextMonthBtn');
  const selectedDateText = document.getElementById('selectedDateText');
  const selectedTimeText = document.getElementById('selectedTimeText');
  const fechaReservaInput = document.getElementById('fechaReserva');
  const horaReservaInput = document.getElementById('horaReserva');

  // ---------------- configuracion de campos ----------------
  const claveReservaLocal = 'devPortesReservaEnCurso';
  const camposPersistentes = [
    'nombreCompleto',
    'cedula',
    'celular',
    'correo',
    'metodoPago',
    'tipoCancha',
    'fechaReserva',
    'horaReserva',
    'duracion',
  ];

  const camposPaso1 = [
    { id: 'nombreCompleto', mensaje: 'Ingresa tu nombre completo.' },
    { id: 'cedula', mensaje: 'Ingresa tu cédula.' },
    { id: 'celular', mensaje: 'Ingresa tu número celular.' },
    { id: 'correo', mensaje: 'Ingresa un correo válido.' },
    { id: 'metodoPago', mensaje: 'Selecciona un método de pago.' },
  ];

  // ---------------- estado del calendario y cancha ----------------
  const estadoCalendario = {
    fechaActual: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    fechaSeleccionada: null,
    horaSeleccionadas: [],
    codigoReserva: null,
  };

  const datosCancha = {
    id: 1,
    titulo: 'Cancha Sintética # 1',
    tipo: ['Fútbol 7'],
    superficie: '4 x 4 (750 mts)',
    precio: '$80.000',
    imagen: '../assets/img/canchafutbol.jpg',
  };

  // ---------------- integración de modal de selección de canchas ----------------
  const btnCambiarCancha = document.getElementById('btnCambiarCancha');

  const renderizarSelector = () => {
    const canchasActualizadas = obtenerCanchas().filter((c) => c.estado === 'Disponible');
    renderizarSelectorCanchas(canchasActualizadas, 'contenedor-modales-reserva', datosCancha.id);
  };

  function abrirModalInfoCancha() {
    const canchas = obtenerCanchas();
    const cancha = canchas.find((c) => c.id === datosCancha.id);
    if (!cancha) return;

    const contenedor = document.getElementById('contenedor-modales-reserva');
    if (!contenedor) return;

    const imagenSrc = cancha.imagen || '../assets/img/canchafutbol.jpg';
    const detallesHTML = Array.isArray(cancha.detalles) && cancha.detalles.length
      ? cancha.detalles.map((d) => `<li class="mb-1">✔️ ${d}</li>`).join('')
      : '';

    contenedor.innerHTML = `
      <div class="modal fade" id="modalInfoCanchaReserva" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content border-0 rounded-4 overflow-hidden shadow-lg">
            <div class="row g-0">
              <div class="col-12 col-md-5 bg-dark d-flex modal-img-wrapper">
                <img src="${imagenSrc}" class="w-100 h-100 object-fit-cover" alt="${cancha.titulo}" />
              </div>
              <div class="col-12 col-md-7 p-4 d-flex flex-column justify-content-between bg-white">
                <div>
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <h3 class="fs-5 fw-bold m-0">${cancha.titulo}</h3>
                    <button type="button" class="btn-close shadow-none" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div class="d-flex flex-wrap gap-2 mb-3">
                    ${cancha.superficie ? `<span class="badge bg-success px-2.5 py-1.5 fw-semibold">${cancha.superficie}</span>` : ''}
                    <span class="badge bg-dark px-2.5 py-1.5 fw-semibold">${formatoTipo(cancha)}</span>
                    ${cancha.capacidad ? `<span class="badge bg-secondary px-2.5 py-1.5 fw-semibold"><i class="bi bi-people-fill me-1"></i>${cancha.capacidad} personas</span>` : ''}
                  </div>
                  ${cancha.descripcion ? `<p class="text-muted small lh-base mb-4">${cancha.descripcion}</p>` : ''}
                  ${detallesHTML ? `<ul class="list-unstyled small mb-4">${detallesHTML}</ul>` : ''}
                </div>
                <div class="pt-3 border-top border-light">
                  <span class="text-muted d-block text-uppercase text-nowrap text-xxs-custom" style="letter-spacing:0.05em;font-size:0.65rem">Precio por Hora</span>
                  <span class="fw-bold fs-5">${cancha.precio}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const modalElement = document.getElementById('modalInfoCanchaReserva');
    if (modalElement && window.bootstrap) {
      const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
      modalInstance.show();
    }
  }

  // Abrir modal de selección al hacer clic en "Cambiar"
  btnCambiarCancha?.addEventListener('click', () => {
    renderizarSelector();
    const modalElement = document.getElementById('modalSeleccionarCancha');
    if (modalElement && window.bootstrap) {
      const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
      modalInstance.show();
    }
  });

  // Modal "Más info" de la cancha actual
  const btnMasInfo = document.getElementById('btnMasInfoCancha');
  btnMasInfo?.addEventListener('click', () => abrirModalInfoCancha());

  // Listener delegado para botones "Seleccionar" en el grid
  const contenedorModales = document.getElementById('contenedor-modales-reserva');
  if (contenedorModales) {
    contenedorModales.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-seleccionar-cancha');
      if (!btn || btn.classList.contains('disabled')) return;

      const canchaId = Number(btn.dataset.canchaId);
      const canchasActuales = obtenerCanchas().filter((c) => c.estado === 'Disponible');
      const canchaSeleccionada = canchasActuales.find((c) => c.id === canchaId);

      if (canchaSeleccionada) {
        datosCancha.id = canchaSeleccionada.id;
        datosCancha.titulo = canchaSeleccionada.titulo || canchaSeleccionada.nombre;
        datosCancha.tipo = canchaSeleccionada.tipo;
        datosCancha.superficie = canchaSeleccionada.superficie || 'Sintética Standard';
        datosCancha.precio = canchaSeleccionada.precio || `$${(canchaSeleccionada.tarifa || 0).toLocaleString('es-CO')}`;
        datosCancha.imagen = canchaSeleccionada.imagen;

        actualizarResumen();
        actualizarVistaPrevia();
        guardarReservaLocal();

        // Cerrar modal
        const modalElement = document.getElementById('modalSeleccionarCancha');
        if (modalElement && window.bootstrap) {
          const modalInstance = bootstrap.Modal.getInstance(modalElement);
          if (modalInstance) modalInstance.hide();
        }
      }
    });
  }
  // ---------------- horarios disponibles ----------------
  const horariosDisponiblesLista = [
    { display: '8:00 - 9:00 AM', value: '08:00' },
    { display: '9:00 - 10:00 AM', value: '09:00' },
    { display: '10:00 - 11:00 AM', value: '10:00' },
    { display: '4:00 - 5:00 PM', value: '16:00' },
    { display: '5:00 - 6:00 PM', value: '17:00' },
    { display: '6:00 - 7:00 PM', value: '18:00' },
    { display: '7:00 - 8:00 PM', value: '19:00' },
    { display: '8:00 - 9:00 PM', value: '20:00' },
    { display: '9:00 - 10:00 PM', value: '21:00' },
  ];

  // ---------------- persistencia en localStorage ----------------
  const guardarReservaLocal = (pasoActual = obtenerPasoActual()) => {
    const campos = {};
    camposPersistentes.forEach((id) => {
      const campo = document.getElementById(id);
      if (campo) campos[id] = campo.value;
    });

    const reservaPara = document.querySelector('input[name="reservaPara"]:checked');

    localStorage.setItem(
      claveReservaLocal,
      JSON.stringify({
        campos,
        reservaPara: reservaPara?.value || 'mi',
        fechaActual: estadoCalendario.fechaActual.toISOString(),
        fechaSeleccionada: estadoCalendario.fechaSeleccionada,
        horaSeleccionadas: estadoCalendario.horaSeleccionadas,
        codigoReserva: estadoCalendario.codigoReserva,
        cancha: datosCancha,
        pasoActual,
      }),
    );
  };

  const restaurarReservaLocal = () => {
    const reservaGuardada = localStorage.getItem(claveReservaLocal);
    if (!reservaGuardada) return 1;

    try {
      const reserva = JSON.parse(reservaGuardada);

      Object.entries(reserva.campos || {}).forEach(([id, valor]) => {
        const campo = document.getElementById(id);
        if (campo) campo.value = valor;
      });

      const opcionReserva = document.querySelector(`input[name="reservaPara"][value="${reserva.reservaPara || 'mi'}"]`);
      if (opcionReserva) opcionReserva.checked = true;

      if (reserva.fechaActual) estadoCalendario.fechaActual = new Date(reserva.fechaActual);
      estadoCalendario.fechaSeleccionada = reserva.fechaSeleccionada || null;
      estadoCalendario.horaSeleccionadas = reserva.horaSeleccionadas || [];
      estadoCalendario.codigoReserva = reserva.codigoReserva || null;
      Object.assign(datosCancha, reserva.cancha || {});

      return Number(reserva.pasoActual) || 1;
    } catch {
      localStorage.removeItem(claveReservaLocal);
      return 1;
    }
  };

  // ---------------- datos de cancha recibidos desde la URL ----------------
  const aplicarCanchaDesdeUrl = () => {
    const parametros = new URLSearchParams(window.location.search);
    const id = parametros.get('id');

    if (!id) return false;

    datosCancha.id = Number(id) || datosCancha.id;
    datosCancha.titulo = parametros.get('titulo') || datosCancha.titulo;
    datosCancha.tipo = tipoAArray(parametros.get('tipo')) || datosCancha.tipo;
    datosCancha.superficie = parametros.get('superficie') || datosCancha.superficie;
    datosCancha.precio = parametros.get('precio') || datosCancha.precio;
    datosCancha.imagen = parametros.get('imagen') || datosCancha.imagen;
    return true;
  };

  // ---------------- funciones auxiliares y formatos ----------------
  const obtenerPasoActual = () => {
    const pasoActivo = document.querySelector('.paso-formulario.activo');
    return Number(pasoActivo?.id.replace('paso-', '')) || 1;
  };

  const formatearFechaParaResumen = (valorFecha) => {
    if (!valorFecha) return 'Por seleccionar';
    const [anio, mes, dia] = valorFecha.split('-').map(Number);
    const fecha = new Date(anio, mes - 1, dia);
    const mesTexto = fecha.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase();
    return `${dia} ${mesTexto} ${anio}`;
  };

  const formatearHoraParaResumen = (valorHora) => {
    if (!valorHora) return 'Por seleccionar';
    const [horas, minutos] = valorHora.split(':').map(Number);
    const fecha = new Date();
    fecha.setHours(horas, minutos, 0, 0);

    return fecha.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  // ---------------- actualizacion de resumenes ----------------
  const actualizarResumen = () => {
    const rangoHorario = obtenerRangoHorario();
    const fechaReserva = fechaReservaInput?.value || '';

    const elTipo = document.getElementById('resumenTipo');
    if (elTipo) elTipo.textContent = formatoTipo(datosCancha);

    const elDuracion = document.getElementById('resumenDuracion');
    if (elDuracion)
      elDuracion.textContent = rangoHorario
        ? `${rangoHorario.duracion} ${rangoHorario.duracion === 1 ? 'hora' : 'horas'}`
        : 'Por seleccionar';

    const elFecha = document.getElementById('resumenFecha');
    if (elFecha) elFecha.textContent = formatearFechaParaResumen(fechaReserva);

    const elHora = document.getElementById('resumenHora');
    if (elHora)
      elHora.textContent = rangoHorario
        ? `${formatearHoraParaResumen(rangoHorario.inicio)} - ${formatearHoraParaResumen(rangoHorario.fin)}`
        : 'Por seleccionar';

    const elTitulo = document.getElementById('resumenTituloCancha');
    if (elTitulo) elTitulo.textContent = datosCancha.titulo;

    const elSuperficie = document.getElementById('resumenSuperficie');
    if (elSuperficie) elSuperficie.textContent = datosCancha.superficie;

    const elTipoCancha = document.getElementById('resumenTipoCancha');
    if (elTipoCancha) elTipoCancha.textContent = formatoTipo(datosCancha);

    const elPrecio = document.getElementById('resumenPrecio');
    if (elPrecio) elPrecio.textContent = datosCancha.precio;

    const precioNumerico = Number(datosCancha.precio.replace(/\D/g, '')) || 0;
    const total = rangoHorario ? precioNumerico * rangoHorario.duracion : 0;

    const elTotal = document.getElementById('resumenTotal');
    if (elTotal) {
      elTotal.textContent = total.toLocaleString('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
      });
    }

    const imagenCancha = document.getElementById('resumenImagenCancha');
    if (imagenCancha) {
      imagenCancha.src = datosCancha.imagen;
      imagenCancha.alt = datosCancha.titulo;
    }

    if (selectedDateText) selectedDateText.textContent = formatearFechaParaResumen(fechaReserva);
    if (selectedTimeText) {
      selectedTimeText.textContent = rangoHorario
        ? `${formatearHoraParaResumen(rangoHorario.inicio)} - ${formatearHoraParaResumen(rangoHorario.fin)}`
        : 'Selecciona una hora';
    }
  };

  const actualizarVistaPrevia = () => {
    const vNombre = document.getElementById('vistaNombre');
    if (vNombre) vNombre.textContent = document.getElementById('nombreCompleto')?.value || '-';

    const vCedula = document.getElementById('vistaCedula');
    if (vCedula) vCedula.textContent = document.getElementById('cedula')?.value || '-';

    const vCelular = document.getElementById('vistaCelular');
    if (vCelular) vCelular.textContent = document.getElementById('celular')?.value || '-';

    const vCorreo = document.getElementById('vistaCorreo');
    if (vCorreo) vCorreo.textContent = document.getElementById('correo')?.value || '-';

    const vPago = document.getElementById('vistaPago');
    if (vPago) vPago.textContent = document.getElementById('metodoPago')?.value || '-';

    const vCancha = document.getElementById('vistaCancha');
    if (vCancha) vCancha.textContent = datosCancha.titulo || '-';

    const vFecha = document.getElementById('vistaFecha');
    if (vFecha) vFecha.textContent = formatearFechaParaResumen(fechaReservaInput?.value || '') || '-';

    const rangoHorario = obtenerRangoHorario();
    const vHora = document.getElementById('vistaHora');
    if (vHora) {
      vHora.textContent = rangoHorario
        ? `${formatearHoraParaResumen(rangoHorario.inicio)} - ${formatearHoraParaResumen(rangoHorario.fin)}`
        : 'Por seleccionar';
    }

    const vDuracion = document.getElementById('vistaDuracion');
    if (vDuracion) {
      vDuracion.textContent = rangoHorario
        ? `${rangoHorario.duracion} ${rangoHorario.duracion === 1 ? 'hora' : 'horas'}`
        : 'Por seleccionar';
    }
  };

  // ---------------- validacion del paso 1 ----------------
  const regexNombre = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
  const validarNombre = () => {
    const campo = document.getElementById('nombreCompleto');
    if (!campo) return true;
    const valor = campo.value.trim();

    if (valor === '') {
      marcarCampo(campo, false, 'Ingresa tu nombre completo.');
      return false;
    }
    if (valor.length < 2) {
      marcarCampo(campo, false, 'El nombre debe tener al menos 2 caracteres.');
      return false;
    }
    if (valor.length > 40) {
      marcarCampo(campo, false, 'El nombre no puede superar los 40 caracteres.');
      return false;
    }
    if (!regexNombre.test(valor)) {
      marcarCampo(campo, false, 'El nombre solo puede contener letras y espacios.');
      return false;
    }

    marcarCampo(campo, true, '');
    return true;
  };

  const regexDocumento = /^[0-9\s-]+$/;
  const validarCedula = () => {
    const campo = document.getElementById('cedula');
    if (!campo) return true;
    const valor = campo.value.trim();

    if (valor === '') {
      marcarCampo(campo, false, 'Ingresa tu documento.');
      return false;
    }
    if (valor.length > 15) {
      marcarCampo(campo, false, 'El documento no puede superar los 15 caracteres.');
      return false;
    }
    if (!regexDocumento.test(valor)) {
      marcarCampo(campo, false, 'El documento contiene caracteres no permitidos.');
      return false;
    }

    marcarCampo(campo, true, '');
    return true;
  };

  const regexCelular = /^\d+$/;
  const validarCelular = () => {
    const campo = document.getElementById('celular');
    if (!campo) return true;
    const valor = campo.value.trim();

    if (valor === '') {
      marcarCampo(campo, false, 'Ingresa tu número celular.');
      return false;
    }
    if (!regexCelular.test(valor)) {
      marcarCampo(campo, false, 'El celular solo puede contener números.');
      return false;
    }
    if (valor.length !== 10) {
      marcarCampo(campo, false, 'El celular debe tener 10 dígitos.');
      return false;
    }

    marcarCampo(campo, true, '');
    return true;
  };

  const validarCorreo = () => {
    const campo = document.getElementById('correo');
    if (!campo) return true;
    const valor = campo.value.trim();

    if (valor === '') {
      marcarCampo(campo, false, 'Ingresa tu correo.');
      return false;
    }
    if (!campo.checkValidity()) {
      marcarCampo(campo, false, 'Escribe un correo con formato válido.');
      return false;
    }

    marcarCampo(campo, true, '');
    return true;
  };

  const validarMetodoPago = () => {
    const campo = document.getElementById('metodoPago');
    if (!campo) return true;

    if (campo.value === '') {
      marcarCampo(campo, false, 'Selecciona un método de pago.');
      return false;
    }

    marcarCampo(campo, true, '');
    return true;
  };

  const nombre = document.getElementById('nombreCompleto');
  const cedula = document.getElementById('cedula');
  const celular = document.getElementById('celular');
  const correo = document.getElementById('correo');
  const metodoPago = document.getElementById('metodoPago');

  nombre?.addEventListener('blur', validarNombre);
  cedula?.addEventListener('blur', validarCedula);
  celular?.addEventListener('blur', validarCelular);
  correo?.addEventListener('blur', validarCorreo);
  metodoPago?.addEventListener('change', validarMetodoPago);

  const validarPaso1 = () => {
    return validarNombre() && validarCedula() && validarCelular() && validarCorreo() && validarMetodoPago();
  };

  const marcarCampo = (campo, esValido, mensaje) => {
    const mensajeError = document.getElementById(`error${campo.id.charAt(0).toUpperCase()}${campo.id.slice(1)}`);
    campo.classList.toggle('campo-error', !esValido);
    campo.classList.toggle('campo-valido', esValido);
    campo.setAttribute('aria-invalid', String(!esValido));

    if (mensajeError) {
      mensajeError.textContent = esValido ? '' : mensaje;
    }
  };

  const limpiarErrorCampo = (id) => {
    const campo = document.getElementById(id);
    const mensajeError = document.getElementById(`error${id.charAt(0).toUpperCase()}${id.slice(1)}`);
    campo?.classList.remove('campo-error');
    campo?.removeAttribute('aria-invalid');
    if (mensajeError) mensajeError.textContent = '';
  };

  // ---------------- navegacion entre pasos ----------------
  const mostrarPaso = (nuevoPaso) => {
    pasos.forEach((paso) => {
      paso.classList.remove('activo', 'salida', 'entrada-regreso');
      paso.style.display = 'none';
    });

    const pasoDestino = document.getElementById(`paso-${nuevoPaso}`);
    if (pasoDestino) {
      pasoDestino.classList.add('activo');
      pasoDestino.style.display = 'block';
    }

    elementosPaso.forEach((item) => {
      item.classList.toggle('activo', Number(item.dataset.step) === nuevoPaso);
    });

    if (nuevoPaso === 3) actualizarVistaPrevia();

    if (nuevoPaso === 4) {
      if (!estadoCalendario.codigoReserva) {
        estadoCalendario.codigoReserva = `#DEV-${Math.floor(1000 + Math.random() * 9000)}`;
      }
      const codRes = document.getElementById('codigoReserva');
      if (codRes) codRes.textContent = estadoCalendario.codigoReserva;
    }

    guardarReservaLocal(nuevoPaso);
  };

  const formatearFechaInput = (fecha) => {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // ---------------- calendario ----------------
  const renderCalendar = () => {
    if (!calendarDays || !currentMonthLabel) return;

    const fechaActual = estadoCalendario.fechaActual;
    const year = fechaActual.getFullYear();
    const month = fechaActual.getMonth();
    const primerDia = new Date(year, month, 1);
    const ultimoDia = new Date(year, month + 1, 0);
    const offset = (primerDia.getDay() + 6) % 7;
    const totalDias = ultimoDia.getDate();
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    currentMonthLabel.textContent = primerDia.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase();
    calendarDays.innerHTML = '';

    for (let i = 0; i < offset; i += 1) {
      const emptyDay = document.createElement('span');
      emptyDay.className = 'day day-empty';
      calendarDays.appendChild(emptyDay);
    }

    for (let dia = 1; dia <= totalDias; dia += 1) {
      const diaDate = new Date(year, month, dia);
      const diaDateValue = formatearFechaInput(diaDate);
      const diaButton = document.createElement('button');
      diaButton.type = 'button';
      diaButton.className = 'day';
      diaButton.textContent = dia;
      diaButton.dataset.date = diaDateValue;

      if (diaDate < hoy) {
        diaButton.classList.add('day-disabled');
        diaButton.disabled = true;
      }

      if (estadoCalendario.fechaSeleccionada && estadoCalendario.fechaSeleccionada === diaDateValue) {
        diaButton.classList.add('day-selected');
      }

      diaButton.addEventListener('click', () => {
        estadoCalendario.fechaSeleccionada = diaDateValue;
        if (fechaReservaInput) fechaReservaInput.value = diaDateValue;
        renderCalendar();
        actualizarResumen();
        actualizarVistaPrevia();
        guardarReservaLocal();
      });

      calendarDays.appendChild(diaButton);
    }
  };

  const renderHorarios = () => {
    if (!horariosDisponibles) return;
    horariosDisponibles.innerHTML = '';

    horariosDisponiblesLista.forEach((horario) => {
      const horarioButton = document.createElement('button');
      horarioButton.type = 'button';
      horarioButton.className = 'btn btn-horario';
      horarioButton.textContent = horario.display;
      horarioButton.dataset.value = horario.value;

      if (estadoCalendario.horaSeleccionadas.includes(horario.value)) {
        horarioButton.classList.add('active');
      }

      horarioButton.addEventListener('click', () => {
        if (estadoCalendario.horaSeleccionadas.includes(horario.value)) {
          estadoCalendario.horaSeleccionadas = estadoCalendario.horaSeleccionadas.filter((hora) => hora !== horario.value);
        } else {
          estadoCalendario.horaSeleccionadas.push(horario.value);
        }
        renderHorarios();
        actualizarResumen();
        actualizarVistaPrevia();
        guardarReservaLocal();
      });

      horariosDisponibles.appendChild(horarioButton);
    });
  };

  const convertirAMinutos = (hora) => {
    const [horas, minutos] = hora.split(':').map(Number);
    return horas * 60 + minutos;
  };

  const validarHorariosContinuos = () => {
    const horasOrdenadas = [...estadoCalendario.horaSeleccionadas].sort();
    if (horasOrdenadas.length <= 1) return true;

    for (let i = 1; i < horasOrdenadas.length; i++) {
      const horaAnterior = convertirAMinutos(horasOrdenadas[i - 1]);
      const horaActual = convertirAMinutos(horasOrdenadas[i]);
      if (horaActual - horaAnterior !== 60) return false;
    }
    return true;
  };

  const obtenerRangoHorario = () => {
    const horasOrdenadas = [...estadoCalendario.horaSeleccionadas].sort();
    if (horasOrdenadas.length === 0) return null;

    const horaInicio = horasOrdenadas[0];
    const ultimaHora = horasOrdenadas[horasOrdenadas.length - 1];
    const minutosFin = convertirAMinutos(ultimaHora) + 60;

    const horasFin = Math.floor(minutosFin / 60);
    const minutosFinRestantes = minutosFin % 60;
    const horaFin = `${String(horasFin).padStart(2, '0')}:${String(minutosFinRestantes).padStart(2, '0')}`;

    return {
      inicio: horaInicio,
      fin: horaFin,
      duracion: horasOrdenadas.length,
    };
  };

  // ---------------- controles del calendario ----------------
  prevMonthBtn?.addEventListener('click', () => {
    estadoCalendario.fechaActual = new Date(
      estadoCalendario.fechaActual.getFullYear(),
      estadoCalendario.fechaActual.getMonth() - 1,
      1,
    );
    renderCalendar();
    guardarReservaLocal();
  });

  nextMonthBtn?.addEventListener('click', () => {
    estadoCalendario.fechaActual = new Date(
      estadoCalendario.fechaActual.getFullYear(),
      estadoCalendario.fechaActual.getMonth() + 1,
      1,
    );
    renderCalendar();
    guardarReservaLocal();
  });

  // ---------------- botones de navegacion ----------------
  botonesSiguiente.forEach((boton) => {
    boton.addEventListener('click', () => {
      const pasoActual = obtenerPasoActual();
      const siguientePaso = Number(boton.dataset.next);

      if (pasoActual === 1 && !validarPaso1()) return;

      if (pasoActual === 2) {
        const fecha = fechaReservaInput?.value;
        const horas = estadoCalendario.horaSeleccionadas;

        if (!fecha || horas.length === 0) {
          alert('Selecciona la fecha y al menos una hora para continuar.');
          return;
        }

        if (!validarHorariosContinuos()) {
          alert('Las horas seleccionadas deben ser consecutivas.');
          return;
        }
      }

      actualizarResumen();
      mostrarPaso(siguientePaso);
    });
  });

  botonesAnterior.forEach((boton) => {
    boton.addEventListener('click', () => {
      const pasoAnterior = Number(boton.dataset.prev);
      mostrarPaso(pasoAnterior);
    });
  });

  // ---------------- eventos de campos ----------------
  ['tipoCancha', 'fechaReserva', 'horaReserva', 'duracion'].forEach((id) => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('input', () => {
        actualizarResumen();
        guardarReservaLocal();
      });
      input.addEventListener('change', () => {
        actualizarResumen();
        guardarReservaLocal();
      });
    }
  });

  ['nombreCompleto', 'cedula', 'celular', 'correo', 'metodoPago'].forEach((id) => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('input', () => {
        limpiarErrorCampo(id);
        actualizarVistaPrevia();
        guardarReservaLocal();
      });
      input.addEventListener('change', () => {
        limpiarErrorCampo(id);
        actualizarVistaPrevia();
        guardarReservaLocal();
      });
    }
  });

  document.querySelectorAll('input[name="reservaPara"]').forEach((opcion) => {
    opcion.addEventListener('change', () => {
      guardarReservaLocal();
      if (opcion.value === 'mi' && userProfile) {
        autollenarDatosUsuario(userProfile);
      } else if (opcion.value === 'tercero') {
        limpiarDatosUsuario();
      }
    });
  });

  // ---------------- reinicio de reserva ----------------
  if (botonReiniciar) {
    botonReiniciar.addEventListener('click', () => {
      camposPersistentes.forEach((id) => {
        const elemento = document.getElementById(id);
        if (elemento) elemento.value = '';
      });

      camposPaso1.forEach(({ id }) => {
        const campo = document.getElementById(id);
        const mensajeError = document.getElementById(`error${id.charAt(0).toUpperCase()}${id.slice(1)}`);
        campo?.classList.remove('campo-error', 'campo-valido');
        campo?.removeAttribute('aria-invalid');
        if (mensajeError) mensajeError.textContent = '';
      });

      estadoCalendario.fechaSeleccionada = null;
      estadoCalendario.horaSeleccionadas = [];
      estadoCalendario.fechaActual = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      renderCalendar();
      renderHorarios();

      const opcionMi = document.querySelector('input[name="reservaPara"][value="mi"]');
      if (opcionMi) opcionMi.checked = true;

      actualizarResumen();
      actualizarVistaPrevia();
      mostrarPaso(1);
      localStorage.removeItem(claveReservaLocal);
    });
  }

  // ---------------- inicializacion ----------------
  const pasoGuardado = restaurarReservaLocal();
  aplicarCanchaDesdeUrl();

  let userProfile = null;
  if (estaLogueado()) {
    userProfile = await obtenerPerfilCompleto();
  }

  renderCalendar();
  renderHorarios();
  actualizarResumen();
  actualizarVistaPrevia();
  mostrarPaso(pasoGuardado);

  // Auto-fill on load if "Para mí" is selected
  const reservaParaMi = document.getElementById('reservaParaMi');
  if (reservaParaMi?.checked && userProfile) {
    autollenarDatosUsuario(userProfile);
  }
});

// New functions for auto-fill
function autollenarDatosUsuario(data) {
  const mapping = {
    nombreCompleto: data.nombre,
    cedula: data.cedula,
    celular: data.telefono,
    correo: data.correo
  };
  Object.entries(mapping).forEach(([id, value]) => {
    const input = document.getElementById(id);
    if (input && value) {
      input.value = value;
      input.readOnly = true;
      input.style.backgroundColor = '#f8f9fa';
      input.dispatchEvent(new Event('input'));
    }
  });
  // Hint label
  let hint = document.getElementById('autofill-hint');
  if (!hint) {
    hint = document.createElement('div');
    hint.id = 'autofill-hint';
    hint.className = 'text-success small mt-1';
    document.querySelector('#paso-1 .div-titulo-formulario')?.after(hint);
  }
  hint.textContent = 'Datos de tu cuenta (solo lectura)';
  hint.style.display = 'block';
}

function limpiarDatosUsuario() {
  ['nombreCompleto', 'cedula', 'celular', 'correo'].forEach(id => {
    const input = document.getElementById(id);
    if (input) { 
      input.value = ''; 
      input.readOnly = false; 
      input.style.backgroundColor = ''; 
    }
  });
  const hint = document.getElementById('autofill-hint');
  if (hint) hint.style.display = 'none';
  actualizarVistaPrevia();
}
