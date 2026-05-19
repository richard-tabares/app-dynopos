import { Minus, Plus, Trash2, ShoppingCart, CreditCard, Banknote, ReceiptText } from 'lucide-react'
import { useStore } from '../../../app/providers/store'
import { useState } from 'react'

export const OrderSidebar = ({ onProcessSale }) => {
    const { cart, removeFromCart, updateQuantity, clearCart } = useStore()

    const [paymentMethod, setPaymentMethod] = useState('Efectivo')

    const total = (cart || []).reduce((acc, item) => acc + (item.price * item.quantity), 0)

    const paymentMethods = [
        { id: 'Efectivo', label: 'Efectivo', icon: Banknote },
        // { id: 'Tarjeta', label: 'Tarjeta', icon: CreditCard },
        { id: 'Transferencia', label: 'Transferencia', icon: ReceiptText },
    ]

    return (
        <section className='bg-surface rounded-lg border border-outline shadow-xs flex flex-col lg:h-[calc(100vh-140px)] lg:sticky lg:top-20'>
            <div className='p-6 border-b border-divider-light'>
                <div className='flex items-center justify-between'>
                    <h2 className='text-xl font-bold flex items-center gap-2'>
                        <ShoppingCart className='w-5 h-5 text-accent' />
                        Orden Actual
                    </h2>
                    {cart?.length > 0 && (
                        <button
                            onClick={clearCart}
                            className='flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium cursor-pointer'
                        >
                            <Trash2 className='w-3.5 h-3.5' />
                            Limpiar
                        </button>
                    )}
                </div>
                <p className='text-sm text-muted mt-1'>
                    {cart?.length} {cart?.length === 1 ? 'item' : 'items'}
                </p>
            </div>

            <div className='flex-1 overflow-y-auto p-6 flex flex-col gap-4 scrollbar-thin'>
                {!cart?.length ? (
                    <div className='flex-1 flex flex-col items-center justify-center text-faint gap-2'>
                        <ShoppingCart className='w-12 h-12 opacity-20' />
                        <p className='font-medium'>Tu carrito está vacío</p>
                    </div>
                ) : (
                    cart?.map((item) => (
                        <div key={item.id} className='flex items-center gap-4 bg-subtle p-3 rounded-lg border border-divider-light'>
                            <div className='flex-1'>
                                <h4 className='font-bold text-sm text-on-surface truncate max-w-30'>
                                    {item.name}
                                </h4>
                                <p className='text-accent font-bold text-xs'>
                                    ${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(item.price)}
                                </p>
                            </div>
                            
                            <div className='flex items-center gap-2'>
                                <div className='flex items-center bg-surface border border-divider rounded-md overflow-hidden'>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        className='p-1 hover:bg-hover-strong text-muted cursor-pointer disabled:opacity-30'
                                        disabled={item.quantity <= 1}
                                    >
                                        <Minus className='w-3 h-3' />
                                    </button>
                                    <span className='w-8 text-center text-sm font-bold'>
                                        {item.quantity}
                                    </span>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        className='p-1 hover:bg-hover-strong text-muted cursor-pointer disabled:opacity-30'
                                        disabled={item.track_stock !== false && item.quantity >= (item.inventory?.[0]?.stock || 0)}
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

            <div className='p-6 bg-subtle border-t border-divider-light'>
                <div className='flex flex-col gap-2 mb-6'>
                    <div className='flex justify-between text-sm text-on-body'>
                        <span>Subtotal</span>
                        <span>${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(total)}</span>
                    </div>
                    <div className='flex justify-between text-xl font-bold text-on-surface mt-2 pt-2 border-t border-divider'>
                        <span>Total</span>
                        <span className='text-accent'>${new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(total)}</span>
                    </div>
                </div>

                {/* Payment Methods */}
                <div className='mb-6'>
                    <h3 className='text-sm font-medium text-on-body mb-2'>Método de Pago</h3>
                    <div className='grid grid-cols-3 gap-2'>
                        {paymentMethods.map((method) => {
                            const Icon = method.icon
                            return (
                                <button
                                    key={method.id}
                                    onClick={() => setPaymentMethod(method.id)}
                                    className={`flex flex-col items-center justify-center p-3 border rounded-lg transition-colors cursor-pointer ${
                                        paymentMethod === method.id
                                            ? 'border-accent bg-accent text-surface hover:bg-accent/85'
                                            : 'border-divider bg-surface text-on-body hover:bg-hover'
                                    }`}
                                >
                                    <Icon className='w-5 h-5 mb-1' />
                                    <span className='text-xs font-medium'>{method.label}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                <button
                    onClick={() => onProcessSale(paymentMethod, total)}
                    disabled={!cart?.length}
                    className='w-full py-4 bg-accent text-surface rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-accent/85 transition-all shadow-lg shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
                >
                    <ShoppingCart className='w-5 h-5' />
                    Procesar Venta
                </button>
            </div>
        </section>
    )
}
