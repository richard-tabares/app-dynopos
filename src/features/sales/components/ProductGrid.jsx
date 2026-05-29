import { useState } from 'react'
import { useStore } from '../../../app/providers/store'
import { VariationPicker } from './VariationPicker'
import { productHasActiveVariations, getActiveVariations } from '../../../shared/helpers/productHelpers'

export const ProductCard = ({ product, onAddToCart }) => {
    const storeAddToCart = useStore((state) => state.addToCart)
    const cart = useStore((state) => state.cart)
    const addToCart = onAddToCart || storeAddToCart
    const [showVariationPicker, setShowVariationPicker] = useState(false)

    const variations = getActiveVariations(product)
    const hasMultipleVariations = productHasActiveVariations(product)

    const defaultVar = variations[0]
    const noStockControl = product.track_stock === false

    let stockDisplay = null
    if (defaultVar && !hasMultipleVariations) {
        const cartQty = cart.reduce((sum, item) => {
            return item.product_id === product.id ? sum + item.quantity : sum
        }, 0)
        const availStock = defaultVar.stock - cartQty
        stockDisplay = { stock: defaultVar.stock, available: availStock }
    } else if (defaultVar) {
        stockDisplay = { stock: defaultVar.stock, available: defaultVar.stock }
    }

    const handleClick = () => {
        if (hasMultipleVariations) {
            setShowVariationPicker(true)
        } else if (defaultVar) {
            addToCart(product, defaultVar)
        }
    }

    const variationType = product.variation_type || 'Variación'
    const prices = variations.map(v => v.price)
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const priceDisplay = minPrice === maxPrice
        ? `$${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(minPrice)}`
        : `Desde $${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(minPrice)}`

    const isDisabled = !hasMultipleVariations && defaultVar && !noStockControl && (stockDisplay?.available ?? 1) <= 0

    return (
        <>
            <button
                onClick={handleClick}
                disabled={isDisabled}
                className={`bg-surface p-4 rounded-lg border transition-all duration-300 flex items-center justify-between group ${
                    isDisabled
                        ? 'border-divider opacity-50 cursor-not-allowed bg-subtle grayscale' 
                        : 'border-divider hover:border-accent/85 hover:bg-hover cursor-pointer'
                }`}
            >
                <div className='flex items-center gap-4'>
                    <div className='text-left'>
                        <h3 className='font-semibold text-on-surface text-base transition-colors line-clamp-1'>
                            {product.name}
                        </h3>
                        <p className='text-xs text-muted mt-0.5'>
                            {product.categories?.name || 'Sin categoría'}
                        </p>
                    </div>
                </div>
                
                <div className='flex items-center gap-4'>
                    <div className='flex flex-col items-end gap-1'>
                        {hasMultipleVariations && (
                            <span className='text-[10px] px-2 py-0.5 rounded-full font-medium bg-accent/10 text-accent'>
                                {variations.length} {variationType.toLowerCase()}
                            </span>
                        )}
                        {!hasMultipleVariations && defaultVar && (
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                noStockControl
                                    ? 'bg-subtle text-on-body'
                                    : (stockDisplay?.available ?? 0) <= 0
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-green-100 text-green-800'
                            }`}>
                                {noStockControl
                                    ? 'Sin control'
                                    : (stockDisplay?.available ?? 0) <= 0
                                    ? 'Sin Stock'
                                    : `Stock: ${stockDisplay.available}`}
                            </span>
                        )}
                    </div>
                    <p className='text-lg font-bold text-accent'>
                        {priceDisplay}
                    </p>
                </div>
            </button>

            {showVariationPicker && (
                <VariationPicker
                    product={product}
                    onClose={() => setShowVariationPicker(false)}
                />
            )}
        </>
    )
}

export const ProductGrid = ({ products = [], onAddToCart }) => {
    return (
        <div className='flex flex-col gap-3'>
            {products.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
            ))}
        </div>
    )
}
