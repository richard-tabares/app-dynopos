import { useState, useEffect } from 'react'
import { Sparkles, ArrowUp, Bug, Megaphone, Loader } from 'lucide-react'
import { getChangelog } from '../../helpers/getChangelog'

const typeMeta = {
    feature: { label: 'Nueva Característica', icon: Sparkles, class: 'bg-green-500/10 text-green-600', dotClass: 'bg-green-500 shadow-[0_0_8px] shadow-green-500/50' },
    improvement: { label: 'Mejora', icon: ArrowUp, class: 'bg-blue-500/10 text-blue-500', dotClass: 'bg-blue-500 shadow-[0_0_8px] shadow-blue-500/40' },
    fix: { label: 'Corrección', icon: Bug, class: 'bg-amber-500/10 text-amber-500', dotClass: 'bg-amber-500 shadow-[0_0_8px] shadow-amber-500/40' },
}

export const ChangelogTimeline = () => {
    const [entries, setEntries] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            const data = await getChangelog()
            setEntries(data)

            const maxId = data.reduce((max, e) => Math.max(max, e.id), 0)
            if (maxId > 0) {
                localStorage.setItem('dynopos_last_seen_id', String(maxId))
            }
            setLoading(false)
        }
        load()
    }, [])

    const formatDate = (dateStr) => {
        const d = new Date(dateStr)
        return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
    }

    const isVideo = (url) => /\.(mp4|webm|ogg)$/i.test(url)

    if (loading) {
        return (
            <section className='bg-surface rounded-xl border border-outline p-6 space-y-6'>
                {[1, 2, 3].map((i) => (
                    <section key={i} className='flex gap-4'>
                        <section className='w-3 h-3 rounded-full bg-hover-icon shrink-0 mt-1.5' />
                        <section className='flex-1 space-y-2'>
                            <section className='h-4 bg-hover rounded w-1/3 animate-pulse' />
                            <section className='h-3 bg-hover rounded w-1/4 animate-pulse' />
                            <section className='h-3 bg-hover rounded w-full animate-pulse' />
                            <section className='h-3 bg-hover rounded w-2/3 animate-pulse' />
                        </section>
                    </section>
                ))}
            </section>
        )
    }

    if (entries.length === 0) {
        return (
            <section className='bg-surface rounded-xl border border-outline p-12 text-center'>
                <Megaphone className='w-12 h-12 text-faint mx-auto mb-3' />
                <p className='text-on-body font-medium'>No hay novedades aún</p>
                <p className='text-sm text-muted mt-1'>Las actualizaciones del sistema aparecerán aquí</p>
            </section>
        )
    }

    return (
        <section className='bg-surface rounded-xl border border-outline p-6'>
            <section className='relative'>
                <section className='absolute left-[5.5px] top-3 bottom-3 w-0.5 bg-divider' />
                <ul className='space-y-8'>
                    {entries.map((entry) => {
                        const typeInfo = typeMeta[entry.type] || typeMeta.feature
                        const TypeIcon = typeInfo.icon

                        return (
                            <li key={entry.id} className='relative pl-8'>
                                <section className={`absolute left-0 top-1.5 w-3 h-3 rounded-full border-2 border-surface ${typeInfo.dotClass}`} />
                                <section className='space-y-2'>
                                    <section className='flex items-center gap-3 flex-wrap'>
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${typeInfo.class}`}>
                                            <TypeIcon className='w-3 h-3' />
                                            {typeInfo.label}
                                        </span>
                                        <time className='text-xs text-faint'>{formatDate(entry.created_at)}</time>
                                    </section>
                                    <h3 className='text-base font-semibold text-on-body'>{entry.title}</h3>
                                    {entry.description && (
                                        <p className='text-sm text-muted leading-relaxed'>{entry.description}</p>
                                    )}
                                    {entry.bullets && entry.bullets.length > 0 && (
                                        <section className='flex flex-wrap gap-1.5'>
                                            {entry.bullets.map((bullet, bIdx) => (
                                                <span key={bIdx} className='px-2.5 py-0.5 text-xs font-medium bg-accent/10 text-accent rounded-full'>
                                                    {bullet}
                                                </span>
                                            ))}
                                        </section>
                                    )}
                                    {entry.media_url && (
                                        <section className='mt-3'>
                                            {isVideo(entry.media_url) ? (
                                                <video
                                                    src={entry.media_url}
                                                    loop
                                                    autoPlay
                                                    muted
                                                    playsInline
                                                    className='rounded-lg max-w-full max-h-80 object-contain bg-body'
                                                />
                                            ) : (
                                                <img
                                                    src={entry.media_url}
                                                    alt={entry.title}
                                                    className='rounded-lg max-w-full max-h-80 object-contain bg-body'
                                                />
                                            )}
                                        </section>
                                    )}
                                </section>
                            </li>
                        )
                    })}
                </ul>
            </section>
        </section>
    )
}
