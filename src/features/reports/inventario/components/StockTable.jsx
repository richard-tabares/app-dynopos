import { useState, useMemo } from 'react'
import { Search, AlertTriangle, PackageCheck, Package, PackageX, ClipboardList } from 'lucide-react'

const statusConfig = {
    sin_stock: { label: 'Sin Stock', color: 'text-red-600', bg: 'bg-red-50' },
    stock_bajo: { label: 'Bajo', color: 'text-orange-600', bg: 'bg-orange-50' },
    con_stock: { label: 'Normal', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    sin_control: { label: 'Sin Control', color: 'text-on-body', bg: 'bg-body' },
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

    const getStatusConfig = (status) => statusConfig[status] || statusConfig.stock_bajo

    return (
        <section className='bg-surface border border-outline p-6 shadow-xs rounded-lg'>
            <div className='flex items-center gap-2 text-primary-600 mb-4'>
                <ClipboardList className='w-5 h-5' />
                <h3 className='text-lg font-semibold text-on-surface'>Estado de Inventario</h3>
            </div>

            <div className='relative mb-4'>
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-faint' />
                <input
                    type='text'
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setVisibleCount(10) }}
                    placeholder='Buscar producto...'
                    className='w-full border border-outline rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500'
                />
            </div>

            <div className='overflow-x-auto'>
                {visible.length > 0 ? (
                    <>
                        <table className='w-full text-sm overflow-hidden rounded-t-lg'>
                            <thead>
                                <tr className='bg-subtle border-b border-divider text-muted uppercase text-xs tracking-wider'>
                                    <th className='text-left py-3 px-4 font-medium'>Producto</th>
                                    <th className='text-left py-3 px-4 font-medium'>Categoría</th>
                                    <th className='text-right py-3 px-4 font-medium'>Stock Actual</th>
                                    <th className='text-right py-3 px-4 font-medium'>Stock Mín.</th>
                                    <th className='text-right py-3 px-4 font-medium'>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visible.map((item, i) => (
                                    <tr key={i} className='border-b border-divider-light hover:bg-hover'>
                                        <td className='py-3 px-4 font-medium text-on-surface'>{item.product_name}</td>
                                        <td className='py-3 px-4 text-muted'>{item.category_name || 'Sin categoría'}</td>
                                        <td className='py-3 px-4 text-right'>{item.stock_status === 'sin_control' ? '—' : item.current_stock}</td>
                                        <td className='py-3 px-4 text-right'>{item.stock_status === 'sin_control' ? '—' : item.min_stock}</td>
                                        <td className='py-3 px-4 text-right'>
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusConfig(item.stock_status).bg} ${getStatusConfig(item.stock_status).color}`}>
                                                {getStatusConfig(item.stock_status).label}
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
                    <div className='text-center text-faint italic py-12'>Sin productos</div>
                )}
            </div>
        </section>
    )
}
