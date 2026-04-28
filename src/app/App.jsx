import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { Dashboard } from '../features/dashboard/pages/Dashboard'
import { DashboardLayout } from './layout/DashboardLayout'
import { Sales } from '../features/sales/pages/Sales'
import { Categories } from '../features/categories/pages/Categories'
import { Inventory } from '../features/inventory/pages/Inventory'
import { Reports } from '../features/reports/pages/Reports'
import { SalesReports } from '../features/reports/pages/SalesReports'
import { InventoryReports } from '../features/reports/pages/InventoryReports'
import { PerformanceReports } from '../features/reports/pages/PerformanceReports'
import { AdminReports } from '../features/reports/pages/AdminReports'
import { Settings } from '../features/settings/pages/Settings'
import { Login } from '../features/auth/components/Login'
import { SignUp } from '../features/auth/components/SignUp'
import { EmailConfirmation } from '../features/auth/components/EmailConfirmation'
import { EmailConfirmationSuccess } from '../features/auth/components/EmailConfirmationSuccess'
import { ForgotPassword } from '../features/auth/components/ForgotPassword'
import { ResetPassword } from '../features/auth/components/ResetPassword'
import { useStore } from './providers/store'
import { Products } from '../features/products/pages/Products'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export const App = () => {
    const user = useStore((state) => state.user)

    return (
        <BrowserRouter>
            <section className='bg-gray-50'>
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
                            <Route path='/reports' element={<Reports />}>
                                <Route index element={<Navigate to='ventas' replace />} />
                                <Route path='ventas' element={<SalesReports />} />
                                <Route path='inventario' element={<InventoryReports />} />
                                <Route path='rendimiento' element={<PerformanceReports />} />
                                <Route path='administrativos' element={<AdminReports />} />
                            </Route>
                            <Route
                                path='/settings'
                                element={<Settings />}
                            />
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
            <ToastContainer
                position='top-right'
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme='light'
            />
        </BrowserRouter>
    )
}
