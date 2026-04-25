import { Plus, Edit2, Trash2, Package, Search, Tags, ClipboardList, ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { Modal } from '../components/Modal'
import { ConfirmModal } from '../components/ConfirmModal'
import { createNewProduct } from '../helpers/createNewProduct'
import { getProducts } from '../helpers/getProducts'
import { useStore } from '../../../app/providers/store'
import { useNavigate } from 'react-router'
import { deleteProduct } from '../helpers/deleteProduct'
import { editProduct } from '../helpers/editProduct'
import { getProductById } from '../helpers/getProductById'
import { getCategories } from '../../categories/helpers/getCategories'
import { createCategory } from '../../categories/helpers/createCategory'

export const Products = () => {
    const [openModal, setOpenModal] = useState(false)
    const [openConfirmModal, setOpenConfirmModal] = useState(false)
    const [productToDelete, setProductToDelete] = useState(null)
    const [editProductData, setEditProductData] = useState({})
    const [searchTerm, setSearchTerm] = useState('')
    const [activeCategory, setActiveCategory] = useState('all')
    const [visibleCount, setVisibleCount] = useState(20)
    const { user, products, setProducts, categories, setCategories } = useStore()
    const navigate = useNavigate()
    const [showCategoryModal, setShowCategoryModal] = useState(false)
    const [categoryName, setCategoryName] = useState('')
    const [savingCategory, setSavingCategory] = useState(false)
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)

    const filteredProducts = products
        .filter((product) => {
            const matchesSearch =
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.sku.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesCategory =
                activeCategory === 'all' ||
                product.categories?.id === activeCategory

            return matchesSearch && matchesCategory
        })
        .sort((a, b) => b.id - a.id)

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
            } catch (error) {
                toast.error(error.message || 'Error al actualizar el producto')
            }
        } else {
            // Crear nuevo producto
            try {
                const newProduct = await createNewProduct({ ...formData, business_id: businessId })
                setProducts([...products, newProduct])
                toast.success('Producto creado correctamente')
                setOpenModal(false)
            } catch (error) {
                toast.error(error.message || 'Error al crear el producto')
            }
        }
    }

    const onDeleteProduct = async (productId) => {
        setProductToDelete(productId)
        setOpenConfirmModal(true)
    }

    const confirmDelete = async () => {
        if (!productToDelete) return

        try {
            const response = await deleteProduct(productToDelete)
            
            // Si el producto se marcó como inactivo en lugar de eliminarse
            if (response.softDeleted) {
                setProducts(products.map((product) => 
                    product.id === productToDelete ? { ...product, is_active: false } : product
                ))
                toast.info('El producto tiene ventas asociadas y se ha marcado como inactivo.')
            } else {
                setProducts(products.filter((product) => product.id !== productToDelete))
                toast.success('Producto eliminado correctamente')
            }
        } catch (error) {
            if (error.message?.includes('404') || error.message?.includes('not found')) {
                setProducts(products.filter((product) => product.id !== productToDelete))
            }
            toast.error(error.message || 'Error al eliminar el producto')
        } finally {
            setProductToDelete(null)
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

    const handleCreateCategory = async () => {
        if (!categoryName.trim()) {
            toast.warn('El nombre de la categoría es obligatorio')
            return
        }
        setSavingCategory(true)
        try {
            const newCategory = await createCategory({ business_id: businessId, name: categoryName.trim() })
            setCategories([...categories, newCategory])
            toast.success('Categoría creada exitosamente')
            setShowCategoryModal(false)
            setCategoryName('')
        } catch (error) {
            toast.error(error.message || 'Error al crear la categoría')
        } finally {
            setSavingCategory(false)
        }
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

            <ConfirmModal
                isOpen={openConfirmModal}
                onClose={() => setOpenConfirmModal(false)}
                onConfirm={confirmDelete}
                title="¿Eliminar producto?"
                message="Esta acción no se puede deshacer. El producto se eliminará permanentemente de tu inventario."
            />

            {/* Modal crear categoría */}
            {showCategoryModal && (
                <section
                    className='fixed inset-0 bg-gray-900/50 w-full h-full flex items-center justify-center z-[70]'
                    onClick={() => { setShowCategoryModal(false); setCategoryName('') }}
                >
                    <section
                        className='bg-white rounded-lg shadow-2xl w-full max-w-md relative overflow-hidden'
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className='p-6 border-b border-gray-100'>
                            <h3 className='text-lg font-bold text-gray-900'>Nueva Categoría</h3>
                        </div>
                        <div className='p-6'>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>Nombre</label>
                            <input
                                type='text'
                                value={categoryName}
                                onChange={(e) => setCategoryName(e.target.value)}
                                placeholder='Nombre de la categoría'
                                className='w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400'
                                autoFocus
                            />
                        </div>
                        <div className='px-6 pb-6 flex gap-3'>
                            <button
                                onClick={() => { setShowCategoryModal(false); setCategoryName('') }}
                                className='flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition text-sm cursor-pointer'>
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreateCategory}
                                disabled={savingCategory || !categoryName.trim()}
                                className='flex-1 py-2.5 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 transition text-sm disabled:opacity-50 cursor-pointer'>
                                {savingCategory ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
                    </section>
                </section>
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
                                        Total ({filteredProducts.length})
                                    </span>
                                
                            }
                        </h2>
                        <section className='flex items-center gap-2'>
                            <section className='relative'>
                                <button
                                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                    className='flex items-center font-medium px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-100 transition cursor-pointer'>
                                    <Tags className='w-4 h-4 lg:w-5 lg:h-5 lg:mr-2' />
                                    Categorías
                                    <ChevronDown className='w-4 h-4 ml-1' />
                                </button>
                                {showCategoryDropdown && (
                                    <section
                                        className='fixed inset-0 z-40'
                                        onClick={() => setShowCategoryDropdown(false)}
                                    />
                                )}
                                <section className={`absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 ${showCategoryDropdown ? 'block' : 'hidden'}`}>
                                    <button
                                        onClick={() => { setShowCategoryModal(true); setShowCategoryDropdown(false) }}
                                        className='flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg cursor-pointer'>
                                        <Plus className='w-4 h-4' />
                                        Crear categoría
                                    </button>
                                    <button
                                        onClick={() => { navigate('/categories'); setShowCategoryDropdown(false) }}
                                        className='flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-b-lg cursor-pointer'>
                                        <Tags className='w-4 h-4' />
                                        Gestionar categorías
                                    </button>
                                </section>
                            </section>
                            <button
                                onClick={() => navigate('/inventory')}
                                className='flex items-center font-medium px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-100 transition cursor-pointer'>
                                <ClipboardList className='w-4 h-4 lg:w-5 lg:h-5 lg:mr-2' />
                                Inventario
                            </button>
                            <button
                                className='flex items-center font-medium px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition cursor-pointer'
                                onClick={handleOpenModal}>
                                <Package className='w-4 h-4 lg:w-5 lg:h-5 lg:mr-2' />
                                Nuevo Producto
                            </button>
                        </section>
                    </section>
                    {/* Contenido de la tabla de productos */}
                    <section className='px-6 py-4 border-b border-gray-200 flex flex-col gap-4'>
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
                        <div className='flex gap-2 overflow-x-auto pb-1 scrollbar-none'>
                            <button
                                onClick={() => setActiveCategory('all')}
                                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer border whitespace-nowrap ${
                                    activeCategory === 'all'
                                        ? 'bg-primary-600 text-white border-primary-600'
                                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                }`}>
                                Todas
                            </button>
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => setActiveCategory(category.id)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer border whitespace-nowrap ${
                                        activeCategory === category.id
                                            ? 'bg-primary-600 text-white border-primary-600'
                                            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                    }`}>
                                    {category.name}
                                </button>
                            ))}
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
