import { CreditCard } from 'lucide-react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'

const formatCurrency = (value) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

export const PaymentPieChart = ({ data = [] }) => {
    const total = data.reduce((sum, item) => sum + item.total_amount, 0)

    return (
        <section className='bg-surface border border-outline p-6 shadow-xs rounded-lg'>
            <div className='flex items-center gap-2 text-accent mb-6'>
                <CreditCard className='w-5 h-5' />
                <h3 className='text-lg font-semibold text-on-surface'>Ventas por Método de Pago</h3>
            </div>
            <div className='h-[300px] w-full' style={{ position: 'relative', overflow: 'hidden' }}>
                {data.length > 0 ? (
                    <ResponsiveContainer width='100%' height='100%'>
                        <PieChart>
                            <Pie
                                data={data}
                                dataKey="total_amount"
                                nameKey="payment_method"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                innerRadius={60}
                                paddingAngle={3}
                            >
                                {data.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--outline)', borderRadius: '8px' }}
                                formatter={(value) => {
                                    const pct = total > 0 ? ((value / total) * 100).toFixed(1) : 0
                                    return [`${formatCurrency(value)} (${pct}%)`, 'Total']
                                }}
                            />
                            <Legend
                                formatter={(value) => {
                                    const item = data.find(d => d.payment_method === value)
                                    const pct = item && total > 0 ? ((item.total_amount / total) * 100).toFixed(1) : 0
                                    return <span className='text-sm text-on-body'>{`${value} (${pct}%)`}</span>
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className='h-full flex items-center justify-center text-faint italic'>Sin datos de métodos de pago</div>
                )}
            </div>
        </section>
    )
}
