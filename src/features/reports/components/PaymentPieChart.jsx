import { CreditCard } from 'lucide-react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'

const formatCurrency = (value) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

export const PaymentPieChart = ({ data = [] }) => {
    return (
        <section className='bg-white border border-gray-300 p-6 shadow-xs rounded-lg'>
            <div className='flex items-center gap-2 mb-6'>
                <div className='p-2 rounded-lg bg-blue-50'>
                    <CreditCard className='w-5 h-5 text-blue-600' />
                </div>
                <h3 className='text-lg font-semibold text-gray-900'>Ventas por Método de Pago</h3>
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
                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                formatter={(value) => [formatCurrency(value), 'Total']}
                            />
                            <Legend
                                formatter={(value) => <span className='text-sm text-gray-600'>{value}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className='h-full flex items-center justify-center text-gray-400 italic'>Sin datos de métodos de pago</div>
                )}
            </div>
        </section>
    )
}
