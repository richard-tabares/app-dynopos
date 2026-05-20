import { X, AlertTriangle } from 'lucide-react'
import { useEscape } from '../../../shared/helpers/useEscape'

export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    useEscape(onClose)

    if (!isOpen) return null

    return (
        <section
            className='fixed inset-0 bg-overlay w-full h-full flex flex-col items-center justify-center z-50'>
            <section
                className='bg-surface rounded-xl border border-outline shadow-lg w-full max-w-sm relative max-h-[90vh] overflow-y-auto'
                onClick={(e) => e.stopPropagation()}>
                <section className='flex items-center justify-between px-6 py-4 border-b border-divider'>
                    <h2 className='text-lg font-semibold flex items-center gap-2'>
                        <AlertTriangle className='w-5 h-5 text-red-600' />
                        {title}
                    </h2>
                    <button onClick={onClose} className='p-1 rounded-md text-accent hover:text-accent/85 border border-disabled hover:border-accent transition cursor-pointer'>
                        <X className='w-6 h-6' />
                    </button>
                </section>

                <div className='p-6'>
                    <p className='text-on-body text-sm mb-6'>
                        {message}
                    </p>

                    <div className='flex gap-3 w-full'>
                        <button
                            type='button'
                            className='flex-1 px-4 py-2 border border-outline text-on-body hover:bg-hover font-semibold rounded-lg transition cursor-pointer'
                            onClick={onClose}>
                            Cancelar
                        </button>
                        <button
                            type='button'
                            className='flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition cursor-pointer'
                            onClick={() => {
                                onConfirm()
                                onClose()
                            }}>
                            Eliminar
                        </button>
                    </div>
                </div>
            </section>
        </section>
    )
}
