export const MetricsSkeleton = () => (
    <section className='grid grid-cols-4 max-md:grid-cols-1 max-lg:grid-cols-2 gap-4'>
        {[1, 2, 3, 4].map(i => (
            <div key={i} className='flex gap-4 justify-between items-center bg-surface border border-outline shadow-xs p-6 rounded-lg'>
                <div className='space-y-3 flex-1'>
                    <div className='h-3 w-24 bg-hover-icon rounded animate-pulse' />
                    <div className='h-8 w-20 bg-hover-icon rounded animate-pulse' />
                </div>
                <div className='h-12 w-12 bg-hover-icon rounded-md animate-pulse' />
            </div>
        ))}
    </section>
)

export const ChartSkeleton = () => (
    <section className='bg-surface border border-outline p-6 shadow-xs rounded-lg h-[400px]'>
        <div className='h-5 w-44 bg-hover-icon rounded animate-pulse mb-6' />
        <div className='h-[300px] flex items-end gap-2 px-4'>
            {[40, 65, 45, 80, 55, 70, 90].map((h, i) => (
                <div
                    key={i}
                    className='flex-1 bg-hover-icon rounded-t animate-pulse'
                    style={{ height: `${h}%` }}
                />
            ))}
        </div>
    </section>
)

export const LowStockSkeleton = () => (
    <section className='bg-surface border border-outline p-6 shadow-xs rounded-lg flex flex-col h-full'>
        <div className='flex items-center gap-2 mb-2'>
            <div className='h-5 w-5 bg-hover-icon rounded animate-pulse' />
            <div className='h-5 w-28 bg-hover-icon rounded animate-pulse' />
        </div>
        <div className='h-4 w-36 bg-hover-icon rounded animate-pulse mb-4' />
        <div className='flex-1 space-y-4'>
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className='flex justify-between items-center border-b border-divider-light pb-2'>
                    <div className='h-4 w-32 bg-hover-icon rounded animate-pulse' />
                    <div className='h-4 w-24 bg-hover-icon rounded animate-pulse' />
                </div>
            ))}
        </div>
        <div className='mt-6 h-9 w-full bg-hover-icon rounded-lg animate-pulse' />
    </section>
)

export const TopProductsSkeleton = () => (
    <section className='bg-surface border border-outline p-6 shadow-xs rounded-lg'>
        <div className='flex items-center gap-2 mb-6'>
            <div className='h-5 w-5 bg-hover-icon rounded animate-pulse' />
            <div className='h-5 w-36 bg-hover-icon rounded animate-pulse' />
        </div>
        <div className='space-y-4'>
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className='flex items-center gap-3 pb-3 border-b border-divider-light'>
                    <div className='h-8 w-8 bg-hover-icon rounded-full animate-pulse shrink-0' />
                    <div className='flex-1 flex items-center justify-between gap-4'>
                        <div className='h-4 w-40 bg-hover-icon rounded animate-pulse' />
                        <div className='h-4 w-24 bg-hover-icon rounded animate-pulse' />
                    </div>
                </div>
            ))}
        </div>
    </section>
)

export const RecentSalesSkeleton = () => (
    <section className='bg-surface border border-outline p-6 shadow-xs rounded-lg'>
        <div className='h-5 w-32 bg-hover-icon rounded animate-pulse mb-6' />
        <div className='space-y-1'>
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className='flex items-center gap-4 p-3 border-b border-divider-light'>
                    <div className='h-9 w-9 bg-hover-icon rounded-lg animate-pulse' />
                    <div className='flex-1 space-y-1'>
                        <div className='h-4 w-20 bg-hover-icon rounded animate-pulse' />
                        <div className='h-3 w-28 bg-hover-icon rounded animate-pulse' />
                    </div>
                    <div className='h-4 w-16 bg-hover-icon rounded animate-pulse' />
                </div>
            ))}
        </div>
    </section>
)
