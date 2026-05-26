import { Moon, Sun, Menu } from 'lucide-react'
import { useStore } from '../store.js'
import { useLocation } from 'react-router'
import { LogoSymbol } from './LogoSymbol.jsx'

const pageInfo = [
    { path: '/dashboard', title: 'Dashboard', description: 'Panel de control del sistema' },
    { path: '/clients', title: 'Clientes', description: 'Administra los negocios registrados' },
    { path: '/support', title: 'Soporte', description: 'Gestiona los tickets de soporte' },
    { path: '/payments', title: 'Pagos', description: 'Historial de transacciones' },
]

export const Header = () => {
    const setIsMobile = useStore((state) => state.setIsMobile)
    const isCollapsed = useStore((state) => state.isCollapsed)
    const isDarkMode = useStore((state) => state.isDarkMode)
    const toggleDarkMode = useStore((state) => state.toggleDarkMode)
    const location = useLocation()

    const currentPage = pageInfo.find(info => location.pathname.startsWith(info.path))
    const title = currentPage?.title || 'DynoPOS Admin'
    const description = currentPage?.description || 'Panel de administración'

    return (
        <header className={`fixed bg-surface top-0 border-b border-outline right-0 z-40 transition-all duration-300
            ${isCollapsed ? 'left-20' : 'left-64'}
            max-lg:left-0 max-lg:w-full`}
        >
            <section className='flex items-center justify-between px-4 gap-4 min-h-16'>
                <section className='hidden max-lg:flex items-center self-stretch pr-4 mr-2'>
                    <LogoSymbol className='h-8' />
                </section>

                <section className='flex-1'>
                    <h1 className='text-xl font-bold'>{title}</h1>
                    <p className='text-muted text-sm max-sm:hidden'>{description}</p>
                </section>

                <section className='flex items-center gap-2'>
                    <button
                        onClick={toggleDarkMode}
                        className='p-2 text-on-body hover:text-accent rounded-lg cursor-pointer transition-all duration-300'
                        title={isDarkMode ? 'Modo claro' : 'Modo oscuro'}
                    >
                        {isDarkMode ? <Sun className='w-5 h-5' /> : <Moon className='w-5 h-5' />}
                    </button>
                    <button
                        className='rounded-lg cursor-pointer hidden max-lg:block hover:bg-accent/5 hover:text-accent duration-300 transition p-2'
                        onClick={() => setIsMobile(true)}
                    >
                        <Menu className='w-5 h-5' />
                    </button>
                </section>
            </section>
        </header>
    )
}
