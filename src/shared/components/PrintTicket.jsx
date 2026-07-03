import { useRef, useEffect, useCallback } from 'react'
import html2pdf from 'html2pdf.js'
import { sileo } from 'sileo'
import { useStore } from '../../app/providers/store'

const formatCurrency = (value) =>
    new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
    }).format(value)

const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const [year, month, day] = dateStr.split('-')
    return `${day}/${month}/${year}`
}

const paymentMethodLabels = {
    cash: 'Efectivo',
    card: 'Tarjeta',
    transfer: 'Transferencia',
    pse: 'PSE',
}

export const PrintTicket = ({ children, printRef, sale, business, ticketFooter }) => {
    const wrapperRef = useRef(null)

    const handlePrint = useCallback(async () => {
        if (!sale) return
        const activeBusiness = business || useStore.getState().user?.business
        if (!activeBusiness) return
        const { unitsOfMeasure } = useStore.getState()

        const pdfWindow = window.open('', '_blank')
        if (!pdfWindow) {
            sileo.warning({ fill: 'var(--toast-warning)', title: 'Atención', description: 'Permite ventanas emergentes para ver el PDF'})
            return
        }
        pdfWindow.document.write(
            '<html><head><title>Cargando...</title></head><body style="display:flex;align-items:center;justify-content:center;font-family:sans-serif;margin:0;height:100vh;background:#f5f5f5"><p style="color:#666">Generando PDF...</p></body></html>'
        )
        pdfWindow.document.close()

        const paymentLabel = paymentMethodLabels[sale.paymentMethod] || sale.paymentMethod || '—'
        const orderNum = '#' + String(sale.ticketNumber || sale.id).padStart(4, '0')
        const ticketDate = formatDate(sale.date || '')
        const footer = ticketFooter || '¡Gracias por su compra!'

        const itemsHtml = sale.items
            .map(
                (item) => {
                const displayName = item.variation_name && item.variation_name !== 'Default' ? `${item.name} - ${item.variation_name}` : item.name
                const qty = Number(item.quantity) || 0
                const unitId = item.sold_in_unit_id || item.soldInUnitId
                const unit = item.displayUnit || (unitId ? unitsOfMeasure.find(u => u.id === unitId)?.short_name : '') || ''
                return `
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:4px;margin-bottom:8px;">
                <div style="flex:1;min-width:0;">
                    <p style="margin:0;font-weight:700;text-transform:uppercase;font-size:10px;color:#111827;word-break:break-word;">${displayName}</p>
                    <p style="margin:4px 0 0;font-size:9px;color:#374151;">${qty}${unit ? ' ' + unit : ''} x ${formatCurrency(item.price)}</p>
                </div>
                <span style="font-weight:700;font-size:10px;color:#111827;white-space:nowrap;">${formatCurrency(item.subtotal)}</span>
            </div>`
            }
            )
            .join('')

        const wrapper = document.createElement('div')
        wrapper.innerHTML = `
            <div style="width:215px;background:white;font-family:monospace;font-size:12px;padding:16px 12px;">
                <div style="text-align:center;border-bottom:1px dashed #d1d5db;padding-bottom:8px;margin-bottom:16px;">
                    <h2 style="margin:0;font-size:16px;font-weight:700;text-transform:uppercase;color:#111827;">
                        ${activeBusiness.business_name || ''}
                    </h2>
                    <p style="margin:4px 0 0;font-size:10px;color:#6b7280;">
                        Comprobante No Fiscal
                    </p>
                </div>

                <div style="font-size:11px;margin-bottom:16px;">
                    <div style="display:flex;justify-content:space-between;gap:4px;margin-bottom:4px;">
                        <span style="color:#6b7280;text-transform:uppercase;">Orden:</span>
                        <span style="font-weight:700;color:#111827;">${orderNum}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;gap:4px;margin-bottom:4px;">
                        <span style="color:#6b7280;text-transform:uppercase;">Fecha:</span>
                        <span style="font-weight:500;color:#111827;">${ticketDate}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;gap:4px;">
                        <span style="color:#6b7280;text-transform:uppercase;">Pago:</span>
                        <span style="font-weight:500;color:#111827;text-transform:capitalize;">${paymentLabel}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;gap:4px;margin-top:4px;">
                        <span style="color:#6b7280;text-transform:uppercase;">Vendedor:</span>
                        <span style="font-weight:500;color:#111827;">${sale.salesperson || '—'}</span>
                    </div>
                </div>

                <div style="border-top:1px dashed #d1d5db;border-bottom:1px dashed #d1d5db;padding:8px 0;margin-bottom:8px;">
                    <div style="display:flex;justify-content:space-between;font-weight:700;font-size:10px;text-transform:uppercase;color:#6b7280;margin-bottom:8px;">
                        <span>Detalle</span>
                        <span style="text-align:right;">Total</span>
                    </div>
                    ${itemsHtml}
                </div>

                <div style="display:flex;justify-content:space-between;font-size:16px;font-weight:700;color:#111827;padding-top:4px;">
                    <span>TOTAL</span>
                    <span>${formatCurrency(sale.total)}</span>
                </div>

                <div style="text-align:center;margin-top:24px;padding-top:8px;border-top:1px dashed #d1d5db;">
                    <p style="margin:0;font-size:9px;color:#9ca3af;letter-spacing:1px;">
                        ${footer}
                    </p>
                </div>
            </div>
        `

        const content = wrapper.firstElementChild

        const measurer = document.createElement('div')
        measurer.style.cssText = 'position:fixed;left:-9999px;top:0;width:215px;font-family:monospace;font-size:12px;'
        measurer.appendChild(content.cloneNode(true))
        document.body.appendChild(measurer)
        void measurer.offsetHeight
        const heightPx = measurer.scrollHeight
        const heightMm = Math.max(Math.ceil(heightPx / 3.78) + 3, 20)
        document.body.removeChild(measurer)

        const opt = {
            margin: 0,
            filename: 'ticket.pdf',
            image: { type: 'jpeg', quality: 0.95 },
            html2canvas: { scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#ffffff' },
            jsPDF: {
                unit: 'mm',
                format: [57, heightMm],
                orientation: 'portrait',
            },
        }

        try {
            const blobUrl = await html2pdf().set(opt).from(content).outputPdf('bloburl')
            pdfWindow.location.href = blobUrl
        } catch (err) {
            pdfWindow.close()
            sileo.error({ fill: 'var(--toast-error)', title: 'Error', description: `Error: ${err?.message || err}`})
        }
    }, [sale, business, ticketFooter])

    useEffect(() => {
        if (printRef) printRef.current = handlePrint
    }, [printRef, handlePrint])

    return (
        <div ref={wrapperRef} style={{ display: 'contents' }}>
            {children}
        </div>
    )
}
