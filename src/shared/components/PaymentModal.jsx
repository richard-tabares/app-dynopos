import { useState } from 'react'
import { Loader2, CheckCircle, XCircle, ArrowRight, X, CircleDollarSign } from 'lucide-react'
import { Modal } from './Modal'

export const PaymentModal = ({ isOpen, status, message, onClose }) => {
    const [closing, setClosing] = useState(false)

    const handleClose = () => {
        setClosing(true)
        setTimeout(() => {
            setClosing(false)
            onClose()
        }, 200)
    }

    if (!isOpen) return null

    const icon = status === 'success'
        ? <CheckCircle className='w-16 h-16 text-green-500' />
        : status === 'error'
            ? <XCircle className='w-16 h-16 text-red-500' />
            : <Loader2 className='w-16 h-16 text-accent animate-spin' />

    const title = status === 'success'
        ? '¡Pago exitoso!'
        : status === 'error'
            ? 'Pago rechazado'
            : 'Procesando pago'

    const text = status === 'processing'
        ? 'Estamos procesando tu transacción, esto puede tomar unos segundos...'
        : message

    return (
        <Modal
            isOpen={isOpen}
            onClose={status !== 'processing' ? handleClose : null}
            title='Pago'
            icon={CircleDollarSign}
            size='sm'
        >
            <section className={`p-8 w-full text-center transition-opacity duration-300 ${closing ? 'opacity-0' : 'opacity-100'}`}
                onClick={(e) => e.stopPropagation()}>
                <section className='mb-4 flex justify-center'>
                    {icon}
                </section>
                <h2 className='text-xl font-bold text-on-surface mb-2'>{title}</h2>
                {text && <p className='text-sm text-on-body'>{text}</p>}
                {status !== 'processing' && (
                    <button
                        onClick={handleClose}
                        className='mt-6 px-6 py-2.5 mx-auto bg-accent text-surface rounded-lg font-semibold hover:bg-accent/85 transition cursor-pointer flex items-center justify-center gap-2'>
                        {status === 'success' ? <><ArrowRight className='w-5 h-5' /> Continuar</> : <><X className='w-5 h-5' /> Cerrar</>}
                    </button>
                )}
            </section>
        </Modal>
    )
}
