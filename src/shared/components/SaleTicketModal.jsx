import { useRef, useState, useEffect } from 'react'
import { X, FileDown, Printer, ReceiptText, Calendar, Loader } from 'lucide-react'
import { sileo } from 'sileo'
import { useStore } from '../../app/providers/store'
import { useEscape } from '../helpers/useEscape'
import { useFormatDate } from '../helpers/useFormatDate'
import { updateSaleDate } from '../../features/sales/helpers/updateSaleDate'
import { getTodayRevenue } from '../../features/sales/helpers/getTodayRevenue'
import { PrintTicket } from './PrintTicket'
import {
    handlePrint,
    setStoredPrinter,
    printTicket,
} from '../helpers/printEngine'

export const SaleTicketModal = ({ isOpen, onClose, sale, onSaleUpdated }) => {
    const business = useStore((state) => state.user.business)
    const unitsOfMeasure = useStore((state) => state.unitsOfMeasure)
    const setTodayRevenue = useStore((state) => state.setTodayRevenue)
    const businessId = useStore(
        (state) =>
            state.user?.profile?.business_id || state.user?.data?.user?.id,
    )
    const thermalPrintingEnabled = useStore(
        (state) => state.user?.profile?.thermal_printing_enabled ?? true,
    )
    const printerWidth = useStore(
        (state) => state.user?.profile?.printer_width ?? 32,
    )
    const currentSaleDate = sale?.date || ''
    const ticketFooter = business?.ticket_footer || ''
    const dateInputRef = useRef(null)
    const printRef = useRef(null)

    const [printing, setPrinting] = useState(false)
    const [showPrinterPicker, setShowPrinterPicker] = useState(false)
    const [printers, setPrinters] = useState([])

    const formatDate = useFormatDate()

    useEscape(onClose)

    useEffect(() => {
        if (isOpen) {
            setPrinting(false)
            setShowPrinterPicker(false)
        }
    }, [isOpen])

    const handlePrintClick = async () => {
        if (printing) return
        setPrinting(true)

        try {
            const result = await handlePrint(sale, business)

            if (result.success) {
                sileo.success({
                    fill: 'var(--toast-success)',
                    title: 'Completado',
                    description: 'Ticket impreso correctamente',
                })
            } else if (result.needsSelection) {
                setPrinters(result.printers || [])
                setShowPrinterPicker(true)
            } else {
                sileo.warning({
                    fill: 'var(--toast-warning)',
                    title: 'Impresora no disponible',
                    description: result.error
                        ? `No se pudo imprimir: ${result.error}`
                        : 'Agente de impresión no detectado. Verifica que el servicio esté activo.',
                })
            }
        } catch (err) {
            sileo.error({
                fill: 'var(--toast-error)',
                title: 'Error',
                description: err.message || 'Error al imprimir',
            })
        } finally {
            setPrinting(false)
        }
    }

    const handleSelectPrinter = async (name) => {
        setStoredPrinter(name)
        setShowPrinterPicker(false)
        setPrinting(true)

        try {
            const storeState = useStore.getState()
            const bizName = storeState?.user?.business?.business_name || business?.business_name || ''
            const ticketData = {
                businessName: bizName,
                printerWidth: printerWidth,
                ticketNumber: sale.ticketNumber || sale.id,
                date: sale.date || '',
                paymentMethod: sale.paymentMethod || '',
                salesperson: sale.salesperson || '',
                items: (sale.items || []).map((item) => ({
                    name: item.name || '',
                    variationName: item.variation_name || '',
                    quantity: item.quantity || 0,
                    price: item.price || 0,
                    subtotal: item.subtotal || 0,
                    displayUnit: item.display_unit_short || '',
                    decimalPlaces: item.decimal_places || 0,
                })),
                total: sale.total || 0,
                footer: ticketFooter,
            }

            await printTicket(name, ticketData)

            sileo.success({
                fill: 'var(--toast-success)',
                title: 'Completado',
                description: 'Ticket impreso correctamente',
            })
        } catch (err) {
            sileo.error({
                fill: 'var(--toast-error)',
                title: 'Error',
                description: err.message || 'Error al imprimir',
            })
        } finally {
            setPrinting(false)
        }
    }

    if (!isOpen || !sale) return null

    const formatCurrency = (value) =>
        new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0,
        }).format(value)

    const handleDateSave = async (newDate) => {
        if (!newDate || newDate === currentSaleDate) return
        try {
            await updateSaleDate(sale.id, newDate)
            sileo.success({
                fill: 'var(--toast-success)',
                title: 'Completado',
                description: 'Fecha actualizada correctamente',
            })
            onSaleUpdated?.()
            if (businessId) {
                const revenueData = await getTodayRevenue(businessId)
                setTodayRevenue(revenueData.todayRevenue)
            }
        } catch (err) {
            sileo.error({
                fill: 'var(--toast-error)',
                title: 'Error',
                description: err.message || 'Error al actualizar la fecha',
            })
        }
    }

    return (
        <section
            className='fixed inset-0 bg-overlay backdrop-blur-xs w-full h-full flex flex-col items-center justify-center z-[70] max-lg:p-2 p-4'
            onClick={onClose}>
            <PrintTicket
                printRef={printRef}
                sale={sale}
                business={business}
                ticketFooter={ticketFooter}>
                <section
                    className='bg-surface border border-outline rounded-xl w-full max-w-sm relative flex flex-col max-h-[85dvh]'
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) =>
                        e.key === 'Enter' && printRef.current?.()
                    }>
                    <section className='sticky top-0 bg-title-surface/50 backdrop-blur-3xl z-50 flex items-center justify-between px-6 py-3.5 border-b border-divider no-print'>
                        <h2 className='text-lg font-semibold flex items-center gap-2'>
                            <ReceiptText className='w-5 h-5 text-accent' />
                            Ticket de Venta
                        </h2>
                        <button
                            onClick={onClose}
                            className='p-1 rounded-md text-accent hover:text-accent/85 border border-disabled hover:border-accent transition cursor-pointer'>
                            <X className='w-5 h-5' />
                        </button>
                    </section>

                    <div className='flex-1 overflow-y-auto scrollbar-none'>
                        <div className='p-6 font-mono text-sm'>
                            <div className='text-center mb-4 border-b border-dashed border-outline pb-2'>
                                <h2 className='text-lg font-bold uppercase'>
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
                                        {String(
                                            sale.ticketNumber || sale.id,
                                        ).padStart(4, '0')}
                                    </span>
                                </div>
                                <div className='flex justify-between gap-1 items-center'>
                                    <span className='text-muted uppercase shrink-0'>
                                        Fecha:
                                    </span>
                                    <div className='flex items-center gap-1'>
                                        <span className='relative w-5 h-5 flex items-center justify-center no-print'>
                                            <Calendar
                                                className='w-3.5 h-3.5 cursor-pointer hover:text-accent z-10'
                                                onClick={() =>
                                                    dateInputRef.current?.showPicker()
                                                }
                                            />
                                            <input
                                                ref={dateInputRef}
                                                type='date'
                                                value={currentSaleDate}
                                                onChange={(e) => {
                                                    handleDateSave(e.target.value)
                                                }}
                                                className='absolute inset-0 opacity-0 border-0'
                                            />
                                        </span>
                                        <span
                                            className='text-on-surface font-medium truncate z-10 hover:text-accent cursor-pointer'
                                            onClick={() =>
                                                dateInputRef.current?.showPicker()
                                            }>
                                            {formatDate(currentSaleDate)}
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
                                <div className='flex justify-between gap-1'>
                                    <span className='text-muted uppercase shrink-0'>
                                        Vendedor:
                                    </span>
                                    <span className='text-on-surface font-medium truncate'>
                                        {sale.salesperson || '—'}
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
                                                    {item.variation_name && item.variation_name !== 'Default' ? `${item.name} - ${item.variation_name}` : item.name}
                                                </p>
                                                <p className='text-[10px] text-on-body mt-0.5'>
                                                    {(() => {
                                                        const unitId = item.sold_in_unit_id || item.soldInUnitId
                                                        const unit = item.displayUnit || (unitId ? unitsOfMeasure.find(u => u.id === unitId)?.short_name : '') || ''
                                                        return `${item.quantity}${unit ? ` ${unit}` : ''} x ${formatCurrency(item.price)}`
                                                    })()}
                                                </p>
                                            </div>
                                            <span className='text-on-surface font-bold shrink-0 text-[11px]'>
                                                {formatCurrency(item.subtotal)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className='flex justify-between text-base font-bold text-on-surface pt-1'>
                                <span>TOTAL</span>
                                <span>{formatCurrency(sale.total)}</span>
                            </div>

                            <div className='text-center mt-6 pt-2 border-t border-dashed border-outline'>
                                <p className='text-[9px] text-faint tracking-widest'>
                                    {ticketFooter || '¡Gracias por su compra!'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className='sticky bottom-0 bg-surface border-t border-divider-light px-6 py-4 flex gap-2 no-print'>
                        <button
                            className='flex-1 flex items-center justify-center gap-2 bg-accent text-surface py-2 rounded-lg font-bold hover:bg-accent/85 transition text-sm cursor-pointer'
                            onClick={() => printRef.current?.()}>
                            <FileDown className='w-4 h-4' />
                            PDF
                        </button>
                        <button
                            className='flex-1 flex items-center justify-center gap-2 bg-surface text-on-surface border border-outline py-2 rounded-lg font-bold transition text-sm hover:bg-hover cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
                            onClick={handlePrintClick}
                            disabled={printing || !thermalPrintingEnabled}>
                            {printing ? (
                                <Loader className='w-4 h-4 animate-spin' />
                            ) : (
                                <Printer className='w-4 h-4' />
                            )}
                            {printing ? 'Imprimiendo...' : 'Imprimir'}
                        </button>
                    </div>

                    {showPrinterPicker && (
                        <section
                            className='absolute inset-0 bg-overlay/40 backdrop-blur-xs z-50 flex items-center justify-center p-4'
                            onClick={() => setShowPrinterPicker(false)}>
                            <section
                                className='bg-surface border border-outline rounded-xl shadow-2xl w-full max-w-sm overflow-hidden'
                                onClick={(e) => e.stopPropagation()}>
                                <div className='px-6 py-4 border-b border-divider'>
                                    <h3 className='font-semibold text-on-surface'>
                                        Seleccionar Impresora
                                    </h3>
                                    <p className='text-sm text-muted mt-1'>
                                        Elige la impresora para este ticket
                                    </p>
                                </div>
                                <div className='p-4 space-y-2'>
                                    {printers.map((p) => (
                                        <button
                                            key={p.name}
                                            className='w-full text-left px-4 py-3 border border-outline rounded-lg hover:bg-hover transition cursor-pointer'
                                            onClick={() => handleSelectPrinter(p.name)}>
                                            <span className='font-medium text-on-surface'>
                                                {p.name}
                                            </span>
                                            {p.autoDetected && (
                                                <span className='ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent font-medium'>
                                                    USB
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </section>
                        </section>
                    )}
                </section>
            </PrintTicket>
        </section>
    )
}
