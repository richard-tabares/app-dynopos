import { useState, useMemo } from 'react'
import { Clock, Search, ReceiptText } from 'lucide-react'
import { SaleTicketModal } from '../../../../shared/components/SaleTicketModal'

const formatCurrency = (value) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)

const statusConfig = {
    completed: { label: 'Completada', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    returned: { label: 'Devuelta', color: 'text-red-600', bg: 'bg-red-50' },
    default: { label: 'Completada', color: 'text-emerald-600', bg: 'bg-emerald-50' },
}

const getStatusConfig = (status) => statusConfig[status] || statusConfig.default

export const RecentSalesTable = ({ sales = [] }) => {
    const [visibleCount, setVisibleCount] = useState(10)
    const [search, setSearch] = useState('')
    const [selectedSale, setSelectedSale] = useState(null)

    const filtered = useMemo(() => {
        if (!search.trim()) return sales
        const term = search.trim()
        return sales.filter(sale =>
            String(sale.id).includes(term)
        )
    }, [sales, search])

    const visible = filtered.slice(0, visibleCount)

    return (
        <>
            <section className='bg-surface border border-outline p-6 shadow-xs rounded-lg'>
                <div className='flex items-center gap-2 text-accent mb-4'>
                    <Clock className='w-5 h-5' />
                    <h3 className='text-lg font-semibold text-on-surface'>Ventas Recientes</h3>
                </div>

                <div className='relative mb-4'>
                    <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-faint' />
                    <input
                        type='text'
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setVisibleCount(10) }}
                        placeholder='Buscar por # de venta...'
                        className='w-full border border-outline rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500'
                    />
                </div>

                <div className='overflow-x-auto'>
                    {visible.length > 0 ? (
                        <>
                            <table className='w-full text-sm overflow-hidden rounded-t-lg'>
                                <thead>
                                    <tr className='bg-subtle border-b border-divider text-muted uppercase text-xs tracking-wider'>
                                        <th className='text-left py-3 px-4 font-medium'># Venta</th>
                                        <th className='text-left py-3 px-4 font-medium'>Fecha</th>
                                        <th className='text-left py-3 px-4 font-medium'>Método de Pago</th>
                                        <th className='text-left py-3 px-4 font-medium'>Estado</th>
                                        <th className='text-right py-3 px-4 font-medium'>Items</th>
                                        <th className='text-right py-3 px-4 font-medium'>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visible.map((sale) => {
                                        const status = getStatusConfig(sale.status)
                                        return (
                                            <tr
                                                key={sale.id}
                                                className='border-b border-divider-light hover:bg-hover cursor-pointer transition'
                                                onClick={() => setSelectedSale(sale)}
                                            >
                                                <td className='py-3 px-4 font-medium text-on-surface'>
                                                    <span className='flex items-center gap-2'>
                                                        <ReceiptText className='w-4 h-4 text-accent shrink-0' />
                                                        #{String(sale.id).padStart(4, '0')}
                                                    </span>
                                                </td>
                                                <td className='py-3 px-4 text-muted'>{sale.date}</td>
                                                <td className='py-3 px-4 text-on-surface capitalize'>{sale.paymentMethod}</td>
                                                <td className='py-3 px-4'>
                                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${status.bg} ${status.color}`}>
                                                        {status.label}
                                                    </span>
                                                </td>
                                                <td className='py-3 px-4 text-right text-on-surface'>{sale.itemsCount}</td>
                                                <td className='py-3 px-4 text-right font-bold text-on-surface'>{formatCurrency(sale.total)}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                            {visibleCount < filtered.length && (
                                <button
                                    onClick={() => setVisibleCount(prev => prev + 10)}
                                    className='w-full mt-4 py-2 text-sm font-medium text-on-surface hover:text-surface hover:bg-accent rounded-lg border border-accent transition-colors cursor-pointer'
                                >
                                    Cargar más ({filtered.length - visibleCount} restantes)
                                </button>
                            )}
                        </>
                    ) : (
                        <div className='text-center text-faint italic py-12'>Sin ventas en este período</div>
                    )}
                </div>
            </section>

            <SaleTicketModal
                isOpen={!!selectedSale}
                onClose={() => setSelectedSale(null)}
                sale={selectedSale}
            />
        </>
    )
}
