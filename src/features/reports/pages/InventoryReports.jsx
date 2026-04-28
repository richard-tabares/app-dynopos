import { useEffect, useState } from 'react'
import { StockTable } from '../components/StockTable'
import { InventoryValuation } from '../components/InventoryValuation'
import { ReportSkeletons } from '../components/ReportsSkeletons'
import { getReports } from '../helpers/getReports'
import { useStore } from '../../../app/providers/store'
import { AlertTriangle, PackageCheck, Package } from 'lucide-react'

const stockFilters = [
    { value: 'stock_bajo', label: 'Stock Bajo', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
    { value: 'con_stock', label: 'Con Stock', icon: PackageCheck, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { value: 'sin_control', label: 'Sin Control', icon: Package, color: 'text-gray-500', bg: 'bg-gray-50' },
]

export const InventoryReports = () => {
    const { user } = useStore()
    const businessId = user?.data?.user?.id
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [stockFilter, setStockFilter] = useState('stock_bajo')

    useEffect(() => {
        if (!businessId) return
        const load = async () => {
            try {
                setLoading(true)
                setError(null)
                const result = await getReports(businessId, { section: 'inventory' })
                setData(result.data)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [businessId])

    if (loading) return <ReportSkeletons type='inventory' />
    if (error) return <div className='bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg'>{error}</div>

    return (
        <section className='space-y-6 pb-12'>
            <h2 className='text-2xl font-bold text-gray-900'>Reporte de Inventario</h2>

            <div className='flex gap-2 bg-gray-100 rounded-lg p-1 w-fit'>
                {stockFilters.map((f) => {
                    const Icon = f.icon
                    return (
                        <button
                            key={f.value}
                            onClick={() => setStockFilter(f.value)}
                            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                                stockFilter === f.value
                                    ? 'bg-white shadow-xs text-gray-900'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <Icon className={`w-4 h-4 ${f.color}`} />
                            {f.label}
                        </button>
                    )
                })}
            </div>

            <StockTable data={data?.stockStatus || []} filter={stockFilter} />
            <InventoryValuation data={data?.inventoryValuation || []} />
        </section>
    )
}
