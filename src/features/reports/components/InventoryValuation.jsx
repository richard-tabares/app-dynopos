import { useState, useMemo } from 'react'

const formatCurrency = (value) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)

export const InventoryValuation = ({ data = [] }) => {
    const [visibleCount, setVisibleCount] = useState(10)

    const totalValuation = useMemo(() =>
        data.reduce((sum, item) => sum + Number(item.total_value), 0),
    [data])

    const visible = data.slice(0, visibleCount)

    return (
        <section className='bg-white border border-gray-300 p-6 shadow-xs rounded-lg'>
            <div className='flex items-center justify-between mb-6'>
                <h3 className='text-lg font-semibold text-gray-900'>Valorización de Inventario</h3>
                <div className='text-right'>
                    <p className='text-xs text-gray-500'>Valor Total</p>
                    <p className='text-xl font-bold text-primary-600'>{formatCurrency(totalValuation)}</p>
                </div>
            </div>
            <div className='overflow-x-auto'>
                {visible.length > 0 ? (
                    <>
                        <table className='w-full text-sm'>
                            <thead>
                                <tr className='border-b border-gray-200 text-gray-500 uppercase text-xs tracking-wider'>
                                    <th className='text-left py-3 px-4 font-medium'>Producto</th>
                                    <th className='text-right py-3 px-4 font-medium'>Stock</th>
                                    <th className='text-right py-3 px-4 font-medium'>Precio Unit.</th>
                                    <th className='text-right py-3 px-4 font-medium'>Valor Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visible.map((item, i) => (
                                    <tr key={i} className='border-b border-gray-100 hover:bg-gray-50'>
                                        <td className='py-3 px-4 font-medium text-gray-900'>{item.product_name}</td>
                                        <td className='py-3 px-4 text-right'>{item.current_stock}</td>
                                        <td className='py-3 px-4 text-right'>{formatCurrency(item.unit_price)}</td>
                                        <td className='py-3 px-4 text-right font-semibold'>{formatCurrency(item.total_value)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {visibleCount < data.length && (
                            <button
                                onClick={() => setVisibleCount(prev => prev + 10)}
                                className='w-full mt-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition cursor-pointer'
                            >
                                Cargar más ({data.length - visibleCount} restantes)
                            </button>
                        )}
                    </>
                ) : (
                    <div className='text-center text-gray-400 italic py-12'>Sin productos en inventario</div>
                )}
            </div>
        </section>
    )
}
