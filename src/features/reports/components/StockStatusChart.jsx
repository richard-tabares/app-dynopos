import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { AlertTriangle, Package, PackageCheck, Ban } from 'lucide-react'

const statusIcons = {
    'stock_bajo': { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50', label: 'Stock Bajo' },
    'con_stock': { icon: PackageCheck, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Con Stock' },
    'sin_control': { icon: Package, color: 'text-gray-500', bg: 'bg-gray-50', label: 'Sin Control' },
}

export const StockStatusChart = ({ data = [], filter = 'stock_bajo' }) => {
    const filtered = filter === 'all' ? data : data.filter(d => d.stock_status === filter)
    const current = statusIcons[filter] || statusIcons.stock_bajo
    const Icon = current.icon

    return (
        <section className='bg-white border border-gray-300 p-6 shadow-xs rounded-lg'>
            <div className='flex items-center gap-2 mb-6'>
                <div className={`p-2 rounded-lg ${current.bg}`}>
                    <Icon className={`w-5 h-5 ${current.color}`} />
                </div>
                <h3 className='text-lg font-semibold text-gray-900'>{current.label}</h3>
                <span className='ml-auto text-sm text-gray-500'>{filtered.length} productos</span>
            </div>
            <div className='h-[300px] w-full' style={{ position: 'relative', overflow: 'hidden' }}>
                {filtered.length > 0 ? (
                    <ResponsiveContainer width='100%' height='100%'>
                        <BarChart data={filtered} layout='vertical'>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                            <XAxis type='number' axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                            <YAxis
                                type='category'
                                dataKey="product_name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fill: '#6b7280' }}
                                width={150}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                formatter={(value) => [value, 'Stock']}
                            />
                            <Bar dataKey="current_stock" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className='h-full flex items-center justify-center text-gray-400 italic'>Sin productos en esta categoría</div>
                )}
            </div>
        </section>
    )
}
