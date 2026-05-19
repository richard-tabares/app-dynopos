import { X, AlertTriangle } from 'lucide-react'
import { useEscape } from '../../../shared/helpers/useEscape'

export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    useEscape(onClose)

    if (!isOpen) return null

    return (
        <section
            className='fixed inset-0 bg-overlay w-full h-full flex flex-col items-center justify-center z-[60]'
            onClick={onClose}>
            <section
                className='bg-surface rounded-xl shadow-xl p-6 w-full max-w-sm relative'
                onClick={(e) => e.stopPropagation()}>
                <button
                    className='absolute top-4 right-4 text-accent hover:text-accent/85 border border-disabled hover:border-accent rounded-md transition cursor-pointer'
                    onClick={onClose}>
                    <X className='w-5 h-5' />
                </button>

                <div className='flex flex-col items-center text-center'>
                    <div className='p-3 bg-red-100 rounded-full mb-4'>
                        <AlertTriangle className='w-8 h-8 text-red-600' />
                    </div>
                    
                    <h2 className='text-xl font-bold text-on-surface mb-2'>
                        {title}
                    </h2>
                    
                    <p className='text-on-body text-sm mb-8'>
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
