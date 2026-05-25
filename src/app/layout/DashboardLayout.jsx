import { Outlet, useLocation, useNavigate } from 'react-router'
import { SideBar } from './SideBar'
import { Header } from './Header'
import { useEffect } from 'react'
import { useStore } from '../providers/store'
import { getDashboardData } from '../../features/dashboard/helpers/getDashboardData'

const RESTRICTED_BY_ROLE = {
    cajero: ['/dashboard', '/products', '/categories', '/inventory', '/reports', '/settings'],
    supervisor: ['/dashboard', '/reports', '/settings'],
}

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
        const role = user?.profile?.role
        const restrictedPaths = RESTRICTED_BY_ROLE[role]
        if (restrictedPaths) {
            const isRestricted = restrictedPaths.some((prefix) =>
                location.pathname.startsWith(prefix)
            )
            if (isRestricted) {
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