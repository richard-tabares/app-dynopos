import { useState } from 'react'
import { RotateCcw } from 'lucide-react'

const initialItemSelections = (items) =>
    items.map((item) => ({ ...item, returnQuantity: 0 }))

export const ReturnModal = ({ isOpen, sale, onClose, onConfirm }) => {
    const [selectedItems, setSelectedItems] = useState([])
    const [returnReason, setReturnReason] = useState('')

    if (!isOpen || !sale) return null

    const openReturnModal = () => {
        setSelectedItems(initialItemSelections(sale.items))
        setReturnReason('')
    }

    if (selectedItems.length === 0) openReturnModal()

    const toggleItem = (itemId) => {
        setSelectedItems((prev) =>
            prev.map((item) =>
                item.id === itemId
                    ? {
                          ...item,
                          returnQuantity:
                              item.returnQuantity > 0 ? 0 : item.quantity,
                      }
                    : item,
            ),
        )
    }

    const updateQuantity = (itemId, quantity) => {
        const item = selectedItems.find((i) => i.id === itemId)
        if (!item) return
        const clamped = Math.max(0, Math.min(quantity, item.quantity))
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

    const handleConfirm = () => {
        if (!returnReason.trim() || !hasSelectedItems) return

        const itemsToReturn = selectedItems
            .filter((i) => i.returnQuantity > 0)
            .map((i) => ({
                product_id: i.product_id,
                quantity: i.returnQuantity,
                unit_price: i.price,
                subtotal: i.returnQuantity * i.price,
            }))

        onConfirm(returnReason.trim(), itemsToReturn)
        setReturnReason('')
    }

    return (
        <section
            className='fixed inset-0 bg-gray-900/50 w-full h-full flex items-center justify-center z-[70]'
            onClick={onClose}>
            <section
                className='bg-white rounded-lg shadow-2xl w-full max-w-md relative overflow-hidden max-h-[90vh] flex flex-col'
                onClick={(e) => e.stopPropagation()}>
                <div className='p-6 text-center border-b border-gray-100'>
                    <div className='mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4'>
                        <RotateCcw className='w-6 h-6 text-red-600' />
                    </div>
                    <h3 className='text-lg font-bold text-gray-900 mb-2'>
                        Devolver Venta #
                        {String(sale.id).padStart(4, '0')}
                    </h3>
                </div>

                <div className='p-6 overflow-y-auto flex-1'>
                    <p className='text-sm font-semibold text-gray-700 mb-3'>
                        Selecciona los productos a devolver:
                    </p>
                    <div className='space-y-3'>
                        {selectedItems.map((item) => (
                            <div
                                key={item.id}
                                className='flex items-center gap-3 p-3 border border-gray-200 rounded-lg'>
                                <input
                                    type='checkbox'
                                    checked={item.returnQuantity > 0}
                                    onChange={() => toggleItem(item.id)}
                                    className='w-4 h-4 accent-red-600'
                                />

                                <div className='flex-1 min-w-0'>
                                    <p className='text-sm font-bold text-gray-900'>
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
                                    <p className='text-sm font-medium text-gray-900 truncate'>
                                        {item.name}
                                    </p>
                                    <div className='flex'>
                                        <p className='text-xs text-gray-500'>
                                            Cant:{' '}
                                            {`${item.quantity} x $ ${new Intl.NumberFormat(
                                                'es-CO',
                                                {
                                                    maximumFractionDigits: 0,
                                                },
                                            ).format(item.price)} c/u`}
                                        </p>
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
                                        className='w-7 h-7 rounded border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 text-sm font-bold'
                                        disabled={
                                            item.returnQuantity <= 0
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
                                        className='w-7 h-7 rounded border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 text-sm font-bold'
                                        disabled={
                                            item.returnQuantity >=
                                            item.quantity
                                        }>
                                        +
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {totalReturn > 0 && (
                        <div className='flex justify-between items-center mt-4 pt-3 border-t border-gray-200'>
                            <span className='text-sm font-semibold text-gray-700'>
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
                        className='w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none h-20 mt-4'
                    />
                </div>

                <div className='px-6 pb-6 flex gap-3 border-t border-gray-100 pt-4'>
                    <button
                        onClick={onClose}
                        className='flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition text-sm'>
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        className='flex-1 py-2.5 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition text-sm disabled:opacity-50'
                        disabled={
                            !returnReason.trim() || !hasSelectedItems
                        }>
                        Devolver ($
                        {new Intl.NumberFormat('es-CO', {
                            maximumFractionDigits: 0,
                        }).format(totalReturn)}
                        )
                    </button>
                </div>
            </section>
        </section>
    )
}
