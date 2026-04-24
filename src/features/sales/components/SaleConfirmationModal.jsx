import { X, CheckCircle, CircleDollarSign } from 'lucide-react'
import { useStore } from '../../../app/providers/store'

export const SaleConfirmationModal = ({
    orderSummary = {},
    onConfirm,
    onCancel,
    loading = false,
}) => {
    const { total, paymentMethod, amountReceived, change } = orderSummary
    const { cart } = useStore()

    return (
        <section
            className='fixed inset-0 bg-gray-900/50 w-full h-full flex flex-col items-center justify-center z-50'
            onClick={onCancel}>
            <section
                className='bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative max-h-[90vh] flex flex-col'
                onClick={(e) => e.stopPropagation()}>
                <button
                    className='absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition mb-4'
                    onClick={onCancel}>
                    <X className='w-6 h-6' />
                </button>
                <h2 className='text-xl font-bold flex items-center gap-2 flex-shrink-0'>
                    <CircleDollarSign className='w-6 h-6 text-primary-600' />
                    Confirmar Venta
                </h2>
                <p className='text-sm text-gray-500 mt-1 mb-4 flex-shrink-0'>
                    Revisa los detalles de la venta antes de confirmar.
                </p>

                <div className='flex-1 overflow-y-auto scrollbar-thin mb-4 pr-2'>
                    <div className='mb-4'>
                        <h3 className='font-semibold text-gray-800 mb-2 border-b border-gray-100 pb-1'>
                            Productos
                        </h3>
                        <ul className='space-y-2'>
                            {cart.map((item) => (
                                <li key={item.id} className='flex justify-between items-center text-sm'>
                                    <div className='flex items-center gap-2 flex-1 truncate pr-2'>
                                        <span className='font-medium text-gray-600'>{item.quantity}x</span>
                                        <span className='truncate text-gray-800'>{item.name}</span>
                                    </div>
                                    <span className='font-semibold text-gray-900'>
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className='flex flex-col gap-3 text-gray-700 bg-gray-50 p-4 rounded-lg shrink'>
                    <div className='flex justify-between items-center pb-2 border-b border-gray-200'>
                        <span className='font-medium'>Método de Pago:</span>
                        <span className='font-semibold'>{paymentMethod}</span>
                    </div>
                    <div className='flex justify-between items-center pb-2 border-b border-gray-200'>
                        <span className='font-medium'>Total de la Orden:</span>
                        <span className='text-xl font-bold text-primary-600'>${total.toFixed(2)}</span>
                    </div>
                </div>

                <div className='flex justify-end gap-4 mt-6 shrink'>
                    <button
                        type='button'
                        className='px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition cursor-pointer'
                        onClick={onCancel}>
                        Cancelar
                    </button>
                    <button
                        type='button'
                        disabled={loading}
                        className='px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
                        onClick={onConfirm}>
                        {loading ? (
                            'Confirmando...'
                        ) : (
                            <>
                                <CheckCircle className='w-5 h-5' />
                                Confirmar Venta
                            </>
                        )}
                    </button>
                </div>
            </section>
        </section>
    )
}
