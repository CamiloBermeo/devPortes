
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


//implementacion de formspree y validaciones de campos
const form = document.getElementById("form");
form.addEventListener("submit", handleSubmit)
const nombre = document.getElementById("nombre");
const categoria = document.getElementById("categoria");
const telefono = document.getElementById("telefono");
const correo = document.getElementById("correo");
const asunto = document.getElementById("asunto");
const mensaje = document.getElementById("mensaje");

function mostrarError(input, mensaje){
    input.classList.add("is-invalid");
    input.classList.remove("is-valid");

    let feedback = input.parentNode.querySelector(".invalid-feedback");
    if(!feedback){
        feedback = document.createElement("div");
        feedback.classList.add("invalid-feedback");
        input.parentNode.appendChild(feedback);
    }
    feedback.textContent = mensaje;
}

async function handleSubmit(event) {
    event.preventDefault();
    if(nombre.value.trim()==""){
        mostrarError(nombre, "¡Upsss, este campo no puede estar vacio 😬!")        
    }
    if(categoria.value.trim()==""){
        mostrarError(categoria, "Seguro querrás categorizarla 🙄")        
    }
    if(telefono.value.trim()==""){
        mostrarError(telefono, "¡Nos encantaría llamarte 😢!")        
    }
    if(correo.value.trim()==""){
        mostrarError(correo, "¡Nos encantaría escribirte 😢!")        
    }
    if(asunto.value.trim()==""){
        mostrarError(asunto, "¿Sobre qué es tu consulta? 🤔")        
    }
    if(mensaje.value.trim()==""){
        mostrarError(mensaje, "¡Anímate a escribirnos 😁!")        
    }
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

