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
    const nombre = document.getElementById("nombre");
    const categoria = document.getElementById("categoria");
    const telefono = document.getElementById("telefono");
    const correo = document.getElementById("correo");
    const asunto = document.getElementById("asunto");
    const mensaje = document.getElementById("mensaje");
    let formularioValido = true;

    if (form) {
        form.addEventListener('submit', handleSubmit);
    }
    function mostrarError(input, mensaje) {
        formularioValido = false;

        input.classList.add("is-invalid");
        input.classList.remove("is-valid");
        let feedback = input.parentNode.querySelector(".invalid-feedback");
        if (!feedback) {
            feedback = document.createElement("div");
            feedback.classList.add("invalid-feedback");
            input.parentNode.appendChild(feedback);
        }
        feedback.textContent = mensaje;
    }
    function mostrarValido(input) {
        input.classList.remove("is-invalid");
        input.classList.add("is-valid");
        const feedback = input.parentNode.querySelector(".invalid-feedback");
        if (feedback) {
            feedback.remove();
        }
    }
    async function handleSubmit(event) {
        event.preventDefault();
        
        //VALIDACIONES↓
        //nombre
        if (nombre.value.trim() === "") {
            mostrarError(nombre, "¡Upsss, este campo no puede estar vacio 😬!");
        } else if (nombre.value.length < 2) {
            mostrarError(nombre, "El nombre debe tener al menos 2 caracteres.");
        } else if (nombre.value.length > 40) {
            mostrarError(nombre, "El nombre no puede superar los 40 caracteres.");
        } else {
            mostrarValido(nombre);
        }

        //categoria
        if (categoria.value.trim() === "") {
            mostrarError(categoria, "Seguro querrás categorizarla 🙄");
        } else {
            mostrarValido(categoria);
        }

        //telefono
        const regexTelefono = /^\d+$/;
        if (telefono.value.trim() === "") {
            mostrarError(telefono, "¡Nos encantaría llamarte 😢!");
        } else if (!regexTelefono.test(telefono.value)) {
            mostrarError(telefono, "Debes digitar valores numéricos 😢!");
        } else if (telefono.value.length !== 10) {
            mostrarError(telefono, "Tu telefono debe tener 10 digitos 🫠!");
        } else {
            mostrarValido(telefono);
        }

        //correo
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (correo.value.trim() === "") {
            mostrarError(correo, "¡Déjanos tu correo para responder 😢!")
        } else if (!regexEmail.test(correo.value)) {
            mostrarError(correo, "Por favor, escribe un correo electrónico válido 📧!");
        } else {
            mostrarValido(correo);
        }

        //asunto
        const regexTieneLetras = /[a-zA-ZáéíóúÁÉÍÓÚñÑ]/;
        if (asunto.value.trim() === "") {
            mostrarError(asunto, "¿Sobre qué es tu consulta? 🤔")
        } else if (!regexTieneLetras.test(asunto.value)) {
            mostrarError(asunto, "El asunto debe incluir texto explicativo, no solo números o símbolos ✍️");
        } else if (asunto.value.length < 8) {
            mostrarError(asunto, "Mínimo 8 caracteres 🤗")
        } else if (asunto.value.length > 35) {
            mostrarError(asunto, "Máximo 35 caracteres 😬")
        } else {
            mostrarValido(asunto);
        }

        //mensaje
        if (mensaje.value.trim() === "") {
            mostrarError(mensaje, "¡El mensaje no puede estar vacío 😶!")            
        }else if (mensaje.value.length < 8) {
            mostrarError(mensaje, "Mínimo 8 caracteres 🤗")
        }else if (!regexTieneLetras.test(mensaje.value)) {
            mostrarError(mensaje, "El mensaje debe incluir texto explicativo, no solo números o símbolos ✍️");
        }else {
            mostrarValido(mensaje);
        }

        const formulario = event.target;
        const datos = new FormData(formulario);
        if (formularioValido) {
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

    }
});
