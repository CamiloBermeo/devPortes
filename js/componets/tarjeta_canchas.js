export function renderizarInstalaciones(canchas, contenedorId = 'contenedor-instalaciones') {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor || canchas.length === 0) return;

  const principal = canchas[0];
  const secundarias = canchas.slice(1);

  const htmlPrincipal = `
    <div class="col-12 col-md-5 d-flex flex-column">
      <article class="gallery-img-container shadow-sm cursor-pointer gallery-img-main grow" data-bs-toggle="modal" data-bs-target="#modalCancha${principal.id}">
        <img src="${principal.imagen}" alt="${principal.titulo}" />
        <div class="gallery-badge">
          <span>Ver Cancha</span>
          <small>Haz clic para ver detalles &rarr;</small>
        </div>
      </article>
    </div>
  `;

  const htmlSecundarias = secundarias
    .map((cancha, index) => {
      const esGrayscale = index === 3 ? 'img-grayscale' : '';
      return `
        <div class="col-6">
          <article class="gallery-img-container shadow-sm cursor-pointer gallery-img-sub ${esGrayscale}" data-bs-toggle="modal" data-bs-target="#modalCancha${cancha.id}">
            <img src="${cancha.imagen}" alt="${cancha.titulo}" />
            <div class="gallery-badge">
              <span>Ver Cancha</span>
              <small>Haz clic para ver detalles &rarr;</small>
            </div>
          </article>
        </div>
      `;
    })
    .join('');

  contenedor.innerHTML = `
    ${htmlPrincipal}
    <div class="col-12 col-md-7">
      <div class="row g-3">${htmlSecundarias}</div>
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
                <span class="badge bg-brand-mid-green mb-3 px-2.5 py-1.5 fw-semibold">${cancha.superficie}</span>
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
                <a href="./pages/reservas.html?id=${cancha.id}&titulo=${encodeURIComponent(cancha.titulo)}&tipo=${encodeURIComponent(cancha.tipo)}&superficie=${encodeURIComponent(cancha.superficie)}&precio=${encodeURIComponent(cancha.precio)}&imagen=${encodeURIComponent(cancha.imagen)}" class="btn btn-brand rounded-pill px-4 py-2 small text-nowrap transition-base text-sm-custom">
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
