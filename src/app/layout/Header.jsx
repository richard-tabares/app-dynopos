import { Bell, Menu } from 'lucide-react'
import { useStore } from '../providers/store'
import { useLocation } from 'react-router'

const pageInfo = [
    { path: '/dashboard', title: 'Dashboard', description: 'Resumen general de tu negocio' },
    { path: '/sales', title: 'Punto de Venta', description: 'Gestiona tus ventas y transacciones' },
    { path: '/categories', title: 'Categorías', description: 'Administra las categorías de tus productos' },
    { path: '/products', title: 'Gestión de Productos', description: 'Administra tu catálogo de productos' },
    { path: '/inventory', title: 'Inventario', description: 'Controla el stock de tus productos' },
    { path: '/reports', title: 'Reportes', description: 'Visualiza análisis y estadísticas de ventas' },
    { path: '/settings', title: 'Configuraciones', description: 'Ajusta la configuración de tu negocio' },
]

export const Header = ({ todayRevenue = 0 }) => {
    const setIsMobile = useStore((state) => state.setIsMobile)
    const isCollapsed = useStore((state) => state.isCollapsed)
    const location = useLocation()

    const currentPage = pageInfo.find(info => location.pathname.startsWith(info.path))
    const title = currentPage?.title || 'DynoPOS'
    const description = currentPage?.description || 'Sistema de Punto de Venta'

    const formatCurrency = (value) => 
        new Intl.NumberFormat('es-CO', { 
            maximumFractionDigits: 0 
        }).format(value)

    return (
        <header className={`fixed bg-white top-0 h-16 border-b border-gray-300 right-0 z-50 transition-all duration-300 
            ${isCollapsed ? 'left-20' : 'left-64'}
            max-lg:left-0 max-lg:w-full`}>
            <section className='flex items-center h-full justify-between px-4 gap-4'>
                <button
                    className='p-2 rounded-lg cursor-pointer hidden max-lg:block hover:bg-gray-200'
                    onClick={() => setIsMobile(true)}>
                    <Menu className='w-5 h-5 visible' />
                </button>

                {/* Page title and description */}
                <section className='flex-1'>
                    <h1 className='text-xl font-bold'>{title}</h1>
                    <p className='text-gray-500 text-sm max-sm:hidden'>
                        {description}
                    </p>
                </section>
                {/* stats and notifications */}
                <section className='flex items-center gap-6'>
                    {/* stats */}
                    <section className='text-right max-sm:hidden'>
                        <p className='text-xs text-gray-500'>Ventas hoy</p>
                        <p className='text-lg font-bold text-green-600'>${formatCurrency(todayRevenue)}</p>
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
