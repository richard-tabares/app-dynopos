import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'

export const EmailConfirmationSuccess = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [status, setStatus] = useState('verifying')

    useEffect(() => {
        const verifyEmail = async () => {
            const hashParams = new URLSearchParams(
                location.hash.replace('#', '?')
            )
            const accessToken = hashParams.get('access_token')
            const refreshToken = hashParams.get('refresh_token')
            const errorDescription = hashParams.get('error_description')

            if (errorDescription) {
                setStatus('error')
                return
            }

            if (!accessToken) {
                setStatus('error')
                return
            }

            try {
                const apiUrl = import.meta.env.VITE_API_URL
                const response = await fetch(
                    `${apiUrl}/api/auth/confirm`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            access_token: accessToken,
                            refresh_token: refreshToken,
                        }),
                    }
                )

                if (!response.ok) {
                    setStatus('error')
                    return
                }

                setStatus('success')
            } catch {
                setStatus('error')
            }
        }

        verifyEmail()
    }, [location.hash])

    if (status === 'verifying') {
        return (
            <section className='w-full min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4'>
                <section className='w-full max-w-md bg-white border border-gray-300 p-10 text-center'>
                    <div className='flex justify-center mb-6'>
                        <Loader2 className='w-12 h-12 text-primary-600 animate-spin' />
                    </div>
                    <h1 className='text-2xl font-bold text-gray-800 mb-4'>
                        Verificando tu correo...
                    </h1>
                    <p className='text-gray-500'>
                        Por favor espera un momento.
                    </p>
                </section>
            </section>
        )
    }

    if (status === 'error') {
        return (
            <section className='w-full min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4'>
                <section className='w-full max-w-md bg-white border border-gray-300 p-10 text-center'>
                    <div className='flex justify-center mb-6'>
                        <div className='w-20 h-20 bg-red-100 rounded-full flex items-center justify-center'>
                            <XCircle className='w-10 h-10 text-red-500' />
                        </div>
                    </div>
                    <h1 className='text-2xl font-bold text-gray-800 mb-4'>
                        Error de confirmación
                    </h1>
                    <p className='text-gray-600 mb-8'>
                        El enlace de confirmación es inválido o ha expirado.
                        Por favor, regístrate nuevamente para recibir un nuevo
                        enlace.
                    </p>
                    <button
                        onClick={() => navigate('/signup', { replace: true })}
                        className='w-full px-6 py-3 bg-primary-600 text-white rounded-lg text-base font-semibold transition-all duration-300 hover:bg-primary-500'>
                        Volver al registro
                    </button>
                </section>
            </section>
        )
    }

    return (
        <section className='w-full min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4'>
            <section className='w-full max-w-md bg-white border border-gray-300 p-10 text-center'>
                <div className='flex justify-center mb-6'>
                    <div className='w-20 h-20 bg-green-100 rounded-full flex items-center justify-center'>
                        <CheckCircle2 className='w-10 h-10 text-green-500' />
                    </div>
                </div>
                <h1 className='text-2xl font-bold text-gray-800 mb-4'>
                    ¡Correo confirmado exitosamente!
                </h1>
                <p className='text-gray-600 mb-8'>
                    Tu cuenta ha sido activada. Ahora puedes iniciar sesión con
                    tu correo y contraseña.
                </p>
                <button
                    onClick={() => navigate('/login', { replace: true })}
                    className='w-full px-6 py-3 bg-primary-600 text-white rounded-lg text-base font-semibold transition-all duration-300 hover:bg-primary-500'>
                    Ir al inicio de sesión
                </button>
            </section>
        </section>
    )
}
