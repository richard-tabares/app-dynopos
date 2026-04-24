export const CategoryTabs = ({ categories = [], activeCategory, onSelectCategory }) => {
    return (
        <div className='flex gap-2 overflow-x-auto pb-2 scrollbar-hide'>
            <button
                onClick={() => onSelectCategory('all')}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap border ${
                    activeCategory === 'all'
                        ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
            >
                Todos
            </button>
            {categories.map((category) => (
                <button
                    key={category.id}
                    onClick={() => onSelectCategory(category.id)}
                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap border ${
                        activeCategory === category.id
                            ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                >
                    {category.name}
                </button>
            ))}
        </div>
    )
}
