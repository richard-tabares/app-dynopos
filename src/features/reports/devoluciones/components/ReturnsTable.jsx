import { useState, useMemo } from 'react'
import { Search, Undo2, ChevronDown } from 'lucide-react'

const formatCurrency = (value) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)

export const ReturnsTable = ({ data = [], onReturnClick }) => {
    const [visibleCount, setVisibleCount] = useState(10)
    const [search, setSearch] = useState('')

    const filtered = useMemo(() => {
        if (!search.trim()) return data
        const term = search.trim()
        return data.filter(item => {
            const displayId = String(item.ticket_number ?? item.return_id ?? '').padStart(4, '0')
            return displayId.includes(term)
        })
    }, [data, search])

    const visible = filtered.slice(0, visibleCount)

    return (
        <section className='bg-surface border border-outline p-6 shadow-xs rounded-lg'>
            <div className='flex items-center gap-2 text-red-500 mb-4'>
                <Undo2 className='w-5 h-5' />
                <h3 className='text-lg font-semibold text-on-surface'>Historial de Devoluciones</h3>
            </div>

            <div className='relative mb-4'>
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-faint' />
                <input
                    type='text'
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setVisibleCount(10) }}
                    placeholder='Buscar por # de devolución...'
                    className='w-full border border-divider rounded-md pl-10 pr-3 py-3 text-sm focus:outline-none focus:border-accent focus:ring-0 transition-all duration-300'
                />
            </div>

            <div className='overflow-x-auto'>
                {visible.length > 0 ? (
                    <>
                        <table className='w-full text-sm overflow-hidden rounded-t-lg'>
                            <thead>
                                <tr className='bg-subtle border-b border-divider text-muted uppercase text-xs tracking-wider'>
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
                                        className='border-b border-divider-light hover:bg-hover cursor-pointer transition'
                                        onClick={() => onReturnClick && onReturnClick(item)}
                                    >
                                        <td className='py-3 px-4 font-medium text-on-surface'>#{String(item.ticket_number ?? item.return_id ?? '').padStart(4, '0')}</td>
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
                                className='w-full mt-4 py-2 text-sm font-medium text-on-surface hover:text-surface hover:bg-accent rounded-lg border border-accent transition-colors cursor-pointer flex items-center justify-center gap-2'
                            >
                                <ChevronDown className='w-4 h-4' /> Cargar más ({filtered.length - visibleCount} restantes)
                            </button>
                        )}
                    </>
                ) : (
                    <div className='text-center text-faint italic py-12'>Sin devoluciones</div>
                )}
            </div>
        </section>
    )
}
