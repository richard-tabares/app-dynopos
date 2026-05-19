import { useStore } from '../../../app/providers/store'

export const ProductCard = ({ product }) => {
    const addToCart = useStore((state) => state.addToCart)
    const cart = useStore((state) => state.cart)

    const originalStock = product.inventory?.[0]?.stock || 0
    const cartQuantity = cart.find(item => item.id === product.id)?.quantity || 0
    const availableStock = originalStock - cartQuantity
    const noStockControl = product.track_stock === false

    return (
        <button
            onClick={() => addToCart(product)}
            disabled={!noStockControl && availableStock <= 0}
            className={`bg-surface p-4 rounded-lg border transition-all duration-200 flex items-center justify-between group ${
                !noStockControl && availableStock <= 0
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
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    noStockControl ? 'bg-subtle text-on-body' : availableStock <= 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                    {noStockControl ? 'Sin control' : availableStock <= 0 ? 'Sin Stock' : `Stock: ${availableStock}`}
                </span>
                <p className='text-lg font-bold text-accent'>
                    ${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(product.price)}
                </p>
            </div>
        </button>
    )
}

export const ProductGrid = ({ products = [] }) => {
    return (
        <div className='flex flex-col gap-3'>
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    )
}
