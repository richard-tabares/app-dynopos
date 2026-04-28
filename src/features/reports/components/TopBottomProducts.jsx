import { Trophy, TrendingUp, TrendingDown } from 'lucide-react'

const formatCurrency = (value) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)

export const TopBottomProducts = ({ data = [], type = 'top' }) => {
    const isTop = type === 'top'
    const bgColor = isTop ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
    const Icon = isTop ? TrendingUp : TrendingDown
    const title = isTop ? 'Top 10 Productos Más Vendidos' : 'Top 10 Productos Menos Vendidos'

    return (
        <section className='bg-white border border-gray-300 p-6 shadow-xs rounded-lg h-full flex flex-col'>
            <div className='flex items-center gap-2 mb-6'>
                <div className={`p-2 rounded-lg ${isTop ? 'bg-yellow-50' : 'bg-red-50'}`}>
                    <Icon className={`w-5 h-5 ${isTop ? 'text-yellow-600' : 'text-red-600'}`} />
                </div>
                <h3 className='text-lg font-semibold text-gray-900'>{title}</h3>
            </div>

            <div className='flex-1 space-y-4'>
                {data.length > 0 ? (
                    data.map((product, index) => (
                        <div key={index} className='flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-50 last:border-0 pb-3'>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${bgColor}`}>
                                {index + 1}
                            </div>

                            <div className='flex-1 min-w-0 flex items-center justify-between gap-4'>
                                <div className='min-w-0'>
                                    <p className='text-sm font-semibold text-gray-900 truncate uppercase'>
                                        {product.product_name}
                                    </p>
                                    <p className='text-xs text-gray-500 font-medium mt-0.5'>
                                        {product.total_quantity_sold} unidades
                                    </p>
                                </div>

                                <div className='flex flex-col items-end shrink-0'>
                                    <div className='flex items-center gap-1 text-green-600 font-bold text-sm'>
                                        {formatCurrency(product.total_revenue)}
                                    </div>
                                    <div className='text-[10px] text-gray-400 flex items-center gap-1 uppercase font-medium'>
                                        Total
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className='h-full flex items-center justify-center text-gray-400 italic text-sm py-12'>
                        Sin datos de productos
                    </div>
                )}
            </div>
        </section>
    )
}
