import { useState } from 'react'
import { Calendar, CalendarDays, CalendarRange, ArrowLeftRight } from 'lucide-react'

const periodIcons = {
    day: Calendar,
    week: CalendarDays,
    month: CalendarRange,
    range: ArrowLeftRight,
}

const periods = [
    { value: 'day', label: 'Hoy' },
    { value: 'week', label: 'Semana' },
    { value: 'month', label: 'Mes' },
    { value: 'range', label: 'Rango' },
]

export const DateRangeFilter = ({ value: currentFilter = 'month', onChange, startDate: propStartDate = '', endDate: propEndDate = '', showCategoryFilter = false, categories = [], compact = false }) => {
    const [categoryId, setCategoryId] = useState('')

    const handlePeriodChange = (newPeriod) => {
        onChange({ filter: newPeriod, startDate: '', endDate: '', categoryId: categoryId || undefined })
    }

    const Wrapper = compact ? 'div' : 'section'
    const wrapperClass = compact
        ? 'flex flex-wrap items-end gap-3'
        : 'bg-surface border border-outline p-4 shadow-xs rounded-lg flex flex-wrap items-end gap-3'

    return (
        <Wrapper className={wrapperClass}>
            <div className='flex gap-1 bg-subtle rounded-lg p-1 max-w-full overflow-x-auto scrollbar-none'>
                {periods.map((p) => {
                    const Icon = periodIcons[p.value]
                    return (
                        <button
                            key={p.value}
                            onClick={() => handlePeriodChange(p.value)}
                            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                                currentFilter === p.value
                                    ? 'bg-surface text-accent shadow-xs'
                                    : 'text-muted hover:text-on-body hover:bg-hover'
                            }`}
                        >
                            <Icon className='w-4 h-4' />
                            {p.label}
                        </button>
                    )
                })}
            </div>

            {currentFilter === 'range' && (
                <>
                    <div className='flex flex-col'>
                        <label className='text-xs text-muted mb-1 font-medium'>Desde</label>
                        <input
                            type='date'
                            value={propStartDate}
                            onChange={(e) => {
                                onChange({ filter: 'range', startDate: e.target.value, endDate: propEndDate, categoryId: categoryId || undefined })
                            }}
                            className='border border-divider rounded-md px-4 py-3 text-sm focus:outline-none focus:border-accent focus:ring-0 transition-all duration-300'
                        />
                    </div>
                    <div className='flex flex-col'>
                        <label className='text-xs text-muted mb-1 font-medium'>Hasta</label>
                        <input
                            type='date'
                            value={propEndDate}
                            onChange={(e) => {
                                onChange({ filter: 'range', startDate: propStartDate, endDate: e.target.value, categoryId: categoryId || undefined })
                            }}
                            className='border border-divider rounded-md px-4 py-3 text-sm focus:outline-none focus:border-accent focus:ring-0 transition-all duration-300'
                        />
                    </div>
                </>
            )}

            {showCategoryFilter && categories.length > 0 && (
                <div className='flex flex-col'>
                    <label className='text-xs text-muted mb-1 font-medium'>Categoría</label>
                    <select
                        value={categoryId}
                        onChange={(e) => {
                            setCategoryId(e.target.value)
                            onChange({ filter: currentFilter, startDate: propStartDate, endDate: propEndDate, categoryId: e.target.value || undefined })
                        }}
                        className='border border-divider rounded-md px-4 py-3 text-sm focus:outline-none focus:border-accent focus:ring-0 transition-all duration-300'
                    >
                        <option className='text-select-input' value=''>Todas las categorías</option>
                        {categories.map((cat) => (
                            <option className='text-select-input' key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            )}
        </Wrapper>
    )
}
