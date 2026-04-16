import { ArrowUpRight, ShoppingCart, DollarSign, Package, AlertCircle } from 'lucide-react'
export const Metrics = () => {
    const metrics = [
        {
            title: 'Ventas de hoy',
            value: '2',
            change: '+ 12.5%',
            icon: ShoppingCart,
            textColor: 'text-green-600',
            colorIcon: 'bg-primary-100 text-primary-600',
        },
        {
            title: 'Ingresos del día',
            value: '$ 56,700',
            change: '+ 8.5%',
            icon: DollarSign,
            textColor: 'text-green-600',
            colorIcon: 'bg-green-100 text-green-600',
        },
        {
            title: 'Productos en stock',
            value: '150',
            change: '+ 5.2%',
            icon: Package,
            textColor: 'text-gray-600',
            colorIcon: 'bg-purple-100 text-purple-600',
        },
        {
            title: 'Alertas de stock',
            value: '3',
            change: 'Requieren atención',
            icon: AlertCircle,
            textColor: 'text-orange-600',
            colorIcon: 'bg-orange-100 text-orange-600',
        }
    ]
    return (
        <section className='grid grid-cols-4 max-md:grid-cols-1 max-lg:grid-cols-2 gap-4'>
            {metrics.map((metric, index) => (
                <section key={index} className='flex gap-4 justify-between items-center bg-white border border-gray-300 shadow-xs p-6'>
                    <section className=''>
                        <section className='space-y-2'>
                            <h2 className='text-sm'>{metric.title}</h2>
                            <p className='text-3xl font-semibold'>{metric.value}</p>
                            <section className='flex items-center'>
                                <span className={`text-sm inline ${metric.textColor}`}>{metric.change}</span>
                            </section>
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
