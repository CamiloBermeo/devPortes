
//implementacion para que el boton de FAQ no pise el footer
customElements.whenDefined('app-footer').then(() => {
    const footer = document.querySelector('app-footer footer');
    const root = document.documentElement;
    function ajustarFAQ() {
        if (!footer) return;
        const alturaFooter = footer.offsetHeight;
        root.style.setProperty(
            '--faq-bottom',
            `${alturaFooter + 16}px`
        );
    }
    ajustarFAQ();
    window.addEventListener('resize', ajustarFAQ);
});


//implementacion de formspree
const form = document.getElementById("form");
form.addEventListener("submit", handleSubmit)


async function handleSubmit(event) {
    event.preventDefault();
    const formulario = event.target;
    const datos = new FormData(formulario);
    const response = await fetch(formulario.action, {
        method: formulario.method,
        body: datos,
        headers: {
            "Accept": "application/json"
        }
    });
    if (response.ok) {
        formulario.reset();
        Swal.fire({
            title: "¡Mensaje enviado!",
            text: "Nos pondremos en contacto contigo pronto.",
            icon: "success"
        });
    }
}
