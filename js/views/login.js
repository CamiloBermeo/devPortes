document.addEventListener ('DOMContentLoaded', () => {

    // --- Elementos para alternar entre el panel de Login y Registro ---
    const tarjetaAutenticacion = document.getElementById ('tarjetaAutenticacion');
    const btnIrARegistro = document.getElementById ('btnIrARegistro');
    const btnIrAInicioSesion = document.getElementById ('btnIrAInicioSesion');
    const btnRegistroMovil = document.getElementById ('btnRegistroMovil');
    const btnInicioSesionMovil = document.getElementById ('btnInicioSesionMovil');

    // Cambiar a la vista de registro en pantalla grande
    btnIrARegistro?.addEventListener ('click', () => {
        tarjetaAutenticacion.classList.add ('register-active');
    });

    // Volver a la vista de inicio de sesión en pantalla grande
    btnIrAInicioSesion?.addEventListener ('click', () => {
        tarjetaAutenticacion.classList.remove ('register-active');
    });

    // Navegación rápida para pantallas móviles
    btnRegistroMovil?.addEventListener ('click', () => {
        tarjetaAutenticacion.classList.add ('register-active');
    });

    btnInicioSesionMovil?.addEventListener ('click', () => {
        tarjetaAutenticacion.classList.remove ('register-active');
    });

    // --- Expresiones regulares y utilidades visuales ---
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,50}$/;
    const regexCedula = /^\d{6,11}$/;       // Acepta entre 6 y 11 números
    const regexTelefono = /^\d{7,10}$/;     // Acepta entre 7 y 10 números

    // Muestra el borde rojo y el texto de error correspondiente
    function marcarInvalido (inputElement, mensaje) {
        const fieldGroup = inputElement.closest ('.field-group');
        if (!fieldGroup) return;

        fieldGroup.classList.remove ('is-valid');
        fieldGroup.classList.add ('is-invalid');

        const tooltip = fieldGroup.querySelector ('.tooltip-error');
        if (tooltip && mensaje) {
            tooltip.textContent = mensaje;
        }
    }

    // Marca el campo como correcto (borde verde)
    function marcarValido (inputElement) {
        const fieldGroup = inputElement.closest ('.field-group');
        if (!fieldGroup) return;

        fieldGroup.classList.remove ('is-invalid');
        fieldGroup.classList.add ('is-valid');
    }

    // Remueve letras o caracteres especiales para campos que son puramente numéricos
    function permitirSoloNumeros (inputElement) {
        inputElement.value = inputElement.value.replace (/\D/g, '');
    }

    // Limpia los estados de validación cuando reiniciamos el formulario
    function limpiarErroresFormulario () {
        document.querySelectorAll ('.field-group').forEach (group => {
            group.classList.remove ('is-invalid', 'is-valid');
        });
    }

    // --- Referencias a las entradas de los formularios ---
    // Formulario de Inicio de Sesión
    const formLogin = document.getElementById ('formularioInicioSesion');
    const inputCorreoLogin = document.getElementById ('campoCorreoInicioSesion');
    const inputPassLogin = document.getElementById ('campoContrasenaInicioSesion');
    const checkRecordarme = document.getElementById ('checkRecordarme');

    // Formulario de Registro
    const formRegistro = document.getElementById ('formularioRegistro');
    const inputNombreReg = document.getElementById ('campoNombreRegistro');
    const inputCedulaReg = document.getElementById ('campoCedulaRegistro');
    const inputTelefonoReg = document.getElementById ('campoTelefonoRegistro');
    const inputCorreoReg = document.getElementById ('campoCorreoRegistro');
    const inputPassReg = document.getElementById ('campoContrasenaRegistro');
    const inputConfirmPassReg = document.getElementById ('campoConfirmarContrasenaRegistro');
    const checkTerminosReg = document.getElementById ('checkTerminosRegistro');

    // --- Manejo de LocalStorage (persistencia de datos local) ---
    const KEY_BORRADOR_REGISTRO = 'devportes_borrador_registro';
    const KEY_USUARIOS_BD = 'devportes_usuarios';
    const KEY_RECORDAR_CORREO = 'devportes_correo_recordado';

    // Recupera la lista de usuarios guardados previamente
    function obtenerUsuariosGuardados () {
        const data = localStorage.getItem (KEY_USUARIOS_BD);
        return data ? JSON.parse (data) : [];
    }

    // Auto-guardado para que el usuario no pierda lo que escribió si recarga la página sin querer
    function guardarBorradorRegistro () {
        const borrador = {
            nombre: inputNombreReg.value,
            cedula: inputCedulaReg.value,
            telefono: inputTelefonoReg.value,
            correo: inputCorreoReg.value
        };
        localStorage.setItem (KEY_BORRADOR_REGISTRO, JSON.stringify (borrador));
    }

    // Restaura datos al cargar la app
    function cargarDatosLocalStorage () {
        // Carga el borrador del registro
        const borradorGuardado = localStorage.getItem (KEY_BORRADOR_REGISTRO);
        if (borradorGuardado) {
            const datos = JSON.parse (borradorGuardado);
            if (datos.nombre) inputNombreReg.value = datos.nombre;
            if (datos.cedula) inputCedulaReg.value = datos.cedula;
            if (datos.telefono) inputTelefonoReg.value = datos.telefono;
            if (datos.correo) inputCorreoReg.value = datos.correo;
        }

        // Si guardó su correo en el login anteriormente, lo colocamos de una
        const correoRecordado = localStorage.getItem (KEY_RECORDAR_CORREO);
        if (correoRecordado) {
            inputCorreoLogin.value = correoRecordado;
            if (checkRecordarme) checkRecordarme.checked = true;
        }
    }

    // Borra el borrador del registro cuando el usuario completa el proceso con éxito
    function borrarBorradorRegistro () {
        localStorage.removeItem (KEY_BORRADOR_REGISTRO);
    }

    // --- Validaciones campo por campo ---

    function validarNombre () {
        const valor = inputNombreReg.value.trim ();
        if (valor === '') {
            marcarInvalido (inputNombreReg, 'El nombre es obligatorio');
            return false;
        } else if (!regexNombre.test (valor)) {
            marcarInvalido (inputNombreReg, 'Usa solo letras (mín. 3)');
            return false;
        }
        marcarValido (inputNombreReg);
        return true;
    }

    function validarCedula () {
        permitirSoloNumeros (inputCedulaReg);
        const valor = inputCedulaReg.value.trim ();
        if (valor === '') {
            marcarInvalido (inputCedulaReg, 'La cédula es requerida');
            return false;
        } else if (!regexCedula.test (valor)) {
            marcarInvalido (inputCedulaReg, 'Entre 6 y 11 números');
            return false;
        }
        marcarValido (inputCedulaReg);
        return true;
    }

    function validarTelefono () {
        permitirSoloNumeros (inputTelefonoReg);
        const valor = inputTelefonoReg.value.trim ();
        if (valor === '') {
            marcarInvalido (inputTelefonoReg, 'Teléfono requerido');
            return false;
        } else if (!regexTelefono.test (valor)) {
            marcarInvalido (inputTelefonoReg, '7 a 10 dígitos');
            return false;
        }
        marcarValido (inputTelefonoReg);
        return true;
    }

    function validarCorreoRegistro () {
        const valor = inputCorreoReg.value.trim ().toLowerCase ();
        if (valor === '') {
            marcarInvalido (inputCorreoReg, 'Correo requerido');
            return false;
        } else if (!regexEmail.test (valor)) {
            marcarInvalido (inputCorreoReg, 'Ingresa un correo válido');
            return false;
        }

        // Revisamos que no intente registrar un correo que ya exista
        const usuarios = obtenerUsuariosGuardados ();
        const existe = usuarios.some (u => u.correo === valor);
        if (existe) {
            marcarInvalido (inputCorreoReg, 'Este correo ya está registrado');
            return false;
        }

        marcarValido (inputCorreoReg);
        return true;
    }

    // Evalúa los requisitos estándar de seguridad para la contraseña
    function evaluarSeguridadPass (valor) {
        if (valor === '') return 'Contraseña requerida';
        if (valor.length < 8) return 'Mínimo 8 caracteres';
        if (!/[A-Z]/.test (valor)) return 'Incluye una mayúscula (A-Z)';
        if (!/[a-z]/.test (valor)) return 'Incluye una minúscula (a-z)';
        if (!/\d/.test (valor)) return 'Incluye al menos un número';
        if (!/[@$!%*?&.#\-_]/.test (valor)) return 'Incluye un símbolo (@, $, !, %, etc.)';
        return null;
    }

    function validarPassRegistro () {
        const valor = inputPassReg.value;
        const errorSeguridad = evaluarSeguridadPass (valor);

        if (errorSeguridad) {
            marcarInvalido (inputPassReg, errorSeguridad);
            return false;
        }

        marcarValido (inputPassReg);

        // Si ya hay algo en la confirmación, revalidamos para verificar coincidencia
        if (inputConfirmPassReg.value.length > 0) {
            validarCoincidenciaPass ();
        }
        return true;
    }

    function validarCoincidenciaPass () {
        const pass = inputPassReg.value;
        const confirmPass = inputConfirmPassReg.value;

        if (confirmPass === '') {
            marcarInvalido (inputConfirmPassReg, 'Confirma tu contraseña');
            return false;
        }
        if (pass !== confirmPass) {
            marcarInvalido (inputConfirmPassReg, 'Las contraseñas no coinciden');
            return false;
        }

        marcarValido (inputConfirmPassReg);
        return true;
    }

    function validarTerminos () {
        if (!checkTerminosReg.checked) {
            marcarInvalido (checkTerminosReg, 'Debes aceptar los términos');
            return false;
        }
        marcarValido (checkTerminosReg);
        return true;
    }

    function validarCorreoLogin () {
        const valor = inputCorreoLogin.value.trim ();
        if (valor === '') {
            marcarInvalido (inputCorreoLogin, 'Ingresa tu correo');
            return false;
        } else if (!regexEmail.test (valor)) {
            marcarInvalido (inputCorreoLogin, 'Correo no válido');
            return false;
        }
        marcarValido (inputCorreoLogin);
        return true;
    }

    function validarPassLogin () {
        const valor = inputPassLogin.value;
        if (valor === '') {
            marcarInvalido (inputPassLogin, 'Ingresa tu contraseña');
            return false;
        }
        marcarValido (inputPassLogin);
        return true;
    }

    // --- Listeners para validar y guardar borrador mientras el usuario escribe ---
    // En el formulario de registro
    inputNombreReg?.addEventListener ('input', () => {
        validarNombre ();
        guardarBorradorRegistro ();
    });
    inputCedulaReg?.addEventListener ('input', () => {
        validarCedula ();
        guardarBorradorRegistro ();
    });
    inputTelefonoReg?.addEventListener ('input', () => {
        validarTelefono ();
        guardarBorradorRegistro ();
    });
    inputCorreoReg?.addEventListener ('input', () => {
        validarCorreoRegistro ();
        guardarBorradorRegistro ();
    });
    inputPassReg?.addEventListener ('input', validarPassRegistro);
    inputConfirmPassReg?.addEventListener ('input', validarCoincidenciaPass);
    checkTerminosReg?.addEventListener ('change', validarTerminos);

    // En el formulario de inicio de sesión
    inputCorreoLogin?.addEventListener ('input', validarCorreoLogin);
    inputPassLogin?.addEventListener ('input', validarPassLogin);

    // --- Procesamiento de formularios al enviar ---

    // Envío del registro
    formRegistro?.addEventListener ('submit', (e) => {
        e.preventDefault ();

        const esNombreValido = validarNombre ();
        const esCedulaValida = validarCedula ();
        const esTelefonoValido = validarTelefono ();
        const esCorreoValido = validarCorreoRegistro ();
        const esPassValida = validarPassRegistro ();
        const esConfirmValida = validarCoincidenciaPass ();
        const esTerminosValido = validarTerminos ();

        if (esNombreValido && esCedulaValida && esTelefonoValido && esCorreoValido && esPassValida && esConfirmValida && esTerminosValido) {

            const usuarios = obtenerUsuariosGuardados ();

            const nuevoUsuario = {
                id: Date.now (),
                nombre: inputNombreReg.value.trim (),
                cedula: inputCedulaReg.value.trim (),
                telefono: inputTelefonoReg.value.trim (),
                correo: inputCorreoReg.value.trim ().toLowerCase (),
                password: inputPassReg.value
            };

            usuarios.push (nuevoUsuario);
            localStorage.setItem (KEY_USUARIOS_BD, JSON.stringify (usuarios));

            // Limpiamos borrador y campos
            borrarBorradorRegistro ();
            formRegistro.reset ();
            limpiarErroresFormulario ();

            alert (`¡Registro exitoso, ${nuevoUsuario.nombre}! Tu cuenta fue guardada en el sistema.`);

            // Pasamos al panel de login con el correo prellenado
            inputCorreoLogin.value = nuevoUsuario.correo;
            tarjetaAutenticacion.classList.remove ('register-active');
        }
    });

    // Envío del inicio de sesión
    formLogin?.addEventListener ('submit', (e) => {
        e.preventDefault ();

        const esCorreoValido = validarCorreoLogin ();
        const esPassValida = validarPassLogin ();

        if (esCorreoValido && esPassValida) {
            const correoIngresado = inputCorreoLogin.value.trim ().toLowerCase ();
            const passIngresada = inputPassLogin.value;

            const usuarios = obtenerUsuariosGuardados ();
            const usuarioEncontrado = usuarios.find (
                user => user.correo === correoIngresado && user.password === passIngresada
            );

            if (usuarioEncontrado) {
                // Guardamos o borramos preferencia de recordar correo
                if (checkRecordarme && checkRecordarme.checked) {
                    localStorage.setItem (KEY_RECORDAR_CORREO, correoIngresado);
                } else {
                    localStorage.removeItem (KEY_RECORDAR_CORREO);
                }

                // Guardamos datos de sesión activa
                localStorage.setItem ('devportes_sesion_activa', JSON.stringify ({
                    nombre: usuarioEncontrado.nombre,
                    correo: usuarioEncontrado.correo
                }));

                alert (`¡Bienvenido de nuevo, ${usuarioEncontrado.nombre}!`);
            } else {
                marcarInvalido (inputCorreoLogin, 'Credenciales incorrectas');
                marcarInvalido (inputPassLogin, 'Verifica tu contraseña');
            }
        }
    });

    // --- Interacción para mostrar u ocultar contraseña con el botón del ojito ---
    document.querySelectorAll ('.btn-toggle-password').forEach (btn => {
        btn.addEventListener ('click', () => {
            const input = btn.parentElement.querySelector ('input');
            const icon = btn.querySelector ('i');

            if (!input || !icon) return;

            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.replace ('bi-eye', 'bi-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.replace ('bi-eye-slash', 'bi-eye');
            }
        });
    });

    // Cargar borradores o datos de inicio al arrancar la vista
    cargarDatosLocalStorage ();

});