import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    BarChart3,
    RotateCcw,
    Settings,
    X,
} from 'lucide-react'
import { NavLink } from 'react-router'

export const SideBar = ({ isMobile, setIsMobile }) => {
    const menuItems = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: LayoutDashboard,
            path: '/dashboard',
        },
        { id: 'sales', label: 'Ventas', icon: ShoppingCart, path: '/sales' },
        {
            id: 'returns',
            label: 'Devoluciones',
            icon: RotateCcw,
            path: '/returns',
        },
        {
            id: 'inventory',
            label: 'Inventario',
            icon: Package,
            path: '/inventory',
        },
        { id: 'reports', label: 'Reportes', icon: BarChart3, path: '/reports' },
        {
            id: 'settings',
            label: 'Configuraciones',
            icon: Settings,
            path: '/settings',
        },
    ]

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
                className={`fixed flex flex-col left-0 top-0 border-r justify-between border-gray-300 w-64 h-screen bg-white z-30 transition-transform duration-300 max-lg:-translate-x-64 ${isMobile ? 'max-lg:translate-x-0' : 'max-lg:-translate-x-64'}`}>
                {/* Logo */}
                <section className='h-16 border-b border-gray-300 flex items-center place-content-center gap-2 px-6'>
                    <ShoppingCart className='w-8 h-8' />
                    <span className='text-2xl font-semibold flex-1'>
                        Dyno POS
                    </span>
                    <button
                        className='p-2 rounded-lg cursor-pointer hover:bg-gray-200 hidden max-lg:block'
                        onClick={() => setIsMobile(false)}>
                        <X className='w-5 h-5' />
                    </button>
                </section>
                {/* Nav */}
                <nav className='flex-1 p-4'>
                    <ul className='space-y-2 flex flex-col'>
                        {menuItems.map((item) => {
                            const Icon = item.icon
                            return (
                                <li
                                    key={item.id}
                                    onClick={() => setIsMobile(false)}>
                                    <NavLink
                                        to={item.path}
                                        className={({ isActive }) =>
                                            `flex items-center text-gray-600 text-sm font-semibold px-3 py-2 rounded-lg
                                            ${
                                                isActive
                                                    ? 'bg-primary-50 text-primary-600'
                                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                            }`
                                        }>
                                        <Icon className='mr-2 w-5 -h5' />
                                        <span>{item.label}</span>
                                    </NavLink>
                                </li>
                            )
                        })}
                    </ul>
                </nav>
                {/* User profile */}
                <section className='flex border-t border-gray-300 b-0 p-4 gap-x-3'>
                    <section className='flex items-center place-content-center w-10 h-10 bg-gray-200 rounded-full'>
                        <span>AD</span>
                    </section>
                    <section className='flex flex-col'>
                        <span className='text-sm font-medium'>Admin</span>
                        <span className='text-xs'>admon@dynopos.com</span>
                    </section>
                </section>
            </aside>
        </>
    )
}
