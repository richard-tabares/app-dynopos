import { useState } from 'react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { Undo2 } from 'lucide-react'

const formatCurrency = (value) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value)

export const ReturnsChart = ({ data = [], onReturnClick }) => {
    const [visibleCount, setVisibleCount] = useState(10)

    const totalReturns = data.reduce((sum, r) => sum + Number(r.total_amount), 0)

    return (
        <section className='bg-white border border-gray-300 p-6 shadow-xs rounded-lg'>
            <div className='flex items-start justify-between mb-6'>
                <div className='flex items-center gap-3'>
                    <div className='p-2 rounded-lg bg-red-50'>
                        <Undo2 className='w-5 h-5 text-red-500' />
                    </div>
                    <div>
                        <h3 className='text-lg font-semibold text-gray-900'>Devoluciones</h3>
                        <p className='text-sm text-gray-500'>Período seleccionado</p>
                    </div>
                </div>
                <div className='text-right'>
                    <p className='text-xs text-gray-500'>Total devuelto</p>
                    <p className='text-lg font-bold text-red-600'>{formatCurrency(totalReturns)}</p>
                </div>
            </div>

            <div className='h-[300px] w-full' style={{ position: 'relative', overflow: 'hidden' }}>
                {data.length > 0 ? (
                    <ResponsiveContainer width='100%' height='100%'>
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis
                                dataKey="return_date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                tickFormatter={(val) => {
                                    const parts = val?.split('-')
                                    return parts ? `${parts[2]}/${parts[1]}` : val
                                }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
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
                    <div className='h-full flex items-center justify-center text-gray-400 italic'>Sin devoluciones en este período</div>
                )}
            </div>

            {data.length > 0 && (
                <div className='overflow-x-auto mt-6'>
                    <table className='w-full text-sm'>
                        <thead>
                            <tr className='border-b border-gray-200 text-gray-500 uppercase text-xs tracking-wider'>
                                <th className='text-left py-3 px-4 font-medium'>Fecha</th>
                                <th className='text-right py-3 px-4 font-medium'>Cant. Devuelta</th>
                                <th className='text-right py-3 px-4 font-medium'>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.slice(0, visibleCount).map((item, i) => (
                                <tr
                                    key={i}
                                    className='border-b border-gray-100 hover:bg-red-50 cursor-pointer transition'
                                    onClick={() => onReturnClick && onReturnClick(item)}
                                >
                                    <td className='py-3 px-4'>{item.return_date}</td>
                                    <td className='py-3 px-4 text-right'>{item.total_items_returned}</td>
                                    <td className='py-3 px-4 text-right font-medium text-red-600'>{formatCurrency(item.total_amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {visibleCount < data.length && (
                        <button
                            onClick={() => setVisibleCount(prev => prev + 10)}
                            className='w-full mt-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition cursor-pointer'
                        >
                            Cargar más ({data.length - visibleCount} restantes)
                        </button>
                    )}
                </div>
            )}
        </section>
    )
}
