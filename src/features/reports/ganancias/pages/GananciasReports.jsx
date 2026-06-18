import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { TrendingUp, DollarSign, Package, Percent, ArrowUpDown, Search, ChevronDown } from 'lucide-react'
import { DateRangeFilter } from '../../shared/components/DateRangeFilter'
import { getReports } from '../../shared/helpers/getReports'
import { useStore } from '../../../../app/providers/store'
import { normalizeSearch } from '../../../../shared/helpers/normalizeSearch'

const formatCurrency = (value) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)

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

export const GananciasReports = () => {
    const { user } = useStore()
    const businessId = user?.profile?.business_id || user?.data?.user?.id

    const [filter, setFilter] = useState('month')
    const [rangeStart, setRangeStart] = useState('')
    const [rangeEnd, setRangeEnd] = useState('')
    const [shouldFetch, setShouldFetch] = useState(true)
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState(null)
    const initialLoad = useRef(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [visibleCount, setVisibleCount] = useState(10)

    const fetchData = useCallback(async () => {
        if (!businessId || !shouldFetch) return
        setLoading(true)
        try {
            const dates = filter === 'range' ? { startDate: rangeStart, endDate: rangeEnd } : computeDates(filter)
            const result = await getReports(businessId, {
                section: 'profitability',
                filter,
                startDate: dates.startDate,
                endDate: dates.endDate,
            })
            setData(result.data)
        } catch (error) {
            console.error('Error loading profitability:', error)
        } finally {
            setLoading(false)
        }
    }, [businessId, filter, rangeStart, rangeEnd, shouldFetch])

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

    const summary = data?.summary
    const productMargins = useMemo(() => data?.productMargins || [], [data])
    const filteredMargins = useMemo(() => {
        if (!searchTerm.trim()) return productMargins
        const term = normalizeSearch(searchTerm)
        return productMargins.filter(p =>
            normalizeSearch(p.name).includes(term) ||
            normalizeSearch(p.variation_name || '').includes(term)
        )
    }, [productMargins, searchTerm])
    const visibleMargins = filteredMargins.slice(0, visibleCount)

    if (!shouldFetch && filter !== 'month') {
        return (
            <section className='space-y-6 pb-12'>
                <h2 className='text-2xl font-bold text-on-surface'>Rentabilidad</h2>
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
                <h1 className='text-2xl font-bold'>Rentabilidad</h1>
                <p className='text-on-body'>Análisis de ganancias, costos y márgenes por producto</p>
            </section>

            <DateRangeFilter
                value={filter}
                onChange={handleFilterChange}
                startDate={rangeStart}
                endDate={rangeEnd}
                compact
            />

            {loading ? (
                <div className='grid grid-cols-4 max-lg:grid-cols-2 max-sm:grid-cols-1 gap-4'>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className='bg-surface border border-outline p-6 rounded-lg animate-pulse'>
                            <div className='h-4 w-24 bg-gray-200 rounded mb-3' />
                            <div className='h-8 w-32 bg-gray-200 rounded' />
                        </div>
                    ))}
                </div>
            ) : (
                    <>
                    <section className='grid grid-cols-4 max-lg:grid-cols-2 max-sm:grid-cols-1 gap-4'>
                        <section className='bg-surface border border-outline p-6 rounded-lg shadow-xs flex items-center gap-4 min-w-0'>
                            <div className='p-3 bg-green-100 rounded-xl shrink-0'>
                                <DollarSign className='w-5 h-5 text-green-600' />
                            </div>
                            <div className='min-w-0'>
                                <p className='text-xs text-muted uppercase font-medium tracking-wider truncate'>Ingresos</p>
                                <p className='text-2xl font-bold text-on-surface truncate'>{formatCurrency(summary?.totalRevenue || 0)}</p>
                            </div>
                        </section>
                        <section className='bg-surface border border-outline p-6 rounded-lg shadow-xs flex items-center gap-4 min-w-0'>
                            <div className='p-3 bg-orange-100 rounded-xl shrink-0'>
                                <Package className='w-5 h-5 text-orange-600' />
                            </div>
                            <div className='min-w-0'>
                                <p className='text-xs text-muted uppercase font-medium tracking-wider truncate'>Costos</p>
                                <p className='text-2xl font-bold text-on-surface truncate'>{formatCurrency(summary?.totalCost || 0)}</p>
                            </div>
                        </section>
                        <section className='bg-surface border border-outline p-6 rounded-lg shadow-xs flex items-center gap-4 min-w-0'>
                            <div className='p-3 bg-emerald-100 rounded-xl shrink-0'>
                                <TrendingUp className='w-5 h-5 text-emerald-600' />
                            </div>
                            <div className='min-w-0'>
                                <p className='text-xs text-muted uppercase font-medium tracking-wider truncate'>Ganancia Neta</p>
                                <p className='text-2xl font-bold text-on-surface truncate'>{formatCurrency(summary?.totalProfit || 0)}</p>
                            </div>
                        </section>
                        <section className='bg-surface border border-outline p-6 rounded-lg shadow-xs flex items-center gap-4 min-w-0'>
                            <div className='p-3 bg-teal-100 rounded-xl shrink-0'>
                                <Percent className='w-5 h-5 text-teal-600' />
                            </div>
                            <div className='min-w-0'>
                                <p className='text-xs text-muted uppercase font-medium tracking-wider truncate'>Margen Global</p>
                                <p className='text-2xl font-bold text-on-surface truncate'>{summary?.overallMargin || 0}%</p>
                            </div>
                        </section>
                    </section>



                    <section className='bg-surface border border-outline p-6 rounded-lg shadow-xs'>
                        <div className='flex items-center gap-2 text-accent mb-4'>
                            <ArrowUpDown className='w-5 h-5' />
                            <h3 className='text-lg font-semibold text-on-surface'>Márgenes por Producto</h3>
                        </div>
                        <div className='relative mb-4'>
                            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-faint' />
                            <input
                                type='search'
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setVisibleCount(10) }}
                                placeholder='Buscar producto...'
                                className='w-full border border-divider rounded-md pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:border-accent focus:ring-0'
                            />
                        </div>
                        {filteredMargins.length > 0 ? (
                            <div className='overflow-x-auto'>
                                <table className='w-full text-sm'>
                                    <thead>
                                        <tr className='bg-subtle border-b border-divider text-muted uppercase text-xs tracking-wider'>
                                            <th className='text-left py-3 px-4 font-medium'>Producto</th>
                                            <th className='text-right py-3 px-4 font-medium'>Unidades Vendidas</th>
                                            <th className='text-right py-3 px-4 font-medium'>Margen</th>
                                            <th className='text-right py-3 px-4 font-medium'>Costo Unitario</th>
                                            <th className='text-right py-3 px-4 font-medium'>Costo Total</th>
                                            <th className='text-right py-3 px-4 font-medium'>Precio Unitario</th>
                                            <th className='text-right py-3 px-4 font-medium'>Valor Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {visibleMargins.map((p, i) => (
                                            <tr key={i} className='border-b border-divider-light hover:bg-hover'>
                                                <td className='py-3 px-4 font-medium text-on-surface'>
                                                    {p.variation_name && p.variation_name !== 'Default' ? (
                                                        <span className='inline-flex items-center gap-2'>
                                                            <span>{p.name}</span>
                                                            <span className='w-1.5 h-1.5 rounded-full bg-accent shrink-0' />
                                                            <span className='font-medium text-on-surface'>{p.variation_name}</span>
                                                        </span>
                                                    ) : (
                                                        p.name
                                                    )}
                                                </td>
                                                <td className='py-3 px-4 text-right text-on-body'>{p.totalQuantity}</td>
                                                <td className='py-3 px-4 text-right'>
                                                    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                                                        p.margin >= 30 ? 'bg-green-100 text-green-800' :
                                                        p.margin >= 10 ? 'bg-amber-100 text-amber-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                        {p.margin}%
                                                    </span>
                                                </td>
                                                <td className='py-3 px-4 text-right text-on-body'>{formatCurrency(p.avgUnitCost)}</td>
                                                <td className='py-3 px-4 text-right text-on-body'>{formatCurrency(p.totalCost)}</td>
                                                <td className='py-3 px-4 text-right text-on-body'>{formatCurrency(p.avgUnitPrice)}</td>
                                                <td className='py-3 px-4 text-right text-on-body'>{formatCurrency(p.totalRevenue)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {visibleCount < filteredMargins.length && (
                                    <button
                                        onClick={() => setVisibleCount(prev => prev + 10)}
                                        className='w-full mt-4 py-2 text-sm font-medium text-on-surface hover:text-surface hover:bg-accent rounded-lg border border-accent transition-colors cursor-pointer flex items-center justify-center gap-2'
                                    >
                                        <ChevronDown className='w-4 h-4' /> Cargar más ({filteredMargins.length - visibleCount} restantes)
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className='text-center text-faint italic py-12'>
                                Sin datos de productos
                            </div>
                        )}
                    </section>

                   
                </>
            )}
        </section>
    )
}
