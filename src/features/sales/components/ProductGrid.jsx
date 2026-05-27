import { useState } from 'react'
import { useStore } from '../../../app/providers/store'
import { VariationPicker } from './VariationPicker'

export const ProductCard = ({ product, onAddToCart }) => {
    const storeAddToCart = useStore((state) => state.addToCart)
    const cart = useStore((state) => state.cart)
    const addToCart = onAddToCart || storeAddToCart
    const [showVariationPicker, setShowVariationPicker] = useState(false)

    const hasVariations = product.product_variations?.length > 0
    const originalStock = product.inventory?.[0]?.stock || 0
    const cartQuantity = cart.find(item => item.product_id === product.id)?.quantity || 0
    const availableStock = originalStock - cartQuantity
    const noStockControl = product.track_stock === false

    const handleClick = () => {
        if (hasVariations) {
            setShowVariationPicker(true)
        } else {
            addToCart(product)
        }
    }

    const variationType = product.variation_type || 'Variación'
    const priceDisplay = hasVariations
        ? (() => {
              const prices = product.product_variations
                  .filter(v => v.is_active !== false)
                  .map(v => v.price)
              const min = Math.min(...prices)
              const max = Math.max(...prices)
              return min === max
                  ? `$${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(min)}`
                  : `Desde $${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(min)}`
          })()
        : `$${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(product.price)}`

    return (
        <>
            <button
                onClick={handleClick}
                disabled={!hasVariations && !noStockControl && availableStock <= 0}
                className={`bg-surface p-4 rounded-lg border transition-all duration-300 flex items-center justify-between group ${
                    !hasVariations && !noStockControl && availableStock <= 0
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
                        {hasVariations && (
                            <span className='text-[10px] px-2 py-0.5 rounded-full font-medium bg-accent/10 text-accent'>
                                {product.product_variations.length} {variationType.toLowerCase()}
                            </span>
                        )}
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            hasVariations
                                ? 'bg-subtle text-on-body'
                                : noStockControl
                                ? 'bg-subtle text-on-body'
                                : availableStock <= 0
                                ? 'bg-red-100 text-red-800'
                                : 'bg-green-100 text-green-800'
                        }`}>
                            {hasVariations
                                ? `${variationType}s`
                                : noStockControl
                                ? 'Sin control'
                                : availableStock <= 0
                                ? 'Sin Stock'
                                : `Stock: ${availableStock}`}
                        </span>
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
