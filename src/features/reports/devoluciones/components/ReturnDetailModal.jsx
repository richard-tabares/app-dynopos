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

                {items.length > 0 && (
                    <div className='border-t border-b border-dashed border-outline py-3 my-3'>
                        <div className='flex justify-between font-bold text-xs uppercase mb-2 text-muted'>
                            <span>Producto</span>
                            <span>Subtotal</span>
                        </div>
                        <div className='space-y-3'>
                            {items.map((item, index) => (
                                <div key={index} className='flex justify-between items-start gap-2'>
                                    <div className='flex-1 min-w-0'>
                                        <div className='text-sm font-bold text-on-surface uppercase'>
                                            {item.product_variations?.variation_name ? (
                                                <>
                                                    <div>{item.products?.name || 'Producto eliminado'}</div>
                                                    <div className='flex items-center gap-2 mt-0.5'>
                                                        {item.products?.variation_type && (
                                                            <span className='px-2.5 py-0.5 text-xs font-medium bg-accent/10 text-accent rounded-full'>
                                                                {item.products.variation_type.toLowerCase()}
                                                            </span>
                                                        )}
                                                        <span className='text-xs font-semibold'>{item.product_variations.variation_name}</span>
                                                    </div>
                                                </>
                                            ) : (
                                                item.products?.name || 'Producto eliminado'
                                            )}
                                        </div>
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
