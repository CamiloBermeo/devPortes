document.addEventListener('DOMContentLoaded', () => {
  // Aquí se seleccionan todos los paneles del formulario y los botones de navegación.
  const pasos = Array.from(document.querySelectorAll('.paso-formulario'));
  const elementosPaso = Array.from(document.querySelectorAll('.paso'));
  const botonesSiguiente = Array.from(document.querySelectorAll('.boton-siguiente'));
  const botonesAnterior = Array.from(document.querySelectorAll('.boton-anterior'));
  const botonReiniciar = document.getElementById('botonReiniciar');

  // Esta función detecta qué paso está activo actualmente para saber a dónde ir.
  const obtenerPasoActual = () => {
    const pasoActivo = document.querySelector('.paso-formulario.activo');
    return Number(pasoActivo?.id.replace('paso-', '')) || 1;
  };

  // Esta función actualiza el panel lateral de resumen con los datos de cancha, fecha y hora.
  const actualizarResumen = () => {
    const tipoCancha = document.getElementById('tipoCancha')?.value || 'Fútbol 7';
    const fechaReserva = document.getElementById('fechaReserva')?.value || '';
    const horaReserva = document.getElementById('horaReserva')?.value || '';
    const duracion = document.getElementById('duracion')?.value || '1 hora';

    document.getElementById('resumenTipo').textContent = tipoCancha;
    document.getElementById('resumenDuracion').textContent = duracion;
    document.getElementById('resumenFecha').textContent = fechaReserva ? fechaReserva : 'Por seleccionar';
    document.getElementById('resumenHora').textContent = horaReserva ? horaReserva : 'Por seleccionar';
    document.getElementById('resumenTituloCancha').textContent = tipoCancha === 'Fútbol 11'
      ? 'Cancha Césped Natural'
      : tipoCancha === 'Fútbol 5'
        ? 'Cancha Sintética # 2'
        : 'Cancha Sintética # 1';
  };

  // Esta función copia los datos del formulario al bloque de confirmación antes de mostrar el paso 3.
  const actualizarVistaPrevia = () => {
    document.getElementById('vistaNombre').textContent = document.getElementById('nombreCompleto')?.value || '-';
    document.getElementById('vistaCedula').textContent = document.getElementById('cedula')?.value || '-';
    document.getElementById('vistaCelular').textContent = document.getElementById('celular')?.value || '-';
    document.getElementById('vistaCorreo').textContent = document.getElementById('correo')?.value || '-';
    document.getElementById('vistaPago').textContent = document.getElementById('metodoPago')?.value || '-';
    document.getElementById('vistaCancha').textContent = document.getElementById('tipoCancha')?.value || '-';
    document.getElementById('vistaFecha').textContent = document.getElementById('fechaReserva')?.value || '-';
    document.getElementById('vistaHora').textContent = document.getElementById('horaReserva')?.value || '-';
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
        const fecha = document.getElementById('fechaReserva')?.value;
        const hora = document.getElementById('horaReserva')?.value;

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

      document.querySelector('input[name="reservaPara"][value="mi"]').checked = true;
      actualizarResumen();
      actualizarVistaPrevia();
      mostrarPaso(1);
    });
  }

  // Se inicializan los datos por defecto al cargar la página para que el primer paso se vea limpio y estable.
  actualizarResumen();
  actualizarVistaPrevia();
  mostrarPaso(1);
});
