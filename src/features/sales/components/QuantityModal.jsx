import { useState, useMemo, useRef, useEffect } from 'react'
import { X, ShoppingCart } from 'lucide-react'
import { useEscape } from '../../../shared/helpers/useEscape'
import { useStore } from '../../../app/providers/store'

const nf = (value) =>
    new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(value)

export const QuantityModal = ({ product, variation, onClose }) => {
    const { unitsOfMeasure, addToCart, currentLabel, initCurrentOrder } = useStore()

    useEscape(onClose)

    const baseUnit = unitsOfMeasure.find(u => u.id === variation.unit_of_measure_id) || unitsOfMeasure[0]
    const subUnits = unitsOfMeasure.filter(u => u.base_unit_id === baseUnit?.id)

    const allUnits = useMemo(() => {
        const list = baseUnit ? [baseUnit] : []
        if (subUnits.length > 0) list.push(...subUnits)
        return list
    }, [baseUnit, subUnits])

    const inputRef = useRef(null)
    const [selectedUnitId, setSelectedUnitId] = useState(baseUnit?.id || 1)
    const [quantity, setQuantity] = useState('')
    const [isFocused, setIsFocused] = useState(false)

    useEffect(() => {
        inputRef.current?.focus()
    }, [selectedUnitId])

    const selectedUnit = allUnits.find(u => u.id === selectedUnitId) || baseUnit
    const isSubUnit = selectedUnit?.base_unit_id !== null

    const conversionFactor = isSubUnit ? (selectedUnit?.conversion_factor || 1) : 1
    const basePrice = variation.price || 0
    const effectiveUnitPrice = basePrice * conversionFactor

    const subtotal = (parseFloat(quantity) || 0) * effectiveUnitPrice

    const handleAdd = () => {
        const qty = parseFloat(quantity)
        if (!qty || qty <= 0) return
        if (currentLabel === null) initCurrentOrder()
        const mainUnitQty = qty * conversionFactor
        addToCart(product, variation, {
            quantity: mainUnitQty,
            soldInUnitId: baseUnit?.id || 1,
            displayUnit: baseUnit?.short_name || '',
            conversionFactor: 1,
            basePrice: basePrice,
            effectivePrice: basePrice,
        })
        onClose()
    }

    return (
        <section
            className='fixed inset-0 bg-overlay backdrop-blur-xs w-full h-full flex flex-col items-center justify-center z-[70] p-4'
            onClick={onClose}>
            <section
                className='bg-surface border border-outline rounded-xl w-full max-w-sm relative max-h-[90dvh] overflow-y-auto scrollbar-none'
                onClick={(e) => e.stopPropagation()}>
                <section className='sticky top-0 bg-title-surface/50 backdrop-blur-3xl z-50 flex items-center justify-between px-6 py-3.5 border-b border-divider'>
                    <h2 className='text-lg font-semibold flex items-center gap-2'>
                        <ShoppingCart className='w-5 h-5 text-accent' />
                        Seleccionar cantidad
                    </h2>
                    <button
                        onClick={onClose}
                        className='p-1 rounded-md text-accent hover:text-accent/85 border border-disabled hover:border-accent transition cursor-pointer'>
                        <X className='w-5 h-5' />
                    </button>
                </section>

                <div className='p-6 flex flex-col gap-4'>
                    <div>
                        <h3 className='font-semibold text-on-surface'>{product.name}</h3>
                        {variation.variation_name !== 'Default' && (
                            <p className='text-sm text-on-surface flex items-center gap-2 mt-1'>
                                {product.variation_type && (
                                    <span className='px-2.5 py-0.5 text-xs font-medium bg-accent/10 text-accent rounded-full'>
                                        {product.variation_type?.toLowerCase()}
                                    </span>
                                )}
                                <span className='font-medium'>{variation.variation_name}</span>
                            </p>
                        )}
                    </div>

                    {allUnits.length > 1 && (
                        <section>
                            <label className='block text-sm font-medium text-on-body mb-2'>
                                Unidad de venta
                            </label>
                            <div className='flex gap-2 flex-wrap'>
                                {allUnits.map((u) => {
                                    const isActive = selectedUnitId === u.id
                                    return (
                                        <button
                                            key={u.id}
                                            type='button'
                                            onClick={() => setSelectedUnitId(u.id)}
                                            className={`px-4 py-2 rounded-lg border text-sm font-medium transition cursor-pointer ${
                                                isActive
                                                    ? 'border-accent bg-accent text-surface'
                                                    : 'border-outline text-on-body hover:border-accent hover:text-accent'
                                            }`}>
                                            {u.name} ({u.short_name})
                                        </button>
                                    )
                                })}
                            </div>
                        </section>
                    )}

                    <section>
                        <label className='block text-sm font-medium text-on-body mb-1'>
                            Cantidad
                        </label>
                        <div className='flex w-full'>
                            <input
                                ref={inputRef}
                                type='number'
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                min='0'
                                step={selectedUnit?.allow_decimals ? '0.001' : '1'}
                                autoFocus
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                className='flex-1 border border-divider border-r-0 rounded-l-md px-4 py-3 text-lg font-bold text-right focus:outline-none focus:border-accent focus:ring-0 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                                placeholder='0'
                            />
                            <span className={`flex items-center justify-center px-2.5 border rounded-r-md text-md font-medium transition-colors ${
                                isFocused
                                    ? 'border-accent bg-accent/5 text-accent'
                                    : 'border-divider bg-surface text-muted'
                            }`}>
                                {selectedUnit?.short_name || 'und'}
                            </span>
                        </div>
                    </section>

                    <div className='bg-subtle rounded-lg p-4 space-y-2 text-sm'>
                        <div className='flex justify-between'>
                            <span className='text-on-body'>Precio por {baseUnit?.short_name || 'und'}:</span>
                            <span className='font-semibold text-on-surface'>${nf(basePrice)}</span>
                        </div>
                        {subUnits.length > 0 && (
                            <div className='flex justify-between'>
                                <span className='text-on-body'>Precio por {subUnits[0].short_name}:</span>
                                <span className='font-semibold text-on-surface'>${nf(basePrice * subUnits[0].conversion_factor)}</span>
                            </div>
                        )}
                        <div className='flex justify-between pt-2 border-t border-divider'>
                            <span className='font-semibold text-on-surface'>Total:</span>
                            <span className='text-lg font-bold text-accent'>${nf(subtotal)}</span>
                        </div>
                    </div>

                    <button
                        type='button'
                        onClick={handleAdd}
                        disabled={!quantity || parseFloat(quantity) <= 0}
                        className='w-full py-3 bg-accent text-surface rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-accent/85 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'>
                        <ShoppingCart className='w-5 h-5' />
                        Agregar al Carrito
                    </button>
                </div>
            </section>
        </section>
    )
}
