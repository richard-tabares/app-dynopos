import {
    Plus,
    Edit2,
    Trash2,
    Package,
    Search,
    Tags,
    Layers,
    Settings2,
    ChevronDown,
    ChevronRight,
    EllipsisVertical,
    CheckCircle2,
    CheckCircle,
    XCircle,
    PackageCheck,
    PackageX,
    Save,
    Loader,
    Upload,
    AlertTriangle,
} from 'lucide-react'
import { Fragment, useEffect, useState } from 'react'
import { sileo } from 'sileo'
import { Modal } from '../components/Modal'
import { Modal as SharedModal } from '../../../shared/components/Modal'
import { ConfirmModal } from '../components/ConfirmModal'
import { VariationEditModal } from '../components/VariationEditModal'
import { createNewProduct } from '../helpers/createNewProduct'
import { getProducts } from '../helpers/getProducts'
import { useStore } from '../../../app/providers/store'
import { useNavigate } from 'react-router'
import { deleteProduct } from '../helpers/deleteProduct'
import { deleteVariation } from '../helpers/deleteVariation'
import { editProduct } from '../helpers/editProduct'

import { getCategories } from '../../categories/helpers/getCategories'
import { createCategory } from '../../categories/helpers/createCategory'
import { useEscape } from '../../../shared/helpers/useEscape'
import { normalizeSearch } from '../../../shared/helpers/normalizeSearch'
import { getUnitLabel, ensureUnitsLoaded } from '../../../shared/helpers/unitsOfMeasure'
import { BulkUploadModal } from '../components/BulkUploadModal'
import { StockAdjustmentModal } from '../components/StockAdjustmentModal'
import { updateInventory } from '../helpers/updateInventory'
import { productHasActiveVariations, getActiveVariations, getDefaultVariation } from '../../../shared/helpers/productHelpers'
import { useIsMobileDevice } from '../../../shared/hooks/useIsMobileDevice'

export const Products = () => {
    const isMobileDevice = useIsMobileDevice()
    const [openModal, setOpenModal] = useState(false)
    const [openConfirmModal, setOpenConfirmModal] = useState(false)
    const [productToDelete, setProductToDelete] = useState(null)
    const [editProductData, setEditProductData] = useState({})
    const [searchTerm, setSearchTerm] = useState('')
    const [activeStatus, setActiveStatus] = useState('all')
    const [stockFilter, setStockFilter] = useState('all')
    const [visibleCount, setVisibleCount] = useState(20)
    const { user, products, setProducts, categories, setCategories, unitsOfMeasure, setUnitsOfMeasure } =
        useStore()
    const navigate = useNavigate()
    const [showNewProductDropdown, setShowNewProductDropdown] = useState(false)
    const [showBulkUploadModal, setShowBulkUploadModal] = useState(false)
    const [showCategoryModal, setShowCategoryModal] = useState(false)
    const [categoryName, setCategoryName] = useState('')
    const [savingCategory, setSavingCategory] = useState(false)
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
    const [showMobileActions, setShowMobileActions] = useState(null)
    const [expandedProductId, setExpandedProductId] = useState(null)
    const [editingVariation, setEditingVariation] = useState(null)
    const [showStockModal, setShowStockModal] = useState(false)
    const [stockPreselect, setStockPreselect] = useState(null)

    useEscape(
        showCategoryModal
            ? () => {
                  setShowCategoryModal(false)
                  setCategoryName('')
              }
            : null,
    )

    const filteredProducts = products
        .filter((product) => {
            const term = normalizeSearch(searchTerm)
            const matchesSearch =
                normalizeSearch(product.name).includes(term) ||
                normalizeSearch(product.sku).includes(term) ||
                (product.barcode &&
                    normalizeSearch(product.barcode).includes(term))
            const matchesStatus =
                activeStatus === 'all' ||
                (activeStatus === 'active' && product.is_active !== false) ||
                (activeStatus === 'inactive' && product.is_active === false)
            let matchesStock = true
            const activeVariations = getActiveVariations(product)
            const allNoTrackStock = activeVariations.every((v) => v.track_stock === false)
            const anyTrackStock = activeVariations.some((v) => v.track_stock !== false)
            if (stockFilter === 'noStockControl') {
                matchesStock = allNoTrackStock
            } else if (stockFilter === 'noStock') {
                matchesStock =
                    anyTrackStock &&
                    activeVariations.some((v) => v.track_stock !== false && v.stock === 0)
            } else if (stockFilter === 'lowStock') {
                matchesStock =
                    anyTrackStock &&
                    activeVariations.some((v) => {
                        if (v.track_stock === false) return false
                        const vm = v.min_stock ?? 0
                        return v.stock > 0 && vm > 0 && v.stock < vm
                    })
            } else if (stockFilter === 'withStock') {
                matchesStock =
                    anyTrackStock &&
                    activeVariations.every((v) => {
                        if (v.track_stock === false) return true
                        const vm = v.min_stock ?? 0
                        return v.stock > 0 && (vm === 0 || v.stock >= vm)
                    })
            }

            return matchesSearch && matchesStatus && matchesStock
        })
        // Products come from API in default order
        .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))

    const displayedProducts = filteredProducts.slice(0, visibleCount)

    const productsHeaders = [
        'Nombre',
        'Categoría',
        'Costo',
        'Precio',
        'Margen',
        'Stock',
        'Variaciones',
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

    useEffect(() => {
        ensureUnitsLoaded(unitsOfMeasure, setUnitsOfMeasure)
    }, [unitsOfMeasure, setUnitsOfMeasure])

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
                if (expandedProductId === updatedProduct.id && getActiveVariations(updatedProduct).length <= 1) {
                    setExpandedProductId(null)
                }
                sileo.success({
                    fill: 'var(--toast-success)',
                    title: 'Completado',
                    description: 'Producto actualizado correctamente',
                })
                setOpenModal(false)
            } catch (error) {
                sileo.error({
                    fill: 'var(--toast-error)',
                    title: 'Error',
                    description:
                        error.message || 'Error al actualizar el producto',
                })
            }
        } else {
            // Crear nuevo producto
            try {
                const newProduct = await createNewProduct({
                    ...formData,
                    business_id: businessId,
                })
                setProducts([newProduct, ...products])
                sileo.success({
                    fill: 'var(--toast-success)',
                    title: 'Completado',
                    description: 'Producto creado correctamente',
                })
                setOpenModal(false)
            } catch (error) {
                sileo.error({
                    fill: 'var(--toast-error)',
                    title: 'Error',
                    description: error.message || 'Error al crear el producto',
                })
            }
        }
    }

    const onDeleteProduct = async (productId, e) => {
        e.stopPropagation()
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
                sileo.info({
                    fill: 'var(--toast-info)',
                    title: 'Información',
                    description:
                        'El producto tiene ventas asociadas y se ha marcado como inactivo.',
                })
            } else {
                setProducts(
                    products.filter(
                        (product) => product.id !== productToDelete,
                    ),
                )
                sileo.success({
                    fill: 'var(--toast-success)',
                    title: 'Completado',
                    description: 'Producto eliminado correctamente',
                })
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
            sileo.error({
                fill: 'var(--toast-error)',
                title: 'Error',
                description: error.message || 'Error al eliminar el producto',
            })
        } finally {
            setProductToDelete(null)
        }
    }
    const onEditProduct = (productId, e) => {
        e.stopPropagation()
        const product = products.find((p) => p.id === productId)
        if (product) {
            setEditProductData(product)
            setOpenModal(true)
        }
    }

    const handleRowClick = (product, e) => {
        if (e.target.closest('button')) return
        if (productHasActiveVariations(product)) {
            setExpandedProductId(expandedProductId === product.id ? null : product.id)
        } else if (getActiveVariations(product).length === 1) {
            setEditProductData(product)
            setOpenModal(true)
        }
    }

    const onEditVariation = (variation, e) => {
        e.stopPropagation()
        setEditingVariation(variation)
    }

    const handleVariationSaved = (updatedVariation) => {
        setProducts(
            products.map((product) => {
                if (!product.product_variations) return product
                return {
                    ...product,
                    product_variations: product.product_variations.map((v) =>
                        v.id === updatedVariation.id ? { ...v, ...updatedVariation } : v,
                    ),
                }
            }),
        )
    }

    const handleDeleteVariation = async (variationId, e) => {
        e.stopPropagation()
        try {
            const result = await deleteVariation(variationId)

            if (result.softDeleted) {
                setProducts(
                    products.map((product) => {
                        if (!product.product_variations) return product
                        return {
                            ...product,
                            product_variations: product.product_variations.map(
                                (v) =>
                                    v.id === variationId
                                        ? { ...v, is_active: false }
                                        : v,
                            ),
                        }
                    }),
                )
                sileo.info({
                    fill: 'var(--toast-info)',
                    title: 'Información',
                    description:
                        'La variación tiene ventas asociadas y se ha marcado como inactiva.',
                })
            } else {
                setProducts(
                    products.map((product) => {
                        if (!product.product_variations) return product
                        return {
                            ...product,
                            product_variations:
                                product.product_variations.filter(
                                    (v) => v.id !== variationId,
                                ),
                        }
                    }),
                )
                sileo.success({
                    fill: 'var(--toast-success)',
                    title: 'Completado',
                    description: 'Variación eliminada correctamente',
                })
            }
        } catch (error) {
            sileo.error({
                fill: 'var(--toast-error)',
                title: 'Error',
                description: error.message || 'Error al eliminar la variación',
            })
        }
    }

    const handleStockAdjust = async (productId, formData) => {
        try {
            const updatedProduct = await updateInventory(productId, formData)
            if (updatedProduct) {
                setProducts(
                    products.map((p) =>
                        p.id === updatedProduct.id ? updatedProduct : p,
                    ),
                )
                if (editProductData?.id === updatedProduct.id) {
                    setEditProductData(updatedProduct)
                }
                if (editingVariation && formData.variation_id) {
                    const updatedVar = updatedProduct.product_variations?.find(
                        v => v.id === formData.variation_id,
                    )
                    if (updatedVar) setEditingVariation(updatedVar)
                }
                sileo.success({
                    fill: 'var(--toast-success)',
                    title: 'Completado',
                    description: 'Inventario actualizado correctamente',
                })
                setShowStockModal(false)
                setStockPreselect(null)
            } else {
                sileo.error({
                    fill: 'var(--toast-error)',
                    title: 'Error',
                    description: 'No se pudo actualizar el inventario',
                })
            }
        } catch (error) {
            sileo.error({
                fill: 'var(--toast-error)',
                title: 'Error',
                description:
                    error.message || 'Error de red al actualizar el inventario',
            })
        }
    }

    const handleOpenStockFromProduct = (variation) => {
        const varToAdjust = variation || getDefaultVariation(editProductData)
        if (varToAdjust) {
            setStockPreselect({ product: editProductData, variation: varToAdjust })
            setShowStockModal(true)
        }
    }

    const handleOpenStockFromVariation = () => {
        const product = products.find((p) =>
            p.product_variations?.some((v) => v.id === editingVariation.id),
        )
        if (product) {
            setStockPreselect({ product, variation: editingVariation })
            setShowStockModal(true)
        }
    }

    const handleSearch = (e) => {
        setSearchTerm(e.target.value)
        setVisibleCount(20)
    }

    const handleCreateCategory = async () => {
        if (!categoryName.trim()) {
            sileo.warning({
                fill: 'var(--toast-warning)',
                title: 'Atención',
                description: 'El nombre de la categoría es obligatorio',
            })
            return
        }
        setSavingCategory(true)
        try {
            const newCategory = await createCategory({
                business_id: businessId,
                name: categoryName.trim(),
            })
            setCategories([...categories, newCategory])
            sileo.success({
                fill: 'var(--toast-success)',
                title: 'Completado',
                description: 'Categoría creada exitosamente',
            })
            setShowCategoryModal(false)
            setCategoryName('')
        } catch (error) {
            sileo.error({
                fill: 'var(--toast-error)',
                title: 'Error',
                description: error.message || 'Error al crear la categoría',
            })
        } finally {
            setSavingCategory(false)
        }
    }

    const handleLoadMore = () => {
        setVisibleCount((prev) => prev + 20)
    }

    const renderProductRow = (product) => {
        const defaultVar = getDefaultVariation(product)
        const allVariations = getActiveVariations(product)
        const defaultVariation = product.product_variations?.find(v => v.variation_name === 'Default')
        const isDefaultActive = defaultVariation?.is_active !== false
        const cost = isDefaultActive ? (defaultVar?.unit_cost ?? 0) : null
        const price = isDefaultActive ? (defaultVar?.price ?? 0) : null
        const margin = price > 0 ? Math.round(((price - cost) / price) * 100) : null
        const hasMultipleVars = productHasActiveVariations(product)
        const skuDisplay = defaultVar?.sku || ''
        const activeVariations = getActiveVariations(product)
        const anyTrackStock = activeVariations.some((v) => v.track_stock !== false)
        const totalStock = anyTrackStock
            ? activeVariations.reduce((sum, v) => sum + (v.stock || 0), 0)
            : null
        const stockBelowMin = anyTrackStock && activeVariations.some((v) => {
            if (v.track_stock === false) return false
            const vm = v.min_stock ?? 0
            return vm > 0 && (v.stock || 0) < vm
        })

        return (
            <Fragment key={product.id}>
                <tr
                    className={`border-b border-divider-light hover:bg-hover cursor-pointer ${expandedProductId === product.id ? 'bg-hover' : ''}`}
                    onClick={(e) => handleRowClick(product, e)}>
                    <td className='py-3 px-4 text-on-body'>
                        <span className='flex items-center gap-1'>
                            {hasMultipleVars && (
                                <>
                                    {expandedProductId === product.id ? (
                                        <ChevronDown className='w-3.5 h-3.5 text-accent shrink-0' />
                                    ) : (
                                        <ChevronRight className='w-3.5 h-3.5 text-accent shrink-0' />
                                    )}
                                </>
                            )}
                            {product.name}
                        </span>
                        {skuDisplay && (
                            <span className={`text-xs text-muted block mt-0.5 ${hasMultipleVars ? 'pl-5' : ''}`}>{skuDisplay}</span>
                        )}
                    </td>
                    <td className='py-3 px-4 text-muted'>{product.categories?.name || 'Sin categoría'}</td>
                    <td className='py-3 px-4 text-right'>
                        {cost > 0 ? (
                            <span className='font-medium text-on-body'>${new Intl.NumberFormat('es-CO').format(cost)}</span>
                        ) : (
                            <span className='text-faint italic'>—</span>
                        )}
                    </td>
                    <td className='py-3 px-4 text-on-body font-bold text-right'>
                        {price > 0 ? (
                            `$${new Intl.NumberFormat('es-CO').format(price)}`
                        ) : (
                            <span className='text-faint italic'>—</span>
                        )}
                    </td>
                    <td className='py-3 px-4 text-right'>
                        {margin !== null ? (
                            <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${margin >= 30 ? 'bg-green-100 text-green-800' : margin >= 10 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                                {margin}%
                            </span>
                        ) : (
                            <span className='text-faint italic'>—</span>
                        )}
                    </td>
                    <td className='py-3 px-4 whitespace-nowrap text-right'>
                        {totalStock !== null ? (
                            <span className={`font-medium ${stockBelowMin ? 'text-red-600' : 'text-on-body'}`}>{totalStock} {getUnitLabel(activeVariations.find(v => v.track_stock !== false)?.unit_of_measure_id, unitsOfMeasure)}</span>
                        ) : (
                            <span className='text-xs text-muted italic'>Sin control</span>
                        )}
                    </td>
                    <td className='py-3 px-4 whitespace-nowrap'>
                        <span className='px-2.5 py-0.5 text-xs font-medium bg-accent/10 text-accent rounded-full'>
                            {allVariations.length} {product.variation_type ? product.variation_type.toLowerCase() : 'variante'}
                        </span>
                    </td>
                    <td className='py-3 px-4 whitespace-nowrap'>
                        {product.is_active ? (
                            <span className='px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full'>Activo</span>
                        ) : (
                            <span className='px-2.5 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full'>Inactivo</span>
                        )}
                    </td>
                    <td className='py-3 px-2 text-right whitespace-nowrap'>
                        <section className='hidden sm:flex items-center justify-end gap-3'>
                            <button onClick={(e) => onEditProduct(product.id, e)} className='bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-800 p-1.5 rounded-sm cursor-pointer' title='Editar Producto'>
                                <Edit2 className='w-4 h-4 text-accent' />
                            </button>
                            <button onClick={(e) => onDeleteProduct(product.id, e)} className='hover:bg-red-500 bg-red-400 text-white p-1.5 rounded-sm cursor-pointer' title='Eliminar Producto'>
                                <Trash2 className='w-4 h-4' />
                            </button>
                        </section>
                        <section className='relative sm:hidden'>
                            <button onClick={() => setShowMobileActions(showMobileActions === product.id ? null : product.id)} className='p-1 text-on-body hover:bg-hover-strong rounded-lg transition cursor-pointer'>
                                <EllipsisVertical className='w-5 h-5' />
                            </button>
                            {showMobileActions === product.id && (
                                <section className='fixed inset-0 z-40' onClick={() => setShowMobileActions(null)} />
                            )}
                            <section className={`absolute right-0 mt-1 w-40 bg-surface border border-divider rounded-lg shadow-lg z-50 ${showMobileActions === product.id ? 'block' : 'hidden'}`}>
                                <button onClick={(e) => { onEditProduct(product.id, e); setShowMobileActions(null) }} className='flex items-center gap-2 w-full px-4 py-2.5 text-sm text-on-body hover:bg-hover rounded-t-lg cursor-pointer'>
                                    <Edit2 className='w-4 h-4 text-accent' /> Editar
                                </button>
                                <button onClick={(e) => { onDeleteProduct(product.id, e); setShowMobileActions(null) }} className='flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-hover rounded-b-lg cursor-pointer'>
                                    <Trash2 className='w-4 h-4' /> Eliminar
                                </button>
                            </section>
                        </section>
                    </td>
                </tr>
                {expandedProductId === product.id && product.product_variations
                    ?.filter(v => v.variation_name !== 'Default')
                    .map(v => (
                    <tr key={v.id}
                        className='border-b border-divider-light bg-hover/50 hover:bg-hover cursor-pointer group'
                        onClick={(e) => onEditVariation(v, e)}>
                        <td className='py-2 px-4'>
                            <span className='flex items-center gap-2 text-sm'>
                                <div className='w-3 h-3 border-b border-l border-muted rounded-bl-md shrink-0 ml-4' />
                                {product.variation_type && (
                                    <span className='px-2.5 py-0.5 text-xs font-medium bg-accent/10 text-accent rounded-full'>
                                        {product.variation_type.toLowerCase()}
                                    </span>
                                )}
                                <span className='font-medium text-on-surface'>{v.variation_name}</span>
                            </span>
                        </td>
                        <td className='py-2 px-4 text-xs text-muted'>—</td>
                        <td className='py-2 px-4 text-right'>{v.unit_cost ? <span className='text-sm font-medium text-on-body'>${new Intl.NumberFormat('es-CO').format(v.unit_cost)}</span> : <span className='text-faint italic text-xs'>—</span>}</td>
                        <td className='py-2 px-4 text-sm font-bold text-on-body text-right'>${new Intl.NumberFormat('es-CO').format(v.price)}</td>
                        <td className='py-2 px-4 text-right'>
                            {v.unit_cost && v.price > 0 ? (
                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                    Math.round(((v.price - v.unit_cost) / v.price) * 100) >= 30 ? 'bg-green-100 text-green-800'
                                    : Math.round(((v.price - v.unit_cost) / v.price) * 100) >= 10 ? 'bg-amber-100 text-amber-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                    {Math.round(((v.price - v.unit_cost) / v.price) * 100)}%
                                </span>
                            ) : <span className='text-faint italic text-xs'>—</span>}
                        </td>
                        <td className='py-2 px-4 whitespace-nowrap text-right'>{
    v.track_stock === false
        ? <span className='text-xs text-muted italic'>Sin control</span>
        : <span className={`text-xs ${(v.stock || 0) < (v.min_stock ?? 0) ? 'text-red-600 font-medium' : 'text-muted'}`}>{v.stock || 0} {getUnitLabel(v.unit_of_measure_id, unitsOfMeasure)}</span>
}</td>
                        <td className='py-2 px-4 whitespace-nowrap'><span className='text-xs text-muted'>—</span></td>
                        <td className='py-2 px-4 whitespace-nowrap'>
                            {v.is_active ? (
                                <span className='px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full'>Activo</span>
                            ) : (
                                <span className='px-2.5 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full'>Inactivo</span>
                            )}
                        </td>
                        <td className='py-2 px-2 text-right whitespace-nowrap'>
                            <div className='flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity'>
                                <button onClick={(e) => onEditVariation(v, e)} className='bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-800 p-1 rounded-sm cursor-pointer' title='Editar Variación'>
                                    <Edit2 className='w-3.5 h-3.5 text-accent' />
                                </button>
                                <button onClick={(e) => handleDeleteVariation(v.id, e)} className='hover:bg-red-500 bg-red-400 text-white p-1 rounded-sm cursor-pointer' title='Eliminar Variación'>
                                    <Trash2 className='w-3.5 h-3.5' />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </Fragment>
        )
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
                    onOpenStockAdjust={handleOpenStockFromProduct}
                />
            )}

            {editingVariation && (
                <VariationEditModal
                    variation={editingVariation}
                    onClose={() => setEditingVariation(null)}
                    onSaved={handleVariationSaved}
                    onOpenStockAdjust={handleOpenStockFromVariation}
                />
            )}

            {showStockModal && (
                <StockAdjustmentModal
                    products={products}
                    preselect={stockPreselect}
                    handleClose={() => {
                        setShowStockModal(false)
                        setStockPreselect(null)
                    }}
                    handleSubmit={handleStockAdjust}
                />
            )}

            <ConfirmModal
                isOpen={openConfirmModal}
                onClose={() => setOpenConfirmModal(false)}
                onConfirm={confirmDelete}
                title='¿Eliminar producto?'
                message='Esta acción no se puede deshacer. El producto se eliminará permanentemente de tu inventario.'
            />

            {showBulkUploadModal && (
                <BulkUploadModal
                    onClose={() => setShowBulkUploadModal(false)}
                    onComplete={() => {
                        const reload = async () => {
                            if (!businessId) return
                            try {
                                const [products, cats] = await Promise.all([
                                    getProducts(businessId),
                                    getCategories(businessId),
                                ])
                                setProducts(products)
                                setCategories(cats)
                            } catch {
                                setProducts([])
                                setCategories([])
                            }
                        }
                        reload()
                    }}
                />
            )}

            {/* Modal crear categoría */}
            {showCategoryModal && (
                <SharedModal
                    onClose={() => {
                        setShowCategoryModal(false)
                        setCategoryName('')
                    }}
                    title='Nueva Categoría'
                    icon={Tags}>
                    <div className='p-6'>
                        <label className='block text-sm font-medium text-on-body mb-2'>
                            Nombre
                        </label>
                        <input
                            type='text'
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault()
                                    handleCreateCategory()
                                }
                            }}
                            placeholder='Nombre de la categoría'
                            className='w-full border border-divider rounded-md py-3 px-4 text-sm focus:outline-none focus:border-accent focus:ring-0 transition-all duration-300'
                            autoFocus={!isMobileDevice}
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
                            disabled={savingCategory || !categoryName.trim()}
                            className='flex-1 py-2.5 bg-accent text-surface rounded-lg font-bold hover:bg-accent/85 transition text-sm disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2'>
                            {savingCategory ? (
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
                                Gestión de Productos
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
                                    onClick={() => setShowStockModal(true)}
                                    className='flex items-center font-medium px-4 py-2 border border-outline text-on-body text-sm rounded-lg hover:bg-hover-strong transition cursor-pointer'>
                                    <Settings2 className='w-4 h-5 mr-2' />
                                    Ajusta Stock
                                </button>
                                <section className='relative'>
                                    <button
                                        onClick={() => setShowNewProductDropdown(!showNewProductDropdown)}
                                        className='flex items-center font-medium px-4 py-2 bg-accent text-surface text-sm rounded-lg hover:bg-accent/85 transition cursor-pointer'>
                                        <Package className='w-4 h-5 mr-2' />
                                        Nuevo Producto
                                        <ChevronDown className='w-4 h-4 ml-1' />
                                    </button>
                                    {showNewProductDropdown && (
                                        <section
                                            className='fixed inset-0 z-40'
                                            onClick={() => setShowNewProductDropdown(false)}
                                        />
                                    )}
                                    <section
                                        className={`absolute right-0 mt-2 w-56 bg-surface border border-divider rounded-lg shadow-lg z-50 ${showNewProductDropdown ? 'block' : 'hidden'}`}>
                                        <button
                                            onClick={(e) => {
                                                setShowNewProductDropdown(false)
                                                handleOpenModal(e)
                                            }}
                                            className='flex items-center gap-2 w-full px-4 py-2.5 text-sm text-on-body hover:bg-hover rounded-t-lg cursor-pointer'>
                                            <Package className='w-4 h-4' />
                                            Crear Producto
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowNewProductDropdown(false)
                                                setShowBulkUploadModal(true)
                                            }}
                                            className='flex items-center gap-2 w-full px-4 py-2.5 text-sm text-on-body hover:bg-hover rounded-b-lg cursor-pointer'>
                                            <Upload className='w-4 h-4' />
                                            Carga Masiva
                                        </button>
                                    </section>
                                </section>
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
                                            setShowBulkUploadModal(true)
                                            setShowMobileActions(null)
                                        }}
                                        className='flex items-center gap-2 w-full px-4 py-2.5 text-sm text-on-body hover:bg-hover cursor-pointer'>
                                        <Upload className='w-4 h-4' />
                                        Carga Masiva
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
                                            setShowStockModal(true)
                                            setShowMobileActions(null)
                                        }}
                                        className='flex items-center gap-2 w-full px-4 py-2.5 text-sm text-on-body hover:bg-hover rounded-b-lg cursor-pointer'>
                                        <Settings2 className='w-4 h-4' />
                                        Ajusta Stock
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
                        <div className='flex flex-wrap items-center gap-4 max-w-full overflow-x-auto scrollbar-none'>
                            <div className='flex gap-1 bg-disabled/70 rounded-lg p-1 w-fit ml-0'>
                                <button
                                    onClick={() => {
                                        setActiveStatus('all')
                                        setVisibleCount(20)
                                    }}
                                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                                        activeStatus === 'all'
                                            ? 'bg-surface shadow-xs text-accent'
                                            : 'text-muted hover:text-on-body hover:bg-surface'
                                    }`}>
                                    <CheckCircle2 className='w-4 h-4' />
                                    Todos
                                </button>
                                <button
                                    onClick={() => {
                                        setActiveStatus('active')
                                        setVisibleCount(20)
                                    }}
                                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                                        activeStatus === 'active'
                                            ? 'bg-surface shadow-xs text-accent'
                                            : 'text-muted hover:text-on-body hover:bg-surface'
                                    }`}>
                                    <CheckCircle className='w-4 h-4' />
                                    Activo
                                </button>
                                <button
                                    onClick={() => {
                                        setActiveStatus('inactive')
                                        setVisibleCount(20)
                                    }}
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
                                    onClick={() => { setStockFilter('all'); setVisibleCount(20) }}
                                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                                        stockFilter === 'all'
                                            ? 'bg-surface shadow-xs text-on-surface'
                                            : 'text-muted hover:text-on-body hover:bg-hover'
                                    }`}>
                                    <Layers className='w-4 h-4 text-accent' />
                                    Todos
                                </button>
                                <button
                                    onClick={() => { setStockFilter('noStock'); setVisibleCount(20) }}
                                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                                        stockFilter === 'noStock'
                                            ? 'bg-surface shadow-xs text-on-surface'
                                            : 'text-muted hover:text-on-body hover:bg-hover'
                                    }`}>
                                    <PackageX className='w-4 h-4 text-red-500' />
                                    Sin Stock
                                </button>
                                <button
                                    onClick={() => { setStockFilter('lowStock'); setVisibleCount(20) }}
                                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                                        stockFilter === 'lowStock'
                                            ? 'bg-surface shadow-xs text-on-surface'
                                            : 'text-muted hover:text-on-body hover:bg-hover'
                                    }`}>
                                    <AlertTriangle className='w-4 h-4 text-red-500' />
                                    Stock Bajo
                                </button>
                                <button
                                    onClick={() => { setStockFilter('withStock'); setVisibleCount(20) }}
                                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                                        stockFilter === 'withStock'
                                            ? 'bg-surface shadow-xs text-on-surface'
                                            : 'text-muted hover:text-on-body hover:bg-hover'
                                    }`}>
                                    <PackageCheck className='w-4 h-4 text-emerald-500' />
                                    Con Stock
                                </button>
                                <button
                                    onClick={() => { setStockFilter('noStockControl'); setVisibleCount(20) }}
                                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                                        stockFilter === 'noStockControl'
                                            ? 'bg-surface shadow-xs text-on-surface'
                                            : 'text-muted hover:text-on-body hover:bg-hover'
                                    }`}>
                                    <Package className='w-4 h-4 text-muted' />
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
                                            className={`py-3 px-4 font-medium ${header === 'Precio' || header === 'Acciones' || header === 'Stock' || header === 'Costo' || header === 'Margen' ? 'text-right' : 'text-left'}`}>
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                    {displayedProducts.map(renderProductRow)}
                            </tbody>
                        </table>
                    </div>
                    {visibleCount < filteredProducts.length && (
                        <button
                            onClick={handleLoadMore}
                            className='w-full mt-4 py-2 text-sm font-medium text-on-surface hover:text-surface hover:bg-accent rounded-lg border border-accent transition-colors cursor-pointer px-6 flex items-center justify-center gap-2'>
                            <ChevronDown className='w-4 h-4' /> Cargar más (
                            {filteredProducts.length - visibleCount} restantes)
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
