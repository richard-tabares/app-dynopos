import { Undo2 } from 'lucide-react'
import { useStore } from '../../../../app/providers/store'
import { Modal } from '../../../../shared/components/Modal'

const formatCurrency = (value) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)

export const ReturnDetailModal = ({ isOpen, onClose, data }) => {
    const business = useStore((state) => state.user.business)

    if (!isOpen || !data) return null

    const { returns, items } = data
    const header = returns?.[0]

    if (!header) return null

    const itemsByReturn = items.filter(i => i.return_id === header.id)

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title='Detalle de Devolución'
            icon={Undo2}
            size='sm'
            zIndex='z-[70]'
        >
            <div className='p-6'>
                <div className='text-center mb-4 border-b border-dashed border-outline pb-3'>
                    <h2 className='text-lg font-bold uppercase'>{business?.business_name}</h2>
                    <p className='text-xs text-muted'>Devolución #{String(header.salesTickets?.ticket_number ?? header.id).padStart(4, '0')}</p>
                </div>

                <div className='space-y-1 mb-4 text-sm'>
                    <div className='flex justify-between'>
                        <span className='text-muted'>Fecha:</span>
                        <span className='font-medium'>{header.created_at}</span>
                    </div>
                    {header.reason && (
                        <div className='flex justify-between'>
                            <span className='text-muted'>Razón:</span>
                            <span className='font-medium text-right max-w-[60%]'>{header.reason}</span>
                        </div>
                    )}
                </div>

                {itemsByReturn.length > 0 && (
                    <div className='border-t border-b border-dashed border-outline py-3 my-3'>
                        <div className='flex justify-between font-bold text-xs uppercase mb-2 text-muted'>
                            <span>Producto</span>
                            <span>Subtotal</span>
                        </div>
                        <div className='space-y-3'>
                            {itemsByReturn.map((item, index) => (
                                <div key={index} className='flex justify-between items-start gap-2'>
                                    <div className='flex-1 min-w-0'>
                                        <p className='text-sm font-bold text-on-surface uppercase truncate'>
                                            {item.products?.name || 'Producto eliminado'}
                                        </p>
                                        <p className='text-xs text-muted'>{item.quantity}x {formatCurrency(item.unit_price)}</p>
                                    </div>
                                    <span className='text-sm font-bold shrink-0'>{formatCurrency(item.subtotal)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className='flex justify-between text-base font-bold text-on-surface'>
                    <span>TOTAL</span>
                    <span>{formatCurrency(header.total_amount)}</span>
                </div>
            </div>
        </Modal>
    )
}
