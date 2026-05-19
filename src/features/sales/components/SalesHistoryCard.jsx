import { useState } from 'react'
import { ReceiptText, RotateCcw, History } from 'lucide-react'
import { SaleTicketModal } from '../../../shared/components/SaleTicketModal'
import { ReturnModal } from './ReturnModal'

export const SalesHistoryCard = ({ sales = [], onReturn }) => {
    const [selectedSale, setSelectedSale] = useState(null)
    const [returnTarget, setReturnTarget] = useState(null)

    const displayedSales = sales.slice(0, 10)

    return (
        <>
            <section className='bg-surface border border-outline p-6 shadow-xs rounded-lg flex flex-col'>
                <div className='flex items-center gap-2 text-accent mb-6'>
                    <History className='w-5 h-5' />
                    <h3 className='text-lg font-semibold text-on-surface'>Historial de Ventas</h3>
                </div>

                <div className='space-y-1'>
                    {displayedSales.length > 0 ? (
                        displayedSales.map((sale) => (
                            <div
                                key={sale.id}
                                className='flex items-center gap-4 p-3 hover:bg-hover rounded-lg transition-colors border-b border-divider-light last:border-0 cursor-pointer'
                                onClick={() => setSelectedSale(sale)}>
                                <div className='flex items-center gap-4 flex-1 min-w-0'>
                                    <ReceiptText className='w-5 h-5 text-accent shrink-0' />
                                    <div className='flex-1 min-w-0'>
                                        <p className='text-sm font-semibold text-on-surface'>
                                            #{String(sale.ticketNumber || sale.id).padStart(4, '0')}
                                        </p>
                                        <p className='text-xs text-muted'>
                                            {sale.date} • {sale.itemsCount}{' '}
                                            {sale.itemsCount === 1
                                                ? 'item'
                                                : 'items'}
                                        </p>
                                    </div>
                                    <div className='text-right'>
                                        <p className='text-sm font-bold text-on-surface'>
                                            $
                                            {new Intl.NumberFormat('es-CO', {
                                                maximumFractionDigits: 0,
                                            }).format(sale.total)}
                                        </p>
                                    </div>
                                </div>

                                {sale.status !== 'returned' && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setReturnTarget(sale)
                                        }}
                                        className='p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors shrink-0 cursor-pointer'
                                        title='Devolver venta'>
                                        <RotateCcw className='w-4 h-4' />
                                    </button>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className='py-12 text-center text-faint italic text-sm'>
                            No hay ventas registradas
                        </div>
                    )}
                </div>
            </section>

            <SaleTicketModal
                isOpen={!!selectedSale}
                onClose={() => setSelectedSale(null)}
                sale={selectedSale}
            />

            <ReturnModal
                key={returnTarget?.id || 'closed'}
                isOpen={!!returnTarget}
                sale={returnTarget}
                onClose={() => setReturnTarget(null)}
                onConfirm={async (reason, items) => {
                    await onReturn(returnTarget, reason, items)
                    setReturnTarget(null)
                }}
            />
        </>
    )
}
