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
            <svg width="38" height="38" viewBox="0 0 72.371 72.372" fill="currentColor" class="w-100 h-100 p-1">
              <path
                d="M22.57,2.648c-4.489,1.82-8.517,4.496-11.971,7.949C7.144,14.051,4.471,18.08,2.65,22.568C0.892,26.904,0,31.486,0,36.186c0,4.699,0.892,9.281,2.65,13.615c1.821,4.489,4.495,8.518,7.949,11.971c3.454,3.455,7.481,6.129,11.971,7.949c4.336,1.76,8.917,2.649,13.617,2.649c4.7,0,9.28-0.892,13.616-2.649c4.488-1.82,8.518-4.494,11.971-7.949c3.455-3.453,6.129-7.48,7.949-11.971c1.758-4.334,2.648-8.916,2.648-13.615c0-4.7-0.891-9.282-2.648-13.618c-1.82-4.488-4.496-8.518-7.949-11.971s-7.479-6.129-11.971-7.949C45.467,0.891,40.887,0,36.187,0C31.487,0,26.906,0.891,22.57,2.648z M9.044,51.419c-1.743-1.094-3.349-2.354-4.771-3.838c-2.172-6.112-2.54-12.729-1.101-19.01c0.677-1.335,1.447-2.617,2.318-3.845c0.269-0.379,0.518-0.774,0.806-1.142l8.166,4.832c0,0.064,0,0.134,0,0.205c-0.021,4.392,0.425,8.752,1.313,13.049c0.003,0.02,0.006,0.031,0.01,0.049l-6.333,9.93C9.314,51.579,9.177,51.503,9.044,51.419z M33.324,68.206c1.409,0.719,2.858,1.326,4.347,1.82c-6.325,0.275-12.713-1.207-18.36-4.447L33,68.018C33.105,68.085,33.212,68.149,33.324,68.206z M33.274,65.735L17.12,62.856c-1.89-2.295-3.59-4.723-5.051-7.318c-0.372-0.66-0.787-1.301-1.102-1.99l6.327-9.92c0.14,0.035,0.296,0.072,0.473,0.119c3.958,1.059,7.986,1.812,12.042,2.402c0.237,0.033,0.435,0.062,0.604,0.08l7.584,13.113c-1.316,1.85-2.647,3.69-4.007,5.51C33.764,65.155,33.524,65.446,33.274,65.735z M60.15,60.149c-1.286,1.287-2.651,2.447-4.08,3.481c-0.237-1.894-0.646-3.75-1.223-5.563l8.092-15.096c2.229-1.015,4.379-2.166,6.375-3.593c0.261-0.185,0.478-0.392,0.646-0.618C69.374,46.561,66.104,54.196,60.15,60.149z M59.791,40.571c0.301,0.574,0.598,1.154,0.896,1.742l-7.816,14.58c-0.045,0.01-0.088,0.02-0.133,0.026c-4.225,0.789-8.484,1.209-12.779,1.229l-7.8-13.487c1.214-2.254,2.417-4.517,3.61-6.781c0.81-1.536,1.606-3.082,2.401-4.627l16.143-1.658C56.29,34.495,58.163,37.457,59.791,40.571z M56.516,23.277c-0.766,2.023-1.586,4.025-2.401,6.031l-15.726,1.615c-0.188-0.248-0.383-0.492-0.588-0.725c-1.857-2.103-3.726-4.193-5.592-6.289c0.017-0.021,0.034-0.037,0.051-0.056c-0.753-0.752-1.508-1.504-2.261-2.258l4.378-13.181c0.302-0.08,0.606-0.147,0.913-0.18c2.38-0.242,4.763-0.516,7.149-0.654c1.461-0.082,2.93-0.129,4.416-0.024l10.832,12.209C57.314,20.943,56.95,22.124,56.516,23.277z M60.15,12.221c2.988,2.99,5.302,6.402,6.938,10.047c-2.024-1.393-4.188-2.539-6.463-3.473c-0.354-0.146-0.717-0.275-1.086-0.402L48.877,6.376c0.074-0.519,0.113-1.039,0.129-1.563C53.062,6.464,56.864,8.936,60.15,12.221z M25.334,4.182c0.042,0.031,0.062,0.057,0.086,0.064c2.437,0.842,4.654,2.082,6.744,3.553l-4.09,12.317c-0.021,0.006-0.041,0.012-0.061,0.021c-0.837,0.346-1.69,0.656-2.514,1.031c-3.395,1.543-6.705,3.252-9.823,5.301l-8.071-4.775c0.012-0.252,0.055-0.508,0.141-0.736c0.542-1.444,1.075-2.896,1.688-4.311c0.472-1.09,1.01-2.143,1.597-3.172c0.384-0.424,0.782-0.844,1.192-1.254c3.833-3.832,8.363-6.553,13.186-8.162C25.384,4.098,25.358,4.139,25.334,4.182z" />
            </svg>
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
              <svg width="32" height="32" viewBox="0 0 72.371 72.372" fill="currentColor" class="w-100 h-100">
                <path
                  d="M22.57,2.648c-4.489,1.82-8.517,4.496-11.971,7.949C7.144,14.051,4.471,18.08,2.65,22.568C0.892,26.904,0,31.486,0,36.186c0,4.699,0.892,9.281,2.65,13.615c1.821,4.489,4.495,8.518,7.949,11.971c3.454,3.455,7.481,6.129,11.971,7.949c4.336,1.76,8.917,2.649,13.617,2.649c4.7,0,9.28-0.892,13.616-2.649c4.488-1.82,8.518-4.494,11.971-7.949c3.455-3.453,6.129-7.48,7.949-11.971c1.758-4.334,2.648-8.916,2.648-13.615c0-4.7-0.891-9.282-2.648-13.618c-1.82-4.488-4.496-8.518-7.949-11.971s-7.479-6.129-11.971-7.949C45.467,0.891,40.887,0,36.187,0C31.487,0,26.906,0.891,22.57,2.648z M9.044,51.419c-1.743-1.094-3.349-2.354-4.771-3.838c-2.172-6.112-2.54-12.729-1.101-19.01c0.677-1.335,1.447-2.617,2.318-3.845c0.269-0.379,0.518-0.774,0.806-1.142l8.166,4.832c0,0.064,0,0.134,0,0.205c-0.021,4.392,0.425,8.752,1.313,13.049c0.003,0.02,0.006,0.031,0.01,0.049l-6.333,9.93C9.314,51.579,9.177,51.503,9.044,51.419z M33.324,68.206c1.409,0.719,2.858,1.326,4.347,1.82c-6.325,0.275-12.713-1.207-18.36-4.447L33,68.018C33.105,68.085,33.212,68.149,33.324,68.206z M33.274,65.735L17.12,62.856c-1.89-2.295-3.59-4.723-5.051-7.318c-0.372-0.66-0.787-1.301-1.102-1.99l6.327-9.92c0.14,0.035,0.296,0.072,0.473,0.119c3.958,1.059,7.986,1.812,12.042,2.402c0.237,0.033,0.435,0.062,0.604,0.08l7.584,13.113c-1.316,1.85-2.647,3.69-4.007,5.51C33.764,65.155,33.524,65.446,33.274,65.735z M60.15,60.149c-1.286,1.287-2.651,2.447-4.08,3.481c-0.237-1.894-0.646-3.75-1.223-5.563l8.092-15.096c2.229-1.015,4.379-2.166,6.375-3.593c0.261-0.185,0.478-0.392,0.646-0.618C69.374,46.561,66.104,54.196,60.15,60.149z M59.791,40.571c0.301,0.574,0.598,1.154,0.896,1.742l-7.816,14.58c-0.045,0.01-0.088,0.02-0.133,0.026c-4.225,0.789-8.484,1.209-12.779,1.229l-7.8-13.487c1.214-2.254,2.417-4.517,3.61-6.781c0.81-1.536,1.606-3.082,2.401-4.627l16.143-1.658C56.29,34.495,58.163,37.457,59.791,40.571z M56.516,23.277c-0.766,2.023-1.586,4.025-2.401,6.031l-15.726,1.615c-0.188-0.248-0.383-0.492-0.588-0.725c-1.857-2.103-3.726-4.193-5.592-6.289c0.017-0.021,0.034-0.037,0.051-0.056c-0.753-0.752-1.508-1.504-2.261-2.258l4.378-13.181c0.302-0.08,0.606-0.147,0.913-0.18c2.38-0.242,4.763-0.516,7.149-0.654c1.461-0.082,2.93-0.129,4.416-0.024l10.832,12.209C57.314,20.943,56.95,22.124,56.516,23.277z M60.15,12.221c2.988,2.99,5.302,6.402,6.938,10.047c-2.024-1.393-4.188-2.539-6.463-3.473c-0.354-0.146-0.717-0.275-1.086-0.402L48.877,6.376c0.074-0.519,0.113-1.039,0.129-1.563C53.062,6.464,56.864,8.936,60.15,12.221z M25.334,4.182c0.042,0.031,0.062,0.057,0.086,0.064c2.437,0.842,4.654,2.082,6.744,3.553l-4.09,12.317c-0.021,0.006-0.041,0.012-0.061,0.021c-0.837,0.346-1.69,0.656-2.514,1.031c-3.395,1.543-6.705,3.252-9.823,5.301l-8.071-4.775c0.012-0.252,0.055-0.508,0.141-0.736c0.542-1.444,1.075-2.896,1.688-4.311c0.472-1.09,1.01-2.143,1.597-3.172c0.384-0.424,0.782-0.844,1.192-1.254c3.833-3.832,8.363-6.553,13.186-8.162C25.384,4.098,25.358,4.139,25.334,4.182z" />
              </svg>
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
