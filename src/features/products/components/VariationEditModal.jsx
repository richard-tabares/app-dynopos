import { useState, useEffect } from 'react'
import { Loader, Save, Layers, Settings2 } from 'lucide-react'
import { Modal } from '../../../shared/components/Modal'
import { updateVariation as updateVariationApi } from '../helpers/updateVariation'

export const VariationEditModal = ({
    variation,
    onClose,
    onSaved,
    onOpenStockAdjust,
}) => {
    const [formData, setFormData] = useState({
        variation_name: variation.variation_name || '',
        price: variation.price ?? '',
        unit_cost: variation.unit_cost ?? '',
        sku: variation.sku || '',
        barcode: variation.barcode || '',
        is_active: variation.is_active ?? true,
    })
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        setFormData(prev => ({ ...prev, unit_cost: variation.unit_cost ?? '' }))
    }, [variation.unit_cost])

    const isFormValid =
        formData.variation_name.trim() && Number(formData.price) > 0

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        if (type === 'number' && value !== '' && Number(value) < 0) return
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const updated = await updateVariationApi(variation.id, {
                ...formData,
                price: Number(formData.price),
                unit_cost: Number(formData.unit_cost) || 0,
            })
            onSaved(updated)
            onClose()
        } catch (error) {
            console.error('Error updating variation:', error)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Modal
            onClose={onClose}
            title='Editar Variación'
            icon={Layers}
            size='xl'>
            <div className='p-6'>
                <form
                    className='flex flex-col gap-4'
                    onSubmit={handleSubmit}>
                    <div className='grid grid-cols-2 gap-4'>
                        <section>
                            <label className='block text-sm font-medium text-on-body mb-1'>
                                SKU
                            </label>
                            <input
                                type='text'
                                name='sku'
                                value={formData.sku}
                                onChange={handleChange}
                                className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0'
                                placeholder='SKU (opcional)'
                            />
                        </section>
                        <section>
                            <label className='block text-sm font-medium text-on-body mb-1'>
                                Código de Barras
                            </label>
                            <input
                                type='text'
                                name='barcode'
                                value={formData.barcode}
                                onChange={handleChange}
                                className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0'
                                placeholder='Código de barras (opcional)'
                            />
                        </section>
                    </div>
                    <section>
                        <label className='block text-sm font-medium text-on-body mb-1'>
                            Nombre
                        </label>
                        <input
                            type='text'
                            name='variation_name'
                            value={formData.variation_name}
                            onChange={handleChange}
                            autoFocus
                            className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0'
                            placeholder='Ej: S, M, L, XL'
                        />
                    </section>
                    <div className='grid grid-cols-2 gap-4'>
                        <section>
                            <label className='block text-sm font-medium text-on-body mb-1'>
                                Costo Unitario
                            </label>
                            <input
                                type='number'
                                name='unit_cost'
                                value={formData.unit_cost}
                                onChange={handleChange}
                                min='0'
                                className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0'
                                placeholder='Costo de la variación (opcional)'
                            />
                        </section>
                        <section>
                            <label className='block text-sm font-medium text-on-body mb-1'>
                                Precio
                            </label>
                            <input
                                type='number'
                                name='price'
                                value={formData.price}
                                onChange={handleChange}
                                min='0'
                                className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0'
                                placeholder='Precio de la variación'
                            />
                        </section>
                    </div>
                    <section className='flex items-center justify-between'>
                        <span
                            className={`text-sm font-medium ${formData.is_active ? 'text-accent' : 'text-muted'}`}>
                            {formData.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                        <label className='relative inline-flex items-center cursor-pointer'>
                            <input
                                type='checkbox'
                                name='is_active'
                                checked={formData.is_active}
                                onChange={handleChange}
                                className='sr-only peer'
                            />
                            <div className="w-11 h-6 bg-hover-icon peer-focus:outline-none peer-focus:ring-0 peer-focus:ring-accent rounded-full peer-checked:after:translate-x-full peer-checked:after:border-surface after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-surface after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                        </label>
                    </section>
                    <section className='flex flex-col gap-3 pt-4 border-t border-divider'>
                        {onOpenStockAdjust && (
                            <section className='flex flex-row justify-between gap-3'>
                                <div className='w-1/2 px-4 py-3 border border-accent/85 text-accent rounded-md text-sm flex items-center justify-between'>
                                    <span>Stock actual</span>
                                    <span className='font-semibold'>
                                        {variation.stock ?? 0}
                                    </span>
                                </div>
                                <button
                                    type='button'
                                    onClick={onOpenStockAdjust}
                                    className='w-1/2 flex items-center justify-center gap-2 px-4 py-3 bg-accent/5 border border-accent/85 text-accent hover:bg-hover rounded-lg transition cursor-pointer font-medium'>
                                    <Settings2 className='w-4 h-4' />
                                    Ajustar Stock
                                </button>
                            </section>
                        )}
                        <div className='flex justify-end gap-4 border-t border-divider pt-4'>
                            <button
                                type='button'
                                className='px-4 py-2 border border-outline text-on-body hover:bg-hover font-medium rounded-lg transition cursor-pointer'
                                onClick={onClose}>
                                Cancelar
                            </button>
                            <button
                                type='submit'
                                disabled={!isFormValid || submitting}
                                className='px-4 py-2 bg-accent text-surface rounded-lg hover:bg-accent/85 font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'>
                                {submitting ? (
                                    <>
                                        <Loader className='w-5 h-5 animate-spin text-surface' />{' '}
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Save className='w-5 h-5' /> Guardar
                                    </>
                                )}
                            </button>
                        </div>
                    </section>
                </form>
            </div>
        </Modal>
    )
}
