# Carpeta: js/utils/

aca establecemos funciones de ayuda reutilizables que no tocan el DOM por
ejemplo una funcion para formatear fechas o precios a pesos

## Propósito

Aquí viven **únicamente** funciones auxiliares puras y reutilizables. Son
utilidades lógicas que transforman datos, validan formatos o realizan cálculos.

**Regla de Oro:** Estas funciones son totalmente agnósticas a la interfaz y al
servidor. Queda **estrictamente prohibido manipular el DOM**
(`document.getElementById`, `innerHTML`) y **hacer llamadas de red** (`fetch`).
Reciben datos por parámetros y retornan una salida sin generar efectos
secundarios.

## Directrices Estrictas

1. **Funciones Puras:** Dado el mismo parámetro de entrada, la función debe
   devolver siempre exactamente el mismo resultado.
1. **Reutilización Global:** Si una lógica se usa en una sola vista, no debe ser
   una *utilidad*. Solo coloca aquí funciones que puedan servir en múltiples
   partes del sistema.
1. **Exportación Modular:** Usa siempre `export function` para que cualquier
   archivo del proyecto pueda importarlas individualmente.

## Ejemplos de Archivos

- `formatters.js` (Formato de moneda en pesos colombianos, conversión de fechas
  a `DD/MM/AAAA`).
- `validators.js` (Validación de formato de correo electrónico, números
  telefónicos o contraseñas).

## Ejemplo de Código (js/utils/formatters.js)

// CORRECTO: Recibe un número y devuelve un string formateado. Sin tocar el DOM
ni llamar a la API. export function formatearMoneda(valor) { if (typeof valor
!== 'number' || isNaN(valor)) return '$ 0';

```
return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
}).format(valor);
```

}

export function formatearHora(horaString) { // Convierte "14:00:00" a "2:00 PM"
const [horas, minutos] = horaString.split(':'); const horaNum = parseInt(horas,
10); const periodo = horaNum >= 12 ? 'PM' : 'AM'; const hora12 = horaNum % 12 ||
12;

```
return `${hora12}:${minutos} ${periodo}`;
```

}
