import { useState, useEffect } from 'react'
import { CreditCard, Search, Loader, AlertCircle } from 'lucide-react'
import { getPayments } from './helpers/getPayments.js'
import { useFormatDate } from '../../helpers/useFormatDate.js'

const STATUS_BADGES = {
    approved: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400',
    pending: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400',
    declined: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400',
    error: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400',
    refunded: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400',
}

const STATUS_LABELS = {
    approved: 'Aprobado',
    pending: 'Pendiente',
    declined: 'Rechazado',
    error: 'Error',
    refunded: 'Reembolsado',
}

const PAYMENT_METHODS = {
    card: 'Tarjeta',
    pse: 'PSE',
    transfer: 'Transferencia',
}

const FREQ_LABELS = {
    monthly: 'Mensual',
    quarterly: 'Trimestral',
    annual: 'Anual',
}

const formatCurrency = (value) =>
    new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(value || 0)

export const Payments = () => {
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [search, setSearch] = useState('')
    const formatDate = useFormatDate()

    useEffect(() => {
        let mounted = true
        ;(async () => {
            try {
                const data = await getPayments()
                if (mounted) setTransactions(data)
            } catch (err) {
                if (mounted) setError(err.message)
            } finally {
                if (mounted) setLoading(false)
            }
        })()
        return () => { mounted = false }
    }, [])

    const filtered = transactions.filter((t) => {
        if (!search) return true
        const q = search.toLowerCase()
        return (
            t.business_name?.toLowerCase().includes(q) ||
            t.reference?.toLowerCase().includes(q) ||
            t.status?.toLowerCase().includes(q)
        )
    })

    if (loading) {
        return (
            <section className='flex flex-col gap-6'>
                <section>
                    <h1 className='text-2xl font-bold'>Pagos</h1>
                    <p className='text-on-body'>Historial de transacciones</p>
                </section>
                <section className='bg-surface border border-outline shadow-xs rounded-lg p-6'>
                    <div className='space-y-4'>
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className='flex gap-4'>
                                <div className='h-4 bg-hover-icon rounded w-1/5 animate-pulse' />
                                <div className='h-4 bg-hover-icon rounded w-1/5 animate-pulse' />
                                <div className='h-4 bg-hover-icon rounded w-1/6 animate-pulse' />
                                <div className='h-4 bg-hover-icon rounded w-1/6 animate-pulse' />
                                <div className='h-4 bg-hover-icon rounded w-1/6 animate-pulse' />
                            </div>
                        ))}
                    </div>
                </section>
            </section>
        )
    }

    return (
        <section className='flex flex-col gap-6'>
            <section>
                <h1 className='text-2xl font-bold'>Pagos</h1>
                <p className='text-on-body'>Historial de transacciones de todos los clientes</p>
            </section>

            {error && (
                <div className='flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg'>
                    <AlertCircle className='w-5 h-5 text-red-500 shrink-0 mt-0.5' />
                    <p className='text-sm text-red-700 dark:text-red-300'>{error}</p>
                </div>
            )}

            <section className='bg-surface border border-outline shadow-xs rounded-lg'>
                <section className='border-b border-divider px-6 py-4 bg-subtle'>
                    <h2 className='text-lg font-semibold flex items-center gap-2'>
                        <CreditCard className='w-5 h-5 text-accent' />
                        Transacciones
                        <span className='text-sm text-muted font-medium'>({filtered.length})</span>
                    </h2>
                </section>

                <section className='p-6 flex flex-col gap-4'>
                    <div className='relative'>
                        <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-faint' />
                        <input
                            type='search'
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder='Buscar por cliente, referencia o estado...'
                            className='w-full border border-divider rounded-md pl-10 pr-3 py-3 text-sm focus:outline-none focus:border-accent focus:ring-0 transition-all duration-300'
                        />
                    </div>

                    {filtered.length === 0 ? (
                        <div className='flex flex-col items-center justify-center py-12 text-center'>
                            <CreditCard className='w-12 h-12 text-faint mb-3' />
                            <p className='text-muted font-medium'>
                                {search ? 'No se encontraron transacciones' : 'No hay transacciones registradas'}
                            </p>
                            <p className='text-faint text-sm mt-1'>
                                {search ? 'Intenta con otros términos de búsqueda' : 'Las transacciones aparecerán cuando los clientes realicen pagos'}
                            </p>
                        </div>
                    ) : (
                        <div className='overflow-x-auto'>
                            <table className='w-full text-sm overflow-hidden rounded-t-lg'>
                                <thead>
                                    <tr className='bg-subtle border-b border-divider text-muted uppercase text-xs tracking-wider'>
                                        <th className='text-left py-3 px-4 font-medium'>Cliente</th>
                                        <th className='text-left py-3 px-4 font-medium'>Referencia</th>
                                        <th className='text-right py-3 px-4 font-medium'>Valor</th>
                                        <th className='text-left py-3 px-4 font-medium'>Método</th>
                                        <th className='text-left py-3 px-4 font-medium'>Frecuencia</th>
                                        <th className='text-left py-3 px-4 font-medium'>Estado</th>
                                        <th className='text-left py-3 px-4 font-medium'>Fecha</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((tx) => (
                                        <tr key={tx.id} className='border-b border-divider-light hover:bg-hover'>
                                            <td className='py-3 px-4 font-medium text-on-surface'>
                                                {tx.business_name || 'Desconocido'}
                                            </td>
                                            <td className='py-3 px-4 text-muted font-mono text-xs'>
                                                {tx.reference?.slice(0, 12)}...
                                            </td>
                                            <td className='py-3 px-4 text-right font-bold text-on-surface'>
                                                ${formatCurrency(tx.amount)}
                                            </td>
                                            <td className='py-3 px-4 text-on-body'>
                                                {PAYMENT_METHODS[tx.payment_method] || tx.payment_method || '—'}
                                            </td>
                                            <td className='py-3 px-4 text-muted text-xs'>
                                                {FREQ_LABELS[tx.billing_frequency] || '—'}
                                            </td>
                                            <td className='py-3 px-4 whitespace-nowrap'>
                                                <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${STATUS_BADGES[tx.status] || ''}`}>
                                                    {STATUS_LABELS[tx.status] || tx.status}
                                                </span>
                                            </td>
                                            <td className='py-3 px-4 text-muted text-xs'>
                                                {formatDate(tx.created_at,{ year: 'numeric', month: 'numeric', day: 'numeric' })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </section>
        </section>
    )
}
