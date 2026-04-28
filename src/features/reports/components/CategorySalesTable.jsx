const formatCurrency = (value) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)

export const CategorySalesTable = ({ data = [] }) => {
    return (
        <section className='bg-white border border-gray-300 p-6 shadow-xs rounded-lg'>
            <h3 className='text-lg font-semibold mb-6 text-gray-900'>Ventas por Categoría</h3>
            <div className='overflow-x-auto'>
                {data.length > 0 ? (
                    <table className='w-full text-sm'>
                        <thead>
                            <tr className='border-b border-gray-200 text-gray-500 uppercase text-xs tracking-wider'>
                                <th className='text-left py-3 px-4 font-medium'>Categoría</th>
                                <th className='text-right py-3 px-4 font-medium'>Cant. Ventas</th>
                                <th className='text-right py-3 px-4 font-medium'>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item, i) => (
                                <tr key={i} className='border-b border-gray-100 hover:bg-gray-50'>
                                    <td className='py-3 px-4 font-medium text-gray-900'>{item.category_name}</td>
                                    <td className='py-3 px-4 text-right'>{item.sale_count}</td>
                                    <td className='py-3 px-4 text-right font-semibold'>{formatCurrency(item.total_amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className='text-center text-gray-400 italic py-12'>Sin datos por categoría</div>
                )}
            </div>
        </section>
    )
}
