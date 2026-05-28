import { AlertTriangle } from 'lucide-react'
import { Link } from 'react-router'

export const LowStockCard = ({ items = [] }) => {
    return (
        <section className='bg-surface border border-outline p-6 shadow-xs rounded-lg flex flex-col h-full'>
            <div className='flex items-center gap-2 text-orange-600 mb-2'>
                <AlertTriangle className='w-5 h-5' />
                <h3 className='text-lg font-semibold text-on-surface'>Stock Bajo</h3>
            </div>
            <p className='text-sm text-muted mb-4'>
                {items.length} productos requieren reposición
            </p>

            <div className='flex-1 space-y-4 overflow-y-auto'>
                {items.length > 0 ? (
                    items.map((item) => (
                        <div key={item.id} className='flex justify-between items-center text-sm border-b border-divider-light pb-2 last:border-0'>
                            <span className='text-on-body font-medium truncate pr-2'>
                                {item.name}{item.variationName ? ` - ${item.variationName}` : ''}
                            </span>
                            <div className='flex items-center gap-1 shrink-0'>
                                <span className='text-muted'>Stock:</span>
                                <span className='font-bold text-red-600'>{item.stock}</span>
                                <span className='text-faint'>/</span>
                                <span className='text-muted'>{item.min_stock}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className='h-full flex items-center justify-center text-faint italic text-sm'>
                        No hay productos con stock bajo
                    </div>
                )}
            </div>

            <Link 
                to='/inventory'
                className='mt-6 text-center py-2 text-sm font-medium text-on-surface hover:text-surface hover:bg-accent rounded-lg border border-accent transition-colors'
            >
                Ver más
            </Link>
        </section>
    )
}
