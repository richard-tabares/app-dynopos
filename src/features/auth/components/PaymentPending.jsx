import { useEffect, useCallback, useState } from 'react'
import { useNavigate, useLocation, NavLink } from 'react-router'
import { Loader2, Banknote, Copy, Clock, CheckCircle, ExternalLink } from 'lucide-react'
import { checkPaymentStatus } from '../helpers/checkPaymentStatus'
import { toast } from 'react-toastify'

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

        if (stateData?.bank_info) {
            return
        }

        const interval = setInterval(checkStatus, 5000)
        return () => clearInterval(interval)
    }, [pending_signup_id, reference, stateData, navigate, checkStatus])

    if (!pending_signup_id && !reference) return null

    const { bank_info, amount } = stateData || {}
    const formatPrice = (value) =>
        new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(value)

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
        toast.success('Copiado al portapapeles')
    }

    if (bank_info) {
        return (
            <section className='w-full flex flex-col items-center justify-center bg-surface px-4 py-8'>
                <section className='w-2/4 max-lg:w-2/3 max-md:w-full p-6 md:p-10'>
                    <section className='text-center mb-8'>
                        <Banknote className='w-16 h-16 text-primary-600 mx-auto mb-4' />
                        <h1 className='text-2xl font-bold text-on-surface mb-2'>
                            Pago por Transferencia
                        </h1>
                        <p className='text-on-body'>
                            Realiza la transferencia por{' '}
                            <strong>${formatPrice(amount)}</strong> a la siguiente cuenta:
                        </p>
                    </section>

                    <section className='bg-surface border border-divider rounded-lg p-6 shadow-xs space-y-4'>
                        <section className='flex justify-between items-center py-2 border-b border-divider-light'>
                            <span className='text-sm text-muted'>Banco</span>
                            <span className='text-sm font-semibold text-on-surface'>{bank_info.bank}</span>
                        </section>
                        <section className='flex justify-between items-center py-2 border-b border-divider-light'>
                            <span className='text-sm text-muted'>Tipo de cuenta</span>
                            <span className='text-sm font-semibold text-on-surface'>{bank_info.account_type}</span>
                        </section>
                        <section className='flex justify-between items-center py-2 border-b border-divider-light'>
                            <span className='text-sm text-muted'>Número de cuenta</span>
                            <section className='flex items-center gap-2'>
                                <span className='text-sm font-semibold text-on-surface'>{bank_info.account_number}</span>
                                <button
                                    onClick={() => copyToClipboard(bank_info.account_number)}
                                    className='bg-transparent border-none cursor-pointer p-1 hover:bg-hover-strong rounded transition'>
                                    <Copy className='w-4 h-4 text-faint' />
                                </button>
                            </section>
                        </section>
                        <section className='flex justify-between items-center py-2 border-b border-divider-light'>
                            <span className='text-sm text-muted'>Titular</span>
                            <span className='text-sm font-semibold text-on-surface'>{bank_info.holder}</span>
                        </section>
                        <section className='flex justify-between items-center py-2 border-b border-divider-light'>
                            <span className='text-sm text-muted'>NIT</span>
                            <span className='text-sm font-semibold text-on-surface'>{bank_info.nit}</span>
                        </section>
                        <section className='flex justify-between items-center py-2'>
                            <span className='text-sm text-muted'>Referencia</span>
                            <section className='flex items-center gap-2'>
                                <span className='text-sm font-bold text-primary-600'>{reference}</span>
                                <button
                                    onClick={() => copyToClipboard(reference)}
                                    className='bg-transparent border-none cursor-pointer p-1 hover:bg-hover-strong rounded transition'>
                                    <Copy className='w-4 h-4 text-faint' />
                                </button>
                            </section>
                        </section>
                    </section>

                    <section className='bg-amber-50 border border-amber-200 rounded-lg p-4 mt-6'>
                        <section className='flex items-start gap-3'>
                            <Clock className='w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0' />
                            <div>
                                <p className='text-sm font-semibold text-amber-800'>
                                    Pendiente de confirmación
                                </p>
                                <p className='text-xs text-amber-700 mt-1'>
                                    Envía el comprobante de pago a soporte@dynopos.co con la
                                    referencia <strong>{reference}</strong> para activar tu cuenta.
                                    Una vez confirmado, recibirás un correo con tus credenciales.
                                </p>
                            </div>
                        </section>
                    </section>
                </section>
            </section>
        )
    }

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
                <Loader2 className='w-16 h-16 text-primary-600 mx-auto mb-6 animate-spin' />
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
