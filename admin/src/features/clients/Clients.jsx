import { useState, useEffect } from 'react'
import {
    Users, Plus, Search, Loader, AlertCircle,
} from 'lucide-react'
import { getClients } from './helpers/getClients.js'
import { ClientFormModal } from './ClientFormModal.jsx'
import { ClientEditModal } from './ClientEditModal.jsx'

const FREQ_LABELS = {
    monthly: 'Mensual',
    quarterly: 'Trimestral',
    annual: 'Anual',
}

const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    const [y, m, d] = dateStr.split('-')
    return `${d}/${m}/${y}`
}

const isExpired = (dateStr) => {
    if (!dateStr) return false
    return dateStr < new Date().toLocaleDateString('en-CA')
}

export const Clients = () => {
    const [clients, setClients] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [search, setSearch] = useState('')
    const [showFormModal, setShowFormModal] = useState(false)
    const [editTarget, setEditTarget] = useState(null)

    const loadClients = async () => {
        try {
            const data = await getClients()
            setClients(data)
        } catch (err) {
            setError(err.message)
        }
    }

    useEffect(() => {
        let mounted = true
        ;(async () => {
            try {
                const data = await getClients()
                if (mounted) setClients(data)
            } catch (err) {
                if (mounted) setError(err.message)
            } finally {
                if (mounted) setLoading(false)
            }
        })()
        return () => { mounted = false }
    }, [])

    const filtered = clients.filter((c) => {
        if (!search) return true
        const q = search.toLowerCase()
        return (
            c.business_name?.toLowerCase().includes(q) ||
            c.email?.toLowerCase().includes(q) ||
            c.owner_name?.toLowerCase().includes(q)
        )
    })

    if (loading) {
        return (
            <section className='flex flex-col gap-6'>
                <section>
                    <h1 className='text-2xl font-bold'>Clientes</h1>
                    <p className='text-on-body'>Administra los negocios registrados</p>
                </section>
                <section className='bg-surface border border-outline shadow-xs rounded-lg p-6'>
                    <div className='space-y-4'>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className='flex gap-4'>
                                <div className='h-4 bg-hover-icon rounded w-1/4 animate-pulse' />
                                <div className='h-4 bg-hover-icon rounded w-1/3 animate-pulse' />
                                <div className='h-4 bg-hover-icon rounded w-1/5 animate-pulse' />
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
                <h1 className='text-2xl font-bold'>Clientes</h1>
                <p className='text-on-body'>Administra los negocios registrados en la plataforma</p>
            </section>

            {error && (
                <div className='flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg'>
                    <AlertCircle className='w-5 h-5 text-red-500 shrink-0 mt-0.5' />
                    <p className='text-sm text-red-700 dark:text-red-300'>{error}</p>
                </div>
            )}

            <section className='bg-surface border border-outline shadow-xs rounded-lg'>
                <section className='border-b border-divider flex justify-between items-center px-6 py-4 bg-subtle'>
                    <h2 className='text-lg font-semibold flex items-center gap-2'>
                        <Users className='w-5 h-5 text-accent' />
                        Negocios
                        <span className='text-sm text-muted font-medium'>({filtered.length})</span>
                    </h2>
                    <button
                        onClick={() => setShowFormModal(true)}
                        className='flex items-center font-medium px-4 py-2 bg-accent text-surface text-sm rounded-lg hover:bg-accent/85 transition cursor-pointer'
                    >
                        <Plus className='w-4 h-4 lg:w-5 lg:h-5 lg:mr-2' />
                        <span className='hidden lg:inline'>Nuevo Cliente</span>
                    </button>
                </section>

                <section className='p-6 flex flex-col gap-4'>
                    <div className='relative'>
                        <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-faint' />
                        <input
                            type='search'
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder='Buscar por negocio, email o dueño...'
                            className='w-full border border-divider rounded-md pl-10 pr-3 py-3 text-sm focus:outline-none focus:border-accent focus:ring-0 transition-all duration-300'
                        />
                    </div>

                    {filtered.length === 0 ? (
                        <div className='flex flex-col items-center justify-center py-12 text-center'>
                            <Users className='w-12 h-12 text-faint mb-3' />
                            <p className='text-muted font-medium'>No se encontraron clientes</p>
                            <p className='text-faint text-sm mt-1'>
                                {search ? 'Intenta con otros términos de búsqueda' : 'Crea tu primer cliente para comenzar'}
                            </p>
                        </div>
                    ) : (
                        <div className='overflow-x-auto'>
                            <table className='w-full text-sm overflow-hidden rounded-t-lg'>
                                <thead>
                                    <tr className='bg-subtle border-b border-divider text-muted uppercase text-xs tracking-wider'>
                                        <th className='text-left py-3 px-4 font-medium'>Negocio</th>
                                        <th className='text-left py-3 px-4 font-medium'>Contacto</th>
                                        <th className='text-left py-3 px-4 font-medium'>Plan / Frecuencia</th>
                                        <th className='text-left py-3 px-4 font-medium'>Vencimiento</th>
                                        <th className='text-left py-3 px-4 font-medium'>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((client) => {
                                        const sub = client.subscription
                                        const subStatus = sub?.status
                                        const isActive = subStatus === 'active'
                                        const expired = isExpired(sub?.current_period_end)

                                        return (
                                            <tr
                                                key={client.id}
                                                onClick={() => setEditTarget(client)}
                                                className='border-b border-divider-light hover:bg-hover cursor-pointer transition'
                                            >
                                                <td className='py-3 px-4 font-medium text-on-surface'>
                                                    {client.business_name}
                                                </td>
                                                <td className='py-3 px-4'>
                                                    <p className='text-on-body'>{client.email}</p>
                                                    <p className='text-muted text-xs'>{client.owner_name}</p>
                                                </td>
                                                <td className='py-3 px-4'>
                                                    <p className='text-on-body'>{sub?.plan?.name || 'Plan Emprendedor'}</p>
                                                    <p className='text-muted text-xs'>{FREQ_LABELS[sub?.billing_frequency] || '—'}</p>
                                                </td>
                                                <td className='py-3 px-4'>
                                                    <span className={expired && isActive ? 'text-red-600 font-medium' : 'text-on-body'}>
                                                        {formatDate(sub?.current_period_end, { year: 'numeric', month: 'short', day: 'numeric' }) || '—'}
                                                    </span>
                                                </td>
                                                <td className='py-3 px-4 whitespace-nowrap'>
                                                    {isActive ? (
                                                        <span className='px-2.5 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'>
                                                            Activa
                                                        </span>
                                                    ) : subStatus === 'cancelled' ? (
                                                        <span className='px-2.5 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'>
                                                            Cancelada
                                                        </span>
                                                    ) : (
                                                        <span className='px-2.5 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'>
                                                            Expirada
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </section>

            {showFormModal && (
                <ClientFormModal
                    onClose={() => setShowFormModal(false)}
                    onSuccess={loadClients}
                />
            )}

            {editTarget && (
                <ClientEditModal
                    client={editTarget}
                    onClose={() => setEditTarget(null)}
                    onSuccess={loadClients}
                />
            )}
        </section>
    )
}
