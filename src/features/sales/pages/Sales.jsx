import { useEffect, useState, useMemo } from 'react'
import { Search, TrendingUp, DollarSign, Bell, History, X, ChevronDown } from 'lucide-react'
import { sileo } from 'sileo'
import { useStore } from '../../../app/providers/store'
import { getProducts } from '../../products/helpers/getProducts'
import { getCategories } from '../../categories/helpers/getCategories'
// import { CategoryTabs } from '../components/CategoryTabs'
import { ProductGrid } from '../components/ProductGrid'
import { OrderSidebar } from '../components/OrderSidebar'
import { SaleConfirmationModal } from '../components/SaleConfirmationModal'
import { SalesHistoryCard } from '../components/SalesHistoryCard'
import { apiFetch } from '../../../shared/helpers/apiFetch'
import { createSale } from '../helpers/createSale'
import { getSales } from '../helpers/getSales'
import { returnSale } from '../helpers/returnSale'
import { getTodayRevenue } from '../helpers/getTodayRevenue'

export const Sales = () => {
    const { user, products, setProducts, cart, clearCart, setTodayRevenue, setCategories, setSubscription, addToCart } = useStore()
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(false)
    const [, setLastSaleTicket] = useState(null)
    const [showConfirmationModal, setShowConfirmationModal] = useState(false)
    const [saleSummaryData, setSaleSummaryData] = useState(null)

    const [salesList, setSalesList] = useState([])

    const [visibleCount, setVisibleCount] = useState(10)

    const businessId = user?.data?.user?.id

    useEffect(() => {
        const loadData = async () => {
            if (!businessId) return
            try {
                const [productsData, categoriesData, salesData] = await Promise.all([
                    getProducts(businessId),
                    getCategories(businessId),
                    getSales(businessId)
                ])
                setProducts(productsData)
                setCategories(categoriesData)
                setSalesList(salesData)

                const apiUrl = import.meta.env.VITE_API_URL
                const subResponse = await apiFetch(`${apiUrl}/api/billing/${businessId}`)
                const subResult = await subResponse.json()
                if (subResult.data) {
                    setSubscription(subResult.data)
                }
            } catch (error) {
                console.error('Error loading sales data:', error)
                sileo.error({ fill: 'var(--toast-error)', title: 'Error', description: 'Error al cargar datos de venta'})
            }
        }
        loadData()
    }, [businessId, setProducts, setSubscription])

    const filteredProducts = products
        .filter((product) => {
            const term = searchTerm.toLowerCase()
            const matchesSearch = product.name.toLowerCase().includes(term) || 
                                 product.sku.toLowerCase().includes(term) ||
                                 (product.barcode && product.barcode.toLowerCase().includes(term))
            const isActive = product.is_active !== false

            return matchesSearch && isActive
        })
        .sort((a, b) => {
            // Sort by ID descending (assuming larger ID = more recent, or use created_at if available)
            // Ideally, use a 'created_at' date if it exists in your product object.
            // For now, assuming newer products are added to the end of the array or have higher IDs.
            // Adjust this if you have a specific 'date_added' or 'created_at' field.
            return (b.id > a.id) ? 1 : ((b.id < a.id) ? -1 : 0)
        })

    const displayedProducts = filteredProducts.slice(0, visibleCount)

    const recentlySoldProducts = useMemo(() => {
        const seen = new Set()
        const result = []
        for (const sale of salesList) {
            if (!sale.items) continue
            for (const item of sale.items) {
                if (!seen.has(item.product_id)) {
                    seen.add(item.product_id)
                    const fullProduct = products.find(p => p.id === item.product_id)
                    if (fullProduct) {
                        result.push(fullProduct)
                    }
                    if (result.length >= 10) break
                }
            }
            if (result.length >= 10) break
        }
        return result
    }, [salesList, products])

    const handleLoadMore = () => {
        setVisibleCount((prev) => prev + 10)
    }

    const handleProcessSale = (paymentMethod, total, saleDate) => {
        if (cart.length === 0) {
            sileo.warning({ fill: 'var(--toast-warning)', title: 'Atención', description: 'El carrito está vacío'})
            return
        }

        setSaleSummaryData({
            total,
            paymentMethod,
            date: saleDate
        })
        setShowConfirmationModal(true)
    }

    const confirmSaleHandler = async () => {
        if (!saleSummaryData) return

        setLoading(true)
        const saleData = {
            business_id: businessId,
            user_id: user?.data?.user?.id,
            payment_method: saleSummaryData.paymentMethod,
            total_amount: saleSummaryData.total,
            status: 'completed',
            created_at: saleSummaryData.date,
            salesItems: cart.map(item => ({
                product_id: item.id,
                quantity: item.quantity
            }))
        }

        try {
            const response = await createSale(saleData)
            sileo.success({ fill: 'var(--toast-success)', title: 'Completado', description: 'Venta procesada exitosamente'})
            
            // Prepare ticket data from response
            const sale = response.data
            setLastSaleTicket({
                id: sale.id,
                total: sale.total_amount,
                date: sale.created_at.split('T')[0], // Extract only date
                paymentMethod: sale.payment_method,
                items: sale.salesItems.map(item => ({
                    quantity: item.quantity,
                    price: item.unit_price,
                    subtotal: item.subtotal,
                    name: item.products?.name || 'Producto'
                }))
            })
            
            clearCart()

            const [productsData, salesData, revenueData] = await Promise.all([
                getProducts(businessId),
                getSales(businessId),
                getTodayRevenue(businessId)
            ])
            setProducts(productsData)
            setSalesList(salesData)
            setTodayRevenue(revenueData.todayRevenue)
            setShowConfirmationModal(false)
            setSaleSummaryData(null)
        } catch (error) {
            sileo.error({ fill: 'var(--toast-error)', title: 'Error', description: error.message || 'Error al procesar la venta'})
        } finally {
            setLoading(false)
        }
    }

    const handleReturnSale = async (sale, reason, items) => {
        try {
            await returnSale(sale.id, { reason, businessId, items })
            sileo.success({ fill: 'var(--toast-success)', title: 'Completado', description: 'Devolución procesada exitosamente'})

            const [salesData, productsData, revenueData] = await Promise.all([
                getSales(businessId),
                getProducts(businessId),
                getTodayRevenue(businessId)
            ])
            setSalesList(salesData)
            setProducts(productsData)
            setTodayRevenue(revenueData.todayRevenue)
        } catch (error) {
            sileo.error({ fill: 'var(--toast-error)', title: 'Error', description: error.message || 'Error al procesar la devolución'})
            throw error
        }
    }

    const handleSaleUpdated = async () => {
        const [salesData, revenueData] = await Promise.all([
            getSales(businessId),
            getTodayRevenue(businessId)
        ])
        setSalesList(salesData)
        setTodayRevenue(revenueData.todayRevenue)
    }

    return (
        <section className='flex flex-col gap-6'>
            <div className='flex flex-col lg:flex-row gap-8'>
                {/* Left column */}
                <div className='flex-1 flex flex-col gap-6 min-w-0'>
                    <section className='bg-surface p-6 rounded-lg border border-outline shadow-xs flex flex-col gap-6'>
                        {/* Search Bar */}
                        <div className='flex flex-col gap-3'>
                            <div className='relative'>
                                <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-faint' />
                                <input
                                    type='search'
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && searchTerm.trim() && filteredProducts.length === 1) {
                                            e.preventDefault()
                                            addToCart(filteredProducts[0])
                                            setSearchTerm('')
                                        }
                                    }}
                                    placeholder='Buscar por código o nombre...'
                                    className='w-full border border-divider rounded-md pl-10 pr-3 py-3 text-sm focus:outline-none focus:border-accent focus:ring-0 transition-all duration-300'
                                    autoFocus
                                />
                            </div>
                            {searchTerm.trim() && (
                                <button
                                    onClick={() => { setSearchTerm(''); setVisibleCount(10) }}
                                    className='flex items-center gap-2 px-3 py-1.5 bg-accent self-start text-sm font-medium rounded-md transition-colors cursor-pointer text-surface hover:bg-accent/85'
                                >
                                    <X className='w-4 h-4' />
                                    Limpiar búsqueda
                                </button>
                            )}
                        </div>

                        {/* Category Filters */}
                        {/* <CategoryTabs 
                            categories={categories} 
                            activeCategory={activeCategory} 
                            onSelectCategory={setActiveCategory} 
                        /> */}

                        {/* Product Grid */}
                        <div className='min-h-100'>
                            {searchTerm.trim() ? (
                                filteredProducts.length === 0 ? (
                                    <div className='flex flex-col items-center justify-center py-20 text-faint'>
                                        <Search className='w-12 h-12 opacity-20 mb-4' />
                                        <p className='text-lg font-medium'>No se encontraron productos</p>
                                    </div>
                                ) : (
                                    <>
                                        <ProductGrid products={displayedProducts} />
                                        {visibleCount < filteredProducts.length && (
                                            <button
                                                onClick={handleLoadMore}
                                                className='w-full mt-4 py-2 text-sm font-medium text-on-surface hover:text-surface hover:bg-accent rounded-lg border border-accent transition-colors cursor-pointer flex items-center justify-center gap-2'
                                            >
                                                <ChevronDown className='w-4 h-4' /> Cargar más ({filteredProducts.length - visibleCount} restantes)
                                            </button>
                                        )}
                                    </>
                                )
                            ) : recentlySoldProducts.length > 0 ? (
                                <div className='flex flex-col gap-3'>
                                    <div className='flex items-center gap-2 text-xs text-muted font-medium'>
                                        <History className='w-3.5 h-3.5' />
                                        Últimos productos vendidos
                                    </div>
                                    <ProductGrid products={recentlySoldProducts} />
                                </div>
                            ) : (
                                <div className='flex flex-col items-center justify-center py-20 text-faint'>
                                    <Search className='w-12 h-12 opacity-20 mb-4' />
                                    <p className='text-lg font-medium'>Busca productos</p>
                                    <p className='text-sm text-faint mt-1'>Los productos aparecerán aquí</p>
                                </div>
                            )}
                        </div>
                    </section>

                    <div className='hidden lg:block'>
                        <SalesHistoryCard
                            sales={salesList}
                            onReturn={handleReturnSale}
                            onSaleUpdated={handleSaleUpdated}
                        />
                    </div>
                </div>

                {/* Sidebar: Current Order */}
                <div className='w-full lg:w-100 shrink-0 flex flex-col gap-6'>
                    <OrderSidebar onProcessSale={handleProcessSale} />
                    <div className='lg:hidden'>
                        <SalesHistoryCard
                            sales={salesList}
                            onReturn={handleReturnSale}
                            onSaleUpdated={handleSaleUpdated}
                        />
                    </div>
                </div>
            </div>

            {showConfirmationModal && saleSummaryData && (
                <SaleConfirmationModal
                    orderSummary={saleSummaryData}
                    onConfirm={confirmSaleHandler}
                    onCancel={() => setShowConfirmationModal(false)}
                    loading={loading}
                />
            )}

        </section>
    )
}
