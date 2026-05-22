import { Bell, Menu, MessageCircleQuestionMark } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useStore } from '../providers/store'
import { useLocation } from 'react-router'
import { LogoSymbol } from '../../shared/components/LogoSymbol'
import { SupportDropdown } from '../../features/support/components/SupportDropdown'
import { SupportModal } from '../../features/support/components/SupportModal'

const pageInfo = [
    { path: '/dashboard', title: 'Dashboard', description: 'Resumen general de tu negocio' },
    { path: '/sales', title: 'Punto de Venta', description: 'Gestiona tus ventas y transacciones' },
    { path: '/categories', title: 'Categorías', description: 'Administra las categorías de tus productos' },
    { path: '/products', title: 'Productos', description: 'Administra tu catálogo de productos' },
    { path: '/inventory', title: 'Inventario', description: 'Controla el stock de tus productos' },
    { path: '/reports', title: 'Reportes', description: 'Visualiza análisis y estadísticas de ventas' },
    { path: '/settings/account', title: 'Configuraciones', description: 'Ajusta la configuración de tu negocio' },
    { path: '/settings/billing', title: 'Facturación', description: 'Gestiona tu suscripción y métodos de pago' },
]

export const Header = ({ todayRevenue = 0 }) => {
    const setIsMobile = useStore((state) => state.setIsMobile)
    const isCollapsed = useStore((state) => state.isCollapsed)
    const location = useLocation()
    const [supportOpen, setSupportOpen] = useState(false)
    const [supportModalOpen, setSupportModalOpen] = useState(false)
    const supportRef = useRef(null)

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (supportRef.current && !supportRef.current.contains(e.target)) {
                setSupportOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const currentPage = pageInfo.find(info => location.pathname.startsWith(info.path))
    const title = currentPage?.title || 'DynoPOS'
    const description = currentPage?.description || 'Sistema de Punto de Venta'

    const formatCurrency = (value) => 
        new Intl.NumberFormat('es-CO', { 
            maximumFractionDigits: 0 
        }).format(value)

    return (
        <>
        <header className={`fixed bg-surface top-0 border-b border-outline right-0 z-50 transition-all duration-300 
            ${isCollapsed ? 'left-20' : 'left-64'}
            max-lg:left-0 max-lg:w-full`}>
            <section className='flex items-center justify-between px-4 gap-4 min-h-16'>
                <section className='hidden max-lg:flex items-center self-stretch pr-4 mr-2 border-r border-outline'>
                    <LogoSymbol className='h-8' />
                </section>

                {/* Page title and description */}
                <section className='flex-1 max-sm:py-2'>
                    <h1 className='text-xl font-bold'>{title}</h1>
                    <p className='text-muted text-sm max-sm:hidden'>
                        {description}
                    </p>
                    <p className='text-muted text-sm hidden max-sm:block max-xs:!hidden'>
                        Ventas hoy: <span className='text-green-600 font-bold'>${formatCurrency(todayRevenue)}</span>
                    </p>
                </section>
                {/* stats and notifications */}
                <section className='flex items-center gap-6'>
                    {/* stats */}
                    <section className='text-right max-sm:hidden'>
                        <p className='text-xs text-muted'>Ventas hoy</p>
                        <p className='text-lg font-bold text-green-600'>${formatCurrency(todayRevenue)}</p>
                    </section>

                    {/* notifications */}
                    <section className='p-2 text-on-body hover:text-accent rounded-lg cursor-pointer transition-all duration-300'>
                        <Bell className='w-5 h-5' />
                    </section>
                    <section ref={supportRef} className='relative'>
                        <section
                            className='p-2 text-on-body hover:text-accent rounded-lg cursor-pointer transition-all duration-300'
                            onClick={() => setSupportOpen((prev) => !prev)}>
                            <MessageCircleQuestionMark className='w-5 h-5' />
                        </section>
                        {supportOpen && <SupportDropdown
                            onClose={() => setSupportOpen(false)}
                            onOpenModal={() => { setSupportOpen(false); setSupportModalOpen(true) }}
                        />}
                    </section>
                    <button
                        className='rounded-lg cursor-pointer hidden max-lg:block hover:bg-accent/5 hover:text-accent duration-300 transition p-2'
                        onClick={() => setIsMobile(true)}>
                        <Menu className='w-5 h-5 visible' />
                    </button>
                </section>
            </section>
        </header>
        {supportModalOpen && <SupportModal onClose={() => setSupportModalOpen(false)} />}
        </>    )
}
