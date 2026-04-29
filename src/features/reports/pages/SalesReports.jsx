import { useEffect, useState, useCallback, useRef } from 'react'
import { DateRangeFilter } from '../components/DateRangeFilter'
import { SalesLineChart } from '../components/SalesLineChart'
import { SalesCountChart } from '../components/SalesCountChart'
import { PaymentPieChart } from '../components/PaymentPieChart'
import { CategorySalesTable } from '../components/CategorySalesTable'
import { TopBottomProducts } from '../components/TopBottomProducts'
import { ProductPerformanceSearch } from '../components/ProductPerformanceSearch'
import { AvgTicketCard } from '../components/AvgTicketCard'
import { RecentSalesCard } from '../../dashboard/components/RecentSalesCard'
import { ReportSkeletons } from '../components/ReportsSkeletons'
import { getReports } from '../helpers/getReports'
import { useStore } from '../../../app/providers/store'

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

export const SalesReports = () => {
    const { user } = useStore()
    const businessId = user?.data?.user?.id
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [filter, setFilter] = useState('month')
    const [rangeStart, setRangeStart] = useState('')
    const [rangeEnd, setRangeEnd] = useState('')
    const [shouldFetch, setShouldFetch] = useState(true)
    const initialLoad = useRef(true)

    const fetchData = useCallback(async () => {
        if (!businessId || !shouldFetch) return
        try {
            setLoading(true)
            setError(null)
            const dates =
                filter === 'range'
                    ? { startDate: rangeStart, endDate: rangeEnd }
                    : computeDates(filter)

            const [salesResult, perfResult, recentResult] = await Promise.all([
                getReports(businessId, {
                    section: 'sales',
                    filter,
                    startDate: dates.startDate,
                    endDate: dates.endDate,
                }),
                getReports(businessId, {
                    section: 'performance',
                    filter,
                    startDate: dates.startDate,
                    endDate: dates.endDate,
                }),
                getReports(businessId, {
                    section: 'recent_sales',
                    filter,
                    startDate: dates.startDate,
                    endDate: dates.endDate,
                }),
            ])

            setData({
                ...salesResult.data,
                ...perfResult.data,
                recentSales: recentResult.data,
            })
        } catch (err) {
            setError(err.message)
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

    if (!shouldFetch && filter !== 'month') {
        return (
            <section className='space-y-6 pb-12'>
                <div className='flex items-center justify-between'>
                    <h2 className='text-2xl font-bold text-gray-900'>
                        Reporte de Ventas
                    </h2>
                </div>
                <DateRangeFilter
                    value={filter}
                    onChange={handleFilterChange}
                    startDate={rangeStart}
                    endDate={rangeEnd}
                />
                <div className='text-center text-gray-400 italic py-12'>
                    Selecciona una fecha de inicio y fin para ver los resultados
                </div>
            </section>
        )
    }

    if (loading) return <ReportSkeletons type='sales' />
    if (error)
        return (
            <div className='bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg'>
                {error}
            </div>
        )

    return (
        <section className='space-y-6 pb-12'>
            <div className='flex items-center justify-between'>
                <h2 className='text-2xl font-bold text-gray-900'>
                    Reporte de Ventas
                </h2>
            </div>

            <DateRangeFilter
                value={filter}
                onChange={handleFilterChange}
                startDate={rangeStart}
                endDate={rangeEnd}
            />

            <SalesLineChart
                data={data?.dailySales || []}
                showDayNames={filter === 'week'}
            />

            <div className='grid grid-cols-3 max-xl:grid-cols-1 gap-6'>
                <div className='col-span-1 max-xl:col-span-1'>
                    <TopBottomProducts
                        data={data?.topProducts || []}
                        type='top'
                    />
                </div>
                <div className='col-span-2 max-xl:col-span-1 space-y-6'>
                    <SalesCountChart
                        data={data?.dailySales || []}
                        showDayNames={filter === 'week'}
                    />
                    <PaymentPieChart data={data?.salesByPayment || []} />
                </div>
            </div>

            <div className='flex flex-col lg:flex-row gap-6'>
                <div className='w-full lg:w-1/3'>
                    <RecentSalesCard sales={data?.recentSales || []} />
                </div>
                <div className='w-full lg:w-2/3 space-y-6'>
                    <div className=''>
                        <ProductPerformanceSearch />
                    </div>
                    <div className='h-full'>
                        <CategorySalesTable
                            data={data?.salesByCategory || []}
                        />
                    </div>
                </div>
            </div>

            <div>
                <AvgTicketCard
                    overallAvgTicket={data?.overallAvgTicket || 0}
                    tickets={data?.avgTickets || []}
                    showDayNames={filter === 'week'}
                />
            </div>
        </section>
    )
}
