aca colocamos estilos exclusivo de una paginapor ejemplo reservas.css
solo los estilos de esa pagina van en el archivo reservas, ademas de acordarse
de usar los estilos globales

# Carpeta: css/views/

## Propósito
Aquí se guardan los archivos de CSS con estilos **únicos y exclusivos de una sola página**. Si una regla visual solo existe en una pantalla concreta y no se va a reutilizar en ninguna otra parte del proyecto, su código vive aquí.

**Regla de Oro:** Si notas que estás copiando y pegando reglas de un archivo de esta carpeta a otro, la regla visual ya no es de una "vista", sino de un "componente". Muévela inmediatamente a `css/components/`.

## Directrices Estrictas
1. **Correspondencia 1 a 1:** El nombre del archivo CSS debe coincidir con el nombre de la página HTML a la que le da estilos (ej. `reservas.html` usa `reservas.css`).
2. **Bootstrap First:** No uses este archivo para modificar márgenes, paddings, ni colores de fondo estándar. Usa las clases utilitarias de Bootstrap directamente en el HTML.
3. **No contaminar el scope global:** Asegúrate de que las clases escritas aquí tengan nombres específicos para evitar conflictos de nombres imprevistos.

## Ejemplos de Archivos
* `reservas.css` (Ajustes exclusivos para la cuadrícula del calendario de alquiler).
* `login.css` (Ajustes de fondo e imagen lateral del contenedor de inicio de sesión).

## Ejemplo de Código (reservas.css)

/* CORRECTO: Estilos de maquetación exclusivos para la vista de reservas */
.reservas-horarios-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 10px;
}

.reservas-resumen-panel {
    background-color: #f8f9fa;
    border-left: 4px solid var(--color-primario);
    padding: 1.5rem;
}