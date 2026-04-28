import { useState, useMemo } from 'react'
import { Search, Undo2 } from 'lucide-react'

const formatCurrency = (value) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)

export const ReturnsTable = ({ data = [], onReturnClick }) => {
    const [visibleCount, setVisibleCount] = useState(10)
    const [search, setSearch] = useState('')

    const filtered = useMemo(() => {
        if (!search.trim()) return data
        const term = search.toLowerCase()
        return data.filter(item =>
            String(item.return_id || item.id || '').includes(term)
        )
    }, [data, search])

    const visible = filtered.slice(0, visibleCount)

    return (
        <section className='bg-white border border-gray-300 p-6 shadow-xs rounded-lg'>
            <div className='flex items-center gap-2 mb-4'>
                <div className='p-2 rounded-lg bg-red-50'>
                    <Undo2 className='w-5 h-5 text-red-500' />
                </div>
                <h3 className='text-lg font-semibold text-gray-900'>Historial de Devoluciones</h3>
            </div>

            <div className='relative mb-4'>
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                <input
                    type='text'
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setVisibleCount(10) }}
                    placeholder='Buscar por # de devolución...'
                    className='w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500'
                />
            </div>

            <div className='overflow-x-auto'>
                {visible.length > 0 ? (
                    <>
                        <table className='w-full text-sm'>
                            <thead>
                                <tr className='border-b border-gray-200 text-gray-500 uppercase text-xs tracking-wider'>
                                    <th className='text-left py-3 px-4 font-medium whitespace-nowrap w-1'># Devolución</th>
                                    <th className='text-right py-3 px-4 font-medium'>Cant. Devuelta</th>
                                    <th className='text-right py-3 px-4 font-medium'>Fecha</th>
                                    <th className='text-right py-3 px-4 font-medium'>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visible.map((item, i) => (
                                    <tr
                                        key={i}
                                        className='border-b border-gray-100 hover:bg-red-50 cursor-pointer transition'
                                        onClick={() => onReturnClick && onReturnClick(item)}
                                    >
                                        <td className='py-3 px-4 font-medium text-gray-900'>#{String(item.return_id || item.id || '').padStart(4, '0')}</td>
                                        <td className='py-3 px-4 text-right'>{item.total_items_returned}</td>
                                        <td className='py-3 px-4 text-right'>{item.return_date}</td>
                                        <td className='py-3 px-4 text-right font-medium text-red-600'>{formatCurrency(item.total_amount)}</td>
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
                    <div className='text-center text-gray-400 italic py-12'>Sin devoluciones</div>
                )}
            </div>
        </section>
    )
}
