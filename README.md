# POS Dashboard (React + Tailwind + React Router)

Interfaz de Punto de Venta (POS) y dashboard administrativo diseñada para negocios pequeños y emprendedores. Enfocada en ventas rápidas, inventario claro y reportes visuales.

## Stack técnico

- Framework: React (Vite)
- Estilos: Tailwind CSS
- Gráficos: Recharts
- Navegación: React Router
- Zustand: Estado
- Iconografía: Heroicons
- Arquitectura: componentes reutilizables, desktop-first y responsivo

## Estructura de componentes y jerarquía

- `AppLayout`: Layout principal con sidebar fija y header con métricas.
  - `Sidebar` (incluido dentro de AppLayout via `NavLink`)
  - `HeaderStats`: tarjetas con KPIs del día (ventas, ingresos, bajo stock).
- Páginas:
  - `Sales`: venta rápida + historial de transacciones.
  - `Inventory`: listado de productos + gestión de stock + alertas de bajo stock.
  - `Reports`: gráficos diarios/semanales/mensuales + productos más vendidos + KPIs agregados.
- Componentes reutilizables:
  - `MetricCard`: tarjeta de KPI con variantes (default, success, warning, error).
  - `DataTable`: tabla con paginación, búsqueda y ordenamiento.
  - `ChartLine` y `ChartBar`: gráficos responsivos con Recharts.
- Estado:
  - `AppDataContext`: productos, ventas, funciones `addSale`, `updateStock`, y métricas derivadas.

## Descripción visual de cada sección

- Sidebar (fijo):
  - Navegación clara con 3 entradas: Ventas, Inventario, Reportes.
  - Iconografía simple y consistente (Heroicons).
- Header:
  - Tres métricas rápidas (ventas del día, ingresos del día, bajo stock).
  - Diseño limpio con suficiente espacio en blanco.
- Ventas:
  - Formulario de venta rápida con selector de producto, cantidad y cálculo automático del total.
  - Botón primario con color de acento para acción principal.
  - Historial de ventas en tabla con búsqueda/orden/paginación.
- Inventario:
  - Banner de alerta cuando hay productos con bajo stock.
  - Tabla de productos con edición inline de stock.
- Reportes:
  - Tarjetas resumen de KPIs agregados.
  - Gráficos interactivos (línea y barras) para períodos y productos top.
  - Resumen por período con totales.

## UX y patrones de interacción

- Estados:
  - Hover/focus en botones y elementos interactivos.
  - Vacíos: mensajes claros en tablas cuando no hay datos.
  - Éxito/error: se sugieren toasts o banners adicionales.
- Navegación predecible:
  - Destacado del enlace activo y semántica ARIA en acciones clave.
- Accesibilidad:
  - Contraste adecuado en botones y tarjetas.
  - `aria-label` en controles clave (buscar, ordenar, editar stock).
  - `focus-visible` para navegación por teclado.
- Tabla:
  - Búsqueda completa por JSON del registro (simple y efectivo).
  - Orden por columna con indicadores ▲/▼.
  - Paginación con accesibles y estados deshabilitados.

## Buenas prácticas de escalabilidad y mantenibilidad

- Componentes puros y pequeños, props explícitas.
- Estado centralizado (Context) con funciones de mutación.
- Utilidades para formato (`formatCurrency`).
- Temas de color extendidos en Tailwind para consistencia.
- Layout y páginas separadas para facilitar el crecimiento (módulos adicionales).
- Recharts encapsulado en componentes para cambiar librería sin tocar páginas.

## Cómo ejecutar

1. Requisitos: Node 18+.
2. Instala dependencias:

   npm install
   
3. Dev:
   
   npm run dev
   

## Próximas mejoras sugeridas

- Persistencia (localStorage/IndexedDB o API).
- Autenticación y roles (cajero/admin).
- Funcionalidad Offline
- Filtros avanzados en reportes (rango de fechas).
- Toasts de feedback (éxito/error).
- Importación/exportación CSV para inventario/ventas.
- Tests unitarios y e2e.