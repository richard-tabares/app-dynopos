import { Trophy, TrendingUp, TrendingDown } from 'lucide-react'

const formatCurrency = (value) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)

const normalizeItem = (item) => ({
    name: item.name || item.product_name,
    quantity: item.sales ?? item.total_quantity_sold,
    revenue: item.totalRevenue ?? item.total_revenue,
})

export const ProductsRanking = ({ data = [], type = 'top', title }) => {
    const isTop = type === 'top'
    const Icon = isTop ? Trophy : TrendingDown
    const defaultTitle = isTop
        ? 'Top 10 Productos Más Vendidos'
        : 'Top 10 Productos Menos Vendidos'
    const displayTitle = title || defaultTitle

    return (
        <section className='bg-surface border border-outline p-6 shadow-xs rounded-lg h-full flex flex-col'>
            <div className={`flex items-center gap-2 mb-6 ${isTop ? 'text-accent' : 'text-red-600'}`}>
                <Icon className='w-5 h-5' />
                <h3 className='text-lg font-semibold text-on-surface'>{displayTitle}</h3>
            </div>

            <div className='flex-1 space-y-4'>
                {data.length > 0 ? (
                    data.map((item, index) => {
                        const product = normalizeItem(item)
                        return (
                            <div key={index} className='flex items-center gap-3 p-2 hover:bg-hover rounded-lg transition-colors border-b border-divider-light last:border-0 pb-3'>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                    isTop
                                        ? index < 3
                                            ? 'bg-yellow-100 text-yellow-700'
                                            : 'bg-blue-50 text-blue-600'
                                        : 'bg-red-100 text-red-700'
                                }`}>
                                    {index + 1}
                                </div>

                                <div className='flex-1 min-w-0 flex items-center justify-between gap-4'>
                                    <div className='min-w-0'>
                                        <p className='text-sm font-semibold text-on-surface truncate uppercase'>
                                            {product.name}
                                        </p>
                                        <p className='text-xs text-muted font-medium mt-0.5'>
                                            {product.quantity} unidades
                                        </p>
                                    </div>

                                    <div className='flex flex-col items-end shrink-0'>
                                        <div className='flex items-center gap-1 text-green-600 font-bold text-sm'>
                                            {formatCurrency(product.revenue)}
                                        </div>
                                        <div className='text-[10px] text-faint flex items-center gap-1 uppercase font-medium'>
                                            <TrendingUp className='w-2.5 h-2.5' />
                                            Total
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className='h-full flex items-center justify-center text-faint italic text-sm py-12'>
                        Sin datos de {isTop ? 'ventas' : 'productos'}
                    </div>
                )}
            </div>
        </section>
    )
}
