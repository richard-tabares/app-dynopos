import { useState, useMemo } from 'react'
import { Search, AlertTriangle, PackageCheck, Package } from 'lucide-react'

const statusConfig = {
    stock_bajo: { label: 'Stock Bajo', color: 'text-red-600', bg: 'bg-red-50' },
    con_stock: { label: 'Con Stock', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    sin_control: { label: 'Sin Control', color: 'text-gray-600', bg: 'bg-gray-50' },
}

export const StockTable = ({ data = [], filter = 'stock_bajo' }) => {
    const [search, setSearch] = useState('')
    const [visibleCount, setVisibleCount] = useState(10)

    const filtered = useMemo(() => {
        let result = filter === 'all' ? data : data.filter(d => d.stock_status === filter)
        if (search.trim()) {
            const term = search.toLowerCase()
            result = result.filter(d => d.product_name?.toLowerCase().includes(term))
        }
        return result
    }, [data, filter, search])

    const visible = filtered.slice(0, visibleCount)
    const current = statusConfig[filter] || statusConfig.stock_bajo

    return (
        <section className='bg-white border border-gray-300 p-6 shadow-xs rounded-lg'>
            <h3 className='text-lg font-semibold mb-4 text-gray-900'>Estado de Inventario</h3>

            <div className='relative mb-4'>
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                <input
                    type='text'
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setVisibleCount(10) }}
                    placeholder='Buscar producto...'
                    className='w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500'
                />
            </div>

            <div className='overflow-x-auto'>
                {visible.length > 0 ? (
                    <>
                        <table className='w-full text-sm'>
                            <thead>
                                <tr className='border-b border-gray-200 text-gray-500 uppercase text-xs tracking-wider'>
                                    <th className='text-left py-3 px-4 font-medium'>Producto</th>
                                    <th className='text-right py-3 px-4 font-medium'>Stock Actual</th>
                                    <th className='text-right py-3 px-4 font-medium'>Stock Mín.</th>
                                    <th className='text-right py-3 px-4 font-medium'>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visible.map((item, i) => (
                                    <tr key={i} className='border-b border-gray-100 hover:bg-gray-50'>
                                        <td className='py-3 px-4 font-medium text-gray-900'>{item.product_name}</td>
                                        <td className='py-3 px-4 text-right'>{item.current_stock}</td>
                                        <td className='py-3 px-4 text-right'>{item.min_stock}</td>
                                        <td className='py-3 px-4 text-right'>
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${current.bg} ${current.color}`}>
                                                {current.label}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {visibleCount < filtered.length && (
                            <button
                                onClick={() => setVisibleCount(prev => prev + 10)}
                                className='w-full mt-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition cursor-pointer'
                            >
                                Cargar más ({filtered.length - visibleCount} restantes)
                            </button>
                        )}
                    </>
                ) : (
                    <div className='text-center text-gray-400 italic py-12'>Sin productos</div>
                )}
            </div>
        </section>
    )
}
