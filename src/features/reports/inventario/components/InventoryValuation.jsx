import { useState, useMemo } from 'react'
import { Search, DollarSign, ChevronDown } from 'lucide-react'
import { normalizeSearch } from '../../../../shared/helpers/normalizeSearch'

const formatCurrency = (value) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)

export const InventoryValuation = ({ data = [] }) => {
    const [visibleCount, setVisibleCount] = useState(10)
    const [search, setSearch] = useState('')

    const totalValuation = useMemo(() =>
        data.reduce((sum, item) => sum + Number(item.total_value), 0),
    [data])

    const filtered = useMemo(() => {
        if (!search.trim()) return data
        const term = normalizeSearch(search)
        return data.filter(item =>
            normalizeSearch(item.product_name).includes(term) ||
            normalizeSearch(item.variation_name || '').includes(term) ||
            normalizeSearch(item.sku).includes(term) ||
            (item.barcode && normalizeSearch(item.barcode).includes(term))
        )
    }, [data, search])

    const visible = filtered.slice(0, visibleCount)

    return (
        <section className='bg-surface border border-outline p-6 shadow-xs rounded-lg'>
            <div className='flex items-center gap-2 text-accent mb-4'>
                <DollarSign className='w-5 h-5' />
                <h3 className='text-lg font-semibold text-on-surface'>Valorización de Inventario</h3>
                <div className='ml-auto text-right'>
                    <p className='text-xs text-muted'>Valor Total</p>
                    <p className='text-xl font-bold text-accent'>{formatCurrency(totalValuation)}</p>
                </div>
            </div>

            <div className='relative mb-4'>
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-faint' />
                <input
                    type='text'
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setVisibleCount(10) }}
                    placeholder='Buscar por código o nombre...'
                    className='w-full border border-divider rounded-md pl-10 pr-3 py-3 text-sm focus:outline-none focus:border-accent focus:ring-0 transition-all duration-300'
                />
            </div>

            <div className='overflow-x-auto'>
                {visible.length > 0 ? (
                    <>
                        <table className='w-full text-sm overflow-hidden rounded-t-lg'>
                            <thead>
                                <tr className='bg-subtle border-b border-divider text-muted uppercase text-xs tracking-wider'>
                                    <th className='text-left py-3 px-4 font-medium'>Producto</th>
                                    <th className='text-right py-3 px-4 font-medium'>Stock</th>
                                    <th className='text-right py-3 px-4 font-medium'>Costo Unit.</th>
                                    <th className='text-right py-3 px-4 font-medium'>Valor Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visible.map((item, i) => (
                                    <tr key={i} className='border-b border-divider-light hover:bg-hover'>
                                        <td className='py-3 px-4 font-medium text-on-surface'>
                                            {item.variation_name && item.variation_name !== 'Default' ? (
                                                <span className='inline-flex items-center gap-2'>
                                                    <span>{item.product_name}</span>
                                                    <span className='w-1.5 h-1.5 rounded-full bg-accent shrink-0' />
                                                    <span className='font-medium text-on-surface'>{item.variation_name}</span>
                                                </span>
                                            ) : (
                                                <span className='font-medium text-on-surface'>{item.product_name}</span>
                                            )}
                                        </td>
                                        <td className='py-3 px-4 text-right'>{item.current_stock}</td>
                                        <td className='py-3 px-4 text-right'>{formatCurrency(item.unit_cost)}</td>
                                        <td className='py-3 px-4 text-right font-semibold'>{formatCurrency(item.total_value)}</td>
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
                    <div className='text-center text-faint italic py-12'>Sin productos en inventario</div>
                )}
            </div>
        </section>
    )
}
