import { useState } from 'react'
import { ShoppingBag, RotateCcw } from 'lucide-react'
import { SaleTicketModal } from '../../../shared/components/SaleTicketModal'
import { ReturnModal } from './ReturnModal'

export const SalesHistoryCard = ({ sales = [], onReturn }) => {
    const [selectedSale, setSelectedSale] = useState(null)
    const [returnTarget, setReturnTarget] = useState(null)

    const displayedSales = sales.slice(0, 10)

    return (
        <>
            <section className='bg-white border border-gray-300 p-6 shadow-xs rounded-lg flex flex-col'>
                <h3 className='text-lg font-semibold text-gray-900 mb-6'>
                    Historial de Ventas
                </h3>

                <div className='space-y-1'>
                    {displayedSales.length > 0 ? (
                        displayedSales.map((sale) => (
                            <div
                                key={sale.id}
                                className='flex items-center gap-4 p-3 hover:bg-primary-50 rounded-lg transition-colors border-b border-gray-100 last:border-0 cursor-pointer'
                                onClick={() => setSelectedSale(sale)}>
                                <div className='flex items-center gap-4 flex-1 min-w-0'>
                                    <div className='p-2 bg-blue-50 text-blue-600 rounded-lg'>
                                        <ShoppingBag className='w-5 h-5' />
                                    </div>
                                    <div className='flex-1 min-w-0'>
                                        <p className='text-sm font-semibold text-gray-900'>
                                            #{String(sale.id).padStart(4, '0')}
                                        </p>
                                        <p className='text-xs text-gray-500'>
                                            {sale.date} • {sale.itemsCount}{' '}
                                            {sale.itemsCount === 1
                                                ? 'item'
                                                : 'items'}
                                        </p>
                                    </div>
                                    <div className='text-right'>
                                        <p className='text-sm font-bold text-gray-900'>
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
                        <div className='py-12 text-center text-gray-400 italic text-sm'>
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
                isOpen={!!returnTarget}
                sale={returnTarget}
                onClose={() => setReturnTarget(null)}
                onConfirm={(reason, items) => {
                    onReturn(returnTarget, reason, items)
                    setReturnTarget(null)
                }}
            />
        </>
    )
}
