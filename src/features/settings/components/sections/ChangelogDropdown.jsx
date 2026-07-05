import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { Sparkles, ArrowUp, Bug, Megaphone, Loader } from 'lucide-react'
import { getChangelog } from '../../helpers/getChangelog'

const typeMeta = {
    feature: { icon: Sparkles, class: 'text-green-600 bg-green-500/10' },
    improvement: { icon: ArrowUp, class: 'text-blue-500 bg-blue-500/10' },
    fix: { icon: Bug, class: 'text-amber-500 bg-amber-500/10' },
}

export const ChangelogDropdown = ({ onClose, onMarkRead }) => {
    const navigate = useNavigate()
    const [entries, setEntries] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            const data = await getChangelog()
            const lastSeen = Number(localStorage.getItem('dynopos_last_seen_id')) || 0
            const unread = data.filter((e) => e.id > lastSeen).slice(0, 5)
            const maxId = data.reduce((max, e) => Math.max(max, e.id), 0)
            setEntries(unread)
            if (maxId > 0 && unread.length > 0) {
                localStorage.setItem('dynopos_last_seen_id', String(maxId))
                onMarkRead?.()
            }
            setLoading(false)
        }
        load()
    }, [onMarkRead])

    const formatDate = (dateStr) => {
        const d = new Date(dateStr)
        return d.toLocaleDateString('es-CO', { month: 'short', day: 'numeric', year: 'numeric' })
    }

    const handleEntryClick = () => {
        navigate('/settings/changelog')
        onClose()
    }

    return (
        <section className='absolute top-full right-0 mt-2 bg-surface border border-outline rounded-xl shadow-lg w-80 z-50 overflow-hidden'>
            <section className='px-4 py-3 border-b border-outline'>
                <h3 className='text-sm font-semibold text-on-body flex items-center gap-2'>
                    <Megaphone className='w-4 h-4 text-accent' />
                    Novedades
                </h3>
            </section>

            <section className='max-h-72 overflow-y-auto scrollbar-none'>
                {loading ? (
                    <section className='flex items-center justify-center py-6'>
                        <Loader className='w-5 h-5 animate-spin text-muted' />
                    </section>
                ) : entries.length === 0 ? (
                    <section className='px-4 py-6 text-center'>
                        <p className='text-sm text-muted'>No hay novedades nuevas</p>
                    </section>
                ) : (
                    entries.map((entry) => {
                        const typeInfo = typeMeta[entry.type] || typeMeta.feature
                        const TypeIcon = typeInfo.icon
                        return (
                            <section
                                key={entry.id}
                                onClick={handleEntryClick}
                                className='flex items-start gap-3 px-4 py-3 border-b border-divider/50 last:border-b-0 hover:bg-hover transition-colors cursor-pointer'
                            >
                                <section className={`p-1.5 rounded-lg shrink-0 ${typeInfo.class}`}>
                                    <TypeIcon className='w-4 h-4' />
                                </section>
                                <section className='flex flex-col min-w-0'>
                                    <span className='text-sm font-medium text-on-body truncate'>{entry.title}</span>
                                    <span className='text-xs text-faint mt-0.5'>{formatDate(entry.created_at)}</span>
                                    <span className='text-xs text-accent hover:underline mt-1'>
                                        Leer novedad
                                    </span>
                                </section>
                            </section>
                        )
                    })
                )}
            </section>

        </section>
    )
}
