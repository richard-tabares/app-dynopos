import { useEffect, useState, useCallback } from 'react'
import { useStore } from '../../../../app/providers/store'
import { getSubscription, getTransactions, cancelRecurring, reactivateSubscription } from '../helpers/getBillingData'
import { SubscriptionInfo } from '../components/SubscriptionInfo'
import { PaymentMethodCard } from '../components/PaymentMethodCard'
import { PaymentHistoryTable } from '../components/PaymentHistoryTable'
import { toast } from 'react-toastify'

export const Billing = () => {
    const user = useStore((state) => state.user)
    const businessId = user?.data?.user?.id

    const [subscription, setSubscription] = useState(null)
    const [transactions, setTransactions] = useState([])
    const [loadingSub, setLoadingSub] = useState(true)
    const [loadingTx, setLoadingTx] = useState(true)

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

    const handleToggleAutoRenew = useCallback(async (newValue) => {
        const prev = subscription
        setSubscription((s) => s ? { ...s, auto_renew: newValue } : s)
        try {
            if (newValue) {
                await reactivateSubscription(businessId)
                toast.success('Pagos recurrentes activados')
            } else {
                await cancelRecurring(businessId)
                toast.success('Pagos recurrentes desactivados')
            }
        } catch (error) {
            setSubscription(prev)
            toast.error(error.message || 'Error al actualizar')
        }
    }, [subscription, businessId])

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

    return (
        <section className='flex flex-col gap-6'>
            <section>
                <h1 className='text-2xl font-bold'>Facturación</h1>
                <p className='text-on-body'>Gestiona tu suscripción y métodos de pago</p>
            </section>

            <SubscriptionInfo subscription={subscription} loading={loadingSub} />

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
