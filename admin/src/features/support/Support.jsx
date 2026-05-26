import { useState, useEffect } from 'react'
import { LifeBuoy, Search, Loader, AlertCircle } from 'lucide-react'
import { getTickets } from './helpers/getTickets.js'
import { TicketDetailModal } from './TicketDetailModal.jsx'
import { useFormatDate } from '../../helpers/useFormatDate.js'

const TYPE_LABELS = {
    technical: 'Soporte Técnico',
    billing: 'Facturación',
    feature: 'Sugerencia',
    other: 'Otro',
}

const STATUS_BADGES = {
    open: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
    in_progress: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
    resolved: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
}

const STATUS_LABELS = {
    open: 'Abierto',
    in_progress: 'En Proceso',
    resolved: 'Resuelto',
}

export const Support = () => {
    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [search, setSearch] = useState('')
    const [selectedTicket, setSelectedTicket] = useState(null)
    const formatDate = useFormatDate()

    useEffect(() => {
        let mounted = true
        ;(async () => {
            try {
                const data = await getTickets()
                if (mounted) setTickets(data)
            } catch (err) {
                if (mounted) setError(err.message)
            } finally {
                if (mounted) setLoading(false)
            }
        })()
        return () => { mounted = false }
    }, [])

    const filtered = tickets.filter((t) => {
        if (!search) return true
        const q = search.toLowerCase()
        return (
            t.business_name?.toLowerCase().includes(q) ||
            t.subject?.toLowerCase().includes(q) ||
            t.type?.toLowerCase().includes(q) ||
            t.id?.toLowerCase().includes(q)
        )
    })

    if (loading) {
        return (
            <section className='flex flex-col gap-6'>
                <section>
                    <h1 className='text-2xl font-bold'>Soporte</h1>
                    <p className='text-on-body'>Gestiona los tickets de soporte</p>
                </section>
                <section className='bg-surface border border-outline shadow-xs rounded-lg p-6'>
                    <div className='space-y-4'>
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className='flex gap-4'>
                                <div className='h-4 bg-hover-icon rounded w-1/6 animate-pulse' />
                                <div className='h-4 bg-hover-icon rounded w-1/4 animate-pulse' />
                                <div className='h-4 bg-hover-icon rounded w-1/5 animate-pulse' />
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
                <h1 className='text-2xl font-bold'>Soporte</h1>
                <p className='text-on-body'>Gestiona los tickets de soporte de los clientes</p>
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
                        <LifeBuoy className='w-5 h-5 text-accent' />
                        Tickets de Soporte
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
                            placeholder='Buscar por ticket, cliente, asunto...'
                            className='w-full border border-divider rounded-md pl-10 pr-3 py-3 text-sm focus:outline-none focus:border-accent focus:ring-0 transition-all duration-300'
                        />
                    </div>

                    {filtered.length === 0 ? (
                        <div className='flex flex-col items-center justify-center py-12 text-center'>
                            <LifeBuoy className='w-12 h-12 text-faint mb-3' />
                            <p className='text-muted font-medium'>
                                {search ? 'No se encontraron tickets' : 'No hay tickets de soporte'}
                            </p>
                            <p className='text-faint text-sm mt-1'>
                                {search ? 'Intenta con otros términos' : 'Los tickets aparecerán aquí cuando los clientes los creen'}
                            </p>
                        </div>
                    ) : (
                        <div className='overflow-x-auto'>
                            <table className='w-full text-sm overflow-hidden rounded-t-lg'>
                                <thead>
                                    <tr className='bg-subtle border-b border-divider text-muted uppercase text-xs tracking-wider'>
                                        <th className='text-left py-3 px-4 font-medium'># Ticket</th>
                                        <th className='text-left py-3 px-4 font-medium'>Cliente</th>
                                        <th className='text-left py-3 px-4 font-medium'>Tipo</th>
                                        <th className='text-left py-3 px-4 font-medium'>Asunto</th>
                                        <th className='text-left py-3 px-4 font-medium'>Estado</th>
                                        <th className='text-left py-3 px-4 font-medium'>Fecha</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((ticket) => (
                                        <tr
                                            key={ticket.id}
                                            onClick={() => setSelectedTicket(ticket)}
                                            className='border-b border-divider-light hover:bg-hover cursor-pointer transition'
                                        >
                                            <td className='py-3 px-4 font-medium text-accent font-mono'>
                                                #{ticket.id?.slice(0, 8)}
                                            </td>
                                            <td className='py-3 px-4 text-on-body'>{ticket.business_name || 'Desconocido'}</td>
                                            <td className='py-3 px-4 text-muted'>{TYPE_LABELS[ticket.type] || ticket.type}</td>
                                            <td className='py-3 px-4 font-medium text-on-surface max-w-[200px] truncate'>
                                                {ticket.subject}
                                            </td>
                                            <td className='py-3 px-4 whitespace-nowrap'>
                                                <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${STATUS_BADGES[ticket.status] || ''}`}>
                                                    {STATUS_LABELS[ticket.status] || ticket.status}
                                                </span>
                                            </td>
                                            <td className='py-3 px-4 text-muted text-xs'>
                                                {formatDate(ticket.created_at)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </section>

            {selectedTicket && (
                <TicketDetailModal
                    ticket={selectedTicket}
                    onClose={() => setSelectedTicket(null)}
                    onSuccess={() => { getTickets().then(setTickets) }}
                />
            )}
        </section>
    )
}
