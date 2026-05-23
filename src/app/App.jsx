import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { Dashboard } from '../features/dashboard/pages/Dashboard'
import { DashboardLayout } from './layout/DashboardLayout'
import { Sales } from '../features/sales/pages/Sales'
import { Categories } from '../features/categories/pages/Categories'
import { Inventory } from '../features/inventory/pages/Inventory'
import { Reports } from '../features/reports/pages/Reports'
import { SalesReports } from '../features/reports/ventas/pages/SalesReports'
import { InventoryMovements } from '../features/reports/inventario/pages/InventoryMovements'
import { DevolucionesReports } from '../features/reports/devoluciones/pages/DevolucionesReports'
import { GananciasReports } from '../features/reports/ganancias/pages/GananciasReports'
import { Settings } from '../features/settings/pages/Settings'
import { Account } from '../features/settings/account/pages/Account'
import { Billing } from '../features/settings/billing/pages/Billing'
import { Login } from '../features/auth/components/Login'
import { SignUp } from '../features/auth/components/SignUp'
import { PaymentStep } from '../features/auth/components/PaymentStep'
import { CardPayment } from '../features/auth/components/CardPayment'
import { PaymentPending } from '../features/auth/components/PaymentPending'
import { PaymentSuccess } from '../features/auth/components/PaymentSuccess'
import { EmailConfirmation } from '../features/auth/components/EmailConfirmation'
import { EmailConfirmationSuccess } from '../features/auth/components/EmailConfirmationSuccess'
import { ForgotPassword } from '../features/auth/components/ForgotPassword'
import { ResetPassword } from '../features/auth/components/ResetPassword'
import { useStore } from './providers/store'
import { Products } from '../features/products/pages/Products'
import { Toaster } from 'sileo'

export const App = () => {
    const user = useStore((state) => state.user)
    const isDarkMode = useStore((state) => state.isDarkMode)

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDarkMode)
    }, [isDarkMode])

    return (
        <BrowserRouter>
            <section className='bg-body'>
                <Routes>
                    {/* Rutas Publicas */}
                    <Route
                        path='/login'
                        element={<Login />}
                    />

                    <Route
                        path='/signup'
                        element={<SignUp />}
                    />

                    <Route
                        path='/signup/payment'
                        element={<PaymentStep />}
                    />

                    <Route
                        path='/signup/card-payment'
                        element={<CardPayment />}
                    />

                    <Route
                        path='/signup/pending'
                        element={<PaymentPending />}
                    />

                    <Route
                        path='/signup/success'
                        element={<PaymentSuccess />}
                    />

                    <Route
                        path='/emailConfirmation'
                        element={<EmailConfirmation />}
                    />

                    <Route
                        path='/emailConfirmation/success'
                        element={<EmailConfirmationSuccess />}
                    />

                    <Route
                        path='/forgot-password'
                        element={<ForgotPassword />}
                    />

                    <Route
                        path='/reset-password'
                        element={<ResetPassword />}
                    />

                    {/* Rutas Privadas */}
                    {user && Object.keys(user).length > 0 ? (
                        <Route element={<DashboardLayout />}>
                            <Route
                                path='/dashboard'
                                element={<Dashboard />}
                            />
                            <Route
                                path='/sales'
                                element={<Sales />}
                            />
                            <Route
                                path='/categories'
                                element={<Categories />}
                            />
                            <Route
                                path='/products'
                                element={<Products />}
                            />
                            <Route
                                path='/inventory'
                                element={<Inventory />}
                            />
                            <Route
                                path='/reports'
                                element={<Reports />}>
                                <Route
                                    index
                                    element={
                                        <Navigate
                                            to='ventas'
                                            replace
                                        />
                                    }
                                />
                                <Route
                                    path='ventas'
                                    element={<SalesReports />}
                                />
                                <Route
                                    path='inventario'
                                    element={<InventoryMovements />}
                                />
                                <Route
                                    path='devoluciones'
                                    element={<DevolucionesReports />}
                                />
                                <Route
                                    path='ganancias'
                                    element={<GananciasReports />}
                                />
                            </Route>
                            <Route
                                path='/settings'
                                element={<Settings />}>
                                <Route
                                    index
                                    element={
                                        <Navigate
                                            to='account'
                                            replace
                                        />
                                    }
                                />
                                <Route
                                    path='account'
                                    element={<Account />}
                                />
                                <Route
                                    path='billing'
                                    element={<Billing />}
                                />
                            </Route>
                            <Route
                                path='/*'
                                element={<Navigate to='/dashboard' />}
                            />
                        </Route>
                    ) : (
                        // Ruta por defecto
                        <Route
                            path='/*'
                            element={<Navigate to='/login' />}
                        />
                    )}
                </Routes>
            </section>
            <Toaster
                position='top-right'
                theme={isDarkMode ? 'dark' : 'light'}
                options={{
                    duration: 3000,
                    roundness: 10,
                    autopilot: {
                        expand: 500,
                        collapse: 5000,
                    },
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
