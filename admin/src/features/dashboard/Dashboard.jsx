import { LayoutDashboard } from 'lucide-react'

export const Dashboard = () => {
    return (
        <section className='flex flex-col gap-6'>
            <section>
                <h1 className='text-2xl font-bold'>Dashboard</h1>
                <p className='text-on-body'>Panel de control del sistema</p>
            </section>

            <section className='bg-surface border border-outline shadow-xs rounded-lg p-6'>
                <div className='flex flex-col items-center justify-center py-16 text-center'>
                    <div className='p-4 rounded-xl bg-blue-100 dark:bg-blue-900/20 mb-4'>
                        <LayoutDashboard className='w-12 h-12 text-blue-600 dark:text-blue-400' />
                    </div>
                    <h2 className='text-xl font-semibold text-on-surface mb-2'>Dashboard</h2>
                    <p className='text-muted max-w-md'>
                        Esta sección estará disponible próximamente. Aquí podrás ver métricas generales del sistema.
                    </p>
                </div>
            </section>
        </section>
    )
}
