import { useState } from 'react'
import { X, CreditCard, Lock, ShieldCheck, Loader } from 'lucide-react'
import { toast } from 'react-toastify'
import { apiFetch } from '../../../../shared/helpers/apiFetch'
import { useEscape } from '../../../../shared/helpers/useEscape'

const WOMPI_API = import.meta.env.VITE_WOMPI_API_URL || 'https://api-sandbox.wompi.co/v1'
const WOMPI_PUB_KEY = import.meta.env.VITE_WOMPI_PUBLIC_KEY

export const UpdatePaymentMethodModal = ({ isOpen, onClose, businessId, customerEmail, onSuccess }) => {
    const [loading, setLoading] = useState(false)
    const [acceptedReglamento, setAcceptedReglamento] = useState(false)
    const [acceptedDatos, setAcceptedDatos] = useState(false)
    const [form, setForm] = useState({
        card_number: '',
        exp_month: '',
        exp_year: '',
        cvc: '',
        card_holder: '',
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        let formatted = value
        if (name === 'card_number') {
            formatted = value.replace(/\D/g, '').slice(0, 16)
            formatted = formatted.replace(/(.{4})/g, '$1 ').trim()
        }
        if (name === 'exp_month') formatted = value.replace(/\D/g, '').slice(0, 2)
        if (name === 'exp_year') formatted = value.replace(/\D/g, '').slice(0, 2)
        if (name === 'cvc') formatted = value.replace(/\D/g, '').slice(0, 4)
        setForm(prev => ({ ...prev, [name]: formatted }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!acceptedReglamento || !acceptedDatos) {
            toast.error('Debes aceptar los términos y condiciones')
            return
        }

        if (!form.card_number || !form.exp_month || !form.exp_year || !form.cvc || !form.card_holder) {
            toast.error('Completa todos los campos de la tarjeta')
            return
        }

        setLoading(true)
        try {
            const apiUrl = import.meta.env.VITE_API_URL

            const tokenRes = await fetch(`${WOMPI_API}/tokens/cards`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${WOMPI_PUB_KEY}`,
                },
                body: JSON.stringify({
                    number: form.card_number.replace(/\s/g, ''),
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
            if (!cardToken) throw new Error('No se pudo tokenizar la tarjeta')

            const acceptanceRes = await apiFetch(`${apiUrl}/api/billing/acceptance-tokens`)
            if (!acceptanceRes.ok) throw new Error('Error al obtener tokens de aceptación')
            const acceptanceData = await acceptanceRes.json()

            const response = await apiFetch(`${apiUrl}/api/billing/${businessId}/update-payment-source`, {
                method: 'POST',
                body: JSON.stringify({
                    card_token: cardToken,
                    acceptance_token: acceptanceData.acceptance_token,
                    customer_email: customerEmail,
                }),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Error al actualizar el método de pago')
            }

            const msg = result.renewed
                ? 'Método de pago actualizado y suscripción renovada'
                : 'Método de pago actualizado exitosamente'
            toast.success(msg)
            onSuccess(result)
            onClose()
        } catch (error) {
            toast.error(error.message || 'Error al actualizar el método de pago')
        } finally {
            setLoading(false)
        }
    }

    useEscape(onClose)

    if (!isOpen) return null

    return (
        <section className='fixed inset-0 z-50 flex items-center justify-center bg-overlay p-4'>
            <section className='bg-surface rounded-xl border border-outline shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto'>
                <section className='flex items-center justify-between px-6 py-4 border-b border-divider'>
                    <h2 className='text-lg font-semibold flex items-center gap-2'>
                        <CreditCard className='w-5 h-5 text-accent' />
                        Actualizar Método de Pago
                    </h2>
                    <button onClick={onClose} className='p-1 rounded-md text-accent hover:text-accent/85 border border-disabled hover:border-accent transition cursor-pointer'>
                        <X className='w-6 h-6' />
                    </button>
                </section>

                <form onSubmit={handleSubmit} className='p-6 space-y-4'>
                    <section className='flex flex-col gap-2'>
                        <label className='font-semibold text-on-surface text-sm'>Número de tarjeta <span className='text-red-500'>*</span></label>
                        <input
                            type='text'
                            name='card_number'
                            value={form.card_number}
                            onChange={handleChange}
                            placeholder='4444 4444 4444 4444'
                            maxLength={19}
                            className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:ring-0 focus:border-accent'
                        />
                    </section>

                    <section className='grid grid-cols-3 gap-3'>
                        <section className='flex flex-col gap-2'>
                            <label className='font-semibold text-on-surface text-sm'>Mes <span className='text-red-500'>*</span></label>
                            <input
                                type='text'
                                name='exp_month'
                                value={form.exp_month}
                                onChange={handleChange}
                                placeholder='MM'
                                maxLength={2}
                                className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:ring-0 focus:border-accent'
                            />
                        </section>
                        <section className='flex flex-col gap-2'>
                            <label className='font-semibold text-on-surface text-sm'>Año <span className='text-red-500'>*</span></label>
                            <input
                                type='text'
                                name='exp_year'
                                value={form.exp_year}
                                onChange={handleChange}
                                placeholder='AA'
                                maxLength={2}
                                className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:ring-0 focus:border-accent'
                            />
                        </section>
                        <section className='flex flex-col gap-2'>
                            <label className='font-semibold text-on-surface text-sm'>CVV <span className='text-red-500'>*</span></label>
                            <input
                                type='password'
                                name='cvc'
                                value={form.cvc}
                                onChange={handleChange}
                                placeholder='123'
                                maxLength={4}
                                className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:ring-0 focus:border-accent'
                            />
                        </section>
                    </section>

                    <section className='flex flex-col gap-2'>
                        <label className='font-semibold text-on-surface text-sm'>Nombre del titular <span className='text-red-500'>*</span></label>
                        <input
                            type='text'
                            name='card_holder'
                            value={form.card_holder}
                            onChange={handleChange}
                            placeholder='Como aparece en la tarjeta'
                            className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:ring-0 focus:border-accent'
                        />
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
                                <div className="w-11 h-6 bg-hover-icon peer-focus:outline-none peer-focus:ring-0 rounded-full peer-checked:after:translate-x-full peer-checked:after:border-surface after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-surface after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent" />
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
                                <div className="w-11 h-6 bg-hover-icon peer-focus:outline-none peer-focus:ring-0 rounded-full peer-checked:after:translate-x-full peer-checked:after:border-surface after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-surface after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent" />
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
                        className='w-full mt-2 px-6 py-3 bg-accent text-surface border-none rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 hover:bg-accent/85 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                    >
                        {loading ? (
                            <><Loader className='w-5 h-5 animate-spin' /> Actualizando...</>
                        ) : (
                            <><Lock className='w-5 h-5' /> Actualizar método de pago</>
                        )}
                    </button>

                    <p className='text-center text-xs text-faint flex items-center justify-center gap-1'>
                        <Lock className='w-3 h-3' /> Tus datos están seguros. El pago es procesado de forma segura por Wompi.
                    </p>
                </form>
            </section>
        </section>
    )
}
