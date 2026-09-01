import { registrarUsuario, iniciarSesion } from '../api/auth.js';
import { regexNombre, regexCedula, regexTelefono, regexCorreo, LONGITUD, soloNumeros, validarLongitud } from '../utils/validaciones.js';

document.addEventListener('DOMContentLoaded', () => {
  /* ==========================================================
     Auto-abrir pestaña de registro si ?tab=register
     ========================================================== */
  const params = new URLSearchParams(window.location.search);
  if (params.get('tab') === 'register') {
    document.getElementById('btnIrARegistro')?.click();
  }

  /* ==========================================================
     (INICIO DE SESIÓN <-> REGISTRO)
     ========================================================== */
  const tarjetaAutenticacion = document.getElementById('tarjetaAutenticacion');
  const btnIrARegistro = document.getElementById('btnIrARegistro');
  const btnIrAInicioSesion = document.getElementById('btnIrAInicioSesion');
  const btnRegistroMovil = document.getElementById('btnRegistroMovil');
  const btnInicioSesionMovil = document.getElementById('btnInicioSesionMovil');

  btnIrARegistro?.addEventListener('click', () => {
    tarjetaAutenticacion.classList.add('register-active');
  });

  btnIrAInicioSesion?.addEventListener('click', () => {
    tarjetaAutenticacion.classList.remove('register-active');
  });

  btnRegistroMovil?.addEventListener('click', () => {
    tarjetaAutenticacion.classList.add('register-active');
  });

  btnInicioSesionMovil?.addEventListener('click', () => {
    tarjetaAutenticacion.classList.remove('register-active');
  });

  /* ==========================================================
     EXPRESIONES REGULARES Y FUNCIONES AUXILIARES
     ========================================================== */
  function marcarInvalido(inputElement, mensaje) {
    const fieldGroup = inputElement.closest('.field-group');
    if (!fieldGroup) return;

    fieldGroup.classList.remove('is-valid');
    fieldGroup.classList.add('is-invalid');

    const tooltip = fieldGroup.querySelector('.tooltip-error');
    if (tooltip && mensaje) {
      tooltip.textContent = mensaje;
    }
  }

  function marcarValido(inputElement) {
    const fieldGroup = inputElement.closest('.field-group');
    if (!fieldGroup) return;

    fieldGroup.classList.remove('is-invalid');
    fieldGroup.classList.add('is-valid');
  }

  function permitirSoloNumeros(inputElement) {
    soloNumeros(inputElement);
  }

  function limpiarErroresFormulario() {
    document.querySelectorAll('.field-group').forEach((group) => {
      group.classList.remove('is-invalid', 'is-valid');
    });
  }

  /* ==========================================================
     REFERENCIAS A ELEMENTOS DEL FORMULARIO
     ========================================================== */
  // --- Login ---
  const formLogin = document.getElementById('formularioInicioSesion');
  const inputCorreoLogin = document.getElementById('campoCorreoInicioSesion');
  const inputPassLogin = document.getElementById('campoContrasenaInicioSesion');
  const checkRecordarme = document.getElementById('checkRecordarme');

  // --- Registro ---
  const formRegistro = document.getElementById('formularioRegistro');
  const inputNombreReg = document.getElementById('campoNombreRegistro');
  const inputCedulaReg = document.getElementById('campoCedulaRegistro');
  const inputTelefonoReg = document.getElementById('campoTelefonoRegistro');
  const inputCorreoReg = document.getElementById('campoCorreoRegistro');
  const inputPassReg = document.getElementById('campoContrasenaRegistro');
  const inputConfirmPassReg = document.getElementById('campoConfirmarContrasenaRegistro');
  const checkTerminosReg = document.getElementById('checkTerminosRegistro');

  /* ==========================================================
      LOCALSTORAGE (PERSISTENCIA Y USUARIOS)
     ========================================================== */
  const KEY_BORRADOR_REGISTRO = 'devportes_borrador_registro';
  const KEY_USUARIOS_BD = 'devportes_usuarios';
  const KEY_RECORDAR_CORREO = 'devportes_correo_recordado';

  function obtenerUsuariosGuardados() {
    const data = localStorage.getItem(KEY_USUARIOS_BD);
    return data ? JSON.parse(data) : [];
  }

  function guardarBorradorRegistro() {
    const borrador = {
      nombre: inputNombreReg.value,
      cedula: inputCedulaReg.value,
      telefono: inputTelefonoReg.value,
      correo: inputCorreoReg.value,
    };
    localStorage.setItem(KEY_BORRADOR_REGISTRO, JSON.stringify(borrador));
  }

  function cargarDatosLocalStorage() {
    const borradorGuardado = localStorage.getItem(KEY_BORRADOR_REGISTRO);
    if (borradorGuardado) {
      const datos = JSON.parse(borradorGuardado);
      if (datos.nombre) inputNombreReg.value = datos.nombre;
      if (datos.cedula) inputCedulaReg.value = datos.cedula;
      if (datos.telefono) inputTelefonoReg.value = datos.telefono;
      if (datos.correo) inputCorreoReg.value = datos.correo;
    }

    const correoRecordado = localStorage.getItem(KEY_RECORDAR_CORREO);
    if (correoRecordado) {
      inputCorreoLogin.value = correoRecordado;
      if (checkRecordarme) checkRecordarme.checked = true;
    }
  }

  function borrarBorradorRegistro() {
    localStorage.removeItem(KEY_BORRADOR_REGISTRO);
  }

  /* ==========================================================
     VALIDACIONES INDIVIDUALES POR CAMPO
     ========================================================== */

  function validarNombre() {
    const valor = inputNombreReg.value.trim();
    if (valor === '') {
      marcarInvalido(inputNombreReg, 'El nombre es obligatorio');
      return false;
    } else if (!regexNombre.test(valor)) {
      marcarInvalido(inputNombreReg, 'Usa solo letras');
      return false;
    } else if (!validarLongitud(valor, LONGITUD.nombre)) {
      marcarInvalido(inputNombreReg, `Entre ${LONGITUD.nombre.min} y ${LONGITUD.nombre.max} caracteres`);
      return false;
    }
    marcarValido(inputNombreReg);
    return true;
  }

  function validarCedula() {
    permitirSoloNumeros(inputCedulaReg);
    const valor = inputCedulaReg.value.trim();
    if (valor === '') {
      marcarInvalido(inputCedulaReg, 'La cédula es requerida');
      return false;
    } else if (!regexCedula.test(valor)) {
      marcarInvalido(inputCedulaReg, 'Solo números');
      return false;
    } else if (!validarLongitud(valor, LONGITUD.cedula)) {
      marcarInvalido(inputCedulaReg, `Entre ${LONGITUD.cedula.min} y ${LONGITUD.cedula.max} dígitos`);
      return false;
    }
    marcarValido(inputCedulaReg);
    return true;
  }

  function validarTelefono() {
    permitirSoloNumeros(inputTelefonoReg);
    const valor = inputTelefonoReg.value.trim();
    if (valor === '') {
      marcarInvalido(inputTelefonoReg, 'Teléfono requerido');
      return false;
    } else if (!regexTelefono.test(valor)) {
      marcarInvalido(inputTelefonoReg, `${LONGITUD.telefono.max} dígitos exactos`);
      return false;
    }
    marcarValido(inputTelefonoReg);
    return true;
  }

  function validarCorreoRegistro() {
    const valor = inputCorreoReg.value.trim().toLowerCase();
    if (valor === '') {
      marcarInvalido(inputCorreoReg, 'Correo requerido');
      return false;
    } else if (!regexCorreo.test(valor)) {
      marcarInvalido(inputCorreoReg, 'Ingresa un correo válido');
      return false;
    }

    const usuarios = obtenerUsuariosGuardados();
    const existe = usuarios.some((u) => u.correo === valor);
    if (existe) {
      marcarInvalido(inputCorreoReg, 'Este correo ya está registrado');
      return false;
    }

    marcarValido(inputCorreoReg);
    return true;
  }

  // --- CONTRASEÑA SEGURA CON PARÁMETROS ESTÁNDAR ---
  function validarPassRegistro() {
    const valor = inputPassReg.value;

    if (valor === '') {
      marcarInvalido(inputPassReg, 'Contraseña requerida');
      return false;
    }
    if (valor.length < 8) {
      marcarInvalido(inputPassReg, 'Mínimo 8 caracteres');
      return false;
    }
    if (!/[A-Z]/.test(valor)) {
      marcarInvalido(inputPassReg, 'Incluye una mayúscula (A-Z)');
      return false;
    }
    if (!/[a-z]/.test(valor)) {
      marcarInvalido(inputPassReg, 'Incluye una minúscula (a-z)');
      return false;
    }
    if (!/\d/.test(valor)) {
      marcarInvalido(inputPassReg, 'Incluye al menos un número');
      return false;
    }
    if (!/[-@$!%*?&#._]/.test(valor)) {
      marcarInvalido(inputPassReg, 'Incluye un símbolo (@, $, !, %, etc.)');
      return false;
    }

    marcarValido(inputPassReg);
    return true;
  }

  // --- CONFIRMAR CONTRASEÑA ---
  function validarCoincidenciaPass() {
    const pass = inputPassReg.value;
    const confirmPass = inputConfirmPassReg.value;

    if (confirmPass === '') {
      marcarInvalido(inputConfirmPassReg, 'Confirma tu contraseña');
      return false;
    }
    if (pass !== confirmPass) {
      marcarInvalido(inputConfirmPassReg, 'Las contraseñas no coinciden');
      return false;
    }

    if (!validarPassRegistro()) {
      marcarInvalido(inputConfirmPassReg, 'La contraseña no es segura');
      return false;
    }

    marcarValido(inputConfirmPassReg);
    return true;
  }

  function validarTerminos() {
    if (!checkTerminosReg.checked) {
      marcarInvalido(checkTerminosReg, 'Debes aceptar los términos');
      return false;
    }
    marcarValido(checkTerminosReg);
    return true;
  }

  function validarCorreoLogin() {
    const valor = inputCorreoLogin.value.trim();
    if (valor === '') {
      marcarInvalido(inputCorreoLogin, 'Ingresa tu correo');
      return false;
    } else if (!regexCorreo.test(valor)) {
      marcarInvalido(inputCorreoLogin, 'Correo no válido');
      return false;
    }
    marcarValido(inputCorreoLogin);
    return true;
  }

  function validarPassLogin() {
    const valor = inputPassLogin.value;
    if (valor === '') {
      marcarInvalido(inputPassLogin, 'Ingresa tu contraseña');
      return false;
    }
    marcarValido(inputPassLogin);
    return true;
  }

  /* ==========================================================
     LISTENERS EN TIEMPO REAL
     ========================================================== */
  // Registro
  inputNombreReg?.addEventListener('input', () => {
    validarNombre();
    guardarBorradorRegistro();
  });
  inputCedulaReg?.addEventListener('input', () => {
    validarCedula();
    guardarBorradorRegistro();
  });
  inputTelefonoReg?.addEventListener('input', () => {
    validarTelefono();
    guardarBorradorRegistro();
  });
  inputCorreoReg?.addEventListener('input', () => {
    validarCorreoRegistro();
    guardarBorradorRegistro();
  });
  inputPassReg?.addEventListener('input', validarPassRegistro);
  inputConfirmPassReg?.addEventListener('input', validarCoincidenciaPass);
  checkTerminosReg?.addEventListener('change', validarTerminos);

  // Login
  inputCorreoLogin?.addEventListener('input', validarCorreoLogin);
  inputPassLogin?.addEventListener('input', validarPassLogin);

  /* ==========================================================
     ENVÍO DE FORMULARIOS (SUBMIT)
     ========================================================== */

  // --- SUBMIT REGISTRO ---
  formRegistro?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const esNombreValido = validarNombre();
    const esCedulaValida = validarCedula();
    const esTelefonoValido = validarTelefono();
    const esCorreoValido = validarCorreoRegistro();
    const esPassValida = validarPassRegistro();
    const esConfirmValida = validarCoincidenciaPass();
    const esTerminosValido = validarTerminos();

    if (
      esNombreValido &&
      esCedulaValida &&
      esTelefonoValido &&
      esCorreoValido &&
      esPassValida &&
      esConfirmValida &&
      esTerminosValido
    ) {
      const datosRegistro = {
        name: inputNombreReg.value.trim(),
        identityDocument: inputCedulaReg.value.trim(),
        phoneNumber: inputTelefonoReg.value.trim(),
        email: inputCorreoReg.value.trim().toLowerCase(),
        password: inputPassReg.value,
      };

      try {
        const respuesta = await registrarUsuario(datosRegistro);

        const userProfile = {
          nombre: respuesta.nameUser || datosRegistro.name,
          correo: respuesta.email || datosRegistro.email,
          cedula: datosRegistro.identityDocument,
          telefono: datosRegistro.phoneNumber
        };

        localStorage.setItem('devportes_token', respuesta.token || 'local-token');
        localStorage.setItem('devportes_sesion_activa', JSON.stringify(userProfile));
        document.dispatchEvent(new CustomEvent('session-change'));

        borrarBorradorRegistro();
        formRegistro.reset();
        limpiarErroresFormulario();

        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect');
        if (redirect === 'reservas') {
          const params = new URLSearchParams(window.location.search);
          params.delete('redirect');
          params.delete('tab');
          window.location.href = `../pages/reservas.html?${params.toString()}`;
        } else {
          window.location.href = '../index.html';
        }
      } catch {
        const usuarios = obtenerUsuariosGuardados();
        const nuevoUsuario = {
          id: Date.now(),
          nombre: datosRegistro.name,
          cedula: datosRegistro.identityDocument,
          telefono: datosRegistro.phoneNumber,
          correo: datosRegistro.email,
          password: datosRegistro.password,
        };

        if (usuarios.some((u) => u.correo === nuevoUsuario.correo)) {
          marcarInvalido(inputCorreoReg, 'Este correo ya está registrado');
          return;
        }

        usuarios.push(nuevoUsuario);
        localStorage.setItem(KEY_USUARIOS_BD, JSON.stringify(usuarios));

        const userProfile = {
          nombre: nuevoUsuario.nombre,
          correo: nuevoUsuario.correo,
          cedula: nuevoUsuario.cedula,
          telefono: nuevoUsuario.telefono
        };

        localStorage.setItem('devportes_token', 'local-token');
        localStorage.setItem('devportes_sesion_activa', JSON.stringify(userProfile));
        document.dispatchEvent(new CustomEvent('session-change'));

        borrarBorradorRegistro();
        formRegistro.reset();
        limpiarErroresFormulario();

        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect');
        if (redirect === 'reservas') {
          const params = new URLSearchParams(window.location.search);
          params.delete('redirect');
          params.delete('tab');
          window.location.href = `../pages/reservas.html?${params.toString()}`;
        } else {
          window.location.href = '../index.html';
        }
      }
    }
  });

  // --- SUBMIT INICIO DE SESIÓN ---
  formLogin?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const esCorreoValido = validarCorreoLogin();
    const esPassValida = validarPassLogin();

    if (esCorreoValido && esPassValida) {
      const correoIngresado = inputCorreoLogin.value.trim().toLowerCase();
      const passIngresada = inputPassLogin.value;

      if (checkRecordarme && checkRecordarme.checked) {
        localStorage.setItem(KEY_RECORDAR_CORREO, correoIngresado);
      } else {
        localStorage.removeItem(KEY_RECORDAR_CORREO);
      }

      try {
        const respuesta = await iniciarSesion({ email: correoIngresado, password: passIngresada });

        const userProfile = {
          nombre: respuesta.nameUser || '',
          correo: correoIngresado,
          cedula: respuesta.identityDocument || '',
          telefono: respuesta.phoneNumber || ''
        };

        localStorage.setItem('devportes_token', respuesta.token);
        localStorage.setItem('devportes_sesion_activa', JSON.stringify(userProfile));
        document.dispatchEvent(new CustomEvent('session-change'));

        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect');
        if (redirect === 'reservas') {
          const params = new URLSearchParams(window.location.search);
          params.delete('redirect');
          params.delete('tab');
          window.location.href = `../pages/reservas.html?${params.toString()}`;
        } else {
          window.location.href = '../index.html';
        }
      } catch {
        const usuarios = obtenerUsuariosGuardados();
        const usuarioEncontrado = usuarios.find(
          (user) => user.correo === correoIngresado && user.password === passIngresada,
        );

        if (usuarioEncontrado) {
          const userProfile = {
            nombre: usuarioEncontrado.nombre,
            correo: usuarioEncontrado.correo,
            cedula: usuarioEncontrado.cedula || '',
            telefono: usuarioEncontrado.telefono || ''
          };

          localStorage.setItem('devportes_token', 'local-token');
          localStorage.setItem('devportes_sesion_activa', JSON.stringify(userProfile));
          document.dispatchEvent(new CustomEvent('session-change'));

          const urlParams = new URLSearchParams(window.location.search);
          const redirect = urlParams.get('redirect');
          if (redirect === 'reservas') {
            const params = new URLSearchParams(window.location.search);
            params.delete('redirect');
            params.delete('tab');
            window.location.href = `../pages/reservas.html?${params.toString()}`;
          } else {
            window.location.href = '../index.html';
          }
        } else {
          marcarInvalido(inputCorreoLogin, 'Credenciales incorrectas');
          marcarInvalido(inputPassLogin, 'Verifica tu contraseña');
        }
      }
    }
  });

  /* ==========================================================
     MOSTRAR / OCULTAR CONTRASEÑA (INTERACTIVIDAD CON EL OJO)
     ========================================================== */
  document.querySelectorAll('.btn-toggle-password').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = btn.parentElement.querySelector('input');
      const icon = btn.querySelector('i');

      if (!input || !icon) return;

      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('bi-eye', 'bi-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.replace('bi-eye-slash', 'bi-eye');
      }
    });
  });

  cargarDatosLocalStorage();
});
