class AppNavbar extends HTMLElement {
  _listenersSetup;

  connectedCallback() {
    this.render();
    this._setupListeners();
  }

  render() {
    const path = window.location.pathname;
    const isInsidePages = path.includes('/pages/');
    this.basePath = isInsidePages ? '../' : './';
    this.pagesPath = isInsidePages ? './' : './pages/';

    const currentPage = path.split('/').pop().split('#')[0].split('?')[0] || 'index.html';
    const currentHash = window.location.hash;

    this.classList.add('sticky-top', 'd-block');

    const isNosotrosPage = currentPage === 'nosotros.html';
    const comoFuncionaUrl = isNosotrosPage ? '#comoFunciona' : `${this.pagesPath}nosotros.html#comoFunciona`;

    const isLoggedIn = this._checkSession();
    const authButton = isLoggedIn ? this._renderLoggedInButton() : this._renderLoginButton();

    this.innerHTML = /*html*/ `
<nav class="navbar navbar-expand-lg navbar-light bg-white py-3 border-top border-4 border-brand-green shadow-sm">
  <div class="container-fluid px-3 px-lg-5">
    <a class="navbar-brand d-flex align-items-center gap-2 m-0" href="${this.basePath}index.html">
      <div class="text-white d-flex align-items-center justify-content-center rounded-3 fw-bold logo-box">
        <devportes-ball size="32"></devportes-ball>
      </div>
      <span class="fs-5 fw-black fw-bolder text-brand-dark tracking-tight">GOLAYA</span>
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
          d="M2.5 12.5a.5.5 0 0 1 0-1h11a.5.5 0 0 1 0-1zm0-4a.5.5 0 0 1 0-1h11a.5.5 0 0 1 0-1zm0-4a.5.5 0 0 1 0-1h11a.5.5 0 0 1 0-1z" />
      </svg>
    </button>

    <div class="collapse navbar-collapse mt-4 mt-lg-0 justify-content-lg-between" id="navbarMenu">
      <ul class="navbar-nav mx-auto gap-lg-2 text-center my-3 my-lg-0 px-lg-4 text-nowrap">
        <li class="nav-item">
          <a
            class="nav-link ${currentPage === 'index.html' || currentPage === '' ? 'fw-bold text-brand-mid-green' : 'nav-link-custom'} transition-base px-2"
            href="${this.basePath}index.html"
            >Inicio</a
          >
        </li>

        <li class="nav-item">
          <a
            class="nav-link ${isNosotrosPage && currentHash !== '#comoFunciona' ? 'fw-bold text-brand-mid-green' : 'nav-link-custom'} transition-base px-2"
            href="${this.pagesPath}nosotros.html"
            >Nosotros</a
          >
        </li>
        <li class="nav-item">
          <a
            class="nav-link ${currentPage === 'contactenos.html' ? 'fw-bold text-brand-mid-green' : 'nav-link-custom'} transition-base px-2"
            href="${this.pagesPath}contactenos.html"
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

      <div class="d-grid d-lg-flex align-items-center gap-3">${authButton}</div>
    </div>
  </div>
</nav>
    `;
  }

  /* ============================================
     SESIÓN (temporal: localStorage, reemplazar
     por API cuando haya backend desplegado)
     ============================================ */

  _checkSession() {
    return !!localStorage.getItem('devportes_sesion_activa');
  }

  _getSessionData() {
    try {
      return JSON.parse(localStorage.getItem('devportes_sesion_activa') || '{}');
    } catch {
      return {};
    }
  }

  _renderLoggedInButton() {
    return `<a href="${this.pagesPath}usuario.html" class="btn btn-brand rounded-2 px-4 py-2 text-nowrap transition-base d-flex align-items-center gap-2">
              <i class="bi bi-person-circle"></i> Mi perfil
            </a>`;
  }

  _renderLoginButton() {
    return `<a href="${this.pagesPath}login.html" class="btn btn-brand rounded-2 px-5 py-2 text-nowrap transition-base"> ¡Únete! </a>`;
  }

  _setupListeners() {
    if (this._listenersSetup) return;
    this._listenersSetup = true;

    window.addEventListener('storage', () => this.render());
    document.addEventListener('session-change', () => this.render());
  }

  _logout() {
    localStorage.removeItem('devportes_token');
    localStorage.removeItem('devportes_sesion_activa');
    window.location.href = `${this.basePath}index.html`;
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
        <div class="d-flex align-items-center justify-content-center rounded-3 fw-bold p-1 footer-logo-box">
          <devportes-ball size="32" color="currentColor"></devportes-ball>
        </div>
        <span class="fs-6 fw-black tracking-tight text-white m-0 fw-bolder">GOLAYA</span>
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
        <p class="m-0 text-tiny text-white-50">&copy; ${new Date().getFullYear()} GOLAYA. Todos los derechos reservados.</p>
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
