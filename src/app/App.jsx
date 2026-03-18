import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { Dashboard } from '../features/dashboard/pages/Dashboard'
import { SideBar } from './layout/SideBar'
import { Header } from './layout/Header'

export const App = () => {
    const stats = {
        todaySales: '1,820',
        revenue: '56,700',
    }

    return (
        <BrowserRouter>
            <section className='bg-gray-50'>
                <SideBar />
                <Header />

                <main>
                    <Routes>
                        <Route
                            path='/'
                            element={<Dashboard />}
                        />
                        <Route
                            path='/dashboard'
                            element={<Dashboard />}
                        />

                        <Route
                            path='/*'
                            element={<Navigate to='/' />}
                        />
                    </Routes>
                </main>
            </section>
        </BrowserRouter>
    )
}
