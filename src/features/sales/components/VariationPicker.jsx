import { X, ShoppingCart } from 'lucide-react'
import { useEscape } from '../../../shared/helpers/useEscape'
import { useStore } from '../../../app/providers/store'
import { getActiveVariations } from '../../../shared/helpers/productHelpers'

export const VariationPicker = ({ product, onClose }) => {
    const addToCart = useStore((state) => state.addToCart)
    const cart = useStore((state) => state.cart)
    const currentLabel = useStore((state) => state.currentLabel)
    const initCurrentOrder = useStore((state) => state.initCurrentOrder)

    useEscape(onClose)

    if (!product) return null

    const variationType = product.variation_type || 'Variación'

    const getAvailableStock = (variation) => {
        const cartKey = `${product.id}-${variation.id}`
        const inCart = cart.find((item) => item.cartKey === cartKey)
        const cartQty = inCart?.quantity || 0
        return (variation.stock || 0) - cartQty
    }

    const handleSelect = (variation) => {
        if (currentLabel === null) {
            initCurrentOrder()
        }
        addToCart(product, variation)
        onClose()
    }

    return (
        <section
            className='fixed inset-0 bg-overlay backdrop-blur-xs w-full h-full flex flex-col items-center justify-center z-[70] p-4'>
            <section
                className='bg-surface border border-outline rounded-xl w-full max-w-sm relative max-h-[90vh] overflow-y-auto scrollbar-none'
                onClick={(e) => e.stopPropagation()}>
                <section className='sticky top-0 bg-title-surface/50 backdrop-blur-3xl z-50 flex items-center justify-between px-6 py-3.5 border-b border-divider'>
                    <h2 className='text-lg font-semibold flex items-center gap-2'>
                        <ShoppingCart className='w-5 h-5 text-accent' />
                        {product.name}
                    </h2>
                    <button
                        onClick={onClose}
                        className='p-1 rounded-md text-accent hover:text-accent/85 border border-disabled hover:border-accent transition cursor-pointer'>
                        <X className='w-5 h-5' />
                    </button>
                </section>

                <div className='p-6'>
                    <p className='text-sm text-muted mb-4'>
                        Selecciona {variationType.toLowerCase()}
                    </p>

                    <div className='flex flex-col gap-3'>
                        {getActiveVariations(product).map((variation) => {
                                const availableStock = getAvailableStock(variation)
                                const noStockControl = variation.track_stock === false
                                const outOfStock = !noStockControl && availableStock <= 0

                                return (
                                    <button
                                        key={variation.id}
                                        onClick={() => handleSelect(variation)}
                                        disabled={outOfStock}
                                        className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-300 cursor-pointer ${
                                            outOfStock
                                                ? 'border-divider opacity-50 cursor-not-allowed bg-subtle grayscale'
                                                : 'border-divider hover:border-accent/85 hover:bg-hover'
                                        }`}>
                                        <div className='text-left'>
                                            <h3 className='font-semibold text-on-surface'>
                                                {variation.variation_name}
                                            </h3>
                                            {variation.sku && (
                                                <p className='text-xs text-muted mt-0.5'>
                                                    SKU: {variation.sku}
                                                </p>
                                            )}
                                        </div>
                                        <div className='flex items-center gap-3'>
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                                noStockControl
                                                    ? 'bg-subtle text-on-body'
                                                    : availableStock <= 0
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-green-100 text-green-800'
                                            }`}>
                                                {noStockControl
                                                    ? 'Sin control'
                                                    : availableStock <= 0
                                                    ? 'Sin Stock'
                                                    : `Stock: ${availableStock}`}
                                            </span>
                                            <p className='text-lg font-bold text-accent whitespace-nowrap'>
                                                ${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(variation.price)}
                                            </p>
                                        </div>
                                    </button>
                                )
                            })}
                    </div>
                </div>
            </section>
        </section>
    )
}
