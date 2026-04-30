import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { AlertTriangle, Package, PackageCheck, Ban } from 'lucide-react'

const statusConfig = {
    'stock_bajo': { icon: AlertTriangle, label: 'Stock Bajo' },
    'con_stock': { icon: PackageCheck, label: 'Con Stock' },
    'sin_control': { icon: Package, label: 'Sin Control' },
}

export const StockStatusChart = ({ data = [], filter = 'stock_bajo' }) => {
    const filtered = filter === 'all' ? data : data.filter(d => d.stock_status === filter)
    const current = statusConfig[filter] || statusConfig.stock_bajo
    const Icon = current.icon

    return (
        <section className='bg-surface border border-outline p-6 shadow-xs rounded-lg'>
            <div className='flex items-center gap-2 mb-6'>
                <Icon className='w-5 h-5 text-primary-600' />
                <h3 className='text-lg font-semibold text-on-surface'>{current.label}</h3>
                <span className='ml-auto text-sm text-muted'>{filtered.length} productos</span>
            </div>
            <div className='h-[300px] w-full' style={{ position: 'relative', overflow: 'hidden' }}>
                {filtered.length > 0 ? (
                    <ResponsiveContainer width='100%' height='100%'>
                        <BarChart data={filtered} layout='vertical'>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--divider)" />
                            <XAxis type='number' axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted)' }} />
                            <YAxis
                                type='category'
                                dataKey="product_name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fill: 'var(--muted)' }}
                                width={150}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--outline)', borderRadius: '8px' }}
                                formatter={(value) => [value, 'Stock']}
                            />
                            <Bar dataKey="current_stock" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className='h-full flex items-center justify-center text-faint italic'>Sin productos en esta categoría</div>
                )}
            </div>
        </section>
    )
}
