import { useEffect, useState, useCallback, useRef } from 'react'
import { StockTable } from '../components/StockTable'
import { InventoryValuation } from '../components/InventoryValuation'
import { DateRangeFilter } from '../../shared/components/DateRangeFilter'
import { ReportSkeletons } from '../../shared/components/ReportsSkeletons'
import { getReports } from '../../shared/helpers/getReports'
import { useStore } from '../../../../app/providers/store'
import { History, Search, ArrowDownCircle, ArrowUpCircle, ShoppingCart, Undo2, List, ChevronDown } from 'lucide-react'
import { useFormatDate } from '../../../../shared/helpers/useFormatDate'
import { normalizeSearch } from '../../../../shared/helpers/normalizeSearch'
import { getUnitLabel, ensureUnitsLoaded } from '../../../../shared/helpers/unitsOfMeasure'
import { ensureCategoriesLoaded } from '../../../../shared/helpers/ensureCategoriesLoaded'
import { getProducts } from '../../../products/helpers/getProducts'
import { InventorySummary } from '../components/InventorySummary'

const typeConfig = {
    entry: { label: 'Entrada', icon: ArrowDownCircle, cls: 'bg-emerald-100 text-emerald-700' },
    exit: { label: 'Salida', icon: ArrowUpCircle, cls: 'bg-red-100 text-red-700' },
    sale: { label: 'Venta', icon: ShoppingCart, cls: 'bg-blue-100 text-blue-700' },
    return: { label: 'Devolución', icon: Undo2, cls: 'bg-purple-100 text-purple-700' },
}

const typeOptions = [
    { value: '', label: 'Todos', icon: List, cls: 'text-on-body' },
    { value: 'entry', label: 'Entradas', icon: ArrowDownCircle, cls: 'text-emerald-700' },
    { value: 'exit', label: 'Salidas', icon: ArrowUpCircle, cls: 'text-red-600' },
    { value: 'sale', label: 'Ventas', icon: ShoppingCart, cls: 'text-blue-700' },
    { value: 'return', label: 'Devoluciones', icon: Undo2, cls: 'text-red-600' },
]

const computeDates = (filter) => {
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(new Date())
    if (filter === 'day') return { startDate: today, endDate: today }
    if (filter === 'week') {
        const [y, m, d] = today.split('-').map(Number)
        const weekAgo = new Date(Date.UTC(y, m - 1, d))
        weekAgo.setUTCDate(weekAgo.getUTCDate() - 7)
        const s = weekAgo.toISOString().slice(0, 10)
        return { startDate: s, endDate: today }
    }
    if (filter === 'month') {
        const [y, m, d] = today.split('-').map(Number)
        const monthAgo = new Date(Date.UTC(y, m - 1, d))
        monthAgo.setUTCMonth(monthAgo.getUTCMonth() - 1)
        const s = monthAgo.toISOString().slice(0, 10)
        return { startDate: s, endDate: today }
    }
    return { startDate: '', endDate: '' }
}

export const InventoryMovements = () => {
    const { user, unitsOfMeasure, setUnitsOfMeasure, categories, setCategories } = useStore()
    const businessId = user?.profile?.business_id || user?.data?.user?.id

    const [allProducts, setAllProducts] = useState([])
    const [productsLoading, setProductsLoading] = useState(true)

    const [filter, setFilter] = useState('month')
    const [rangeStart, setRangeStart] = useState('')
    const [rangeEnd, setRangeEnd] = useState('')
    const [shouldFetch, setShouldFetch] = useState(false)

    const [inventoryData, setInventoryData] = useState(null)
    const [movementsData, setMovementsData] = useState([])

    const [invLoading, setInvLoading] = useState(true)
    const [invError, setInvError] = useState(null)
    const [movLoading, setMovLoading] = useState(false)
    const [movError, setMovError] = useState(null)

    const [typeFilter, setTypeFilter] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [movSelectedCategoryIds, setMovSelectedCategoryIds] = useState([])
    const [movVisibleCount, setMovVisibleCount] = useState(10)

    const formatDate = useFormatDate()

    const initialLoad = useRef(true)

    useEffect(() => {
        if (!businessId) return
        const loadProducts = async () => {
            try {
                const data = await getProducts(businessId)
                setAllProducts(data)
            } catch (err) {
                console.error(err)
            } finally {
                setProductsLoading(false)
            }
        }
        loadProducts()
    }, [businessId])

    useEffect(() => {
        ensureUnitsLoaded(unitsOfMeasure, setUnitsOfMeasure)
    }, [unitsOfMeasure, setUnitsOfMeasure])

    useEffect(() => {
        ensureCategoriesLoaded(categories, setCategories, businessId)
    }, [categories, setCategories, businessId])

    const activeProducts = allProducts.filter((p) => p.is_active !== false)

    useEffect(() => {
        if (!businessId) return
        const loadInventory = async () => {
            try {
                setInvLoading(true)
                const result = await getReports(businessId, { section: 'inventory' })
                setInventoryData(result.data)
                setInvLoading(false)
            } catch (err) {
                setInvError(err.message)
                setInvLoading(false)
            }
        }
        loadInventory()
    }, [businessId])

    const fetchMovements = useCallback(async () => {
        if (!businessId || !shouldFetch) return
        setMovLoading(true)
        setMovError(null)
        try {
            const dates = filter === 'range' ? { startDate: rangeStart, endDate: rangeEnd } : computeDates(filter)
            const result = await getReports(businessId, {
                section: 'movements',
                filter,
                startDate: dates.startDate,
                endDate: dates.endDate,
                type: typeFilter || undefined,
            })
            setMovementsData(result.data || [])
        } catch (err) {
            setMovError(err.message)
        } finally {
            setMovLoading(false)
        }
    }, [businessId, filter, rangeStart, rangeEnd, shouldFetch, typeFilter])

    useEffect(() => {
        if (initialLoad.current) {
            initialLoad.current = false
            setShouldFetch(true)
        }
        if (shouldFetch) fetchMovements()
    }, [fetchMovements, shouldFetch])

    const handleFilterChange = ({ filter: newFilter, startDate, endDate }) => {
        setFilter(newFilter)
        if (newFilter === 'range') {
            if (startDate) setRangeStart(startDate)
            if (endDate) {
                setRangeEnd(endDate)
                setShouldFetch(true)
            } else {
                setShouldFetch(false)
            }
        } else {
            setRangeStart('')
            setRangeEnd('')
            setShouldFetch(true)
        }
    }

    const filteredMovements = movementsData.filter(m => {
        if (searchTerm) {
            const term = normalizeSearch(searchTerm)
            const matchesSearch =
                normalizeSearch(m.products?.name || '').includes(term) ||
                normalizeSearch(m.product_variations?.sku || '').includes(term) ||
                normalizeSearch(m.product_variations?.barcode || '').includes(term) ||
                normalizeSearch(m.product_variations?.variation_name || '').includes(term) ||
                normalizeSearch(m.notes || '').includes(term)
            if (!matchesSearch) return false
        }
        if (movSelectedCategoryIds.length > 0) {
            const catId = m.products?.category_id
            if (!catId || !movSelectedCategoryIds.includes(catId)) return false
        }
        return true
    })


    const visibleMovements = filteredMovements.slice(0, movVisibleCount)
    const canShowMovements = shouldFetch || filter === 'month'

    return (
        <section className='space-y-6 pb-12'>

            <section>
                <h1 className='text-2xl font-bold'>Inventario y Movimientos</h1>
                <p className='text-on-body'>Estado del stock, valorización e historial de movimientos</p>
            </section>
            {productsLoading ? (
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4'>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className='h-28 bg-hover-icon rounded-lg animate-pulse' />
                    ))}
                </div>
            ) : (
                <InventorySummary products={activeProducts} />
            )}

            {invLoading ? (
                <ReportSkeletons type='inventory' />
            ) : invError ? (
                <div className='bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg'>{invError}</div>
            ) : (
                <>
                    <StockTable data={inventoryData?.stockStatus || []} />
                    <InventoryValuation data={inventoryData?.inventoryValuation || []} />
                </>
            )}

            <DateRangeFilter compact value={filter} onChange={handleFilterChange} startDate={rangeStart} endDate={rangeEnd} />

            <section className='bg-surface border border-outline p-6 shadow-xs rounded-lg'>
                <div className='flex items-center gap-2 text-accent mb-4'>
                    <History className='w-5 h-5' />
                    <h3 className='text-lg font-semibold text-on-surface'>Historial de Movimientos</h3>
                </div>

                <div className='relative mb-4'>
                    <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-faint' />
                    <input
                        type='text'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className='w-full border border-divider rounded-md pl-10 pr-3 py-3 text-sm focus:outline-none focus:border-accent focus:ring-0 transition-all duration-300'
                        placeholder='Buscar por código o nombre...'
                    />
                </div>
                <div className='flex gap-1 bg-disabled/70 overflow-x-auto scrollbar-none rounded-lg p-1 mb-4'>
                    {typeOptions.map(opt => {
                        const Icon = opt.icon
                        return (
                            <button
                                key={opt.value}
                                onClick={() => setTypeFilter(opt.value)}
                                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                                    typeFilter === opt.value
                                        ? 'bg-surface shadow-xs text-on-surface'
                                        : 'text-muted hover:text-on-body hover:bg-hover'
                                }`}>
                                <Icon className={`w-4 h-4 ${opt.cls}`} />
                                {opt.label}
                            </button>
                        )
                    })}
                </div>

                {categories.length > 0 && (
                    <div className='flex flex-wrap items-center gap-2 mb-4'>
                        {categories.map((cat) => {
                            const isSelected = movSelectedCategoryIds.includes(cat.id)
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => {
                                        setMovSelectedCategoryIds((prev) =>
                                            prev.includes(cat.id)
                                                ? prev.filter((id) => id !== cat.id)
                                                : [...prev, cat.id],
                                        )
                                        setMovVisibleCount(10)
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

                {!canShowMovements ? (
                    <div className='text-center text-faint italic py-12'>
                        Selecciona una fecha de inicio y fin para ver los resultados
                    </div>
                ) : movLoading ? (
                    <div className='p-8 space-y-4'>
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className='h-16 bg-hover-icon rounded animate-pulse' />
                        ))}
                    </div>
                ) : movError ? (
                    <div className='text-center text-red-600 py-12'>{movError}</div>
                ) : visibleMovements.length > 0 ? (
                    <div className='overflow-x-auto'>
                        <table className='w-full text-sm'>
                            <thead>
                                <tr className='bg-subtle border-b border-divider text-muted uppercase text-xs tracking-wider'>
                                    <th className='text-left py-3 px-4 font-medium'>Fecha</th>
                                    <th className='text-left py-3 px-4 font-medium'>Producto</th>
                                    <th className='text-left py-3 px-4 font-medium'>Tipo</th>
                                    <th className='text-right py-3 px-4 font-medium'>Cantidad</th>
                                    <th className='text-left py-3 px-4 font-medium'>Motivo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visibleMovements.map((m) => {
                                    const config = typeConfig[m.type] || { label: m.type, icon: History, cls: 'bg-gray-100 text-gray-700' }
                                    const Icon = config.icon
                                    return (
                                        <tr key={m.id} className='border-b border-divider-light hover:bg-hover'>
                                            <td className='py-3 px-4 text-on-body whitespace-nowrap'>{formatDate(m.created_at)}</td>
                                            <td className='py-3 px-4 font-medium text-on-surface'>
                                                {m.product_variations?.variation_name && m.product_variations?.variation_name !== 'Default' ? (
                                                    <span className='inline-flex items-center gap-2'>
                                                        <span>{m.products?.name || '—'}</span>
                                                        {m.products?.variation_type && (
                                                            <span className='px-2.5 py-0.5 text-xs font-medium bg-accent/10 text-accent rounded-full'>
                                                                {m.products.variation_type.toLowerCase()}
                                                            </span>
                                                        )}
                                                        <span className='font-medium text-on-surface'>{m.product_variations.variation_name}</span>
                                                    </span>
                                                ) : (
                                                    <span className='font-medium text-on-surface'>{m.products?.name || '—'}</span>
                                                )}
                                                {m.product_variations?.sku && <span className='text-muted text-xs ml-1'>({m.product_variations.sku})</span>}
                                            </td>
                                            <td className='py-3 px-4'>
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full ${config.cls}`}>
                                                    <Icon className='w-3 h-3' />
                                                    {config.label}
                                                </span>
                                            </td>
                                            <td className='py-3 px-4 text-right font-bold text-on-body'>{m.quantity} {getUnitLabel(m.product_variations?.unit_of_measure_id, unitsOfMeasure)}</td>
                                            <td className='py-3 px-4 text-muted text-xs max-w-[200px] truncate'>{m.notes || '—'}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                        {movVisibleCount < filteredMovements.length && (
                            <button
                                onClick={() => setMovVisibleCount(prev => prev + 10)}
                                className='w-full mt-4 py-2 text-sm font-medium text-on-surface hover:text-surface hover:bg-accent rounded-lg border border-accent transition-colors cursor-pointer flex items-center justify-center gap-2'
                            >
                                <ChevronDown className='w-4 h-4' /> Cargar más ({filteredMovements.length - movVisibleCount} restantes)
                            </button>
                        )}
                    </div>
                ) : (
                    <div className='text-center text-faint italic py-12'>No se encontraron movimientos</div>
                )}
            </section>
        </section>
    )
}
