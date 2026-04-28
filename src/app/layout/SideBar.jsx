import { useState } from 'react'
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
    PanelLeftClose,
    ChevronDown,
    FileText,
    Warehouse
} from 'lucide-react'
import { useNavigate, NavLink, useLocation } from 'react-router'
import { useStore } from '../providers/store'
import { logout } from '../../features/auth/helpers/logout'

export const SideBar = () => {
    const isMobile = useStore((state) => state.isMobile)
    const setIsMobile = useStore((state) => state.setIsMobile)
    const isCollapsed = useStore((state) => state.isCollapsed)
    const setIsCollapsed = useStore((state) => state.setIsCollapsed)

    const user = useStore((state) => state.user)
    const navigate = useNavigate()
    const location = useLocation()

    const [reportsOpen, setReportsOpen] = useState(location.pathname.startsWith('/reports'))

    const reportSubItems = [
        { id: 'ventas', label: 'Ventas', icon: ShoppingCart, path: '/reports/ventas' },
        { id: 'inventario', label: 'Inventario', icon: Warehouse, path: '/reports/inventario' },
        { id: 'administrativos', label: 'Administrativos', icon: FileText, path: '/reports/administrativos' },
    ]

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
            path: '#',
            hasSubmenu: true,
        },
        {
            id: 'settings',
            label: 'Configuraciones',
            icon: Settings,
            path: '/settings',
        },
    ]

    const handleLogout = async () => {
        await logout()
        setIsMobile(false)
        navigate('/login', { replace: true })
    }

    const isActiveParent = (item) => {
        if (item.hasSubmenu) return location.pathname.startsWith('/reports')
        return location.pathname === item.path
    }

    const isActiveSub = (path) => location.pathname === path

    return (
        <>
            {isMobile && (
                <section
                    className='fixed inset-0 bg-gray-800 opacity-45 z-20 lg:hidden'
                    onClick={() => setIsMobile(false)}></section>
            )}
            <aside
                className={`fixed flex flex-col left-0 top-0 border-r justify-between border-gray-300 h-screen bg-white z-30 transition-all duration-300 
                ${isMobile ? 'max-lg:translate-x-0 w-64' : 'max-lg:-translate-x-64'}
                ${isCollapsed ? 'w-20' : 'w-64'}
                `}>
                <section className={`h-16 border-b border-gray-300 flex items-center gap-2 px-3 
                    ${isCollapsed ? 'justify-center' : 'justify-between'}
                `}>
                    {user?.business?.business_logo ? (
                        <img src={user.business.business_logo} alt="Business Logo" className={`w-12 h-12 rounded-full ${isCollapsed ? 'hidden' : 'block'}`} />
                    ) : (
                        ''
                    )}
                    
                    <span className={`text-xl font-semibold flex-1 ${isCollapsed ? 'hidden' : 'block'}`}>
                        {user?.business.business_name || 'Dyno POS'}
                    </span>
                    <button
                        className={'p-2 rounded-lg cursor-pointer hover:bg-gray-200 hidden lg:block'}
                        onClick={() => setIsCollapsed(!isCollapsed)}>
                        {isCollapsed ? <PanelLeftOpen className='w-5 h-5' /> : <PanelLeftClose className='w-5 h-5' />}
                    </button>
                    <button
                        className='p-2 rounded-lg cursor-pointer hover:bg-gray-200 hidden max-lg:block'
                        onClick={() => setIsMobile(false)}>
                        <X className='w-5 h-5' />
                    </button>
                </section>

                <nav className='flex-1 p-4 overflow-y-auto'>
                    <ul className='h-full space-y-2 flex flex-col'>
                        {menuItems.map((item) => {
                            const Icon = item.icon
                            if (item.hasSubmenu) {
                                return (
                                    <li key={item.id}>
                                        <button
                                            onClick={() => {
                                                if (!isCollapsed) {
                                                    setReportsOpen(!reportsOpen)
                                                } else {
                                                    navigate('/reports')
                                                }
                                                setIsMobile(false)
                                            }}
                                            className={`w-full flex items-center text-sm font-semibold px-3 py-2 rounded-lg transition-colors cursor-pointer
                                                ${isCollapsed ? 'justify-center' : 'justify-between'}
                                                ${isActiveParent(item)
                                                    ? 'bg-primary-50 text-primary-600'
                                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                                }`}
                                        >
                                            <div className={`flex items-center ${isCollapsed ? '' : ''}`}>
                                                <Icon className={`w-5 h-5 ${isCollapsed ? 'mr-0' : 'mr-2'}`} />
                                                <span className={`${isCollapsed ? 'hidden' : 'block'}`}>{item.label}</span>
                                            </div>
                                            {!isCollapsed && (
                                                <ChevronDown className={`w-4 h-4 transition-transform ${reportsOpen ? 'rotate-180' : ''}`} />
                                            )}
                                        </button>
                                        {!isCollapsed && reportsOpen && (
                                            <ul className='mt-1 space-y-1 ml-2'>
                                                {reportSubItems.map((sub) => {
                                                    const SubIcon = sub.icon
                                                    return (
                                                        <li key={sub.id}>
                                                            <NavLink
                                                                to={sub.path}
                                                                onClick={() => setIsMobile(false)}
                                                                className={`flex items-center text-sm font-medium px-3 py-2 rounded-lg transition-colors
                                                                    ${isActiveSub(sub.path)
                                                                        ? 'bg-primary-50 text-primary-600'
                                                                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                                                                    }`}
                                                            >
                                                                <SubIcon className='w-4 h-4 mr-2' />
                                                                <span>{sub.label}</span>
                                                            </NavLink>
                                                        </li>
                                                    )
                                                })}
                                            </ul>
                                        )}
                                    </li>
                                )
                            }
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
                        <li
                            className={`mt-auto flex items-center text-red-600 text-sm font-semibold hover:bg-red-50 transition px-3 py-2 rounded-lg cursor-pointer ${isCollapsed ? 'justify-center' : 'justify-start'}`}
                            onClick={handleLogout}>
                            <LogOut className={`w-5 h-5 ${isCollapsed ? 'mr-0' : 'mr-2'}`} />
                            <span className={`${isCollapsed ? 'hidden' : 'block'}`}>Salir</span>
                        </li>
                    </ul>
                </nav>
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
