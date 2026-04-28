import { useState } from 'react'

const periods = [
    { value: 'day', label: 'Hoy' },
    { value: 'week', label: 'Semana' },
    { value: 'month', label: 'Mes' },
    { value: 'range', label: 'Rango' },
]

export const DateRangeFilter = ({ value: currentFilter = 'month', onChange, startDate: propStartDate = '', endDate: propEndDate = '', showCategoryFilter = false, categories = [] }) => {
    const [categoryId, setCategoryId] = useState('')

    const handlePeriodChange = (newPeriod) => {
        onChange({ filter: newPeriod, startDate: '', endDate: '', categoryId: categoryId || undefined })
    }

    return (
        <section className='bg-white border border-gray-300 p-4 shadow-xs rounded-lg flex flex-wrap items-end gap-3'>
            <div className='flex gap-1 bg-gray-100 rounded-lg p-1'>
                {periods.map((p) => (
                    <button
                        key={p.value}
                        onClick={() => handlePeriodChange(p.value)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                            currentFilter === p.value
                                ? 'bg-white text-primary-600 shadow-xs'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            {currentFilter === 'range' && (
                <>
                    <div className='flex flex-col'>
                        <label className='text-xs text-gray-500 mb-1 font-medium'>Desde</label>
                        <input
                            type='date'
                            value={propStartDate}
                            onChange={(e) => {
                                onChange({ filter: 'range', startDate: e.target.value, endDate: propEndDate, categoryId: categoryId || undefined })
                            }}
                            className='border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500'
                        />
                    </div>
                    <div className='flex flex-col'>
                        <label className='text-xs text-gray-500 mb-1 font-medium'>Hasta</label>
                        <input
                            type='date'
                            value={propEndDate}
                            onChange={(e) => {
                                onChange({ filter: 'range', startDate: propStartDate, endDate: e.target.value, categoryId: categoryId || undefined })
                            }}
                            className='border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500'
                        />
                    </div>
                </>
            )}

            {showCategoryFilter && categories.length > 0 && (
                <div className='flex flex-col'>
                    <label className='text-xs text-gray-500 mb-1 font-medium'>Categoría</label>
                    <select
                        value={categoryId}
                        onChange={(e) => {
                            setCategoryId(e.target.value)
                            onChange({ filter: currentFilter, startDate: propStartDate, endDate: propEndDate, categoryId: e.target.value || undefined })
                        }}
                        className='border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500'
                    >
                        <option value=''>Todas las categorías</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            )}
        </section>
    )
}
