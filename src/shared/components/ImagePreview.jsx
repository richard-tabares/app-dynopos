import { X } from 'lucide-react'
import { useEscape } from '../helpers/useEscape'

export const ImagePreview = ({ src, alt, onClose }) => {
    useEscape(onClose)
    if (!src) return null
    return (
        <section
            className='fixed inset-0 bg-overlay/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 cursor-zoom-out'
            onClick={onClose}
        >
            <section
                className='relative max-w-[90vw] max-h-[85vh] flex items-center justify-center'
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className='absolute -top-3 -right-3 p-1 rounded-full bg-surface border border-divider text-muted hover:text-on-body transition cursor-pointer z-10'
                >
                    <X className='w-5 h-5' />
                </button>
                <img
                    src={src}
                    alt={alt || ''}
                    className='max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl'
                />
            </section>
        </section>
    )
}
