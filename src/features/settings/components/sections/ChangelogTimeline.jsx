import { useState, useEffect } from 'react'
import { Sparkles, ArrowUp, Bug, ChevronDown, Megaphone, Loader } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkBreaks from 'remark-breaks'
import { getChangelog } from '../../helpers/getChangelog'
import { ImagePreview } from '../../../../shared/components/ImagePreview'

const typeMeta = {
    feature: { label: 'Nueva Característica', icon: Sparkles, class: 'bg-green-500/10 text-green-600', dotClass: 'bg-green-500 shadow-[0_0_8px] shadow-green-500/50' },
    improvement: { label: 'Mejora', icon: ArrowUp, class: 'bg-blue-500/10 text-blue-500', dotClass: 'bg-blue-500 shadow-[0_0_8px] shadow-blue-500/40' },
    fix: { label: 'Corrección', icon: Bug, class: 'bg-amber-500/10 text-amber-500', dotClass: 'bg-amber-500 shadow-[0_0_8px] shadow-amber-500/40' },
}

const isVideo = (url) => /\.(mp4|webm|ogg)$/i.test(url)

export const ChangelogTimeline = () => {
    const [entries, setEntries] = useState([])
    const [expandedIds, setExpandedIds] = useState(new Set())
    const [loading, setLoading] = useState(true)
    const [previewImage, setPreviewImage] = useState(null)

    useEffect(() => {
        const load = async () => {
            const data = await getChangelog()
            setEntries(data)
            if (data.length > 0) {
                setExpandedIds(new Set([data[0].id]))
            }

            const maxId = data.reduce((max, e) => Math.max(max, e.id), 0)
            if (maxId > 0) {
                localStorage.setItem('dynopos_last_seen_id', String(maxId))
            }
            setLoading(false)
        }
        load()
    }, [])

    const toggleExpanded = (id) => {
        setExpandedIds((prev) => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else {
                next.add(id)
            }
            return next
        })
    }

    const formatDate = (dateStr) => {
        const d = new Date(dateStr)
        return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
    }

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
        <>
        <section className='bg-surface rounded-xl border border-outline p-6'>
            <section className='relative'>
                <section className='absolute left-[5.5px] top-6 bottom-3 w-0.5 bg-divider' />
                <ul className='space-y-6'>
                    {entries.map((entry) => {
                        const typeInfo = typeMeta[entry.type] || typeMeta.feature
                        const TypeIcon = typeInfo.icon
                        const isExpanded = expandedIds.has(entry.id)

                        return (
                            <li key={entry.id} className='relative pl-8'>
                                <section className={`absolute left-0 top-6 w-3.5 h-3.5 rounded-full border-2 border-surface ${typeInfo.dotClass}`} />
                                <section className='space-y-2'>
                                    <button
                                        onClick={() => toggleExpanded(entry.id)}
                                        className='w-full text-left cursor-pointer group rounded-lg hover:bg-hover/50 transition-colors px-3 py-4 -mx-3 flex items-center gap-3'
                                    >
                                        <section className='flex-1 min-w-0'>
                                            <section className='flex items-center gap-3 flex-wrap'>
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${typeInfo.class}`}>
                                                    <TypeIcon className='w-3.5 h-3.5' />
                                                    {typeInfo.label}
                                                </span>
                                                <time className='text-xs text-faint shrink-0'>{formatDate(entry.created_at)}</time>
                                            </section>
                                            <h3 className='text-base font-semibold text-on-body mt-0.5'>{entry.title}</h3>
                                        </section>
                                        <ChevronDown className={`w-4 h-4 text-accent shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-0' : '-rotate-90'}`} />
                                    </button>
                                    <section className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <section className='pt-0'>
                                            {entry.description && (
                                                <section className='text-sm text-muted leading-relaxed'>
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkBreaks]}
                                                        components={{
                                                            p: ({ children }) => <p className='my-4'>{children}</p>,
                                                            h2: ({ children }) => <h2 className='text-base font-semibold text-on-body mt-4 mb-2'>{children}</h2>,
                                                            h3: ({ children }) => <h3 className='text-sm font-semibold text-on-body mt-3 mb-1'>{children}</h3>,
                                                            ul: ({ children }) => <ul className='list-disc pl-5 my-1 space-y-0.5'>{children}</ul>,
                                                            ol: ({ children }) => <ol className='list-decimal pl-5 my-1 space-y-0.5'>{children}</ol>,
                                                            li: ({ children }) => <li className='text-sm text-muted'>{children}</li>,
                                                            blockquote: ({ children }) => <blockquote className='border-l-2 border-accent/30 pl-3 my-3 italic text-muted'>{children}</blockquote>,
                                                            strong: ({ children }) => <strong className='font-semibold text-on-body'>{children}</strong>,
                                                            code: ({ children }) => <code className='px-1 py-0.5 rounded bg-hover text-xs font-mono text-accent'>{children}</code>,
                                                            img: ({ src, alt }) =>
                                                                isVideo(src) ? (
                                                                    <video
                                                                        src={src}
                                                                        loop
                                                                        autoPlay
                                                                        muted
                                                                        playsInline
                                                                        className='rounded-lg max-w-full max-h-80 object-contain bg-body my-3'
                                                                    />
                                                                ) : (
                                                                    <img
                                                                        src={src}
                                                                        alt={alt}
                                                                        className='rounded-lg max-w-full max-h-80 object-contain bg-body my-3 cursor-zoom-in hover:ring-2 hover:ring-accent/50 transition-all'
                                                                        onClick={() => setPreviewImage(src)}
                                                                    />
                                                                ),
                                                        }}
                                                    >
                                                        {entry.description}
                                                    </ReactMarkdown>
                                                </section>
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
                                        </section>
                                    </section>
                                </section>
                            </li>
                        )
                    })}
                </ul>
            </section>
        </section>

            {previewImage && (
                <ImagePreview src={previewImage} alt='' onClose={() => setPreviewImage(null)} />
            )}
        </>
    )
}
