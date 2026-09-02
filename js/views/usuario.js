document.addEventListener('DOMContentLoaded', () => {
  /* =====================================================
     1. BOTÓN EDITAR PERFIL
     ===================================================== */

  const btnEditarPerfil = document.getElementById('btnEditarPerfil');
  const modalPerfil = document.getElementById('modalPerfil');

  const btnCerrarModal = document.getElementById('btnCerrarModal');
  const btnCancelarEdicion = document.getElementById('btnCancelarEdicion');

  const formEditarPerfil = document.getElementById('formEditarPerfil');

  /*
     Cuando hacemos clic en "Editar perfil",
     mostramos el modal.
  */

  if (btnEditarPerfil && modalPerfil) {
    btnEditarPerfil.addEventListener('click', () => {
      modalPerfil.style.display = 'flex';

      /*
         Evita que la página se desplace mientras
         el modal está abierto.
      */

      document.body.style.overflow = 'hidden';
    });
  }

  /* =====================================================
     2. CERRAR MODAL
     ===================================================== */

  function cerrarModal() {
    if (modalPerfil) {
      modalPerfil.style.display = 'none';

      /*
         Volvemos a permitir el scroll.
      */

      document.body.style.overflow = '';
    }
  }

  /*
     Botón X
  */

  if (btnCerrarModal) {
    btnCerrarModal.addEventListener('click', () => {
      cerrarModal();
    });
  }

  /*
     Botón Cancelar
  */

  if (btnCancelarEdicion) {
    btnCancelarEdicion.addEventListener('click', () => {
      cerrarModal();
    });
  }

  /* =====================================================
     3. CERRAR MODAL HACIENDO CLIC AFUERA
     ===================================================== */

  if (modalPerfil) {
    modalPerfil.addEventListener('click', (evento) => {
      /*
         Solo cerramos si se hizo clic directamente
         sobre el fondo oscuro.
      */

      if (evento.target === modalPerfil) {
        cerrarModal();
      }
    });
  }

  /* =====================================================
     4. GUARDAR CAMBIOS DEL PERFIL
     ===================================================== */

  if (formEditarPerfil) {
    formEditarPerfil.addEventListener('submit', (evento) => {
      /*
         Evita que el formulario recargue la página.
      */

      evento.preventDefault();

      /* ---------------------------------------------
         OBTENER LOS DATOS DEL FORMULARIO
      --------------------------------------------- */

      const nombre = document.getElementById('inputNombre').value.trim();

      const usuario = document.getElementById('inputUsuario').value.trim();

      const email = document.getElementById('inputEmail').value.trim();

      const telefono = document.getElementById('inputTelefono').value.trim();

      /* ---------------------------------------------
         ACTUALIZAR INFORMACIÓN EN EL PERFIL
      --------------------------------------------- */

      const nombreUsuario = document.getElementById('nombreUsuario');
      const emailUsuario = document.getElementById('emailUsuario');
      const telefonoUsuario = document.getElementById('telefonoUsuario');

      if (nombreUsuario) {
        nombreUsuario.textContent = nombre;
      }

      if (emailUsuario) {
        emailUsuario.textContent = email;
      }

      if (telefonoUsuario) {
        telefonoUsuario.textContent = telefono;
      }

      /*
         Cerrar el modal.
      */

      cerrarModal();

      /*
         Mensaje de confirmación.
      */

      alert('¡Perfil actualizado correctamente!');

      /*
         Por ahora mostramos el nombre de usuario
         en consola.

         Más adelante esto se puede conectar
         con el backend/base de datos.
      */

      console.log('Nombre:', nombre);
      console.log('Usuario:', usuario);
      console.log('Email:', email);
      console.log('Teléfono:', telefono);
    });
  }

  /* =====================================================
     5. CANCELAR RESERVAS PENDIENTES
     ===================================================== */

  const botonesCancelar = document.querySelectorAll('.btn-cancelar');

  botonesCancelar.forEach((boton) => {
    boton.addEventListener('click', () => {
      /*
         Buscamos la reserva completa donde
         está ubicado el botón.
      */

      const reserva = boton.closest('.reserva-pendiente');

      /*
         Si no encontramos la reserva,
         no hacemos nada.
      */

      if (!reserva) {
        return;
      }

      /*
         Obtenemos el nombre de la cancha.
      */

      const cancha = reserva.querySelector('h4');

      let nombreCancha = 'esta reserva';

      if (cancha) {
        nombreCancha = cancha.textContent.trim();
      }

      /* ---------------------------------------------
         CONFIRMACIÓN
      --------------------------------------------- */

      const confirmar = confirm(`¿Estás seguro de que deseas cancelar la reserva de ${nombreCancha}?`);

      /*
         Si el usuario pulsa "Cancelar",
         no hacemos nada.
      */

      if (!confirmar) {
        return;
      }

      /* ---------------------------------------------
         ELIMINAR RESERVA DE PENDIENTES
      --------------------------------------------- */

      reserva.remove();

      /* ---------------------------------------------
         ACTUALIZAR CONTADOR
      --------------------------------------------- */

      actualizarContadorPendientes();

      /*
         Mensaje de confirmación.
      */

      alert('La reserva ha sido cancelada correctamente.');

      /*
         En el futuro aquí conectarás con el backend.

         Ejemplo:

         fetch("/api/reservas/cancelar", {
             method: "POST",
             body: JSON.stringify({
                 id: boton.dataset.id
             })
         });

      */

      console.log('Reserva cancelada:', boton.dataset.id);
    });
  });

  /* =====================================================
     6. ACTUALIZAR CONTADOR DE RESERVAS
     ===================================================== */

  function actualizarContadorPendientes() {
    const contador = document.getElementById('contadorPendientes');

    const reservas = document.querySelectorAll('.reserva-pendiente');

    /*
       Si existe el contador,
       mostramos la cantidad actual.
    */

    if (contador) {
      contador.textContent = reservas.length;
    }

    /*
       Si ya no quedan reservas,
       mostramos un mensaje.
    */

    if (reservas.length === 0) {
      const tarjetaPendientes = document.querySelector('.tarjeta-pendientes');

      /*
         Evitamos crear el mensaje varias veces.
      */

      if (tarjetaPendientes && !document.querySelector('.sin-reservas')) {
        const mensaje = document.createElement('p');

        mensaje.className = 'sin-reservas';

        mensaje.textContent = 'No tienes reservas pendientes.';

        tarjetaPendientes.appendChild(mensaje);
      }
    }
  }

  /* =====================================================
     7. BOTONES "VER DETALLE"
     ===================================================== */

  const botonesDetalle = document.querySelectorAll('.btn-detalle');

  botonesDetalle.forEach((boton) => {
    boton.addEventListener('click', (evento) => {
      /*
         data-id está en el botón:

         data-id="101"

         Lo obtenemos con dataset.
      */

      const idReserva = evento.currentTarget.dataset.id;

      alert(`Cargando información completa para la reserva código: #${idReserva}`);

      /*
         Aquí posteriormente podemos abrir
         un modal con:

         - Cancha
         - Fecha
         - Hora
         - Tipo
         - Precio
         - Estado
         - Método de pago
         */

      console.log('Consultando reserva:', idReserva);
    });
  });

  /* =====================================================
     8. BOTÓN "RESERVAR NUEVA CANCHA"
     ===================================================== */

  const botonNuevaReserva = document.getElementById('btn-nueva-reserva');

  if (botonNuevaReserva) {
    botonNuevaReserva.addEventListener('click', () => {
      alert('¡Abriendo el asistente de reservas de Devportes!');

      /*
         Cuando tengas creada la página
         de reservas puedes activar:

         window.location.href =
         "../views/reservar-cancha.html";
      */
    });
  }

  /* =====================================================
     9. ESC PARA CERRAR EL MODAL
     ===================================================== */

  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape' && modalPerfil && modalPerfil.style.display === 'flex') {
      cerrarModal();
    }
  });
});
