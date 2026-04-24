import { useEffect, useState } from 'react'
import { Search, TrendingUp, DollarSign, Bell } from 'lucide-react'
import { toast } from 'react-toastify'
import { useStore } from '../../../app/providers/store'
import { getProducts } from '../../products/helpers/getProducts'
import { getCategories } from '../../products/helpers/getCategories'
import { CategoryTabs } from '../components/CategoryTabs'
import { ProductGrid } from '../components/ProductGrid'
import { OrderSidebar } from '../components/OrderSidebar'
import { SaleConfirmationModal } from '../components/SaleConfirmationModal'
import { SaleTicketModal } from '../../../shared/components/SaleTicketModal'
import { SalesHistoryCard } from '../components/SalesHistoryCard'
import { createSale } from '../helpers/createSale'
import { getSales } from '../helpers/getSales'
import { returnSale } from '../helpers/returnSale'
import { getDashboardData } from '../../dashboard/helpers/getDashboardData'

export const Sales = () => {
    const { user, products, setProducts, cart, clearCart, setTodayRevenue } = useStore()
    const [categories, setCategories] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [activeCategory, setActiveCategory] = useState('all')
    const [loading, setLoading] = useState(false)
    const [showConfirmationModal, setShowConfirmationModal] = useState(false)
    const [saleSummaryData, setSaleSummaryData] = useState(null)
    const [lastSaleTicket, setLastSaleTicket] = useState(null)
    const [showTicketModal, setShowTicketModal] = useState(false)

    const [salesList, setSalesList] = useState([])

    const [visibleCount, setVisibleCount] = useState(10)

    const businessId = user?.data?.user?.id
    // const userId = user?.data?.user?.id // Assuming user ID is the same as the one stored

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
            } catch (error) {
                console.error('Error loading sales data:', error)
                toast.error('Error al cargar datos de venta')
            }
        }
        loadData()
    }, [businessId, setProducts])

    const filteredProducts = products
        .filter((product) => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 product.sku.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesCategory = activeCategory === 'all' || product.categories?.id === activeCategory
            const isActive = product.is_active !== false

            return matchesSearch && matchesCategory && isActive
        })
        .sort((a, b) => {
            // Sort by ID descending (assuming larger ID = more recent, or use created_at if available)
            // Ideally, use a 'created_at' date if it exists in your product object.
            // For now, assuming newer products are added to the end of the array or have higher IDs.
            // Adjust this if you have a specific 'date_added' or 'created_at' field.
            return (b.id > a.id) ? 1 : ((b.id < a.id) ? -1 : 0)
        })

    const displayedProducts = filteredProducts.slice(0, visibleCount)

    const handleLoadMore = () => {
        setVisibleCount((prev) => prev + 10)
    }

    const handleProcessSale = (paymentMethod, total) => {
        if (cart.length === 0) {
            toast.warn('El carrito está vacío')
            return
        }

        setSaleSummaryData({
            total,
            paymentMethod
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
            salesItems: cart.map(item => ({
                product_id: item.id,
                quantity: item.quantity
            }))
        }

        try {
            const response = await createSale(saleData)
            toast.success('Venta procesada exitosamente')
            
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

            const [productsData, salesData, dashboardData] = await Promise.all([
                getProducts(businessId),
                getSales(businessId),
                getDashboardData(businessId)
            ])
            setProducts(productsData)
            setSalesList(salesData)
            setTodayRevenue(dashboardData.metrics.todayRevenue)
            setShowConfirmationModal(false)
            setSaleSummaryData(null)
            setShowTicketModal(true) // Show ticket after success
        } catch (error) {
            toast.error(error.message || 'Error al procesar la venta')
        } finally {
            setLoading(false)
        }
    }

    const handleReturnSale = async (sale, reason, items) => {
        try {
            await returnSale(sale.id, { reason, businessId, items })
            toast.success('Devolución procesada exitosamente')

            const [salesData, productsData, dashboardData] = await Promise.all([
                getSales(businessId),
                getProducts(businessId),
                getDashboardData(businessId)
            ])
            setSalesList(salesData)
            setProducts(productsData)
            setTodayRevenue(dashboardData.metrics.todayRevenue)
        } catch (error) {
            toast.error(error.message || 'Error al procesar la devolución')
        }
    }

    return (
        <section className='flex flex-col gap-6'>
            <div className='flex flex-col lg:flex-row gap-8'>
                {/* Main Content: Search, Categories, Products */}
                <div className='flex-1 flex flex-col gap-6 order-1 lg:order-1'>
                    <section className='bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-6'>
                        {/* Search Bar */}
                        <div className='relative'>
                            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                            <input
                                type='search'
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder='Buscar por nombre o código...'
                                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-0'
                            />
                        </div>

                        {/* Category Filters */}
                        <CategoryTabs 
                            categories={categories} 
                            activeCategory={activeCategory} 
                            onSelectCategory={setActiveCategory} 
                        />

                        {/* Product Grid */}
                        <div className='min-h-100'>
                            {filteredProducts.length === 0 ? (
                                <div className='flex flex-col items-center justify-center py-20 text-gray-400'>
                                    <Search className='w-12 h-12 opacity-20 mb-4' />
                                    <p className='text-lg font-medium'>No se encontraron productos</p>
                                </div>
                            ) : (
                                <>
                                    <ProductGrid products={displayedProducts} />
                                    {visibleCount < filteredProducts.length && (
                                        <div className='mt-6 flex justify-center'>
                                            <button
                                                onClick={handleLoadMore}
                                                className='px-6 py-2 bg-gray-50 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition border border-gray-200 shadow-sm'
                                            >
                                                Cargar más productos
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </section>

                    <SalesHistoryCard
                        sales={salesList}
                        onReturn={handleReturnSale}
                    />
                </div>

                {/* Sidebar: Current Order */}
                <div className='w-full lg:w-100 order-2 lg:order-2'>
                    <OrderSidebar onProcessSale={handleProcessSale} />
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

            <SaleTicketModal 
                isOpen={showTicketModal}
                onClose={() => setShowTicketModal(false)}
                sale={lastSaleTicket}
            />
        </section>
    )
}
