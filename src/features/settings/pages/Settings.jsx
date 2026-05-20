import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'

export const Settings = () => {
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
