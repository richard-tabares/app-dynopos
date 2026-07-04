import { useState } from 'react'
import { FileDown, Receipt, Loader, ChevronDown } from 'lucide-react'
import { useStore } from '../../../../app/providers/store'
import { useFormatDate } from '../../../../shared/helpers/useFormatDate'
import html2pdf from 'html2pdf.js'

const statusColors = {
    approved: 'text-green-600 bg-green-50 dark:bg-green-900/20',
    pending: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
    declined: 'text-red-600 bg-red-50 dark:bg-red-900/20',
    error: 'text-red-600 bg-red-50 dark:bg-red-900/20',
    refunded: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
}

const statusLabels = {
    approved: 'Aprobado',
    pending: 'Pendiente',
    declined: 'Rechazado',
    error: 'Error',
    refunded: 'Reembolsado',
}

const paymentMethodLabels = {
    card: 'Tarjeta',
    pse: 'PSE',
    cash: 'Efectivo',
    transfer: 'Transferencia',
}

const formatCurrency = (value) =>
    new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(value)

export const PaymentHistoryTable = ({ transactions, loading }) => {
    const formatDate = useFormatDate()
    const user = useStore((state) => state.user)
    const [visibleCount, setVisibleCount] = useState(10)
    const visibleTransactions = (transactions || []).slice(0, visibleCount)

    const handleDownloadPDF = (transaction) => {
        const business = user?.business || {}
        const frequencyLabel = transaction.billing_frequency === 'annual' ? 'Anual' : transaction.billing_frequency === 'quarterly' ? 'Trimestral' : 'Mensual'
        const content = document.createElement('div')
        content.innerHTML = `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; text-align: center;">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" style="margin: 0 auto 16px;">
                    <circle cx="12" cy="12" r="12" fill="#16a34a"/>
                    <path d="M7 12.5l3 3 7-7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>

                <h1 style="font-size: 22px; font-weight: 700; color: #111; margin: 0 0 8px;">Pago exitoso</h1>
                <p style="font-size: 13px; color: #666; margin: 0 0 4px;">
                    ${business.business_name ? 'Recibo de pago de <strong>' + business.business_name + '</strong>' : 'Recibo de pago'}
                </p>

                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px; margin: 16px 0 24px; text-align: center;">
                    <p style="font-size: 24px; font-weight: 700; color: #16a34a; margin: 0;">
                        $${formatCurrency(transaction.amount)}
                    </p>
                    <p style="font-size: 12px; color: #16a34a; margin: 2px 0 0;">${frequencyLabel}</p>
                </div>

                <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; text-align: left; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                    <h2 style="font-size: 16px; font-weight: 700; color: #111; margin: 0 0 16px; text-align: center;">
                        Comprobante de Pago
                    </h2>

                    <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6;">
                        <span style="font-size: 13px; color: #666;">Referencia</span>
                        <span style="font-size: 13px; font-weight: 600; color: #111;">${transaction.reference || '-'}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6;">
                        <span style="font-size: 13px; color: #666;">ID Transacción</span>
                        <span style="font-size: 13px; font-weight: 600; color: #111;">${transaction.wompi_transaction_id || '-'}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6;">
                        <span style="font-size: 13px; color: #666;">Plan</span>
                        <span style="font-size: 13px; font-weight: 600; color: #111;">Plan Emprendedor</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6;">
                        <span style="font-size: 13px; color: #666;">Frecuencia</span>
                        <span style="font-size: 13px; font-weight: 600; color: #111;">${frequencyLabel}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6;">
                        <span style="font-size: 13px; color: #666;">Monto</span>
                        <span style="font-size: 18px; font-weight: 700; color: #0284c7;">$${formatCurrency(transaction.amount)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6;">
                        <span style="font-size: 13px; color: #666;">Método de pago</span>
                        <span style="font-size: 13px; font-weight: 600; color: #111;">${paymentMethodLabels[transaction.payment_method] || transaction.payment_method || '—'}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6;">
                        <span style="font-size: 13px; color: #666;">Estado</span>
                        <span style="font-size: 13px; font-weight: 600; color: #16a34a;">APROBADO</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6;">
                        <span style="font-size: 13px; color: #666;">Fecha</span>
                        <span style="font-size: 13px; font-weight: 600; color: #111;">${formatDate(transaction.created_at, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    ${business.business_name ? `
                    <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6;">
                        <span style="font-size: 13px; color: #666;">Empresa</span>
                        <span style="font-size: 13px; font-weight: 600; color: #111;">${business.business_name}</span>
                    </div>` : ''}
                    ${business.email ? `
                    <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6;">
                        <span style="font-size: 13px; color: #666;">Email de facturación</span>
                        <span style="font-size: 13px; font-weight: 600; color: #111;">${business.email}</span>
                    </div>` : ''}
                    ${business.owner_name ? `
                    <div style="display: flex; justify-content: space-between; padding: 10px 0;">
                        <span style="font-size: 13px; color: #666;">Titular</span>
                        <span style="font-size: 13px; font-weight: 600; color: #111;">${business.owner_name}</span>
                    </div>` : ''}
                </div>

                ${business.ticket_footer ? `
                <p style="font-size: 11px; color: #999; text-align: center; margin-top: 24px;">
                    ${business.ticket_footer}
                </p>` : ''}
            </div>
        `

        const opt = {
            margin: [0.5, 0.5],
            filename: `comprobante-${transaction.reference || transaction.id}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
        }

        html2pdf().set(opt).from(content).save()
    }

    if (loading) {
        return (
            <section className='bg-surface border border-outline shadow-sm rounded-lg'>
                <div className='px-6 py-4 border-b border-divider bg-body/50'>
                    <h2 className='text-lg font-semibold flex items-center gap-2'>
                        <Receipt className='w-5 h-5 text-accent' />
                        Historial de Pagos
                    </h2>
                </div>
                <div className='p-6 flex items-center justify-center py-12'>
                    <Loader className='w-5 h-5 animate-spin text-accent' />
                </div>
            </section>
        )
    }

    if (!transactions || transactions.length === 0) {
        return (
            <section className='bg-surface border border-outline shadow-sm rounded-lg'>
                <div className='px-6 py-4 border-b border-divider bg-body/50'>
                    <h2 className='text-lg font-semibold flex items-center gap-2'>
                        <Receipt className='w-5 h-5 text-accent' />
                        Historial de Pagos
                    </h2>
                </div>
                <div className='p-6 text-center py-12'>
                    <Receipt className='w-12 h-12 text-faint mx-auto mb-3' />
                    <p className='text-muted'>No hay pagos registrados</p>
                </div>
            </section>
        )
    }

    return (
        <section className='bg-surface border border-outline shadow-sm rounded-lg'>
            <div className='px-6 py-4 border-b border-divider bg-body/50'>
                <h2 className='text-lg font-semibold flex items-center gap-2'>
                    <Receipt className='w-5 h-5 text-accent' />
                    Historial de Pagos
                </h2>
            </div>
            <div>
                <table className='w-full text-sm'>
                    <thead>
                        <tr className='border-b border-divider bg-body/50'>
                            <th className='text-left px-4 py-3 font-medium text-muted'>Fecha</th>
                            <th className='text-left px-4 py-3 font-medium text-muted'>Referencia</th>
                            <th className='text-right px-4 py-3 font-medium text-muted'>Monto</th>
                            <th className='text-left px-4 py-3 font-medium text-muted'>Método</th>
                            <th className='text-left px-4 py-3 font-medium text-muted'>Estado</th>
                            <th className='text-center px-4 py-3 font-medium text-muted'>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {visibleTransactions.map((tx) => (
                            <tr key={tx.id} className='border-b border-divider hover:bg-body/50 transition'>
                                <td className='px-4 py-3 text-sm'>{formatDate(tx.created_at, { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                                <td className='px-4 py-3 text-sm font-mono max-w-[140px] truncate overflow-hidden text-ellipsis whitespace-nowrap'>
                                    {tx.reference || tx.wompi_transaction_id || '—'}
                                </td>
                                <td className='px-4 py-3 text-sm text-right font-medium'>
                                    ${formatCurrency(tx.amount)}
                                </td>
                                <td className='px-4 py-3 text-sm'>
                                    {paymentMethodLabels[tx.payment_method] || tx.payment_method || '—'}
                                </td>
                                <td className='px-4 py-3 text-sm'>
                                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[tx.status] || ''}`}>
                                        {statusLabels[tx.status] || tx.status}
                                    </span>
                                </td>
                                <td className='px-4 py-3 text-sm text-center'>
                                    <button
                                        onClick={() => handleDownloadPDF(tx)}
                                        disabled={tx.status !== 'approved'}
                                        className='inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-accent text-surface rounded-lg hover:bg-accent/85 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed'
                                    >
                                        <FileDown className='w-3.5 h-3.5' />
                                        PDF
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {visibleCount < (transactions || []).length && (
                    <div className='px-4 pb-4'>
                        <button
                            onClick={() => setVisibleCount(prev => prev + 10)}
                            className='w-full py-2 text-sm font-medium text-on-surface hover:text-surface hover:bg-accent rounded-lg border border-accent transition-colors cursor-pointer flex items-center justify-center gap-2'
                        >
                            <ChevronDown className='w-4 h-4' /> Cargar más ({(transactions || []).length - visibleCount} restantes)
                        </button>
                    </div>
                )}
            </div>
        </section>
    )
}
