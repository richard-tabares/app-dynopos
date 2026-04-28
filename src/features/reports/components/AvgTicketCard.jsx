import { Receipt } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

const formatCurrency = (value) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)

export const AvgTicketCard = ({ overallAvgTicket = 0, tickets = [] }) => {
    const chartData = tickets
        .slice()
        .reverse()
        .slice(-14)
        .map(t => ({
            date: t.sale_date,
            ticket: Math.round(Number(t.total_amount) / Number(t.sale_count)),
        }))

    return (
        <section className='bg-white border border-gray-300 p-6 shadow-xs rounded-lg'>
            <div className='flex items-start justify-between mb-6'>
                <div className='flex items-center gap-3'>
                    <div className='p-3 rounded-lg bg-primary-50'>
                        <Receipt className='w-6 h-6 text-primary-600' />
                    </div>
                    <div>
                        <h3 className='text-lg font-semibold text-gray-900'>Ticket Promedio</h3>
                        <p className='text-sm text-gray-500'>Período seleccionado</p>
                    </div>
                </div>
                <div className='text-right'>
                    <p className='text-3xl font-bold text-primary-600'>{formatCurrency(overallAvgTicket)}</p>
                </div>
            </div>

            {chartData.length > 0 && (
                <div className='h-[200px] w-full' style={{ position: 'relative', overflow: 'hidden' }}>
                    <ResponsiveContainer width='100%' height='100%'>
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorTicket" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }}
                                tickFormatter={(val) => {
                                    const parts = val?.split('-')
                                    return parts ? `${parts[2]}/${parts[1]}` : val
                                }}
                            />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280' }}
                                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                formatter={(value) => [formatCurrency(value), 'Ticket Prom.']}
                            />
                            <Area type="monotone" dataKey="ticket" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorTicket)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
        </section>
    )
}
