import { useEffect, useState, useCallback } from 'react'
import { DateRangeFilter } from '../components/DateRangeFilter'
import { TopBottomProducts } from '../components/TopBottomProducts'
import { AvgTicketCard } from '../components/AvgTicketCard'
import { ProductPerformanceSearch } from '../components/ProductPerformanceSearch'
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

export const PerformanceReports = () => {
    const { user } = useStore()
    const businessId = user?.data?.user?.id
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [filter, setFilter] = useState('month')
    const [rangeStart, setRangeStart] = useState('')
    const [rangeEnd, setRangeEnd] = useState('')

    const fetchData = useCallback(async () => {
        if (!businessId) return
        try {
            setLoading(true)
            setError(null)
            const dates = filter === 'range' ? { startDate: rangeStart, endDate: rangeEnd } : computeDates(filter)
            const result = await getReports(businessId, { section: 'performance', filter, startDate: dates.startDate, endDate: dates.endDate })
            setData(result.data)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [businessId, filter, rangeStart, rangeEnd])

    useEffect(() => { fetchData() }, [fetchData])

    const handleFilterChange = ({ filter: newFilter, startDate, endDate }) => {
        setFilter(newFilter)
        if (newFilter === 'range') {
            if (startDate) setRangeStart(startDate)
            if (endDate) setRangeEnd(endDate)
        } else {
            setRangeStart('')
            setRangeEnd('')
        }
    }

    if (loading) return <ReportSkeletons type='performance' />
    if (error) return <div className='bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg'>{error}</div>

    return (
        <section className='space-y-6 pb-12'>
            <h2 className='text-2xl font-bold text-gray-900'>Reporte de Rendimiento</h2>

            <DateRangeFilter value={filter} onChange={handleFilterChange} startDate={rangeStart} endDate={rangeEnd} />

            <div className='grid grid-cols-2 max-md:grid-cols-1 gap-6'>
                <TopBottomProducts data={data?.topProducts || []} type='top' />
                <ProductPerformanceSearch />
            </div>

            <AvgTicketCard overallAvgTicket={data?.overallAvgTicket || 0} tickets={data?.avgTickets || []} />
        </section>
    )
}
