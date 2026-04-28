import { ShoppingCart } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export const SalesCountChart = ({ data = [], showDayNames = false }) => {
    const formatTick = (val) => {
        if (showDayNames && val) {
            const d = new Date(val + 'T12:00:00')
            return dayNames[d.getDay()]
        }
        const parts = val?.split('-')
        return parts ? `${parts[2]}/${parts[1]}` : val
    }
    return (
        <section className='bg-white border border-gray-300 p-6 shadow-xs rounded-lg'>
            <div className='flex items-center gap-2 mb-6'>
                <div className='p-2 rounded-lg bg-blue-50'>
                    <ShoppingCart className='w-5 h-5 text-blue-600' />
                </div>
                <h3 className='text-lg font-semibold text-gray-900'>Cantidad de Ventas</h3>
            </div>
            <div className='h-[300px] w-full' style={{ position: 'relative', overflow: 'hidden' }}>
                {data.length > 0 ? (
                    <ResponsiveContainer width='100%' height='100%'>
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis
                                dataKey="sale_date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                tickFormatter={formatTick}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                allowDecimals={false}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                formatter={(value) => [value, 'Ventas']}
                                labelFormatter={(label) => `Fecha: ${label}`}
                            />
                            <Area
                                type="monotone"
                                dataKey="sale_count"
                                stroke="#10b981"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorCount)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className='h-full flex items-center justify-center text-gray-400 italic'>Sin datos de ventas</div>
                )}
            </div>
        </section>
    )
}
