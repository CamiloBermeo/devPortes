import { obtenerCanchas } from '../api/canchas.js';
import { renderizarInstalaciones, renderizarModales } from '../componets/tarjeta_canchas.js';

document.addEventListener('DOMContentLoaded', () => {
  const canchas = obtenerCanchas();
  renderizarInstalaciones(canchas);
  renderizarModales(canchas);
  inicializarScroll();
});

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
