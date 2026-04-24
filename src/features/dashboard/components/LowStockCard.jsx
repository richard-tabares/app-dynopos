import { AlertTriangle } from 'lucide-react'
import { Link } from 'react-router'

export const LowStockCard = ({ items = [] }) => {
    return (
        <section className='bg-white border border-gray-300 p-6 shadow-xs rounded-lg flex flex-col h-full'>
            <div className='flex items-center gap-2 text-orange-600 mb-2'>
                <AlertTriangle className='w-5 h-5' />
                <h3 className='text-lg font-semibold text-gray-900'>Stock Bajo</h3>
            </div>
            <p className='text-sm text-gray-500 mb-4'>
                {items.length} productos requieren reposición
            </p>

            <div className='flex-1 space-y-4 overflow-y-auto'>
                {items.length > 0 ? (
                    items.map((item) => (
                        <div key={item.id} className='flex justify-between items-center text-sm border-b border-gray-50 pb-2 last:border-0'>
                            <span className='text-gray-700 font-medium truncate pr-2'>{item.name}</span>
                            <div className='flex items-center gap-1 shrink-0'>
                                <span className='text-gray-500'>Stock:</span>
                                <span className='font-bold text-red-600'>{item.stock}</span>
                                <span className='text-gray-400'>/</span>
                                <span className='text-gray-500'>{item.min_stock}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className='h-full flex items-center justify-center text-gray-400 italic text-sm'>
                        No hay productos con stock bajo
                    </div>
                )}
            </div>

            <Link 
                to='/inventory'
                className='mt-6 text-center py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg border border-primary-200 transition-colors'
            >
                Ver más
            </Link>
        </section>
    )
}
