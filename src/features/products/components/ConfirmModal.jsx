import { AlertTriangle, Trash2 } from 'lucide-react'
import { Modal } from '../../../shared/components/Modal'

export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            icon={AlertTriangle}
            iconColor='text-red-600'
            size='sm'
        >
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
                        className='flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition cursor-pointer flex items-center justify-center gap-2'
                        onClick={() => {
                            onConfirm()
                            onClose()
                        }}>
                        <Trash2 className='w-5 h-5' /> Eliminar
                    </button>
                </div>
            </div>
        </Modal>
    )
}
