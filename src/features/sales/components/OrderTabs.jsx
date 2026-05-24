import { Plus, Trash2 } from 'lucide-react'

export const OrderTabs = ({
    pendingOrders,
    currentLabel,
    onSelect,
    onNewOrder,
    onClearAll,
}) => {
    if (currentLabel === null && pendingOrders.length === 0) return null

    const labels = [
        ...pendingOrders.map((o) => ({
            label: o.label,
            isCurrent: false,
        })),
        ...(currentLabel !== null
            ? [{ label: currentLabel, isCurrent: true }]
            : []),
    ].sort((a, b) => a.label - b.label)

    const showPlus = labels.length > 0
    const showClearAll = labels.length > 1

    return (
        <div className='flex items-start justify-between gap-4'>
            <div className='flex items-center gap-2 flex-wrap min-w-0'>
                {labels.map(({ label, isCurrent }) => (
                    <div key={label} className='flex-shrink-0'>
                        {isCurrent ? (
                            <span className='inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap bg-accent text-surface'>
                                Ticket #{label}
                            </span>
                        ) : (
                            <button
                                onClick={() => onSelect(label)}
                                className='inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap bg-accent/50 text-surface hover:bg-accent/75 transition-colors cursor-pointer'
                            >
                                Ticket #{label}
                            </button>
                        )}
                    </div>
                ))}
                {showPlus && (
                    <button
                        onClick={onNewOrder}
                        className='flex items-center justify-center w-8 h-8 rounded-full border-1 border-accent text-accent hover:bg-accent/10 transition-colors flex-shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed'
                        title='Nueva orden'
                    >
                        <Plus className='w-4 h-4' />
                    </button>
                )}
            </div>
            {showClearAll && (
                <button
                    onClick={onClearAll}
                    className='flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium cursor-pointer flex-shrink-0'
                >
                    <Trash2 className='w-3.5 h-3.5' />
                    Limpiar Ordenes
                </button>
            )}
        </div>
    )
}
