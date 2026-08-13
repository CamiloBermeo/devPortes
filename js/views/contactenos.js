document.addEventListener('DOMContentLoaded', () => {
  // 1. Ajuste dinámico del botón FAQ sobre el footer
  customElements.whenDefined('app-footer').then(() => {
    const footer = document.querySelector('app-footer footer') || document.querySelector('app-footer');
    const root = document.documentElement;

    if (!footer) return;

    function calcularDesplazamientoFAQ() {
      const footerRect = footer.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Si la parte superior del footer entra en la zona visible de la pantalla
      if (footerRect.top < windowHeight) {
        const overlap = windowHeight - footerRect.top;
        root.style.setProperty('--faq-offset', `${overlap}px`);
      } else {
        root.style.setProperty('--faq-offset', '0px');
      }
    }

    window.addEventListener('scroll', calcularDesplazamientoFAQ, { passive: true });
    window.addEventListener('resize', calcularDesplazamientoFAQ, { passive: true });

    calcularDesplazamientoFAQ();
  });

  // 2. Manejo del Formulario con Formspree
  const form = document.getElementById('form');

  if (form) {
    form.addEventListener('submit', handleSubmit);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const formulario = event.target;
    const datos = new FormData(formulario);

    try {
      const response = await fetch(formulario.action, {
        method: formulario.method,
        body: datos,
        headers: {
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        formulario.reset();
        Swal.fire({
          title: '¡Mensaje enviado!',
          text: 'Nos pondremos en contacto contigo pronto.',
          icon: 'success',
          confirmButtonColor: 'var(--color-primario, #28a745)',
        });
      } else {
        throw new Error('Respuesta no válida del servidor');
      }
    } catch (error) {
      Swal.fire({
        title: 'Error de envío',
        text: 'Ocurrió un problema al enviar tu mensaje. Inténtalo de nuevo.',
        icon: 'error',
      });
    }
  }
});
