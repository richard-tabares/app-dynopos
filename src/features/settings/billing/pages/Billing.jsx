import { useEffect, useState, useCallback } from 'react'
import { useStore } from '../../../../app/providers/store'
import { getSubscription, getTransactions, cancelRecurring, reactivateSubscription, payNow } from '../helpers/getBillingData'
import { SubscriptionInfo } from '../components/SubscriptionInfo'
import { PaymentMethodCard } from '../components/PaymentMethodCard'
import { PaymentHistoryTable } from '../components/PaymentHistoryTable'
import { sileo } from 'sileo'

export const Billing = () => {
    const user = useStore((state) => state.user)
    const businessId = user?.data?.user?.id

    const [subscription, setSubscription] = useState(null)
    const [transactions, setTransactions] = useState([])
    const [loadingSub, setLoadingSub] = useState(true)
    const [loadingTx, setLoadingTx] = useState(true)
    const [isPaying, setIsPaying] = useState(false)

    const fetchData = useCallback(async () => {
        if (!businessId) return

        setLoadingSub(true)
        setLoadingTx(true)
        try {
            const [subResult, txResult] = await Promise.all([
                getSubscription(businessId),
                getTransactions(businessId),
            ])
            setSubscription(subResult)
            setTransactions(txResult || [])
        } catch (error) {
            console.error('Error loading billing data:', error)
        } finally {
            setLoadingSub(false)
            setLoadingTx(false)
        }
    }, [businessId])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const refreshBillingData = useCallback(async () => {
        if (!businessId) return
        try {
            const [subResult, txResult] = await Promise.all([
                getSubscription(businessId),
                getTransactions(businessId),
            ])
            setSubscription(subResult)
            setTransactions(txResult || [])
        } catch (error) {
            console.error('Error refreshing billing data:', error)
        }
    }, [businessId])

    const handlePayNow = useCallback(async () => {
        setIsPaying(true)
        try {
            const result = await payNow(businessId)
            if (result.renewed) {
                sileo.success({ fill: 'var(--toast-success)', title: 'Completado', description: 'Suscripción renovada exitosamente'})
            } else if (result.transaction?.status === 'pending') {
                sileo.info({ fill: 'var(--toast-info)', title: 'Información', description: 'El pago está pendiente de confirmación. Se actualizará automáticamente.'})
            } else {
                sileo.error({ fill: 'var(--toast-error)', title: 'Error', description: 'No se pudo renovar la suscripción. Verifica tu método de pago.'})
            }
            await refreshBillingData()
        } catch (error) {
            sileo.error({ fill: 'var(--toast-error)', title: 'Error', description: error.message || 'Error al procesar el pago'})
            await refreshBillingData()
        } finally {
            setIsPaying(false)
        }
    }, [businessId, refreshBillingData])

    const handleToggleAutoRenew = useCallback(async (newValue) => {
        const prev = subscription
        setSubscription((s) => s ? { ...s, auto_renew: newValue } : s)
        try {
            if (newValue) {
                await reactivateSubscription(businessId)
                sileo.success({ fill: 'var(--toast-success)', title: 'Completado', description: 'Pagos recurrentes activados'})
            } else {
                await cancelRecurring(businessId)
                sileo.success({ fill: 'var(--toast-success)', title: 'Completado', description: 'Pagos recurrentes desactivados'})
            }
        } catch (error) {
            setSubscription(prev)
            sileo.error({ fill: 'var(--toast-error)', title: 'Error', description: error.message || 'Error al actualizar'})
        }
    }, [subscription, businessId])

    return (
        <section className='flex flex-col gap-6'>
            <section>
                <h1 className='text-2xl font-bold'>Facturación</h1>
                <p className='text-on-body'>Gestiona tu suscripción y métodos de pago</p>
            </section>

            <SubscriptionInfo
                subscription={subscription}
                loading={loadingSub}
                onPayNow={handlePayNow}
                isPaying={isPaying}
                hasPaymentSource={!!subscription?.wompi_payment_source_id}
            />

            <PaymentMethodCard
                isAutoRenew={subscription?.auto_renew === true}
                onToggle={handleToggleAutoRenew}
                businessId={businessId}
                customerEmail={user?.business?.email || user?.data?.user?.email}
                onPaymentMethodUpdated={refreshBillingData}
            />

            <PaymentHistoryTable transactions={transactions} loading={loadingTx} />
        </section>
    )
}
