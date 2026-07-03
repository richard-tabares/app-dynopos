import { useState } from 'react'
import { CheckCircle, CircleDollarSign, Loader, AlertTriangle, Banknote, RotateCcw } from 'lucide-react'
import { useStore } from '../../../app/providers/store'
import { useFormatDate } from '../../../shared/helpers/useFormatDate'
import { Modal } from '../../../shared/components/Modal'

const nf = (value) =>
    new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(value)

const presets = [5, 10, 20, 50, 100]

export const SaleConfirmationModal = ({
    orderSummary = {},
    onConfirm,
    onCancel,
    loading = false,
    saleCompleted = false,
}) => {
    const { total, paymentMethod, date } = orderSummary
    const today = new Date().toLocaleDateString('en-CA')
    const isCustomDate = date && date !== today
    const { cart } = useStore()
    const formatDate = useFormatDate()
    const [paymentAmount, setPaymentAmount] = useState(total || 0)
    const [cartSnapshot] = useState(cart)
    const isEfectivo = paymentMethod === 'Efectivo'
    const change = paymentAmount - (total || 0)

    return (
        <Modal
            onClose={onCancel}
            title='Confirmar Venta'
            icon={CircleDollarSign}
        >
            <section
                className='flex flex-col flex-1 overflow-y-auto scrollbar-none max-h-[calc(90vh-65px)]'>
                <div className='p-6 flex flex-col flex-1'>
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

                    <div className='flex-1 overflow-y-auto scrollbar-thin mb-4 pr-2 border-divider'>
                        <div className='mb-4 w-auto'>
                            <h3 className='font-semibold text-on-surface mb-2 border-b border-divider pb-2'>
                                Productos
                            </h3>
                            <ul className='space-y-2 px-2'>
                                {cartSnapshot.map((item) => (
                                    <li key={item.cartKey || item.id} className='flex justify-between items-center text-sm'>
                                        <div className='flex items-center gap-2 flex-1 truncate pr-2'>
                                            <span className='font-medium text-on-body'>{item.quantity}{item.displayUnit ? ` ${item.displayUnit}` : ''}x</span>
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

                    <div className='flex flex-col gap-0 text-on-body bg-subtle py-3 rounded-lg shrink'>
                        <div className='flex justify-between items-center py-2 border-y border-divider'>
                            <span className='font-semibold'>Método de Pago:</span>
                            <span className='font-medium'>{paymentMethod}</span>
                        </div>

                        {isEfectivo && (
                            <div className='py-4 border-b border-divider space-y-3'>
                                <p className='font-semibold'>¿Con cuánto pagan?</p>
                                <div className='flex gap-2 flex-wrap justify-center px-2'>
                                    {presets.map(amount => (
                                        <button
                                        key={amount}
                                        type='button'
                                        onClick={() => setPaymentAmount(amount * 1000)}
                                        className='flex items-center gap-1 px-2.5 py-1.5 bg-surface border border-outline rounded-md text-xs font-medium text-on-surface hover:bg-accent/5 hover:text-accent hover:border-accent transition cursor-pointer'
                                        >
                                            <Banknote className='w-3.5 h-3.5' />
                                            ${amount}k
                                        </button>
                                    ))}
                                </div>
                                <div className='flex items-center gap-2'>
                                    <span className='text-sm font-medium text-on-surface shrink-0'>Paga con: $</span>
                                    <div className='flex w-full'>
                                        <input
                                            type='number'
                                            value={paymentAmount || ''}
                                            onChange={(e) => setPaymentAmount(Math.max(0, parseInt(e.target.value) || 0))}
                                            className='flex-1 border border-divider border-r-0 rounded-l-md px-3 py-2 text-sm text-right font-semibold text-on-surface focus:outline-none focus:border-accent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                                            placeholder='0'
                                        />
                                        <button
                                            type='button'
                                            onClick={() => setPaymentAmount(total)}
                                            className='flex items-center justify-center px-2.5 border border-divider rounded-r-md bg-surface text-muted hover:text-accent hover:border-accent hover:bg-accent/5 transition cursor-pointer'
                                        >
                                            <RotateCcw className='w-3.5 h-3.5' />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className='flex justify-between items-center py-2 border-b border-divider'>
                            <span className='font-medium'>Total de la Orden:</span>
                            <span className='text-xl font-bold text-accent'>${nf(total)}</span>
                        </div>

                        {isEfectivo && (
                            <div className='flex justify-between items-center py-2'>
                                <span className='font-medium'>Su Devuelta:</span>
                                <span className={`text-md font-bold ${change > 0 ? 'text-toast-success' : change < 0 ? 'text-red-500' : 'text-muted/50'}`}>
                                    {change >= 0 ? '' : '-'}${nf(Math.abs(change))}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className='flex justify-end gap-4 pt-2 mt-2'>
                        <button
                            type='button'
                            className='px-6 py-3 border border-outline text-on-body hover:bg-hover font-medium rounded-lg transition cursor-pointer'
                            onClick={onCancel}>
                            {saleCompleted ? 'Cerrar' : 'Cancelar'}
                        </button>
                        <button
                            type='button'
                            disabled={loading || saleCompleted || (isEfectivo && (change < 0 || paymentAmount <= 0))}
                            className='px-6 py-3 bg-accent text-surface rounded-lg hover:bg-accent/85 font-medium transition cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
                            onClick={() => onConfirm(paymentAmount)}>
                            {loading ? (
                                <><Loader className='w-5 h-5 animate-spin text-surface' /> Confirmando...</>
                            ) : saleCompleted ? (
                                <><CheckCircle className='w-5 h-5' /> Venta Confirmada</>
                            ) : (
                                <><CheckCircle className='w-5 h-5' /> Confirmar Venta</>
                            )}
                        </button>
                    </div>
                </div>
            </section>
        </Modal>
    )
}
