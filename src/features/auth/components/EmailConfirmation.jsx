import { MailCheck } from 'lucide-react'
import { NavLink, useLocation } from 'react-router'

export const EmailConfirmation = () => {
    const location = useLocation()
    const email = location.state?.email || ''

    return (
        <section className='w-full min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4'>
            <section className='w-full max-w-md bg-white border border-gray-300 p-10 text-center'>
                <div className='flex justify-center mb-6'>
                    <div className='w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center'>
                        <MailCheck className='w-10 h-10 text-primary-600' />
                    </div>
                </div>

                <h1 className='text-2xl font-bold text-gray-800 mb-4'>
                    Revisa tu correo electrónico
                </h1>

                <p className='text-gray-600 mb-2'>
                    Hemos enviado un enlace de confirmación a:
                </p>

                <p className='font-semibold text-gray-900 mb-6 break-all'>
                    {email || 'tu correo electrónico'}
                </p>

                <p className='text-sm text-gray-500 mb-8'>
                    Por favor, revisa tu bandeja de entrada y haz clic en el enlace
                    para activar tu cuenta. Si no encuentras el correo, revisa la
                    carpeta de spam.
                </p>

                <NavLink
                    to='/login'
                    className='inline-block w-full px-6 py-3 bg-primary-600 text-white rounded-lg text-base font-semibold text-center transition-all duration-300 hover:bg-primary-500'>
                    Ir al inicio de sesión
                </NavLink>
            </section>
        </section>
    )
}
