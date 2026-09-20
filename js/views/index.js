import { obtenerCanchas } from '../api/canchas.js';
import { renderizarInstalaciones, renderizarModales } from '../componets/tarjeta_canchas.js';
import { renderizarFiltroDeportes } from '../componets/filtro_deportes.js';

let contenedorInstalaciones;
let indexError;
let indexEmpty;

document.addEventListener('DOMContentLoaded', () => {
  contenedorInstalaciones = document.getElementById('contenedor-instalaciones');
  indexError = document.getElementById('indexError');
  indexEmpty = document.getElementById('indexEmpty');

  document.getElementById('btnReintentarIndex')?.addEventListener('click', () => cargarCanchas());
  cargarCanchas();
  inicializarScroll();
});

function mostrarEstado(estado, mensajeError = '') {
  contenedorInstalaciones?.classList.add('d-none');
  indexError?.classList.add('d-none');
  indexEmpty?.classList.add('d-none');

  switch (estado) {
    case 'cargando':
      contenedorInstalaciones?.classList.remove('d-none');
      break;
    case 'error':
      const errorTexto = document.getElementById('indexErrorMensaje');
      if (errorTexto && mensajeError) {
        errorTexto.textContent = mensajeError;
      }
      indexError?.classList.remove('d-none');
      break;
    case 'vacio':
      indexEmpty?.classList.remove('d-none');
      break;
    case 'exito':
      contenedorInstalaciones?.classList.remove('d-none');
      break;
  }
}

async function cargarCanchas() {
  mostrarEstado('cargando');

  try {
    const canchas = (await obtenerCanchas()).filter((c) => c.estado === 'Disponible');

    if (canchas.length === 0) {
      mostrarEstado('vacio');
      return;
    }

    renderizarInstalaciones(canchas);
    renderizarModales(canchas);
    renderizarFiltroDeportes(canchas, 'filtro-deportes', (filtradas) => {
      renderizarInstalaciones(filtradas);
      renderizarModales(filtradas);
    });
    mostrarEstado('exito');
  } catch (error) {
    mostrarEstado('error');
  }
}

function inicializarScroll() {
  const btnScrollTop = document.getElementById('btnScrollTop');
  if (!btnScrollTop) return;

  window.addEventListener('scroll', () => {
    btnScrollTop.style.display = window.scrollY > 300 ? 'flex' : 'none';
  });

  btnScrollTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
