import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { useStore } from './store.js'
import { Toaster } from 'sileo'
import { DashboardLayout } from './components/DashboardLayout.jsx'
import { Login } from './features/auth/Login.jsx'
import { Dashboard } from './features/dashboard/Dashboard.jsx'
import { Clients } from './features/clients/Clients.jsx'
import { Support } from './features/support/Support.jsx'
import { Payments } from './features/payments/Payments.jsx'

export const App = () => {
    const token = useStore((state) => state.token)
    const isDarkMode = useStore((state) => state.isDarkMode)

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDarkMode)
    }, [isDarkMode])

    return (
        <BrowserRouter>
            <section className='bg-body min-h-screen'>
                <Routes>
                    <Route path='/login' element={<Login />} />

                    {token ? (
                        <Route element={<DashboardLayout />}>
                            <Route path='/dashboard' element={<Dashboard />} />
                            <Route path='/clients' element={<Clients />} />
                            <Route path='/support' element={<Support />} />
                            <Route path='/payments' element={<Payments />} />
                            <Route path='/*' element={<Navigate to='/dashboard' replace />} />
                        </Route>
                    ) : (
                        <Route path='/*' element={<Navigate to='/login' replace />} />
                    )}
                </Routes>
            </section>
            <Toaster
                position='top-right'
                theme={isDarkMode ? 'dark' : 'light'}
                options={{
                    duration: 3000,
                    roundness: 10,
                    autopilot: { expand: 500, collapse: 5000 },
                    styles: {
                        title: 'text-toast-text! font-bold! text-center! text-lg!',
                        description: 'text-toast-text! text-center!',
                        badge: 'bg-toast-text!',
                        button: 'bg-toast-text! hover:bg-toast-text!',
                    },
                }}
            />
        </BrowserRouter>
    )
}
