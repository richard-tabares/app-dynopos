import { useEffect, useState } from 'react'
import { Search, TrendingUp, DollarSign, Bell } from 'lucide-react'
import { toast } from 'react-toastify'
import { useStore } from '../../../app/providers/store'
import { getProducts } from '../../products/helpers/getProducts'
import { getCategories } from '../../products/helpers/getCategories'
import { CategoryTabs } from '../components/CategoryTabs'
import { ProductGrid } from '../components/ProductGrid'
import { OrderSidebar } from '../components/OrderSidebar'
import { createSale } from '../helpers/createSale'

export const Sales = () => {
    const { user, products, setProducts, cart, clearCart } = useStore()
    const [categories, setCategories] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [activeCategory, setActiveCategory] = useState('all')
    const [loading, setLoading] = useState(false)

    const businessId = user?.data?.user?.id
    const userId = user?.data?.user?.id // Assuming user ID is the same as the one stored

    useEffect(() => {
        const loadData = async () => {
            if (!businessId) return
            try {
                const [productsData, categoriesData] = await Promise.all([
                    getProducts(businessId),
                    getCategories(businessId)
                ])
                setProducts(productsData)
                setCategories(categoriesData)
            } catch (error) {
                console.error('Error loading sales data:', error)
                toast.error('Error al cargar datos de venta')
            }
        }
        loadData()
    }, [businessId, setProducts])

    const filteredProducts = products.filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             product.sku.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = activeCategory === 'all' || product.categories?.id === activeCategory
        const isActive = product.is_active !== false

        return matchesSearch && matchesCategory && isActive
    })

    const handleProcessSale = async () => {
        if (cart.length === 0) return

        setLoading(true)
        const saleData = {
            business_id: businessId,
            user_id: userId,
            payment_method: 'Efectivo', // Default for now
            status: 'completed',
            salesItems: cart.map(item => ({
                product_id: item.id,
                quantity: item.quantity
            }))
        }

        try {
            await createSale(saleData)
            toast.success('Venta procesada exitosamente')
            clearCart()
            // Refresh products to update stock
            const productsData = await getProducts(businessId)
            setProducts(productsData)
        } catch (error) {
            toast.error(error.message || 'Error al procesar la venta')
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className='flex flex-col gap-6'>
            <div>
                <h1 className='text-2xl font-bold text-gray-900'>Ventas</h1>
                <p className='text-gray-500'>Gestiona y registra nuevas transacciones</p>
            </div>

            <div className='flex flex-col lg:flex-row gap-8'>
                {/* Main Content: Search, Categories, Products */}
                <div className='flex-1 flex flex-col gap-6'>
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
                        <div className='min-h-[400px]'>
                            {filteredProducts.length === 0 ? (
                                <div className='flex flex-col items-center justify-center py-20 text-gray-400'>
                                    <Search className='w-12 h-12 opacity-20 mb-4' />
                                    <p className='text-lg font-medium'>No se encontraron productos</p>
                                </div>
                            ) : (
                                <ProductGrid products={filteredProducts} />
                            )}
                        </div>
                    </section>
                </div>

                {/* Sidebar: Current Order */}
                <div className='w-full lg:w-96'>
                    <OrderSidebar onProcessSale={handleProcessSale} />
                </div>
            </div>
        </section>
    )
}
