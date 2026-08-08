class AppNavbar extends HTMLElement {
  connectedCallback() {
    const path = window.location.pathname;
    const isInsidePages = path.includes('/pages/');
    const basePath = isInsidePages ? '../' : './';
    const pagesPath = isInsidePages ? './' : './pages/';

    // Obtener el nombre del archivo actual limpiando posibles hashes o parámetros query
    const currentPage = path.split('/').pop().split('#')[0].split('?')[0] || 'index.html';
    const currentHash = window.location.hash;

    this.classList.add('sticky-top', 'd-block');

    // La URL de "¿Cómo funciona?" depende de si ya estás en nosotros.html o en otra página
    const isNosotrosPage = currentPage === 'nosotros.html';
    const comoFuncionaUrl = isNosotrosPage ? '#comoFunciona' : `${pagesPath}nosotros.html#comoFunciona`;

    this.innerHTML = /*html*/ `
    <nav class="navbar navbar-expand-lg navbar-light bg-white py-3 border-top border-4 border-brand-green shadow-sm">
      <div class="container-fluid px-3 px-lg-5">
        <a class="navbar-brand d-flex align-items-center gap-2 m-0" href="${basePath}index.html">
          <div class="text-white d-flex align-items-center justify-content-center rounded-3 fw-bold logo-box">D</div>
          <span class="fs-5 fw-black text-brand-dark tracking-tight">
            DEV<span class="fw-bold text-brand-mid-green">PORTES</span>
          </span>
        </a>

        <button
          class="navbar-toggler p-2 text-secondary border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarMenu"
          aria-controls="navbarMenu"
          aria-expanded="false"
          aria-label="Toggle navigation">
          <svg class="bi bi-list" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
            <path
              fill-rule="evenodd"
              d="M2.5 12.5a.5.5 0 0 1 0-1h11a.5.5 0 0 1 0 1zm0-4a.5.5 0 0 1 0-1h11a.5.5 0 0 1 0 1zm0-4a.5.5 0 0 1 0-1h11a.5.5 0 0 1 0 1z" />
          </svg>
        </button>

        <div class="collapse navbar-collapse mt-4 mt-lg-0 justify-content-lg-between" id="navbarMenu">
          <ul class="navbar-nav mx-auto gap-lg-2 text-center my-3 my-lg-0 px-lg-4 text-nowrap">
            <li class="nav-item">
              <a
                class="nav-link ${currentPage === 'index.html' || currentPage === '' ? 'fw-bold text-brand-mid-green' : 'nav-link-custom'} transition-base px-2"
                href="${basePath}index.html"
                >Inicio</a
              >
            </li>

            <li class="nav-item">
              <a
                class="nav-link ${isNosotrosPage && currentHash !== '#comoFunciona' ? 'fw-bold text-brand-mid-green' : 'nav-link-custom'} transition-base px-2"
                href="${pagesPath}nosotros.html"
                >Nosotros</a
              >
            </li>
            <li class="nav-item">
              <a
                class="nav-link ${currentPage === 'contactenos.html' ? 'fw-bold text-brand-mid-green' : 'nav-link-custom'} transition-base px-2"
                href="${pagesPath}contactenos.html"
                >Contáctenos</a
              >
            </li>
            <li class="nav-item">
              <a
                class="nav-link ${isNosotrosPage && currentHash === '#comoFunciona' ? 'fw-bold text-brand-mid-green' : 'nav-link-custom'} transition-base px-2"
                href="${comoFuncionaUrl}"
                >¿Cómo funciona?</a
              >
            </li>
            <li class="nav-item">
              <a class="nav-link nav-link-custom transition-base px-2" href="#">Galería</a>
            </li>
          </ul>

          <div class="d-grid d-lg-flex align-items-center gap-3">
            <a href="${pagesPath}login.html" class="btn btn-brand rounded-2 px-5 py-2 text-nowrap transition-base"> ¡Únete! </a>
          </div>
        </div>
      </div>
    </nav>
    `;
  }
}

class AppFooter extends HTMLElement {
  connectedCallback() {
    const path = window.location.pathname;
    const isInsidePages = path.includes('/pages/');
    const basePath = isInsidePages ? '../' : './';
    const pagesPath = isInsidePages ? './' : './pages/';

    const currentPage = path.split('/').pop().split('#')[0].split('?')[0] || 'index.html';
    const isNosotrosPage = currentPage === 'nosotros.html';

    const comoFuncionaUrl = isNosotrosPage ? '#comoFunciona' : `${pagesPath}nosotros.html#comoFunciona`;

    this.innerHTML = /*html*/ `
    <footer class="py-4 border-top border-4 border-brand-green mt-auto bg-brand-dark text-white-50">
      <div class="container-fluid px-3 px-lg-5">
        <div class="row g-3 align-items-center justify-content-between text-center text-xl-start">
          <!-- Logo y Marca -->
          <div class="col-12 col-xl-3 d-flex justify-content-center justify-content-xl-start align-items-center gap-2">
            <div class="d-flex align-items-center justify-content-center rounded-3 fw-bold footer-logo-box">D</div>
            <span class="fs-6 fw-black tracking-tight text-white m-0 fw-bolder">DEVPORTES</span>
          </div>

          <!-- Navegación Responsiva en 1 sola Fila -->
          <div class="col-12 col-xl-6">
            <ul
              class="nav justify-content-center gap-2 gap-md-3 gap-lg-4 font-medium small m-0 p-0 text-nowrap flex-wrap flex-sm-nowrap">
              <li class="nav-item">
                <a href="${basePath}index.html" class="nav-link p-1 footer-link transition-base">Inicio</a>
              </li>
              <li class="nav-item">
                <a href="${pagesPath}nosotros.html" class="nav-link p-1 footer-link transition-base">Nosotros</a>
              </li>
              <li class="nav-item">
                <a href="${comoFuncionaUrl}" class="nav-link p-1 footer-link transition-base">¿Cómo funciona?</a>
              </li>
              <li class="nav-item">
                <a href="#" class="nav-link p-1 footer-link transition-base">Galería</a>
              </li>
              <li class="nav-item">
                <a href="#" class="nav-link p-1 footer-link transition-base">Política de Privacidad</a>
              </li>
            </ul>
          </div>

          <!-- Copyright (Con margen derecho para evitar solapamiento) -->
          <div class="col-12 col-xl-3 text-center text-xl-end pe-xl-5">
            <p class="m-0 text-tiny text-white-50">&copy; ${new Date().getFullYear()} Devportes. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </footer>
    `;
  }
} // Script de scroll validando estrictamente la existencia del elemento en la vista actual
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.hash) {
    const targetId = window.location.hash;
    // Solo busca e intenta hacer scroll si el elemento existe en el HTML actual
    const targetElement = document.querySelector(targetId);

    if (targetElement) {
      setTimeout(() => {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }
});

customElements.define('app-navbar', AppNavbar);
customElements.define('app-footer', AppFooter);
