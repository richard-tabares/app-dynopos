import { useEffect } from 'react'
import {
    LayoutDashboard, Users, LifeBuoy, CreditCard,
    X, LogOut, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react'
import { NavLink, useNavigate } from 'react-router'
import { useStore } from '../store.js'
import { LogoComplete } from './LogoComplete.jsx'
import { LogoSymbol } from './LogoSymbol.jsx'

const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'clients', label: 'Clientes', icon: Users, path: '/clients' },
    { id: 'support', label: 'Soporte', icon: LifeBuoy, path: '/support' },
    { id: 'payments', label: 'Pagos', icon: CreditCard, path: '/payments' },
]

export const SideBar = () => {
    const isMobile = useStore((state) => state.isMobile)
    const setIsMobile = useStore((state) => state.setIsMobile)
    const rawCollapsed = useStore((state) => state.isCollapsed)
    const setIsCollapsed = useStore((state) => state.setIsCollapsed)
    const isCollapsed = isMobile ? false : rawCollapsed
    const profile = useStore((state) => state.profile)
    const navigate = useNavigate()

    const displayName = profile?.display_name || 'Admin'
    const initials = displayName.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024 && isMobile) {
                setIsMobile(false)
            }
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [isMobile, setIsMobile])

    const handleLogout = () => {
        useStore.getState().setLogOut()
        setIsMobile(false)
        navigate('/login', { replace: true })
    }

    return (
        <>
            {isMobile && (
                <section
                    className='fixed inset-0 bg-overlay backdrop-blur-xs z-20 lg:hidden'
                    onClick={() => setIsMobile(false)}
                />
            )}
            <aside
                className={`fixed flex flex-col top-0 justify-between h-screen bg-surface z-30 transition-all duration-300 border-outline
                    lg:left-0 lg:border-r
                    max-lg:right-0 max-lg:border-l
                    ${isMobile ? 'max-lg:translate-x-0' : 'max-lg:translate-x-full'}
                    ${isCollapsed ? 'w-20' : 'w-64'}
                `}
            >
                <section className='border-b border-outline shrink-0'>
                    <section className={`flex items-center gap-2 px-3 min-h-16 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                        <section className='flex items-center self-stretch'>
                            <LogoComplete className={`h-8 ${isCollapsed ? 'hidden' : 'block'}`} />
                            <LogoSymbol className={`h-8 ${isCollapsed ? 'block' : 'hidden'}`} />
                        </section>
                        <button
                            className={`p-2 rounded-lg cursor-pointer hover:bg-accent/5 hover:text-accent hidden lg:block ${isCollapsed ? 'lg:hidden' : ''}`}
                            onClick={() => setIsCollapsed(!isCollapsed)}
                        >
                            <PanelLeftClose className='w-5 h-5' />
                        </button>
                        <button
                            className='p-2 rounded-lg cursor-pointer hover:bg-accent/5 hover:text-accent hidden max-lg:block'
                            onClick={() => setIsMobile(false)}
                        >
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
                                    className='w-full flex items-center justify-center text-on-body text-sm font-semibold px-3 py-2 rounded-lg hover:bg-accent/5 hover:text-accent transition-colors cursor-pointer'
                                >
                                    <PanelLeftOpen className='w-5 h-5' />
                                </button>
                            </li>
                        )}
                        {menuItems.map((item) => {
                            const Icon = item.icon
                            return (
                                <li key={item.id} onClick={() => setIsMobile(false)}>
                                    <NavLink
                                        to={item.path}
                                        className={({ isActive }) =>
                                            `flex items-center text-sm font-semibold px-3 py-2 rounded-lg transition-all duration-200
                                            ${isCollapsed ? 'justify-center' : 'justify-start'}
                                            ${isActive ? 'bg-accent/10 text-accent' : 'text-on-body hover:bg-accent/5 hover:text-accent'}`
                                        }
                                    >
                                        <Icon className={`w-5 h-5 ${isCollapsed ? 'mr-0' : 'mr-2'}`} />
                                        <span className={`${isCollapsed ? 'hidden' : 'block'}`}>{item.label}</span>
                                    </NavLink>
                                </li>
                            )
                        })}
                        <li
                            className={`mt-auto flex items-center text-red-600 text-sm font-semibold hover:bg-red-500/10 transition px-3 py-2 rounded-lg cursor-pointer ${isCollapsed ? 'justify-center' : 'justify-start'}`}
                            onClick={handleLogout}
                        >
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
                            <span className='text-sm font-medium'>Super Admin</span>
                            <span className='text-xs text-muted'>{displayName}</span>
                        </section>
                    </section>
                </section>
            </aside>
        </>
    )
}
