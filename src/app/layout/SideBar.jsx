import { useState, useEffect } from 'react'
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    BarChart3,
    Tags,
    Settings,
    X,
    LogOut,
    PanelLeftOpen,
    PanelLeftClose,
    ChevronDown,
    Undo2,
    Warehouse,
    TrendingUp,
    User,
    Users,
    CreditCard
} from 'lucide-react'
import { useNavigate, NavLink, useLocation } from 'react-router'
import { useStore } from '../providers/store'
import { logout } from '../../features/auth/helpers/logout'
import { LogoComplete } from '../../shared/components/LogoComplete'
import { LogoSymbol } from '../../shared/components/LogoSymbol'
import { getDefaultPermissions } from '../../shared/helpers/permissions'

export const SideBar = () => {
    const isMobile = useStore((state) => state.isMobile)
    const setIsMobile = useStore((state) => state.setIsMobile)
    const rawCollapsed = useStore((state) => state.isCollapsed)
    const setIsCollapsed = useStore((state) => state.setIsCollapsed)
    const isCollapsed = isMobile ? false : rawCollapsed

    const user = useStore((state) => state.user)
    const displayName = user?.profile?.display_name || user?.business?.owner_name || 'Usuario'
    const initials = displayName.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024 && isMobile) {
                setIsMobile(false)
            }
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [isMobile, setIsMobile])

    const [reportsOpen, setReportsOpen] = useState(location.pathname.startsWith('/reports'))
    const [settingsOpen, setSettingsOpen] = useState(location.pathname.startsWith('/settings'))

    const reportSubItems = [
        { id: 'ventas', label: 'Ventas', icon: ShoppingCart, path: '/reports/ventas' },
        { id: 'inventario', label: 'Inventario', icon: Warehouse, path: '/reports/inventario' },
        { id: 'ganancias', label: 'Ganancias', icon: TrendingUp, path: '/reports/ganancias' },
        { id: 'devoluciones', label: 'Devoluciones', icon: Undo2, path: '/reports/devoluciones' },
    ]

    const settingsSubItems = [
        { id: 'account', label: 'Cuenta', icon: User, path: '/settings/account' },
        { id: 'billing', label: 'Facturación', icon: CreditCard, path: '/settings/billing' },
        { id: 'users', label: 'Usuarios', icon: Users, path: '/settings/users' },
    ]

    const role = user?.profile?.role
    const permissions = user?.profile?.permissions?.length
        ? user.profile.permissions
        : getDefaultPermissions(role)

    const allMenuItems = [
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
            path: '#',
            hasSubmenu: true,
        },
    ]

    const menuItems = allMenuItems.filter((m) => permissions.includes(m.id))

    const handleLogout = async () => {
        await logout()
        setIsMobile(false)
        navigate('/login', { replace: true })
    }

    const isActiveParent = (item) => {
        if (item.id === 'reports') return location.pathname.startsWith('/reports')
        if (item.id === 'settings') return location.pathname.startsWith('/settings')
        if (item.hasSubmenu) return location.pathname.startsWith(`/${item.id}`)
        return location.pathname === item.path
    }

    const isActiveSub = (path) => location.pathname === path

    return (
        <>
            {isMobile && (
                <section
                    className='fixed inset-0 bg-overlay backdrop-blur-xs opacity-100 z-20 lg:hidden'
                    onClick={() => setIsMobile(false)}></section>
            )}
            <aside
                className={`fixed flex flex-col top-0 justify-between h-screen bg-surface z-30 transition-all duration-300 border-outline
                lg:left-0 lg:border-r
                max-lg:right-0 max-lg:border-l
                ${isMobile ? 'max-lg:translate-x-0' : 'max-lg:translate-x-full'}
                ${isCollapsed ? 'w-20' : 'w-64'}
                `}>
                <section className='border-b border-outline shrink-0'>
                    <section className={`flex items-center gap-2 px-3 min-h-16
                        ${isCollapsed ? 'justify-center' : 'justify-between'}
                    `}>
                        <section className='flex items-center self-stretch'>
                            <LogoComplete className={`h-8 ${isCollapsed ? 'hidden' : 'block'}`} />
                            <LogoSymbol className={`h-8 ${isCollapsed ? 'block' : 'hidden'}`} />
                        </section>
                        <button
                            className={`p-2 rounded-lg cursor-pointer hover:bg-accent/5  hover:text-accent hidden lg:block ${isCollapsed ? 'lg:hidden' : ''}`}
                            onClick={() => setIsCollapsed(!isCollapsed)}>
                            <PanelLeftClose className='w-5 h-5' />
                        </button>
                        <button
                            className='p-2 rounded-lg cursor-pointer hover:bg-accent/5 hover:text-accent hidden max-lg:block'
                            onClick={() => setIsMobile(false)}>
                            <X className='w-5 h-5' />
                        </button>
                    </section>
                </section>

                <nav className='flex-1 p-4 overflow-y-auto scrollbar-none'>
                    <ul className='h-full space-y-2 flex flex-col'>
                        {isCollapsed && (
                            <li>
                                <button
                                    onClick={() => setIsCollapsed(false)}
                                    className='w-full flex items-center justify-center text-on-body text-sm font-semibold px-3 py-2 rounded-lg hover:bg-accent/5 hover:text-accent transition-colors cursor-pointer'>
                                    <PanelLeftOpen className='w-5 h-5' />
                                </button>
                            </li>
                        )}
                        {menuItems.map((item) => {
                            const Icon = item.icon
                            if (item.hasSubmenu) {
                                const isOpen = item.id === 'reports' ? reportsOpen : settingsOpen
                                const toggleOpen = item.id === 'reports'
                                    ? () => setReportsOpen(!reportsOpen)
                                    : () => setSettingsOpen(!settingsOpen)
                                const allSubs = item.id === 'reports' ? reportSubItems : settingsSubItems
                                const subItems = allSubs.filter((s) => permissions.includes(`${item.id}.${s.id}`))

                                return (
                                    <li key={item.id}>
                                        <button
                                            onClick={() => {
                                                if (isCollapsed) {
                                                    setIsCollapsed(false)
                                                    item.id === 'reports' ? setReportsOpen(true) : setSettingsOpen(true)
                                                } else {
                                                    toggleOpen()
                                                }
                                            }}
                                            className={`w-full flex items-center text-sm font-semibold px-3 py-2 rounded-lg transition-colors cursor-pointer
                                                ${isCollapsed ? 'justify-center' : 'justify-between'}
                                                ${isActiveParent(item)
                                                    ? 'bg-accent/10 text-accent'
                                                    : 'text-on-body hover:bg-accent/5 hover:text-accent'
                                                }`}
                                        >
                                            <div className={`flex items-center ${isCollapsed ? '' : ''}`}>
                                                <Icon className={`w-5 h-5 ${isCollapsed ? 'mr-0' : 'mr-2'}`} />
                                                <span className={`${isCollapsed ? 'hidden' : 'block'}`}>{item.label}</span>
                                            </div>
                                            {!isCollapsed && (
                                                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                            )}
                                        </button>
                                        {!isCollapsed && isOpen && (
                                            <ul className='mt-1 space-y-1 ml-2'>
                                                {subItems.map((sub) => {
                                                    const SubIcon = sub.icon
                                                    return (
                                                        <li key={sub.id}>
                                                            <NavLink
                                                                to={sub.path}
                                                                onClick={() => setIsMobile(false)}
                                                                className={`flex items-center text-sm font-medium px-3 py-2 rounded-lg transition-colors
                                                                     ${isActiveSub(sub.path)
                                                                         ? 'bg-accent/5 text-accent'
                                                                         : 'text-muted hover:bg-accent/5 hover:text-accent'
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
                                            `flex items-center text-sm font-semibold px-3 py-2 rounded-lg transition-all duration-200
                                            ${isCollapsed ? 'justify-center' : 'justify-start'}
                                            ${
                                                isActive
                                                    ? 'bg-accent/10 text-accent'
                                                    : 'text-on-body hover:bg-accent/5 hover:text-accent'
                                            }`
                                        }>
                                        <Icon className={`w-5 h-5 ${isCollapsed ? 'mr-0' : 'mr-2'}`} />
                                        <span className={`${isCollapsed ? 'hidden' : 'block'}`}>{item.label}</span>
                                    </NavLink>
                                </li>
                            )
                        })}
                        <li
                            className={`mt-auto flex items-center text-red-600 text-sm font-semibold hover:bg-red-500/10 transition px-3 py-2 rounded-lg cursor-pointer ${isCollapsed ? 'justify-center' : 'justify-start'}`}
                            onClick={handleLogout}>
                            <LogOut className={`w-5 h-5 ${isCollapsed ? 'mr-0' : 'mr-2'}`} />
                            <span className={`${isCollapsed ? 'hidden' : 'block'}`}>Salir</span>
                        </li>
                    </ul>
                </nav>
                <section className={`border-t border-outline p-4 relative ${isCollapsed ? 'flex justify-center' : ''}`}>
                    <section className={`flex items-center ${isCollapsed ? 'flex-col gap-y-2' : 'gap-x-3'}`}>
                        <section className='flex items-center place-content-center w-10 h-10 bg-hover-strong rounded-full shrink-0'>
                            <span className='text-sm font-semibold'>{initials}</span>
                        </section>
                        <section className={`flex flex-col text-left ${isCollapsed ? 'hidden' : 'block'}`}>
                            <span className='text-sm font-medium first-letter:uppercase'>{user?.profile?.role}</span>
                            <span className='text-xs text-muted'>{displayName}</span>
                        </section>
                    </section>
                </section>
            </aside>
        </>
    )
}
