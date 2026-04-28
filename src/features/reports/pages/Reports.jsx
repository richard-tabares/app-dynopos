import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import { BarChart3 } from 'lucide-react'

export const Reports = () => {
    const location = useLocation()

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [location.pathname])

    return (
        <section className='space-y-6 pb-12'>
            <Outlet />
        </section>
    )
}
