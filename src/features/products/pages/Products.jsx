import { Plus, Edit2, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
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
            } catch (error) {
                console.error('Error:', error)
                setProducts([])
                setCategories([])
            }
        }
        loadProductsAndCategories()
    }, [businessId, setProducts])

    const handleOpenModal = (e) => {
        e.stopPropagation()
        setEditProductData({})
        setOpenModal((prev) => !openModal)
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
                setOpenModal(false)
            } catch (error) {
                console.error('Error al actualizar producto:', error)
            }
        } else {
            // Crear nuevo producto
            try {
                const newProduct = await createNewProduct({ ...formData, business_id: businessId })
                setProducts([...products, newProduct])
                setOpenModal(false)
            } catch (error) {
                console.error('Error al crear producto:', error)
            }
        }
    }

    const onDeleteProduct = async (productId) => {
        // Lógica para eliminar el producto
        setProducts(products.filter((product) => product.id !== productId))
        const data = await deleteProduct(productId)
        console.log(data)
    }
    const onEditProduct = async (productId) => {
        // Lógica para editar el producto
        const product = await getProductById(productId)
        setEditProductData(product)
        console.log(product)
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

            <section>
                {/* Titulo de la sección productos */}
                <section className=''>
                    <h1 className='text-2xl font-bold'>Gestión de Productos</h1>
                    <p>
                        Aquí puedes gestionar tus productos, agregar nuevos,
                        editar los existentes y eliminar los que ya no
                        necesites.
                    </p>
                </section>
                <section className='bg-white mt-6 border border-gray-300'>
                    {/* Titulo y boton de nuevo prodcuto de la tabla*/}
                    <section className='border-b border-gray-300 flex justify-between items-center px-6 py-4'>
                        <section>
                            <h1 className='text-lg font-semibold'>
                                Lista de Productos
                            </h1>
                        </section>
                        <button
                            className='flex items-center font-medium px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition cursor-pointer'
                            onClick={handleOpenModal}>
                            <Plus className='w-4 h-4 lg:w-5 lg:h-5 lg:mr-2' />
                            Nuevo Producto
                        </button>
                    </section>
                    {/* Contenido de la tabla de productos */}
                    <section className='px-6 py-4'>
                        <input
                            type='search'
                            value={searchTerm}
                            onChange={handleSearch}
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-0'
                            placeholder='Buscar por nombre o código...'
                        />
                    </section>
                    <section className='px-6 py-4 text-gray-600 overflow-x-auto scrollbar-thin'>
                        <table className='w-full text-left border-collapse'>
                            <thead>
                                <tr className='bg-gray-100 border-gray-300 border-b text-xs'>
                                    {/* Encabezados de la tabla */}
                                    {productsHeaders.map((header, index) => (
                                        <th
                                            key={index}
                                            className='px-6 py-4 uppercase'>
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            {/* Filas de la tabla */}
                            {console.log(products, categories)}
                            {displayedProducts.map((product, index) => (
                                <tbody key={index}>
                                    <tr className='border-b border-gray-300 hover:bg-gray-50 transition text-sm'>
                                        <td className='px-6 py-4'>
                                            {product.sku}
                                        </td>
                                        <td className='px-6 py-4'>
                                            {product.name}
                                        </td>
                                        <td className='px-6 py-4'>
                                            {product.categories?.name}
                                        </td>
                                        <td className='px-6 py-4'>
                                            {product.price}
                                        </td>
                                        <td className='px-6 py-4'>
                                            {product.is_active ? (
                                                <span className='px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full'>
                                                    Activo
                                                </span>
                                            ) : (
                                                <span className='px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full'>
                                                    Inactivo
                                                </span>
                                            )}
                                        </td>
                                        <td className='px-6 py-4'>
                                            <section className='flex items-center gap-2'>
                                                <button
                                                    onClick={() =>onEditProduct(product.id)}
                                                    className='hover:bg-gray-200 p-2 rounded-sm cursor-pointer'>
                                                    <Edit2 className='w-4 h-4' />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        onDeleteProduct(
                                                            product.id,
                                                        )
                                                    }
                                                    className='hover:bg-red-700 bg-red-600 text-white p-2 rounded-sm cursor-pointer'>
                                                    <Trash2 className='w-4 h-4' />
                                                </button>
                                            </section>
                                        </td>
                                    </tr>
                                </tbody>
                            ))}
                        </table>
                    </section>
                    {/* Botón Cargar Más */}
                    {visibleCount < filteredProducts.length && (
                        <section className='flex justify-center pb-6'>
                            <button
                                onClick={handleLoadMore}
                                className='px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition cursor-pointer border border-gray-300'>
                                Cargar más productos
                            </button>
                        </section>
                    )}
                </section>
            </section>
        </>
    )
}
