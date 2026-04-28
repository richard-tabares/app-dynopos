import { X, Undo2 } from 'lucide-react'
import { useStore } from '../../../app/providers/store'
import { useEscape } from '../../../shared/helpers/useEscape'

const formatCurrency = (value) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)

export const ReturnDetailModal = ({ isOpen, onClose, data }) => {
    const business = useStore((state) => state.user.business)

    useEscape(onClose)

    if (!isOpen || !data) return null

    const { returns, items } = data
    const header = returns?.[0]

    if (!header) return null

    const itemsByReturn = items.filter(i => i.return_id === header.id)

    return (
        <section
            className='fixed inset-0 bg-gray-900/50 w-full h-full flex flex-col items-center justify-center z-[70]'
            onClick={onClose}>
            <section
                className='bg-white rounded-lg shadow-2xl w-full max-w-sm relative max-h-[90vh] overflow-y-auto'
                onClick={(e) => e.stopPropagation()}>
                <div className='bg-red-600 p-4 text-white flex justify-between items-center sticky top-0'>
                    <div className='flex items-center gap-2'>
                        <Undo2 className='w-5 h-5' />
                        <span className='font-bold uppercase tracking-widest text-sm'>Detalle de Devolución</span>
                    </div>
                    <button onClick={onClose} className='hover:bg-red-700 p-1 rounded-full transition'>
                        <X className='w-5 h-5' />
                    </button>
                </div>

                <div className='p-6'>
                    <div className='text-center mb-4 border-b border-dashed border-gray-300 pb-3'>
                        <h2 className='text-lg font-bold uppercase'>{business?.business_name}</h2>
                        <p className='text-xs text-gray-500'>Devolución #{String(header.id).padStart(4, '0')}</p>
                    </div>

                    <div className='space-y-1 mb-4 text-sm'>
                        <div className='flex justify-between'>
                            <span className='text-gray-500'>Fecha:</span>
                            <span className='font-medium'>{header.created_at}</span>
                        </div>
                        {header.reason && (
                            <div className='flex justify-between'>
                                <span className='text-gray-500'>Razón:</span>
                                <span className='font-medium text-right max-w-[60%]'>{header.reason}</span>
                            </div>
                        )}
                    </div>

                    {itemsByReturn.length > 0 && (
                        <div className='border-t border-b border-dashed border-gray-300 py-3 my-3'>
                            <div className='flex justify-between font-bold text-xs uppercase mb-2 text-gray-500'>
                                <span>Producto</span>
                                <span>Subtotal</span>
                            </div>
                            <div className='space-y-3'>
                                {itemsByReturn.map((item, index) => (
                                    <div key={index} className='flex justify-between items-start gap-2'>
                                        <div className='flex-1 min-w-0'>
                                            <p className='text-sm font-bold text-gray-900 uppercase truncate'>
                                                {item.products?.name || 'Producto eliminado'}
                                            </p>
                                            <p className='text-xs text-gray-500'>{item.quantity}x {formatCurrency(item.unit_price)}</p>
                                        </div>
                                        <span className='text-sm font-bold shrink-0'>{formatCurrency(item.subtotal)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className='flex justify-between text-base font-bold text-gray-900'>
                        <span>TOTAL</span>
                        <span>{formatCurrency(header.total_amount)}</span>
                    </div>
                </div>
            </section>
        </section>
    )
}
