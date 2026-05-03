import { useEffect, useState } from 'react'
import { Package, Search, AlertCircle, Settings2, AlertTriangle, PackageCheck, Layers } from 'lucide-react'
import { toast } from 'react-toastify'
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

    const businessId = user?.data?.user?.id

    useEffect(() => {
        const loadInventory = async () => {
            if (!businessId) return
            try {
                const data = await getProducts(businessId)
                setProducts(data)
            } catch (error) {
                toast.error(error.message || 'Error al cargar el inventario')
            }
        }
        loadInventory()
    }, [businessId, setProducts])

    const activeProducts = products.filter(p => p.is_active !== false && p.track_stock !== false)

    const noStockControlProducts = products.filter(p => p.is_active !== false && p.track_stock === false)

    const filteredProducts = activeProducts.filter((product) => {
        const matchesSearch =
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.sku.toLowerCase().includes(searchTerm.toLowerCase())

        const stock = product.inventory?.[0]?.stock || 0
        const minStock = product.inventory?.[0]?.min_stock || 0

        let matchesFilter = true
        if (filterStatus === 'lowStock') {
            matchesFilter = stock <= minStock
        } else if (filterStatus === 'withStock') {
            matchesFilter = stock > 0
        }

        return matchesSearch && matchesFilter
    })

    const displayedProducts = filteredProducts.slice(0, visibleCount)

    const handleOpenModal = (product) => {
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
                toast.success('Inventario actualizado correctamente')
                handleCloseModal()
            } else {
                toast.error('No se pudo actualizar el inventario')
            }
        } catch (error) {
            toast.error(error.message || 'Error de red al actualizar el inventario')
        }
    }

    const handleLoadMore = () => {
        setVisibleCount((prev) => prev + 10)
    }

    const headers = filterStatus === 'noStockControl'
        ? ['Código', 'Producto', 'Categoría']
        : ['Código', 'Producto', 'Categoría', 'Stock', 'Mínimo', 'Estado', 'Acciones']

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
                            <Package className='w-5 h-5 text-primary-600' />
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
                                className='w-full border border-outline rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500'
                                placeholder='Buscar por nombre o código de barras...'
                            />
                        </div>
                        <div className='flex gap-2 bg-subtle dark:bg-gray-900 rounded-lg p-1 w-fit max-w-full overflow-x-auto scrollbar-none'>
                            <button
                                onClick={() => setFilterStatus('all')}
                                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                                    filterStatus === 'all'
                                        ? 'bg-surface shadow-xs text-on-surface'
                                        : 'text-muted hover:text-on-body hover:bg-hover'
                                }`}>
                                <Layers className='w-4 h-4 text-primary-600' />
                                Todos
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
                                {(filterStatus === 'noStockControl' ? noStockControlProducts : displayedProducts).map((product) => {
                                    const stock =
                                        product.inventory?.[0]?.stock || 0
                                    const minStock =
                                        product.inventory?.[0]?.min_stock || 0
                                    const isLowStock = stock <= minStock

                                    return filterStatus === 'noStockControl' ? (
                                        <tr
                                            key={product.id}
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
                                        </tr>
                                    ) : (
                                        <tr
                                            key={product.id}
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
                                            <td
                                                className={`py-3 px-4 text-right font-bold ${isLowStock ? 'text-red-600' : 'text-on-body'}`}>
                                                {stock}
                                            </td>
                                            <td className='py-3 px-4 text-right text-muted'>
                                                {minStock}
                                            </td>
                                            <td className='py-3 px-4'>
                                                {isLowStock ? (
                                                    <span className='inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800'>
                                                        <AlertCircle className='w-3 h-3' />
                                                        Bajo
                                                    </span>
                                                ) : (
                                                    <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                                                        Normal
                                                    </span>
                                                )}
                                            </td>
                                            <td className='py-3 px-2 text-right whitespace-nowrap'>
                                                <button
                                                    onClick={() =>
                                                        handleOpenModal(product)
                                                    }
                                                    className='bg-gray-100 dark:bg-gray-700 hover:bg-hover-strong p-1.5 rounded-sm cursor-pointer'
                                                    title='Ajustar Inventario'>
                                                    <Settings2 className='w-4 h-4 text-primary-600' />
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                    {filterStatus !== 'noStockControl' && visibleCount < filteredProducts.length && (
                        <button
                            onClick={handleLoadMore}
                            className='w-full mt-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition cursor-pointer px-6'>
                            Cargar más ({filteredProducts.length - visibleCount} restantes)
                        </button>
                    )}

                    {filterStatus === 'noStockControl' ? (
                        noStockControlProducts.length === 0 && (
                            <div className='text-center text-faint italic py-12 px-6'>
                                No hay productos sin control de stock
                            </div>
                        )
                    ) : filteredProducts.length === 0 && (
                        <div className='text-center text-faint italic py-12 px-6'>
                            No se encontraron productos
                        </div>
                    )}
                </section>
            </section>
        </>
    )
}
