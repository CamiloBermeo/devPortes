document.addEventListener('DOMContentLoaded', () => {
  // ---------------- inicio y referencias del formulario ----------------
  // Este bloque obtiene los elementos HTML que serán utilizados por el wizard.
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

  // ---------------- fin inicio y referencias del formulario ----------------

  // ---------------- configuracion de campos ----------------
  // Define los campos que se guardan y los mensajes del paso 1.
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
    'duracion'
  ];

  const camposPaso1 = [
    { id: 'nombreCompleto', mensaje: 'Ingresa tu nombre completo.' },
    { id: 'cedula', mensaje: 'Ingresa tu cédula.' },
    { id: 'celular', mensaje: 'Ingresa tu número celular.' },
    { id: 'correo', mensaje: 'Ingresa un correo válido.' },
    { id: 'metodoPago', mensaje: 'Selecciona un método de pago.' }
  ];

  // ---------------- fin configuracion de campos ----------------

  // ---------------- estado del calendario y cancha ----------------
  // Conserva la fecha, la hora, el código y los datos de la cancha elegida.
  // El calendario trabaja con un estado interno para navegar entre meses y mantener la fecha elegida.
  const estadoCalendario = {
    fechaActual: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    fechaSeleccionada: null,
    horaSeleccionada: null,
    codigoReserva: null
  };

  const datosCancha = {
    titulo: 'Cancha Sintética # 1',
    tipo: 'Fútbol 7',
    superficie: '4 x 4 (750 mts)',
    precio: '$80.000',
    imagen: '../assets/img/canchafutbol.jpg'
  };

  // ---------------- fin estado del calendario y cancha ----------------

  // ---------------- horarios disponibles ----------------
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

  // ---------------- fin horarios disponibles ----------------

  // ---------------- persistencia en localStorage ----------------
  // Guarda y restaura los datos para conservar la reserva después de recargar.
  const guardarReservaLocal = (pasoActual = obtenerPasoActual()) => {
    const campos = {};

    camposPersistentes.forEach((id) => {
      const campo = document.getElementById(id);
      if (campo) campos[id] = campo.value;
    });

    const reservaPara = document.querySelector('input[name="reservaPara"]:checked');

    localStorage.setItem(claveReservaLocal, JSON.stringify({
      campos,
      reservaPara: reservaPara?.value || 'mi',
      fechaActual: estadoCalendario.fechaActual.toISOString(),
      fechaSeleccionada: estadoCalendario.fechaSeleccionada,
      horaSeleccionada: estadoCalendario.horaSeleccionada,
      codigoReserva: estadoCalendario.codigoReserva,
      cancha: datosCancha,
      pasoActual
    }));
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

      const opcionReserva = document.querySelector(
        `input[name="reservaPara"][value="${reserva.reservaPara || 'mi'}"]`
      );
      if (opcionReserva) opcionReserva.checked = true;

      if (reserva.fechaActual) estadoCalendario.fechaActual = new Date(reserva.fechaActual);
      estadoCalendario.fechaSeleccionada = reserva.fechaSeleccionada || null;
      estadoCalendario.horaSeleccionada = reserva.horaSeleccionada || null;
      estadoCalendario.codigoReserva = reserva.codigoReserva || null;
      Object.assign(datosCancha, reserva.cancha || {});

      return Number(reserva.pasoActual) || 1;
    } catch {
      localStorage.removeItem(claveReservaLocal);
      return 1;
    }
  };

  // ---------------- fin persistencia en localStorage ----------------

  // ---------------- datos de cancha recibidos desde el índice ----------------
  // Lee los parámetros de la URL enviados por "Reservar este espacio".
  const aplicarCanchaDesdeUrl = () => {
    const parametros = new URLSearchParams(window.location.search);
    const titulo = parametros.get('titulo');

    if (!titulo) return false;

    datosCancha.titulo = titulo;
    datosCancha.tipo = parametros.get('tipo') || datosCancha.tipo;
    datosCancha.superficie = parametros.get('superficie') || datosCancha.superficie;
    datosCancha.precio = parametros.get('precio') || datosCancha.precio;
    datosCancha.imagen = parametros.get('imagen') || datosCancha.imagen;
    return true;
  };

  // ---------------- fin datos de cancha recibidos desde el índice ----------------

  // ---------------- funciones auxiliares y formatos ----------------
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

  // ---------------- fin funciones auxiliares y formatos ----------------

  // ---------------- actualizacion de resumenes ----------------
  // Actualiza la card lateral y la vista previa del paso 3.
  // Esta función actualiza el panel lateral de resumen con los datos de cancha, fecha y hora.
  const actualizarResumen = () => {
    const tipoCancha = document.getElementById('tipoCancha')?.value || 'Fútbol 7';
    const fechaReserva = fechaReservaInput?.value || '';
    const horaReserva = horaReservaInput?.value || '';
    const duracion = document.getElementById('duracion')?.value || '1 hora';

    document.getElementById('resumenTipo').textContent = datosCancha.tipo;
    document.getElementById('resumenDuracion').textContent = duracion;
    document.getElementById('resumenFecha').textContent = formatearFechaParaResumen(fechaReserva);
    document.getElementById('resumenHora').textContent = formatearHoraParaResumen(horaReserva);
    document.getElementById('resumenTituloCancha').textContent = datosCancha.titulo;
    document.getElementById('resumenSuperficie').textContent = datosCancha.superficie;
    document.getElementById('resumenTipoCancha').textContent = datosCancha.tipo;
    document.getElementById('resumenPrecio').textContent = datosCancha.precio;
    const imagenCancha = document.getElementById('resumenImagenCancha');
    imagenCancha.src = datosCancha.imagen;
    imagenCancha.alt = datosCancha.titulo;

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
    document.getElementById('vistaCancha').textContent = datosCancha.titulo || '-';
    document.getElementById('vistaFecha').textContent = formatearFechaParaResumen(fechaReservaInput?.value || '') || '-';
    document.getElementById('vistaHora').textContent = formatearHoraParaResumen(horaReservaInput?.value || '') || '-';
    document.getElementById('vistaDuracion').textContent = document.getElementById('duracion')?.value || '-';
  };

  // ---------------- fin actualizacion de resumenes ----------------

  // ---------------- validacion del paso 1 ----------------
  // Marca los campos faltantes o inválidos cuando el usuario pulsa Siguiente.
  //Nombre↓
  const regexNombre = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
  const validarNombre = () => {
    const campo = document.getElementById('nombreCompleto');
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
  //CEDULA↓
  const regexDocumento = /^[0-9\s-]+$/;
  const validarCedula = () => {
    const campo = document.getElementById('cedula');
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
  //CELULAR↓
  const regexCelular = /^\d+$/;
  const validarCelular = () => {
    const campo = document.getElementById('celular');
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
  //CORREO↓
  const validarCorreo = () => {
    const campo = document.getElementById('correo');
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
  //METODO PAGO↓
  const validarMetodoPago = () => {
    const campo = document.getElementById('metodoPago');
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
  nombre.addEventListener('blur', validarNombre);
  cedula.addEventListener('blur', validarCedula);
  celular.addEventListener('blur', validarCelular);
  correo.addEventListener('blur', validarCorreo);
  metodoPago.addEventListener('change', validarMetodoPago);


  const validarPaso1 = () => {
    const nombreValido = validarNombre();
    const cedulaValida = validarCedula();
    const celularValido = validarCelular();
    const correoValido = validarCorreo();
    const metodoPagoValido = validarMetodoPago();

    return (
      nombreValido &&
      cedulaValida &&
      celularValido &&
      correoValido &&
      metodoPagoValido
    );
  };
  const marcarCampo = (campo, esValido, mensaje) => {
    const mensajeError = document.getElementById(
      `error${campo.id.charAt(0).toUpperCase()}${campo.id.slice(1)}`
    );

    campo.classList.toggle('campo-error', !esValido);
    campo.classList.toggle('campo-valido', esValido);

    campo.setAttribute('aria-invalid', String(!esValido));

    if (mensajeError) {
      mensajeError.textContent = esValido ? '' : mensaje;
    }
  };


  // const validarPaso1 = () => {
  //   let formularioValido = true;

  //   camposPaso1.forEach(({ id, mensaje }) => {
  //     const campo = document.getElementById(id);
  //     const mensajeError = document.getElementById(`error${id.charAt(0).toUpperCase()}${id.slice(1)}`);
  //     const estaVacio = !campo.value.trim();
  //     const correoInvalido = id === 'correo' && !estaVacio && !campo.checkValidity();
  //     const tieneError = estaVacio || correoInvalido;

  //     campo.classList.toggle('campo-error', tieneError);
  //     campo.classList.toggle('campo-valido', !tieneError);
  //     campo.setAttribute('aria-invalid', String(tieneError));

  //     if (mensajeError) {
  //       mensajeError.textContent = tieneError
  //         ? (correoInvalido ? 'Escribe un correo con formato válido.' : mensaje)
  //         : '';
  //     }

  //     if (tieneError) formularioValido = false;
  //   });

  //   return formularioValido;
  // };

  const limpiarErrorCampo = (id) => {
    const campo = document.getElementById(id);
    const mensajeError = document.getElementById(`error${id.charAt(0).toUpperCase()}${id.slice(1)}`);

    campo?.classList.remove('campo-error');
    campo?.removeAttribute('aria-invalid');
    if (mensajeError) mensajeError.textContent = '';
  };

  // ---------------- fin validacion del paso 1 ----------------

  // Este bloque es el punto central donde se cambia de panel: oculta los otros pasos y muestra el solicitado.
  // ---------------- navegacion entre pasos ----------------
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
      if (!estadoCalendario.codigoReserva) {
        estadoCalendario.codigoReserva = `#DEV-${Math.floor(1000 + Math.random() * 9000)}`;
      }
      document.getElementById('codigoReserva').textContent = estadoCalendario.codigoReserva;
    }

    guardarReservaLocal(nuevoPaso);
  };

  // ---------------- fin navegacion entre pasos ----------------

  // Este helper convierte una fecha JS en el formato que usa el input tipo date de HTML.
  const formatearFechaInput = (fecha) => {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // ---------------- calendario ----------------
  // Dibuja los días del mes y permite seleccionar una fecha.

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
        guardarReservaLocal();
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
        guardarReservaLocal();
      });

      horariosDisponibles.appendChild(horarioButton);
    });
  };

  // ---------------- fin calendario ----------------

  // Los botones del calendario cambian el mes visible y repintan el selector.
  // ---------------- controles del calendario ----------------
  prevMonthBtn?.addEventListener('click', () => {
    estadoCalendario.fechaActual = new Date(
      estadoCalendario.fechaActual.getFullYear(),
      estadoCalendario.fechaActual.getMonth() - 1,
      1
    );
    renderCalendar();
    guardarReservaLocal();
  });

  nextMonthBtn?.addEventListener('click', () => {
    estadoCalendario.fechaActual = new Date(
      estadoCalendario.fechaActual.getFullYear(),
      estadoCalendario.fechaActual.getMonth() + 1,
      1
    );
    renderCalendar();
    guardarReservaLocal();
  });

  // ---------------- fin controles del calendario ----------------

  // ---------------- botones de navegacion ----------------
  // Los botones Siguiente ejecutan la validación y luego llaman a mostrarPaso para ir al siguiente panel.
  botonesSiguiente.forEach((boton) => {
    boton.addEventListener('click', () => {
      const pasoActual = obtenerPasoActual();
      const siguientePaso = Number(boton.dataset.next);

      if (pasoActual === 1) {
        if (!validarPaso1()) {
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

  // ---------------- fin botones de navegacion ----------------

  // ---------------- eventos de campos ----------------
  // Cada vez que cambian los campos del paso 2 se actualiza el resumen del lado derecho.
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

  // Cada vez que se escribe al menos un campo del paso 1, la vista previa del paso 3 refleja esos cambios.
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
    opcion.addEventListener('change', () => guardarReservaLocal());
  });

  // ---------------- fin eventos de campos ----------------

  // ---------------- reinicio de reserva ----------------
  // Si el usuario quiere hacer otra reserva, se limpia el formulario y se vuelve al paso inicial.
  if (botonReiniciar) {
    botonReiniciar.addEventListener('click', () => {
      camposPersistentes.forEach((id) => {
        const elemento = document.getElementById(id);
        if (elemento) {
          elemento.value = '';
        }
      });

      camposPaso1.forEach(({ id }) => {
        const campo = document.getElementById(id);
        const mensajeError = document.getElementById(`error${id.charAt(0).toUpperCase()}${id.slice(1)}`);
        campo?.classList.remove('campo-error', 'campo-valido');
        campo?.removeAttribute('aria-invalid');
        if (mensajeError) mensajeError.textContent = '';
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
      localStorage.removeItem(claveReservaLocal);
    });
  }

  // ---------------- fin reinicio de reserva ----------------

  // ---------------- inicializacion ----------------
  // Se recuperan los datos guardados y se pinta el paso correspondiente.
  const pasoGuardado = restaurarReservaLocal();
  aplicarCanchaDesdeUrl();
  renderCalendar();
  renderHorarios();
  actualizarResumen();
  actualizarVistaPrevia();
  mostrarPaso(pasoGuardado);

  // ---------------- fin inicializacion ----------------
});
