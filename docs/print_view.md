# Especificación: Print View (Print Builder)

## Objetivo
Permitir al usuario generar documentos visuales (PDF/Impresión) de sus rangos para estudio offline o consulta rápida física.

## Requerimientos Visuales
- **Layout de Página**: Una situación por página o un grid de posiciones (ej. UTG/HJ/CO en una fila).
- **Matriz de Manos Compacta**: Optimizar el tamaño de la matriz para impresión (sin bordes innecesarios, colores de alto contraste).
- **Leyenda Integrada**: Cada página debe incluir la leyenda de acciones correspondiente.

## Funcionalidades
- **Selección de Situaciones**: El usuario podrá elegir qué situaciones imprimir (ej. "Solo mis Opens" o "Toda mi estrategia de BTN").
- **Visualización en Blanco y Negro**: Opción para leyendas con texturas/letras (A, C, F) para impresión monocromática.
- **Exportación Directa**: Botón para generar el PDF utilizando `window.print()` con media queries específicas.

## Próximos Pasos
1. Diseñar el componente `PrintBuilder.tsx`.
2. Implementar los estilos `@media print` en `index.css`.
