import { useEffect, useCallback, useState } from 'react'
import { useNavigate, useLocation, NavLink } from 'react-router'
import { Loader, Clock, CheckCircle, ExternalLink } from 'lucide-react'
import { checkPaymentStatus } from '../helpers/checkPaymentStatus'

export const PaymentPending = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [status, setStatus] = useState('pending')
    const stateData = location.state

    const pending_signup_id = stateData?.pending_signup_id || new URLSearchParams(location.search).get('id')
    const reference = stateData?.reference || new URLSearchParams(location.search).get('reference')

    const checkStatus = useCallback(async () => {
        if (!pending_signup_id) return
        try {
            const result = await checkPaymentStatus(pending_signup_id)
            setStatus(result.transaction_status || result.status)

            if (result.status === 'completed' || result.transaction_status === 'approved') {
                setTimeout(() => {
                    localStorage.removeItem('dynopos_signup')
                    navigate('/signup/success', { replace: true })
                }, 1500)
            }
        } catch {
            // keep polling
        }
    }, [pending_signup_id, navigate])

    useEffect(() => {
        if (!pending_signup_id && !reference) {
            navigate('/signup', { replace: true })
            return
        }

        const interval = setInterval(checkStatus, 5000)
        return () => clearInterval(interval)
    }, [pending_signup_id, reference, stateData, navigate, checkStatus])

    if (!pending_signup_id && !reference) return null

    if (status === 'approved' || status === 'completed') {
        return (
            <section className='w-full flex flex-col items-center justify-center bg-surface px-4 py-8'>
                <section className='text-center'>
                    <CheckCircle className='w-20 h-20 text-green-500 mx-auto mb-6' />
                    <h1 className='text-2xl font-bold text-on-surface mb-2'>
                        ¡Pago exitoso!
                    </h1>
                    <p className='text-on-body mb-8'>
                        Tu cuenta está siendo creada. Redirigiendo...
                    </p>
                </section>
            </section>
        )
    }

    return (
        <section className='w-full flex flex-col items-center justify-center bg-surface px-4 py-8'>
            <section className='text-center'>
                <Loader className='w-5 h-5 animate-spin text-accent mx-auto mb-6' />
                <h1 className='text-2xl font-bold text-on-surface mb-2'>
                    Confirmando tu pago
                </h1>
                <p className='text-on-body mb-4'>
                    Estamos verificando el estado de tu transacción...
                </p>
                <section className='flex items-center justify-center gap-2 text-sm text-muted'>
                    <Clock className='w-4 h-4' />
                    No cierres esta página
                </section>
            </section>
        </section>
    )
}
