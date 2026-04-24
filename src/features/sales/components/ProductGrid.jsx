import { useStore } from '../../../app/providers/store'

export const ProductCard = ({ product }) => {
    const addToCart = useStore((state) => state.addToCart)

    const stock = product.inventory?.[0]?.stock || 0

    return (
        <button
            onClick={() => addToCart(product)}
            disabled={stock === 0}
            className={`bg-white p-4 rounded-lg border shadow-sm transition-all flex items-center justify-between group ${
                stock === 0 
                    ? 'border-gray-200 opacity-50 cursor-not-allowed bg-gray-50 grayscale' 
                    : 'border-gray-200 hover:shadow-md hover:border-primary-400 cursor-pointer'
            }`}
        >
            <div className='flex items-center gap-4'>
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
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    stock === 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                    {stock === 0 ? 'Sin Stock' : `Stock: ${stock}`}
                </span>
                <p className='text-lg font-bold text-primary-600'>
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
