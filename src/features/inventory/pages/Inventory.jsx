import { useEffect, useState } from 'react'
import { Package, Search, AlertCircle, Settings2 } from 'lucide-react'
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
    const [visibleCount, setVisibleCount] = useState(20)

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

    const activeProducts = products.filter(p => p.is_active !== false)

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
        setVisibleCount((prev) => prev + 20)
    }

    const headers = [
        'Código',
        'Producto',
        'Categoría',
        'Stock',
        'Mínimo',
        'Estado',
        'Acciones',
    ]

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
                    <p className='text-gray-600'>
                        Controla las existencias de tus productos y configura
                        alertas de stock bajo.
                    </p>
                </section>

                <InventorySummary products={activeProducts} />

                <section className='bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden'>
                    {/* Header de la tabla */}
                    <section className='border-b border-gray-300 flex justify-between items-center px-6 py-4 bg-gray-50/50'>
                        <h2 className='text-lg font-semibold flex items-center gap-2'>
                            <Package className='w-5 h-5 text-primary-600' />
                            Control de Stock
                        </h2>
                    </section>

                    {/* Buscador y Filtros */}
                    <section className='px-6 py-4 border-b border-gray-200 flex flex-col gap-4'>
                        <div className='relative'>
                            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                            <input
                                type='search'
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value)
                                    setVisibleCount(20)
                                }}
                                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all'
                                placeholder='Buscar por nombre o código de barras...'
                            />
                        </div>
                        <div className='flex gap-2'>
                            <button
                                onClick={() => setFilterStatus('all')}
                                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer border ${
                                    filterStatus === 'all'
                                        ? 'bg-primary-600 text-white border-primary-600'
                                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                }`}>
                                Todos
                            </button>
                            <button
                                onClick={() => setFilterStatus('lowStock')}
                                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer border ${
                                    filterStatus === 'lowStock'
                                        ? 'bg-amber-600 text-white border-amber-600'
                                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                }`}>
                                Stock Bajo
                            </button>
                            <button
                                onClick={() => setFilterStatus('withStock')}
                                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer border ${
                                    filterStatus === 'withStock'
                                        ? 'bg-emerald-600 text-white border-emerald-600'
                                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                }`}>
                                Con Stock
                            </button>
                        </div>
                    </section>

                    {/* Tabla */}
                    <div className='overflow-x-auto'>
                        <table className='w-full text-left'>
                            <thead className='bg-gray-100 border-b border-gray-300'>
                                <tr>
                                    {headers.map((header) => (
                                        <th
                                            key={header}
                                            className='px-6 py-4 text-xs font-bold text-gray-600 uppercase tracking-wider'>
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className='divide-y divide-gray-200'>
                                {displayedProducts.map((product) => {
                                    const stock =
                                        product.inventory?.[0]?.stock || 0
                                    const minStock =
                                        product.inventory?.[0]?.min_stock || 0
                                    const isLowStock = stock <= minStock

                                    return (
                                        <tr
                                            key={product.id}
                                            className='hover:bg-gray-50 transition-colors'>
                                            <td className='px-6 py-4 text-sm font-medium text-gray-900'>
                                                {product.sku}
                                            </td>
                                            <td className='px-6 py-4 text-sm text-gray-700'>
                                                {product.name}
                                            </td>
                                            <td className='px-6 py-4 text-sm text-gray-500'>
                                                {product.categories?.name ||
                                                    'Sin categoría'}
                                            </td>
                                            <td
                                                className={`px-6 py-4 text-sm font-bold ${isLowStock ? 'text-red-600' : 'text-gray-700'}`}>
                                                {stock}
                                            </td>
                                            <td className='px-6 py-4 text-sm text-gray-500'>
                                                {minStock}
                                            </td>
                                            <td className='px-6 py-4'>
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
                                            <td className='px-6 py-4'>
                                                <button
                                                    onClick={() =>
                                                        handleOpenModal(product)
                                                    }
                                                    className='hover:bg-gray-200 p-2 rounded-sm cursor-pointer text-primary-600'
                                                    title='Ajustar Inventario'>
                                                    <Settings2 className='w-4 h-4' />
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer / Cargar más */}
                    {visibleCount < filteredProducts.length && (
                        <div className='p-6 bg-gray-50 border-t border-gray-200 flex justify-center'>
                            <button
                                onClick={handleLoadMore}
                                className='px-6 py-2 bg-white text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition border border-gray-300 shadow-sm'>
                                Cargar más productos
                            </button>
                        </div>
                    )}

                    {filteredProducts.length === 0 && (
                        <div className='p-12 text-center'>
                            <Package className='w-12 h-12 text-gray-300 mx-auto mb-4' />
                            <p className='text-gray-500 font-medium'>
                                No se encontraron productos
                            </p>
                        </div>
                    )}
                </section>
            </section>
        </>
    )
}
