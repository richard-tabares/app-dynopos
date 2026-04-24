import { Package, Boxes, AlertTriangle, DollarSign, AlertCircle } from 'lucide-react'

export const InventorySummary = ({ products = [] }) => {
    // Cálculos
    const totalProducts = products.length
    const stockTotal = products.reduce((acc, p) => acc + (p.inventory?.[0]?.stock || 0), 0)
    const lowStockProducts = products.filter(p => (p.inventory?.[0]?.stock || 0) <= (p.inventory?.[0]?.min_stock || 0))
    const lowStockCount = lowStockProducts.length
    const inventoryValue = products.reduce((acc, p) => acc + ((p.inventory?.[0]?.stock || 0) * (p.price || 0)), 0)

    const cards = [
        {
            title: 'Total Productos',
            value: totalProducts,
            icon: Boxes,
            color: 'bg-blue-50 text-blue-600',
            iconBg: 'bg-blue-100'
        },
        {
            title: 'Stock Total',
            value: stockTotal,
            icon: Package,
            color: 'bg-emerald-50 text-emerald-600',
            iconBg: 'bg-emerald-100'
        },
        {
            title: 'Stock Bajo',
            value: lowStockCount,
            icon: AlertTriangle,
            color: 'bg-amber-50 text-amber-600',
            iconBg: 'bg-amber-100'
        },
        {
            title: 'Valor Inventario',
            value: new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(inventoryValue),
            icon: DollarSign,
            color: 'bg-green-50 text-green-600',
            iconBg: 'bg-green-100'
        }
    ]

    return (
        <section className='flex flex-col gap-6'>
            {/* Panel de Alerta de Stock Bajo */}
            {lowStockCount > 0 && (
                <section className='bg-orange-50 border border-orange-200 rounded-xl p-6'>
                    <div className='flex items-start gap-4'>
                        <div className='p-2 bg-orange-100 rounded-lg text-orange-600'>
                            <AlertCircle className='w-6 h-6' />
                        </div>
                        <div className='flex-1'>
                            <h3 className='text-orange-900 font-bold text-lg'>Stock Bajo</h3>
                            <p className='text-orange-700 text-sm'>
                                {lowStockCount} productos requieren reposición
                            </p>
                        </div>
                    </div>
                </section>
            )}

            {/* Grid de Cards */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                {cards.map((card, index) => (
                    <div key={index} className='bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 transition-all hover:shadow-md'>
                        <div className={`p-3 rounded-xl ${card.iconBg}`}>
                            <card.icon className={`w-6 h-6 ${card.color.split(' ')[1]}`} />
                        </div>
                        <div>
                            <p className='text-sm font-medium text-gray-500 uppercase tracking-wider'>
                                {card.title}
                            </p>
                            <p className='text-2xl font-bold text-gray-900 mt-1'>
                                {card.value}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
