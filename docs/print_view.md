# Especificación: Print Builder (A4 Layout)

## Objetivo
Permitir al usuario "componer" su propia página de estudio en formato A4 (físico o PDF) utilizando los rangos de la estrategia cargada.

## Flujo de Interacción (V1)
1. **Poblado Automático**: Al abrir el `Print Builder`, se muestran todos los rangos de la carpeta actual sobre el folio A4.
2. **Lienzo A4**: El usuario puede alternar entre **Portrait** (Vertical) o **Landscape** (Horizontal).
3. **Cajas de Rango**: Cada rango es una unidad móvil e independiente.
4. **Controles Básicos**:
   - Arrastrar para reposicionar.
   - Slider de escalado global para ajustar el tamaño de todos los rangos uniformemente.
5. **Generar PDF**: Botón final que dispara `window.print()` con estilos optimizados (fondo blanco, texto negro).

## Estructura Técnica
- **Contenedor A4**: Dimensiones proporcionales a 210mm x 297mm.
- **Componente Draggable**: Uso de una librería ligera o lógica nativa para mover las cajas.
- **Escala CSS**: Transformación `scale()` para ajustar el tamaño de los componentes `HandGrid`.

## Próximos Pasos
1. Crear el armazón del componente `PrintBuilder.tsx`.
2. Integrar el selector de vista en `App.tsx`.
3. Implementar la carga inicial de rangos sobre el lienzo.
