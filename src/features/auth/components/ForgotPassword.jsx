import { NavLink, useNavigate } from "react-router"
import { forgotPassword } from '../helpers/forgotPassword'
import { useState } from "react"
import { toast } from 'react-toastify'

export const ForgotPassword = () => {
    const navigate = useNavigate()

    const [email, setEmail] = useState('')

    const onHandleSubmit = async (e) => {
        e.preventDefault()
        try {
            const data = await forgotPassword(email)
            if (data) {
                toast.success('Si el correo está registrado, recibirás un enlace para restablecer tu contraseña')
                navigate('/login', { replace: true })
            } else {
                toast.error('Error al enviar el correo')
            }
        } catch (error) {
            toast.error(error.message || 'Error al enviar el correo')
        }
    }

    return (
        <section className='flex justify-center place-items-center h-screen bg-gray-100'>
            <section className='bg-white w-1/3 max-lg:w-2/4 max-md:w-3/4 border border-gray-300 p-10'>
                <h1 className='text-2xl font-bold text-center text-gray-800 mb-2'>Recuperar Contraseña</h1>
                <p className='text-gray-600 text-center mb-8'>
                    Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
                </p>
                <form action=''>
                    <input
                        type='email'
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder='Correo Electrónico'
                        className='border border-gray-200 rounded-md py-3 px-4 w-full mb-4'
                    />
                    <button type="submit" className='py-3 px-6 font-semibold bg-primary-600 text-white rounded-md w-full cursor-pointer mb-2' onClick={onHandleSubmit}>
                        Enviar enlace
                    </button>
                    <p className='text-center text-gray-600'>
                        <NavLink
                            to='/login'
                            className='text-primary-600 text-decoration-none font-semibold transition-all duration-300 hover:text-purple-600 hover:underline'>
                            Volver a Iniciar Sesión
                        </NavLink>
                    </p>
                </form>
            </section>
        </section>
    )
}
