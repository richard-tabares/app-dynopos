import { Crown, Calendar, DollarSign, Loader, CreditCard, AlertTriangle } from 'lucide-react'
import { useFormatDate } from '../../../../shared/helpers/useFormatDate'

const statusColors = {
    active: 'text-green-600 bg-green-50 dark:bg-green-900/20',
    cancelled: 'text-red-600 bg-red-50 dark:bg-red-900/20',
    expired: 'text-red-600 bg-red-50 dark:bg-red-900/20',
    past_due: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
    trial: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
}

const statusLabels = {
    active: 'Activa',
    cancelled: 'Cancelada',
    expired: 'Expirada',
    past_due: 'Vencida',
    trial: 'Prueba',
}

const frequencyLabels = {
    monthly: 'Mensual',
    quarterly: 'Trimestral',
    annual: 'Anual',
}

const formatCurrency = (value) =>
    new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(value)

export const SubscriptionInfo = ({ subscription, loading, onPayNow, isPaying, hasPaymentSource }) => {
    const formatDate = useFormatDate()
    if (loading) {
        return (
            <section className='bg-settings-card border border-outline shadow-sm rounded-lg'>
                <div className='p-6 flex items-center justify-center py-12'>
                    <Loader className='w-5 h-5 animate-spin text-accent' />
                </div>
            </section>
        )
    }

    if (!subscription) {
        return (
            <section className='bg-settings-card border border-outline shadow-sm rounded-lg'>
                <div className='p-6 text-center py-12'>
                    <Crown className='w-12 h-12 text-faint mx-auto mb-3' />
                    <p className='text-muted'>No tienes una suscripción activa</p>
                </div>
            </section>
        )
    }

    return (
        <section className='bg-settings-card border border-outline shadow-sm rounded-lg'>
            <div className='p-6'>
                {(() => {
                    const today = new Date().toISOString().split('T')[0]
                    const isExpired = (subscription.current_period_end && subscription.current_period_end < today)
                        || subscription.status === 'expired'
                        || subscription.status === 'past_due'
                    if (!isExpired) return null

                    const pastDueMs = subscription.past_due_at ? new Date(subscription.past_due_at).getTime() : 0
                    const daysPastDue = pastDueMs
                        ? Math.floor((new Date().getTime() - pastDueMs) / (1000 * 60 * 60 * 24))
                        : 0
                    const graceRemaining = Math.max(0, 7 - daysPastDue)

                    return (
                        <div className={`flex items-start gap-3 p-3 mb-4 rounded-lg border ${
                            subscription.status === 'past_due'
                                ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                        }`}>
                            <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${
                                subscription.status === 'past_due' ? 'text-yellow-600' : 'text-red-600'
                            }`} />
                            <p className={`text-sm ${
                                subscription.status === 'past_due' ? 'text-yellow-700 dark:text-yellow-300' : 'text-red-700 dark:text-red-300'
                            }`}>
                                {subscription.status === 'past_due' ? (
                                    <>Tu suscripción está <span className='font-semibold'>vencida</span>. Tienes <span className='font-semibold'>{graceRemaining} días</span> de gracia para renovar antes de que se desactive.</>
                                ) : (
                                    <>Tu suscripción está <span className='font-semibold'>vencida o inactiva</span>. Renueva tu plan para seguir usando todas las funciones.</>
                                )}
                            </p>
                        </div>
                    )
                })()}
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6'>
                    <div>
                        <p className='text-sm text-muted mb-1'>Plan</p>
                        <p className='text-lg font-semibold'>{subscription.plan?.name || 'Sin plan'}</p>
                        {subscription.plan?.description && (
                            <p className='text-xs text-muted'>{subscription.plan.description}</p>
                        )}
                    </div>
                    <div>
                        <p className='text-sm text-muted mb-1'>Estado</p>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusColors[subscription.status] || 'text-muted'}`}>
                            {statusLabels[subscription.status] || subscription.status}
                        </span>
                    </div>
                    <div>
                        <p className='text-sm text-muted mb-1'>Auto-renovación</p>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                            subscription.auto_renew
                                ? 'text-green-600 bg-green-50 dark:bg-green-900/20'
                                : 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
                        }`}>
                            {subscription.auto_renew ? 'Activa' : 'Inactiva'}
                        </span>
                    </div>
                    <div>
                        <p className='text-sm text-muted mb-1'>Frecuencia</p>
                        <p className='text-lg font-semibold flex items-center gap-2'>
                            <Calendar className='w-4 h-4 text-accent' />
                            {frequencyLabels[subscription.billing_frequency] || subscription.billing_frequency}
                        </p>
                    </div>
                    <div>
                        <p className='text-sm text-muted mb-1'>Próxima Facturación</p>
                        <p className='text-lg font-semibold flex items-center gap-2'>
                            <DollarSign className='w-4 h-4 text-accent' />
                            {subscription.current_period_end ? formatDate(subscription.current_period_end, { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                        </p>
                    </div>
                </div>
                {subscription.plan?.monthly_price && (
                    <div className='mt-4 pt-4 border-t border-divider'>
                        <p className='text-sm text-muted'>
                            Precio:{' '}
                            <span className='font-semibold text-on-body'>
                                ${formatCurrency(subscription.plan.monthly_price)}/mes
                            </span>
                        </p>
                    </div>
                )}

                {(() => {
                    const todayPay = new Date().toISOString().split('T')[0]
                    const isExpiredPay = (subscription.current_period_end && subscription.current_period_end < todayPay)
                        || subscription.status === 'expired'
                        || subscription.status === 'past_due'
                    if (!isExpiredPay) return null

                    return (
                        <div className='mt-4 pt-4 border-t border-divider'>
                            {hasPaymentSource ? (
                                <button
                                    onClick={onPayNow}
                                    disabled={isPaying}
                                    className='w-full px-6 py-3 bg-accent text-surface border-none rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 hover:bg-accent/85 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                                >
                                    {isPaying ? (
                                        <><Loader className='w-5 h-5 animate-spin text-surface' /> Procesando pago...</>
                                    ) : (
                                        <><CreditCard className='w-5 h-5' /> Pagar Ahora</>
                                    )}
                                </button>
                            ) : null}
                        </div>
                    )
                })()}
            </div>
        </section>
    )
}
