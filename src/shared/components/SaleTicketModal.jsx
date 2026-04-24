import { X, Printer, ReceiptText } from 'lucide-react'

export const SaleTicketModal = ({ isOpen, onClose, sale }) => {
    if (!isOpen || !sale) return null

    const formatCurrency = (value) => 
        new Intl.NumberFormat('es-CO', { 
            style: 'currency', 
            currency: 'COP', 
            maximumFractionDigits: 0 
        }).format(value)

    return (
        <section
            className='fixed inset-0 bg-gray-900/50 w-full h-full flex flex-col items-center justify-center z-[70] print:relative print:bg-white print:inset-auto print:h-auto print:w-auto print:block'
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
                }
            `}} />

            <section
                className='bg-white rounded-lg shadow-2xl w-full max-w-sm relative overflow-hidden print-content print:shadow-none print:max-w-none print:w-[57mm] print:rounded-none print:border-none'
                onClick={(e) => e.stopPropagation()}>
                
                <div className='bg-primary-600 p-4 text-white flex justify-between items-center print:hidden'>
                    <div className='flex items-center gap-2'>
                        <ReceiptText className='w-5 h-5' />
                        <span className='font-bold uppercase tracking-widest text-sm'>Ticket de Venta</span>
                    </div>
                    <button onClick={onClose} className='hover:bg-primary-700 p-1 rounded-full transition'>
                        <X className='w-5 h-5' />
                    </button>
                </div>

                <div className='p-6 font-mono text-sm print:p-2 print:text-[12px]'>
                    <div className='text-center mb-4 border-b border-dashed border-gray-300 pb-2'>
                        <h2 className='text-lg font-bold uppercase print:text-[16px]'>DynoPOS</h2>
                        <p className='text-[11px] text-gray-500'>Comprobante No Fiscal</p>
                    </div>

                    <div className='space-y-1 mb-4 text-[11px]'>
                        <div className='flex justify-between gap-1'>
                            <span className='text-gray-500 uppercase shrink-0'>Orden:</span>
                            <span className='font-bold text-gray-900 truncate'>#{String(sale.id).padStart(4, '0')}</span>
                        </div>
                        <div className='flex justify-between gap-1'>
                            <span className='text-gray-500 uppercase shrink-0'>Fecha:</span>
                            <span className='text-gray-900 font-medium truncate'>{sale.date}</span>
                        </div>
                        <div className='flex justify-between gap-1'>
                            <span className='text-gray-500 uppercase shrink-0'>Pago:</span>
                            <span className='text-gray-900 font-medium capitalize truncate'>{sale.paymentMethod}</span>
                        </div>
                    </div>

                    <div className='border-t border-b border-dashed border-gray-300 py-2 my-2'>
                        <div className='flex justify-between font-bold text-[10px] uppercase mb-1 text-gray-500'>
                            <span>Detalle</span>
                            <span className='text-right'>Total</span>
                        </div>
                        <div className='space-y-3'>
                            {sale.items.map((item, index) => (
                                <div key={index} className='flex justify-between items-start gap-1'>
                                    <div className='flex-1 min-w-0'>
                                        <p className='text-gray-900 font-bold leading-tight uppercase text-[11px] break-words'>{item.name}</p>
                                        <p className='text-[10px] text-gray-600 mt-0.5'>
                                            {item.quantity}x {formatCurrency(item.price)}
                                        </p>
                                    </div>
                                    <span className='text-gray-900 font-bold shrink-0 text-[11px]'>
                                        {formatCurrency(item.subtotal)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className='space-y-1 mt-2'>
                        <div className='flex justify-between text-base font-bold text-gray-900 pt-1 print:text-[14px]'>
                            <span>TOTAL</span>
                            <span>{formatCurrency(sale.total)}</span>
                        </div>
                    </div>

                    <div className='text-center mt-6 pt-2 border-t border-dashed border-gray-300'>
                        <p className='text-[9px] text-gray-400 uppercase tracking-widest'>¡Gracias por su compra!</p>
                    </div>
                </div>

                <div className='p-4 bg-gray-50 border-t border-gray-100 flex gap-2 print:hidden'>
                    <button 
                        className='flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white py-2 rounded-lg font-bold hover:bg-primary-700 transition text-sm'
                        onClick={() => window.print()}
                    >
                        <Printer className='w-4 h-4' />
                        Imprimir
                    </button>
                </div>
            </section>
        </section>
    )
}
