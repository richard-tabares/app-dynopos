import { ArrowDownCircle, ArrowUpCircle, Loader, Settings2, Search, X } from 'lucide-react'
import { useState, useMemo, useEffect } from 'react'
import { Modal } from '../../../shared/components/Modal'
import { getActiveVariations } from '../../../shared/helpers/productHelpers'
import { normalizeSearch } from '../../../shared/helpers/normalizeSearch'
import { useIsMobileDevice } from '../../../shared/hooks/useIsMobileDevice'
import { useStore } from '../../../app/providers/store'
import { getUnitLabel, ensureUnitsLoaded } from '../../../shared/helpers/unitsOfMeasure'

export const StockAdjustmentModal = ({
    products,
    preselect,
    handleClose,
    handleSubmit,
}) => {
    const isMobileDevice = useIsMobileDevice()
    const unitsOfMeasure = useStore((state) => state.unitsOfMeasure)
    const setUnitsOfMeasure = useStore((state) => state.setUnitsOfMeasure)

    useEffect(() => {
        ensureUnitsLoaded(unitsOfMeasure, setUnitsOfMeasure)
    }, [unitsOfMeasure, setUnitsOfMeasure])

    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [selected, setSelected] = useState(preselect || null)
    const [movementType, setMovementType] = useState('entry')
    const [isFocused, setIsFocused] = useState(false)
    const [formData, setFormData] = useState({
        quantity: '',
        unit_cost: preselect?.variation?.unit_cost ?? '',
        notes: '',
    })

    const eligibleProducts = useMemo(
        () => products.filter((p) => p.is_active !== false),
        [products],
    )

    const searchResults = useMemo(() => {
        if (!searchTerm.trim()) return []
        const term = normalizeSearch(searchTerm)
        const results = []
        for (const p of eligibleProducts) {
            for (const v of getActiveVariations(p)) {
                if (v.track_stock === false) continue
                const match =
                    normalizeSearch(p.name).includes(term) ||
                    (v.sku && normalizeSearch(v.sku).includes(term)) ||
                    (p.barcode && normalizeSearch(p.barcode).includes(term)) ||
                    normalizeSearch(v.variation_name).includes(term)
                if (match) results.push({ product: p, variation: v })
            }
        }
        return results
    }, [eligibleProducts, searchTerm])

    const showSearch = !preselect
    const currentStock = selected?.variation?.stock || 0
    const selectedUnitId = selected?.variation?.unit_of_measure_id
    const allowDecimals = selectedUnitId && selectedUnitId !== 1 && unitsOfMeasure.find(u => u.id === selectedUnitId)?.allow_decimals
    const isFormValid =
        selected &&
        formData.quantity !== '' &&
        parseFloat(formData.quantity) > 0

    const handleSelect = (product, variation) => {
        setSelected({ product, variation })
        setSearchTerm('')
        setFormData({ quantity: '', unit_cost: variation.unit_cost ?? '', notes: '' })
    }

    const handleClearSelection = () => {
        setSelected(null)
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        if (value !== '' && parseFloat(value) < 0) return
        setFormData((prev) => ({
            ...prev,
            [name]: value === '' ? '' : parseFloat(value) || 0,
        }))
    }

    const handleCostChange = (e) => {
        const { value } = e.target
        if (value !== '' && Number(value) < 0) return
        setFormData((prev) => ({
            ...prev,
            unit_cost: value === '' ? '' : Number(value),
        }))
    }

    const onFormSubmit = async (e) => {
        e.preventDefault()
        if (!selected) return
        setLoading(true)
        try {
            await handleSubmit(selected.product.id, {
                movement_type: movementType,
                quantity: parseFloat(formData.quantity),
                unit_cost: formData.unit_cost === '' ? null : Number(formData.unit_cost),
                notes: formData.notes || null,
                business_id: selected.product.business_id,
                variation_id: selected.variation.id,
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal
            onClose={handleClose}
            title='Ajustar Stock'
            icon={Settings2}>
            <div className='flex flex-col min-h-full'>
                <form
                    id='stock-adjust-form'
                    className='flex flex-col gap-4 p-6 flex-1 overflow-y-auto scrollbar-none'
                    onSubmit={onFormSubmit}>
                    <section>
                        <label className='block text-sm font-medium text-on-body mb-1'>
                            Producto
                        </label>
                        {showSearch && (
                            <div className='relative'>
                                <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-faint' />
                                <input
                                    type='search'
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    autoFocus={!isMobileDevice}
                                    className='w-full border border-divider rounded-md pl-10 pr-3 py-3 text-sm focus:outline-none focus:border-accent focus:ring-0 transition-all duration-300'
                                    placeholder='Buscar por código o nombre...'
                                />
                            </div>
                        )}

                        {showSearch && searchResults.length > 0 && (
                            <div className='mt-2 border border-divider rounded-md max-h-60 overflow-y-auto divide-y divide-divider-light'>
                                {searchResults.map(({ product, variation }) => (
                                    <button
                                        key={variation.id}
                                        type='button'
                                        onClick={() => handleSelect(product, variation)}
                                        className='w-full text-left px-4 py-3 hover:bg-hover transition cursor-pointer flex items-center justify-between gap-2'>
                                        <div className='min-w-0'>
                                            <span className='text-sm font-medium text-on-surface'>
                                                {product.name}
                                            </span>
                                            <span className='text-xs text-muted'>
                                                {' '}- {product.variation_type || 'Variante'} - {variation.variation_name}
                                            </span>
                                            {variation.sku && (
                                                <span className='text-xs text-faint ml-1'>
                                                    ({variation.sku})
                                                </span>
                                            )}
                                        </div>
                                        <span className='text-xs text-muted shrink-0'>
                                            Stock: {variation.stock || 0}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {showSearch && searchTerm && searchResults.length === 0 && (
                            <p className='text-sm text-muted mt-2 italic'>
                                No se encontraron productos
                            </p>
                        )}

                        {selected && !searchTerm && (
                            <div className='flex items-center justify-between mt-2 px-4 py-3 border border-accent/85 rounded-md bg-subtle'>
                                <span className='text-sm text-on-surface font-medium truncate'>
                                    {selected.product.name} - {selected.variation.variation_name}
                                    {selected.variation.sku && (
                                        <span className='text-muted font-normal ml-1'>
                                            ({selected.variation.sku})
                                        </span>
                                    )}
                                </span>
                                {showSearch && (
                                    <button
                                        type='button'
                                        onClick={handleClearSelection}
                                        className='text-xs text-accent border border-accent/85 rounded-md p-2 hover:bg-accent/10 cursor-pointer flex items-center gap-1 shrink-0 ml-2'>
                                        <X className='w-3 h-3' /> Cambiar
                                    </button>
                                )}
                            </div>
                        )}
                    </section>

                    {selected && (
                        <p className='text-sm text-muted'>
                            Stock actual:{' '}
                            <span className='font-semibold text-on-body'>
                                {currentStock}
                            </span>
                        </p>
                    )}

                    <section>
                        <label className='block text-sm font-medium text-on-body mb-2'>
                            Tipo de Movimiento
                        </label>
                        <div className='grid grid-cols-2 gap-2'>
                            <button
                                type='button'
                                onClick={() => setMovementType('entry')}
                                className={`flex items-center justify-center gap-2 p-3 border rounded-lg transition-colors cursor-pointer ${
                                    movementType === 'entry'
                                        ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                                        : 'border-outline bg-surface text-on-body hover:bg-hover'
                                }`}>
                                <ArrowDownCircle className='w-5 h-5' />
                                <span className='font-medium'>Entrada</span>
                            </button>
                            <button
                                type='button'
                                onClick={() => setMovementType('exit')}
                                className={`flex items-center justify-center gap-2 p-3 border rounded-lg transition-colors cursor-pointer ${
                                    movementType === 'exit'
                                        ? 'border-red-300 bg-red-50 text-red-700'
                                        : 'border-outline bg-surface text-on-body hover:bg-hover'
                                }`}>
                                <ArrowUpCircle className='w-5 h-5' />
                                <span className='font-medium'>Salida</span>
                            </button>
                        </div>
                    </section>

                    <section>
                        <label className='block text-sm font-medium text-on-body mb-1'>
                            Cantidad
                        </label>
                        <div className='flex w-full'>
                            <input
                                type='number'
                                name='quantity'
                                value={formData.quantity}
                                onChange={handleChange}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                min='0'
                                step={allowDecimals ? '0.001' : '1'}
                                className={`flex-1 border border-divider px-4 py-3 transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                                    selected ? 'border-r-0 rounded-l-md' : 'rounded-md'
                                }`}
                                placeholder='Ingrese la cantidad'
                            />
                            {selected && (
                                <span className={`flex items-center justify-center px-2.5 border rounded-r-md text-sm font-medium transition-colors duration-300 ${
                                    isFocused
                                        ? 'border-accent bg-accent/5 text-accent'
                                        : 'border-divider bg-surface text-muted'
                                }`}>
                                    {getUnitLabel(selectedUnitId, unitsOfMeasure)}
                                </span>
                            )}
                        </div>
                    </section>

                    <section>
                        <label className='block text-sm font-medium text-on-body mb-1'>
                            Costo Unitario
                        </label>
                        <input
                            type='number'
                            name='unit_cost'
                            value={formData.unit_cost}
                            onChange={handleCostChange}
                            min='0'
                            className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0'
                            placeholder='Costo actual del producto (opcional)'
                        />
                    </section>

                    <section>
                        <label className='block text-sm font-medium text-on-body mb-1'>
                            Motivo (opcional)
                        </label>
                        <input
                            type='text'
                            name='notes'
                            value={formData.notes}
                            onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                            className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0'
                            placeholder='Ej: Ajuste por conteo físico'
                        />
                    </section>
                </form>

                <div className='sticky bottom-0 bg-surface border-t border-divider px-6 py-4 flex justify-end gap-4'>
                    <button
                        type='button'
                        className='px-4 py-2 border border-outline text-on-body hover:bg-hover font-medium rounded-lg transition cursor-pointer'
                        onClick={handleClose}>
                        Cancelar
                    </button>
                    <button
                        type='submit'
                        form='stock-adjust-form'
                        disabled={loading || !isFormValid}
                        className='px-4 py-2 bg-accent text-surface rounded-lg hover:bg-accent/85 font-medium transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'>
                        {loading ? (
                            <><Loader className='w-5 h-5 animate-spin text-surface' /> Aplicando...</>
                        ) : (
                            'Aplicar Ajuste'
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    )
}
