import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    BarChart3,
    Tags,
    Settings,
    X,
    LogOut,
    ClipboardList,
    PanelLeftOpen, 
    PanelLeftClose
} from 'lucide-react'
import { useNavigate, NavLink } from 'react-router'
import { useStore } from '../providers/store'
import { logout } from '../../features/auth/helpers/logout'

export const SideBar = () => {
    const isMobile = useStore((state) => state.isMobile)
    const setIsMobile = useStore((state) => state.setIsMobile)
    const isCollapsed = useStore((state) => state.isCollapsed)
    const setIsCollapsed = useStore((state) => state.setIsCollapsed)

    const setLogout = useStore((state) => state.setLogOut)
    const user = useStore((state) => state.user)
    const navigate = useNavigate()

    const menuItems = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: LayoutDashboard,
            path: '/dashboard',
        },
        {
            id: 'sales',
            label: 'Ventas',
            icon: ShoppingCart,
            path: '/sales',
        },
        {
            id: 'products',
            label: 'Productos',
            icon: Package,
            path: '/products',
        },
        {
            id: 'categories',
            label: 'Categorías',
            icon: Tags,
            path: '/categories',
        },
        {
            id: 'inventory',
            label: 'Inventario',
            icon: ClipboardList,
            path: '/inventory',
        },
        {
            id: 'reports',
            label: 'Reportes',
            icon: BarChart3,
            path: '/reports',
        },
        {
            id: 'settings',
            label: 'Configuraciones',
            icon: Settings,
            path: '/settings',
        },
    ]

    const handleLogout = async () => {
        await logout(setLogout)
        setIsMobile(false)
        // Redirigir al login
        navigate('/login', { replace: true })
    }

    return (
        <>
            {/* overlay when isMobile is true */}
            {isMobile && (
                <section
                    className='fixed inset-0 bg-gray-800 opacity-45 z-20 lg:hidden'
                    onClick={() => setIsMobile(false)}></section>
            )}
            {/* aside bar */}
            <aside
                className={`fixed flex flex-col left-0 top-0 border-r justify-between border-gray-300 h-screen bg-white z-30 transition-all duration-300 
                ${isMobile ? 'max-lg:translate-x-0 w-64' : 'max-lg:-translate-x-64'}
                ${isCollapsed ? 'w-20' : 'w-64'}
                `}>
                {/* Logo */}
                <section className={`h-16 border-b border-gray-300 flex items-center gap-2 px-3 
                    ${isCollapsed ? 'justify-center' : 'justify-between'}
                `}>
                    {user?.business?.business_logo ? (
                        <img src={user.business.business_logo} alt="Business Logo" className={`w-12 h-12 rounded-full ${isCollapsed ? 'hidden' : 'block'}`} />
                    ) : (
                        ''
                    )}
                    
                    <span className={`text-2xl font-semibold flex-1 ${isCollapsed ? 'hidden' : 'block'}`}>
                        {user?.business.business_name || 'Dyno POS'}
                    </span>
                    <button
                        className={'p-2 rounded-lg cursor-pointer hover:bg-gray-200 hidden lg:block'} // Always visible on large screens
                        onClick={() => setIsCollapsed(!isCollapsed)}>
                        {isCollapsed ? <PanelLeftOpen className='w-5 h-5' /> : <PanelLeftClose className='w-5 h-5' />}
                    </button>
                    <button
                        className='p-2 rounded-lg cursor-pointer hover:bg-gray-200 hidden max-lg:block'
                        onClick={() => setIsMobile(false)}>
                        <X className='w-5 h-5' />
                    </button>
                </section>

                {/* Nav */}
                <nav className='flex-1 p-4'>
                    <ul className='h-full space-y-2 flex flex-col'>
                        {menuItems.map((item) => {
                            const Icon = item.icon
                            return (
                                <li
                                    key={item.id}
                                    onClick={() => setIsMobile(false)}>
                                    <NavLink
                                        to={item.path}
                                        className={({ isActive}) =>
                                            `flex items-center text-gray-600 text-sm font-semibold px-3 py-2 rounded-lg
                                            ${isCollapsed ? 'justify-center' : 'justify-start'}
                                            ${
                                                isActive
                                                    ? 'bg-primary-50 text-primary-600'
                                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                            }`
                                        }>
                                        <Icon className={`w-5 h-5 ${isCollapsed ? 'mr-0' : 'mr-2'}`} />
                                        <span className={`${isCollapsed ? 'hidden' : 'block'}`}>{item.label}</span>
                                    </NavLink>
                                </li>
                            )
                        })}
                        {/* Menu salir */}
                        <li
                            className={`mt-auto flex items-center text-red-600 text-sm font-semibold hover:bg-red-50 transition px-3 py-2 rounded-lg cursor-pointer ${isCollapsed ? 'justify-center' : 'justify-start'}`}
                            onClick={handleLogout}>
                            <LogOut className={`w-5 h-5 ${isCollapsed ? 'mr-0' : 'mr-2'}`} />
                            <span className={`${isCollapsed ? 'hidden' : 'block'}`}>Salir</span>
                        </li>
                    </ul>
                </nav>
                {/* Perfil de usuario */}
                <section className={`border-t border-gray-300 p-4 relative ${isCollapsed ? 'flex justify-center' : ''}`}>
                    <section className={`flex items-center ${isCollapsed ? 'flex-col gap-y-2' : 'gap-x-3'}`}>
                        <section className='flex items-center place-content-center w-10 h-10 bg-gray-200 rounded-full shrink-0'>
                            <span>AD</span>
                        </section>
                        <section className={`flex flex-col text-left ${isCollapsed ? 'hidden' : 'block'}`}>
                            <span className='text-sm font-medium first-letter:uppercase'>{ user.profile.role }</span>
                            <span className='text-xs text-gray-500'>
                                {
                                    user && user.business.owner_name || 'Usuario'
                                }
                            </span>
                        </section>
                    </section>
                </section>
            </aside>

        </>
    )
}
