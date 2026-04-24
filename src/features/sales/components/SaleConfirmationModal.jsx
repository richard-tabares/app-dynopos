import { X, CheckCircle, CircleDollarSign } from 'lucide-react'

export const SaleConfirmationModal = ({
    orderSummary = {},
    onConfirm,
    onCancel,
    loading = false,
}) => {
    const { total, paymentMethod, amountReceived, change } = orderSummary

    return (
        <section
            className='fixed inset-0 bg-gray-900/50 w-full h-full flex flex-col items-center justify-center z-50'
            onClick={onCancel}>
            <section
                className='bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative'
                onClick={(e) => e.stopPropagation()}>
                <button
                    className='absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition mb-4'
                    onClick={onCancel}>
                    <X className='w-6 h-6' />
                </button>
                <h2 className='text-xl font-bold flex items-center gap-2'>
                    <CircleDollarSign className='w-6 h-6 text-primary-600' />
                    Confirmar Venta
                </h2>
                <p className='text-sm text-gray-500 mt-1 mb-6'>
                    Revisa los detalles de la venta antes de confirmar.
                </p>

                <div className='flex flex-col gap-3 text-gray-700'>
                    <div className='flex justify-between items-center pb-2 border-b border-gray-100'>
                        <span className='font-medium'>Total de la Orden:</span>
                        <span className='text-xl font-bold text-primary-600'>${total.toFixed(2)}</span>
                    </div>
                    <div className='flex justify-between items-center pb-2 border-b border-gray-100'>
                        <span className='font-medium'>Método de Pago:</span>
                        <span className='font-semibold'>{paymentMethod}</span>
                    </div>
                    {paymentMethod === 'Efectivo' && (
                        <div className='flex justify-between items-center pb-2 border-b border-gray-100'>
                            <span className='font-medium'>Monto Recibido:</span>
                            <span className='font-semibold'>${parseFloat(amountReceived).toFixed(2)}</span>
                        </div>
                    )}
                    {paymentMethod === 'Efectivo' && amountReceived > 0 && amountReceived >= total && (
                        <div className='flex justify-between items-center bg-green-50 text-green-800 p-3 rounded-lg font-bold text-lg'>
                            <span>Cambio:</span>
                            <span>${change.toFixed(2)}</span>
                        </div>
                    )}
                </div>

                <div className='flex justify-end gap-4 mt-8'>
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
