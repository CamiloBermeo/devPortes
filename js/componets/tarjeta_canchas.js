import { formatoTipo } from '../api/canchas.js';

export function renderizarInstalaciones(canchas, contenedorId = 'contenedor-instalaciones') {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor || canchas.length === 0) return;

  const badgesHTML = (cancha) => `
    <div class="gallery-bento-badges">
      <span class="gallery-bento-badge gallery-bento-badge-tipo">${formatoTipo(cancha)}</span>
      <span class="gallery-bento-badge gallery-bento-badge-precio">${cancha.precio}/hr</span>
    </div>
  `;

  const cardHTML = (cancha) => `
    <article class="gallery-bento-item"
             data-bs-toggle="modal" data-bs-target="#modalCancha${cancha.id}">
      <img src="${cancha.imagen}" alt="${cancha.titulo}" loading="lazy" />
      <div class="gallery-bento-overlay">
        <h3 class="gallery-bento-titulo">${cancha.titulo}</h3>
        <span class="gallery-bento-btn">Más info</span>
        ${badgesHTML(cancha)}
      </div>
    </article>`;

  const esUnaSola = canchas.length === 1;

  const cards = canchas.map((c) => cardHTML(c)).join('');

  contenedor.innerHTML = `
    <div class="col-12">
      <div class="gallery-bento-grid${esUnaSola ? ' gallery-bento-single' : ''}">
        ${cards}
      </div>
    </div>
  `;
}

export function renderizarModales(canchas, contenedorId = 'contenedor-modales') {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) return;

  contenedor.innerHTML = canchas
    .map(
      (cancha) => `
    <div class="modal fade" id="modalCancha${cancha.id}" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 rounded-4 overflow-hidden shadow-lg">
          <div class="row g-0">
            <div class="col-12 col-md-5 bg-dark d-flex modal-img-wrapper">
              <img src="${cancha.imagen}" class="w-100 h-100 object-fit-cover" alt="${cancha.titulo}" />
            </div>
            <div class="col-12 col-md-7 p-4 d-flex flex-column justify-content-between bg-white">
              <div>
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <h3 class="fs-5 fw-bold text-brand-dark m-0 brand-heading">${cancha.titulo}</h3>
                  <button type="button" class="btn-close shadow-none" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="d-flex flex-wrap gap-2 mb-3">
                  <span class="badge bg-brand-mid-green px-2.5 py-1.5 fw-semibold">${cancha.superficie}</span>
                  <span class="badge bg-brand-dark px-2.5 py-1.5 fw-semibold">${formatoTipo(cancha)}</span>
                  ${cancha.capacidad ? `<span class="badge bg-secondary px-2.5 py-1.5 fw-semibold"><i class="bi bi-people-fill me-1"></i>${cancha.capacidad} personas</span>` : ''}
                </div>
                <p class="text-muted small lh-base mb-4">${cancha.descripcion}</p>
                <ul class="list-unstyled small text-brand-dark mb-4">
                  ${cancha.detalles.map((d) => `<li class="mb-1">✔️ ${d}</li>`).join('')}
                </ul>
              </div>
              <div class="d-flex justify-content-between align-items-center pt-3 border-top border-light gap-2">
                <div>
                  <span class="text-muted d-block text-uppercase tracking-wider text-nowrap text-xxs-custom">Precio por Hora</span>
                  <span class="fw-bold fs-5 text-brand-dark">${cancha.precio}</span>
                </div>
                <a href="./pages/reservas.html?id=${cancha.id}&titulo=${encodeURIComponent(cancha.titulo)}&tipo=${encodeURIComponent(formatoTipo(cancha))}&superficie=${encodeURIComponent(cancha.superficie)}&precio=${encodeURIComponent(cancha.precio)}&imagen=${encodeURIComponent(cancha.imagen)}" class="btn btn-brand rounded-pill px-4 py-2 small text-nowrap transition-base text-sm-custom">
                  Reservar este espacio
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
    )
    .join('');
}

export function renderizarSelectorCanchas(canchas, contenedorId, canchaActualId) {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) return;

  contenedor.innerHTML = `
    <div class="modal fade" id="modalSeleccionarCancha" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content border-0 rounded-4 overflow-hidden shadow-lg">
          <div class="modal-header border-0 pb-0">
            <div>
              <h4 class="fw-bold mb-0 brand-heading">
                <i class="bi bi-trophy me-2 text-success"></i>Selecciona una Cancha
              </h4>
              <p class="text-muted small mb-0 mt-1">Elige el espacio deportivo que prefieras para tu reserva.</p>
            </div>
            <button type="button" class="btn-close shadow-none" data-bs-dismiss="modal" aria-label="Cerrar"></button>
          </div>
          <div class="modal-body pt-3">
            <div class="row g-3" id="gridCanchasSeleccion">
              ${canchas
                .map((cancha) => {
                  const seleccionada = cancha.id === canchaActualId;
                  return `
                  <div class="col-12 col-md-6 col-lg-4">
                    <article class="card-seleccion-cancha ${seleccionada ? 'seleccionada' : ''}" data-cancha-id="${cancha.id}">
                      <div class="card-seleccion-img">
                        <img src="${cancha.imagen}" alt="${cancha.titulo}" />
                        ${seleccionada ? '<span class="seleccionada-badge"><i class="bi bi-check-circle-fill me-1"></i>Seleccionada</span>' : ''}
                      </div>
                      <div class="card-seleccion-body">
                        <h5 class="card-seleccion-titulo">${cancha.titulo}</h5>
                        <div class="card-seleccion-badges">
                          <span class="badge bg-success text-white">${formatoTipo(cancha)}</span>
                          <span class="badge bg-dark text-white">${cancha.superficie}</span>
                          ${cancha.capacidad ? `<span class="badge bg-info text-white"><i class="bi bi-people-fill me-1"></i>${cancha.capacidad}</span>` : ''}
                        </div>
                        <div class="card-seleccion-precio">
                          <span class="precio-valor">${cancha.precio}</span>
                          <span class="precio-label">/hora</span>
                        </div>
                      </div>
                      <div class="card-seleccion-footer">
                        <button type="button" class="btn ${seleccionada ? 'btn-secondary disabled' : 'btn-brand'} btn-seleccionar-cancha w-100 rounded-pill" data-cancha-id="${cancha.id}">
                          ${seleccionada ? '<i class="bi bi-check-lg me-1"></i>Seleccionada' : '<i class="bi bi-arrow-repeat me-1"></i>Seleccionar'}
                        </button>
                      </div>
                    </article>
                  </div>
                `;
                })
                .join('')}
            </div>
          </div>
          <div class="modal-footer border-0 pt-0">
            <button type="button" class="btn btn-outline-secondary rounded-pill px-4" data-bs-dismiss="modal">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  `;
}
