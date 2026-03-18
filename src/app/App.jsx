import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { Dashboard } from '../features/dashboard/pages/Dashboard'
import { SideBar } from './layout/SideBar'
import { Header } from './layout/Header'
import { useState } from 'react'

export const App = () => {

    const [isMobile, setIsMobile] = useState(false)

    const stats = {
        todaySales: '1,820',
        revenue: '56,700',
    }

    return (
        <BrowserRouter>
            <section className='bg-gray-50'>
                <SideBar isMobile={ isMobile } setIsMobile={ setIsMobile } />
                <Header setIsMobile={ setIsMobile } />

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
