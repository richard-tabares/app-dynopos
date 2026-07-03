import { useState, useEffect } from 'react'
import { RotateCcw, Loader } from 'lucide-react'
import { Modal } from '../../../shared/components/Modal'
import { useStore } from '../../../app/providers/store'
import { getUnitLabel, ensureUnitsLoaded } from '../../../shared/helpers/unitsOfMeasure'

const initialItemSelections = (items) =>
    items.map((item) => ({ ...item, returnQuantity: 0 }))

export const ReturnModal = ({ isOpen, sale, onClose, onConfirm }) => {
    const unitsOfMeasure = useStore((state) => state.unitsOfMeasure)
    const setUnitsOfMeasure = useStore((state) => state.setUnitsOfMeasure)
    const [selectedItems, setSelectedItems] = useState([])
    const [returnReason, setReturnReason] = useState('')
    const [isReturning, setIsReturning] = useState(false)

    useEffect(() => {
        ensureUnitsLoaded(unitsOfMeasure, setUnitsOfMeasure)
    }, [unitsOfMeasure, setUnitsOfMeasure])

    if (!isOpen || !sale) return null

    const openReturnModal = () => {
        setSelectedItems(initialItemSelections(sale.items))
        setReturnReason('')
    }

    if (selectedItems.length === 0) openReturnModal()

    const toggleItem = (itemId) => {
        setSelectedItems((prev) =>
            prev.map((item) => {
                if (item.id !== itemId) return item
                const remaining = item.quantity - (item.already_returned || 0)
                if (remaining <= 0) return item
                return {
                    ...item,
                    returnQuantity:
                        item.returnQuantity > 0 ? 0 : remaining,
                }
            }),
        )
    }

    const updateQuantity = (itemId, quantity) => {
        const item = selectedItems.find((i) => i.id === itemId)
        if (!item) return
        const remaining = item.quantity - (item.already_returned || 0)
        const clamped = Math.max(0, Math.min(quantity, remaining))
        setSelectedItems((prev) =>
            prev.map((i) =>
                i.id === itemId ? { ...i, returnQuantity: clamped } : i,
            ),
        )
    }

    const hasSelectedItems = selectedItems.some((i) => i.returnQuantity > 0)
    const totalReturn = selectedItems.reduce(
        (sum, i) => sum + i.returnQuantity * i.price,
        0,
    )

    const handleConfirm = async () => {
        if (!returnReason.trim() || !hasSelectedItems || isReturning) return

        const itemsToReturn = selectedItems
            .filter((i) => i.returnQuantity > 0)
            .map((i) => ({
                product_id: i.product_id,
                variation_id: i.variation_id || null,
                variation_name: i.variation_name || null,
                quantity: i.returnQuantity,
                unit_price: i.price,
                subtotal: i.returnQuantity * i.price,
            }))

        setIsReturning(true)
        try {
            await onConfirm(returnReason.trim(), itemsToReturn)
            setReturnReason('')
        } catch {
            // error ya manejado por el padre (toast)
        } finally {
            setIsReturning(false)
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={'Devolver Venta #' + String(sale.ticketNumber || sale.id).padStart(4, '0')}
            icon={RotateCcw}
            iconColor='text-red-600'
        >
            <div className='p-6 overflow-y-auto flex-1 scrollbar-none max-h-[calc(90vh-65px)]'>
                <p className='text-sm font-semibold text-on-body mb-3'>
                    Selecciona los productos a devolver:
                </p>
                <div className='space-y-3'>
                    {selectedItems.map((item) => {
                        const alreadyReturned = item.already_returned || 0
                        const remaining = item.quantity - alreadyReturned
                        const isFullyReturned = remaining <= 0

                        return (
                            <div
                                key={item.id}
                                className={`flex items-center gap-3 p-3 border rounded-lg ${isFullyReturned ? 'border-divider bg-disabled' : 'border-divider'}`}>
                                <input
                                    type='checkbox'
                                    checked={item.returnQuantity > 0}
                                    onChange={() => toggleItem(item.id)}
                                    disabled={isFullyReturned}
                                    className='w-4 h-4 accent-red-600'
                                />

                                <div className='flex-1 min-w-0'>
                                    <p className='text-sm font-bold text-on-surface'>
                                        $
                                        {new Intl.NumberFormat(
                                            'es-CO',
                                            {
                                                maximumFractionDigits: 0,
                                            },
                                        ).format(
                                            item.returnQuantity *
                                                item.price,
                                        )}
                                    </p>
                                    <p className='text-sm font-medium text-on-surface flex items-center gap-1 flex-wrap break-words'>
                                        {item.name}
                                        {item.variation_name && item.variation_name !== 'Default' && (
                                            <span className='inline-flex items-center gap-2 ml-1'>
                                                {item.variation_type && (
                                                    <span className='px-2.5 py-0.5 text-xs font-medium bg-accent/10 text-accent rounded-full'>
                                                        {item.variation_type.toLowerCase()}
                                                    </span>
                                                )}
                                                <span className='font-medium text-on-surface'>{item.variation_name}</span>
                                            </span>
                                        )}
                                    </p>
                                    <div className='flex flex-wrap gap-x-2'>
                                        <p className='text-xs text-muted'>
                                            Cant:{' '}
                                            {`${item.quantity} ${getUnitLabel(item.sold_in_unit_id, unitsOfMeasure)} x $ ${new Intl.NumberFormat(
                                                'es-CO',
                                                {
                                                    maximumFractionDigits: 0,
                                                },
                                            ).format(item.price)} c/u`}
                                        </p>
                                        {alreadyReturned > 0 && (
                                            <p className='text-xs text-red-500 font-medium'>
                                                {isFullyReturned
                                                    ? 'Devuelto completamente'
                                                    : `Devuelto: ${alreadyReturned} de ${item.quantity}`}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className='flex items-center gap-1'>
                                    <button
                                        onClick={() =>
                                            updateQuantity(
                                                item.id,
                                                item.returnQuantity - 1,
                                            )
                                        }
                                        className='w-7 h-7 rounded border border-outline flex items-center justify-center text-on-body hover:bg-hover-strong text-sm font-bold'
                                        disabled={
                                            item.returnQuantity <= 0 || isFullyReturned
                                        }>
                                        -
                                    </button>
                                    <span className='w-8 text-center text-sm font-bold tabular-nums'>
                                        {item.returnQuantity}
                                    </span>
                                    <button
                                        onClick={() =>
                                            updateQuantity(
                                                item.id,
                                                item.returnQuantity + 1,
                                            )
                                        }
                                        className='w-7 h-7 rounded border border-outline flex items-center justify-center text-on-body hover:bg-hover-strong text-sm font-bold'
                                        disabled={
                                            item.returnQuantity >=
                                                remaining || isFullyReturned
                                        }>
                                        +
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {totalReturn > 0 && (
                    <div className='flex justify-between items-center mt-4 pt-3 border-t border-divider'>
                        <span className='text-sm font-semibold text-on-body'>
                            Total a devolver:
                        </span>
                        <span className='text-lg font-bold text-red-600'>
                            $
                            {new Intl.NumberFormat('es-CO', {
                                maximumFractionDigits: 0,
                            }).format(totalReturn)}
                        </span>
                    </div>
                )}

                <textarea
                    value={returnReason}
                    onChange={(e) =>
                        setReturnReason(e.target.value)
                    }
                    placeholder='Motivo de la devolución (obligatorio)'
                    className='w-full border border-divider rounded-md py-3 px-4 text-sm focus:outline-none focus:border-accent focus:ring-0 transition-all duration-300 resize-none h-20 mt-4'
                />
            </div>

            <div className='px-6 pb-6 flex gap-3 border-t border-divider pt-4'>
                <button
                    onClick={onClose}
                    className='flex-1 py-2.5 border border-outline text-on-body rounded-lg font-medium hover:bg-hover transition text-sm cursor-pointer'>
                    Cancelar
                </button>
                <button
                    onClick={handleConfirm}
                    className='flex-1 py-2.5 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition text-sm disabled:opacity-50 flex items-center justify-center gap-2 disabled:cursor-not-allowed cursor-pointer'
                    disabled={
                        !returnReason.trim() || !hasSelectedItems || isReturning
                    }>
                    {isReturning ? <><Loader className='w-5 h-5 animate-spin text-accent' /> Devolviendo...</> : `Devolver ($${new Intl.NumberFormat('es-CO', {
                        maximumFractionDigits: 0,
                    }).format(totalReturn)})`}
                </button>
            </div>
        </Modal>
    )
}
