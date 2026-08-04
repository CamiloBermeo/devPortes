class AppNavbar extends HTMLElement {
  connectedCallback() {
    const path = window.location.pathname;
    const isInsidePages = path.includes('/pages/');
    const basePath = isInsidePages ? '../' : './';
    const pagesPath = isInsidePages ? './' : './pages/';

    const currentPage = path.split('/').pop() || 'index.html';

    this.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-light bg-white sticky-top py-3 border-top border-4 border-brand-green shadow-sm">
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
            <path fill-rule="evenodd" d="M2.5 12.5a.5.5 0 0 1 0-1h11a.5.5 0 0 1 0 1zm0-4a.5.5 0 0 1 0-1h11a.5.5 0 0 1 0 1zm0-4a.5.5 0 0 1 0-1h11a.5.5 0 0 1 0 1z"/>
          </svg>
        </button>

        <div class="collapse navbar-collapse mt-4 mt-lg-0 justify-content-lg-between" id="navbarMenu">
          <ul class="navbar-nav mx-auto gap-lg-2 text-center my-3 my-lg-0 px-lg-4 text-nowrap">
            <li class="nav-item">
              <a class="nav-link ${currentPage === 'index.html' || currentPage === '' ? 'fw-bold text-brand-mid-green' : 'nav-link-custom'} transition-base px-2" href="${basePath}index.html">Inicio</a>
            </li>

            <li class="nav-item">
              <a class="nav-link ${currentPage === 'nosotros.html' ? 'fw-bold text-brand-mid-green' : 'nav-link-custom'} transition-base px-2" href="${pagesPath}nosotros.html">Nosotros</a>
            </li>
            <li class="nav-item">
              <a class="nav-link ${currentPage === 'contactenos.html' ? 'fw-bold text-brand-mid-green' : 'nav-link-custom'} transition-base px-2" href="${pagesPath}contactenos.html">Contáctenos</a>
            </li>
            <li class="nav-item">
              <a class="nav-link nav-link-custom transition-base px-2" href="#">¿Cómo funciona?</a>
            </li>
            <li class="nav-item">
              <a class="nav-link nav-link-custom transition-base px-2" href="#">Galería</a>
            </li>
          </ul>

          <div class="d-grid d-lg-flex align-items-center gap-3">
            <a href="${pagesPath}login.html" class="btn btn-outline-custom rounded-3 px-4 py-2 text-nowrap transition-base">
              Iniciar Sesión
            </a>
            <a href="${basePath}index.html#instalaciones" class="btn btn-brand rounded-pill px-4 py-2 d-flex align-items-center justify-content-center gap-2 text-nowrap transition-base">
              Reservar Ahora <span>&rarr;</span>
            </a>
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

    this.innerHTML = `
    <footer class="py-3 border-top border-4 border-brand-green mt-auto bg-brand-dark">
      <div class="container-fluid px-3 px-lg-5">
        <div class="d-flex flex-column flex-lg-row align-items-center justify-content-between gap-3">
          <div class="d-flex align-items-center gap-2">
            <div class="d-flex align-items-center justify-content-center rounded-3 fw-bold footer-logo-box">D</div>
            <span class="fs-6 fw-black tracking-tight text-white m-0 fw-bolder"> DEVPORTES </span>
          </div>

          <ul class="nav justify-content-center gap-3 gap-md-4 font-medium small">
            <li class="nav-item">
              <a href="${basePath}index.html" class="nav-link p-0 text-white-50 text-brand-green-hover transition-base">Inicio</a>
            </li>
            <li class="nav-item">
              <a href="${pagesPath}nosotros.html" class="nav-link p-0 text-white-50 text-brand-green-hover transition-base">Nosotros</a>
            </li>
            <li class="nav-item">
              <a href="#" class="nav-link p-0 text-white-50 text-brand-green-hover transition-base">¿Cómo funciona?</a>
            </li>
            <li class="nav-item">
              <a href="#" class="nav-link p-0 text-white-50 text-brand-green-hover transition-base">Galería</a>
            </li>
            <li class="nav-item">
              <a href="#" class="nav-link p-0 text-white-50 text-brand-green-hover transition-base">Política de Privacidad</a>
            </li>
          </ul>

          <div class="text-center text-lg-end">
            <p class="m-0 text-white-50 text-tiny">&copy; ${new Date().getFullYear()} Devportes.</p>
          </div>
        </div>
      </div>
    </footer>
    `;
  }
}

customElements.define('app-navbar', AppNavbar);
customElements.define('app-footer', AppFooter);
