export const MetricsSkeleton = () => (
    <section className='grid grid-cols-4 max-md:grid-cols-1 max-lg:grid-cols-2 gap-4'>
        {[1, 2, 3, 4].map(i => (
            <div key={i} className='flex gap-4 justify-between items-center bg-white border border-gray-300 shadow-xs p-6 rounded-lg'>
                <div className='space-y-3 flex-1'>
                    <div className='h-3 w-24 bg-gray-200 rounded animate-pulse' />
                    <div className='h-8 w-20 bg-gray-200 rounded animate-pulse' />
                </div>
                <div className='h-12 w-12 bg-gray-200 rounded-md animate-pulse' />
            </div>
        ))}
    </section>
)

export const ChartSkeleton = () => (
    <section className='bg-white border border-gray-300 p-6 shadow-xs rounded-lg h-[400px]'>
        <div className='h-5 w-44 bg-gray-200 rounded animate-pulse mb-6' />
        <div className='h-[300px] flex items-end gap-2 px-4'>
            {[40, 65, 45, 80, 55, 70, 90].map((h, i) => (
                <div
                    key={i}
                    className='flex-1 bg-gray-200 rounded-t animate-pulse'
                    style={{ height: `${h}%` }}
                />
            ))}
        </div>
    </section>
)

export const LowStockSkeleton = () => (
    <section className='bg-white border border-gray-300 p-6 shadow-xs rounded-lg flex flex-col h-full'>
        <div className='flex items-center gap-2 mb-2'>
            <div className='h-5 w-5 bg-gray-200 rounded animate-pulse' />
            <div className='h-5 w-28 bg-gray-200 rounded animate-pulse' />
        </div>
        <div className='h-4 w-36 bg-gray-200 rounded animate-pulse mb-4' />
        <div className='flex-1 space-y-4'>
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className='flex justify-between items-center border-b border-gray-50 pb-2'>
                    <div className='h-4 w-32 bg-gray-200 rounded animate-pulse' />
                    <div className='h-4 w-24 bg-gray-200 rounded animate-pulse' />
                </div>
            ))}
        </div>
        <div className='mt-6 h-9 w-full bg-gray-200 rounded-lg animate-pulse' />
    </section>
)

export const TopProductsSkeleton = () => (
    <section className='bg-white border border-gray-300 p-6 shadow-xs rounded-lg'>
        <div className='flex items-center gap-2 mb-6'>
            <div className='h-5 w-5 bg-gray-200 rounded animate-pulse' />
            <div className='h-5 w-36 bg-gray-200 rounded animate-pulse' />
        </div>
        <div className='space-y-4'>
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className='flex items-center gap-3 pb-3 border-b border-gray-50'>
                    <div className='h-8 w-8 bg-gray-200 rounded-full animate-pulse shrink-0' />
                    <div className='flex-1 flex items-center justify-between gap-4'>
                        <div className='h-4 w-40 bg-gray-200 rounded animate-pulse' />
                        <div className='h-4 w-24 bg-gray-200 rounded animate-pulse' />
                    </div>
                </div>
            ))}
        </div>
    </section>
)

export const RecentSalesSkeleton = () => (
    <section className='bg-white border border-gray-300 p-6 shadow-xs rounded-lg'>
        <div className='h-5 w-32 bg-gray-200 rounded animate-pulse mb-6' />
        <div className='space-y-1'>
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className='flex items-center gap-4 p-3 border-b border-gray-100'>
                    <div className='h-9 w-9 bg-gray-200 rounded-lg animate-pulse' />
                    <div className='flex-1 space-y-1'>
                        <div className='h-4 w-20 bg-gray-200 rounded animate-pulse' />
                        <div className='h-3 w-28 bg-gray-200 rounded animate-pulse' />
                    </div>
                    <div className='h-4 w-16 bg-gray-200 rounded animate-pulse' />
                </div>
            ))}
        </div>
    </section>
)
