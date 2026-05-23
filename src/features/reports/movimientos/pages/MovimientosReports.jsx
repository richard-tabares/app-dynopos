import { useState, useEffect, useCallback, useRef } from 'react'
import { History, Search, ArrowDownCircle, ArrowUpCircle, ShoppingCart, Undo2, List } from 'lucide-react'
import { DateRangeFilter } from '../../shared/components/DateRangeFilter'
import { getReports } from '../../shared/helpers/getReports'
import { useStore } from '../../../../app/providers/store'

const typeConfig = {
    entry: { label: 'Entrada', icon: ArrowDownCircle, cls: 'bg-emerald-100 text-emerald-700' },
    exit: { label: 'Salida', icon: ArrowUpCircle, cls: 'bg-red-100 text-red-700' },
    sale: { label: 'Venta', icon: ShoppingCart, cls: 'bg-blue-100 text-blue-700' },
    return: { label: 'Devolución', icon: Undo2, cls: 'bg-purple-100 text-purple-700' },
}

const computeDates = (filter) => {
    const now = new Date()
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    if (filter === 'day') return { startDate: today, endDate: today }
    if (filter === 'week') {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        const s = `${weekAgo.getFullYear()}-${String(weekAgo.getMonth() + 1).padStart(2, '0')}-${String(weekAgo.getDate()).padStart(2, '0')}`
        return { startDate: s, endDate: today }
    }
    if (filter === 'month') {
        const monthAgo = new Date()
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        const s = `${monthAgo.getFullYear()}-${String(monthAgo.getMonth() + 1).padStart(2, '0')}-${String(monthAgo.getDate()).padStart(2, '0')}`
        return { startDate: s, endDate: today }
    }
    return { startDate: '', endDate: '' }
}

export const MovimientosReports = () => {
    const { user } = useStore()
    const businessId = user?.data?.user?.id

    const [filter, setFilter] = useState('month')
    const [rangeStart, setRangeStart] = useState('')
    const [rangeEnd, setRangeEnd] = useState('')
    const [shouldFetch, setShouldFetch] = useState(true)
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState([])
    const [typeFilter, setTypeFilter] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const initialLoad = useRef(true)

    const fetchData = useCallback(async () => {
        if (!businessId || !shouldFetch) return
        setLoading(true)
        try {
            const dates = filter === 'range' ? { startDate: rangeStart, endDate: rangeEnd } : computeDates(filter)
            const result = await getReports(businessId, {
                section: 'movements',
                filter,
                startDate: dates.startDate,
                endDate: dates.endDate,
                type: typeFilter || undefined,
            })
            setData(result.data || [])
        } catch (error) {
            console.error('Error loading movements:', error)
        } finally {
            setLoading(false)
        }
    }, [businessId, filter, rangeStart, rangeEnd, shouldFetch, typeFilter])

    useEffect(() => {
        if (initialLoad.current) {
            initialLoad.current = false
            setShouldFetch(true)
        }
        fetchData()
    }, [fetchData])

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

    const filtered = data.filter(m => {
        if (!searchTerm) return true
        const term = searchTerm.toLowerCase()
        return (
            (m.products?.name || '').toLowerCase().includes(term) ||
            (m.products?.sku || '').toLowerCase().includes(term) ||
            (m.products?.barcode || '').toLowerCase().includes(term) ||
            (m.notes || '').toLowerCase().includes(term)
        )
    })

    const typeOptions = [
        { value: '', label: 'Todos', icon: List },
        { value: 'entry', label: 'Entradas', icon: ArrowDownCircle },
        { value: 'exit', label: 'Salidas', icon: ArrowUpCircle },
        { value: 'sale', label: 'Ventas', icon: ShoppingCart },
        { value: 'return', label: 'Devoluciones', icon: Undo2 },
    ]

    if (!shouldFetch && filter !== 'month') {
        return (
            <section className='space-y-6 pb-12'>
                <h2 className='text-2xl font-bold text-on-surface'>Movimientos de Inventario</h2>
                <DateRangeFilter compact value={filter} onChange={handleFilterChange} startDate={rangeStart} endDate={rangeEnd} />
                <div className='text-center text-faint italic py-12'>
                    Selecciona una fecha de inicio y fin para ver los resultados
                </div>
            </section>
        )
    }

    return (
        <section className='space-y-6'>
            <section>
                <h1 className='text-2xl font-bold'>Movimientos de Inventario</h1>
                <p className='text-on-body'>Historial de entradas, salidas, ventas y devoluciones</p>
            </section>

            <DateRangeFilter compact value={filter} onChange={handleFilterChange} startDate={rangeStart} endDate={rangeEnd} />

            <section className='flex flex-wrap items-center gap-3'>
                <div className='flex gap-1 bg-subtle rounded-lg p-1'>
                    {typeOptions.map(opt => {
                        const Icon = opt.icon
                        return (
                        <button
                            key={opt.value}
                            onClick={() => setTypeFilter(opt.value)}
                            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                                typeFilter === opt.value
                                    ? 'bg-surface shadow-xs text-accent'
                                    : 'text-muted hover:text-on-body hover:bg-hover'
                            }`}>
                            <Icon className='w-4 h-4' />
                            {opt.label}
                        </button>
                        )
                    })}
                </div>
            </section>

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
                {loading ? (
                    <div className='p-8 space-y-4'>
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className='h-16 bg-gray-100 rounded animate-pulse' />
                        ))}
                    </div>
                ) : filtered.length > 0 ? (
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
                                {filtered.map((m) => {
                                    const config = typeConfig[m.type] || { label: m.type, icon: History, cls: 'bg-gray-100 text-gray-700' }
                                    const Icon = config.icon
                                    return (
                                        <tr key={m.id} className='border-b border-divider-light hover:bg-hover'>
                                            <td className='py-3 px-4 text-on-body whitespace-nowrap'>{m.created_at}</td>
                                            <td className='py-3 px-4 font-medium text-on-surface'>
                                                {m.products?.name || '—'}
                                                {m.products?.sku && <span className='text-muted text-xs ml-1'>({m.products.sku})</span>}
                                            </td>
                                            <td className='py-3 px-4'>
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full ${config.cls}`}>
                                                    <Icon className='w-3 h-3' />
                                                    {config.label}
                                                </span>
                                            </td>
                                            <td className='py-3 px-4 text-right font-bold text-on-body'>{m.quantity}</td>
                                            <td className='py-3 px-4 text-muted text-xs max-w-[200px] truncate'>{m.notes || '—'}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className='text-center text-faint italic py-12'>
                        No se encontraron movimientos
                    </div>
                )}
            </section>
        </section>
    )
}
