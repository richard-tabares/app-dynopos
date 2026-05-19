import { Tags } from 'lucide-react'

const formatCurrency = (value) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)

export const CategorySalesTable = ({ data = [] }) => {
    return (
        <section className='bg-surface border border-outline p-6 shadow-xs rounded-lg'>
            <div className='flex items-center gap-2 text-accent mb-6'>
                <Tags className='w-5 h-5' />
                <h3 className='text-lg font-semibold text-on-surface'>Ventas por Categoría</h3>
            </div>
            <div className='overflow-x-auto'>
                {data.length > 0 ? (
                    <table className='w-full text-sm overflow-hidden rounded-t-lg'>
                        <thead>
                            <tr className='bg-subtle border-b border-divider text-muted uppercase text-xs tracking-wider'>
                                <th className='text-left py-3 px-4 font-medium'>Categoría</th>
                                <th className='text-right py-3 px-4 font-medium'>Cant. Ventas</th>
                                <th className='text-right py-3 px-4 font-medium'>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item, i) => (
                                <tr key={i} className='border-b border-divider-light hover:bg-hover'>
                                    <td className='py-3 px-4 font-medium text-on-surface'>{item.category_name}</td>
                                    <td className='py-3 px-4 text-right'>{item.sale_count}</td>
                                    <td className='py-3 px-4 text-right font-semibold'>{formatCurrency(item.total_amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className='text-center text-faint italic py-12'>Sin datos por categoría</div>
                )}
            </div>
        </section>
    )
}
