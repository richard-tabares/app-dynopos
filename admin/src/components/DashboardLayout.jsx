import { useEffect } from 'react'
import { Outlet } from 'react-router'
import { SideBar } from './SideBar.jsx'
import { Header } from './Header.jsx'
import { useStore } from '../store.js'

export const DashboardLayout = () => {
    const isCollapsed = useStore((state) => state.isCollapsed)

    useEffect(() => {
        document.title = 'DynoPOS — Admin'
    }, [])

    return (
        <section className='bg-body min-h-screen'>
            <SideBar />
            <Header />
            <main className={`p-6 mt-16 transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'} max-lg:ml-0`}>
                <Outlet />
            </main>
        </section>
    )
}
