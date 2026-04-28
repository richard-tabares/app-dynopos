---
name: pos-report-architect
description: >
  Experto en generación de reportes para sistemas POS utilizando React,
  Node.js y Supabase, enfocado en optimización de consultas SQL (vistas,
  funciones RPC, índices) y visualización de datos con Recharts.
license: MIT
compatibility: opencode
metadata:
  audience: developers
  stack: react-node-supabase
---

## Principios Fundamentales

1. **Agregación en Base de Datos**: TODO cómputo agregado (SUM, AVG, COUNT) debe hacerse en Vistas SQL o funciones RPC de Supabase. NUNCA proceses datos agregados en el cliente — el frontend solo debe recibir datos listos para renderizar.
2. **Índices SQL**: Cada vista o función RPC incluye recomendaciones de `CREATE INDEX IF NOT EXISTS` para las columnas involucradas.
3. **Visualización con Recharts**: Usa exclusivamente `recharts` (ya en dependencias del proyecto) para gráficos. Sigue el patrón existente en `WeeklySalesChart.jsx`.
4. **Patrón Consistente**: Sigue exactamente los patrones del código existente: autenticación, helpers `apiFetch`, componentes con estados loading/error/empty/success, Tailwind v4, `Intl.NumberFormat('es-CO')`.
5. **Código Directo**: Genera el código completo y funcional de cada archivo. No dejes placeholders ni "TODO" sin implementar.

---

## Esquema de Base de Datos (Supabase)

### Tablas existentes

| Tabla | Columnas clave |
|---|---|
| `businesses` | `user_id` (PK, uuid) |
| `products` | `id` (int8 PK), `business_id` (uuid FK), `name`, `price`, `category_id`, `is_active`, `track_stock` |
| `categories` | `id` (int8 PK), `business_id` (uuid FK), `name` |
| `inventory` | `product_id` (int8 PK FK), `stock`, `min_stock` |
| `salesTickets` | `id` (int8 PK), `business_id` (uuid FK), `total_amount`, `payment_method`, `status`, `created_at` (date text YYYY-MM-DD) |
| `salesItems` | `id` (int8 PK), `sale_id` (int8 FK), `product_id` (int8 FK), `quantity`, `unit_price`, `subtotal`, `created_at` |
| `returns` | `id` (int8 PK), `sale_id` (int8 FK), `business_id` (uuid FK), `reason`, `total_amount`, `created_at` |
| `returns_items` | `return_id` (int8 FK), `product_id` (int8 FK), `quantity`, `unit_price`, `subtotal`, `created_at` |

### Notas importantes

- `created_at` se almacena como string en formato `YYYY-MM-DD` (fecha local, no timestamp).
- `payment_method` puede ser `'Efectivo'` o `'Transferencia'`.
- `status` en salesTickets es `'completed'` o `'returned'`.
- `track_stock` en `products` controla si se descuenta inventario (default `true`).
- Las RLS policies usan `auth.uid() = business_id`.

---

## Plan de Implementación

### Paso 1: Crear Vistas SQL en Supabase

Crearas codigo SQL segun el tipo de graficos que requiera el usuario

---

### Paso 2: Crear el Controlador Backend

Crea `backend/src/controllers/reportsControllers.js`. Sigue este patrón:

```js
import { supabase } from '../config/supabase.js'

const getClient = (req) => req.supabase || supabase

export const getReports = async (req, res) => {
    try {
        const { businessId } = req.params
        const { type = 'sales', startDate, endDate } = req.query
        const client = getClient(req)

        // Mapa de vistas según tipo de reporte dado por el usuario
        const viewMap = {
            sales: 'daily_sales_report',
            products: 'top_products_report',
            payments: 'payment_methods_report',
            stock: 'stock_report',
            returns: 'returns_report',
        }

        const viewName = viewMap[type]
        if (!viewName) {
            return res.status(400).json({ error: `Tipo de reporte inválido: ${type}` })
        }

        let query = client.from(viewName).select('*').eq('business_id', businessId)

        // Filtros de fecha (aplican a vistas que tienen sale_date, return_date)
        if (startDate) {
            query = query.gte('sale_date', startDate)
        }
        if (endDate) {
            query = query.lte('sale_date', endDate)
        }

        // Para stock y top_products, orden descendente
        if (type === 'products') {
            query = query.order('total_quantity_sold', { ascending: false }).limit(50)
        }
        if (type === 'stock') {
            query = query.order('stock_status', { ascending: true }).order('current_stock', { ascending: true })
        }
        if (type === 'sales' || type === 'returns') {
            query = query.order('sale_date', { ascending: false })
        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching report:', error)
            return res.status(500).json({ error: 'Error al obtener el reporte' })
        }

        res.json({ data, type, count: data?.length || 0 })
    } catch (error) {
        console.error('Error in getReports:', error)
        res.status(500).json({ error: error.message || 'Error interno del servidor' })
    }
}
```

#### Registro de ruta

Crea `backend/src/routes/reportsRoutes.js`:

```js
import { Router } from 'express'
import { authenticate } from '../middleware/authenticate.js'
import { getReports } from '../controllers/reportsControllers.js'
const router = Router()
router.get('/:businessId', authenticate, getReports)
export default router
```

En `backend/src/app.js`, agrega:

```js
import reportsRoutes from './routes/reportsRoutes.js'
// ...
app.use('/api/reports', reportsRoutes)
```

---

### Paso 3: Crear el Helper Frontend

Crea `frontend/src/features/reports/helpers/getReports.js`:

```js
import { apiFetch } from '../../../shared/helpers/apiFetch'

export const getReports = async (businessId, { type = 'sales', startDate, endDate, filters } = {}) => {
    const API_URL = import.meta.env.VITE_API_URL
    try {
        const params = new URLSearchParams({ type })
        if (startDate) params.append('startDate', startDate)
        if (endDate) params.append('endDate', endDate)

        const response = await apiFetch(`${API_URL}/api/reports/${businessId}?${params}`)
        return await response.json()
    } catch (error) {
        console.error('Error in getReports:', error)
        throw error
    }
}
```

---

### Paso 4: Crear Componentes Frontend

#### `frontend/src/features/reports/pages/Reports.jsx`

Debe ser el orquestador principal. Patrón de states:
- `reportType` (default `'sales'`)
- `startDate` / `endDate` (default últimos 30 días)
- `data` (null)
- `loading` (false)
- `error` (null)

**Flujo:** Usuario selecciona tipo y filtros → fetch → muestra componente según tipo.

**Layout:** Responsive, igual que Dashboard.jsx. Tabs de tipos de reporte.

**Manejo de estados:**
- Loading: `<ReportSkeletons type={reportType} />`
- Error: `<div className='bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg'>{error}</div>`
- Empty: `<div className='text-center text-gray-400 italic py-12'>Sin datos para el período seleccionado</div>`
- Success: Render del componente de reporte correspondiente

Usar estilos consistentes con el proyecto. Selector de tipo con botones tipo tabs (como `CategoryTabs.jsx`). Inputs date con estilo `border border-gray-300 rounded-lg px-3 py-2`.

#### `frontend/src/features/reports/components/ReportSkeletons.jsx`

Skeletons con `animate-pulse` para cada tipo de reporte. Sigue el patrón de `frontend/src/features/dashboard/components/Skeletons.jsx`.

---

### Paso 5: Sustituir el Placeholder

En `frontend/src/app/App.jsx`, el import y ruta ya existen para `<Reports />`. Solo asegúrate de que el import apunte a `Reports.jsx` actualizado.

---

## Patrones de Código Obligatorios

### Formato de moneda
```js
new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(value)
```

### Formato de moneda con símbolo
```js
new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)
```

### Estilos de contenedor (Tailwind v4)
```jsx
<section className='bg-white border border-gray-300 p-6 shadow-xs rounded-lg'>
```

### Estilos de tabla
```jsx
<div className='overflow-x-auto'>
    <table className='w-full text-sm'>
        <thead>
            <tr className='border-b border-gray-200 text-gray-500 uppercase text-xs tracking-wider'>
                <th className='text-left py-3 px-4 font-medium'>Columna</th>
            </tr>
        </thead>
        <tbody>
            {data.map((item, i) => (
                <tr key={i} className='border-b border-gray-100 hover:bg-gray-50'>
                    <td className='py-3 px-4'>{item.value}</td>
                </tr>
            ))}
        </tbody>
    </table>
</div>
```

### Gráfico Recharts (patrón base)
```jsx
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

<section className='bg-white border border-gray-300 p-6 shadow-xs rounded-lg h-[400px]'>
    <h3 className='text-lg font-semibold mb-6'>Título del Reporte</h3>
    <div className='h-[300px] w-full'>
        <ResponsiveContainer width='100%' height='100%'>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="valor" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    </div>
</section>
```

### Llamada API (helper)
```js
import { apiFetch } from '../../../shared/helpers/apiFetch'

export const getData = async (params) => {
    const API_URL = import.meta.env.VITE_API_URL
    const response = await apiFetch(`${API_URL}/api/reports/${businessId}?${params}`)
    return await response.json()
}
```

### Manejo de loading/error en página
```jsx
if (loading) return <ReportSkeletons type={reportType} />

if (error) return (
    <div className='bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg'>
        {error}
    </div>
)

if (!data || data.length === 0) return (
    <div className='text-center text-gray-400 italic py-12'>
        Sin datos para el período seleccionado
    </div>
)
```
---

## Verificación

Después de generar el código, verifica:

1. `cd backend && npm run dev` — el servidor inicia sin errores
2. `cd frontend && npm run build` — el build pasa sin errores
3. `cd frontend && npm run lint` — ESLint no reporta errores
4. La navegación a `/reports` funciona y muestra la UI
5. Al seleccionar un tipo de reporte y fechas, el fetch se completa sin errores 401
6. Los datos se muestran correctamente en gráficos/tablas
