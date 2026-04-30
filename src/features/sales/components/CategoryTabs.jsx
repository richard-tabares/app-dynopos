import { Layers, Tags } from 'lucide-react'

export const CategoryTabs = ({ categories = [], activeCategory, onSelectCategory }) => {
    return (
        <div className='flex gap-1 bg-subtle dark:bg-gray-900 rounded-lg p-1 w-fit max-w-full overflow-x-auto scrollbar-none'>
            <button
                onClick={() => onSelectCategory('all')}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    activeCategory === 'all'
                        ? 'bg-surface shadow-xs text-primary-600'
                        : 'text-muted hover:text-on-body hover:bg-hover'
                }`}
            >
                <Layers className='w-4 h-4' />
                Ninguna
            </button>
            {categories.map((category) => (
                <button
                    key={category.id}
                    onClick={() => onSelectCategory(category.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                        activeCategory === category.id
                            ? 'bg-surface shadow-xs text-primary-600'
                            : 'text-muted hover:text-on-body hover:bg-hover'
                    }`}
                >
                    <Tags className='w-4 h-4' />
                    {category.name}
                </button>
            ))}
        </div>
    )
}