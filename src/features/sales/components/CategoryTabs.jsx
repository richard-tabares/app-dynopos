import { useState, useRef, useEffect } from 'react'
import { Layers, Tags, ChevronDown } from 'lucide-react'

export const CategoryTabs = ({ categories = [], activeCategory, onSelectCategory }) => {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef(null)

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const selected = activeCategory === 'all'
        ? null
        : categories.find(c => c.id === activeCategory)

    const selectedName = selected ? selected.name : 'Ninguna'
    const SelectedIcon = activeCategory === 'all' ? Layers : Tags

    return (
        <div className='relative' ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className='w-full flex items-center gap-2 border border-outline rounded-lg px-3 py-2 text-sm bg-surface cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500'
            >
                <SelectedIcon className='w-4 h-4 text-faint shrink-0' />
                <span className='flex-1 text-left text-on-surface'>{selectedName}</span>
                <ChevronDown className={`w-4 h-4 text-faint transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className='absolute top-full left-0 right-0 mt-1 bg-surface border border-outline rounded-lg shadow-lg z-50 overflow-hidden'>
                    <button
                        onClick={() => { onSelectCategory('all'); setIsOpen(false) }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left cursor-pointer transition-colors ${
                            activeCategory === 'all'
                                ? 'bg-primary-50 text-accent'
                                : 'text-on-surface hover:bg-hover'
                        }`}
                    >
                        <Layers className='w-4 h-4 shrink-0' />
                        Ninguna
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => { onSelectCategory(category.id); setIsOpen(false) }}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left cursor-pointer transition-colors ${
                                activeCategory === category.id
                                    ? 'bg-primary-50 text-accent'
                                    : 'text-on-surface hover:bg-hover'
                            }`}
                        >
                            <Tags className='w-4 h-4 shrink-0' />
                            {category.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}