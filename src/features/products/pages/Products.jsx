import {
    Plus,
    Edit2,
    Trash2,
    Package,
    Search,
    Tags,
    Layers,
    ClipboardList,
    ChevronDown,
    EllipsisVertical,
    CheckCircle2,
    CheckCircle,
    XCircle,
    PackageCheck,
    PackageX,
    Save,
    Loader,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { sileo } from 'sileo'
import { Modal } from '../components/Modal'
import { Modal as SharedModal } from '../../../shared/components/Modal'
import { ConfirmModal } from '../components/ConfirmModal'
import { createNewProduct } from '../helpers/createNewProduct'
import { getProducts } from '../helpers/getProducts'
import { useStore } from '../../../app/providers/store'
import { useNavigate } from 'react-router'
import { deleteProduct } from '../helpers/deleteProduct'
import { editProduct } from '../helpers/editProduct'

import { getCategories } from '../../categories/helpers/getCategories'
import { createCategory } from '../../categories/helpers/createCategory'
import { useEscape } from '../../../shared/helpers/useEscape'

export const Products = () => {
    const [openModal, setOpenModal] = useState(false)
    const [openConfirmModal, setOpenConfirmModal] = useState(false)
    const [productToDelete, setProductToDelete] = useState(null)
    const [editProductData, setEditProductData] = useState({})
    const [searchTerm, setSearchTerm] = useState('')
    const [activeStatus, setActiveStatus] = useState('all')
    const [activeStock, setActiveStock] = useState('all')
    const [visibleCount, setVisibleCount] = useState(20)
    const { user, products, setProducts, categories, setCategories } =
        useStore()
    const navigate = useNavigate()
    const [showCategoryModal, setShowCategoryModal] = useState(false)
    const [categoryName, setCategoryName] = useState('')
    const [savingCategory, setSavingCategory] = useState(false)
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
    const [showMobileActions, setShowMobileActions] = useState(null)

    useEscape(showCategoryModal ? () => { setShowCategoryModal(false); setCategoryName('') } : null)

    const filteredProducts = products
        .filter((product) => {
            const matchesSearch =
                product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase()))
            const matchesStatus =
                activeStatus === 'all' ||
                (activeStatus === 'active' && product.is_active !== false) ||
                (activeStatus === 'inactive' && product.is_active === false)
            const matchesStock =
                activeStock === 'all' ||
                (activeStock === 'with' && product.track_stock !== false) ||
                (activeStock === 'without' && product.track_stock === false)

            return matchesSearch && matchesStatus && matchesStock
        })
        // Products come from API in default order
        .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))

    const displayedProducts = filteredProducts.slice(0, visibleCount)

    const productsHeaders = [
        'Código',
        'Nombre',
        'Categoría',
        'Precio',
        'Costo',
        'Margen',
        'Maneja Stock',
        'Estado',
        'Acciones',
    ]
    const businessId = user?.profile?.business_id || user.data.user.id

    useEffect(() => {
        const loadProductsAndCategories = async () => {
            if (!businessId) return
            try {
                const products = await getProducts(businessId)
                setProducts(products)
                const categories = await getCategories(businessId)
                setCategories(categories)
            } catch {
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
        const businessId = user?.profile?.business_id || user?.data?.user?.id

        if (formData.id) {
            // Actualizar producto existente
            try {
                const updatedProduct = await editProduct(formData.id, {
                    ...formData,
                    business_id: businessId,
                })
                setProducts(
                    products.map((product) =>
                        product.id === updatedProduct.id
                            ? updatedProduct
                            : product,
                    ),
                )
                sileo.success({ fill: 'var(--toast-success)', title: 'Completado', description: 'Producto actualizado correctamente'})
                setOpenModal(false)
            } catch (error) {
                sileo.error({ fill: 'var(--toast-error)', title: 'Error', description: error.message || 'Error al actualizar el producto'})
            }
        } else {
            // Crear nuevo producto
            try {
                const newProduct = await createNewProduct({
                    ...formData,
                    business_id: businessId,
                })
                setProducts([...products, newProduct])
                sileo.success({ fill: 'var(--toast-success)', title: 'Completado', description: 'Producto creado correctamente'})
                setOpenModal(false)
            } catch (error) {
                sileo.error({ fill: 'var(--toast-error)', title: 'Error', description: error.message || 'Error al crear el producto'})
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
                setProducts(
                    products.map((product) =>
                        product.id === productToDelete
                            ? { ...product, is_active: false }
                            : product,
                    ),
                )
                sileo.info({ fill: 'var(--toast-info)', title: 'Información', description: 
                    'El producto tiene ventas asociadas y se ha marcado como inactivo.',
                })
            } else {
                setProducts(
                    products.filter(
                        (product) => product.id !== productToDelete,
                    ),
                )
                sileo.success({ fill: 'var(--toast-success)', title: 'Completado', description: 'Producto eliminado correctamente'})
            }
        } catch (error) {
            if (
                error.message?.includes('404') ||
                error.message?.includes('not found')
            ) {
                setProducts(
                    products.filter(
                        (product) => product.id !== productToDelete,
                    ),
                )
            }
            sileo.error({ fill: 'var(--toast-error)', title: 'Error', description: error.message || 'Error al eliminar el producto'})
        } finally {
            setProductToDelete(null)
        }
    }
    const onEditProduct = (productId) => {
        const product = products.find(p => p.id === productId)
        if (product) {
            setEditProductData(product)
            setOpenModal(true)
        }
    }

    const handleSearch = (e) => {
        setSearchTerm(e.target.value)
        setVisibleCount(20)
    }

    const handleCreateCategory = async () => {
        if (!categoryName.trim()) {
            sileo.warning({ fill: 'var(--toast-warning)', title: 'Atención', description: 'El nombre de la categoría es obligatorio'})
            return
        }
        setSavingCategory(true)
        try {
            const newCategory = await createCategory({
                business_id: businessId,
                name: categoryName.trim(),
            })
            setCategories([...categories, newCategory])
            sileo.success({ fill: 'var(--toast-success)', title: 'Completado', description: 'Categoría creada exitosamente'})
            setShowCategoryModal(false)
            setCategoryName('')
        } catch (error) {
            sileo.error({ fill: 'var(--toast-error)', title: 'Error', description: error.message || 'Error al crear la categoría'})
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
                    products={products}
                />
            )}

            <ConfirmModal
                isOpen={openConfirmModal}
                onClose={() => setOpenConfirmModal(false)}
                onConfirm={confirmDelete}
                title='¿Eliminar producto?'
                message='Esta acción no se puede deshacer. El producto se eliminará permanentemente de tu inventario.'
            />

            {/* Modal crear categoría */}
            {showCategoryModal && (
                <SharedModal
                    onClose={() => {
                        setShowCategoryModal(false)
                        setCategoryName('')
                    }}
                    title='Nueva Categoría'
                    icon={Tags}
                >
                    <div className='p-6'>
                        <label className='block text-sm font-medium text-on-body mb-2'>
                            Nombre
                        </label>
                        <input
                            type='text'
                            value={categoryName}
                            onChange={(e) =>
                                setCategoryName(e.target.value)
                            }
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault()
                                    handleCreateCategory()
                                }
                            }}
                            placeholder='Nombre de la categoría'
                            className='w-full border border-divider rounded-md py-3 px-4 text-sm focus:outline-none focus:border-accent focus:ring-0 transition-all duration-300'
                            autoFocus
                        />
                    </div>
                    <div className='px-6 pb-6 flex gap-3'>
                        <button
                            onClick={() => {
                                setShowCategoryModal(false)
                                setCategoryName('')
                            }}
                            className='flex-1 py-2.5 border border-outline text-on-body hover:bg-hover rounded-lg font-medium transition text-sm cursor-pointer'>
                            Cancelar
                        </button>
                        <button
                            onClick={handleCreateCategory}
                            disabled={
                                savingCategory || !categoryName.trim()
                            }
                            className='flex-1 py-2.5 bg-accent text-surface rounded-lg font-bold hover:bg-accent/85 transition text-sm disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2'>
                            {savingCategory ? <><Loader className='w-5 h-5 animate-spin' /> Guardando...</> : <><Save className='w-5 h-5' /> Guardar</>}
                        </button>
                    </div>
                </SharedModal>
            )}

            <section className='flex flex-col gap-6'>
                {/* Titulo de la sección productos */}
                <section>
                    <h1 className='text-2xl font-bold'>Gestión de Productos</h1>
                    <p className='text-on-body'>
                        Aquí puedes gestionar tus productos, agregar nuevos,
                        editar los existentes y eliminar los que ya no
                        necesites.
                    </p>
                </section>
                <section className='bg-surface border border-outline shadow-xs rounded-lg'>
                    <section className='border-b border-outline flex justify-between items-center px-6 py-4 bg-subtle'>
                        <section className='flex items-center gap-2'>
                            <Package className='w-5 h-5 text-accent' />
                            <h2 className='text-lg font-semibold flex flex-col'>
                                Lista de Productos
                            <span className='text-sm text-muted font-medium'>
                                Total ({filteredProducts.length})
                            </span>
                            </h2>
                        </section>
                        <section className='flex items-center gap-2'>
                            <section className='hidden sm:flex items-center gap-2'>
                                <section className='relative'>
                                    <button
                                        onClick={() =>
                                            setShowCategoryDropdown(
                                                !showCategoryDropdown,
                                            )
                                        }
                                        className='flex items-center font-medium px-4 py-2 border border-outline text-on-body text-sm rounded-lg hover:bg-hover-strong transition cursor-pointer'>
                                        <Tags className='w-4 h-5 mr-2' />
                                        Categorías
                                        <ChevronDown className='w-4 h-4 ml-1' />
                                    </button>
                                    {showCategoryDropdown && (
                                        <section
                                            className='fixed inset-0 z-40'
                                            onClick={() =>
                                                setShowCategoryDropdown(false)
                                            }
                                        />
                                    )}
                                    <section
                                        className={`absolute right-0 mt-2 w-56 bg-surface border border-divider rounded-lg shadow-lg z-50 ${showCategoryDropdown ? 'block' : 'hidden'}`}>
                                        <button
                                            onClick={() => {
                                                setShowCategoryModal(true)
                                                setShowCategoryDropdown(false)
                                            }}
                                            className='flex items-center gap-2 w-full px-4 py-2.5 text-sm text-on-body hover:bg-hover rounded-t-lg cursor-pointer'>
                                            <Plus className='w-4 h-4' />
                                            Crear categoría
                                        </button>
                                        <button
                                            onClick={() => {
                                                navigate('/categories')
                                                setShowCategoryDropdown(false)
                                            }}
                                            className='flex items-center gap-2 w-full px-4 py-2.5 text-sm text-on-body hover:bg-hover rounded-b-lg cursor-pointer'>
                                            <Tags className='w-4 h-4' />
                                            Gestionar categorías
                                        </button>
                                    </section>
                                </section>
                                <button
                                    onClick={() => navigate('/inventory')}
                                    className='flex items-center font-medium px-4 py-2 border border-outline text-on-body text-sm rounded-lg hover:bg-hover-strong transition cursor-pointer'>
                                    <ClipboardList className='w-4 h-5 mr-2' />
                                    Inventario
                                </button>
                                <button
                                    className='flex items-center font-medium px-4 py-2 bg-accent text-surface text-sm rounded-lg hover:bg-accent/85 transition cursor-pointer'
                                    onClick={handleOpenModal}>
                                    <Package className='w-4 h-5 mr-2' />
                                    Nuevo Producto
                                </button>
                            </section>
                            <section className='relative sm:hidden'>
                                <button
                                    onClick={() =>
                                        setShowMobileActions(
                                            showMobileActions === 'header'
                                                ? null
                                                : 'header',
                                        )
                                    }
                                    className='p-2 text-on-body hover:bg-hover-strong rounded-lg transition cursor-pointer'>
                                    <EllipsisVertical className='w-6 h-6' />
                                </button>
                                {showMobileActions === 'header' && (
                                    <section
                                        className='fixed inset-0 z-40'
                                        onClick={() =>
                                            setShowMobileActions(null)
                                        }
                                    />
                                )}
                                <section
                                    className={`absolute right-0 mt-2 w-56 bg-surface border border-divider rounded-lg shadow-lg z-50 ${showMobileActions === 'header' ? 'block' : 'hidden'}`}>
                                    <button
                                        onClick={() => {
                                            handleOpenModal()
                                            setShowMobileActions(null)
                                        }}
                                        className='flex items-center gap-2 w-full px-4 py-2.5 text-sm text-on-body hover:bg-hover rounded-t-lg cursor-pointer'>
                                        <Package className='w-4 h-4' />
                                        Nuevo Producto
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowCategoryModal(true)
                                            setShowMobileActions(null)
                                        }}
                                        className='flex items-center gap-2 w-full px-4 py-2.5 text-sm text-on-body hover:bg-hover cursor-pointer'>
                                        <Plus className='w-4 h-4' />
                                        Nueva categoría
                                    </button>
                                    <button
                                        onClick={() => {
                                            navigate('/categories')
                                            setShowMobileActions(null)
                                        }}
                                        className='flex items-center gap-2 w-full px-4 py-2.5 text-sm text-on-body hover:bg-hover cursor-pointer'>
                                        <Tags className='w-4 h-4' />
                                        Gestionar categorías
                                    </button>
                                    <button
                                        onClick={() => {
                                            navigate('/inventory')
                                            setShowMobileActions(null)
                                        }}
                                        className='flex items-center gap-2 w-full px-4 py-2.5 text-sm text-on-body hover:bg-hover rounded-b-lg cursor-pointer'>
                                        <ClipboardList className='w-4 h-4' />
                                        Inventario
                                    </button>
                                </section>
                            </section>
                        </section>
                    </section>
                    <section className='p-6 flex flex-col gap-4'>
                        <div className='relative'>
                            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-faint' />
                            <input
                                type='search'
                                value={searchTerm}
                                onChange={handleSearch}
                                className='w-full border border-divider rounded-md pl-10 pr-3 py-3 text-sm focus:outline-none focus:border-accent focus:ring-0 transition-all duration-300'
                                placeholder='Buscar por código o nombre...'
                            />
                        </div>
                        <div className='flex flex-wrap items-center gap-2 max-w-full overflow-x-auto scrollbar-none'>
                            {/* <div className='flex gap-1 bg-subtle dark:bg-gray-900 rounded-lg p-1 w-fit'>
                                <button
                                    onClick={() => setActiveCategory('all')}
                                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                                        activeCategory === 'all'
                                            ? 'bg-surface shadow-xs text-accent'
                                            : 'text-muted hover:text-on-body hover:bg-hover'
                                    }`}>
                                    <Layers className='w-4 h-4' />
                                    Todas
                                </button>
                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() =>
                                            setActiveCategory(category.id)
                                        }
                                        className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                                            activeCategory === category.id
                                                ? 'bg-surface shadow-xs text-accent'
                                                : 'text-muted hover:text-on-body hover:bg-hover'
                                        }`}>
                                        <Tags className='w-4 h-4' />
                                        {category.name}
                                    </button>
                                ))}
                            </div> */}
                            <div className='flex gap-1 bg-disabled/70 rounded-lg p-1 w-fit ml-0 xl:ml-4'>
                                <button
                                    onClick={() => { setActiveStatus('all'); setVisibleCount(20) }}
                                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                                        activeStatus === 'all'
                                            ? 'bg-surface shadow-xs text-accent'
                                            : 'text-muted hover:text-on-body hover:bg-surface'
                                    }`}>
                                    <CheckCircle2 className='w-4 h-4' />
                                    Todos
                                </button>
                                <button
                                    onClick={() => { setActiveStatus('active'); setVisibleCount(20) }}
                                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                                        activeStatus === 'active'
                                            ? 'bg-surface shadow-xs text-accent'
                                            : 'text-muted hover:text-on-body hover:bg-surface'
                                    }`}>
                                    <CheckCircle className='w-4 h-4' />
                                    Activo
                                </button>
                                <button
                                    onClick={() => { setActiveStatus('inactive'); setVisibleCount(20) }}
                                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                                        activeStatus === 'inactive'
                                            ? 'bg-surface shadow-xs text-accent'
                                            : 'text-muted hover:text-on-body hover:bg-surface'
                                    }`}>
                                    <XCircle className='w-4 h-4' />
                                    Inactivo
                                </button>
                            </div>
                            <div className='flex gap-1 bg-disabled/70 rounded-lg p-1 w-fit'>
                                <button
                                    onClick={() => { setActiveStock('all'); setVisibleCount(20) }}
                                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                                        activeStock === 'all'
                                            ? 'bg-surface shadow-xs text-accent'
                                            : 'text-muted hover:text-on-body hover:bg-surface'
                                    }`}>
                                    <Layers className='w-4 h-4' />
                                    Todos
                                </button>
                                <button
                                    onClick={() => { setActiveStock('with'); setVisibleCount(20) }}
                                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                                        activeStock === 'with'
                                            ? 'bg-surface shadow-xs text-accent'
                                            : 'text-muted hover:text-on-body hover:bg-surface'
                                    }`}>
                                    <PackageCheck className='w-4 h-4' />
                                    Con control
                                </button>
                                <button
                                    onClick={() => { setActiveStock('without'); setVisibleCount(20) }}
                                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                                        activeStock === 'without'
                                            ? 'bg-surface shadow-xs text-accent'
                                            : 'text-muted hover:text-on-body hover:bg-surface'
                                    }`}>
                                    <PackageX className='w-4 h-4' />
                                    Sin control
                                </button>
                            </div>
                        </div>
                    </section>
                    <div className='overflow-x-auto px-6 pb-2'>
                        <table className='text-sm overflow-hidden rounded-t-lg w-full'>
                            <thead>
                                <tr className='bg-subtle border-b border-divider text-muted uppercase text-xs tracking-wider'>
                                    {productsHeaders.map((header, index) => (
                                        <th
                                            key={index}
                                            className={`py-3 px-4 font-medium ${header === 'Precio' || header === 'Acciones' || header === 'Control Stock' ? 'text-right' : 'text-left'}`}>
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {displayedProducts.map((product, index) => (
                                    <tr
                                        key={index}
                                        className='border-b border-divider-light hover:bg-hover'>
                                        <td className='py-3 px-4 font-medium text-on-surface'>
                                            {product.sku}
                                        </td>
                                        <td className='py-3 px-4 text-on-body'>
                                            {product.name}
                                        </td>
                                        <td className='py-3 px-4 text-muted'>
                                            {product.categories?.name ||
                                                'Sin categoría'}
                                        </td>
                                        <td className='py-3 px-4 text-on-body font-bold text-right'>
                                            $
                                            {new Intl.NumberFormat(
                                                'es-CO',
                                            ).format(product.price)}
                                        </td>
                                        <td className='py-3 px-4 text-right'>
                                            {product.unit_cost != null ? (
                                                <span className='font-medium text-on-body'>
                                                    ${new Intl.NumberFormat('es-CO').format(product.unit_cost)}
                                                </span>
                                            ) : (
                                                <span className='text-faint italic'>—</span>
                                            )}
                                        </td>
                                        <td className='py-3 px-4 text-right'>
                                            {product.unit_cost != null && product.price > 0 ? (() => {
                                                const margin = Math.round(((product.price - product.unit_cost) / product.price) * 100)
                                                return (
                                                    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                                                        margin >= 30 ? 'bg-green-100 text-green-800' :
                                                        margin >= 10 ? 'bg-amber-100 text-amber-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                        {margin}%
                                                    </span>
                                                )
                                            })() : (
                                                <span className='text-faint italic'>—</span>
                                            )}
                                        </td>
                                        <td className='py-3 px-4 whitespace-nowrap'>
                                            {product.track_stock !== false ? (
                                                <span className='px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full whitespace-nowrap'>
                                                    Sí
                                                </span>
                                            ) : (
                                                <span className='px-2.5 py-0.5 text-xs font-medium bg-subtle text-muted rounded-full whitespace-nowrap'>
                                                    No
                                                </span>
                                            )}
                                        </td>
                                        <td className='py-3 px-4 whitespace-nowrap'>
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
                                        <td className='py-3 px-2 text-right whitespace-nowrap'>
                                            <section className='hidden sm:flex items-center justify-end gap-3'>
                                                <button
                                                    onClick={() =>
                                                        onEditProduct(
                                                            product.id,
                                                        )
                                                    }
                                                    className='bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-800 p-1.5 rounded-sm cursor-pointer'
                                                    title='Editar Producto'>
                                                    <Edit2 className='w-4 h-4 text-accent' />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        onDeleteProduct(
                                                            product.id,
                                                        )
                                                    }
                                                    className='hover:bg-red-500 bg-red-400 text-white p-1.5 rounded-sm cursor-pointer'
                                                    title='Eliminar Producto'>
                                                    <Trash2 className='w-4 h-4' />
                                                </button>
                                            </section>
                                            <section className='relative sm:hidden'>
                                                <button
                                                    onClick={() =>
                                                        setShowMobileActions(
                                                            showMobileActions ===
                                                                product.id
                                                                ? null
                                                                : product.id,
                                                        )
                                                    }
                                                    className='p-1 text-on-body hover:bg-hover-strong rounded-lg transition cursor-pointer'>
                                                    <EllipsisVertical className='w-5 h-5' />
                                                </button>
                                                {showMobileActions ===
                                                    product.id && (
                                                    <section
                                                        className='fixed inset-0 z-40'
                                                        onClick={() =>
                                                            setShowMobileActions(
                                                                null,
                                                            )
                                                        }
                                                    />
                                                )}
                                                <section
                                                    className={`absolute right-0 mt-1 w-40 bg-surface border border-divider rounded-lg shadow-lg z-50 ${showMobileActions === product.id ? 'block' : 'hidden'}`}>
                                                    <button
                                                        onClick={() => {
                                                            onEditProduct(
                                                                product.id,
                                                            )
                                                            setShowMobileActions(
                                                                null,
                                                            )
                                                        }}
                                                        className='flex items-center gap-2 w-full px-4 py-2.5 text-sm text-on-body hover:bg-hover rounded-t-lg cursor-pointer'>
                                                        <Edit2 className='w-4 h-4 text-accent' />
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            onDeleteProduct(
                                                                product.id,
                                                            )
                                                            setShowMobileActions(
                                                                null,
                                                            )
                                                        }}
                                                        className='flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-hover rounded-b-lg cursor-pointer'>
                                                        <Trash2 className='w-4 h-4' />
                                                        Eliminar
                                                    </button>
                                                </section>
                                            </section>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {visibleCount < filteredProducts.length && (
                        <button
                            onClick={handleLoadMore}
                            className='w-full mt-4 py-2 text-sm font-medium text-on-surface hover:text-surface hover:bg-accent rounded-lg border border-accent transition-colors cursor-pointer px-6 flex items-center justify-center gap-2'>
                            <ChevronDown className='w-4 h-4' /> Cargar más ({filteredProducts.length - visibleCount} restantes)
                        </button>
                    )}
                    {filteredProducts.length === 0 && (
                        <div className='text-center text-faint italic py-12 px-6'>
                            No se encontraron productos
                        </div>
                    )}
                </section>
            </section>
        </>
    )
}
