import { useState } from 'react'
import { ShoppingBag, RotateCcw } from 'lucide-react'
import { SaleTicketModal } from '../../../shared/components/SaleTicketModal'

export const SalesHistoryCard = ({ sales = [], onReturn }) => {
    const [visibleCount, setVisibleCount] = useState(10)
    const [selectedSale, setSelectedSale] = useState(null)
    const [returnTarget, setReturnTarget] = useState(null)
    const [returnReason, setReturnReason] = useState('')

    const handleLoadMore = () => {
        setVisibleCount((prev) => prev + 10)
    }

    const displayedSales = sales.slice(0, visibleCount)

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
                                className='flex items-center gap-4 p-3 hover:bg-primary-50 rounded-lg transition-colors border-b border-gray-100 last:border-0'>
                                <div
                                    className='flex items-center gap-4 flex-1 min-w-0 cursor-pointer'
                                    onClick={() => setSelectedSale(sale)}>
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
                                    onClick={() => {
                                        setReturnTarget(sale)
                                        setReturnReason('')
                                    }}
                                    className='p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0'
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

                {visibleCount < sales.length && (
                    <button
                        onClick={handleLoadMore}
                        className='mt-6 w-full py-2 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-gray-50 transition-colors border-t border-gray-100'>
                        Cargar más
                    </button>
                )}
            </section>

            <SaleTicketModal
                isOpen={!!selectedSale}
                onClose={() => setSelectedSale(null)}
                sale={selectedSale}
            />

            {returnTarget && (
                <section
                    className='fixed inset-0 bg-gray-900/50 w-full h-full flex items-center justify-center z-[70]'
                    onClick={() => setReturnTarget(null)}>
                    <section
                        className='bg-white rounded-lg shadow-2xl w-full max-w-sm relative overflow-hidden'
                        onClick={(e) => e.stopPropagation()}>
                        <div className='p-6 text-center'>
                            <div className='mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4'>
                                <RotateCcw className='w-6 h-6 text-red-600' />
                            </div>
                            <h3 className='text-lg font-bold text-gray-900 mb-2'>
                                Confirmar Devolución
                            </h3>
                            <p className='text-sm text-gray-500 mb-4'>
                                ¿Estás seguro de que deseas devolver la venta #
                                {String(returnTarget.id).padStart(4, '0')}? Se
                                restaurará el stock de los productos.
                            </p>
                            <textarea
                                value={returnReason}
                                onChange={(e) => setReturnReason(e.target.value)}
                                placeholder='Motivo de la devolución (obligatorio)'
                                className='w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none h-20'
                            />
                        </div>

                        <div className='px-6 pb-6 flex gap-3'>
                            <button
                                onClick={() => setReturnTarget(null)}
                                className='flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition text-sm'>
                                Cancelar
                            </button>
                            <button
                                onClick={() => {
                                    if (!returnReason.trim()) return
                                    onReturn(returnTarget, returnReason.trim())
                                    setReturnTarget(null)
                                    setReturnReason('')
                                }}
                                className='flex-1 py-2.5 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition text-sm disabled:opacity-50'
                                disabled={!returnReason.trim()}>
                                Devolver
                            </button>
                        </div>
                    </section>
                </section>
            )}
        </>
    )
}
