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
2. **Responsive**: Las tablas usan `overflow-x-auto` para scroll horizontal en móviles.
3. **Colores**: Usar siempre los tokens del `@theme` en `App.css`: `primary-*` (sky blue), `accent-*` (emerald), `danger-*` (red).
4. **Moneda**: Formatear con `new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(value)` o `new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)` para símbolo.
5. **Estados**: Todo componente debe manejar: loading (skeleton/animate-pulse), error (bg-red-50 border-red-200), empty (text-gray-400 italic), success (datos renderizados).
6. **Sin hover en cards**: Las cards no deben tener efectos hover (`hover:shadow-md`, etc.). Solo tablas y botones tienen hover.

---

## 1. Patrón de Cards / Contenedores

### Card estándar (contenido simple)
```jsx
<section className='bg-white border border-gray-300 p-6 shadow-xs rounded-lg'>
```
Usado en: tablas de reportes, charts, tarjetas de dashboard, settings.

### Card con header bar (título + acciones)
```jsx
<section className='bg-white border border-gray-300 shadow-xs rounded-lg'>
  <section className='border-b border-gray-300 flex justify-between items-center px-6 py-4 bg-gray-50/50'>
    <h2 className='text-lg font-semibold flex items-center gap-2'>
      <Icon className='w-5 h-5 text-primary-600' />
      Título
      <span className='text-sm text-gray-500 font-medium'>Total (X)</span>
    </h2>
    <button className='flex items-center font-medium px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition cursor-pointer'>
      <Plus className='w-4 h-4 lg:w-5 lg:h-5 lg:mr-2' />
      Acción
    </button>
  </section>
  <section className='p-6 flex flex-col gap-4'>
    {/* contenido */}
  </section>
</section>
```
Usado en: Products, Categories, Inventory.

### Card de métricas (dashboard/summary)
```jsx
<div className='bg-white border border-gray-300 shadow-xs p-6 rounded-lg flex items-center gap-4'>
  <div className='p-3 rounded-xl bg-blue-100'>
    <Icon className='w-5 h-5 text-blue-600' />
  </div>
  <div>
    <p className='text-xs font-medium text-gray-500 uppercase tracking-wider'>Título</p>
    <p className='text-2xl font-bold text-gray-900 mt-1'>Valor</p>
  </div>
</div>
```
Usado en: Metrics.jsx, InventorySummary.jsx.

### Card con layout flex-col
```jsx
<section className='bg-white border border-gray-300 shadow-xs rounded-lg flex flex-col'>
```
Usado en: SalesHistoryCard, OrderSidebar, LowStockCard, RecentSalesCard.

### Banner de alerta (stock bajo)
```jsx
<section className='bg-orange-50 border border-orange-200 rounded-lg p-6'>
  <div className='flex items-start gap-4'>
    <div className='p-2 bg-orange-100 rounded-lg text-orange-600'>
      <AlertCircle className='w-6 h-6' />
    </div>
    <div className='flex-1'>
      <h3 className='text-orange-900 font-bold text-lg'>Stock Bajo</h3>
      <p className='text-orange-700 text-sm'>Mensaje</p>
    </div>
  </div>
</section>
```

### Card de error
```jsx
<div className='bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg'>
  {error}
</div>
```

---

## 2. Patrón de Tablas

### Contenedor de tabla
```jsx
<div className='overflow-x-auto px-6 pb-2'>
  <table className='w-full text-sm overflow-hidden rounded-t-lg'>
```
Nota: `px-6 pb-2` cuando la tabla está dentro de un `p-6`. `overflow-hidden rounded-t-lg` para bordes redondeados en el header gris.

### Encabezado (thead)
```jsx
<thead>
  <tr className='bg-gray-100 border-b border-gray-200 text-gray-500 uppercase text-xs tracking-wider'>
    <th className='py-3 px-4 font-medium text-left'>Texto</th>
    <th className='py-3 px-4 font-medium text-right'>Numérico</th>
  </tr>
</thead>
```
- Columnas de texto: `text-left`
- Columnas numéricas: `text-right`
- Columnas de acciones: `text-right`

### Filas (tbody)
```jsx
<tbody>
  {data.map((item, i) => (
    <tr key={i} className='border-b border-gray-100 hover:bg-gray-50'>
      <td className='py-3 px-4 font-medium text-gray-900'>{item.texto}</td>
      <td className='py-3 px-4 text-gray-700'>{item.nombre}</td>
      <td className='py-3 px-4 text-gray-500'>{item.categoria}</td>
      <td className='py-3 px-4 text-right font-bold text-gray-700'>{item.numero}</td>
      <td className='py-3 px-4 text-right text-gray-500'>{item.minimo}</td>
      <td className='py-3 px-2 text-right whitespace-nowrap'>{/* acciones */}</td>
    </tr>
  ))}
</tbody>
```

Tipos de celdas:
| Contenido | className |
|---|---|
| Texto principal (código, nombre) | `py-3 px-4 font-medium text-gray-900` |
| Texto secundario | `py-3 px-4 text-gray-700` |
| Texto terciario (categoría) | `py-3 px-4 text-gray-500` |
| Numérico | `py-3 px-4 text-right` + `font-bold` si es principal |
| Acciones (iconos) | `py-3 px-2 text-right whitespace-nowrap` |
| Badge/Estado | `py-3 px-4` |
| Clickable row | Añadir `cursor-pointer transition` y color hover específico (ej: `hover:bg-red-50`) |

### Botón Cargar más
```jsx
{visibleCount < filtered.length && (
  <button
    onClick={() => setVisibleCount(prev => prev + 10)}
    className='w-full mt-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition cursor-pointer'
  >
    Cargar más ({filtered.length - visibleCount} restantes)
  </button>
)}
```

### Estado vacío (texto simple)
```jsx
<div className='text-center text-gray-400 italic py-12 px-6'>
  Mensaje sin resultados
</div>
```

### Estado vacío (con icono - variante)
```jsx
<div className='flex flex-col items-center justify-center py-20 text-gray-400'>
  <Icon className='w-12 h-12 opacity-20 mb-4' />
  <p className='text-lg font-medium'>No se encontraron X</p>
</div>
```
Usado en: Sales.jsx (productos), OrderSidebar (carrito vacío).

---

## 3. Patrón de Inputs de Búsqueda

```jsx
<div className='relative'>
  <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
  <input
    type='search'
    value={searchTerm}
    onChange={(e) => { setSearchTerm(e.target.value); setVisibleCount(10) }}
    placeholder='Buscar...'
    className='w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500'
  />
</div>
```
Usado en: Products, Categories, Inventory, Sales, StockTable, InventoryValuation, ReturnsTable.

---

## 4. Patrón de Filtros / Botones Segmentados

### Grupo de filtros tipo segmented buttons
```jsx
<div className='flex gap-1 bg-gray-100 rounded-lg p-1 w-fit'>
  <button
    onClick={() => setFilter(value)}
    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
      activeFilter === value
        ? 'bg-white shadow-xs text-primary-600'
        : 'text-gray-500 hover:text-gray-700'
    }`}
  >
    <Icon className='w-4 h-4' />
    Etiqueta
  </button>
  {/* más botones... */}
</div>
```

Reglas:
- Contenedor: `bg-gray-100 rounded-lg p-1`
- Botón activo: `bg-white shadow-xs text-primary-600` (o `text-gray-900` si no se usa primary-600)
- Botón inactivo: `text-gray-500 hover:text-gray-700`
- Padding: `px-3 py-1.5`
- Texto: `text-sm font-medium`
- Siempre incluir icono con `flex items-center gap-2`
- Usar `w-fit` en el contenedor para que no se expanda

Usado en: Products (categorías), CategoryTabs (Sales), Inventory (stock status), DateRangeFilter (periodos), InventoryReports (stock status).

### Filtros de categorías dinámicas
Para botones de categorías que vienen de la BD, usar `Tag` icon en cada una y `Layers` en "Todas":
```jsx
<Layers className='w-4 h-4' />  {/* en "Todas/Todos" */}
<Tags className='w-4 h-4' />    {/* en cada categoría */}
```

### Filtros de fecha (DateRangeFilter)
Iconos por período:
| Período | Icono |
|---|---|
| Hoy | `Calendar` |
| Semana | `CalendarDays` |
| Mes | `CalendarRange` |
| Rango | `ArrowLeftRight` |

### Filtro de inventario (stock status)
| Filtro | Icono | Color del icono |
|---|---|---|
| Todos | `Layers` | `text-primary-600` |
| Stock Bajo | `AlertTriangle` | `text-red-500` |
| Con Stock | `PackageCheck` | `text-emerald-500` |
| Sin control | `Package` | `text-gray-500` |

---

## 5. Patrón de Botones

### Botón primario (relleno)
```jsx
<button className='px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition cursor-pointer disabled:opacity-50'>
  Texto
</button>
```

### Botón primario con icono (header de cards)
```jsx
<button className='flex items-center font-medium px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition cursor-pointer'>
  <Icon className='w-4 h-5 mr-2' />
  Texto
</button>
```

### Botón primario full-width (OrderSidebar)
```jsx
<button className='w-full py-4 bg-primary-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20 disabled:opacity-50 cursor-pointer'>
  Texto
</button>
```

### Botón secundario (outline)
```jsx
<button className='flex items-center font-medium px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-100 transition cursor-pointer'>
  <Icon className='w-4 h-5 mr-2' />
  Texto
</button>
```

### Botón secundario (gris relleno)
```jsx
<button className='px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition cursor-pointer'>
  Cancelar
</button>
```

### Botón danger
```jsx
<button className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition cursor-pointer disabled:opacity-50'>
  Eliminar
</button>
```

### Botón danger outline (cancelar en modales)
```jsx
<button className='flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition text-sm cursor-pointer'>
  Cancelar
</button>
```

### Botón icon-only (acciones de fila en tablas)
```jsx
<button className='hover:bg-gray-200 p-1.5 rounded-sm cursor-pointer' title='Editar'>
  <Edit2 className='w-4 h-4 text-primary-600' />
</button>
<button className='hover:bg-red-700 bg-red-600 text-white p-1.5 rounded-sm cursor-pointer' title='Eliminar'>
  <Trash2 className='w-4 h-4' />
</button>
```

### Botón "Cargar más" (load more)
```jsx
<button className='w-full mt-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition cursor-pointer'>
  Cargar más (X restantes)
</button>
```

### Botón de enlace (dentro de cards)
```jsx
<button className='mt-6 w-full py-2 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50 transition-colors border-t border-gray-100 cursor-pointer'>
  Ver más
</button>
```

---

## 6. Patrón de Modales

### Modal estándar
```jsx
<section className='fixed inset-0 bg-gray-900/50 w-full h-full flex items-center justify-center z-[70]'>
  <section className='bg-white rounded-lg shadow-2xl w-full max-w-md relative overflow-hidden'>

    {/* Header */}
    <div className='p-6 border-b border-gray-100 flex items-center justify-between'>
      <h3 className='text-lg font-bold text-gray-900'>Título</h3>
      <button onClick={onClose} className='p-1 hover:bg-gray-100 rounded-lg transition cursor-pointer'>
        <X className='w-5 h-5 text-gray-500' />
      </button>
    </div>

    {/* Body */}
    <div className='p-6'>
      {/* contenido */}
    </div>

    {/* Footer */}
    <div className='px-6 pb-6 flex gap-3'>
      <button onClick={onClose} className='flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition text-sm cursor-pointer'>
        Cancelar
      </button>
      <button onClick={onConfirm} className='flex-1 py-2.5 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 transition text-sm disabled:opacity-50 cursor-pointer'>
        Guardar
      </button>
    </div>
  </section>
</section>
```

### Modal de confirmación (eliminar)
```jsx
<section className='fixed inset-0 bg-gray-900/50 w-full h-full flex items-center justify-center z-[70]'>
  <section className='bg-white rounded-lg shadow-2xl w-full max-w-sm p-6'>
    <div className='text-center'>
      <div className='mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4'>
        <Trash2 className='w-6 h-6 text-red-600' />
      </div>
      <h3 className='text-lg font-bold text-gray-900 mb-2'>¿Eliminar?</h3>
      <p className='text-sm text-gray-500'>Mensaje de confirmación</p>
    </div>
    <div className='mt-6 flex gap-3'>
      <button onClick={onClose} className='flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition text-sm cursor-pointer'>Cancelar</button>
      <button onClick={onConfirm} className='flex-1 py-2.5 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition text-sm cursor-pointer'>Eliminar</button>
    </div>
  </section>
</section>
```

### Z-index de modales
| Modal | z-index |
|---|---|
| Confirm/Delete | `z-[60]` |
| Form/CRUD/Category | `z-[70]` |
| Ticket/Print | `z-[70]` |

---

## 7. Patrón de Badges / Estados

### Badge activo/inactivo
```jsx
<span className='px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full'>Activo</span>
<span className='px-2.5 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full'>Inactivo</span>
```

### Badge de stock
| Estado | Clases |
|---|---|
| Normal | `bg-green-100 text-green-800` |
| Bajo (con icono) | `inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800` |
| Stock bajo (reportes) | `text-xs font-medium px-2 py-1 rounded-full bg-red-50 text-red-600` |
| Con stock (reportes) | `bg-emerald-50 text-emerald-600` |
| Sin control (reportes) | `bg-gray-50 text-gray-600` |

### Badge de estado en grid de productos (Sales POS)
```jsx
<span className='px-2 py-1 rounded-full font-medium bg-green-100 text-green-800'>Stock</span>
<span className='px-2 py-1 rounded-full font-medium bg-red-100 text-red-800'>Agotado</span>
<span className='px-2 py-1 rounded-full font-medium bg-gray-100 text-gray-600'>Sin control</span>
```

---

## 8. Patrón de Formularios

### Input de texto estándar
```jsx
<input
  type='text'
  value={value}
  onChange={onChange}
  placeholder='Placeholder'
  className='w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400'
/>
```

### Input en modales
```jsx
<input
  type='text'
  value={value}
  onChange={onChange}
  placeholder='Placeholder'
  className='w-full px-4 py-2 border border-gray-300 rounded-lg duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-0'
/>
```

### Select
```jsx
<select
  value={value}
  onChange={onChange}
  className='w-full px-4 py-2 border border-gray-300 rounded-lg duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-0'
>
  <option value=''>Seleccionar</option>
  {options.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
</select>
```

### Select compacto (DateRangeFilter)
```jsx
<select className='border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500'>
```

### Date input (DateRangeFilter)
```jsx
<input
  type='date'
  value={value}
  onChange={onChange}
  className='border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500'
/>
```

### Textarea
```jsx
<textarea
  value={value}
  onChange={onChange}
  placeholder='Placeholder'
  className='w-full px-4 py-2 border border-gray-300 rounded-lg duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-0 resize-none'
  rows={3}
/>
```

### Label
```jsx
<label className='block text-sm font-medium text-gray-700 mb-1'>Etiqueta</label>
```
Variante compacta (DateRangeFilter):
```jsx
<label className='text-xs text-gray-500 mb-1 font-medium'>Etiqueta</label>
```

### Checkbox toggle switch
```jsx
<label className='relative inline-flex items-center cursor-pointer'>
  <input type='checkbox' className='sr-only peer' />
  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
</label>
```

---

## 9. Patrón de Wrappers de Iconos

### Icon wrapper en headers de card/chart
```jsx
<div className='p-2 rounded-lg bg-blue-50'>
  <Icon className='w-5 h-5 text-blue-600' />
</div>
```
Colores disponibles:
| bg | text |
|---|---|
| `bg-blue-50` | `text-blue-600` |
| `bg-red-50` | `text-red-500` |
| `bg-yellow-50` | `text-yellow-600` |
| `bg-emerald-50` | `text-emerald-600` |

### Icon wrapper en métricas (dashboard)
```jsx
<div className='p-3 rounded-md bg-primary-100 text-primary-600'>
  <Icon className='w-5 h-5' />
</div>
```
| bg | text |
|---|---|
| `bg-primary-100` | `text-primary-600` |
| `bg-green-100` | `text-green-600` |
| `bg-purple-100` | `text-purple-600` |
| `bg-orange-100` | `text-orange-600` |

### Icon wrapper en métricas de inventario
```jsx
<div className='p-3 rounded-xl bg-blue-100'>
  <Icon className='w-5 h-5 text-blue-600' />
</div>
```
| bg | text |
|---|---|
| `bg-blue-100` | `text-blue-600` |
| `bg-emerald-100` | `text-emerald-600` |
| `bg-amber-100` | `text-amber-600` |
| `bg-green-100` | `text-green-600` |

### Icono circular (confirmación, ranking)
```jsx
<div className='mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4'>
  <Trash2 className='w-6 h-6 text-red-600' />
</div>
```

---

## 10. Tokens de Diseño

### Colores (del `@theme` en App.css)
- `primary-50` a `primary-900`: gama sky blue (azul cielo)
- `accent-500`: `#10b981` (emerald), `accent-600`: `#059669`
- `danger-500`: `#ef4444`, `danger-600`: `#dc2626`

### Bordes
| Elemento | Clase |
|---|---|
| Card | `border border-gray-300` |
| Table header | `border-b border-gray-200` |
| Table rows | `border-b border-gray-100` |
| Input/Select | `border border-gray-300` |
| Modal separador | `border-b border-gray-100` |

### Sombras
| Elemento | Clase |
|---|---|
| Card estándar | `shadow-xs` |
| Modal | `shadow-lg`, `shadow-xl`, `shadow-2xl` |
| Botón primario (OrderSidebar) | `shadow-lg shadow-primary-600/20` |
| Botón activo en filtros | `shadow-xs` |

### Border radius
| Elemento | Clase |
|---|---|
| Card | `rounded-lg` |
| Table | `rounded-t-lg overflow-hidden` |
| Botón | `rounded-lg`, `rounded-md` |
| Badge | `rounded-full` |
| Input | `rounded-lg` |
| Modal | `rounded-lg`, `rounded-xl` |
| Icon wrapper | `rounded-lg`, `rounded-md`, `rounded-xl` |

### Tamaños de texto
| Elemento | Clase |
|---|---|
| Page title | `text-2xl font-bold` |
| Card title | `text-lg font-semibold` |
| Metric value | `text-2xl font-bold`, `text-3xl font-bold` |
| Table header | `text-xs uppercase tracking-wider` |
| Table cell | `text-sm` |
| Badge | `text-xs` |
| Button | `text-sm`, `font-medium`, `font-bold` |
| Input text | `text-sm` |
| Label | `text-sm font-medium` |
| Form input | `text-sm` |

### Tamaños de iconos
| Contexto | Clase |
|---|---|
| Card headers | `w-5 h-5` |
| Filter pills | `w-4 h-4` |
| Table actions | `w-4 h-4` |
| Modals (X close) | `w-5 h-5`, `w-6 h-6` |
| Confirm icon circle | `w-6 h-6` |
| Empty state | `w-12 h-12` |

### Espaciados
| Contexto | Clase |
|---|---|
| Card body | `p-6` |
| Card header | `px-6 py-4` |
| Table cells | `py-3 px-4` |
| Filter pills | `px-3 py-1.5` |
| Section gap (vertical) | `gap-6` |
| Grid gap | `gap-4`, `gap-6` |
| Card header gap (icon + title) | `gap-2` |
| Filter buttons gap | `gap-1` |

---

## Verificación

Después de crear o modificar componentes UI, verifica:

1. `cd frontend && npm run lint` — ESLint sin errores nuevos
2. Los patrones coinciden con los definidos aquí (clases Tailwind, estructura)
3. Responsive: la tabla hace scroll horizontal en móviles
4. Estados: loading → error → empty → success están cubiertos
5. No hay `hover:shadow-md` ni `hover:shadow-lg` en cards (solo en botones/tablas)
