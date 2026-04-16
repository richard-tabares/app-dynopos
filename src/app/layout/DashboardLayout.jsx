import { Outlet } from 'react-router'
import { SideBar } from './SideBar'
import { Header } from './Header'

export const DashboardLayout = () => {
    return (
        <section className='bg-gray-50'>
            <SideBar />
            <Header />
            <main className='p-6 border ml-64 translate-y-16 transition-transform duration-300 max-lg:ml-0'>
                <Outlet />
            </main>
        </section>
    )
}
