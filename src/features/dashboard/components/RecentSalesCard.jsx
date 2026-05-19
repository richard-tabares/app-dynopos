import { useState } from 'react'
import { ReceiptText, Clock } from 'lucide-react'
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
            <section className='bg-surface border border-outline p-6 shadow-xs rounded-lg flex flex-col'>
                <div className='flex items-center gap-2 text-accent mb-6'>
                <Clock className='w-5 h-5' />
                <h3 className='text-lg font-semibold text-on-surface'>Ventas Recientes</h3>
            </div>
                
                <div className='space-y-1'>
                    {displayedSales.length > 0 ? (
                        displayedSales.map((sale) => (
                            <div 
                                key={sale.id} 
                                className='flex items-center gap-4 p-3 hover:bg-hover cursor-pointer rounded-lg transition-colors border-b border-divider-light last:border-0'
                                onClick={() => setSelectedSale(sale)}
                            >
                                <ReceiptText className='w-5 h-5 text-accent shrink-0' />
                                <div className='flex-1 min-w-0'>
                                    <p className='text-sm font-semibold text-on-surface'>
                                        #{String(sale.id).padStart(4, '0')}
                                    </p>
                                    <p className='text-xs text-muted'>
                                        {sale.date} • {sale.itemsCount} {sale.itemsCount === 1 ? 'item' : 'items'}
                                    </p>
                                </div>
                                <div className='text-right'>
                                    <p className='text-sm font-bold text-on-surface'>
                                        ${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(sale.total)}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className='py-12 text-center text-faint italic text-sm'>
                            No se han registrado ventas hoy
                        </div>
                    )}
                </div>

                {visibleCount < sales.length && (
                    <button 
                        onClick={handleLoadMore}
                        className='mt-6 w-full py-2 text-sm font-medium text-on-surface hover:text-surface hover:bg-accent rounded-lg border border-accent transition-colors cursor-pointer'
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