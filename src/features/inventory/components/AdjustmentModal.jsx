import { ArrowDownCircle, ArrowUpCircle, Loader, ArrowUpDown } from 'lucide-react'
import { useState } from 'react'
import { Modal } from '../../../shared/components/Modal'

export const AdjustmentModal = ({
    product = {},
    variation = null,
    handleClose,
    handleSubmit,
}) => {
    const [loading, setLoading] = useState(false)
    const [movementType, setMovementType] = useState('entry')
    const [formData, setFormData] = useState({
        quantity: '',
        unit_cost: variation?.unit_cost ?? '',
        min_stock: variation?.min_stock ?? '',
        notes: '',
    })

    const currentStock = variation?.stock || 0
    const isFormValid = formData.quantity !== '' && parseInt(formData.quantity) > 0

    const handleChange = (e) => {
        const { name, value } = e.target
        if (value !== '' && parseInt(value) < 0) return
        setFormData((prev) => ({
            ...prev,
            [name]: value === '' ? '' : parseInt(value) || 0,
        }))
    }

    const handleCostChange = (e) => {
        const { value } = e.target
        if (value !== '' && Number(value) < 0) return
        setFormData((prev) => ({
            ...prev,
            unit_cost: value === '' ? '' : Number(value),
        }))
    }

    const onFormSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await handleSubmit(product.id, {
                movement_type: movementType,
                quantity: parseInt(formData.quantity),
                unit_cost: formData.unit_cost === '' ? null : Number(formData.unit_cost),
                min_stock: formData.min_stock === '' ? undefined : parseInt(formData.min_stock),
                notes: formData.notes || null,
                business_id: product.business_id,
                variation_id: variation.id,
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal
            onClose={handleClose}
            title='Ajuste de Inventario'
            icon={ArrowUpDown}
        >
            <div className='p-6'>
                <p className='text-sm text-muted'>
                    Producto:{' '}
                    <span className='font-semibold text-on-body'>
                        {product.name}
                    </span>
                </p>
                {variation && (
                    <p className='text-sm text-muted'>
                        Variación:{' '}
                        <span className='font-semibold text-accent'>
                            {variation.variation_name}
                        </span>
                    </p>
                )}
                <p className='text-sm text-muted'>
                    Stock actual:{' '}
                    <span className='font-semibold text-on-body'>{currentStock}</span>
                </p>

                <form
                    className='flex flex-col gap-4'
                    onSubmit={onFormSubmit}>

                    <section>
                        <label className='block text-sm font-medium text-on-body mb-2'>
                            Tipo de Movimiento
                        </label>
                        <div className='grid grid-cols-2 gap-2'>
                            <button
                                type='button'
                                onClick={() => setMovementType('entry')}
                                className={`flex items-center justify-center gap-2 p-3 border rounded-lg transition-colors cursor-pointer ${
                                    movementType === 'entry'
                                        ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                                        : 'border-outline bg-surface text-on-body hover:bg-hover'
                                }`}>
                                <ArrowDownCircle className='w-5 h-5' />
                                <span className='font-medium'>Entrada</span>
                            </button>
                            <button
                                type='button'
                                onClick={() => setMovementType('exit')}
                                className={`flex items-center justify-center gap-2 p-3 border rounded-lg transition-colors cursor-pointer ${
                                    movementType === 'exit'
                                        ? 'border-red-300 bg-red-50 text-red-700'
                                        : 'border-outline bg-surface text-on-body hover:bg-hover'
                                }`}>
                                <ArrowUpCircle className='w-5 h-5' />
                                <span className='font-medium'>Salida</span>
                            </button>
                        </div>
                    </section>

                    <section>
                        <label className='block text-sm font-medium text-on-body mb-1'>
                            Cantidad
                        </label>
                        <input
                            type='number'
                            name='quantity'
                            value={formData.quantity}
                            onChange={handleChange}
                            min='1'
                            autoFocus
                            className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0'
                            placeholder='Ingrese la cantidad'
                        />
                    </section>

                    <section>
                        <label className='block text-sm font-medium text-on-body mb-1'>
                            Costo Unitario
                        </label>
                        <input
                            type='number'
                            name='unit_cost'
                            value={formData.unit_cost}
                            onChange={handleCostChange}
                            min='0'
                            className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0'
                            placeholder='Costo actual del producto (opcional)'
                        />
                    </section>

                    <section>
                        <label className='block text-sm font-medium text-on-body mb-1'>
                            Stock Mínimo (Alerta)
                        </label>
                        <input
                            type='number'
                            name='min_stock'
                            value={formData.min_stock}
                            onChange={handleChange}
                            min='0'
                            className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0'
                            placeholder='Stock mínimo para alertas'
                        />
                    </section>

                    <section>
                        <label className='block text-sm font-medium text-on-body mb-1'>
                            Motivo (opcional)
                        </label>
                        <input
                            type='text'
                            name='notes'
                            value={formData.notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0'
                            placeholder='Ej: Ajuste por conteo físico'
                        />
                    </section>

                    <section className='flex justify-end gap-4 pt-4 border-t border-divider'>
                        <button
                            type='button'
                            className='px-4 py-2 border border-outline text-on-body hover:bg-hover font-medium rounded-lg transition cursor-pointer'
                            onClick={handleClose}>
                            Cancelar
                        </button>
                        <button
                            type='submit'
                            disabled={loading || !isFormValid}
                            className='px-4 py-2 bg-accent text-surface rounded-lg hover:bg-accent/85 font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'>
                            {loading ? <><Loader className='w-5 h-5 animate-spin text-surface' /> Aplicando...</> : 'Aplicar Ajuste'}
                        </button>
                    </section>
                </form>
            </div>
        </Modal>
    )
}
