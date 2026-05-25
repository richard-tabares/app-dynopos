---
name: dynopos-ui-designer
description: >
  Diseñador de UI para DynoPOS con Tailwind v4. Define todos los patrones
  de componentes: cards, tablas, formularios, botones, filtros, modales,
  estados vacíos, badges y más. Usar como referencia para crear nuevas UI
  o modificar existentes.
license: MIT
compatibility: opencode
metadata:
  audience: developers
  stack: react-tailwind
---

## Principios de Diseño

1. **Consistencia**: Todos los componentes nuevos deben seguir exactamente los patrones aquí definidos.
2. **Responsive**: Tablas con `overflow-x-auto`. Sidebar colapsable (desktop `ml-20`/`ml-64`, mobile overlay).
3. **Tokens semánticos**: Usar SIEMPRE los tokens del `@theme` en lugar de clases fijas (`bg-surface` no `bg-white`, `border-outline` no `border-gray-300`, etc.).
4. **Dark mode**: Soportar clase `.dark`. Usar `dark:` variants donde sea necesario.
5. **Moneda**: `new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(value)` o `{ style: 'currency', currency: 'COP', ... }` para símbolo.
6. **Estados**: Todo componente debe manejar: loading (skeleton/spinner), error (bg-red-50 border-red-200), empty (icono + texto), success (datos renderizados).
7. **Sin hover en cards**: Las cards NO tienen efectos hover (`hover:shadow-md`, etc.). Solo botones, tablas y elementos interactivos tienen hover.
8. **Font-size base**: 14px → 15px (640px) → 16px (1024px). Definido en `:root` del `@layer base`.

---

## 1. Design Tokens (CSS Custom Properties + @theme)

Archivo: `src/shared/styles/App.css` (líneas 1-147).

### Tokens del @theme (mapeo a CSS vars)

```css
@theme {
    --color-surface: var(--surface);         /* bg-surface */
    --color-accent: var(--accent);           /* bg-accent / text-accent */
    --color-body: var(--body);               /* bg-body */
    --color-subtle: var(--subtle);           /* bg-subtle */
    --color-overlay: var(--overlay);         /* bg-overlay */
    --color-on-surface: var(--on-surface);   /* text-on-surface */
    --color-on-body: var(--on-body);         /* text-on-body */
    --color-muted: var(--muted);             /* text-muted */
    --color-faint: var(--faint);             /* text-faint */
    --color-outline: var(--outline);         /* border-outline */
    --color-divider: var(--divider);         /* border-divider */
    --color-divider-light: var(--divider-light);
    --color-disabled: var(--disabled);       /* bg-disabled */
    --color-select-input: var(--select-input);
    --color-hover: var(--hover);             /* hover:bg-hover */
    --color-hover-strong: var(--hover-strong);
    --color-hover-icon: var(--hover-icon);
}
```

### Light mode (default)

| Token | Valor | Uso |
|---|---|---|
| `--surface` | `#ffffff` | Fondo de cards |
| `--accent` | `#3b75997ff` | Azul acero — color principal de marca |
| `--title-surface` | `hsl(202, 20%, 65%)` | Fondo de headers en modales (sticky) |
| `--danger` | `#dc2626` | Rojo — acciones destructivas (eliminar) |
| `--body` | `#f9fafb` | Fondo de página |
| `--subtle` | `#f9fafb` | Header de cards, fondos secundarios |
| `--on-surface` | `#111827` | Texto principal sobre surface |
| `--on-body` | `#374151` | Texto sobre body |
| `--muted` | `#6b7280` | Texto secundario |
| `--faint` | `#9ca3af` | Texto muy tenue, iconos placeholder |
| `--outline` | `#d1d5db` | Bordes de cards, inputs |
| `--divider` | `#e5e7eb` | Divisores (border-bottom en headers) |
| `--divider-light` | `#f3f4f6` | Divisores tenues (filas de tabla) |
| `--disabled` | `#f3f4f6` | Fondo deshabilitado |
| `--hover` | `#f9fafb` | Hover de filas de tabla |
| `--hover-strong` | `#f3f4f6` | Hover fuerte (botones outline) |
| `--hover-icon` | `#e5e7eb` | Toggle inactivo, skeletons |

### Dark mode (clase `.dark`)

```css
.dark {
    --surface: #1f2937;
    --accent: #00ffffff;
    --body: #030712;
    --subtle: rgba(31, 41, 55, 0.5);
    --overlay: rgba(0, 0, 0, 0.6);
    --on-surface: #f9fafb;
    --on-body: #e5e7eb;
    --muted: #d1d5db;
    --outline: #4b5563;
    --divider: #374151;
    --hover: #374151;
    --hover-icon: #6b7280;
}
```

### Base layer

```css
html { font-size: 14px; }
@media (min-width: 640px) { html { font-size: 15px; } }
@media (min-width: 1024px) { html { font-size: 16px; } }

body { @apply bg-body text-on-body antialiased; }

/* Focus global */
* { @apply focus:outline-none focus-visible:ring-0 focus-visible:ring-accent focus-visible:ring-offset-0; }

/* Scrollbar oculto */
.scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
.scrollbar-none::-webkit-scrollbar { display: none; }

/* Invertir icono de date picker en dark mode */
.dark input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); }
```

### Print styles

```css
@media print {
    body * { visibility: hidden; }
    .print-receipt, .print-receipt * { visibility: visible; }
    .print-receipt {
        position: absolute; left: 50%; top: 0;
        transform: translateX(-50%);
        width: 100%; max-width: 480px;
        padding: 0.3in; background: #fff;
        border: 1px solid #e5e7eb; border-radius: 8px;
    }
    .no-print { display: none !important; }
}
```

---

## 2. Patrón de Cards / Contenedores

**Regla**: Usar `bg-surface border border-outline shadow-xs rounded-lg` como base.

### Card estándar
```jsx
<section className='bg-surface border border-outline p-6 shadow-xs rounded-lg'>
```

### Card con header bar (título + acciones)
```jsx
<section className='bg-surface border border-outline shadow-xs rounded-lg'>
  <section className='border-b border-divider flex justify-between items-center px-6 py-4 bg-subtle'>
    <h2 className='text-lg font-semibold flex items-center gap-2'>
      <Icon className='w-5 h-5 text-accent' />
      Título
      <span className='text-sm text-muted font-medium'>Total (X)</span>
    </h2>
    <button className='flex items-center font-medium px-4 py-2 bg-accent text-surface text-sm rounded-lg hover:bg-accent/85 transition cursor-pointer'>
      <Plus className='w-4 h-4 lg:w-5 lg:h-5 lg:mr-2' />
      Acción
    </button>
  </section>
  <section className='p-6 flex flex-col gap-4'>
    {/* contenido */}
  </section>
</section>
```

### Card de métricas (dashboard/summary)
```jsx
<div className='bg-surface border border-outline shadow-xs p-6 rounded-lg flex items-center gap-4'>
  <div className='p-3 rounded-xl bg-blue-100'>
    <Icon className='w-5 h-5 text-blue-600' />
  </div>
  <div>
    <p className='text-xs font-medium text-muted uppercase tracking-wider'>Título</p>
    <p className='text-2xl font-bold text-on-surface mt-1'>Valor</p>
  </div>
</div>
```

Grid de métricas: `grid grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1 gap-4`

Variantes de color en métricas:

| Métrica | bg icono | text icono |
|---|---|---|
| Ventas totales | `bg-blue-100` | `text-blue-600` |
| Ingresos | `bg-green-100` | `text-green-600` |
| Ganancia | `bg-emerald-100` | `text-emerald-600` |
| Margen | `bg-teal-100` | `text-teal-600` |
| Productos | `bg-purple-100` | `text-purple-600` |
| Alertas stock | `bg-orange-100` | `text-orange-600` |
| Valor inventario | `bg-green-50` | `text-green-600` |

### Card con layout flex-col
```jsx
<section className='bg-surface border border-outline shadow-xs rounded-lg flex flex-col'>
```

### Card tipo Settings (header con bg-body/50)
```jsx
<section className='bg-surface border border-outline shadow-xs rounded-lg'>
  <div className='px-6 py-4 border-b border-divider bg-body/50'>
    <h2 className='text-lg font-semibold flex items-center gap-2'>
      <Icon className='w-5 h-5 text-accent' /> Título
    </h2>
  </div>
  <div className='p-6'>
    {/* contenido */}
  </div>
</section>
```

### Card con icon header (dashboard sub-cards)
```jsx
<section className='bg-surface border border-outline p-6 shadow-xs rounded-lg'>
  <div className='flex items-center gap-2 text-accent mb-6'>
    <Icon className='w-5 h-5' />
    <h3 className='text-lg font-semibold text-on-surface'>Title</h3>
  </div>
  {/* contenido */}
</section>
```

### Banner de alerta (stock bajo, advertencias)
```jsx
<section className='bg-orange-50 border border-orange-200 rounded-lg p-6'>
  <div className='flex items-start gap-4'>
    <div className='p-2 bg-orange-100 rounded-lg text-orange-600'>
      <AlertCircle className='w-6 h-6' />
    </div>
    <div className='flex-1'>
      <h3 className='text-orange-900 font-bold text-lg'>Título</h3>
      <p className='text-orange-700 text-sm'>Mensaje</p>
    </div>
  </div>
</section>
```

### Banner de alerta delgado (error en formularios/modales)
```jsx
<div className='flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg'>
  <AlertCircle className='w-5 h-5 text-red-500 shrink-0 mt-0.5' />
  <p className='text-sm text-red-700 dark:text-red-300'>{mensaje}</p>
</div>
```

### Card de error
```jsx
<div className='bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg'>
  {error}
</div>
```

---

## 3. Patrón de Tablas

### Contenedor
```jsx
<div className='overflow-x-auto'>
  <table className='w-full text-sm overflow-hidden rounded-t-lg'>
```

### Encabezado (thead)
```jsx
<thead>
  <tr className='bg-subtle border-b border-divider text-muted uppercase text-xs tracking-wider'>
    <th className='text-left py-3 px-4 font-medium'>Texto</th>
    <th className='text-right py-3 px-4 font-medium'>Numérico</th>
  </tr>
</thead>
```

- Columnas de texto: `text-left`
- Numéricas: `text-right`
- Acciones: `text-right`

### Filas (tbody)
```jsx
<tbody>
  {data.map((item, i) => (
    <tr key={i} className='border-b border-divider-light hover:bg-hover'>
      <td className='py-3 px-4 font-medium text-on-surface'>{item.principal}</td>
      <td className='py-3 px-4 text-on-body'>{item.secundario}</td>
      <td className='py-3 px-4 text-muted'>{item.terciario}</td>
      <td className='py-3 px-4 text-right font-bold text-on-surface'>{item.numero}</td>
      <td className='py-3 px-2 text-right whitespace-nowrap'>{/* acciones */}</td>
    </tr>
  ))}
</tbody>
```

Tipos de celdas:

| Contenido | className |
|---|---|
| Texto principal | `py-3 px-4 font-medium text-on-surface` |
| Texto secundario | `py-3 px-4 text-on-body` |
| Texto terciario | `py-3 px-4 text-muted` |
| Numérico | `py-3 px-4 text-right` + `font-bold` si es principal |
| Acciones | `py-3 px-2 text-right whitespace-nowrap` |
| Badge/Estado | `py-3 px-4 whitespace-nowrap` |
| No disponible | `<span className='text-faint italic'>—</span>` |
| Clickable row | Añadir `cursor-pointer transition` + hover específico (ej: `hover:bg-red-50`) |

### Acciones desktop + mobile dropdown

```jsx
<section className='hidden sm:flex items-center justify-end gap-3'>
  <button className='hover:bg-hover-icon p-1.5 rounded-sm cursor-pointer' title='Editar'>
    <Edit2 className='w-4 h-4 text-accent' />
  </button>
  <button className='hover:bg-red-500 bg-red-400 text-white p-1.5 rounded-sm cursor-pointer' title='Eliminar'>
    <Trash2 className='w-4 h-4' />
  </button>
</section>

{/* Mobile */}
<div className='relative sm:hidden'>
  <button onClick={() => setOpenId(id)} className='p-2 text-on-body hover:bg-hover-strong rounded-lg transition cursor-pointer'>
    <EllipsisVertical className='w-5 h-5' />
  </button>
  {openId === id && (
    <>
      <section className='fixed inset-0 z-40' onClick={() => setOpenId(null)} />
      <section className='absolute right-0 mt-1 w-40 bg-surface border border-outline rounded-lg shadow-lg z-50'>
        <button onClick={handleEdit} className='flex items-center gap-2 w-full px-4 py-2.5 text-sm text-on-body hover:bg-hover rounded-t-lg'>Editar</button>
        <button onClick={handleDelete} className='flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-hover rounded-b-lg'>Eliminar</button>
      </section>
    </>
  )}
</div>
```

### Botón Cargar más
```jsx
<button
  onClick={() => setVisibleCount(prev => prev + 10)}
  className='w-full mt-4 py-2 text-sm font-medium text-on-surface hover:text-surface hover:bg-accent rounded-lg border border-accent transition-colors cursor-pointer flex items-center justify-center gap-2'
>
  <ChevronDown className='w-4 h-4' />
  Cargar más ({remaining} restantes)
</button>
```

---

## 4. Patrón de Inputs de Búsqueda

```jsx
<div className='relative'>
  <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-faint' />
  <input
    type='search'
    value={searchTerm}
    onChange={(e) => { setSearchTerm(e.target.value); setVisibleCount(10) }}
    placeholder='Buscar por código o nombre...'
    className='w-full border border-divider rounded-md pl-10 pr-3 py-3 text-sm focus:outline-none focus:border-accent focus:ring-0 transition-all duration-300'
  />
</div>
```

Usado en: Products, Categories, Inventory, Sales, StockTable, InventoryValuation, ReturnsTable, InventoryMovements.

### Botón "Limpiar búsqueda" (Sales)
```jsx
<button className='flex items-center gap-2 px-3 py-1.5 bg-accent self-start text-sm font-medium rounded-md transition-colors cursor-pointer text-surface hover:bg-accent/85'>
  <X className='w-4 h-4' /> Limpiar búsqueda
</button>
```

---

## 5. Patrón de Filtros / Botones Segmentados

```jsx
<div className='flex gap-1 bg-disabled/70 rounded-lg p-1 w-fit max-w-full overflow-x-auto scrollbar-none'>
  <button
    onClick={() => setFilter(value)}
    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
      activeFilter === value
        ? 'bg-surface shadow-xs text-accent'
        : 'text-muted hover:text-on-body hover:bg-surface'
    }`}
  >
    <Icon className='w-4 h-4' />
    Etiqueta
  </button>
</div>
```

Reglas:
- Contenedor: `bg-disabled/70 rounded-lg p-1`
- Botón activo: `bg-surface shadow-xs text-accent`
- Botón inactivo: `text-muted hover:text-on-body hover:bg-surface`
- Padding: `px-3 py-1.5`
- Texto: `text-sm font-medium`
- Siempre incluir icono con `flex items-center gap-2`
- Usar `w-fit` y `overflow-x-auto scrollbar-none`

### Filtros de categorías dinámicas
```jsx
<Layers className='w-4 h-4' />  {/* en "Todas/Todos" */}
<Tags className='w-4 h-4' />    {/* en cada categoría */}
```

### Filtros de fecha (DateRangeFilter)
| Período | Icono |
|---|---|
| Hoy | `Calendar` |
| Semana | `CalendarDays` |
| Mes | `CalendarRange` |
| Rango | `ArrowLeftRight` |

### Filtro de inventario (stock status)
| Filtro | Icono | Color del icono |
|---|---|---|
| Todos | `Layers` | `text-accent` |
| Stock Bajo | `AlertTriangle` | `text-red-500` |
| Con Stock | `PackageCheck` | `text-emerald-500` |
| Sin control | `Package` | `text-gray-500` |

### DateRangeFilter completo
```jsx
<section className='flex items-center gap-4 flex-wrap'>
  <div className='flex gap-1 bg-disabled/70 rounded-lg p-1 w-fit'>
    {/* period buttons */}
  </div>
  {showRange && (
    <div className='flex items-center gap-2'>
      <div>
        <label className='text-xs text-muted mb-1 font-medium'>Desde</label>
        <input type='date' className='border border-divider rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-accent focus:ring-0' />
      </div>
      <div>
        <label className='text-xs text-muted mb-1 font-medium'>Hasta</label>
        <input type='date' className='border border-divider rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-accent focus:ring-0' />
      </div>
    </div>
  )}
</section>
```

---

## 6. Patrón de Botones

### Botón primario (accent)
```jsx
<button className='px-4 py-2 bg-accent text-surface rounded-lg hover:bg-accent/85 font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'>
  Texto
</button>
```

### Botón primario full-width (OrderSidebar)
```jsx
<button className='w-full py-4 bg-accent text-surface rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-accent/85 transition-all shadow-lg shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'>
  Texto
</button>
```

### Botón primario con icono (header de cards)
```jsx
<button className='flex items-center font-medium px-4 py-2 bg-accent text-surface text-sm rounded-lg hover:bg-accent/85 transition cursor-pointer'>
  <Icon className='w-4 h-5 mr-2' />
  Texto
</button>
```

### Botón outline (secundario)
```jsx
<button className='flex items-center font-medium px-4 py-2 border border-outline text-on-body text-sm rounded-lg hover:bg-hover-strong transition cursor-pointer'>
  <Icon className='w-4 h-5 mr-2' />
  Texto
</button>
```

### Botón ghost (sin borde, solo hover)
```jsx
<button className='px-4 py-2 text-on-body hover:bg-hover font-medium rounded-lg transition cursor-pointer'>
  Cancelar
</button>
```

### Botón cancel (border outline, modal)
```jsx
<button className='flex-1 py-2.5 border border-outline text-on-body rounded-lg font-medium hover:bg-hover transition text-sm cursor-pointer'>
  Cancelar
</button>
```

### Botón danger (relleno rojo)
```jsx
<button className='flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition text-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer'>
  <Trash2 className='w-5 h-5' /> Eliminar
</button>
```

### Botón danger outline (full-width, modal inline)
```jsx
<button className='w-full flex items-center justify-center gap-2 px-4 py-3 border border-danger/30 text-danger hover:bg-danger/5 rounded-lg transition cursor-pointer font-medium'>
  <Trash2 className='w-4 h-4' />
  Eliminar este elemento
</button>
```

### Botón icon-only (acciones de fila en tablas)
```jsx
<button className='hover:bg-hover-icon p-1.5 rounded-sm cursor-pointer' title='Editar'>
  <Edit2 className='w-4 h-4 text-accent' />
</button>
<button className='hover:bg-red-500 bg-red-400 text-white p-1.5 rounded-sm cursor-pointer' title='Eliminar'>
  <Trash2 className='w-4 h-4' />
</button>
```

### Botón "Cargar más"
```jsx
<button className='w-full mt-4 py-2 text-sm font-medium text-on-surface hover:text-surface hover:bg-accent rounded-lg border border-accent transition-colors cursor-pointer flex items-center justify-center gap-2'>
  <ChevronDown className='w-4 h-4' /> Cargar más (X restantes)
</button>
```

### Botón de enlace (dentro de cards — ver más)
```jsx
<button className='mt-6 w-full py-2 text-sm font-medium text-on-body hover:text-accent hover:bg-hover transition-colors border-t border-divider cursor-pointer'>
  Ver más
</button>
```

### Payment method toggle
```jsx
<button className={`flex flex-col items-center justify-center p-3 border rounded-lg transition-colors cursor-pointer ${
  selected ? 'border-accent bg-accent text-surface hover:bg-accent/85' : 'border-divider bg-surface text-on-body hover:bg-hover'
}`}>
  <Icon className='w-6 h-6 mb-1' />
  <span className='text-xs font-medium'>Efectivo</span>
</button>
```

### Movement type toggle (AdjustmentModal)
```jsx
<button className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors cursor-pointer ${
  value === 'entry' ? 'border-emerald-300 bg-emerald-50 text-emerald-700' :
  value === 'exit' ? 'border-red-300 bg-red-50 text-red-700' :
  'border-outline bg-surface text-on-body hover:bg-hover'
}`}>
  Entrada
</button>
```

---

## 7. Patrón de Modales

### Overlay estándar
```jsx
<Modal
  isOpen={isOpen}
  onClose={onClose}
  title='Título'
  icon={IconName}
  iconColor='text-accent'  // opcional, default 'text-accent'
  size='md'                // 'sm' | 'md' | 'lg', default 'md'
  zIndex='z-50'            // 'z-50' | 'z-[70]', default 'z-50'
>
  {children}
</Modal>
```

### Header de modal (sticky con backdrop-blur)
```jsx
<section className='sticky top-0 bg-title-surface/50 backdrop-blur-3xl z-50 flex items-center justify-between px-6 py-3.5 border-b border-divider'>
  <h2 className='text-lg font-semibold flex items-center gap-2'>
    <Icon className='w-5 h-5 text-accent' />
    Título
  </h2>
  <button onClick={onClose} className='p-1 rounded-md text-accent hover:text-accent/85 border border-disabled hover:border-accent transition cursor-pointer'>
    <X className='w-5 h-5' />
  </button>
</section>
```

### Body de modal (form)
```jsx
<form onSubmit={handleSubmit} className='p-6 flex flex-col gap-4'>
  {/* inputs, selects, etc. */}
</form>
```

### Footer de modal
```jsx
<section className='flex justify-end gap-4 pt-4'>
  <button
    type='button'
    onClick={onClose}
    className='px-4 py-2 border border-outline text-on-body hover:bg-hover font-medium rounded-lg transition cursor-pointer'>
    Cancelar
  </button>
  <button
    type='submit'
    disabled={!isValid || submitting}
    className='px-4 py-2 bg-accent text-surface rounded-lg hover:bg-accent/85 font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'>
    {submitting ? <><Loader className='w-5 h-5 animate-spin' /> Guardando...</> : 'Guardar'}
  </button>
</section>
```

### Modal de confirmación (eliminar)
```jsx
<section className='fixed inset-0 bg-overlay backdrop-blur-xs w-full h-full flex items-center justify-center z-50 p-4'>
  <section className='bg-surface rounded-xl border border-outline shadow-lg w-full max-w-sm relative overflow-hidden'>
    <div className='flex items-center justify-between px-6 py-4 border-b border-divider'>
      <h2 className='text-lg font-semibold flex items-center gap-2'>
        <AlertTriangle className='w-5 h-5 text-red-600' />
        Confirmar
      </h2>
    </div>
    <div className='p-6'>
      <p className='text-on-body text-sm mb-6'>¿Estás seguro de eliminar este elemento?</p>
      <div className='flex gap-3 w-full'>
        <button onClick={onClose} className='flex-1 px-4 py-2 border border-outline text-on-body hover:bg-hover font-semibold rounded-lg transition cursor-pointer'>Cancelar</button>
        <button onClick={onConfirm} className='flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 cursor-pointer'>
          <Trash2 className='w-5 h-5' /> Eliminar
        </button>
      </div>
    </div>
  </section>
</section>
```

### Sale Ticket Modal (header azul acento)
```jsx
<div className='bg-accent p-4 text-surface flex justify-between items-center no-print sticky top-0'>
  <div className='flex items-center gap-2'>
    <ReceiptText className='w-5 h-5' />
    <span className='font-bold uppercase tracking-widest text-sm'>Ticket de Venta</span>
  </div>
  <button onClick={onClose} className='p-1 hover:bg-white/20 rounded-lg transition cursor-pointer'>
    <X className='w-6 h-6' />
  </button>
</div>
```

### Return Detail Modal (header rojo)
```jsx
<div className='bg-red-600 p-4 text-white flex justify-between items-center sticky top-0 no-print'>
  <span className='font-bold'>Detalle de Devolución</span>
  <button onClick={onClose} className='p-1 hover:bg-white/20 rounded-lg transition cursor-pointer'>
    <X className='w-6 h-6' />
  </button>
</div>
```

### Payment Modal (centrado, icono grande)
```jsx
<section className='fixed inset-0 bg-overlay backdrop-blur-xs w-full h-full flex items-center justify-center z-50 p-4'>
  <section className='bg-surface rounded-lg shadow-lg p-8 w-full max-w-sm mx-4 text-center'>
    <Loader className='w-16 h-16 text-accent animate-spin mx-auto mb-4' />
    <h2 className='text-xl font-bold text-on-surface mb-2'>Procesando pago</h2>
    <p className='text-sm text-muted'>Espera un momento...</p>
  </section>
</section>
```

### Loading spinner modal
```jsx
<section className='fixed inset-0 bg-overlay backdrop-blur-xs flex items-center justify-center z-[70]'>
  <div className='bg-surface p-6 rounded-lg shadow-lg'>
    <div className='animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full mx-auto' />
    <p className='text-sm text-muted mt-3'>Cargando detalle...</p>
  </div>
</section>
```

### Z-index de modales
| Modal | z-index |
|---|---|
| Confirm/Delete | `z-[60]` |
| Form/CRUD | `z-[70]` |
| Ticket/Print | `z-[70]` |
| Loading spinner | `z-[70]` |
| Mobile dropdown | `z-50` |

---

## 8. Patrón de Badges / Estados

### Badge genérico (rounded pill)
```jsx
<span className='px-2.5 py-0.5 text-xs font-medium rounded-full'>
```

### Estados de stock
| Estado | Clases |
|---|---|
| Stock normal | `bg-green-100 text-green-800` |
| Stock bajo (con icono) | `inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800` |
| Stock bajo (reportes) | `text-xs font-medium px-2 py-1 rounded-full bg-red-50 text-red-600` |
| Con stock (reportes) | `bg-emerald-50 text-emerald-600` |
| Sin control (reportes) | `bg-subtle text-muted` |
| Agotado (Sales POS) | `bg-red-100 text-red-800` |

### Estados de movimientos (Inventory)
| Tipo | Clases |
|---|---|
| Entrada | `bg-emerald-100 text-emerald-700` |
| Salida | `bg-red-100 text-red-700` |
| Venta | `bg-blue-100 text-blue-700` |
| Devolución | `bg-purple-100 text-purple-700` |

### Estados de suscripción (Billing)
| Estado | Clases |
|---|---|
| Activa | `text-green-600 bg-green-50 dark:bg-green-900/20` |
| Cancelada | `text-red-600 bg-red-50 dark:bg-red-900/20` |
| Expirada | `text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20` |
| Trial | `text-blue-600 bg-blue-50 dark:bg-blue-900/20` |

### Estados de pago (Payment History)
| Estado | Clases |
|---|---|
| Aprobado | `text-green-600 bg-green-50` |
| Pendiente | `text-yellow-600 bg-yellow-50` |
| Rechazado | `text-red-600 bg-red-50` |
| Reembolsado | `text-blue-600 bg-blue-50` |

### Auto-renew toggle label
| Estado | Clases |
|---|---|
| Activo | `text-green-600 bg-green-50` |
| Inactivo | `text-yellow-600 bg-yellow-50` |

### Track stock
| Estado | Clases |
|---|---|
| Controla stock | `bg-blue-100 text-blue-800` |
| Sin control | `bg-subtle text-muted` |

### Margen de ganancia
| Rango | Clases |
|---|---|
| >= 30% | `bg-green-100 text-green-800` |
| 10-29% | `bg-amber-100 text-amber-800` |
| < 10% | `bg-red-100 text-red-800` |

### Product grid badge (Sales POS)
```jsx
<span className='text-xs px-2 py-1 rounded-full font-medium bg-green-100 text-green-800'>Con stock</span>
<span className='text-xs px-2 py-1 rounded-full font-medium bg-red-100 text-red-800'>Agotado</span>
<span className='text-xs px-2 py-1 rounded-full font-medium bg-subtle text-on-body'>Sin control</span>
```

---

## 9. Patrón de Formularios

### Input de texto estándar
```jsx
<input
  type='text'
  value={value}
  onChange={onChange}
  placeholder='Placeholder'
  className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0'
/>
```

### Error state en input (con touched pattern)
```jsx
className={`w-full px-4 py-3 border rounded-md transition-all duration-300 focus:outline-none ${
  touched.field && errors.field
    ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-0'
    : 'border-divider focus:border-accent focus:ring-0'
}`}
{touched.field && errors.field && (
  <p className='text-xs font-semibold text-red-500'>{errors.field}</p>
)}
```

### Select
```jsx
<select
  value={value}
  onChange={onChange}
  className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0 text-on-surface'
>
  <option value=''>Seleccionar</option>
  {options.map(opt => <option key={opt.id} value={opt.id} className='text-select-input'>{opt.name}</option>)}
</select>
```

### Textarea
```jsx
<textarea
  value={value}
  onChange={onChange}
  placeholder='Placeholder'
  className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0 resize-none'
  rows={3}
/>
```

### Label
```jsx
<label className='block text-sm font-medium text-on-body mb-1'>Etiqueta <span className='text-red-500 font-bold'>*</span></label>
```

### Validación (error/success)
```jsx
{error && <p className='text-xs font-semibold text-red-500'>{error}</p>}
{success && <p className='text-xs font-semibold text-green-600'>{success}</p>}
```

### Password input con show/hide toggle
```jsx
<section className='relative flex items-center'>
  <input
    type={showPassword ? 'text' : 'password'}
    value={value}
    onChange={onChange}
    placeholder='Contraseña'
    className='w-full px-4 py-3 pr-10 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0'
  />
  <button
    type='button'
    onClick={() => setShowPassword(!showPassword)}
    className='absolute right-3 bg-transparent border-none cursor-pointer text-lg p-1 text-accent hover:scale-110 transition-transform duration-300'
  >
    {showPassword ? <EyeClosed /> : <Eye />}
  </button>
</section>
```

### Password requirements checklist
```jsx
{password && !errors.password && (
  <section className='bg-accent/10 border-l-4 border-accent p-3 rounded flex flex-col gap-1.5'>
    <p className='text-xs font-semibold text-on-surface'>Requisitos cumplidos:</p>
    <section className={`text-xs transition-colors duration-300 ${/[a-zA-Z]/.test(password) ? 'text-green-600 font-semibold' : 'text-muted'}`}>
      ✓ Contiene letras
    </section>
    <section className={`text-xs transition-colors duration-300 ${/[0-9]/.test(password) ? 'text-green-600 font-semibold' : 'text-muted'}`}>
      ✓ Contiene números
    </section>
    <section className={`text-xs transition-colors duration-300 ${password.length >= 8 ? 'text-green-600 font-semibold' : 'text-muted'}`}>
      ✓ Mínimo 8 caracteres
    </section>
  </section>
)}
```

### Confirm password match indicator
```jsx
{confirmPassword && password === confirmPassword && !errors.confirmPassword && (
  <p className='text-xs font-semibold text-green-600'>✓ Las contraseñas coinciden</p>
)}
```

### Date input
```jsx
<input
  type='date'
  value={value}
  onChange={onChange}
  className='border border-divider rounded-md px-4 py-3 text-sm focus:outline-none focus:border-accent focus:ring-0 transition-all duration-300'
/>
```

### Hidden date picker (calendario icono — OrderSidebar, SaleTicketModal)
```jsx
<span className='relative w-5 h-5 flex items-center justify-center'>
  <Calendar className='w-3.5 h-3.5 cursor-pointer hover:text-accent z-50' />
  <input
    type='date'
    value={date}
    onChange={onChange}
    className='absolute inset-0 opacity-0 border-0 cursor-pointer'
  />
</span>
```

### Checkbox inline
```jsx
<label className='flex items-center gap-3 cursor-pointer'>
  <input
    type='checkbox'
    className='w-4 h-4 text-accent border-divider rounded focus:ring-0 cursor-pointer'
  />
  <span className='text-sm text-on-body'>Etiqueta</span>
</label>
```

### Form field layout
```jsx
<section className='flex flex-col gap-2'>
  <label className='block text-sm font-medium text-on-body'>Etiqueta</label>
  <input ... />
  <p className='text-xs font-semibold text-red-500'>Error</p>
</section>
```

### PermissionSelector wrapper
```jsx
<section>
  <label className='block text-sm font-medium text-on-body mb-1 flex items-center gap-1.5'>
    <ShieldCheck className='w-4 h-4 text-accent' />
    Permisos por sección
  </label>
  <section className='border border-divider rounded-md px-3 py-1 bg-body/20'>
    <PermissionSelector
      value={permissions}
      onChange={setPermissions}
      role={formData.role}
    />
  </section>
</section>
```

---

## 10. Toggle Switch

```jsx
<label className='relative inline-flex items-center cursor-pointer'>
  <input type='checkbox' className='sr-only peer' checked={enabled} onChange={onToggle} />
  <div className="w-11 h-6 bg-hover-icon peer-focus:outline-none peer-focus:ring-0 rounded-full peer-checked:after:translate-x-full peer-checked:after:border-surface after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-surface after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
</label>
```

Usado en: Products (active/track stock), Account (dark mode), Settings (auto-renew).

---

## 11. Patrón de Wrappers de Iconos

### Icon wrapper en card headers
```jsx
<div className='p-2 rounded-lg bg-blue-50'>
  <Icon className='w-5 h-5 text-blue-600' />
</div>
```

| bg | text |
|---|---|
| `bg-blue-50` | `text-blue-600` |
| `bg-red-50` | `text-red-500` |
| `bg-yellow-50` | `text-yellow-600` |
| `bg-emerald-50` | `text-emerald-600` |

### Icon wrapper en métricas
```jsx
<div className='p-3 rounded-xl bg-blue-100'>
  <Icon className='w-5 h-5 text-blue-600' />
</div>
```

| bg | text |
|---|---|
| `bg-blue-100` | `text-blue-600` |
| `bg-green-100` | `text-green-600` |
| `bg-emerald-100` | `text-emerald-600` |
| `bg-purple-100` | `text-purple-600` |
| `bg-orange-100` | `text-orange-600` |
| `bg-amber-100` | `text-amber-600` |
| `bg-teal-100` | `text-teal-600` |

### Icon wrapper en settings/sidebar headers
```jsx
<div className='p-2 rounded-lg bg-accent/10'>
  <Icon className='w-5 h-5 text-accent' />
</div>
```

### Icono circular (confirmación)
```jsx
<div className='mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4'>
  <Trash2 className='w-6 h-6 text-red-600' />
</div>
```

---

## 12. Loading / Skeleton States

### MetricsSkeleton
```jsx
<section className='grid grid-cols-4 max-md:grid-cols-1 max-lg:grid-cols-2 gap-4'>
  {[1,2,3,4].map(i => (
    <div key={i} className='flex gap-4 justify-between items-center bg-surface border border-outline shadow-xs p-6 rounded-lg'>
      <div className='space-y-3 flex-1'>
        <div className='h-3 w-24 bg-hover-icon rounded animate-pulse' />
        <div className='h-8 w-20 bg-hover-icon rounded animate-pulse' />
      </div>
      <div className='h-12 w-12 bg-hover-icon rounded-md animate-pulse' />
    </div>
  ))}
</section>
```

### ChartSkeleton
```jsx
<section className='bg-surface border border-outline shadow-xs p-6 rounded-lg h-[400px]'>
  <div className='h-5 w-44 bg-hover-icon rounded animate-pulse mb-6' />
  <div className='h-[300px] flex items-end gap-2 px-4'>
    {[40, 70, 30, 90, 50, 60, 80].map((h, i) => (
      <div key={i} className='flex-1 bg-hover-icon rounded animate-pulse' style={{ height: `${h}%` }} />
    ))}
  </div>
</section>
```

### PieChartSkeleton
```jsx
<div className='w-48 h-48 bg-hover-icon rounded-full mx-auto animate-pulse' />
```

### TableSkeleton
```jsx
<section className='bg-surface border border-outline shadow-xs rounded-lg p-6'>
  <div className='space-y-4'>
    {[1,2,3,4,5].map(i => (
      <div key={i} className='flex gap-4'>
        <div className='h-4 bg-hover-icon rounded w-1/4 animate-pulse' />
        <div className='h-4 bg-hover-icon rounded w-1/3 animate-pulse' />
        <div className='h-4 bg-hover-icon rounded w-1/5 animate-pulse' />
        <div className='h-4 bg-hover-icon rounded w-1/6 animate-pulse' />
      </div>
    ))}
  </div>
</section>
```

### Loading spinner (en botones)
```jsx
<Loader className='w-5 h-5 animate-spin' />
```

### Full-page spinner
```jsx
<div className='animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full' />
```

---

## 13. Patrón de Navegación

### SideBar (`src/app/layout/SideBar.jsx`)

```jsx
<aside className={`fixed flex flex-col top-0 justify-between h-screen bg-surface z-30 transition-all duration-300 border-outline ${
  isCollapsed ? 'w-20' : 'w-64'
} ${
  isMobile ? 'max-lg:translate-x-0' : 'max-lg:translate-x-full'
} lg:left-0 lg:border-r max-lg:right-0 max-lg:border-l`}>
```

- **Animación**: `transition-all duration-300`
- **Mobile**: slide desde derecha, overlay `bg-overlay backdrop-blur-xs`
- **Active nav item**: `bg-accent/10 text-accent` / inactivo: `text-on-body hover:bg-accent/5 hover:text-accent`
- **Submenu**: toggle con `ChevronDown` (rota `rotate-180` al abrirse)
- **Logout**: `text-red-600`
- **Collapse button**: `PanelLeftClose` / `PanelLeftOpen`
- **User avatar**: `w-10 h-10 bg-hover-strong rounded-full`

### Header (`src/app/layout/Header.jsx`)

```jsx
<header className={`fixed bg-surface top-0 border-b border-outline right-0 z-50 transition-all duration-300 ${
  isCollapsed ? 'left-20' : 'left-64'
} max-lg:left-0 max-lg:w-full`}>
```

- Left: LogoSymbol (mobile) + Page title/description
- Right: Revenue stats + `Bell` icon + `MessageCircleQuestionMark` (support) + `Menu` (mobile toggle)
- Min-height: `min-h-16`

### Page title pattern
```jsx
<section className='flex flex-col gap-6'>
  <section>
    <h1 className='text-2xl font-bold'>Título</h1>
    <p className='text-on-body'>Descripción</p>
  </section>
  <section className='bg-surface border border-outline shadow-xs rounded-lg'>
    {/* contenido */}
  </section>
</section>
```

---

## 14. Patrón de Charts (Recharts)

### Área Chart (WeeklySalesChart)
```jsx
<ResponsiveContainer width="100%" height={300}>
  <AreaChart data={data}>
    <defs>
      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1} />
        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
      </linearGradient>
    </defs>
    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke='var(--divider)' />
    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted)' }} />
    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted)' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
    <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--outline)', borderRadius: '8px' }} />
    <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={3} fill="url(#colorRevenue)" />
  </AreaChart>
</ResponsiveContainer>
```

### Line Chart (GananciasReports)
- Multi-line: revenue `#0ea5e9`, profit `#10b981`, cost `#f97316`
- Misma configuración de grid/axis/tooltip que AreaChart

### Pie Chart skeleton y uso
```jsx
<PieChart>
  <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
    {data.map(entry => <Cell key={entry.name} fill={entry.color} />)}
  </Pie>
  <Tooltip />
</PieChart>
```

---

## 15. Patrones Feature-Specific

### Auth (Login / SignUp / Password Reset)

Layout centrado:
```jsx
<section className='flex justify-center place-items-center min-h-screen bg-body'>
  <section className='w-1/3 max-lg:w-2/4 max-md:w-11/12'>
    <section className='bg-surface p-6 md:p-10 shadow-xs rounded-lg border border-outline'>
      <h1 className='text-2xl font-bold text-center text-on-surface mb-2'>Título</h1>
      <p className='text-sm text-muted text-center mb-6'>Subtítulo</p>
      {/* form */}
      <button className='w-full py-3 px-6 font-semibold bg-accent text-surface hover:bg-accent/85 rounded-md cursor-pointer mb-2 disabled:opacity-60 disabled:cursor-not-allowed'>
        Ingresar
      </button>
    </section>
  </section>
</section>
```

Link: `text-accent font-semibold transition-all duration-300 hover:underline`

### SignUp Step Indicator
```jsx
<section className='flex items-center justify-center gap-3 mb-8'>
  <section className='flex items-center gap-2'>
    <span className='w-8 h-8 rounded-full bg-accent text-surface flex items-center justify-center text-sm font-bold'>1</span>
    <span className='text-sm font-semibold text-accent'>Datos</span>
  </section>
  <section className='w-12 h-0.5 bg-divider' />
  {/* más pasos... */}
</section>
```

### Sales POS — ProductGrid
```jsx
<button className={`bg-surface p-4 rounded-lg border transition-all duration-300 flex items-center justify-between group ${
  product.stock > 0
    ? 'border-divider hover:border-accent/85 hover:bg-hover cursor-pointer'
    : 'border-divider opacity-50 cursor-not-allowed bg-subtle grayscale'
}`}>
  <div className='text-left'>
    <p className='font-semibold text-on-surface text-sm'>{product.name}</p>
    <p className='text-xs text-muted'>{product.category}</p>
  </div>
  <div className='text-right'>
    <span className='text-sm font-bold text-on-surface'>{formatPrice(product.price)}</span>
  </div>
</button>
```

### Sales POS — OrderSidebar
```jsx
<section className='w-full lg:w-100 lg:h-[calc(100vh-120px)] lg:sticky lg:top-20 bg-surface border border-outline shadow-xs rounded-lg flex flex-col'>
  {/* Cart items: bg-subtle p-3 rounded-lg border border-divider-light */}
  {/* Quantity controls: flex items-center bg-surface border border-divider rounded-md overflow-hidden */}
  {/* Total section: bg-subtle border-t border-divider-light p-6 */}
  {/* Payment methods: grid grid-cols-2 gap-2 */}
</section>
```

Cart item row:
```jsx
<div className='bg-subtle p-3 rounded-lg border border-divider-light flex items-center justify-between'>
  <div>
    <p className='text-sm font-medium text-on-surface'>{item.name}</p>
    <p className='text-xs text-muted'>{formatPrice(item.price)} c/u</p>
  </div>
  <div className='flex items-center gap-2'>
    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className='w-7 h-7 rounded border border-outline flex items-center justify-center text-sm hover:bg-hover cursor-pointer'>−</button>
    <span className='w-8 text-center text-sm font-medium'>{item.quantity}</span>
    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className='w-7 h-7 rounded border border-outline flex items-center justify-center text-sm hover:bg-hover cursor-pointer'>+</button>
  </div>
</div>
```

### Return Modal — item selection
```jsx
<input type='checkbox' className='w-4 h-4 accent-red-600 cursor-pointer' />
<div className='flex items-center gap-1'>
  <button className='w-7 h-7 rounded border border-outline flex items-center justify-center text-sm hover:bg-hover cursor-pointer'>−</button>
  <span className='w-8 text-center text-sm font-medium'>{qty}</span>
  <button className='w-7 h-7 rounded border border-outline flex items-center justify-center text-sm hover:bg-hover cursor-pointer'>+</button>
</div>
<textarea placeholder='Motivo de la devolución (obligatorio)' className='w-full px-3 py-2 border border-divider rounded-md text-sm ...' required />
```

### Support Dropdown
```jsx
<section className='absolute top-full right-0 mt-2 bg-surface border border-outline rounded-xl shadow-lg w-72 z-50'>
  <a href='...' className='flex items-start gap-3 px-4 py-3 hover:bg-accent/5 transition'>
    <MessageCircle className='w-5 h-5 text-accent shrink-0' />
    <div>
      <p className='text-sm font-medium text-on-surface'>WhatsApp</p>
      <p className='text-xs text-muted'>Respuesta en 5 min</p>
    </div>
  </a>
</section>
```

---

## 16. Store (Zustand) & Helpers

### Store shape (`src/app/providers/store.js`)

```js
{
  user: {},           // Auth object completo
  token: null,        // Access token
  refreshToken: null, // Refresh token
  isCollapsed: false, // Sidebar colapsado (desktop)
  isMobile: false,    // Sidebar abierto (mobile)
  isDarkMode: false,  // Dark mode toggle
  products: [],       // Productos cacheados
  cart: [],           // Carrito { id, quantity, ...product }
  todayRevenue: 0,    // Ingresos del día cacheados
  categories: [],     // Categorías cacheadas
  saleDate: 'YYYY-MM-DD', // Fecha custom de venta
}
```

Acciones clave: `setLogin`, `setLogOut`, `addToCart` (incrementa si existe), `updateQuantity` (mínimo 1), `removeFromCart`, `clearCart`, `toggleDarkMode`, `setIsCollapsed`, `setIsMobile`, `setSaleDate`.

### useEscape hook (`src/shared/helpers/useEscape.js`)

Cierra modales con tecla Escape. Pasar `null` para deshabilitar.

---

## 17. Currency & Toast

### Currency formatting

```js
// Sin símbolo (usado en tablas, métricas)
new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(value)

// Con símbolo COP (usado en tickets, charts)
new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)
```

### Toast config (librería `sileo`)

```jsx
<Toaster
  position='top-right'
  toastOptions={{
    duration: 3000,
    style: { borderRadius: '10px' },
  }}
/>
```

Temas: dinámico según `isDarkMode`.

---

## 18. Tokens de Diseño — Referencia Rápida

### Mapeo de clases (light → semantic)

| Clase antigua | Clase nueva (semántica) |
|---|---|
| `bg-white` | `bg-surface` |
| `bg-gray-50` | `bg-body` o `bg-subtle` |
| `text-gray-900` | `text-on-surface` |
| `text-gray-700` | `text-on-body` |
| `text-gray-500` | `text-muted` |
| `text-gray-400` | `text-faint` |
| `border-gray-300` | `border-outline` |
| `border-gray-200` | `border-divider` |
| `border-gray-100` | `border-divider-light` |
| `bg-gray-900/50` | `bg-overlay backdrop-blur-xs` |
| `hover:bg-gray-50` | `hover:bg-hover` |
| `hover:bg-gray-100` | `hover:bg-hover-strong` |
| `bg-gray-300` | `bg-hover-icon` |
| `bg-primary-600` | `bg-accent` |
| `text-primary-600` | `text-accent` |
| `hover:bg-accent` | `hover:bg-accent/85` |
| `focus:ring-2 focus:ring-accent` | `focus:border-accent focus:ring-0` |

### Bordes

| Elemento | Clase |
|---|---|
| Card | `border border-outline` |
| Table header | `border-b border-divider` |
| Table rows | `border-b border-divider-light` |
| Input/Select | `border border-divider` |
| Modal separador | `border-b border-divider` |
| Botón close modal | `border border-disabled hover:border-accent` |

### Sombras

| Elemento | Clase |
|---|---|
| Card estándar | `shadow-xs` |
| Modal | `shadow-lg` |
| Botón primario (OrderSidebar) | `shadow-lg shadow-accent/20` |
| Botón activo en filtros | `shadow-xs` |

### Border radius

| Elemento | Clase |
|---|---|
| Card | `rounded-lg` |
| Table | `rounded-t-lg overflow-hidden` |
| Botón | `rounded-lg`, `rounded-md` |
| Badge | `rounded-full` |
| Input | `rounded-md` |
| Modal | `rounded-xl` |
| Icon wrapper | `rounded-lg`, `rounded-xl` |

### Tamaños de texto

| Elemento | Clase |
|---|---|
| Page title | `text-2xl font-bold` |
| Card title | `text-lg font-semibold` |
| Metric value | `text-2xl font-bold` |
| Table header | `text-xs uppercase tracking-wider` |
| Table cell | `text-sm` |
| Badge | `text-xs` |
| Button | `text-sm`, `font-medium`, `font-bold` |
| Input text | `text-sm` |
| Label | `text-sm font-medium` |

### Tamaños de iconos

| Contexto | Clase |
|---|---|
| Card headers | `w-5 h-5` |
| Filter pills | `w-4 h-4` |
| Table actions | `w-4 h-4` |
| Close modal | `w-6 h-6` |
| Confirm icon circle | `w-6 h-6` |
| Empty state | `w-12 h-12` |
| Payment modal | `w-16 h-16` |

### Espaciados

| Contexto | Clase |
|---|---|
| Card body | `p-6` |
| Card header | `px-6 py-4` |
| Table cells | `py-3 px-4` |
| Filter pills | `px-3 py-1.5` |
| Grid gap | `gap-4`, `gap-6` |
| Card header gap (icon + title) | `gap-2` |
| Filter buttons gap | `gap-1` |

---

## Verificación

Después de crear o modificar componentes UI, verifica:

1. `cd frontend && npm run lint` — ESLint sin errores nuevos
2. Los patrones coinciden con los definidos aquí (clases semánticas, estructura)
3. Responsive: tabla scroll horizontal, sidebar colapsable
4. Estados: loading → error → empty → success están cubiertos
5. No hay `hover:shadow-md` ni `hover:shadow-lg` en cards (solo en botones/tablas)
6. No se usan clases fijas `gray-*` o `primary-*` — usar tokens semánticos (`surface`, `accent`, `outline`, etc.)
7. Dark mode: verificar contraste con clase `.dark`
