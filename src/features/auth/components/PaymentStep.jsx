import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router'
import { CreditCard, Landmark, ArrowLeft, Check, Calendar, CalendarCheck } from 'lucide-react'
import { createCheckout } from '../helpers/createCheckout'
import { toast } from 'react-toastify'
import { decryptData, encryptData } from '../../../shared/helpers/crypto'

export const PaymentStep = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const stateData = location.state

    const storedRaw = localStorage.getItem('dynopos_signup')
    const storedData = storedRaw ? JSON.parse(decryptData(storedRaw)) : null
    const pending_signup_id = stateData?.pending_signup_id || storedData?.pending_signup_id
    const signupData = storedData

    const [billingFrequency, setBillingFrequency] = useState('monthly')
    const [paymentMethod, setPaymentMethod] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!pending_signup_id || !signupData) {
            navigate('/signup', { replace: true })
        }
    }, [pending_signup_id, signupData, navigate])

    if (!pending_signup_id || !signupData) return null

    const plan = signupData.plan

    const handlePayment = async () => {
        if (!paymentMethod) {
            toast.error('Selecciona un método de pago')
            return
        }

        if (!signupData?.email) {
            toast.error('Datos de registro no encontrados. Vuelve a registrarte.')
            navigate('/signup', { replace: true })
            return
        }

        setLoading(true)
        try {
            const result = await createCheckout({
                pending_signup_id,
                billing_frequency: billingFrequency,
                payment_method: paymentMethod,
            })

            const signupDataUpdated = {
                ...signupData,
                billing_frequency: billingFrequency,
            }
            localStorage.setItem('dynopos_signup', encryptData(JSON.stringify(signupDataUpdated)))

            if (paymentMethod === 'card') {
                navigate('/signup/card-payment', {
                    state: {
                        pending_signup_id,
                        billing_frequency: billingFrequency,
                        plan: plan,
                        email: signupData.email,
                    },
                    replace: true,
                })
            } else if (result.checkout_url) {
                window.location.href = result.checkout_url
            } else {
                toast.error('Error al iniciar el pago')
            }
        } catch (error) {
            toast.error(error.message || 'Error al procesar el pago')
        } finally {
            setLoading(false)
        }
    }

    const formatPrice = (value) =>
        new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(value)

    const monthlyPrice = plan?.monthly_price || 39900
    const annualPrice = plan?.annual_price || 430920
    const currentPrice = billingFrequency === 'annual' ? annualPrice : monthlyPrice

    return (
        <section className='w-full flex flex-col items-center justify-center bg-surface px-4 py-8'>
            <section className='w-2/4 max-lg:w-2/3 max-md:w-full p-6 md:p-10'>
                <section className='flex items-center justify-center gap-3 mb-8'>
                    <section className='flex items-center gap-2'>
                        <span className='w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold'>
                            <Check className='w-4 h-4' />
                        </span>
                        <span className='text-sm font-semibold text-green-600'>
                            Datos
                        </span>
                    </section>
                    <section className='w-12 h-0.5 bg-primary-600' />
                    <section className='flex items-center gap-2'>
                        <span className='w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold'>
                            2
                        </span>
                        <span className='text-sm font-semibold text-primary-600'>
                            Plan
                        </span>
                    </section>
                    <section className='w-12 h-0.5 bg-subtle' />
                    <section className='flex items-center gap-2'>
                        <span className='w-8 h-8 rounded-full bg-subtle text-faint flex items-center justify-center text-sm font-bold'>
                            3
                        </span>
                        <span className='text-sm text-faint'>
                            Pago
                        </span>
                    </section>
                </section>

                <h1 className='text-2xl font-bold text-center text-on-surface mb-2'>
                    Plan y Método de Pago
                </h1>
                <p className='text-on-body text-center mb-8'>
                    Paso 2: Elige tu plan y completa el pago
                </p>

                {/* Plan Card */}
                <section className='bg-surface border border-primary-200 rounded-lg p-6 mb-6 shadow-xs'>
                    <h2 className='text-lg font-bold text-primary-50 mb-1'>
                        {plan?.name || 'Plan Emprendedor'}
                    </h2>
                    <p className='text-sm text-muted mb-4'>
                        {plan?.description || 'Perfecto para empezar tu negocio'}
                    </p>

                    <section className='flex gap-3 mb-4'>
                        <button
                            onClick={() => setBillingFrequency('monthly')}
                            className={`flex-1 p-4 rounded-lg border-2 transition-all cursor-pointer text-left ${
                                billingFrequency === 'monthly'
                                    ? 'border-primary-500 bg-hover'
                                    : 'border-divider hover:border-outline'
                            }`}>
                            <Calendar className={`w-5 h-5 mb-2 ${billingFrequency === 'monthly' ? 'text-primary-500' : 'text-faint'}`} />
                            <p className={`text-sm font-medium ${billingFrequency === 'monthly' ? 'text-primary-500' : 'text-muted'}`}>
                                Mensual
                            </p>
                            <p className={`text-xl font-bold ${billingFrequency === 'monthly' ? 'text-primary-500' : 'text-on-surface'}`}>
                                ${formatPrice(monthlyPrice)}/mes
                            </p>
                        </button>

                        <button
                            onClick={() => setBillingFrequency('annual')}
                            className={`flex-1 p-4 rounded-lg border-2 transition-all cursor-pointer text-left relative ${
                                billingFrequency === 'annual'
                                    ? 'border-primary-500 bg-hover'
                                    : 'border-divider hover:border-outline'
                            }`}>
                            <span className='absolute -top-2.5 right-2 bg-accent-500 text-white text-xs font-bold px-2 py-0.5 rounded-full'>
                                -10%
                            </span>
                            <CalendarCheck className={`w-5 h-5 mb-2 ${billingFrequency === 'annual' ? 'text-primary-500' : 'text-faint'}`} />
                            <p className={`text-sm font-medium ${billingFrequency === 'annual' ? 'text-primary-500' : 'text-muted'}`}>
                                Anual
                            </p>
                            <p className={`text-xl font-bold ${billingFrequency === 'annual' ? 'text-primary-500' : 'text-muted'}`}>
                                ${formatPrice(annualPrice)}
                            </p>
                            <p className='text-xs text-muted mt-1'>
                                ${formatPrice(Math.round(annualPrice / 12))}/mes
                            </p>
                        </button>
                    </section>

                    {plan?.features && (
                        <section className='bg-subtle rounded-lg p-4'>
                            <p className='text-xs font-semibold text-muted uppercase mb-2'>
                                Incluye:
                            </p>
                            <ul className='space-y-1.5'>
                                {plan.features.map((feature, i) => (
                                    <li
                                        key={i}
                                        className='flex items-center gap-2 text-sm text-on-body'>
                                        <Check className='w-4 h-4 text-green-500 flex-shrink-0' />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </section>

                {/* Payment Method */}
                <section className='mb-6'>
                    <h3 className='font-semibold text-on-surface mb-3'>
                        Método de pago
                    </h3>
                    <section className='grid grid-cols-1 gap-3'>
                        <button
                            onClick={() => setPaymentMethod('card')}
                            className={`p-4 rounded-lg border-2 transition-all cursor-pointer text-center ${
                                paymentMethod === 'card'
                                    ? 'border-primary-500 bg-hover'
                                    : 'border-divider hover:border-outline'
                            }`}>
                            <CreditCard className={`w-6 h-6 mx-auto mb-2 ${paymentMethod === 'card' ? 'text-primary-500' : 'text-faint'}`} />
                            <p className={`text-sm font-medium ${paymentMethod === 'card' ? 'text-primary-500' : 'text-muted'}`}>
                                Tarjeta
                            </p>
                        </button>

                        {/* <button
                            onClick={() => setPaymentMethod('pse')}
                            className={`p-4 rounded-lg border-2 transition-all cursor-pointer text-center ${
                                paymentMethod === 'pse'
                                    ? 'border-primary-500 bg-hover'
                                    : 'border-divider hover:border-outline'
                            }`}>
                            <Landmark className={`w-6 h-6 mx-auto mb-2 ${paymentMethod === 'pse' ? 'text-primary-500' : 'text-faint'}`} />
                            <p className={`text-sm font-medium ${paymentMethod === 'pse' ? 'text-primary-500' : 'text-muted'}`}>
                                PSE
                            </p>
                        </button> */}
                    </section>
                </section>

                {/* Total */}
                <section className='bg-subtle border border-divider rounded-lg p-4 mb-6'>
                    <section className='flex justify-between items-center'>
                        <span className='text-sm text-muted font-bold'>
                            {billingFrequency === 'annual' ? 'Total anual' : 'Total mensual'}
                        </span>
                        <span className='text-2xl font-bold text-muted'>
                            ${formatPrice(currentPrice)}
                        </span>
                    </section>
                </section>

                <button
                    onClick={handlePayment}
                    disabled={loading || !paymentMethod}
                    className='w-full px-6 py-3 bg-primary-600 text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'>
                    {loading ? 'Procesando...' : 'Ir a Pagar'}
                </button>

                <p className='text-center text-on-body mt-4'>
                    <button
                        onClick={() => navigate('/signup', { replace: true })}
                        className='bg-transparent border-none text-primary-600 font-semibold cursor-pointer transition-all duration-300 hover:text-primary-600 hover:underline flex items-center justify-center gap-1 mx-auto'>
                        <ArrowLeft className='w-4 h-4' />
                        Volver a datos
                    </button>
                </p>
            </section>
        </section>
    )
}
