import { useEffect, useState } from 'react'
import { Package, Search, AlertCircle, Settings2, AlertTriangle, PackageCheck, PackageX, Layers, ChevronDown } from 'lucide-react'
import { sileo } from 'sileo'
import { useStore } from '../../../app/providers/store'
import { getProducts } from '../../products/helpers/getProducts'
import { AdjustmentModal } from '../components/AdjustmentModal'
import { updateInventory } from '../helpers/updateInventory'
import { InventorySummary } from '../components/InventorySummary'

export const Inventory = () => {
    const { user, products, setProducts } = useStore()
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [openModal, setOpenModal] = useState(false)
    const [visibleCount, setVisibleCount] = useState(10)

    const businessId = user?.profile?.business_id || user?.data?.user?.id

    useEffect(() => {
        const loadInventory = async () => {
            if (!businessId) return
            try {
                const data = await getProducts(businessId)
                setProducts(data)
            } catch (error) {
                sileo.error({ fill: 'var(--toast-error)', title: 'Error', description: error.message || 'Error al cargar el inventario'})
            }
        }
        loadInventory()
    }, [businessId, setProducts])

    const activeProducts = products.filter(p => p.is_active !== false)

    const getStockStatus = (stock, minStock) => {
        if (stock <= 0) return { label: 'Sin Stock', cls: 'text-red-600 bg-red-100', icon: true }
        if (minStock > 0 && stock < minStock) return { label: 'Bajo', cls: 'text-orange-600 bg-orange-100', icon: true }
        return { label: 'Normal', cls: 'text-green-600 bg-green-100', icon: false }
    }

    const filteredProducts = activeProducts.filter((product) => {
        const matchesSearch =
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase()))

        const stock = product.inventory?.[0]?.stock || 0
        const minStock = product.inventory?.[0]?.min_stock || 0

        let matchesFilter = true
        if (filterStatus === 'noStockControl') {
            matchesFilter = product.track_stock === false
        } else if (filterStatus === 'noStock') {
            matchesFilter = product.track_stock !== false && stock === 0
        } else if (filterStatus === 'lowStock') {
            matchesFilter = product.track_stock !== false && stock > 0 && minStock > 0 && stock < minStock
        } else if (filterStatus === 'withStock') {
            matchesFilter = product.track_stock !== false && stock > 0 && (minStock === 0 || stock >= minStock)
        }

        return matchesSearch && matchesFilter
    })

    const displayedProducts = filteredProducts.slice(0, visibleCount)

    const handleOpenModal = (product, e) => {
        e.stopPropagation()
        setSelectedProduct(product)
        setOpenModal(true)
    }

    const handleCloseModal = () => {
        setSelectedProduct(null)
        setOpenModal(false)
    }

    const handleUpdateInventory = async (productId, formData) => {
        try {
            const updatedProduct = await updateInventory(productId, formData)
            if (updatedProduct) {
                setProducts(
                    products.map((p) =>
                        p.id === updatedProduct.id ? updatedProduct : p,
                    ),
                )
                sileo.success({ fill: 'var(--toast-success)', title: 'Completado', description: 'Inventario actualizado correctamente'})
                handleCloseModal()
            } else {
                sileo.error({ fill: 'var(--toast-error)', title: 'Error', description: 'No se pudo actualizar el inventario'})
            }
        } catch (error) {
            sileo.error({ fill: 'var(--toast-error)', title: 'Error', description: error.message || 'Error de red al actualizar el inventario'})
        }
    }

    const handleLoadMore = () => {
        setVisibleCount((prev) => prev + 10)
    }

    const headers = ['Código', 'Producto', 'Categoría', 'Stock', 'Mínimo', 'Costo Unit.', 'Valor Total', 'Estado', 'Acciones']

    return (
        <>
            {openModal && (
                <AdjustmentModal
                    product={selectedProduct}
                    handleClose={handleCloseModal}
                    handleSubmit={handleUpdateInventory}
                />
            )}

            <section className='flex flex-col gap-6'>
                <section>
                    <h1 className='text-2xl font-bold'>Inventario</h1>
                    <p className='text-on-body'>
                        Controla las existencias de tus productos y configura
                        alertas de stock bajo.
                    </p>
                </section>

                <InventorySummary products={activeProducts} />

                <section className='bg-surface border border-outline shadow-xs rounded-lg'>
                    <section className='border-b border-outline flex justify-between items-center px-6 py-4 bg-subtle'>
                        <h2 className='text-lg font-semibold flex items-center gap-2'>
                            <Package className='w-5 h-5 text-accent' />
                            Control de Stock
                        </h2>
                    </section>

                    <section className='p-6 flex flex-col gap-4'>
                        <div className='relative'>
                            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-faint' />
                            <input
                                type='search'
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value)
                                    setVisibleCount(20)
                                }}
                                className='w-full border border-divider rounded-md pl-10 pr-3 py-3 text-sm focus:outline-none focus:border-accent focus:ring-0 transition-all duration-300'
                                placeholder='Buscar por código o nombre...'
                            />
                        </div>
                        <div className='flex gap-2 bg-disabled/70 rounded-lg p-1 w-fit max-w-full overflow-x-auto scrollbar-none'>
                            <button
                                onClick={() => setFilterStatus('all')}
                                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                                    filterStatus === 'all'
                                        ? 'bg-surface shadow-xs text-on-surface'
                                        : 'text-muted hover:text-on-body hover:bg-hover'
                                }`}>
                                <Layers className='w-4 h-4 text-accent' />
                                Todos
                            </button>
                            <button
                                onClick={() => setFilterStatus('noStock')}
                                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                                    filterStatus === 'noStock'
                                        ? 'bg-surface shadow-xs text-on-surface'
                                        : 'text-muted hover:text-on-body hover:bg-hover'
                                }`}>
                                <PackageX className='w-4 h-4 text-red-500' />
                                Sin Stock
                            </button>
                            <button
                                onClick={() => setFilterStatus('lowStock')}
                                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                                    filterStatus === 'lowStock'
                                        ? 'bg-surface shadow-xs text-on-surface'
                                        : 'text-muted hover:text-on-body hover:bg-hover'
                                }`}>
                                <AlertTriangle className='w-4 h-4 text-red-500' />
                                Stock Bajo
                            </button>
                            <button
                                onClick={() => setFilterStatus('withStock')}
                                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                                    filterStatus === 'withStock'
                                        ? 'bg-surface shadow-xs text-on-surface'
                                        : 'text-muted hover:text-on-body hover:bg-hover'
                                }`}>
                                <PackageCheck className='w-4 h-4 text-emerald-500' />
                                Con Stock
                            </button>
                            <button
                                onClick={() => setFilterStatus('noStockControl')}
                                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                                    filterStatus === 'noStockControl'
                                        ? 'bg-surface shadow-xs text-on-surface'
                                        : 'text-muted hover:text-on-body hover:bg-hover'
                                }`}>
                                <Package className='w-4 h-4 text-muted' />
                                Sin control
                            </button>
                        </div>
                    </section>

                    <div className='overflow-x-auto px-6 pb-2'>
                        <table className='w-full text-sm overflow-hidden rounded-t-lg'>
                            <thead>
                                <tr className='bg-subtle border-b border-divider text-muted uppercase text-xs tracking-wider'>
                                    {headers.map((header) => (
                                        <th
                                            key={header}
                                            className={`py-3 px-4 font-medium ${header === 'Stock' || header === 'Mínimo' ? 'text-right' : header === 'Acciones' ? 'text-right' : 'text-left'}`}>
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {displayedProducts.map((product) => {
                                    const stock =
                                        product.inventory?.[0]?.stock || 0
                                    const minStock =
                                        product.inventory?.[0]?.min_stock || 0
                                    const isUntracked = product.track_stock === false
                                    const status = getStockStatus(stock, minStock)

                                    return (
                                        <tr
                                            key={product.id}
                                            className='border-b border-divider-light hover:bg-hover cursor-pointer'
                                            onClick={(e) => handleOpenModal(product, e)}>
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
                                            <td
                                                className={`py-3 px-4 text-right font-bold ${isUntracked ? 'text-muted' : status.label === 'Normal' ? 'text-on-body' : 'text-red-600'}`}>
                                                {isUntracked ? '—' : stock}
                                            </td>
                                            <td className='py-3 px-4 text-right text-muted'>
                                                {isUntracked ? '—' : minStock}
                                            </td>
                                            <td className='py-3 px-4 text-right'>
                                                {product.unit_cost != null ? (
                                                    <span className='text-on-body font-medium'>
                                                        ${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(product.unit_cost)}
                                                    </span>
                                                ) : (
                                                    <span className='text-faint italic'>—</span>
                                                )}
                                            </td>
                                            <td className='py-3 px-4 text-right font-bold text-on-surface'>
                                                {!isUntracked && product.unit_cost != null
                                                    ? `$${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(stock * product.unit_cost)}`
                                                    : '—'}
                                            </td>
                                            <td className='py-3 px-4'>
                                                {isUntracked ? (
                                                    <span className='inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-body text-muted'>
                                                        Sin Control
                                                    </span>
                                                ) : (
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${status.cls}`}>
                                                        {status.icon && <AlertCircle className='w-3 h-3' />}
                                                        {status.label}
                                                    </span>
                                                )}
                                            </td>
                                            <td className='py-3 px-2 text-right whitespace-nowrap'>
                                                {!isUntracked && (
                                                    <button
                                                        onClick={(e) =>
                                                            handleOpenModal(product, e)
                                                        }
                                                        className='bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-800 p-1.5 rounded-sm cursor-pointer'
                                                        title='Ajustar Inventario'>
                                                        <Settings2 className='w-4 h-4 text-accent' />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
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
