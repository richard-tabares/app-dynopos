import { useState, useMemo, useEffect } from 'react'
import { Search, DollarSign, ChevronDown } from 'lucide-react'
import { normalizeSearch } from '../../../../shared/helpers/normalizeSearch'
import { useStore } from '../../../../app/providers/store'
import { getUnitLabel, ensureUnitsLoaded } from '../../../../shared/helpers/unitsOfMeasure'
import { ensureCategoriesLoaded } from '../../../../shared/helpers/ensureCategoriesLoaded'

const formatCurrency = (value) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)

export const InventoryValuation = ({ data = [] }) => {
    const unitsOfMeasure = useStore((state) => state.unitsOfMeasure)
    const setUnitsOfMeasure = useStore((state) => state.setUnitsOfMeasure)
    const categories = useStore((state) => state.categories)
    const setCategories = useStore((state) => state.setCategories)
    const user = useStore((state) => state.user)
    const businessId = user?.profile?.business_id || user?.data?.user?.id
    const [visibleCount, setVisibleCount] = useState(10)
    const [search, setSearch] = useState('')
    const [selectedCategoryIds, setSelectedCategoryIds] = useState([])

    useEffect(() => {
        ensureUnitsLoaded(unitsOfMeasure, setUnitsOfMeasure)
    }, [unitsOfMeasure, setUnitsOfMeasure])

    useEffect(() => {
        ensureCategoriesLoaded(categories, setCategories, businessId)
    }, [categories, setCategories, businessId])

    const selectedCategoryNames = useMemo(
        () => categories.filter((c) => selectedCategoryIds.includes(c.id)).map((c) => c.name),
        [categories, selectedCategoryIds],
    )

    const filtered = useMemo(() => {
        let result = data
        if (search.trim()) {
            const term = normalizeSearch(search)
            result = result.filter(item =>
                normalizeSearch(item.product_name).includes(term) ||
                normalizeSearch(item.variation_name || '').includes(term) ||
                normalizeSearch(item.sku).includes(term) ||
                (item.barcode && normalizeSearch(item.barcode).includes(term))
            )
        }
        if (selectedCategoryNames.length > 0) {
            result = result.filter((d) => d.category_name && selectedCategoryNames.includes(d.category_name))
        }
        return result
    }, [data, search, selectedCategoryNames])

    const totalValuation = useMemo(() =>
        filtered.reduce((sum, item) => sum + Number(item.total_value), 0),
    [filtered])

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

            {categories.length > 0 && (
                <div className='flex flex-wrap items-center gap-2 mb-4'>
                    {categories.map((cat) => {
                        const isSelected = selectedCategoryIds.includes(cat.id)
                        return (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    setSelectedCategoryIds((prev) =>
                                        prev.includes(cat.id)
                                            ? prev.filter((id) => id !== cat.id)
                                            : [...prev, cat.id],
                                    )
                                    setVisibleCount(10)
                                }}
                                className={`rounded-full px-3.5 py-1.5 text-sm font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                                    isSelected
                                        ? 'bg-surface text-accent border-accent'
                                        : 'bg-surface text-on-surface border-divider hover:border-accent/50'
                                }`}>
                                {cat.name}
                            </button>
                        )
                    })}
                </div>
            )}

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
                                                    {item.variation_type && (
                                                        <span className='px-2.5 py-0.5 text-xs font-medium bg-accent/10 text-accent rounded-full'>
                                                            {item.variation_type.toLowerCase()}
                                                        </span>
                                                    )}
                                                    <span className='font-medium text-on-surface'>{item.variation_name}</span>
                                                </span>
                                            ) : (
                                                <span className='font-medium text-on-surface'>{item.product_name}</span>
                                            )}
                                        </td>
                                        <td className='py-3 px-4 text-right'>{item.current_stock} {getUnitLabel(item.unit_of_measure_id, unitsOfMeasure)}</td>
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
