# Arquitectura del Visualizador de Rangos

## 1. Visión General

El módulo de rangos es un **visualizador y organizador** de rangos de poker preflop para 6-max.  
El usuario carga su JSON de rangos (formato propio) y puede navegarlo, visualizarlo de distintas maneras y exportar vistas para imprimir.

No es un editor de rangos genérico — es un visualizador orientado al estudio.

---

## 2. Estructura de Datos (JSON de Rangos)

El JSON tiene la siguiente jerarquía fija para 6-max:

```
{
  "Range_Craft": {
    "<posicion_hero>": {
      "open": ["22+", "AKs", ...],
      "<situacion>": {
        "<accion>": ["combo", "combo:frecuencia", ...]
      }
    }
  }
}
```

### Posiciones Hero (siempre las mismas en 6-max):
`utg`, `hj`, `co`, `btn`, `sb`, `bb`

### Tipos de situación posibles:
| Situación | Descripción |
|-----------|-------------|
| `open` | Raise First In (RFI) desde esa posición |
| `3bet_vs_<pos>` | Hero 3betea cuando `<pos>` abre (ej. `3bet_vs_utg`) |
| `4bet_vs_<pos>` | Hero tiene que responder a un 3bet de `<pos>` tras haber abierto (ej. `4bet_vs_btn`) |
| `squeeze` | Hero 3betea con al menos 1 coldcaller en el pot |

### Acciones posibles dentro de cada situación:
| Acción | Descripción |
|--------|-------------|
| `open` | Sólo en la situación open. Lista plana de combos. |
| `3bet_5bet_shove` | 3bet de valor (o shove si hay 4bet) |
| `3bet_fold` | 3bet como bluff (fold a 4bet) |
| `call_open` | Coldcall / flat del open |
| `4bet_6bet` | 4bet de valor (o 6bet si hay 5bet) |
| `4bet_fold` | 4bet como bluff (fold a 5bet) |
| `call_3bet` | Flat del 3bet |

### Notación de combos:
| Notación | Significado |
|----------|-------------|
| `AA` | Par de Ases (o mano específica) |
| `22+` | Desde 22 hasta AA (todos los pares) |
| `AKs` | AK suited |
| `A2s+` | A2s hasta AKs (ascendente por segundo rango) |
| `KTs+` | KTs hasta KQs |
| `JJ-22` | De JJ bajando hasta 22 |
| `A5s:0.5` | A5s al 50% de frecuencia |

---

## 3. Componentes de la Interfaz

### Principio clave: **Un solo componente `HandGrid`**
El grid 13x13 es el bloque fundamental de toda la UI. Se reutiliza en todos los contextos: study, overview, print. Sus props determinan tamaño, interactividad y datos.

### Árbol de componentes:
```
App
├── RangeLoader          — carga y parsea el JSON
├── ColorConfig          — paleta de colores por acción (configurable)
├── StudyView            — vista principal de estudio
│   ├── PositionTabs     — tabs: UTG | HJ | CO | BTN | SB | BB
│   └── PositionPage
│       ├── HandGrid (grande)   — muestra el "open" de esa posición
│       └── SituationRow
│           └── HandGrid (pequeño, clicable) × N situaciones
│               └── SituationModal / Expanded — HandGrid a tamaño completo con leyenda
├── OverviewView         — todos los opens en una fila, todas las posiciones
│   └── HandGrid (mini) × 6 posiciones
└── PrintView            — layout de impresión
    └── PositionPage (printable) × 6
        ├── HandGrid (open)
        └── HandGrid × N situaciones
```

---

## 4. Colores Configurables

Las acciones se mapean a colores definidos como constantes en el código. No hay configuración de usuario por ahora (se añadirá más adelante cuando tenga sentido).

| Acción | Color por defecto |
|--------|-------------------|
| `open` / `3bet_5bet_shove` / `4bet_6bet` | Rojo `#ef4444` (value) |
| `3bet_fold` / `4bet_fold` | Naranja `#f97316` (bluff) |
| `call_open` / `call_3bet` | Azul `#3b82f6` (call) |
| `squeeze` (value) | Rosa `#ec4899` |

---

## 5. Las 3 Vistas

### Study View (por defecto)
- Tabs por posición (UTG, HJ, CO, BTN, SB, BB)
- Dentro de cada posición:
  - Grid grande del **Open range** arriba
  - Fila horizontal de grids pequeños clicables, uno por situación (vs HJ, vs CO, etc.)
  - Click en uno → se expande mostrando el grid completo con colores y leyenda

### Overview View
- Sin tabs — todo de un vistazo
- 6 columnas (una por posición), cada una mostrando el Open + grids miniatura de situaciones
- Útil para comparar posiciones entre sí

### Print View
- **Pendiente de decidir** cuando el resto de vistas esté implementado y se pueda evaluar mejor el espacio que ocupan los grids.

### Quick View (Play Mode)
- Pensada para consulta rápida **mientras se juega** (en vivo u online)
- Interfaz mínima: dos selectores (`Yo soy: [posición]` + `Situación: [vs X]`) y el grid aparece directamente
- Sin navegación extra, sin scroll — una decisión, una pantalla
- Compacta y rápida, potencialmente mobile-friendly

---

## 6. Parseador de Rangos

El módulo `rangeParser.ts` convierte la notación compacta en un mapa de 169 combos:

```
"22+" → [22, 33, 44, 55, 66, 77, 88, 99, TT, JJ, QQ, KK, AA]
"A2s+" → [A2s, A3s, A4s, A5s, A6s, A7s, A8s, A9s, ATs, AJs, AQs, AKs]
"JJ-22" → [JJ, TT, 99, 88, 77, 66, 55, 44, 33, 22]
"A5s:0.5" → A5s con frecuencia 0.5
```

---

## 7. Lo que NO hacemos (por ahora)
- No editamos rangos desde la UI (solo visualizamos)
- No soporte MTT / 9max / HU (solo 6max)
- No evaluación de equity ni simulaciones
