import { useStore } from '../../../app/providers/store'

export const ProductCard = ({ product }) => {
    const addToCart = useStore((state) => state.addToCart)

    const stock = product.inventory?.[0]?.stock || 0

    return (
        <button
            onClick={() => addToCart(product)}
            disabled={stock === 0} // Disable if out of stock
            className='bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-primary-400 transition-all flex items-center justify-between cursor-pointer group disabled:opacity-60 disabled:cursor-not-allowed'
        >
            <div className='flex items-center gap-4'>
                <div className='w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-xs font-semibold'>
                    {/* Placeholder for product image/icon */}
                    IMG
                </div>
                <div className='text-left'>
                    <h3 className='font-semibold text-gray-900 text-base group-hover:text-primary-600 transition-colors line-clamp-1'>
                        {product.name}
                    </h3>
                    <p className='text-xs text-gray-500 mt-0.5'>
                        {product.categories?.name || 'Sin categoría'}
                    </p>
                </div>
            </div>
            
            <div className='flex items-center gap-4'>
                <p className='text-lg font-bold text-primary-600'>
                    ${parseFloat(product.price).toFixed(2)}
                </p>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    stock === 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                    {stock === 0 ? 'Sin Stock' : `Stock: ${stock}`}
                </span>
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
