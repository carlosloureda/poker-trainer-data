# Arquitectura de RangeCraft Studio

## Visión General
RangeCraft Studio es una herramienta profesional para la gestión y estudio de rangos de poker 6-max. Utiliza una arquitectura basada en **Blueprints** para garantizar la integridad de los datos.

## Componentes Clave

### 1. Motor de Datos (`blueprint_6max.json`)
Define la estructura rígida de posiciones (UTG, HJ, CO, BTN, SB, BB) y las situaciones permitidas para cada una. Esto evita errores de usuario al crear estrategias.

### 2. Adaptador de Rangos (`rangeAdapter.ts`)
Encargado de la transformación entre el estado interno de la aplicación y el formato JSON de persistencia. Permite la exportación e importación universal.

### 3. Sistema de Resolución (`useAppState.ts`)
Hook principal que gestiona la carga de estrategias, la resolución de situaciones dinámicas y la persistencia en el backend/localStorage.

### 4. Interfaz de Usuario (`PositionPage.tsx`)
Unificada para los modos **Play** (consulta rápida) y **Studio** (edición profunda). Implementa una lógica de paleta de acciones contextual.

## Flujo de Edición
- **Toggle Mode**: Al hacer clic en una mano con una acción seleccionada, se aplica o se elimina (fold) automáticamente.
- **Leyenda Inteligente**: Se transforma de informativa a interactiva según el estado de edición.
