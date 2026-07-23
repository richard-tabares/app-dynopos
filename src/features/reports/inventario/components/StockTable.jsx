import { useState, useMemo, useEffect } from 'react'
import { Search, AlertTriangle, PackageCheck, Package, PackageX, Layers, ClipboardList, ChevronDown } from 'lucide-react'
import { normalizeSearch } from '../../../../shared/helpers/normalizeSearch'
import { useStore } from '../../../../app/providers/store'
import { getUnitLabel, ensureUnitsLoaded } from '../../../../shared/helpers/unitsOfMeasure'
import { ensureCategoriesLoaded } from '../../../../shared/helpers/ensureCategoriesLoaded'

const formatCurrency = (value) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)

const statusConfig = {
    sin_stock: { label: 'Sin Stock', color: 'text-red-600', bg: 'bg-disabled/70' },
    stock_bajo: { label: 'Bajo', color: 'text-orange-600', bg: 'bg-orange-50' },
    con_stock: { label: 'Normal', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    sin_control: { label: 'Sin Control', color: 'text-on-body', bg: 'bg-body' },
}

const stockFilters = [
    { value: 'all', label: 'Todos', icon: Layers, color: 'text-accent', bg: 'bg-red-800' },
    { value: 'sin_stock', label: 'Sin Stock', icon: PackageX, color: 'text-red-500', bg: 'bg-red-50' },
    { value: 'stock_bajo', label: 'Stock Bajo', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
    { value: 'con_stock', label: 'Con Stock', icon: PackageCheck, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { value: 'sin_control', label: 'Sin Control', icon: Package, color: 'text-muted', bg: 'bg-body' },
]

export const StockTable = ({ data = [] }) => {
    const unitsOfMeasure = useStore((state) => state.unitsOfMeasure)
    const setUnitsOfMeasure = useStore((state) => state.setUnitsOfMeasure)
    const categories = useStore((state) => state.categories)
    const setCategories = useStore((state) => state.setCategories)
    const user = useStore((state) => state.user)
    const businessId = user?.profile?.business_id || user?.data?.user?.id
    const [filter, setFilter] = useState('all')
    const [search, setSearch] = useState('')
    const [selectedCategoryIds, setSelectedCategoryIds] = useState([])
    const [visibleCount, setVisibleCount] = useState(10)

    useEffect(() => {
        ensureUnitsLoaded(unitsOfMeasure, setUnitsOfMeasure)
    }, [unitsOfMeasure, setUnitsOfMeasure])

    useEffect(() => {
        ensureCategoriesLoaded(categories, setCategories, businessId)
    }, [categories, setCategories, businessId])

    const selectedCategoryNames = useMemo(
        () => categories.filter((c) => selectedCategoryIds.includes(c.id)).map((c) => c.name),
        [categories, selectedCategoryIds],
    )

    const filtered = useMemo(() => {
        let result = filter === 'all' ? data : data.filter(d => d.stock_status === filter)
        if (search.trim()) {
            const term = normalizeSearch(search)
            result = result.filter(d =>
                normalizeSearch(d.product_name).includes(term) ||
                normalizeSearch(d.variation_name || '').includes(term) ||
                (d.sku && normalizeSearch(d.sku).includes(term)) ||
                (d.barcode && normalizeSearch(d.barcode).includes(term))
            )
        }
        if (selectedCategoryNames.length > 0) {
            result = result.filter((d) => d.category_name && selectedCategoryNames.includes(d.category_name))
        }
        return result
    }, [data, filter, search, selectedCategoryNames])

    const visible = filtered.slice(0, visibleCount)

    const getStatusConfig = (status) => statusConfig[status] || statusConfig.stock_bajo

    return (
        <section className='bg-surface border border-outline p-6 shadow-xs rounded-lg'>
            <div className='flex items-center gap-2 text-accent mb-4'>
                <ClipboardList className='w-5 h-5' />
                <h3 className='text-lg font-semibold text-on-surface'>Estado de Inventario</h3>
            </div>

            <div className='relative mb-4'>
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-faint' />
                <input
                    type='text'
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setVisibleCount(10) }}
                    placeholder='Buscar por código o nombre...'
                    className='w-full border border-divider rounded-md pl-10 pr-3 py-3 text-sm focus:outline-none focus:border-accent focus:ring-0 transition-all duration-300'
                />
            </div>

            <div className='flex gap-2 bg-disabled/70 rounded-lg p-1 w-fit max-w-full overflow-x-auto scrollbar-none mb-4'>
                {stockFilters.map((f) => {
                    const Icon = f.icon
                    return (
                        <button
                            key={f.value}
                            onClick={() => setFilter(f.value)}
                            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                                filter === f.value
                                    ? 'bg-surface shadow-xs text-on-surface'
                                    : 'text-muted hover:text-on-body hover:bg-hover'
                            }`}
                        >
                            <Icon className={`w-4 h-4 ${f.color}`} />
                            {f.label}
                        </button>
                    )
                })}
            </div>

            {categories.length > 0 && (
                <div className='flex flex-wrap items-center gap-2 mb-4'>
                    {categories.map((cat) => {
                        const isSelected = selectedCategoryIds.includes(cat.id)
                        return (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    setSelectedCategoryIds((prev) =>
                                        prev.includes(cat.id)
                                            ? prev.filter((id) => id !== cat.id)
                                            : [...prev, cat.id],
                                    )
                                    setVisibleCount(10)
                                }}
                                className={`rounded-full px-3.5 py-1.5 text-sm font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                                    isSelected
                                        ? 'bg-surface text-accent border-accent'
                                        : 'bg-surface text-on-surface border-divider hover:border-accent/50'
                                }`}>
                                {cat.name}
                            </button>
                        )
                    })}
                </div>
            )}

            <div className='overflow-x-auto'>
                {visible.length > 0 ? (
                    <>
                        <table className='w-full text-sm overflow-hidden rounded-t-lg'>
                            <thead>
                                <tr className='bg-subtle border-b border-divider text-muted uppercase text-xs tracking-wider'>
                                    <th className='text-left py-3 px-4 font-medium'>Producto</th>
                                    <th className='text-left py-3 px-4 font-medium'>Categoría</th>
                                    <th className='text-right py-3 px-4 font-medium'>Stock Actual</th>
                                    <th className='text-right py-3 px-4 font-medium'>Stock Mín.</th>
                                    <th className='text-right py-3 px-4 font-medium'>Costo Unit.</th>
                                    <th className='text-right py-3 px-4 font-medium'>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visible.map((item, i) => (
                                    <tr key={i} className='border-b border-divider-light hover:bg-hover' onclick={() => {}}>
                                        <td className='py-3 px-4 font-medium text-on-surface'>
                                            {item.variation_name && item.variation_name !== 'Default' ? (
                                                <span className='inline-flex items-center gap-2'>
                                                    <span>{item.product_name}</span>
                                                    {item.variation_type && (
                                                        <span className='px-2.5 py-0.5 text-xs font-medium bg-accent/10 text-accent rounded-full'>
                                                            {item.variation_type.toLowerCase()}
                                                        </span>
                                                    )}
                                                    <span className='font-medium text-on-surface'>{item.variation_name}</span>
                                                </span>
                                            ) : (
                                                <span className='font-medium text-on-surface'>{item.product_name}</span>
                                            )}
                                        </td>
                                        <td className='py-3 px-4 text-muted'>{item.category_name || 'Sin categoría'}</td>
                                        <td className='py-3 px-4 text-right'>{item.stock_status === 'sin_control' ? '—' : `${item.current_stock} ${getUnitLabel(item.unit_of_measure_id, unitsOfMeasure)}`}</td>
                                        <td className='py-3 px-4 text-right'>{item.stock_status === 'sin_control' ? '—' : item.min_stock}</td>
                                        <td className='py-3 px-4 text-right'>{item.unit_cost != null ? formatCurrency(item.unit_cost) : '—'}</td>
                                        <td className='py-3 px-4 text-right'>
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusConfig(item.stock_status).bg} ${getStatusConfig(item.stock_status).color}`}>
                                                {getStatusConfig(item.stock_status).label}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {visibleCount < filtered.length && (
                            <button
                                onClick={() => setVisibleCount(prev => prev + 10)}
                                className='w-full mt-4 py-2 text-sm font-medium text-on-surface hover:text-surface hover:bg-accent rounded-lg border border-accent transition-colors cursor-pointer flex items-center justify-center gap-2'
                            >
                                <ChevronDown className='w-4 h-4' /> Cargar más ({filtered.length - visibleCount} restantes)
                            </button>
                        )}
                    </>
                ) : (
                    <div className='text-center text-faint italic py-12'>Sin productos</div>
                )}
            </div>
        </section>
    )
}
