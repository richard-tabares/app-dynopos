import { useState } from 'react'
import { ShoppingBag } from 'lucide-react'
import { SaleTicketModal } from '../../../shared/components/SaleTicketModal'

export const RecentSalesCard = ({ sales = [] }) => {
    const [visibleCount, setVisibleCount] = useState(10)
    const [selectedSale, setSelectedSale] = useState(null)

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 10)
    }

    const displayedSales = sales.slice(0, visibleCount)

    return (
        <>
            <section className='bg-white border border-gray-300 p-6 shadow-xs rounded-lg flex flex-col'>
                <h3 className='text-lg font-semibold text-gray-900 mb-6'>Ventas Recientes</h3>
                
                <div className='space-y-1'>
                    {displayedSales.length > 0 ? (
                        displayedSales.map((sale) => (
                            <div 
                                key={sale.id} 
                                className='flex items-center gap-4 p-3 hover:bg-primary-50 cursor-pointer rounded-lg transition-colors border-b border-gray-100 last:border-0'
                                onClick={() => setSelectedSale(sale)}
                            >
                                <div className='p-2 bg-blue-50 text-blue-600 rounded-lg'>
                                    <ShoppingBag className='w-5 h-5' />
                                </div>
                                <div className='flex-1 min-w-0'>
                                    <p className='text-sm font-semibold text-gray-900'>
                                        #{String(sale.id).padStart(4, '0')}
                                    </p>
                                    <p className='text-xs text-gray-500'>
                                        {sale.date} • {sale.itemsCount} {sale.itemsCount === 1 ? 'item' : 'items'}
                                    </p>
                                </div>
                                <div className='text-right'>
                                    <p className='text-sm font-bold text-gray-900'>
                                        ${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(sale.total)}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className='py-12 text-center text-gray-400 italic text-sm'>
                            No se han registrado ventas hoy
                        </div>
                    )}
                </div>

                {visibleCount < sales.length && (
                    <button 
                        onClick={handleLoadMore}
                        className='mt-6 w-full py-2 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50 transition-colors border-t border-gray-100'
                    >
                        Cargar más
                    </button>
                )}
            </section>

            <SaleTicketModal 
                isOpen={!!selectedSale} 
                onClose={() => setSelectedSale(null)} 
                sale={selectedSale} 
            />
        </>
    )
}