import { Settings, CreditCard, Scale, Printer, Shield, Bell, Users, Megaphone, X } from 'lucide-react'
import { NavLink } from 'react-router'

const sections = [
    {
        category: 'General',
        icon: Settings,
        items: [
            { id: 'info', label: 'Información', path: '/settings/info' },
            { id: 'appearance', label: 'Apariencia', path: '/settings/appearance' },
        ],
    },
    {
        category: 'Facturación',
        icon: CreditCard,
        items: [
            { id: 'billing', label: 'Suscripción', path: '/settings/billing' },
        ],
    },
    {
        category: 'Unidades de Medida',
        icon: Scale,
        items: [
            { id: 'units', label: 'Variables', path: '/settings/units' },
        ],
    },
    {
        category: 'Impresión',
        icon: Printer,
        items: [
            { id: 'printing', label: 'Impresora', path: '/settings/printing' },
            { id: 'receipts', label: 'Recibos', path: '/settings/receipts' },
        ],
    },
    {
        category: 'Seguridad',
        icon: Shield,
        items: [
            { id: 'security', label: 'Contraseña', path: '/settings/security' },
        ],
    },
    {
        category: 'Notificaciones',
        icon: Bell,
        items: [
            { id: 'notifications', label: 'Stock Bajo', path: '/settings/notifications' },
        ],
    },
    {
        category: 'Usuarios',
        icon: Users,
        items: [
            { id: 'users', label: 'Gestión', path: '/settings/users' },
        ],
    },
    {
        category: 'Novedades',
        icon: Megaphone,
        items: [
            { id: 'changelog', label: 'Actualizaciones', path: '/settings/changelog' },
        ],
    },
]

export const SettingsNav = ({ onClose }) => {
    return (
        <nav className='h-full flex flex-col'>
            <section className='flex items-center justify-between px-4 py-3 border-b border-outline lg:hidden'>
                <span className='text-sm font-semibold text-on-body'>Configuraciones</span>
                <button
                    onClick={onClose}
                    className='p-1.5 rounded-lg hover:bg-hover text-muted cursor-pointer'>
                    <X className='w-5 h-5' />
                </button>
            </section>
            <section className='flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-none'>
                {sections.map((group) => {
                    const CategoryIcon = group.icon
                    return (
                        <section key={group.category}>
                            <p className='flex items-center gap-2 px-3 text-xs font-semibold text-muted uppercase tracking-wider mb-1'>
                                <CategoryIcon className='w-3.5 h-3.5' />
                                {group.category}
                            </p>
                            <ul className='space-y-0.5'>
                                {group.items.map((item) => (
                                    <li key={item.id}>
                                        <NavLink
                                            to={item.path}
                                            onClick={onClose}
                                            className={({ isActive }) =>
                                                `flex items-center gap-2 pl-3 pr-3 py-2 rounded-lg text-sm font-medium transition-colors
                                                ${isActive
                                                    ? 'text-accent'
                                                    : 'text-muted hover:text-accent'
                                                }`
                                            }
                                        >
                                            {({ isActive }) => (
                                                <>
                                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${isActive ? 'bg-accent' : 'bg-transparent'}`} />
                                                    <span>{item.label}</span>
                                                </>
                                            )}
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )
                })}
            </section>
        </nav>
    )
}
