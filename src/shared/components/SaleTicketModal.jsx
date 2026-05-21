import { useState, useRef } from 'react'
import { X, Printer, ReceiptText, Calendar } from 'lucide-react'
import { toast } from 'react-toastify'
import { useStore } from '../../app/providers/store'
import { useEscape } from '../helpers/useEscape'
import { useFormatDate } from '../helpers/useFormatDate'
import { updateSaleDate } from '../../features/sales/helpers/updateSaleDate'
import { getTodayRevenue } from '../../features/sales/helpers/getTodayRevenue'

export const SaleTicketModal = ({ isOpen, onClose, sale, onSaleUpdated }) => {
    const business = useStore((state) => state.user.business)
    const setTodayRevenue = useStore((state) => state.setTodayRevenue)
    const businessId = useStore((state) => state.user?.data?.user?.id)
    const [isEditingDate, setIsEditingDate] = useState(false)
    const ticketFooter = business?.ticket_footer || ''
    const dateInputRef = useRef(null)
    const [saving, setSaving] = useState(false)

    const formatDate = useFormatDate()

    useEscape(onClose)

    if (!isOpen || !sale) return null

    const formatCurrency = (value) =>
        new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0,
        }).format(value)

    const handleDateSave = async (e) => {
        const value = e.target.value
        if (!value || value === sale.date) return
        try {
            setSaving(true)
            await updateSaleDate(sale.id, value)
            toast.success('Fecha actualizada correctamente')
            // onClose()
            onSaleUpdated?.()
            if (businessId) {
                const revenueData = await getTodayRevenue(businessId)
                setTodayRevenue(revenueData.todayRevenue)
            }
        } catch (err) {
            toast.error(err.message || 'Error al actualizar la fecha')
        } finally {
            setSaving(false)
        }
    }

    return (
        <section
            className='fixed inset-0 bg-overlay backdrop-blur-xs w-full h-full flex flex-col items-center justify-center z-[70] p-4 print:relative print:bg-white print:inset-auto print:h-auto print:w-auto print:block'
            onClick={onClose}>
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                @media print {
                    body * { visibility: hidden; }
                    .print-content, .print-content * { visibility: visible; }
                    .print-content { 
                        position: fixed; 
                        left: 50%; 
                        top: 0; 
                        transform: translateX(-50%);
                        width: 57mm; 
                        padding: 0;
                        margin: 0;
                        border: none;
                    }
                    @page { 
                        margin: 0; 
                        size: 57mm auto;
                    }
                    html, body {
                        width: 100%;
                        height: auto;
                        margin: 0;
                        padding: 0;
                        background: white;
                    }
                    .no-print { display: none !important; }
                }
            `,
                }}
            />

            <section
                className='bg-surface rounded-lg shadow-2xl w-full max-w-sm relative overflow-hidden print-content print:shadow-none print:max-w-none print:w-[57mm] print:rounded-none print:border-none'
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.key === 'Enter' && window.print()}>
                <div className='bg-accent p-4 text-surface flex justify-between items-center no-print'>
                    <div className='flex items-center gap-2'>
                        <ReceiptText className='w-5 h-5' />
                        <span className='font-bold uppercase tracking-widest text-sm'>
                            Ticket de Venta
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className='p-1 text-surface hover:text-surface/85 border border-surface/30 hover:border-surface rounded-md transition cursor-pointer'>
                        <X className='w-5 h-5' />
                    </button>
                </div>

                <div className='p-6 font-mono text-sm print:p-2 print:text-[12px]'>
                    <div className='text-center mb-4 border-b border-dashed border-outline pb-2'>
                        <h2 className='text-lg font-bold uppercase print:text-[16px]'>
                            {business?.business_name}
                        </h2>
                        <p className='text-[11px] text-muted'>
                            Comprobante No Fiscal
                        </p>
                    </div>

                    <div className='space-y-1 mb-4 text-[11px]'>
                        <div className='flex justify-between gap-1'>
                            <span className='text-muted uppercase shrink-0'>
                                Orden:
                            </span>
                            <span className='font-bold text-on-surface truncate'>
                                #
                                {String(sale.ticketNumber || sale.id).padStart(
                                    4,
                                    '0',
                                )}
                            </span>
                        </div>
                        <div className='flex justify-between gap-1 items-center transition-all duration-200'>
                            <span className='text-muted uppercase shrink-0'>
                                Fecha:
                            </span>
                            <div className='flex items-center gap-1'>
                                <span className='relative w-5 h-5 flex items-center justify-center'>
                                    <Calendar
                                        className={`w-3.5 h-3.5 transition-all duration-200 cursor-pointer hover:text-accent z-50`}
                                        onClick={() =>
                                            dateInputRef.current?.showPicker()
                                        }
                                        // onFocus={() => setIsEditingDate(true)}
                                        // onBlur={() => setIsEditingDate(false)}
                                    />
                                    <input
                                        ref={dateInputRef}
                                        type='date'
                                        defaultValue={sale.date}
                                        onChange={(e) => {
                                            handleDateSave(e);
                                            // setIsEditingDate(false);
                                        }}
                                        className='absolute inset-0 opacity-0 border-0'
                                    />
                                </span>
                                <span className='text-on-surface font-medium truncate flex items-center gap-1 hover:text-accent transition-all duration-200 cursor-pointer' onClick={() => dateInputRef.current?.showPicker()}>
                                    {formatDate(sale.date)}
                                    {/* {saving && (
                                        <span className='w-3 h-3 border-2 border-accent border-t-transparent rounded-full animate-spin' />
                                    )} */}
                                </span>
                            </div>
                        </div>
                        <div className='flex justify-between gap-1'>
                            <span className='text-muted uppercase shrink-0'>
                                Pago:
                            </span>
                            <span className='text-on-surface font-medium capitalize truncate'>
                                {sale.paymentMethod}
                            </span>
                        </div>
                    </div>

                    <div className='border-t border-b border-dashed border-outline py-2 my-2'>
                        <div className='flex justify-between font-bold text-[10px] uppercase mb-1 text-muted'>
                            <span>Detalle</span>
                            <span className='text-right'>Total</span>
                        </div>
                        <div className='space-y-3'>
                            {sale.items.map((item, index) => (
                                <div
                                    key={index}
                                    className='flex justify-between items-start gap-1'>
                                    <div className='flex-1 min-w-0'>
                                        <p className='text-on-surface font-bold leading-tight uppercase text-[11px] break-words'>
                                            {item.name}
                                        </p>
                                        <p className='text-[10px] text-on-body mt-0.5'>
                                            {item.quantity}x{' '}
                                            {formatCurrency(item.price)}
                                        </p>
                                    </div>
                                    <span className='text-on-surface font-bold shrink-0 text-[11px]'>
                                        {formatCurrency(item.subtotal)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className='space-y-1 mt-2'>
                        <div className='flex justify-between text-base font-bold text-on-surface pt-1 print:text-[14px]'>
                            <span>TOTAL</span>
                            <span>{formatCurrency(sale.total)}</span>
                        </div>
                    </div>

                    <div className='text-center mt-6 pt-2 border-t border-dashed border-outline'>
                        <p className='text-[9px] text-faint tracking-widest'>
                            {ticketFooter || '¡Gracias por su compra!'}
                        </p>
                    </div>
                </div>

                <div className='p-4 bg-subtle border-t border-divider-light flex gap-2 no-print'>
                    <button
                        className='flex-1 flex items-center justify-center gap-2 bg-accent text-surface py-2 rounded-lg font-bold hover:bg-accent/85 transition text-sm cursor-pointer'
                        onClick={() => window.print()}>
                        <Printer className='w-4 h-4' />
                        Imprimir
                    </button>
                </div>
            </section>
        </section>
    )
}
