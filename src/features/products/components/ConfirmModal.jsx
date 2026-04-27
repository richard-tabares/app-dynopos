import { X, AlertTriangle } from 'lucide-react'
import { useEscape } from '../../../shared/helpers/useEscape'

export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    useEscape(onClose)

    if (!isOpen) return null

    return (
        <section
            className='fixed inset-0 bg-gray-900/50 w-full h-full flex flex-col items-center justify-center z-[60]'
            onClick={onClose}>
            <section
                className='bg-white rounded-xl shadow-xl p-6 w-full max-w-sm relative'
                onClick={(e) => e.stopPropagation()}>
                <button
                    className='absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition'
                    onClick={onClose}>
                    <X className='w-5 h-5' />
                </button>

                <div className='flex flex-col items-center text-center'>
                    <div className='p-3 bg-red-100 rounded-full mb-4'>
                        <AlertTriangle className='w-8 h-8 text-red-600' />
                    </div>
                    
                    <h2 className='text-xl font-bold text-gray-900 mb-2'>
                        {title}
                    </h2>
                    
                    <p className='text-gray-600 text-sm mb-8'>
                        {message}
                    </p>

                    <div className='flex gap-3 w-full'>
                        <button
                            type='button'
                            className='flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition cursor-pointer'
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
