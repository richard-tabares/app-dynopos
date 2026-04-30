import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

const formatCurrency = (value) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)

export const CategoryBarChart = ({ data = [] }) => {
    return (
        <section className='bg-surface border border-outline p-6 shadow-xs rounded-lg'>
            <h3 className='text-lg font-semibold mb-6 text-on-surface'>Ventas por Categoría</h3>
            <div className='h-[300px] w-full' style={{ position: 'relative', overflow: 'hidden' }}>
                {data.length > 0 ? (
                    <ResponsiveContainer width='100%' height='100%'>
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--divider)" />
                            <XAxis
                                dataKey="category_name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fill: 'var(--muted)' }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: 'var(--muted)' }}
                                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--outline)', borderRadius: '8px' }}
                                formatter={(value) => [formatCurrency(value), 'Total']}
                            />
                            <Legend
                                formatter={(value) => <span className='text-sm text-on-body'>{value}</span>}
                            />
                            <Bar dataKey="total_amount" name="Ventas" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className='h-full flex items-center justify-center text-faint italic'>Sin datos por categoría</div>
                )}
            </div>
        </section>
    )
}
