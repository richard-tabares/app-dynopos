import { Layers, Tags } from 'lucide-react'

export const CategoryTabs = ({ categories = [], activeCategory, onSelectCategory }) => {
    return (
        <div className='flex gap-1 bg-gray-100 rounded-lg p-1 w-fit'>
            <button
                onClick={() => onSelectCategory('all')}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    activeCategory === 'all'
                        ? 'bg-white shadow-xs text-primary-600'
                        : 'text-gray-500 hover:text-gray-700'
                }`}
            >
                <Layers className='w-4 h-4' />
                Todos
            </button>
            {categories.map((category) => (
                <button
                    key={category.id}
                    onClick={() => onSelectCategory(category.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                        activeCategory === category.id
                            ? 'bg-white shadow-xs text-primary-600'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <Tags className='w-4 h-4' />
                    {category.name}
                </button>
            ))}
        </div>
    )
}