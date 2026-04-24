import { Minus, Plus, Trash2, ShoppingCart, CreditCard, Banknote, ReceiptText } from 'lucide-react'
import { useStore } from '../../../app/providers/store'
import { useState } from 'react'

export const OrderSidebar = ({ onProcessSale }) => {
    const { cart, removeFromCart, updateQuantity } = useStore()

    const [paymentMethod, setPaymentMethod] = useState('Efectivo')
    const [amountReceived, setAmountReceived] = useState(0)

    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)
    const tax = subtotal * 0.08 // Example 8% tax
    const total = subtotal + tax
    const changeValue = Math.max(0, (parseFloat(amountReceived) || 0) - total)

    const handleAmountReceivedChange = (e) => {
        const value = e.target.value
        setAmountReceived(value)
    }

    const handleQuickCash = (amount) => {
        setAmountReceived(amount)
    }

    const paymentMethods = [
        { id: 'Efectivo', label: 'Efectivo', icon: Banknote },
        { id: 'Tarjeta', label: 'Tarjeta', icon: CreditCard },
        { id: 'Transferencia', label: 'Transferencia', icon: ReceiptText },
    ]

    return (
        <section className='bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-[calc(100vh-140px)] sticky top-20'>
            <div className='p-6 border-b border-gray-100'>
                <h2 className='text-xl font-bold flex items-center gap-2'>
                    <ShoppingCart className='w-5 h-5 text-primary-600' />
                    Orden Actual
                </h2>
                <p className='text-sm text-gray-500 mt-1'>
                    {cart.length} {cart.length === 1 ? 'item' : 'items'}
                </p>
            </div>

            <div className='flex-1 overflow-y-auto p-6 flex flex-col gap-4 scrollbar-thin'>
                {cart.length === 0 ? (
                    <div className='flex-1 flex flex-col items-center justify-center text-gray-400 gap-2'>
                        <ShoppingCart className='w-12 h-12 opacity-20' />
                        <p className='font-medium'>Tu carrito está vacío</p>
                    </div>
                ) : (
                    cart.map((item) => (
                        <div key={item.id} className='flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100'>
                            <div className='flex-1'>
                                <h4 className='font-bold text-sm text-gray-900 truncate max-w-[120px]'>
                                    {item.name}
                                </h4>
                                <p className='text-primary-600 font-bold text-xs'>
                                    ${parseFloat(item.price).toFixed(2)}
                                </p>
                            </div>
                            
                            <div className='flex items-center gap-2'>
                                <div className='flex items-center bg-white border border-gray-200 rounded-md overflow-hidden'>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        className='p-1 hover:bg-gray-100 text-gray-500 cursor-pointer disabled:opacity-30'
                                        disabled={item.quantity <= 1}
                                    >
                                        <Minus className='w-3 h-3' />
                                    </button>
                                    <span className='w-8 text-center text-sm font-bold'>
                                        {item.quantity}
                                    </span>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        className='p-1 hover:bg-gray-100 text-gray-500 cursor-pointer'
                                    >
                                        <Plus className='w-3 h-3' />
                                    </button>
                                </div>
                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className='p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer'
                                >
                                    <Trash2 className='w-4 h-4' />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className='p-6 bg-gray-50/50 border-t border-gray-100'>
                <div className='flex flex-col gap-2 mb-6'>
                    <div className='flex justify-between text-sm text-gray-600'>
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className='flex justify-between text-sm text-gray-600'>
                        <span>Impuesto (8%)</span>
                        <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className='flex justify-between text-xl font-bold text-gray-900 mt-2 pt-2 border-t border-gray-200'>
                        <span>Total</span>
                        <span className='text-primary-600'>${total.toFixed(2)}</span>
                    </div>
                </div>

                {/* Payment Methods */}
                <div className='mb-6'>
                    <h3 className='text-sm font-medium text-gray-700 mb-2'>Método de Pago</h3>
                    <div className='grid grid-cols-3 gap-2'>
                        {paymentMethods.map((method) => {
                            const Icon = method.icon
                            return (
                                <button
                                    key={method.id}
                                    onClick={() => setPaymentMethod(method.id)}
                                    className={`flex flex-col items-center justify-center p-3 border rounded-lg transition-colors ${
                                        paymentMethod === method.id
                                            ? 'border-primary-600 bg-primary-50 text-primary-600'
                                            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <Icon className='w-5 h-5 mb-1' />
                                    <span className='text-xs font-medium'>{method.label}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Amount Received */}
                {paymentMethod === 'Efectivo' && (
                    <div className='mb-6'>
                        <h3 className='text-sm font-medium text-gray-700 mb-2'>Monto Recibido (Opcional)</h3>
                        <div className='relative'>
                            <span className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'>$</span>
                            <input
                                type='number'
                                value={amountReceived}
                                onChange={handleAmountReceivedChange}
                                placeholder='0.00'
                                className='w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all'
                            />
                        </div>
                        <div className='flex gap-2 mt-2'>
                            {[20, 50, 100, 200].map((amount) => (
                                <button
                                    key={amount}
                                    onClick={() => handleQuickCash(amount)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                                        amountReceived === amount
                                            ? 'bg-primary-600 text-white border-primary-600'
                                            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    ${amount}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Change */}
                {paymentMethod === 'Efectivo' && (amountReceived > 0 && amountReceived >= total) && (
                    <div className='flex justify-between items-center bg-green-50 text-green-800 p-4 rounded-lg font-bold text-lg mb-6'>
                        <span>Cambio:</span>
                        <span>${changeValue.toFixed(2)}</span>
                    </div>
                )}

                <button
                    onClick={() => onProcessSale(paymentMethod, amountReceived, total, changeValue)}
                    disabled={cart.length === 0 || (paymentMethod === 'Efectivo' && amountReceived < total)}
                    className='w-full py-4 bg-primary-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
                >
                    <ShoppingCart className='w-5 h-5' />
                    Procesar Venta
                </button>
            </div>
        </section>
    )
}
