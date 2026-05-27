import { Loader, Package, Save, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { sileo } from 'sileo'
import { Modal as SharedModal } from '../../../shared/components/Modal'

export const Modal = ({
    handleSubmit,
    handleOpenModal,
    editProductData = {},
    categories = {},
    products = [],
}) => {
    const generalCategory = Array.isArray(categories)
        ? categories.find((cat) => cat.name === 'General')
        : null

    const existingVariations = editProductData.product_variations || []

    const [formData, setFormData] = useState({
        sku: editProductData.sku || '',
        barcode: editProductData.barcode || '',
        name: editProductData.name || '',
        category_id:
            editProductData.categories?.id || generalCategory?.id || '',
        price: editProductData.price ?? '',
        unit_cost: editProductData.unit_cost ?? '',
        is_active: editProductData.is_active ?? true,
        track_stock: editProductData.track_stock ?? true,
        variation_type: editProductData.variation_type || '',
    })

    const [hasVariations, setHasVariations] = useState(existingVariations.length > 0)
    const [variations, setVariations] = useState(
            existingVariations.length > 0
                ? existingVariations.map(v => ({
                      id: v.id,
                      variation_name: v.variation_name,
                      price: v.price,
                      unit_cost: v.unit_cost || '',
                      sku: v.sku || '',
                      barcode: v.barcode || '',
                      is_active: v.is_active !== false,
                  }))
                : [{ variation_name: '', price: '', unit_cost: '', sku: '', barcode: '' }],
    )

    const isFormValid = hasVariations
        ? formData.name.trim() && variations.some(v => v.variation_name.trim() && Number(v.price) > 0)
        : formData.name.trim() && Number(formData.price) > 0
    const [submitting, setSubmitting] = useState(false)

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        if (type === 'number' && value !== '' && Number(value) < 0) return
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }))
    }

    const handleVariationChange = (index, field, value) => {
        setVariations((prev) =>
            prev.map((v, i) =>
                i === index ? { ...v, [field]: value } : v,
            ),
        )
    }

    const addVariation = () => {
        setVariations((prev) => [
            ...prev,
            { variation_name: '', price: '', unit_cost: '', sku: '', barcode: '' },
        ])
    }

    const removeVariation = (index) => {
        setVariations((prev) => prev.filter((_, i) => i !== index))
    }

    const handleFormSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)

        if (formData.sku.trim()) {
            const skuDuplicate = products.some(
                (p) =>
                    p.sku?.toLowerCase() === formData.sku.trim().toLowerCase() &&
                    p.id !== editProductData.id,
            )

            if (skuDuplicate) {
                sileo.error({ fill: 'var(--toast-error)', title: 'Error', description: 'Ya existe un producto con este SKU'})
                setSubmitting(false)
                return
            }
        }

        const businessId = JSON.parse(localStorage.getItem('dynopos-store'))
            .state.user.data.user.id
        const sanitizedData = {
            ...formData,
            category_id: formData.category_id || null,
            price: hasVariations ? 0 : (formData.price === '' ? null : formData.price),
            unit_cost: formData.unit_cost === '' ? null : formData.unit_cost,
            business_id: businessId,
            id: editProductData.id || undefined,
            variation_type: hasVariations ? formData.variation_type : null,
            variations: hasVariations
                ? variations
                      .filter(v => v.variation_name.trim())
                      .map(v => ({
                          ...v,
                          price: Number(v.price),
                          unit_cost: Number(v.unit_cost) || 0,
                      }))
                : [],
        }
        await handleSubmit(sanitizedData)
        setSubmitting(false)
    }

    return (
        <SharedModal
            onClose={handleOpenModal}
            title={editProductData.id ? 'Editar Producto' : 'Nuevo Producto'}
            icon={Package}
        >
            <div className='p-6'>
            <form
                className='flex flex-col gap-4'
                onSubmit={handleFormSubmit}>
                <section>
                    <label className='block text-sm font-medium text-on-body mb-1'>
                        SKU o Código del Producto
                    </label>
                    <input
                        type='text'
                        name='sku'
                        value={formData.sku}
                        onChange={handleChange}
                        autoFocus
                        className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0'
                        placeholder='Ingrese el SKU o código del producto'
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
                        placeholder='Ingrese o escanee el código de barras'
                    />
                </section>
                <section>
                    <label className='block text-sm font-medium text-on-body mb-1'>
                        Nombre del Producto
                    </label>
                    <input
                        type='text'
                        name='name'
                        value={formData.name}
                        onChange={handleChange}
                        className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0'
                        placeholder='Ingrese el nombre del producto'
                    />
                </section>

                <section>
                    <label className='block text-sm font-medium text-on-body mb-1'>
                        Categoría
                    </label>
                    <select
                        name='category_id'
                        id='category_id'
                        value={formData.category_id}
                        onChange={handleChange}
                        className='w-full px-4 py-3 bg-surface border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0 text-on-body'>
                        {categories.map((category) => (
                            <option
                                className='text-on-body'
                                key={category.id}
                                value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </section>
                {!hasVariations && (
                    <>
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
                            placeholder='Ingrese el precio del producto'
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
                            onChange={handleChange}
                            min='0'
                            className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0'
                            placeholder='Ingrese el costo del producto (opcional)'
                        />
                    </section>
                    </>
                )}
                <section className='flex items-center justify-between'>
                    <span className='text-sm font-medium text-on-body'>
                        Activo
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
                <section className='flex items-center justify-between'>
                    <span className='text-sm font-medium text-on-body'>
                        Controlar stock
                    </span>
                    <label className='relative inline-flex items-center cursor-pointer'>
                        <input
                            type='checkbox'
                            name='track_stock'
                            checked={formData.track_stock}
                            onChange={handleChange}
                            disabled={hasVariations}
                            className='sr-only peer'
                        />
                        <div className={`w-11 h-6 ${hasVariations ? 'opacity-50' : ''} bg-hover-icon peer-focus:outline-none peer-focus:ring-0 peer-focus:ring-accent rounded-full peer-checked:after:translate-x-full peer-checked:after:border-surface after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-surface after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent`}></div>
                    </label>
                </section>
                <section className='flex items-center justify-between pt-2 border-t border-divider'>
                    <span className='text-sm font-medium text-on-body'>
                        Tiene variaciones
                    </span>
                    <label className='relative inline-flex items-center cursor-pointer'>
                        <input
                            type='checkbox'
                            checked={hasVariations}
                            onChange={(e) => setHasVariations(e.target.checked)}
                            className='sr-only peer'
                        />
                        <div className="w-11 h-6 bg-hover-icon peer-focus:outline-none peer-focus:ring-0 peer-focus:ring-accent rounded-full peer-checked:after:translate-x-full peer-checked:after:border-surface after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-surface after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                    </label>
                </section>
                {hasVariations && (
                    <section className='border border-divider rounded-lg p-4 space-y-4'>
                        <section>
                            <label className='block text-sm font-medium text-on-body mb-1'>
                                Tipo de variación
                            </label>
                            <input
                                type='text'
                                name='variation_type'
                                value={formData.variation_type}
                                onChange={handleChange}
                                className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0'
                                placeholder='ej: Talla, Color, Tamaño'
                            />
                        </section>
                        <div className='space-y-3'>
                            <div className='flex items-center justify-between'>
                                <span className='text-sm font-medium text-on-body'>Variaciones</span>
                                <button
                                    type='button'
                                    onClick={addVariation}
                                    className='flex items-center gap-1 text-xs font-medium text-accent hover:text-accent/85 cursor-pointer'>
                                    <Plus className='w-3.5 h-3.5' /> Agregar
                                </button>
                            </div>
                            {variations.map((v, index) => (
                                <div key={index} className='border border-divider-light rounded-lg p-3 space-y-2'>
                                    <div className='flex items-center justify-between'>
                                        <span className='text-xs font-medium text-muted'>Variación #{index + 1}</span>
                                        <div className='flex items-center gap-2'>
                                            <label className='flex items-center gap-1.5 text-xs text-on-body cursor-pointer'>
                                                <input
                                                    type='checkbox'
                                                    checked={v.is_active !== false}
                                                    onChange={(e) => handleVariationChange(index, 'is_active', e.target.checked)}
                                                    className='sr-only peer'
                                                />
                                                <div className="w-8 h-4 bg-hover-icon peer-focus:outline-none peer-focus:ring-0 peer-focus:ring-accent rounded-full peer-checked:after:translate-x-full peer-checked:after:border-surface after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-surface after:border-outline after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-accent relative"></div>
                                                <span className={v.is_active !== false ? 'text-accent' : 'text-muted'}>{v.is_active !== false ? 'Activo' : 'Inactivo'}</span>
                                            </label>
                                            {variations.length > 1 && (
                                                <button
                                                    type='button'
                                                    onClick={() => removeVariation(index)}
                                                    className='text-red-500 hover:text-red-700 cursor-pointer'>
                                                    <Trash2 className='w-3.5 h-3.5' />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className='grid grid-cols-2 gap-2'>
                                        <input
                                            type='text'
                                            placeholder='Nombre (M, L, XL...)'
                                            value={v.variation_name}
                                            onChange={(e) => handleVariationChange(index, 'variation_name', e.target.value)}
                                            className='col-span-2 px-3 py-2 border border-divider rounded-md text-sm focus:outline-none focus:border-accent focus:ring-0'
                                        />
                                        <input
                                            type='number'
                                            placeholder='Precio'
                                            value={v.price}
                                            min='0'
                                            onChange={(e) => handleVariationChange(index, 'price', e.target.value)}
                                            className='px-3 py-2 border border-divider rounded-md text-sm focus:outline-none focus:border-accent focus:ring-0'
                                        />
                                        <input
                                            type='number'
                                            placeholder='Costo'
                                            value={v.unit_cost}
                                            min='0'
                                            onChange={(e) => handleVariationChange(index, 'unit_cost', e.target.value)}
                                            className='px-3 py-2 border border-divider rounded-md text-sm focus:outline-none focus:border-accent focus:ring-0'
                                        />
                                        <input
                                            type='text'
                                            placeholder='SKU (opcional)'
                                            value={v.sku}
                                            onChange={(e) => handleVariationChange(index, 'sku', e.target.value)}
                                            className='px-3 py-2 border border-divider rounded-md text-sm focus:outline-none focus:border-accent focus:ring-0'
                                        />
                                        <input
                                            type='text'
                                            placeholder='Código barras (opcional)'
                                            value={v.barcode}
                                            onChange={(e) => handleVariationChange(index, 'barcode', e.target.value)}
                                            className='px-3 py-2 border border-divider rounded-md text-sm focus:outline-none focus:border-accent focus:ring-0'
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
                <section className='flex justify-end gap-4 pt-4 border-t border-divider'>
                    <button
                        type='button'
                        className='px-4 py-2 border border-outline text-on-body hover:bg-hover font-medium rounded-lg transition cursor-pointer'
                        onClick={handleOpenModal}>
                        Cancelar
                    </button>
                    <button
                        type='submit'
                        disabled={!isFormValid || submitting}
                        className='px-4 py-2 bg-accent text-surface rounded-lg hover:bg-accent/85 font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'>
                        {submitting
                            ? <><Loader className='w-5 h-5 animate-spin text-surface' /> {editProductData.id ? 'Actualizando...' : 'Guardando...'}</>
                            : <><Save className='w-5 h-5' /> {editProductData.id ? 'Actualizar' : 'Guardar'}</>}
                    </button>
                </section>
            </form>
            </div>
        </SharedModal>
    )
}
