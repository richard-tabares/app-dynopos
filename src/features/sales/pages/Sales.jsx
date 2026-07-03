import { useEffect, useState, useMemo, useRef } from 'react'
import { Search, TrendingUp, DollarSign, Bell, History, X, ChevronDown, AlertTriangle, Trash2 } from 'lucide-react'
import { sileo } from 'sileo'
import { useStore } from '../../../app/providers/store'
import { getProducts } from '../../products/helpers/getProducts'
import { getCategories } from '../../categories/helpers/getCategories'
import { ProductGrid } from '../components/ProductGrid'
import { OrderTabs } from '../components/OrderTabs'
import { OrderSidebar } from '../components/OrderSidebar'
import { VariationPicker } from '../components/VariationPicker'
import { QuantityModal } from '../components/QuantityModal'
import { Modal } from '../../../shared/components/Modal'
import { SaleConfirmationModal } from '../components/SaleConfirmationModal'
import { SalesHistoryCard } from '../components/SalesHistoryCard'
import { apiFetch } from '../../../shared/helpers/apiFetch'
import { normalizeSearch } from '../../../shared/helpers/normalizeSearch'
import { procesarCodigoUniversal } from '../../../shared/helpers/procesarCodigoUniversal'
import { getActiveVariations } from '../../../shared/helpers/productHelpers'
import { createSale } from '../helpers/createSale'
import { getSales } from '../helpers/getSales'
import { returnSale } from '../helpers/returnSale'
import { getTodayRevenue } from '../helpers/getTodayRevenue'
import { checkAgent, getStoredPrinter, printTicket } from '../../../shared/helpers/printEngine'
import { isAndroid, getRawBTBase64, launchRawBT } from '../../../shared/helpers/rawbtPrint'
import { useIsMobileDevice } from '../../../shared/hooks/useIsMobileDevice'

export const Sales = () => {
    const isMobileDevice = useIsMobileDevice()
    const { user, products, setProducts, cart, clearCart, setTodayRevenue, setCategories, setSubscription, setUnitsOfMeasure, addToCart, pendingOrders, currentLabel, initCurrentOrder, holdCurrentOrder, switchToOrder, finalizeCurrentOrder, resetOrderState } = useStore()
    const variableUnitsEnabled = user?.business?.variable_units_enabled ?? false
    const [searchTerm, setSearchTerm] = useState('')
    const searchInputRef = useRef(null)
    const processingSale = useRef(false)
    const [loading, setLoading] = useState(false)
    const [, setLastSaleTicket] = useState(null)
    const [showConfirmationModal, setShowConfirmationModal] = useState(false)
    const [saleSummaryData, setSaleSummaryData] = useState(null)
    const [variationPickerProduct, setVariationPickerProduct] = useState(null)
    const [quantityModalProduct, setQuantityModalProduct] = useState(null)
    const [quantityModalVariation, setQuantityModalVariation] = useState(null)

    const [salesList, setSalesList] = useState([])
    const [visibleCount, setVisibleCount] = useState(10)
    const [showClearModal, setShowClearModal] = useState(false)
    const [saleCompleted, setSaleCompleted] = useState(false)

    const businessId = user?.profile?.business_id || user?.data?.user?.id

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

                if (variableUnitsEnabled) {
                    const unitsResponse = await apiFetch(`${apiUrl}/api/products/units/list`)
                    const units = await unitsResponse.json()
                    if (Array.isArray(units)) {
                        setUnitsOfMeasure(units)
                    }
                }
            } catch (error) {
                console.error('Error loading sales data:', error)
                sileo.error({ fill: 'var(--toast-error)', title: 'Error', description: 'Error al cargar datos de venta'})
            }
        }
        loadData()
    }, [businessId, setProducts, setSubscription, variableUnitsEnabled, setUnitsOfMeasure])

    useEffect(() => {
        const term = searchTerm.trim()
        if (!term || products.length === 0) return

        const { idBusqueda, tipo } = procesarCodigoUniversal(term)
        if (!tipo || !['EAN-13', 'UPC-A', 'EAN-8', 'GS1-Segmentado'].includes(tipo)) return

        const matches = products.flatMap(p =>
            (getActiveVariations(p) || []).map(v => ({ product: p, variation: v }))
        ).filter(({ variation }) => variation.barcode === idBusqueda)

        if (matches.length === 1) {
            const { product, variation } = matches[0]
            if (currentLabel === null) initCurrentOrder()
            addToCart(product, variation)
            setSearchTerm('')
        }
    }, [searchTerm, products, currentLabel, initCurrentOrder, addToCart])

    const filteredProducts = products
        .filter((product) => {
            const term = normalizeSearch(searchTerm)
            const variations = getActiveVariations(product)
            const matchesProduct = normalizeSearch(product.name).includes(term)
            const matchesVariation = variations.some(v =>
                normalizeSearch(v.sku || '').includes(term) ||
                normalizeSearch(procesarCodigoUniversal(v.barcode || '').idBusqueda).includes(term)
            )
            const isActive = product.is_active !== false

            return isActive && (matchesProduct || matchesVariation)
        })
        .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))

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

    const handleLoadMore = () => setVisibleCount((prev) => prev + 10)

    const handleProcessSale = (paymentMethod, total, saleDate) => {
        if (cart.length === 0) {
            sileo.warning({ fill: 'var(--toast-warning)', title: 'Atención', description: 'El carrito está vacío'})
            return
        }
        setSaleSummaryData({ total, paymentMethod, date: saleDate })
        setShowConfirmationModal(true)
    }

    const confirmSaleHandler = async () => {
        if (!saleSummaryData || processingSale.current) return
        processingSale.current = true
        setLoading(true)
        const saleData = {
            business_id: businessId,
            user_id: user?.data?.user?.id,
            payment_method: saleSummaryData.paymentMethod,
            total_amount: saleSummaryData.total,
            status: 'completed',
            created_at: saleSummaryData.date,
            salesItems: cart.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity,
                variation_id: item.variation_id,
                sold_in_unit_id: item.soldInUnitId || null,
                conversion_factor: item.conversionFactor || 1,
            }))
        }

        try {
            const response = await createSale(saleData)
            sileo.success({ fill: 'var(--toast-success)', title: 'Completado', description: 'Venta procesada exitosamente'})

            const sale = response.data

            const autoPrint = async () => {
                const { user: currentUser } = useStore.getState()
                if (!(currentUser?.profile?.thermal_printing_enabled ?? true)) return
                const ticketData = {
                    businessName: currentUser?.business?.business_name || '',
                    printerWidth: currentUser?.profile?.printer_width || 32,
                    ticketNumber: sale.ticket_number,
                    date: sale.created_at?.split('T')[0] || '',
                    paymentMethod: sale.payment_method,
                    salesperson: currentUser?.profile?.full_name || currentUser?.data?.user?.email || '',
                    items: (sale.salesItems || []).map((item, i) => ({
                        name: item.products?.name || '',
                        variationName: item.variation_name || '',
                        quantity: item.quantity || 0,
                        price: item.unit_price || 0,
                        subtotal: item.subtotal || 0,
                        displayUnit: cart[i]?.displayUnit || '',
                        decimalPlaces: 0,
                    })),
                    total: sale.total_amount || 0,
                    footer: currentUser?.business?.ticket_footer || '',
                }
                try {
                    if (isAndroid()) {
                        const base64 = await getRawBTBase64(ticketData)
                        launchRawBT(base64)
                    } else {
                        const agent = await checkAgent()
                        if (!agent) return
                        const printerName = getStoredPrinter()
                        if (!printerName) return
                        await printTicket(printerName, ticketData)
                    }
                } catch {
                    // Silently ignore printer errors in auto-print
                }
            }
            autoPrint()
            setLastSaleTicket({
                id: sale.id,
                total: sale.total_amount,
                date: sale.created_at.split('T')[0],
                paymentMethod: sale.payment_method,
                items: sale.salesItems.map((item, i) => ({
                    quantity: item.quantity,
                    price: item.unit_price,
                    subtotal: item.subtotal,
                    name: item.products?.name || 'Producto',
                    displayUnit: cart[i]?.displayUnit || '',
                    soldInUnitId: cart[i]?.soldInUnitId || null,
                }))
            })

            clearCart()
            finalizeCurrentOrder()

            const [productsData, salesData, revenueData] = await Promise.all([
                getProducts(businessId),
                getSales(businessId),
                getTodayRevenue(businessId)
            ])
            setProducts(productsData)
            setSalesList(salesData)
            setTodayRevenue(revenueData.todayRevenue)
            setSaleCompleted(true)
        } catch (error) {
            sileo.error({ fill: 'var(--toast-error)', title: 'Error', description: error.message || 'Error al procesar la venta'})
        } finally {
            setLoading(false)
            processingSale.current = false
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

    const handleAddProduct = (product, preSelectedVariation = null) => {
        if (currentLabel === null) initCurrentOrder()

        if (preSelectedVariation) {
            const uomId = preSelectedVariation.unit_of_measure_id
            if (variableUnitsEnabled && uomId && uomId !== 1) {
                setQuantityModalProduct(product)
                setQuantityModalVariation(preSelectedVariation)
                return
            }
            addToCart(product, preSelectedVariation)
            return
        }

        const term = searchTerm.trim()
        if (term) {
            const { idBusqueda } = procesarCodigoUniversal(term)
            const variations = getActiveVariations(product)
            const barcodeMatch = variations.find(v => v.barcode === idBusqueda)
            if (barcodeMatch) {
                const uomId = barcodeMatch.unit_of_measure_id
                if (variableUnitsEnabled && uomId && uomId !== 1) {
                    setQuantityModalProduct(product)
                    setQuantityModalVariation(barcodeMatch)
                    return
                }
                addToCart(product, barcodeMatch)
                return
            }
        }

        const variations = getActiveVariations(product)
        if (variations.length === 1) {
            const v = variations[0]
            const uomId = v.unit_of_measure_id
            if (variableUnitsEnabled && uomId && uomId !== 1) {
                setQuantityModalProduct(product)
                setQuantityModalVariation(v)
                return
            }
            addToCart(product, v)
        } else if (variations.length > 1) {
            setVariationPickerProduct(product)
        }
    }

    const handleSelectVariation = (product, variation) => {
        const uomId = variation.unit_of_measure_id
        if (variableUnitsEnabled && uomId && uomId !== 1) {
            setQuantityModalProduct(product)
            setQuantityModalVariation(variation)
        } else {
            addToCart(product, variation)
        }
    }

    return (
        <section className='flex flex-col gap-6'>
            <div className='flex flex-col lg:flex-row gap-8'>
                {/* Left column */}
                <div className='flex-1 flex flex-col gap-6 min-w-0'>
                    <section className='bg-surface p-6 rounded-lg border border-outline shadow-xs flex flex-col gap-6'>
                        {/* Order Tabs */}
                        <OrderTabs
                            pendingOrders={pendingOrders}
                            currentLabel={currentLabel}
                            onSelect={switchToOrder}
                            onNewOrder={holdCurrentOrder}
                            onClearAll={() => setShowClearModal(true)}
                        />

                        {/* Search Bar */}
                        <div className='flex flex-col gap-3'>
                            <div className='relative'>
                                <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-faint' />
                                <input
                                    ref={searchInputRef}
                                    type='search'
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && searchTerm.trim()) {
                                            e.preventDefault()
                                            const entrada = searchTerm.trim()
                                            const codigoNormalizado = procesarCodigoUniversal(entrada).idBusqueda
                                            const isBarcode = /^\d{8,14}$/.test(entrada)
                                            if (isBarcode) {
                                                const found = products.flatMap(p =>
                                                    (getActiveVariations(p) || []).map(v => ({ product: p, variation: v }))
                                                ).find(({ variation }) => variation.barcode === codigoNormalizado)
                                                if (found) {
                                                    handleAddProduct(found.product, found.variation)
                                                    setSearchTerm('')
                                                    return
                                                }
                                            }
                                            if (filteredProducts.length === 1) {
                                                handleAddProduct(filteredProducts[0])
                                                setSearchTerm('')
                                            }
                                        }
                                    }}
                                    placeholder='Buscar por código o nombre...'
                                    className='w-full border border-divider rounded-md pl-10 pr-3 py-3 text-sm focus:outline-none focus:border-accent focus:ring-0 transition-all duration-300'
                                    autoFocus={!isMobileDevice}
                                />
                            </div>
                            {searchTerm.trim() && (
                                <button
                                    onClick={() => { setSearchTerm(''); setVisibleCount(10); searchInputRef.current?.focus() }}
                                    className='flex items-center gap-2 px-3 py-1.5 bg-accent self-start text-sm font-medium rounded-md transition-colors cursor-pointer text-surface hover:bg-accent/85'
                                >
                                    <X className='w-4 h-4' />
                                    Limpiar búsqueda
                                </button>
                            )}
                        </div>
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
                                        <ProductGrid products={displayedProducts} onAddToCart={handleAddProduct} />
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
                                    <ProductGrid products={recentlySoldProducts} onAddToCart={handleAddProduct} />
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
                    onCancel={() => {
                        setShowConfirmationModal(false)
                        setSaleSummaryData(null)
                        setSaleCompleted(false)
                    }}
                    loading={loading}
                    saleCompleted={saleCompleted}
                />
            )}

            {variationPickerProduct && (
                <VariationPicker
                    product={variationPickerProduct}
                    onClose={() => setVariationPickerProduct(null)}
                    onSelectVariation={handleSelectVariation}
                />
            )}

            {quantityModalProduct && quantityModalVariation && (
                <QuantityModal
                    product={quantityModalProduct}
                    variation={quantityModalVariation}
                    onClose={() => {
                        setQuantityModalProduct(null)
                        setQuantityModalVariation(null)
                    }}
                />
            )}

            {showClearModal && (
                <Modal
                    onClose={() => setShowClearModal(false)}
                    title='Limpiar órdenes'
                    icon={AlertTriangle}
                    iconColor='text-red-600'
                    size='sm'
                >
                    <div className='p-6'>
                        <p className='text-on-body text-sm mb-6'>
                            ¿Estás seguro de limpiar todas las órdenes? Se perderán las órdenes en espera y la orden actual.
                        </p>
                        <div className='flex gap-3 w-full'>
                            <button
                                onClick={() => setShowClearModal(false)}
                                className='flex-1 px-4 py-2 border border-outline text-on-body hover:bg-hover font-semibold rounded-lg transition cursor-pointer'
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => {
                                    resetOrderState()
                                    setShowClearModal(false)
                                }}
                                className='flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 cursor-pointer'
                            >
                                <Trash2 className='w-5 h-5' />
                                Limpiar
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

        </section>
    )
}
