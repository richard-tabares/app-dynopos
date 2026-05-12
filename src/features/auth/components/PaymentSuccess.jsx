import { useNavigate, useLocation } from 'react-router'
import { CheckCircle, Printer, ArrowRight } from 'lucide-react'

export const PaymentSuccess = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const data = location.state || JSON.parse(sessionStorage.getItem('payment_summary') || 'null')

    if (!data) {
        return (
            <section className='w-full flex flex-col items-center justify-center bg-surface px-4 py-8'>
                <section className='text-center'>
                    <h1 className='text-2xl font-bold text-on-surface mb-4'>No se encontró información de pago</h1>
                    <button
                        onClick={() => navigate('/login', { replace: true })}
                        className='px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-500 transition cursor-pointer'>
                        Ir al login
                    </button>
                </section>
            </section>
        )
    }

    const formatPrice = (value) =>
        new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(value)

    const frequencyLabel = data?.billing_frequency === 'annual' ? 'Anual' : 'Mensual'
    const total = data?.amount || 39900

    const handlePrint = () => {
        window.print()
    }

    return (
        <section className='w-full flex flex-col items-center justify-center bg-surface px-4 py-8'>
            <section className='w-2/4 max-lg:w-2/3 max-md:w-full p-6 md:p-10'>
                <section className='print-area text-center'>
                    <CheckCircle className='w-16 h-16 text-green-500 mx-auto mb-4' />

                    <h1 className='text-2xl font-bold text-on-surface mb-2'>
                        ¡Pago exitoso!
                    </h1>
                    <p className='text-on-body mb-2'>
                        Hemos enviado un correo de confirmación a <strong>{data?.email || 'tu correo'}</strong>.
                        Revisa tu bandeja de entrada para confirmar tu dirección de correo electrónico y activar tu cuenta.
                    </p>

                    <section className='bg-green-50 border border-green-200 rounded-lg p-4 mb-6'>
                        <p className='text-sm text-green-800'>
                            Revisa tu bandeja de entrada y sigue las instrucciones para
                            confirmar tu correo electrónico y comenzar a usar DynoPOS.
                        </p>
                    </section>

                    <section className='print-receipt bg-surface border border-divider rounded-lg shadow-xs p-6 text-left mb-6'>
                        <h2 className='text-xl font-bold text-on-surface mb-4 text-center'>
                            Comprobante de Pago
                        </h2>

                        <section className='space-y-3'>
                            <section className='flex justify-between py-2 border-b border-divider-light'>
                                <span className='text-sm text-muted'>Referencia</span>
                                <span className='text-sm font-semibold text-on-surface'>{data?.reference || '-'}</span>
                            </section>
                            <section className='flex justify-between py-2 border-b border-divider-light'>
                                <span className='text-sm text-muted'>ID Transacción</span>
                                <span className='text-sm font-semibold text-on-surface'>{data?.transaction_id || '-'}</span>
                            </section>
                            <section className='flex justify-between py-2 border-b border-divider-light'>
                                <span className='text-sm text-muted'>Plan</span>
                                <span className='text-sm font-semibold text-on-surface'>{data?.plan_name || 'Plan Emprendedor'}</span>
                            </section>
                            <section className='flex justify-between py-2 border-b border-divider-light'>
                                <span className='text-sm text-muted'>Frecuencia</span>
                                <span className='text-sm font-semibold text-on-surface'>{frequencyLabel}</span>
                            </section>
                            <section className='flex justify-between py-2 border-b border-divider-light'>
                                <span className='text-sm text-muted'>Monto</span>
                                <span className='text-lg font-bold text-primary-700'>${formatPrice(total)}</span>
                            </section>
                            <section className='flex justify-between py-2 border-b border-divider-light'>
                                <span className='text-sm text-muted'>Método de pago</span>
                                <span className='text-sm font-semibold text-on-surface'>
                                    Tarjeta **** {data?.card_last4 || '****'}
                                </span>
                            </section>
                            <section className='flex justify-between py-2 border-b border-divider-light'>
                                <span className='text-sm text-muted'>Estado</span>
                                <span className='text-sm font-semibold text-green-600'>APROBADO</span>
                            </section>
                            <section className='flex justify-between py-2 border-b border-divider-light'>
                                <span className='text-sm text-muted'>Fecha</span>
                                <span className='text-sm font-semibold text-on-surface'>
                                    {new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </span>
                            </section>
                            <section className='flex justify-between py-2'>
                                <span className='text-sm text-muted'>Empresa</span>
                                <span className='text-sm font-semibold text-on-surface'>{data?.business_name || '-'}</span>
                            </section>
                            <section className='flex justify-between py-2'>
                                <span className='text-sm text-muted'>Email de facturación</span>
                                <span className='text-sm font-semibold text-on-surface'>{data?.email || '-'}</span>
                            </section>
                            <section className='flex justify-between py-2'>
                                <span className='text-sm text-muted'>Titular</span>
                                <span className='text-sm font-semibold text-on-surface'>{data?.owner_name || '-'}</span>
                            </section>
                        </section>
                    </section>

                    <section className='flex gap-3 no-print'>
                        <button
                            onClick={handlePrint}
                            className='flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-outline text-on-body rounded-lg font-semibold hover:bg-hover transition cursor-pointer'>
                            <Printer className='w-5 h-5' />
                            Imprimir / PDF
                        </button>
                        <button
                            onClick={() => navigate('/login', { replace: true })}
                            className='flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-500 transition cursor-pointer'>
                            Ir al login
                            <ArrowRight className='w-5 h-5' />
                        </button>
                    </section>
                </section>
            </section>
        </section>
    )
}
