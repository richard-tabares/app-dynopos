import { Outlet, useLocation, useNavigate } from 'react-router'
import { SideBar } from './SideBar'
import { Header } from './Header'
import { useEffect } from 'react'
import { useStore } from '../providers/store'
import { getDashboardData } from '../../features/dashboard/helpers/getDashboardData'
import { getDefaultPermissions } from '../../shared/helpers/permissions'
import { useSessionKeepalive } from '../../shared/hooks/useSessionKeepalive'
import { SessionExpiredModal } from '../../shared/components/SessionExpiredModal'

const PATH_TO_PERMISSION = {
    '/dashboard': 'dashboard',
    '/sales': 'sales',
    '/products': 'products',
    '/categories': 'categories',
    '/reports': 'reports',
    '/settings': 'settings',
}

export const DashboardLayout = () => {
    useSessionKeepalive()
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
        const permissions = user?.profile?.permissions
            ? user.profile.permissions
            : getDefaultPermissions(role)

        const basePath = '/' + location.pathname.split('/')[1]
        const requiredPerm = PATH_TO_PERMISSION[basePath]
        if (requiredPerm && !permissions.includes(requiredPerm)) {
            navigate('/sales', { replace: true })
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
        <section className='bg-body min-h-dvh'>
            <SideBar />
            <Header todayRevenue={todayRevenue} />
            <main className={`max-lg:p-4 p-6 mt-16 transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'} max-lg:ml-0`}>
                <Outlet />
            </main>
            <SessionExpiredModal />
        </section>
    )
}