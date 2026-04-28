export const SalesChartSkeleton = () => (
    <section className='bg-white border border-gray-300 p-6 shadow-xs rounded-lg h-[400px]'>
        <div className='h-5 w-44 bg-gray-200 rounded animate-pulse mb-6' />
        <div className='h-[300px] flex items-end gap-2 px-4'>
            {[40, 65, 45, 80, 55, 70, 90].map((h, i) => (
                <div key={i} className='flex-1 bg-gray-200 rounded-t animate-pulse' style={{ height: `${h}%` }} />
            ))}
        </div>
    </section>
)

export const PieChartSkeleton = () => (
    <section className='bg-white border border-gray-300 p-6 shadow-xs rounded-lg h-[400px]'>
        <div className='h-5 w-44 bg-gray-200 rounded animate-pulse mb-6' />
        <div className='flex justify-center items-center h-[300px]'>
            <div className='w-48 h-48 bg-gray-200 rounded-full animate-pulse' />
        </div>
    </section>
)

export const BarChartSkeleton = () => (
    <section className='bg-white border border-gray-300 p-6 shadow-xs rounded-lg h-[400px]'>
        <div className='h-5 w-44 bg-gray-200 rounded animate-pulse mb-6' />
        <div className='h-[300px] flex items-end gap-2 px-4'>
            {[55, 70, 45, 85, 60, 75, 50, 65, 80, 40].map((h, i) => (
                <div key={i} className='flex-1 bg-gray-200 rounded-t animate-pulse' style={{ height: `${h}%` }} />
            ))}
        </div>
    </section>
)

export const TableSkeleton = () => (
    <section className='bg-white border border-gray-300 p-6 shadow-xs rounded-lg'>
        <div className='h-5 w-44 bg-gray-200 rounded animate-pulse mb-6' />
        <div className='space-y-3'>
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className='flex gap-4'>
                    <div className='h-4 flex-1 bg-gray-200 rounded animate-pulse' />
                    <div className='h-4 w-24 bg-gray-200 rounded animate-pulse' />
                    <div className='h-4 w-24 bg-gray-200 rounded animate-pulse' />
                    <div className='h-4 w-24 bg-gray-200 rounded animate-pulse' />
                </div>
            ))}
        </div>
    </section>
)

export const AvgTicketSkeleton = () => (
    <section className='bg-white border border-gray-300 p-6 shadow-xs rounded-lg h-[200px]'>
        <div className='h-5 w-44 bg-gray-200 rounded animate-pulse mb-6' />
        <div className='h-16 w-48 bg-gray-200 rounded animate-pulse' />
    </section>
)

export const ReportSkeletons = ({ type }) => {
    if (type === 'sales') {
        return (
            <div className='space-y-6'>
                <SalesChartSkeleton />
                <div className='grid grid-cols-2 max-md:grid-cols-1 gap-6'>
                    <PieChartSkeleton />
                    <BarChartSkeleton />
                </div>
            </div>
        )
    }
    if (type === 'inventory') {
        return (
            <div className='space-y-6'>
                <BarChartSkeleton />
                <TableSkeleton />
            </div>
        )
    }
    if (type === 'performance') {
        return (
            <div className='space-y-6'>
                <div className='grid grid-cols-2 max-md:grid-cols-1 gap-6'>
                    <BarChartSkeleton />
                    <BarChartSkeleton />
                </div>
                <AvgTicketSkeleton />
            </div>
        )
    }
    if (type === 'returns') {
        return (
            <div className='space-y-6'>
                <SalesChartSkeleton />
            </div>
        )
    }
    return <SalesChartSkeleton />
}
