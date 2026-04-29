import { useState, useRef, useEffect } from 'react'
import { Search, TrendingUp, Package, X } from 'lucide-react'
import { useStore } from '../../../app/providers/store'
import { getReports } from '../helpers/getReports'

const formatCurrency = (value) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)

export const ProductPerformanceSearch = () => {
    const { user } = useStore()
    const businessId = user?.data?.user?.id
    const [search, setSearch] = useState('')
    const [results, setResults] = useState(null)
    const [loading, setLoading] = useState(false)
    const debounceRef = useRef(null)

    const doSearch = (term) => {
        if (!term || term.length < 2 || !businessId) return
        setLoading(true)
        getReports(businessId, { section: 'product_performance', productSearch: term })
            .then(r => setResults(r.data))
            .catch(console.error)
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current)
        if (search.trim().length >= 2) {
            debounceRef.current = setTimeout(() => doSearch(search.trim()), 300)
        }
        return () => clearTimeout(debounceRef.current)
    }, [search]) // eslint-disable-line react-hooks/exhaustive-deps

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            if (debounceRef.current) clearTimeout(debounceRef.current)
            doSearch(search.trim())
        }
    }

    const tooShort = search.trim().length === 1

    return (
        <section className='bg-white border border-gray-300 p-6 shadow-xs rounded-lg h-full flex flex-col'>
            <div className='flex items-center gap-2 mb-4'>
                <div className='p-2 rounded-lg bg-blue-50'>
                    <Package className='w-5 h-5 text-blue-600' />
                </div>
                <h3 className='text-lg font-semibold text-gray-900'>Rendimiento por Producto</h3>
            </div>

            <p className='text-xs text-gray-500 mb-3'>Busca por nombre o SKU. No afectado por filtros de fecha.</p>

            <div className='flex gap-2 mb-4'>
                <div className='relative flex-1'>
                    <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                    <input
                        type='text'
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value)
                            if (e.target.value.trim().length < 2) setResults(null)
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder='Nombre o SKU...'
                        className='w-full border border-gray-300 rounded-lg pl-10 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500'
                    />
                    {search && (
                        <button
                            onClick={() => { setSearch(''); setResults(null) }}
                            className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer'
                        >
                            <X className='w-4 h-4' />
                        </button>
                    )}
                </div>
            </div>

            {tooShort && (
                <p className='text-xs text-amber-600 -mt-2 mb-4'>Ingresa al menos 2 caracteres para buscar</p>
            )}

            <div className='flex-1 space-y-3'>
                {loading && (
                    <div className='space-y-3'>
                        {[1, 2, 3].map(i => (
                            <div key={i} className='h-20 bg-gray-100 rounded-lg animate-pulse' />
                        ))}
                    </div>
                )}

                {!loading && results && results.length === 0 && (
                    <div className='text-center text-gray-400 italic py-8'>No se encontraron productos</div>
                )}

                {!loading && results && results.map((product, i) => (
                    <div key={i} className='border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition'>
                        <div className='flex items-start justify-between gap-4'>
                            <div className='min-w-0 flex-1'>
                                <p className='text-sm font-bold text-gray-900 uppercase truncate'>{product.product_name}</p>
                                {product.sku && (
                                    <p className='text-xs text-gray-400 mt-0.5'>SKU: {product.sku}</p>
                                )}
                            </div>
                            <div className='flex items-center gap-1 text-emerald-600 font-bold text-sm shrink-0'>
                                <TrendingUp className='w-3.5 h-3.5' />
                                {formatCurrency(product.total_revenue)}
                            </div>
                        </div>
                        <div className='flex gap-6 mt-2 text-xs text-gray-500'>
                            <span><strong className='text-gray-700'>{product.total_quantity_sold}</strong> uds vendidas</span>
                            {product.track_stock && (
                                <span>Stock: <strong className='text-gray-700'>{product.current_stock}</strong></span>
                            )}
                            <span>Precio: <strong className='text-gray-700'>{formatCurrency(product.unit_price)}</strong></span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
