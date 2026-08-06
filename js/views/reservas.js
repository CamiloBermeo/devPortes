document.addEventListener('DOMContentLoaded', () => {
  // Aquí se seleccionan todos los paneles del formulario y los botones de navegación.
  const pasos = Array.from(document.querySelectorAll('.paso-formulario'));
  const elementosPaso = Array.from(document.querySelectorAll('.paso'));
  const botonesSiguiente = Array.from(document.querySelectorAll('.boton-siguiente'));
  const botonesAnterior = Array.from(document.querySelectorAll('.boton-anterior'));
  const botonReiniciar = document.getElementById('botonReiniciar');

  // Paso 2: elementos del calendario y horarios creados con JavaScript para que sean interactivos.
  const calendarDays = document.getElementById('calendarDays');
  const currentMonthLabel = document.getElementById('currentMonthLabel');
  const horariosDisponibles = document.getElementById('horariosDisponibles');
  const prevMonthBtn = document.getElementById('prevMonthBtn');
  const nextMonthBtn = document.getElementById('nextMonthBtn');
  const selectedDateText = document.getElementById('selectedDateText');
  const selectedTimeText = document.getElementById('selectedTimeText');
  const fechaReservaInput = document.getElementById('fechaReserva');
  const horaReservaInput = document.getElementById('horaReserva');

  // El calendario trabaja con un estado interno para navegar entre meses y mantener la fecha elegida.
  const estadoCalendario = {
    fechaActual: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    fechaSeleccionada: null,
    horaSeleccionada: null
  };

  // Esta lista define las franjas horarias disponibles que el usuario puede elegir en el paso 2.
  const horariosDisponiblesLista = [
    { display: '8:00 - 9:00 AM', value: '08:00' },
    { display: '9:00 - 10:00 AM', value: '09:00' },
    { display: '10:00 - 11:00 AM', value: '10:00' },
    { display: '4:00 - 5:00 PM', value: '16:00' },
    { display: '5:00 - 6:00 PM', value: '17:00' },
    { display: '6:00 - 7:00 PM', value: '18:00' },
    { display: '7:00 - 8:00 PM', value: '19:00' },
    { display: '8:00 - 9:00 PM', value: '20:00' },
    { display: '9:00 - 10:00 PM', value: '21:00' }
  ];

  // Esta función detecta qué paso está activo actualmente para saber a dónde ir.
  const obtenerPasoActual = () => {
    const pasoActivo = document.querySelector('.paso-formulario.activo');
    return Number(pasoActivo?.id.replace('paso-', '')) || 1;
  };

  // Esta función formatea la fecha del input para mostrarla en el resumen lateral y en el bloque de selección visual.
  const formatearFechaParaResumen = (valorFecha) => {
    if (!valorFecha) return 'Por seleccionar';

    const [anio, mes, dia] = valorFecha.split('-').map(Number);
    const fecha = new Date(anio, mes - 1, dia);
    const mesTexto = fecha.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase();
    return `${dia} ${mesTexto} ${anio}`;
  };

  // Esta función formatea la hora en formato de 12 horas para que se vea más natural en la UI.
  const formatearHoraParaResumen = (valorHora) => {
    if (!valorHora) return 'Por seleccionar';

    const [horas, minutos] = valorHora.split(':').map(Number);
    const fecha = new Date();
    fecha.setHours(horas, minutos, 0, 0);

    return fecha.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  // Esta función actualiza el panel lateral de resumen con los datos de cancha, fecha y hora.
  const actualizarResumen = () => {
    const tipoCancha = document.getElementById('tipoCancha')?.value || 'Fútbol 7';
    const fechaReserva = fechaReservaInput?.value || '';
    const horaReserva = horaReservaInput?.value || '';
    const duracion = document.getElementById('duracion')?.value || '1 hora';

    document.getElementById('resumenTipo').textContent = tipoCancha;
    document.getElementById('resumenDuracion').textContent = duracion;
    document.getElementById('resumenFecha').textContent = formatearFechaParaResumen(fechaReserva);
    document.getElementById('resumenHora').textContent = formatearHoraParaResumen(horaReserva);
    document.getElementById('resumenTituloCancha').textContent = tipoCancha === 'Fútbol 11'
      ? 'Cancha Césped Natural'
      : tipoCancha === 'Fútbol 5'
        ? 'Cancha Sintética # 2'
        : 'Cancha Sintética # 1';

    if (selectedDateText) {
      selectedDateText.textContent = formatearFechaParaResumen(fechaReserva);
    }

    if (selectedTimeText) {
      selectedTimeText.textContent = formatearHoraParaResumen(horaReserva);
    }
  };

  // Esta función copia los datos del formulario al bloque de confirmación antes de mostrar el paso 3.
  const actualizarVistaPrevia = () => {
    document.getElementById('vistaNombre').textContent = document.getElementById('nombreCompleto')?.value || '-';
    document.getElementById('vistaCedula').textContent = document.getElementById('cedula')?.value || '-';
    document.getElementById('vistaCelular').textContent = document.getElementById('celular')?.value || '-';
    document.getElementById('vistaCorreo').textContent = document.getElementById('correo')?.value || '-';
    document.getElementById('vistaPago').textContent = document.getElementById('metodoPago')?.value || '-';
    document.getElementById('vistaCancha').textContent = document.getElementById('tipoCancha')?.value || '-';
    document.getElementById('vistaFecha').textContent = formatearFechaParaResumen(fechaReservaInput?.value || '') || '-';
    document.getElementById('vistaHora').textContent = formatearHoraParaResumen(horaReservaInput?.value || '') || '-';
    document.getElementById('vistaDuracion').textContent = document.getElementById('duracion')?.value || '-';
  };

  // Este bloque es el punto central donde se cambia de panel: oculta los otros pasos y muestra el solicitado.
  const mostrarPaso = (nuevoPaso) => {
    // Primero se ocultan todos los pasos para evitar que varios paneles queden visibles.
    pasos.forEach((paso) => {
      paso.classList.remove('activo', 'salida', 'entrada-regreso');
      paso.style.display = 'none';
    });

    // Luego se muestra solo el paso que corresponde al número enviado.
    const pasoDestino = document.getElementById(`paso-${nuevoPaso}`);
    if (pasoDestino) {
      pasoDestino.classList.add('activo');
      pasoDestino.style.display = 'block';
    }

    // También se resalta el paso activo en la barra lateral izquierda.
    elementosPaso.forEach((item) => {
      item.classList.toggle('activo', Number(item.dataset.step) === nuevoPaso);
    });

    // Cuando se entra al paso 3 se actualiza la vista previa con los datos digitados.
    if (nuevoPaso === 3) {
      actualizarVistaPrevia();
    }

    // Cuando se entra al paso 4 se genera el código de reserva que aparecerá en la pantalla final.
    if (nuevoPaso === 4) {
      const codigo = `#DEV-${Math.floor(1000 + Math.random() * 9000)}`;
      document.getElementById('codigoReserva').textContent = codigo;
    }
  };

  // Este helper convierte una fecha JS en el formato que usa el input tipo date de HTML.
  const formatearFechaInput = (fecha) => {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Esta función pinta el calendario del mes actual según el estado interno de navegación.
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
        fechaReservaInput.value = diaDateValue;
        renderCalendar();
        actualizarResumen();
        actualizarVistaPrevia();
      });

      calendarDays.appendChild(diaButton);
    }
  };

  // Esta función renderiza los horarios disponibles en botones dinámicos para seleccionar la hora.
  const renderHorarios = () => {
    if (!horariosDisponibles) return;

    horariosDisponibles.innerHTML = '';

    horariosDisponiblesLista.forEach((horario) => {
      const horarioButton = document.createElement('button');
      horarioButton.type = 'button';
      horarioButton.className = 'btn btn-horario ';
      horarioButton.textContent = horario.display;
      horarioButton.dataset.value = horario.value;

      if (estadoCalendario.horaSeleccionada === horario.value) {
        horarioButton.classList.add('active');
      }

      horarioButton.addEventListener('click', () => {
        estadoCalendario.horaSeleccionada = horario.value;
        horaReservaInput.value = horario.value;
        renderHorarios();
        actualizarResumen();
        actualizarVistaPrevia();
      });

      horariosDisponibles.appendChild(horarioButton);
    });
  };

  // Los botones del calendario cambian el mes visible y repintan el selector.
  prevMonthBtn?.addEventListener('click', () => {
    estadoCalendario.fechaActual = new Date(
      estadoCalendario.fechaActual.getFullYear(),
      estadoCalendario.fechaActual.getMonth() - 1,
      1
    );
    renderCalendar();
  });

  nextMonthBtn?.addEventListener('click', () => {
    estadoCalendario.fechaActual = new Date(
      estadoCalendario.fechaActual.getFullYear(),
      estadoCalendario.fechaActual.getMonth() + 1,
      1
    );
    renderCalendar();
  });

  // Los botones Siguiente ejecutan la validación y luego llaman a mostrarPaso para ir al siguiente panel.
  botonesSiguiente.forEach((boton) => {
    boton.addEventListener('click', () => {
      const pasoActual = obtenerPasoActual();
      const siguientePaso = Number(boton.dataset.next);

      if (pasoActual === 1) {
        const nombre = document.getElementById('nombreCompleto')?.value.trim();
        const cedula = document.getElementById('cedula')?.value.trim();
        const celular = document.getElementById('celular')?.value.trim();
        const correo = document.getElementById('correo')?.value.trim();

        if (!nombre || !cedula || !celular || !correo) {
          alert('Completa tus datos personales antes de continuar.');
          return;
        }
      }

      if (pasoActual === 2) {
        const fecha = fechaReservaInput?.value;
        const hora = horaReservaInput?.value;

        if (!fecha || !hora) {
          alert('Selecciona la fecha y la hora para continuar.');
          return;
        }
      }

      actualizarResumen();
      mostrarPaso(siguientePaso);
    });
  });

  // Los botones Volver regresan al paso anterior usando la función mostrarPaso.
  botonesAnterior.forEach((boton) => {
    boton.addEventListener('click', () => {
      const pasoAnterior = Number(boton.dataset.prev);
      mostrarPaso(pasoAnterior);
    });
  });

  // Cada vez que cambian los campos del paso 2 se actualiza el resumen del lado derecho.
  ['tipoCancha', 'fechaReserva', 'horaReserva', 'duracion'].forEach((id) => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('input', actualizarResumen);
      input.addEventListener('change', actualizarResumen);
    }
  });

  // Cada vez que se escribe al menos un campo del paso 1, la vista previa del paso 3 refleja esos cambios.
  ['nombreCompleto', 'cedula', 'celular', 'correo', 'metodoPago'].forEach((id) => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('input', actualizarVistaPrevia);
      input.addEventListener('change', actualizarVistaPrevia);
    }
  });

  // Si el usuario quiere hacer otra reserva, se limpia el formulario y se vuelve al paso inicial.
  if (botonReiniciar) {
    botonReiniciar.addEventListener('click', () => {
      const camposFormulario = [
        'nombreCompleto',
        'cedula',
        'celular',
        'correo',
        'metodoPago',
        'tipoCancha',
        'fechaReserva',
        'horaReserva',
        'duracion'
      ];

      camposFormulario.forEach((id) => {
        const elemento = document.getElementById(id);
        if (elemento) {
          elemento.value = '';
        }
      });

      estadoCalendario.fechaSeleccionada = null;
      estadoCalendario.horaSeleccionada = null;
      estadoCalendario.fechaActual = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      renderCalendar();
      renderHorarios();
      document.querySelector('input[name="reservaPara"][value="mi"]').checked = true;
      actualizarResumen();
      actualizarVistaPrevia();
      mostrarPaso(1);
    });
  }

  // Se inicializan los datos por defecto al cargar la página para que el primer paso se vea limpio y estable.
  renderCalendar();
  renderHorarios();
  actualizarResumen();
  actualizarVistaPrevia();
  mostrarPaso(1);
});
