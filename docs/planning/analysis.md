# Poker Trainer - Análisis Arquitectónico y del Dominio

## Visión General
El objetivo de "Poker Trainer" es ser una herramienta profesional, limpia y altamente usable para estudiar y entrenar situaciones de poker. El diseño debe alejarse de estéticas recargadas ("casino/neón") y centrarse en la claridad visual típica de herramientas como Range Craft, Flopzilla o GTO Wizard, primando la legibilidad.

## Dominio de Poker: Estructura de Rangos
Para que la aplicación sea realmente útil, la estructura de datos que define un "Rango" no puede ser plana. Los jugadores de poker estudian por "Spots" organizados en árboles de decisión. 

### Jerarquía Clásica (El Árbol de Rangos)
El sistema debe soportar una estructura de carpetas/categorías para clasificar los rangos:
1. **Formato**: Cash, MTT, Spin & Go.
2. **Mesa**: 9-max, 6-max, HU.
3. **Profundidad (Stack)**: 100bb, 40bb, 20bb, etc.
4. **Spot / Acción Principal**:
   - **RFI (Raise First In / Open Raise)**
   - **ROL (Raise Over Limpers)**
   - **vs RFI (Enfrentando un Open)**: Cold Call / 3bet
   - **vs 3bet**: Call 3bet / 4bet
5. **Posición del Hero**: UTG, HJ, CO, BTN, SB, BB.
6. **Posición del Villain** (Relacional): Ej. Hero en BTN vs Villain en UTG.

### El Formato JSON Base (Propuesta)
Debemos definir un estándar JSON versátil. Puede ser un archivo por Rango aislado, o un formato que soporte el Árbol completo (Librería).

**Ejemplo de nodo de Rango Individual**:
```json
{
  "id": "uuid-1234",
  "name": "RFI UTG",
  "metadata": {
    "format": "cash",
    "tableSize": "6-max",
    "stack": 100,
    "heroPosition": "UTG",
    "spot": "RFI"
  },
  "tags": ["standard", "gto-base"],
  "actions": [
    { "id": "raise", "name": "Raise", "color": "#E53E3E" },
    { "id": "fold", "name": "Fold", "color": "#718096" }
  ],
  "combos": {
    "AA": { "raise": 1.0, "fold": 0.0 },
    "A5s": { "raise": 0.5, "fold": 0.5 }
  }
}
```

## Módulos del Proyecto
1. **Visualizador y Editor de Rangos (Fase 1)**
   - Interfaz sobria, basada en Vainilla CSS/Modern CSS, ultra-responsive y limpia.
   - Matriz 13x13 sin distracciones, centrada en asignar acciones con colores sólidos y precisos por combo.
   - Posibilidad de seleccionar múltiples combos rápido (click & drag).
   - Guardar y leer JSON unificados.

2. **Mesa y Hand Replayer (Fase 2)**
   - Herramienta para revisar HH (Hand Histories) reales, permitiendo avanzar calle por calle y evaluar qué rangos se aplican en cada spot basado en el JSON de la Fase 1.

3. **Entrenamiento Interactivo (Fase 3)**
   - Modo "Quiz": Dado un Spot aleatorio (ej. 100bb, HJ RFI, Hero en BTN, Villain bet 3bb), se pide al jugador pintar su rango o tomar una decisión con una mano específica, y se comprueba contra la librería JSON definida.
