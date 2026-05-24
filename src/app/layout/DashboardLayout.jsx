import { Outlet, useLocation, useNavigate } from 'react-router'
import { SideBar } from './SideBar'
import { Header } from './Header'
import { useEffect } from 'react'
import { useStore } from '../providers/store'
import { getDashboardData } from '../../features/dashboard/helpers/getDashboardData'

const CAJERO_RESTRICTED = [
    '/products', '/categories', '/inventory',
    '/reports', '/settings',
]

export const DashboardLayout = () => {
    const { user, isCollapsed, setTodayRevenue, todayRevenue } = useStore()
    const businessId = user?.profile?.business_id || user?.data?.user?.id
    const businessName = `${user?.business?.business_name} - POS`
    const location = useLocation()
    const navigate = useNavigate()

    useEffect(() => {
        document.title = businessName || 'DynoPOS'
    }, [businessName])

    useEffect(() => {
        const isCajero = user?.profile?.role === 'cajero'
        if (isCajero) {
            const restricted = CAJERO_RESTRICTED.some((prefix) =>
                location.pathname.startsWith(prefix)
            )
            if (restricted) {
                navigate('/sales', { replace: true })
            }
        }
    }, [user, location.pathname, navigate])

    useEffect(() => {
        const fetchRevenue = async () => {
            if (!businessId) return
            try {
                const data = await getDashboardData(businessId)
                setTodayRevenue(data.metrics.todayRevenue)
            } catch (error) {
                console.error('Error fetching daily revenue in layout:', error)
                setTodayRevenue(0)
            }
        }
        fetchRevenue()
    }, [businessId, location.pathname, setTodayRevenue])

    return (
        <section className='bg-body'>
            <SideBar />
            <Header todayRevenue={todayRevenue} />
            <main className={`p-6 mt-16 transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'} max-lg:ml-0`}>
                <Outlet />
            </main>
        </section>
    )
}