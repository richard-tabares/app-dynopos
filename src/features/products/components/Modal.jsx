import { X, Loader, Package, Save } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { useEscape } from '../../../shared/helpers/useEscape'
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
        name: editProductData.name || '',
        category_id:
            editProductData.categories?.id || generalCategory?.id || '',
        price: editProductData.price ?? '',
        unit_cost: editProductData.unit_cost ?? '',
        is_active: editProductData.is_active ?? true,
        track_stock: editProductData.track_stock ?? true,
    })

    const isFormValid = formData.sku.trim() && formData.name.trim() && Number(formData.price) > 0
    const [submitting, setSubmitting] = useState(false)

    useEscape(handleOpenModal)

    // const [formData, setFormData] = useState(editProductData)

    // Lógica para manejar los cambios en los campos del formulario
    // El handleChange se encarga de actualizar el estado del formulario cada vez que el usuario ingresa o modifica un valor en los campos del formulario. Utiliza la función setFormData para actualizar el estado, asegurándose de mantener los valores anteriores y solo cambiar el campo específico que se ha modificado.
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

        const skuDuplicate = products.some(
            (p) =>
                p.sku?.toLowerCase() === formData.sku.trim().toLowerCase() &&
                p.id !== editProductData.id,
        )

        if (skuDuplicate) {
            toast.error('Ya existe un producto con este SKU')
            setSubmitting(false)
            return
        }

        const businessId = JSON.parse(localStorage.getItem('dynopos-store'))
            .state.user.data.user.id
        await handleSubmit({
            ...formData,
            business_id: businessId,
            id: editProductData.id || undefined,
        })
        setSubmitting(false)
    }

    return (
        <section className='fixed inset-0 bg-overlay backdrop-blur-xs w-full h-full flex flex-col items-center justify-center z-50 p-4'>
            <section
                className='bg-surface rounded-xl border border-outline shadow-lg w-full max-w-md relative max-h-[90vh] overflow-y-auto'
                onClick={(e) => e.stopPropagation()}>
                <section className='flex items-center justify-between px-6 py-4 border-b border-divider'>
                    <h2 className='text-lg font-semibold flex items-center gap-2'>
                        <Package className='w-5 h-5 text-accent' />
                        {editProductData.id ? 'Editar Producto' : 'Nuevo Producto'}
                    </h2>
                    <button onClick={handleOpenModal} className='p-1 rounded-md text-accent hover:text-accent/85 border border-disabled hover:border-accent transition cursor-pointer'>
                        <X className='w-6 h-6' />
                    </button>
                </section>
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
                                    className='dark:text-gray-700'
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
                                ? <><Loader className='w-5 h-5 animate-spin' /> {editProductData.id ? 'Actualizando...' : 'Guardando...'}</>
                                : <><Save className='w-5 h-5' /> {editProductData.id ? 'Actualizar' : 'Guardar'}</>}
                        </button>
                    </section>
                </form>
                </div>
            </section>
        </section>
    )
}
