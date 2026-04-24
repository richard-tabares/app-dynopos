import { X } from 'lucide-react'
import { useState } from 'react'
export const Modal = ({
    handleSubmit,
    handleOpenModal,
    editProductData = {},
    categories = {},
}) => {
    console.log(editProductData)

    const [formData, setFormData] = useState({
        sku: editProductData.sku || '',
        name: editProductData.name || '',
        category_id: editProductData.categories?.id || '',
        price: editProductData.price || 0,
        is_active: editProductData.is_active || false,
    })
    // const [formData, setFormData] = useState(editProductData)

    // Lógica para manejar los cambios en los campos del formulario
    // El handleChange se encarga de actualizar el estado del formulario cada vez que el usuario ingresa o modifica un valor en los campos del formulario. Utiliza la función setFormData para actualizar el estado, asegurándose de mantener los valores anteriores y solo cambiar el campo específico que se ha modificado.
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }))
    }

    const handleFormSubmit = (e) => {
        e.preventDefault()
        const businessId = JSON.parse(localStorage.getItem('dynopos-store'))
            .state.user.data.user.id
        handleSubmit({ ...formData, business_id: businessId, id: editProductData.id || undefined })
    }

    return (
        <section
            className='fixed inset-0 bg-gray-900/50 w-full h-full flex flex-col items-center justify-center z-50'
            onClick={handleOpenModal}>
            <section
                className='bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative'
                onClick={(e) => e.stopPropagation()}>
                <button
                    className='absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition mb-4'
                    onClick={handleOpenModal}>
                    <X className='w-6 h-6' />
                </button>
                <h2 className='text-xl font-bold'>
                    {editProductData.id ? 'Editar Producto' : 'Nuevo Producto'}
                </h2>
                <form
                    className='flex flex-col gap-4 mt-6'
                    onSubmit={handleFormSubmit}>
                    <section>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                            SKU o Código del Producto
                        </label>
                        <input
                            type='text'
                            name='sku'
                            value={formData.sku}
                            onChange={handleChange}
                            autoFocus
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-0'
                            placeholder='Ingrese el SKU o código del producto'
                        />
                    </section>
                    <section>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Nombre del Producto
                        </label>
                        <input
                            type='text'
                            name='name'
                            value={formData.name}
                            onChange={handleChange}
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-0'
                            placeholder='Ingrese el nombre del producto'
                        />
                    </section>

                    <section>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Categoría
                        </label>
                        <select
                            name='category_id'
                            id='category_id'
                            value={formData.category_id}
                            onChange={handleChange}
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-0'>
                            <option
                                value=''
                                disabled>
                                Seleccione una categoría
                            </option>
                            {categories.map((category) => (
                                <option
                                    key={category.id}
                                    value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </section>
                    <section>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Precio
                        </label>
                        <input
                            type='number'
                            name='price'
                            value={formData.price}
                            onChange={handleChange}
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-0'
                            placeholder='Ingrese el precio del producto'
                        />
                    </section>
                    <section className='flex items-center gap-2'>
                        <span className='text-sm font-medium text-gray-700'>
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
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                    </section>
                    <section className='flex justify-end gap-4'>
                        <button
                            type='button'
                            className='px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition cursor-pointer'
                            onClick={handleOpenModal}>
                            Cancelar
                        </button>
                        <button
                            type='submit'
                            className='px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition cursor-pointer'>
                            {editProductData.id ? 'Actualizar' : 'Guardar'}
                        </button>
                    </section>
                </form>
            </section>
        </section>
    )
}
