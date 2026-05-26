import { useState } from 'react'
import { LifeBuoy, Loader } from 'lucide-react'
import { Modal } from '../../components/Modal.jsx'
import { updateTicketStatus } from './helpers/getTickets.js'

const TYPE_LABELS = {
    technical: 'Soporte Técnico',
    billing: 'Facturación',
    feature: 'Sugerencia',
    other: 'Otro',
}

const STATUS_OPTIONS = ['open', 'in_progress', 'resolved']

const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

export const TicketDetailModal = ({ ticket, onClose, onSuccess }) => {
    const [status, setStatus] = useState(ticket.status)
    const [saving, setSaving] = useState(false)

    const handleStatusChange = async (newStatus) => {
        setSaving(true)
        try {
            await updateTicketStatus(ticket.id, newStatus)
            setStatus(newStatus)
            if (onSuccess) onSuccess()
        } catch (e) {
            console.error(e)
        } finally {
            setSaving(false)
        }
    }

    return (
        <Modal onClose={onClose} title={`Ticket #${ticket.id?.slice(0, 8)}`} icon={LifeBuoy} size='lg'>
            <section className='p-6 flex flex-col gap-4'>
                    <div className='grid grid-cols-2 gap-4'>
                        <div>
                            <p className='text-xs text-muted font-medium uppercase tracking-wider'>Cliente</p>
                            <p className='text-sm font-medium text-on-surface'>{ticket.business_name || 'Desconocido'}</p>
                        </div>
                        <div>
                            <p className='text-xs text-muted font-medium uppercase tracking-wider'>Tipo</p>
                            <p className='text-sm font-medium text-on-surface'>{TYPE_LABELS[ticket.type] || ticket.type}</p>
                        </div>
                        <div>
                            <p className='text-xs text-muted font-medium uppercase tracking-wider'>Fecha</p>
                            <p className='text-sm text-on-body'>{formatDate(ticket.created_at)}</p>
                        </div>
                        <div>
                            <p className='text-xs text-muted font-medium uppercase tracking-wider'>Estado</p>
                            <span className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full mt-1 ${
                                status === 'open' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
                                status === 'in_progress' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' :
                                'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                            }`}>
                                {status === 'open' ? 'Abierto' : status === 'in_progress' ? 'En Proceso' : 'Resuelto'}
                            </span>
                        </div>
                    </div>

                    <div>
                        <p className='text-xs text-muted font-medium uppercase tracking-wider mb-1'>Asunto</p>
                        <p className='text-sm font-medium text-on-surface'>{ticket.subject}</p>
                    </div>

                    <div>
                        <p className='text-xs text-muted font-medium uppercase tracking-wider mb-1'>Descripción</p>
                        <div className='bg-subtle p-4 rounded-lg border border-divider-light'>
                            <p className='text-sm text-on-body whitespace-pre-wrap'>{ticket.description}</p>
                        </div>
                    </div>

                    <div className='pt-4 border-t border-divider'>
                        <p className='text-xs text-muted font-medium uppercase tracking-wider mb-2'>Cambiar Estado</p>
                        <div className='flex gap-2'>
                            {STATUS_OPTIONS.map((opt) => (
                                <button
                                    key={opt}
                                    onClick={() => handleStatusChange(opt)}
                                    disabled={saving || status === opt}
                                    className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition cursor-pointer ${
                                        status === opt
                                            ? 'bg-accent text-surface border-accent'
                                            : 'border-outline text-on-body hover:bg-hover'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {saving && status !== opt ? <Loader className='w-3 h-3 animate-spin mx-auto' /> : (
                                        opt === 'open' ? 'Abierto' : opt === 'in_progress' ? 'En Proceso' : 'Resuelto'
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>
        </Modal>
    )
}
