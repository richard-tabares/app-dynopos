import { Plus, Edit2, Trash2, Package, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { Modal } from '../components/Modal'
import { createNewProduct } from '../helpers/createNewProduct'
import { getProducts } from '../helpers/getProducts'
import { useStore } from '../../../app/providers/store'
import { deleteProduct } from '../helpers/deleteProduct'
import { editProduct } from '../helpers/editProduct'
import { getProductById } from '../helpers/getProductById'
import { getCategories } from '../helpers/getCategories'

export const Products = () => {
    const [openModal, setOpenModal] = useState(false)
    const [editProductData, setEditProductData] = useState({})
    const [categories, setCategories] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [visibleCount, setVisibleCount] = useState(20)
    const { user, products, setProducts } = useStore()

    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const displayedProducts = filteredProducts.slice(0, visibleCount)

    const productsHeaders = [
        'Código',
        'Nombre',
        'Categoría',
        'Precio',
        'Estado',
        'Acciones',
    ]
    const businessId = user.data.user.id

    useEffect(() => {
        const loadProductsAndCategories = async () => {
            if (!businessId) return
            try {
                const products = await getProducts(businessId)
                setProducts(products)
                const categories = await getCategories(businessId)
                setCategories(categories)
            // eslint-disable-next-line no-unused-vars
            } catch (_error) {
                setProducts([])
                setCategories([])
            }
        }
        loadProductsAndCategories()
    }, [businessId, setProducts])

    const handleOpenModal = (e) => {
        if (e && e.stopPropagation) e.stopPropagation()
        setEditProductData({})
        setOpenModal(!openModal)
    }
    const handleSubmit = async (formData) => {
        const businessId = JSON.parse(localStorage.getItem('dynopos-store'))
            .state.user.data.user.id

        if (formData.id) {
            // Actualizar producto existente
            try {
                const updatedProduct = await editProduct(
                    formData.id,
                    { ...formData, business_id: businessId },
                )
                setProducts(products.map((product) =>
                        product.id === updatedProduct.id ? updatedProduct : product,
                    ),
                )
                toast.success('Producto actualizado correctamente')
                setOpenModal(false)
            } catch (_error) {
                toast.error(_error.message || 'Error al actualizar el producto')
            }
        } else {
            // Crear nuevo producto
            try {
                const newProduct = await createNewProduct({ ...formData, business_id: businessId })
                setProducts([...products, newProduct])
                toast.success('Producto creado correctamente')
                setOpenModal(false)
            } catch (_error) {
                toast.error(_error.message || 'Error al crear el producto')
            }
        }
    }

    const onDeleteProduct = async (productId) => {
        // Lógica para eliminar el producto
        try {
            await deleteProduct(productId)
            setProducts(products.filter((product) => product.id !== productId))
            toast.success('Producto eliminado correctamente')
        } catch (_error) {
            toast.error(_error.message || 'Error al eliminar el producto')
        }
    }
    const onEditProduct = async (productId) => {
        // Lógica para editar el producto
        const product = await getProductById(productId)
        setEditProductData(product)
        if (product) {
            // setFormData(product)
            setOpenModal(true)
        }
    }

    const handleSearch = (e) => {
        setSearchTerm(e.target.value)
        setVisibleCount(20)
    }

    const handleLoadMore = () => {
        setVisibleCount((prev) => prev + 20)
    }

    return (
        <>
            {/* Modal */}
            {openModal && (
                <Modal
                    handleSubmit={handleSubmit}
                    handleOpenModal={handleOpenModal}
                    editProductData={editProductData}
                    categories={categories}
                />
            )}

            <section className='flex flex-col gap-6'>
                {/* Titulo de la sección productos */}
                <section>
                    <h1 className='text-2xl font-bold'>Gestión de Productos</h1>
                    <p className='text-gray-600'>
                        Aquí puedes gestionar tus productos, agregar nuevos,
                        editar los existentes y eliminar los que ya no
                        necesites.
                    </p>
                </section>
                <section className='bg-white border border-gray-300 shadow-sm overflow-hidden rounded-lg'>
                    {/* Titulo y boton de nuevo prodcuto de la tabla*/}
                    <section className='border-b border-gray-300 flex justify-between items-center px-6 py-4 bg-gray-50/50'>
                        <h2 className='text-lg font-semibold flex items-center gap-2'>
                            <Package className='w-5 h-5 text-primary-600' />
                            Lista de Productos
                            {
                                
                                    <span className='text-sm text-gray-500 font-medium'>
                                        Total productos ({filteredProducts.length})
                                    </span>
                                
                            }
                        </h2>
                        <button
                            className='flex items-center font-medium px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition cursor-pointer'
                            onClick={handleOpenModal}>
                            <Plus className='w-4 h-4 lg:w-5 lg:h-5 lg:mr-2' />
                            Nuevo Producto
                        </button>
                    </section>
                    {/* Contenido de la tabla de productos */}
                    <section className='px-6 py-4 border-b border-gray-200'>
                        <div className='relative'>
                            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                            <input
                                type='search'
                                value={searchTerm}
                                onChange={handleSearch}
                                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-0'
                                placeholder='Buscar por nombre o código...'
                            />
                        </div>
                    </section>
                    <section className='overflow-x-auto scrollbar-thin'>
                        <table className='w-full text-left'>
                            <thead>
                                <tr className='bg-gray-100 border-b border-gray-300'>
                                    {/* Encabezados de la tabla */}
                                    {productsHeaders.map((header, index) => (
                                        <th
                                            key={index}
                                            className='px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider'>
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-200'>
                                {/* Filas de la tabla */}
                                {displayedProducts.map((product, index) => (
                                    <tr key={index} className='hover:bg-gray-50 transition-colors text-sm'>
                                        <td className='px-6 py-4 font-medium text-gray-900'>
                                            {product.sku}
                                        </td>
                                        <td className='px-6 py-4 text-gray-700'>
                                            {product.name}
                                        </td>
                                        <td className='px-6 py-4 text-gray-500'>
                                            {product.categories?.name || 'Sin categoría'}
                                        </td>
                                        <td className='px-6 py-4 text-gray-700 font-bold'>
                                            ${new Intl.NumberFormat('es-CO').format(product.price)}
                                        </td>
                                        <td className='px-6 py-4'>
                                            {product.is_active ? (
                                                <span className='px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full'>
                                                    Activo
                                                </span>
                                            ) : (
                                                <span className='px-2.5 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full'>
                                                    Inactivo
                                                </span>
                                            )}
                                        </td>
                                        <td className='px-6 py-4'>
                                            <section className='flex items-center gap-2'>
                                                <button
                                                    onClick={() =>onEditProduct(product.id)}
                                                    className='hover:bg-gray-200 p-2 rounded-sm cursor-pointer'
                                                    title='Editar Producto'>
                                                    <Edit2 className='w-4 h-4 text-primary-600' />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        onDeleteProduct(
                                                            product.id,
                                                        )
                                                    }
                                                    className='hover:bg-red-700 bg-red-600 text-white p-2 rounded-sm cursor-pointer'
                                                    title='Eliminar Producto'>
                                                    <Trash2 className='w-4 h-4' />
                                                </button>
                                            </section>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                    {/* Botón Cargar Más */}
                    {visibleCount < filteredProducts.length && (
                        <section className='p-6 bg-gray-50 border-t border-gray-200 flex justify-center'>
                            <button
                                onClick={handleLoadMore}
                                className='px-6 py-2 bg-white text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition border border-gray-300 shadow-sm'>
                                Cargar más productos
                            </button>
                        </section>
                    )}
                    {filteredProducts.length === 0 && (
                        <div className='p-12 text-center'>
                            <Package className='w-12 h-12 text-gray-300 mx-auto mb-4' />
                            <p className='text-gray-500 font-medium'>No se encontraron productos</p>
                        </div>
                    )}
                </section>
            </section>
        </>
    )
}
