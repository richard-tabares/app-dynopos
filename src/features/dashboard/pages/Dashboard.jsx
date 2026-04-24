import { useEffect, useState } from 'react'
import { Metrics } from '../components/Metrics'
import { WeeklySalesChart } from '../components/WeeklySalesChart'
import { LowStockCard } from '../components/LowStockCard'
import { RecentSalesCard } from '../components/RecentSalesCard'
import { TopProductsChart } from '../components/TopProductsChart'
import { getDashboardData } from '../helpers/getDashboardData'
import { useStore } from '../../../app/providers/store'
import { Loader2 } from 'lucide-react'

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


    if (loading) {
        return (
            <div className='h-[80vh] flex items-center justify-center'>
                <Loader2 className='w-8 h-8 animate-spin text-primary-600' />
            </div>
        )
    }

    if (error) {
        return (
            <div className='p-6 text-center text-red-600 bg-red-50 border border-red-200 rounded-lg'>
                Error al cargar el dashboard: {error}
            </div>
        )
    }

    return (
        <section className='space-y-6 pb-12'>
            {/* Bienvenida */}
            <section className='bg-primary-600 text-white p-8 rounded-xl shadow-sm'>
                <h1 className='text-3xl font-bold mb-2'>
                    ¡Bienvenido de vuelta! 👋
                </h1>
                <p className='text-primary-100'>Aquí está el resumen de tu negocio hoy</p>
            </section>

            {/* Métricas principales */}
            <Metrics data={data?.metrics} />

            {/* Fila del medio: Gráfico principal y Stock Bajo */}
            <div className='grid grid-cols-3 max-xl:grid-cols-1 gap-6'>
                <div className='col-span-2 max-xl:col-span-1'>
                    <WeeklySalesChart data={data?.weeklySales} />
                </div>
                <div>
                    <LowStockCard items={data?.lowStockItems} />
                </div>
            </div>

            {/* Fila inferior: Ventas Recientes y Top Productos */}
            <div className='grid grid-cols-3 max-xl:grid-cols-1 gap-6'>
                <div className='col-span-2 max-xl:col-span-1 h-fit'>
                    <TopProductsChart data={data?.topProducts} />
                </div>
                <div className='col-span-1 max-xl:col-span-1'>
                    <RecentSalesCard sales={data?.recentSales} />
                </div>
            </div>
        </section>
    )
}
