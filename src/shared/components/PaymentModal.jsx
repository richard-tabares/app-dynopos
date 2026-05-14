import { useState } from 'react'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { useEscape } from '../helpers/useEscape'

export const PaymentModal = ({ isOpen, status, message, onClose }) => {
    const [closing, setClosing] = useState(false)

    const handleClose = () => {
        setClosing(true)
        setTimeout(() => {
            setClosing(false)
            onClose()
        }, 200)
    }

    useEscape(() => {
        if (status !== 'processing') handleClose()
    })

    if (!isOpen) return null

    const icon = status === 'success'
        ? <CheckCircle className='w-16 h-16 text-green-500' />
        : status === 'error'
            ? <XCircle className='w-16 h-16 text-red-500' />
            : <Loader2 className='w-16 h-16 text-primary-600 animate-spin' />

    const title = status === 'success'
        ? '¡Pago exitoso!'
        : status === 'error'
            ? 'Pago rechazado'
            : 'Procesando pago'

    const text = status === 'processing'
        ? 'Estamos procesando tu transacción, esto puede tomar unos segundos...'
        : message

    return (
        <section className={`fixed inset-0 bg-overlay w-full h-full flex flex-col items-center justify-center z-50 transition-opacity duration-200 ${closing ? 'opacity-0' : 'opacity-100'}`}
            onClick={status !== 'processing' ? handleClose : undefined}>
            <section
                className='bg-surface rounded-lg shadow-lg p-8 w-full max-w-sm mx-4 text-center'
                onClick={(e) => e.stopPropagation()}>
                <section className='mb-4 flex justify-center'>
                    {icon}
                </section>
                <h2 className='text-xl font-bold text-on-surface mb-2'>{title}</h2>
                {text && <p className='text-sm text-on-body'>{text}</p>}
                {status !== 'processing' && (
                    <button
                        onClick={handleClose}
                        className='mt-6 px-6 py-2.5 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-500 transition cursor-pointer'>
                        {status === 'success' ? 'Continuar' : 'Cerrar'}
                    </button>
                )}
            </section>
        </section>
    )
}
