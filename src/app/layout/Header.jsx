import { Bell, Menu } from 'lucide-react'

export const Header = ({ setIsMobile }) => {
    return (
        <header className='fixed bg-white left-64 h-16 border-b border-gray-300 right-0 transition-transform duration-300 max-lg:-translate-x-64 max-lg:w-full'>
            <section className='flex items-center h-full justify-between px-4 gap-4'>
                <button className='p-2 rounded-lg cursor-pointer hidden max-lg:block hover:bg-gray-200' onClick={() => setIsMobile(true)}>
                    <Menu className='w-5 h-5 visible' />
                </button>

                {/* Page title and description */}
                <section className='flex-1'>
                    <h1 className='text-xl font-bold'>Dashboard</h1>
                    <p className='text-gray-500 text-sm max-sm:hidden'>
                        Resumen general de tu negocio
                    </p>
                </section>
                {/* stats and notifications */}
                <section className='flex items-center gap-6'>
                    {/* stats */}
                    <section className='text-right max-sm:hidden'>
                        <p className='text-xs text-gray-500'>Ventas hoy</p>
                        <p className='text-lg font-bold'>56,700</p>
                    </section>
                    <section className='text-right max-sm:hidden'>
                        <p className='text-xs text-gray-500'>Ingresos</p>
                        <p className='text-lg font-bold text-green-600'>
                            56,700
                        </p>
                    </section>

                    {/* notifications */}
                    <section className='p-2 text-gray-600 hover:bg-gray-200 rounded-lg cursor-pointer'>
                        <Bell className='w-5 h-5' />
                    </section>
                </section>
            </section>
        </header>
    )
}
