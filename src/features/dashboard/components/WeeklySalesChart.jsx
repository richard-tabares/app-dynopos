import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

export const WeeklySalesChart = ({ data = [] }) => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    
    const chartData = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - (6 - i))
        return {
            name: days[d.getDay()],
            fullDate: d.toISOString().split('T')[0],
            ventas: 0
        }
    })

    data.forEach(sale => {
        const saleDate = new Date(sale.created_at).toISOString().split('T')[0]
        const dayEntry = chartData.find(d => d.fullDate === saleDate)
        if (dayEntry) {
            dayEntry.ventas += sale.total_amount
        }
    })

    return (
        <section className='bg-white border border-gray-300 p-6 shadow-xs rounded-lg h-[400px]'>
            <h3 className='text-lg font-semibold mb-6'>Ventas de la Semana</h3>
            <div className='h-[300px] w-full'>
                <ResponsiveContainer width='100%' height='100%'>
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 12, fill: '#6b7280' }} 
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                            tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                            formatter={(value) => [`$${new Intl.NumberFormat('es-CO').format(value)}`, 'Ventas']}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="ventas" 
                            stroke="#0ea5e9" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorSales)" 
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </section>
    )
}
