import { Trophy, TrendingUp } from 'lucide-react'

export const TopProductsChart = ({ data = [] }) => {
    const formatCurrency = (value) => 
        new Intl.NumberFormat('es-CO', { 
            style: 'currency', 
            currency: 'COP', 
            maximumFractionDigits: 0 
        }).format(value)

    return (
        <section className='bg-white border border-gray-300 p-6 shadow-xs rounded-lg h-full flex flex-col'>
            <div className='flex items-center gap-2 text-primary-600 mb-6'>
                <Trophy className='w-5 h-5' />
                <h3 className='text-lg font-semibold text-gray-900'>Top 10 Productos</h3>
            </div>
            
            <div className='flex-1 space-y-4'>
                {data.length > 0 ? (
                    data.map((product, index) => (
                        <div key={index} className='flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-50 last:border-0 pb-3'>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                                index === 1 ? 'bg-gray-100 text-gray-700' :
                                index === 2 ? 'bg-orange-100 text-orange-700' :
                                'bg-blue-50 text-blue-600'
                            }`}>
                                {index + 1}
                            </div>
                            
                            <div className='flex-1 min-w-0 flex items-center justify-between gap-4'>
                                <div className='min-w-0'>
                                    <p className='text-sm font-semibold text-gray-900 truncate uppercase'>
                                        {product.name}
                                    </p>
                                    <p className='text-xs text-gray-500 font-medium mt-0.5'>
                                        {product.sales} unidades
                                    </p>
                                </div>
                                
                                <div className='flex flex-col items-end shrink-0'>
                                    <div className='flex items-center gap-1 text-green-600 font-bold text-sm'>
                                        {formatCurrency(product.totalRevenue)}
                                    </div>
                                    <div className='text-[10px] text-gray-400 flex items-center gap-1 uppercase font-medium'>
                                        <TrendingUp className='w-2.5 h-2.5' />
                                        Total
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className='h-full flex items-center justify-center text-gray-400 italic text-sm py-12'>
                        Sin datos de ventas
                    </div>
                )}
            </div>
        </section>
    )
}
