import { useEffect, useState, useCallback, useRef } from 'react'
import { DateRangeFilter } from '../components/DateRangeFilter'
import { ReturnsChart } from '../components/ReturnsChart'
import { ReturnsTable } from '../components/ReturnsTable'
import { ReturnDetailModal } from '../components/ReturnDetailModal'
import { ReportSkeletons } from '../components/ReportsSkeletons'
import { getReports } from '../helpers/getReports'
import { apiFetch } from '../../../shared/helpers/apiFetch'
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

export const AdminReports = () => {
    const { user } = useStore()
    const businessId = user?.data?.user?.id
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [filter, setFilter] = useState('month')
    const [rangeStart, setRangeStart] = useState('')
    const [rangeEnd, setRangeEnd] = useState('')
    const [shouldFetch, setShouldFetch] = useState(true)
    const [returnDetail, setReturnDetail] = useState(null)
    const [detailLoading, setDetailLoading] = useState(false)
    const initialLoad = useRef(true)

    const fetchData = useCallback(async () => {
        if (!businessId || !shouldFetch) return
        try {
            setLoading(true)
            setError(null)
            const dates = filter === 'range' ? { startDate: rangeStart, endDate: rangeEnd } : computeDates(filter)
            const result = await getReports(businessId, { section: 'returns', filter, startDate: dates.startDate, endDate: dates.endDate })
            setData(result.data)
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

    const handleReturnClick = async (returnItem) => {
        setDetailLoading(true)
        try {
            const API_URL = import.meta.env.VITE_API_URL
            const response = await apiFetch(`${API_URL}/api/reports/${businessId}?section=return_detail&returnDate=${returnItem.return_date}`)
            const result = await response.json()
            if (result.data) {
                setReturnDetail(result.data)
            }
        } catch (err) {
            console.error('Error loading return detail:', err)
        } finally {
            setDetailLoading(false)
        }
    }

    if (!shouldFetch && filter !== 'month') {
        return (
            <section className='space-y-6 pb-12'>
                <h2 className='text-2xl font-bold text-gray-900'>Reporte Administrativo</h2>
                <DateRangeFilter value={filter} onChange={handleFilterChange} startDate={rangeStart} endDate={rangeEnd} />
                <div className='text-center text-gray-400 italic py-12'>
                    Selecciona una fecha de inicio y fin para ver los resultados
                </div>
            </section>
        )
    }

    if (loading) return <ReportSkeletons type='returns' />
    if (error) return <div className='bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg'>{error}</div>

    return (
        <section className='space-y-6 pb-12'>
            <h2 className='text-2xl font-bold text-gray-900'>Reporte Administrativo</h2>

            <DateRangeFilter value={filter} onChange={handleFilterChange} startDate={rangeStart} endDate={rangeEnd} />

            <ReturnsChart data={data?.chart || []} showDayNames={filter === 'week'} />

            <ReturnsTable data={data?.list || []} onReturnClick={handleReturnClick} />

            {detailLoading && (
                <div className='fixed inset-0 bg-gray-900/50 flex items-center justify-center z-[70]'>
                    <div className='bg-white p-6 rounded-lg shadow-lg'>
                        <div className='animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto' />
                        <p className='text-sm text-gray-500 mt-3'>Cargando detalle...</p>
                    </div>
                </div>
            )}

            <ReturnDetailModal
                isOpen={!!returnDetail}
                onClose={() => setReturnDetail(null)}
                data={returnDetail}
            />
        </section>
    )
}
