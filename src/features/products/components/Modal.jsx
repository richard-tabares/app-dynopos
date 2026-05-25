import { Loader, Package, Save } from 'lucide-react'
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
    })

    const isFormValid = formData.name.trim() && Number(formData.price) > 0
    const [submitting, setSubmitting] = useState(false)

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        if (type === 'number' && value !== '' && Number(value) < 0) return
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }))
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
            price: formData.price === '' ? null : formData.price,
            unit_cost: formData.unit_cost === '' ? null : formData.unit_cost,
            business_id: businessId,
            id: editProductData.id || undefined,
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
                        className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0 text-on-surface'>
                        {categories.map((category) => (
                            <option
                                className='text-select-input'
                                key={category.id}
                                value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
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
                            className='sr-only peer'
                        />
                        <div className="w-11 h-6 bg-hover-icon peer-focus:outline-none peer-focus:ring-0 peer-focus:ring-accent rounded-full peer-checked:after:translate-x-full peer-checked:after:border-surface after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-surface after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                    </label>
                </section>
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
