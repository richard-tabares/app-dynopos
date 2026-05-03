import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { Undo2 } from 'lucide-react'

const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

const formatCurrency = (value) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)

export const ReturnsChart = ({ data = [], showDayNames = false }) => {
    const chartData = [...data].reverse()
    const totalReturns = data.reduce((sum, r) => sum + Number(r.total_amount), 0)

    const formatTick = (val) => {
        if (showDayNames && val) {
            const d = new Date(val + 'T12:00:00')
            return dayNames[d.getDay()]
        }
        const parts = val?.split('-')
        return parts ? `${parts[2]}/${parts[1]}` : val
    }

    return (
        <section className='bg-surface border border-outline p-6 shadow-xs rounded-lg'>
            <div className='flex items-start justify-between mb-6'>
                <div className='flex items-center gap-3'>
                    <Undo2 className='w-5 h-5 text-red-500' />
                    <div>
                        <h3 className='text-lg font-semibold text-on-surface'>Devoluciones</h3>
                        <p className='text-sm text-muted'>Período seleccionado</p>
                    </div>
                </div>
                <div className='text-right'>
                    <p className='text-xs text-muted'>Total devuelto</p>
                    <p className='text-lg font-bold text-red-600'>{formatCurrency(totalReturns)}</p>
                </div>
            </div>

            <div className='h-[300px] w-full' style={{ position: 'relative', overflow: 'hidden' }}>
                {data.length > 0 ? (
                    <ResponsiveContainer width='100%' height='100%'>
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--divider)" />
                            <XAxis
                                dataKey="return_date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: 'var(--muted)' }}
                                tickFormatter={formatTick}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: 'var(--muted)' }}
                                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--outline)', borderRadius: '8px' }}
                                formatter={(value) => [formatCurrency(value), 'Devoluciones']}
                                labelFormatter={(label) => `Fecha: ${label}`}
                            />
                            <Area
                                type="monotone"
                                dataKey="total_amount"
                                stroke="#ef4444"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorReturns)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className='h-full flex items-center justify-center text-faint italic'>Sin devoluciones en este período</div>
                )}
            </div>
        </section>
    )
}
