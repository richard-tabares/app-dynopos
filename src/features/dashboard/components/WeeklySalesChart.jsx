import { TrendingUp } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

export const WeeklySalesChart = ({ data = [] }) => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    
    const chartData = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - (6 - i))
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return {
            name: days[d.getDay()],
            fullDate: `${year}-${month}-${day}`,
            ventas: 0
        }
    })

    data.forEach(sale => {
        const saleDate = sale.created_at
        const dayEntry = chartData.find(d => d.fullDate === saleDate)
        if (dayEntry) {
            dayEntry.ventas += sale.total_amount
        }
    })

    return (
        <section className='bg-surface border border-outline p-6 shadow-xs rounded-lg h-[400px]'>
            <div className='flex items-center gap-2 text-accent mb-6'>
                <TrendingUp className='w-5 h-5' />
                <h3 className='text-lg font-semibold text-on-surface'>Ventas de la Semana</h3>
            </div>
            <div className='h-[300px] w-full'>
                <ResponsiveContainer width='100%' height='100%'>
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--divider)" />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 12, fill: 'var(--muted)' }} 
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 12, fill: 'var(--muted)' }}
                            tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip 
                            contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--outline)', borderRadius: '8px' }}
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
