import { ShoppingCart, DollarSign, Package, AlertCircle, TrendingUp, Percent } from 'lucide-react'

export const Metrics = ({ data }) => {
    const metrics = [
        {
            title: 'Ventas de hoy',
            value: data?.todaySales || 0,
            icon: ShoppingCart,
            colorIcon: 'bg-blue-100 text-blue-600',
        },
        {
            title: 'Ingresos del día',
            value: `$ ${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(data?.todayRevenue || 0)}`,
            icon: DollarSign,
            colorIcon: 'bg-green-100 text-green-600',
        },
        {
            title: 'Ganancia del día',
            value: `$ ${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(data?.todayProfit || 0)}`,
            icon: TrendingUp,
            colorIcon: 'bg-emerald-100 text-emerald-600',
        },
        {
            title: 'Margen de ganancia',
            value: `${data?.todayMargin || 0}%`,
            icon: Percent,
            colorIcon: 'bg-teal-100 text-teal-600',
        },
        {
            title: 'Productos en stock',
            value: data?.activeProducts || 0,
            icon: Package,
            colorIcon: 'bg-purple-100 text-purple-600',
        },
        {
            title: 'Alertas de stock',
            value: data?.stockAlerts || 0,
            icon: AlertCircle,
            colorIcon: 'bg-orange-100 text-orange-600',
        }
    ]

    return (
        <section className='grid grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1 gap-4'>
            {metrics.map((metric, index) => (
                <section key={index} className='flex gap-4 justify-between items-center bg-surface border border-outline shadow-xs p-6 rounded-lg'>
                    <section>
                        <section className='space-y-2'>
                            <h2 className='text-sm text-muted uppercase font-medium tracking-wider'>{metric.title}</h2>
                            <p className='text-3xl font-bold text-on-surface'>{metric.value}</p>
                        </section>
                    </section>
                    <section>
                        <section className={`${metric.colorIcon} p-3 rounded-md`}>
                            <metric.icon className='w-5 h-5' />
                        </section>
                    </section>
                </section>
            ))}
        </section>
    )
}
