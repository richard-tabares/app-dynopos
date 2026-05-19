import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router'
import { Lock, Check, CreditCard, Calendar, ShieldCheck } from 'lucide-react'
import { getAcceptanceTokens } from '../helpers/getAcceptanceTokens'
import { processCardPayment } from '../helpers/processCardPayment'
import { toast } from 'react-toastify'
import { decryptData } from '../../../shared/helpers/crypto'
import { PaymentModal } from '../../../shared/components/PaymentModal'

const WOMPI_API = 'https://api-sandbox.wompi.co/v1'
const WOMPI_PUB_KEY = import.meta.env.VITE_WOMPI_PUBLIC_KEY

export const CardPayment = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const stateData = location.state
    const storedRaw = localStorage.getItem('dynopos_signup')
    const storedData = storedRaw ? JSON.parse(decryptData(storedRaw)) : null
    const pending_signup_id = stateData?.pending_signup_id || storedData?.pending_signup_id
    const signupData = storedData

    const [loading, setLoading] = useState(false)
    const [acceptedReglamento, setAcceptedReglamento] = useState(false)
    const [acceptedDatos, setAcceptedDatos] = useState(false)
    const [modalStatus, setModalStatus] = useState(null)
    const [modalMessage, setModalMessage] = useState('')
    const modalStatusRef = useRef(null)
    const paymentSummaryRef = useRef(null)

    useEffect(() => {
        modalStatusRef.current = modalStatus
    }, [modalStatus])

    const [form, setForm] = useState({
        full_name: storedData?.owner_name || '',
        email: stateData?.email || storedData?.email || '',
        phone: storedData?.phone || '',
        card_number: '4242424242424242',
        exp_month: '11',
        exp_year: '33',
        cvc: '123',
        card_holder: 'richard',
        legal_id_type: 'CC',
        legal_id: '1017155071',
    })

    useEffect(() => {
        if (!pending_signup_id || !signupData) {
            navigate('/signup', { replace: true })
        }
    }, [pending_signup_id, signupData, navigate])

    const handleChange = (e) => {
        const { name, value } = e.target
        let formatted = value

        if (name === 'card_number') {
            formatted = value.replace(/\D/g, '').slice(0, 16)
            formatted = formatted.replace(/(.{4})/g, '$1 ').trim()
        }
        if (name === 'exp_month') {
            formatted = value.replace(/\D/g, '').slice(0, 2)
        }
        if (name === 'exp_year') {
            formatted = value.replace(/\D/g, '').slice(0, 2)
        }
        if (name === 'cvc') {
            formatted = value.replace(/\D/g, '').slice(0, 4)
        }
        if (name === 'legal_id') {
            formatted = value.replace(/\D/g, '').slice(0, 15)
        }
        if (name === 'phone') {
            formatted = value.replace(/\D/g, '').slice(0, 15)
        }

        setForm(prev => ({ ...prev, [name]: formatted }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!acceptedReglamento || !acceptedDatos) {
            toast.error('Debes aceptar los términos y condiciones')
            return
        }

        if (!form.card_number || !form.exp_month || !form.exp_year || !form.cvc || !form.card_holder || !form.legal_id) {
            toast.error('Completa todos los campos de la tarjeta')
            return
        }

        setLoading(true)
        setModalStatus('processing')
        setModalMessage('Estamos procesando tu transacción, esto puede tomar unos segundos...')
        try {
            const tokenData = await getAcceptanceTokens(pending_signup_id)
            const { acceptance_token, personal_data_auth } = tokenData

            const cardNumber = form.card_number.replace(/\s/g, '')

            const tokenRes = await fetch(`${WOMPI_API}/tokens/cards`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${WOMPI_PUB_KEY}`,
                },
                body: JSON.stringify({
                    number: cardNumber,
                    cvc: form.cvc,
                    exp_month: form.exp_month,
                    exp_year: form.exp_year,
                    card_holder: form.card_holder,
                }),
            })

            if (!tokenRes.ok) {
                const err = await tokenRes.json().catch(() => ({}))
                throw new Error(err.error?.message || 'Error al validar la tarjeta')
            }

            const cardTokenRes = await tokenRes.json()
            const cardToken = cardTokenRes.data?.id
            const cardLast4 = cardTokenRes.data?.last_four || cardNumber.slice(-4)

            if (!cardToken) throw new Error('No se pudo tokenizar la tarjeta')

            const result = await processCardPayment({
                pending_signup_id,
                card_token: cardToken,
                card_last4: cardLast4,
                acceptance_token,
                personal_data_auth,
                customer_email: form.email,
                billing_frequency: stateData?.billing_frequency || 'monthly',
            })

            if (result.success) {
                const summary = {
                    transaction_id: result.transaction_id,
                    reference: result.reference,
                    amount: result.amount,
                    billing_frequency: result.billing_frequency,
                    card_last4: result.card_last4,
                    business_name: result.business_name,
                    email: result.email,
                    owner_name: result.owner_name,
                    plan_name: 'Plan Emprendedor',
                }
                paymentSummaryRef.current = summary
                sessionStorage.setItem('payment_summary', JSON.stringify(summary))
                setModalStatus('success')
                setModalMessage('Tu pago ha sido procesado exitosamente.')
                setLoading(false)
            } else {
                setModalStatus('error')
                setModalMessage(result.error || 'La transacción fue rechazada')
                setLoading(false)
            }
        } catch (error) {
            setModalStatus('error')
            setModalMessage(error.message || 'Error al procesar el pago')
            setLoading(false)
        }
    }

    const handleModalClose = () => {
        if (modalStatusRef.current === 'success') {
            localStorage.removeItem('dynopos_signup')
            const summary = paymentSummaryRef.current
            navigate('/signup/success', {
                state: summary,
                replace: true,
            })
        } else {
            setModalStatus(null)
        }
    }

    const formatPrice = (value) =>
        new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(value)
    const monthlyPrice = 39900
    const quarterlyPrice = monthlyPrice * 3
    const annualPrice = Math.round(monthlyPrice * 12 * 0.9)
    const currentPrice = stateData?.billing_frequency === 'annual' ? annualPrice : stateData?.billing_frequency === 'quarterly' ? quarterlyPrice : monthlyPrice

    if (!form.email) {
        return (
            <section className='w-full flex flex-col items-center justify-center bg-surface px-4 py-8'>
                <p className='text-on-body'>Cargando...</p>
            </section>
        )
    }

    return (
        <section className='w-full flex flex-col items-center justify-center bg-surface px-4 py-8'>
            <section className='w-2/4 max-lg:w-2/3 max-md:w-full p-6 md:p-10'>
                {/* Step indicator */}
                <section className='flex items-center justify-center gap-3 mb-8'>
                    <section className='flex items-center gap-2'>
                        <span className='w-8 h-8 rounded-full bg-green-500 text-surface flex items-center justify-center text-sm font-bold'><Check className='w-4 h-4' /></span>
                        <span className='text-sm font-semibold text-green-600'>Datos</span>
                    </section>
                    <section className='w-12 h-0.5 bg-green-500' />
                    <section className='flex items-center gap-2'>
                        <span className='w-8 h-8 rounded-full bg-green-500 text-surface flex items-center justify-center text-sm font-bold'><Check className='w-4 h-4' /></span>
                        <span className='text-sm font-semibold text-green-600'>Plan</span>
                    </section>
                    <section className='w-12 h-0.5 bg-accent' />
                    <section className='flex items-center gap-2'>
                        <span className='w-8 h-8 rounded-full bg-accent text-surface flex items-center justify-center text-sm font-bold'>3</span>
                        <span className='text-sm font-semibold text-accent'>Pago</span>
                    </section>
                </section>

                <h1 className='text-2xl font-bold text-center text-on-surface mb-2'>Pago con Tarjeta</h1>
                <p className='text-on-body text-center mb-6'>
                    Total a pagar: <strong>${formatPrice(currentPrice)}</strong> {stateData?.billing_frequency === 'annual' ? '/año' : stateData?.billing_frequency === 'quarterly' ? '/trimestre' : '/mes'}
                </p>

                <form onSubmit={handleSubmit} className='space-y-4'>
                    <section className='flex flex-col gap-2'>
                        <label className='font-semibold text-on-surface'>Nombre del comprador <span className='text-red-500'>*</span></label>
                        <input type='text' name='full_name' value={form.full_name} onChange={handleChange} placeholder='Nombre completo' className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:ring-0 focus:ring-accent focus:border-accent' />
                    </section>

                    <section className='grid grid-cols-2 gap-4'>
                        <section className='flex flex-col gap-2'>
                            <label className='font-semibold text-on-surface'>Correo <span className='text-red-500'>*</span></label>
                            <input type='email' name='email' value={form.email} onChange={handleChange} placeholder='correo@ejemplo.com' className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:ring-0 focus:ring-accent focus:border-accent' />
                        </section>
                        <section className='flex flex-col gap-2'>
                            <label className='font-semibold text-on-surface'>Teléfono <span className='text-red-500'>*</span></label>
                            <input type='tel' name='phone' value={form.phone} onChange={handleChange} placeholder='3001234567' className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:ring-0 focus:ring-accent focus:border-accent' />
                        </section>
                    </section>

                    <section className='border-t border-divider pt-4'>
                        <h3 className='font-semibold text-on-surface mb-3 flex items-center gap-2'><CreditCard className='w-5 h-5 text-accent' /> Datos de la tarjeta</h3>

                        <section className='flex flex-col gap-2 mb-3'>
                            <label className='font-semibold text-on-surface'>Número de tarjeta <span className='text-red-500'>*</span></label>
                            <input type='text' name='card_number' value={form.card_number} onChange={handleChange} placeholder='4444 4444 4444 4444' maxLength={19} className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:ring-0 focus:ring-accent focus:border-accent' />
                        </section>

                        <section className='grid grid-cols-3 gap-3 mb-3'>
                            <section className='flex flex-col gap-2'>
                                <label className='font-semibold text-on-surface'>Mes <span className='text-red-500'>*</span></label>
                                <input type='text' name='exp_month' value={form.exp_month} onChange={handleChange} placeholder='MM' maxLength={2} className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:ring-0 focus:ring-accent focus:border-accent' />
                            </section>
                            <section className='flex flex-col gap-2'>
                                <label className='font-semibold text-on-surface'>Año <span className='text-red-500'>*</span></label>
                                <input type='text' name='exp_year' value={form.exp_year} onChange={handleChange} placeholder='AA' maxLength={2} className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:ring-0 focus:ring-accent focus:border-accent' />
                            </section>
                            <section className='flex flex-col gap-2'>
                                <label className='font-semibold text-on-surface'>CVV <span className='text-red-500'>*</span></label>
                                <input type='password' name='cvc' value={form.cvc} onChange={handleChange} placeholder='123' maxLength={4} className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:ring-0 focus:ring-accent focus:border-accent' />
                            </section>
                        </section>

                        <section className='flex flex-col gap-2 mb-3'>
                            <label className='font-semibold text-on-surface'>Nombre del titular <span className='text-red-500'>*</span></label>
                            <input type='text' name='card_holder' value={form.card_holder} onChange={handleChange} placeholder='Como aparece en la tarjeta' className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:ring-0 focus:ring-accent focus:border-accent' />
                        </section>
                    </section>

                    <section className='border-t border-divider pt-4'>
                        <h3 className='font-semibold text-on-surface mb-3 flex items-center gap-2'><ShieldCheck className='w-5 h-5 text-accent' /> Documento de identidad</h3>
                        <section className='grid grid-cols-3 gap-3'>
                            <section className='flex flex-col gap-2'>
                                <label className='font-semibold text-on-surface'>Tipo <span className='text-red-500'>*</span></label>
                                <select name='legal_id_type' value={form.legal_id_type} onChange={handleChange} className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:ring-0 focus:ring-accent focus:border-accent'>
                                    <option value='CC'>CC</option>
                                    <option value='CE'>CE</option>
                                    <option value='NIT'>NIT</option>
                                    <option value='PP'>Pasaporte</option>
                                    <option value='TI'>TI</option>
                                </select>
                            </section>
                            <section className='flex flex-col gap-2 col-span-2'>
                                <label className='font-semibold text-on-surface'>Número <span className='text-red-500'>*</span></label>
                                <input type='text' name='legal_id' value={form.legal_id} onChange={handleChange} placeholder='Número de documento' className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:ring-0 focus:ring-accent focus:border-accent' />
                            </section>
                        </section>
                    </section>

                    <section className='border-t border-divider pt-4 space-y-3'>
                        <label className='flex items-start gap-3 cursor-pointer'>
                            <label className='relative inline-flex items-center cursor-pointer mt-1'>
                                <input
                                    type='checkbox'
                                    className='sr-only peer'
                                    checked={acceptedReglamento}
                                    onChange={(e) => setAcceptedReglamento(e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-hover-icon peer-focus:outline-none peer-focus:ring-0 peer-focus:ring-accent rounded-full peer-checked:after:translate-x-full peer-checked:after:border-surface after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-surface after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent" />
                            </label>
                            <span className='text-sm text-on-body'>
                                Acepto haber leído el{' '}
                                <a href='https://wompi.com/assets/downloadble/reglamento-Usuarios-Colombia.pdf' target='_blank' rel='noopener noreferrer' className='text-accent underline'>reglamento</a>
                            </span>
                        </label>
                        <label className='flex items-start gap-3 cursor-pointer'>
                            <label className='relative inline-flex items-center cursor-pointer mt-1'>
                                <input
                                    type='checkbox'
                                    className='sr-only peer'
                                    checked={acceptedDatos}
                                    onChange={(e) => setAcceptedDatos(e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-hover-icon peer-focus:outline-none peer-focus:ring-0 peer-focus:ring-accent rounded-full peer-checked:after:translate-x-full peer-checked:after:border-surface after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-surface after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent" />
                            </label>
                            <span className='text-sm text-on-body'>
                                Acepto la{' '}
                                <a href='https://wompi.com/assets/downloadble/autorizacion-tratamiento-datos-personales.pdf' target='_blank' rel='noopener noreferrer' className='text-accent underline'>autorización para la administración de datos personales</a>{' '}
                                y conozco la{' '}
                                <a href='https://wompi.com/es/co/politica-de-privacidad' target='_blank' rel='noopener noreferrer' className='text-accent underline'>política de privacidad</a>
                            </span>
                        </label>
                    </section>

                    <button
                        type='submit'
                        disabled={loading || !acceptedReglamento || !acceptedDatos}
                        className='w-full mt-4 px-6 py-3 bg-accent text-surface border-none rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 hover:bg-accent/85 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'>
                        <Lock className='w-5 h-5' />
                        {loading ? 'Procesando pago...' : `Pagar $${formatPrice(currentPrice)}`}
                    </button>

                    <p className='text-center text-xs text-faint flex items-center justify-center gap-1'>
                        <Lock className='w-3 h-3' /> Tus datos están seguros. El pago es procesado de forma segura por Wompi.
                    </p>
                </form>
            </section>
            <PaymentModal
                isOpen={modalStatus !== null}
                status={modalStatus}
                message={modalMessage}
                onClose={handleModalClose}
            />
        </section>
    )
}
