import { useState } from 'react'
import { X, Printer, ReceiptText, Pencil, Check, XCircle } from 'lucide-react'
import { toast } from 'react-toastify'
import { useStore } from '../../app/providers/store'
import { useEscape } from '../helpers/useEscape'
import { updateSaleDate } from '../../features/sales/helpers/updateSaleDate'

export const SaleTicketModal = ({ isOpen, onClose, sale, onSaleUpdated }) => {
    const business = useStore((state) => state.user.business)
    const ticketFooter = business?.ticket_footer || ''
    const [editingDate, setEditingDate] = useState(false)
    const [newDate, setNewDate] = useState('')
    const [saving, setSaving] = useState(false)

    useEscape(onClose)

    if (!isOpen || !sale) return null

    const formatCurrency = (value) => 
        new Intl.NumberFormat('es-CO', { 
            style: 'currency', 
            currency: 'COP', 
            maximumFractionDigits: 0 
        }).format(value)

    const handleStartEdit = () => {
        setNewDate(sale.date || '')
        setEditingDate(true)
    }

    const handleCancelEdit = () => {
        setEditingDate(false)
        setNewDate('')
    }

    const handleSaveDate = async () => {
        if (!newDate || newDate === sale.date) {
            setEditingDate(false)
            return
        }
        try {
            setSaving(true)
            await updateSaleDate(sale.id, newDate)
            toast.success('Fecha actualizada correctamente')
            setEditingDate(false)
            onClose()
            onSaleUpdated?.()
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
            
            <style dangerouslySetInnerHTML={{ __html: `
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
            `}} />

            <section
                className='bg-surface rounded-lg shadow-2xl w-full max-w-sm relative overflow-hidden print-content print:shadow-none print:max-w-none print:w-[57mm] print:rounded-none print:border-none'
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.key === 'Enter' && !editingDate && window.print()}>
                
                <div className='bg-accent p-4 text-surface flex justify-between items-center no-print'>
                    <div className='flex items-center gap-2'>
                        <ReceiptText className='w-5 h-5' />
                        <span className='font-bold uppercase tracking-widest text-sm'>Ticket de Venta</span>
                    </div>
                    <button onClick={onClose} className='p-1 text-surface hover:text-surface/85 border border-surface/30 hover:border-surface rounded-md transition cursor-pointer'>
                        <X className='w-5 h-5' />
                    </button>
                </div>

                <div className='p-6 font-mono text-sm print:p-2 print:text-[12px]'>
                    <div className='text-center mb-4 border-b border-dashed border-outline pb-2'>
                        <h2 className='text-lg font-bold uppercase print:text-[16px]'>{business?.business_name}</h2>
                        <p className='text-[11px] text-muted'>Comprobante No Fiscal</p>
                    </div>

                    <div className='space-y-1 mb-4 text-[11px]'>
                        <div className='flex justify-between gap-1'>
                            <span className='text-muted uppercase shrink-0'>Orden:</span>
                            <span className='font-bold text-on-surface truncate'>#{String(sale.ticketNumber || sale.id).padStart(4, '0')}</span>
                        </div>
                        <div className='flex justify-between gap-1 items-center'>
                            <span className='text-muted uppercase shrink-0'>Fecha:</span>
                            {editingDate ? (
                                <input
                                    type='date'
                                    value={newDate}
                                    onChange={(e) => setNewDate(e.target.value)}
                                    className='w-40 text-right text-on-surface font-medium bg-subtle border border-accent rounded px-1 py-0.5 text-[11px] focus:outline-none'
                                    autoFocus
                                />
                            ) : (
                                <span className='text-on-surface font-medium truncate flex items-center gap-1'>
                                    <button
                                        onClick={handleStartEdit}
                                        className='p-1 text-muted hover:text-accent transition decoration-neutral-200 cursor-pointer no-print shrink-0'
                                        title='Cambiar fecha'
                                    >
                                        <Pencil className='w-3 h-3' />
                                    </button>
                                    {sale.date}
                                </span>
                            )}
                        </div>
                        <div className='flex justify-between gap-1'>
                            <span className='text-muted uppercase shrink-0'>Pago:</span>
                            <span className='text-on-surface font-medium capitalize truncate'>{sale.paymentMethod}</span>
                        </div>
                    </div>

                    <div className='border-t border-b border-dashed border-outline py-2 my-2'>
                        <div className='flex justify-between font-bold text-[10px] uppercase mb-1 text-muted'>
                            <span>Detalle</span>
                            <span className='text-right'>Total</span>
                        </div>
                        <div className='space-y-3'>
                            {sale.items.map((item, index) => (
                                <div key={index} className='flex justify-between items-start gap-1'>
                                    <div className='flex-1 min-w-0'>
                                        <p className='text-on-surface font-bold leading-tight uppercase text-[11px] break-words'>{item.name}</p>
                                        <p className='text-[10px] text-on-body mt-0.5'>
                                            {item.quantity}x {formatCurrency(item.price)}
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
                        <p className='text-[9px] text-faint tracking-widest'>{ticketFooter || '¡Gracias por su compra!'}</p>
                    </div>
                </div>

                <div className='p-4 bg-subtle border-t border-divider-light flex gap-2 no-print'>
                    {editingDate ? (
                        <>
                            <button
                                onClick={handleCancelEdit}
                                disabled={saving}
                                className='flex-1 flex items-center justify-center gap-2 border border-divider text-on-surface py-2 rounded-lg font-bold hover:bg-hover transition text-sm cursor-pointer disabled:opacity-50'
                            >
                                <XCircle className='w-4 h-4' />
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveDate}
                                disabled={saving || !newDate}
                                className='flex-1 flex items-center justify-center gap-2 bg-accent text-surface py-2 rounded-lg font-bold hover:bg-accent/85 transition text-sm cursor-pointer disabled:opacity-50'
                            >
                                {saving ? (
                                    <span className='w-4 h-4 border-2 border-surface border-t-transparent rounded-full animate-spin' />
                                ) : (
                                    <Check className='w-4 h-4' />
                                )}
                                {saving ? 'Guardando...' : 'Guardar'}
                            </button>
                        </>
                    ) : (
                        <button 
                            className='flex-1 flex items-center justify-center gap-2 bg-accent text-surface py-2 rounded-lg font-bold hover:bg-accent/85 transition text-sm cursor-pointer'
                            onClick={() => window.print()}
                        >
                            <Printer className='w-4 h-4' />
                            Imprimir
                        </button>
                    )}
                </div>
            </section>
        </section>
    )
}
