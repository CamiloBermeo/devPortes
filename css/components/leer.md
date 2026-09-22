# Carpeta: css/components/

aca van los estilos para componentes especificos que se puedan reutilizar en
diferentes partes del codigo, por ejmplo una tarjeta, un boton o un imput, etc

## Propósito

Aquí se guardan **únicamente** los estilos de los elementos visuales que se
repiten en múltiples páginas del proyecto (ej. tarjetas de canchas, botones
personalizados, insignias de estado).

**Regla de Oro:** Si el estilo que vas a escribir solo afecta a la pantalla de
"Reservas" o a la de "Login", **NO va en esta carpeta** (debes ponerlo en
`css/views/`). Esta carpeta es solo para código reciclable.

## Directrices Estrictas

1. **Bootstrap First:** Antes de crear una clase aquí, asegúrate de que
   Bootstrap no tenga ya una utilidad que haga exactamente lo mismo.
1. **Cero IDs y Cero Etiquetas Genéricas:** Prohibido dar estilos usando `#id` o
   etiquetas crudas como `button { }`. Usa exclusivamente clases
   (`.nombre-clase`).
1. **Un archivo por componente:** No crees un archivo gigante. Si haces una
   tarjeta, crea `cancha-card.css`.

## Ejemplos de Archivos

- `cancha-card.css` (La tarjeta de la cancha que se usa en el Index y en el
  catálogo).
- `badges-estado.css` (Las etiquetas de colores para "Disponible", "Ocupado").

## Ejemplo de Código (cancha-card.css)

/\* CORRECTO: Clases específicas y uso de variables globales \*/ .cancha-card {
border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition:
transform 0.2s; }

.cancha-card:hover { transform: translateY(-5px); }

.cancha-card-precio { color: var(--color-primario); font-size: 1.5rem;
font-weight: bold; }
