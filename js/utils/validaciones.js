export const regexNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
export const regexCedula = /^\d+$/;
export const regexTelefono = /^\d{10}$/;
export const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const LONGITUD = {
  nombre: { min: 3, max: 50 },
  cedula: { min: 6, max: 11 },
  telefono: { min: 10, max: 10 },
};

export function soloNumeros(input) {
  if (!input) return;
  input.value = input.value.replace(/\D/g, '');
}

export function soloLetras(input) {
  if (!input) return;
  input.value = input.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
}

export function validarLongitud(valor, { min, max }) {
  if (min !== undefined && valor.length < min) return false;
  if (max !== undefined && valor.length > max) return false;
  return true;
}
