import { X, CheckCircle, CircleDollarSign, Loader, AlertTriangle } from 'lucide-react'
import { useStore } from '../../../app/providers/store'
import { useEscape } from '../../../shared/helpers/useEscape'

export const SaleConfirmationModal = ({
    orderSummary = {},
    onConfirm,
    onCancel,
    loading = false,
}) => {
    const { total, paymentMethod, date } = orderSummary
    const today = new Date().toLocaleDateString('en-CA')
    const isCustomDate = date && date !== today
    const { cart } = useStore()

    const formatDate = (dateStr) => {
        if (!dateStr) return ''
        const [year, month, day] = dateStr.split('-')
        return `${day}/${month}/${year}`
    }
    useEscape(onCancel)

    return (
        <section
            className='fixed inset-0 bg-overlay backdrop-blur-xs w-full h-full flex flex-col items-center justify-center z-50 p-4'>
            <section
                className='bg-surface rounded-xl border border-outline shadow-lg w-full max-w-md relative max-h-[90vh] flex flex-col'
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.key === 'Enter' && !loading && onConfirm()}>
                <section className='flex items-center justify-between px-6 py-4 border-b border-divider flex-shrink-0'>
                    <h2 className='text-lg font-semibold flex items-center gap-2'>
                        <CircleDollarSign className='w-5 h-5 text-accent' />
                        Confirmar Venta
                    </h2>
                    <button onClick={onCancel} className='p-1 rounded-md text-accent hover:text-accent/85 border border-disabled hover:border-accent transition cursor-pointer'>
                        <X className='w-6 h-6' />
                    </button>
                </section>
                <div className='p-6 flex flex-col flex-1 overflow-y-auto'>
                <p className='text-sm text-muted mb-4 flex-shrink-0'>
                    Revisa los detalles de la venta antes de confirmar.
                </p>

                {isCustomDate && (
                    <div className='flex items-start gap-2 p-4 mb-4 bg-accent/10 border border-accent rounded-lg flex-shrink-0'>
                        <AlertTriangle className='w-5 h-5 text-red-500 shrink-0' />
                        <div className='text-xs text-red-400'>
                            <p className='font-semibold'>Fecha diferente</p>
                                <p className='text-on-surface'>
                                Esta venta se registrará con fecha <strong>{formatDate(date)}</strong> y no afectará las métricas del día de hoy.
                            </p>
                        </div>
                    </div>
                )}

                <div className='flex-1 overflow-y-auto scrollbar-thin mb-4 pr-2'>
                    <div className='mb-4'>
                        <h3 className='font-semibold text-on-surface mb-2 border-b border-divider-light pb-1'>
                            Productos
                        </h3>
                        <ul className='space-y-2'>
                            {cart.map((item) => (
                                <li key={item.id} className='flex justify-between items-center text-sm'>
                                    <div className='flex items-center gap-2 flex-1 truncate pr-2'>
                                        <span className='font-medium text-on-body'>{item.quantity}x</span>
                                        <span className='truncate text-on-surface'>{item.name}</span>
                                    </div>
                                    <span className='font-semibold text-on-surface'>
                                        ${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(item.price * item.quantity)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className='flex flex-col gap-3 text-on-body bg-subtle p-4 rounded-lg shrink'>
                    <div className='flex justify-between items-center pb-2 border-b border-divider'>
                        <span className='font-medium'>Método de Pago:</span>
                        <span className='font-semibold'>{paymentMethod}</span>
                    </div>
                    <div className='flex justify-between items-center pb-2 border-b border-divider'>
                        <span className='font-medium'>Total de la Orden:</span>
                        <span className='text-xl font-bold text-accent'>${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(total)}</span>
                    </div>
                </div>

                <div className='flex justify-end gap-4 border-t border-divider pt-4 mt-4'>
                    <button
                        type='button'
                        className='px-6 py-3 border border-outline text-on-body hover:bg-hover font-medium rounded-lg transition cursor-pointer'
                        onClick={onCancel}>
                        Cancelar
                    </button>
                    <button
                        type='button'
                        disabled={loading}
                        className='px-6 py-3 bg-accent text-surface rounded-lg hover:bg-accent/85 font-medium transition cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
                        onClick={onConfirm}>
                        {loading ? (
                            <><Loader className='w-5 h-5 animate-spin' /> Confirmando...</>
                        ) : (
                            <><CheckCircle className='w-5 h-5' /> Confirmar Venta</>
                        )}
                    </button>
                </div>
                </div>
            </section>
        </section>
    )
}
