import { useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import { Menu } from 'lucide-react'
import { SettingsNav } from './SettingsNav'

const sectionMeta = {
    '/settings/info': { title: 'Información', description: 'Información general del negocio' },
    '/settings/appearance': { title: 'Apariencia', description: 'Personaliza la apariencia de la aplicación' },
    '/settings/receipts': { title: 'Recibos', description: 'Configura el mensaje de pie de página de los tickets' },
    '/settings/notifications': { title: 'Notificaciones', description: 'Administra las notificaciones del sistema' },
    '/settings/printing': { title: 'Impresión Térmica', description: 'Configura tu impresora térmica para tickets' },
    '/settings/units': { title: 'Unidades de Medida', description: 'Configura las unidades de medida variables' },
    '/settings/security': { title: 'Seguridad', description: 'Cambia tu contraseña de acceso' },
    '/settings/billing': { title: 'Facturación', description: 'Administra tu suscripción y métodos de pago' },
    '/settings/users': { title: 'Usuarios', description: 'Gestiona los usuarios del sistema' },
}

export const SettingsLayout = () => {
    const [showMobileNav, setShowMobileNav] = useState(false)
    const location = useLocation()
    const meta = sectionMeta[location.pathname] || { title: 'Configuraciones', description: '' }

    return (
        <section className='flex flex-col lg:flex-row gap-0 lg:gap-6'>
            {/* Mobile nav toggle */}
            <section className='flex items-center gap-3 lg:hidden mb-4'>
                <button
                    onClick={() => setShowMobileNav(true)}
                    className='p-2 rounded-lg hover:bg-hover text-muted cursor-pointer'>
                    <Menu className='w-5 h-5' />
                </button>
                <section>
                    <h1 className='text-xl font-bold text-on-body'>{meta.title}</h1>
                    <p className='text-sm text-muted'>{meta.description}</p>
                </section>
            </section>

            {/* Mobile nav overlay */}
            {showMobileNav && (
                <section
                    className='fixed inset-0 bg-overlay backdrop-blur-xs z-40 lg:hidden'
                    onClick={() => setShowMobileNav(false)}
                />
            )}
            <aside
                className={`
                    fixed top-0 left-0 h-full w-72 bg-surface border-r border-outline z-50 shadow-xl
                    transition-transform duration-300 lg:hidden
                    ${showMobileNav ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                <SettingsNav onClose={() => setShowMobileNav(false)} />
            </aside>

            {/* Desktop sidebar */}
            <aside className='hidden lg:block lg:w-64 shrink-0'>
                <section className='sticky top-6'>
                    <SettingsNav />
                </section>
            </aside>

            {/* Content */}
            <section className='flex-1 min-w-0'>
                {/* Desktop header */}
                <section className='hidden lg:block mb-6'>
                    <h1 className='text-2xl font-bold text-on-body'>{meta.title}</h1>
                    <p className='text-muted'>{meta.description}</p>
                </section>
                <Outlet />
            </section>
        </section>
    )
}
