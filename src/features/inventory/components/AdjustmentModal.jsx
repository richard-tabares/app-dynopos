import { X } from 'lucide-react'
import { useState } from 'react'

export const AdjustmentModal = ({
    product = {},
    handleClose,
    handleSubmit
}) => {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        stock: product.inventory?.[0]?.stock || 0,
        min_stock: product.inventory?.[0]?.min_stock || 0,
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: parseInt(value) || 0,
        }))
    }

    const onFormSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await handleSubmit(product.id, { ...formData, business_id: product.business_id })
        } finally {
            setLoading(false)
        }
    }

    return (
        <section
            className='fixed inset-0 bg-gray-900/50 w-full h-full flex flex-col items-center justify-center z-50'
            onClick={handleClose}>
            <section
                className='bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative'
                onClick={(e) => e.stopPropagation()}>
                <button
                    className='absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition mb-4'
                    onClick={handleClose}>
                    <X className='w-6 h-6' />
                </button>
                <h2 className='text-xl font-bold'>Ajuste de Inventario</h2>
                <p className='text-sm text-gray-500 mt-1'>
                    Producto: <span className='font-semibold text-gray-700'>{product.name}</span>
                </p>
                
                <form
                    className='flex flex-col gap-4 mt-6'
                    onSubmit={onFormSubmit}>
                    <section>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Stock Actual
                        </label>
                        <input
                            type='number'
                            name='stock'
                            value={formData.stock}
                            onChange={handleChange}
                            autoFocus
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-0'
                            placeholder='0'
                        />
                    </section>
                    
                    <section>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Stock Mínimo (Alerta)
                        </label>
                        <input
                            type='number'
                            name='min_stock'
                            value={formData.min_stock}
                            onChange={handleChange}
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-0'
                            placeholder='0'
                        />
                    </section>

                    <section className='flex justify-end gap-4 mt-4'>
                        <button
                            type='button'
                            className='px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition cursor-pointer'
                            onClick={handleClose}>
                            Cancelar
                        </button>
                        <button
                            type='submit'
                            disabled={loading}
                            className='px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'>
                            {loading ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </section>
                </form>
            </section>
        </section>
    )
}
