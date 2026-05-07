import { useState, useEffect, useCallback, useRef } from 'react'
import { TrendingUp, DollarSign, Package, Percent, BarChart4, ArrowUpDown } from 'lucide-react'
import { DateRangeFilter } from '../../shared/components/DateRangeFilter'
import { getReports } from '../../shared/helpers/getReports'
import { useStore } from '../../../../app/providers/store'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts'

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
    const businessId = user?.data?.user?.id

    const [filter, setFilter] = useState('month')
    const [rangeStart, setRangeStart] = useState('')
    const [rangeEnd, setRangeEnd] = useState('')
    const [shouldFetch, setShouldFetch] = useState(true)
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState(null)
    const initialLoad = useRef(true)

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
    const dailyProfit = data?.dailyProfit || []
    const productMargins = data?.productMargins || []

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
                <div className='grid grid-cols-4 max-lg:grid-cols-2 gap-4'>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className='bg-surface border border-outline p-6 rounded-lg animate-pulse'>
                            <div className='h-4 w-24 bg-gray-200 rounded mb-3' />
                            <div className='h-8 w-32 bg-gray-200 rounded' />
                        </div>
                    ))}
                </div>
            ) : (
                    <>
                    <section className='grid grid-cols-4 max-lg:grid-cols-2 gap-4'>
                        <section className='bg-surface border border-outline p-6 rounded-lg shadow-xs flex items-center gap-4'>
                            <div className='p-3 bg-green-100 rounded-xl'>
                                <DollarSign className='w-5 h-5 text-green-600' />
                            </div>
                            <div>
                                <p className='text-xs text-muted uppercase font-medium tracking-wider'>Ingresos</p>
                                <p className='text-2xl font-bold text-on-surface'>{formatCurrency(summary?.totalRevenue || 0)}</p>
                            </div>
                        </section>
                        <section className='bg-surface border border-outline p-6 rounded-lg shadow-xs flex items-center gap-4'>
                            <div className='p-3 bg-orange-100 rounded-xl'>
                                <Package className='w-5 h-5 text-orange-600' />
                            </div>
                            <div>
                                <p className='text-xs text-muted uppercase font-medium tracking-wider'>Costos</p>
                                <p className='text-2xl font-bold text-on-surface'>{formatCurrency(summary?.totalCost || 0)}</p>
                            </div>
                        </section>
                        <section className='bg-surface border border-outline p-6 rounded-lg shadow-xs flex items-center gap-4'>
                            <div className='p-3 bg-emerald-100 rounded-xl'>
                                <TrendingUp className='w-5 h-5 text-emerald-600' />
                            </div>
                            <div>
                                <p className='text-xs text-muted uppercase font-medium tracking-wider'>Ganancia Neta</p>
                                <p className='text-2xl font-bold text-on-surface'>{formatCurrency(summary?.totalProfit || 0)}</p>
                            </div>
                        </section>
                        <section className='bg-surface border border-outline p-6 rounded-lg shadow-xs flex items-center gap-4'>
                            <div className='p-3 bg-teal-100 rounded-xl'>
                                <Percent className='w-5 h-5 text-teal-600' />
                            </div>
                            <div>
                                <p className='text-xs text-muted uppercase font-medium tracking-wider'>Margen Global</p>
                                <p className='text-2xl font-bold text-on-surface'>{summary?.overallMargin || 0}%</p>
                            </div>
                        </section>
                    </section>

                    <section className='bg-surface border border-outline p-6 rounded-lg shadow-xs'>
                        <div className='flex items-center gap-2 text-primary-600 mb-6'>
                            <BarChart4 className='w-5 h-5' />
                            <h3 className='text-lg font-semibold text-on-surface'>Costo vs Ingresos vs Ganancia</h3>
                        </div>
                        {dailyProfit.length > 0 ? (
                            <ResponsiveContainer width='100%' height={300}>
                                <LineChart data={dailyProfit}>
                                    <CartesianGrid strokeDasharray='3 3' />
                                    <XAxis dataKey='date' tick={{ fontSize: 12 }} />
                                    <YAxis tick={{ fontSize: 12 }} />
                                    <Tooltip formatter={(value) => formatCurrency(value)} />
                                    <Legend />
                                    {/* <Line type='monotone' dataKey='cost' name='Costos' stroke='#f97316' strokeWidth={2} dot={false} /> */}
                                    <Line type='monotone' dataKey='revenue' name='Ingresos' stroke='#0ea5e9' strokeWidth={2} dot={false} />
                                    <Line type='monotone' dataKey='profit' name='Ganancia' stroke='#10b981' strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className='text-center text-faint italic py-12'>
                                No hay datos en el período seleccionado
                            </div>
                        )}
                    </section>

                    <section className='bg-surface border border-outline p-6 rounded-lg shadow-xs'>
                        <div className='flex items-center gap-2 text-primary-600 mb-6'>
                            <ArrowUpDown className='w-5 h-5' />
                            <h3 className='text-lg font-semibold text-on-surface'>Márgenes por Producto</h3>
                        </div>
                        {productMargins.length > 0 ? (
                            <div className='overflow-x-auto'>
                                <table className='w-full text-sm'>
                                    <thead>
                                        <tr className='bg-subtle border-b border-divider text-muted uppercase text-xs tracking-wider'>
                                            <th className='text-left py-3 px-4 font-medium'>Producto</th>
                                            <th className='text-right py-3 px-4 font-medium'>Unidades Vendidas</th>
                                            <th className='text-right py-3 px-4 font-medium'>Costo Total</th>
                                            <th className='text-right py-3 px-4 font-medium'>Ingresos</th>
                                            <th className='text-right py-3 px-4 font-medium'>Margen</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productMargins.map((p, i) => (
                                            <tr key={i} className='border-b border-divider-light hover:bg-hover'>
                                                <td className='py-3 px-4 font-medium text-on-surface'>{p.name}</td>
                                                <td className='py-3 px-4 text-right text-on-body'>{p.totalQuantity}</td>
                                                <td className='py-3 px-4 text-right text-on-body'>{formatCurrency(p.totalCost)}</td>
                                                <td className='py-3 px-4 text-right text-on-body'>{formatCurrency(p.totalRevenue)}</td>
                                                <td className='py-3 px-4 text-right'>
                                                    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                                                        p.margin >= 30 ? 'bg-green-100 text-green-800' :
                                                        p.margin >= 10 ? 'bg-amber-100 text-amber-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                        {p.margin}%
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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
