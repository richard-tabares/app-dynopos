import { useState } from 'react'
import { CreditCard, Loader } from 'lucide-react'
import { UpdatePaymentMethodModal } from './UpdatePaymentMethodModal'

export const PaymentMethodCard = ({ isAutoRenew, onToggle, businessId, customerEmail, onPaymentMethodUpdated }) => {
    const [loading, setLoading] = useState(false)
    const [modalOpen, setModalOpen] = useState(false)

    const handleToggleRecurring = async () => {
        setLoading(true)
        try {
            await onToggle(!isAutoRenew)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <section className='bg-surface border border-outline shadow-sm rounded-lg'>
                <div className='px-6 py-3 border-b border-divider bg-body/50'>
                    <h2 className='text-lg font-semibold flex items-center gap-2'>
                        <CreditCard className='w-5 h-5 text-accent' />
                        Información de Pago
                    </h2>
                </div>
                <div className='p-6 space-y-6'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <p className='text-sm text-muted mb-1'>Método de Pago</p>
                            <p className='font-medium'>
                                {'Tarjeta de crédito/débito'}
                            </p>
                        </div>
                        <button
                            onClick={() => setModalOpen(true)}
                            className='px-4 py-2 bg-accent text-surface text-sm font-medium rounded-lg hover:bg-accent/85 transition cursor-pointer flex items-center gap-2'
                        >
                            <CreditCard className='w-4 h-4' /> Actualizar
                        </button>
                    </div>

                    <div className='flex items-center justify-between pt-4 border-t border-divider'>
                        <div>
                            <p className='font-medium'>Pagos Recurrentes</p>
                            <p className='text-sm text-muted'>
                                {isAutoRenew
                                    ? 'Los pagos se renovarán automáticamente'
                                    : 'Los pagos automáticos están desactivados'}
                            </p>
                        </div>
                        <label className='relative inline-flex items-center cursor-pointer'>
                            <input
                                type='checkbox'
                                className='sr-only peer'
                                checked={isAutoRenew}
                                onChange={handleToggleRecurring}
                                disabled={loading}
                            />
                            {loading ? (
                                <Loader className='w-5 h-5 animate-spin text-accent' />
                            ) : (
                                <div className="w-11 h-6 bg-hover-icon peer-focus:outline-none peer-focus:ring-0 rounded-full peer-checked:after:translate-x-full peer-checked:after:border-surface after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-surface after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                            )}
                        </label>
                    </div>
                </div>
            </section>

            <UpdatePaymentMethodModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                businessId={businessId}
                customerEmail={customerEmail}
                onSuccess={(result) => {
                    onPaymentMethodUpdated(result)
                }}
            />
        </>
    )
}
