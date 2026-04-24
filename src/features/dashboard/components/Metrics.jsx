import { ShoppingCart, DollarSign, Package, AlertCircle } from 'lucide-react'

export const Metrics = ({ data }) => {
    const metrics = [
        {
            title: 'Ventas de hoy',
            value: data?.todaySales || 0,
            icon: ShoppingCart,
            colorIcon: 'bg-primary-100 text-primary-600',
        },
        {
            title: 'Ingresos del día',
            value: `$ ${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(data?.todayRevenue || 0)}`,
            icon: DollarSign,
            colorIcon: 'bg-green-100 text-green-600',
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
        <section className='grid grid-cols-4 max-md:grid-cols-1 max-lg:grid-cols-2 gap-4'>
            {metrics.map((metric, index) => (
                <section key={index} className='flex gap-4 justify-between items-center bg-white border border-gray-300 shadow-xs p-6 rounded-lg'>
                    <section className=''>
                        <section className='space-y-2'>
                            <h2 className='text-sm text-gray-500 uppercase font-medium tracking-wider'>{metric.title}</h2>
                            <p className='text-3xl font-bold text-gray-900'>{metric.value}</p>
                        </section>
                    </section>
                    <section>
                        <section className={`${metric.colorIcon} p-3 rounded-md`}>
                            <metric.icon className='w-6 h-6' />
                        </section>
                    </section>
                </section>
            ))}
        </section>
    )
}
