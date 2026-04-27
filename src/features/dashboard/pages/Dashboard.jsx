import { useEffect, useState } from 'react'
import { Metrics } from '../components/Metrics'
import { WeeklySalesChart } from '../components/WeeklySalesChart'
import { LowStockCard } from '../components/LowStockCard'
import { RecentSalesCard } from '../components/RecentSalesCard'
import { TopProductsChart } from '../components/TopProductsChart'
import {
    MetricsSkeleton,
    ChartSkeleton,
    LowStockSkeleton,
    TopProductsSkeleton,
    RecentSalesSkeleton
} from '../components/Skeletons'
import { getDashboardData } from '../helpers/getDashboardData'
import { useStore } from '../../../app/providers/store'

export const Dashboard = () => {
    const { user } = useStore()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const businessId = user?.data?.user?.id

    useEffect(() => {
        const loadData = async () => {
            if (!businessId) {
                setLoading(false)
                return
            }

            try {
                setLoading(true)
                const result = await getDashboardData(businessId)
                setData(result)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [businessId])

    if (error) {
        return (
            <div className='p-6 text-center text-red-600 bg-red-50 border border-red-200 rounded-lg'>
                Error al cargar el dashboard: {error}
            </div>
        )
    }

    return (
        <section className='space-y-6 pb-12'>
            {loading && (
                <section className='bg-primary-600/80 text-white p-8 rounded-xl shadow-sm animate-pulse'>
                    <div className='h-9 w-72 bg-white/20 rounded mb-2' />
                    <div className='h-5 w-56 bg-white/20 rounded' />
                </section>
            )}
            {!loading && (
                <section className='bg-primary-600 text-white p-8 rounded-xl shadow-sm'>
                    <h1 className='text-3xl font-bold mb-2'>
                        ¡Bienvenido de vuelta! 👋
                    </h1>
                    <p className='text-primary-100'>Aquí está el resumen de tu negocio hoy</p>
                </section>
            )}

            {data?.metrics ? <Metrics data={data.metrics} /> : <MetricsSkeleton />}

            <div className='grid grid-cols-3 max-xl:grid-cols-1 gap-6'>
                <div className='col-span-2 max-xl:col-span-1'>
                    {data?.weeklySales ? <WeeklySalesChart data={data.weeklySales} /> : <ChartSkeleton />}
                </div>
                <div>
                    {data?.lowStockItems ? <LowStockCard items={data.lowStockItems} /> : <LowStockSkeleton />}
                </div>
            </div>

            <div className='grid grid-cols-3 max-xl:grid-cols-1 gap-6'>
                <div className='col-span-2 max-xl:col-span-1 h-fit'>
                    {data?.topProducts ? <TopProductsChart data={data.topProducts} /> : <TopProductsSkeleton />}
                </div>
                <div className='col-span-1 max-xl:col-span-1'>
                    {data?.recentSales ? <RecentSalesCard sales={data.recentSales} /> : <RecentSalesSkeleton />}
                </div>
            </div>
        </section>
    )
}
