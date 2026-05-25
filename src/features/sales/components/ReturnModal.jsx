import { useState } from 'react'
import { X, RotateCcw, Loader } from 'lucide-react'
import { useEscape } from '../../../shared/helpers/useEscape'

const initialItemSelections = (items) =>
    items.map((item) => ({ ...item, returnQuantity: 0 }))

export const ReturnModal = ({ isOpen, sale, onClose, onConfirm }) => {
    const [selectedItems, setSelectedItems] = useState([])
    const [returnReason, setReturnReason] = useState('')
    const [isReturning, setIsReturning] = useState(false)

    useEscape(onClose)

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
        <section
            className='fixed inset-0 bg-overlay backdrop-blur-xs w-full h-full flex items-center justify-center z-50 p-4'>
            <section
                className='bg-surface rounded-xl border border-outline w-full max-w-md relative overflow-hidden max-h-[90vh] flex flex-col'
                onClick={(e) => e.stopPropagation()}>
                <section className='sticky top-0 bg-title-surface/50 backdrop-blur-3xl z-50 flex items-center justify-between px-6 py-3.5 border-b border-divider'>
                    <h2 className='text-lg font-semibold flex items-center gap-2'>
                        <RotateCcw className='w-5 h-5 text-red-600' />
                        Devolver Venta #
                        {String(sale.ticketNumber || sale.id).padStart(4, '0')}
                    </h2>
                    <button onClick={onClose} className='p-1 rounded-md text-accent hover:text-accent/85 border border-disabled hover:border-accent transition cursor-pointer'>
                        <X className='w-5 h-5' />
                    </button>
                </section>

                <div className='p-6 overflow-y-auto flex-1 scrollbar-none'>
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
                                        <p className='text-sm font-medium text-on-surface truncate'>
                                            {item.name}
                                        </p>
                                        <div className='flex flex-wrap gap-x-2'>
                                            <p className='text-xs text-muted'>
                                                Cant:{' '}
                                                {`${item.quantity} x $ ${new Intl.NumberFormat(
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
                        {isReturning ? <><Loader className='w-5 h-5 animate-spin' /> Devolviendo...</> : `Devolver ($${new Intl.NumberFormat('es-CO', {
                            maximumFractionDigits: 0,
                        }).format(totalReturn)})`}
                    </button>
                </div>
            </section>
        </section>
    )
}
