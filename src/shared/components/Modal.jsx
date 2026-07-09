import { X } from 'lucide-react'
import { useEscape } from '../helpers/useEscape'

const sizeMap = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
}

export const Modal = ({ isOpen = true, onClose, title, icon: Icon, iconColor = 'text-accent', size = 'md', zIndex = 'z-50', children }) => {
    useEscape(onClose)

    if (!isOpen) return null

    return (
        <section className={`fixed inset-0 bg-overlay backdrop-blur-xs w-full h-full flex flex-col items-center justify-center ${zIndex} p-4`}>
            <section
                className={`bg-surface rounded-xl border border-outline w-full ${sizeMap[size]} relative max-h-dvh overflow-y-auto scrollbar-none pb-4`}
                onClick={(e) => e.stopPropagation()}>
                <section className='sticky top-0 bg-title-surface/50 backdrop-blur-3xl z-50 flex items-center justify-between px-6 py-3.5 border-b border-divider'>
                    <h2 className='text-lg font-semibold flex items-center gap-2'>
                        {Icon && <Icon className={`w-5 h-5 ${iconColor}`} />}
                        {title}
                    </h2>
                    <button onClick={onClose} className='p-1 rounded-md text-accent hover:text-accent/85 border border-disabled hover:border-accent transition cursor-pointer'>
                        <X className='w-5 h-5' />
                    </button>
                </section>
                {children}
            </section>
        </section>
    )
}
