const formPersonal = document.getElementById('formPersonal');
const formCancha = document.getElementById('formCancha');
const btnSiguiente = document.getElementById('btnSiguiente');
const btnVolver = document.getElementById('btnVolver');
const btnConfirmar = document.getElementById('btnConfirmar');

if (btnSiguiente) {
  btnSiguiente.addEventListener('click', () => {
    formPersonal.classList.add('d-none');
    formCancha.classList.remove('d-none');
  });
}

if (btnVolver) {
  btnVolver.addEventListener('click', () => {
    formCancha.classList.add('d-none');
    formPersonal.classList.remove('d-none');
  });
}

if (btnConfirmar) {
  btnConfirmar.addEventListener('click', () => {
    const fecha = document.getElementById('fechaReserva').value;
    const hora = document.getElementById('horaReserva').value;

    if (!fecha || !hora) {
      alert('Por favor selecciona la fecha y la hora para confirmar la reserva.');
      return;
    }

    alert('Reserva confirmada correctamente.');
  });
}
