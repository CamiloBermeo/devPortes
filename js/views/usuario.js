document.addEventListener('DOMContentLoaded', () => {
  // 1. Acción del botón principal "Reservar Nueva Cancha"
  const botonNuevaReserva = document.getElementById('btn-nueva-reserva');

  if (botonNuevaReserva) {
    botonNuevaReserva.addEventListener('click', () => {
      alert('¡Abriendo el asistente de reservas de Devportes! Aquí conectarás tu calendario.');
      // Ejemplo de redirección futura:
      // window.location.href = "/reservar-cancha.html";
    });
  }

  // 2. Acción de los botones individuales "Ver Detalle" en la tabla
  const botonesDetalle = document.querySelectorAll('.btn-detalle');

  botonesDetalle.forEach((boton) => {
    boton.addEventListener('click', (evento) => {
      // Obtenemos el ID único asignado en el HTML usando 'data-id'
      const idReserva = evento.target.getAttribute('data-id');

      alert(`Cargando información completa para la reserva código: #${idReserva}`);
      // Aquí puedes programar que se abra una ventana modal con el resumen del pago o dirección de la cancha.
    });
  });
});
