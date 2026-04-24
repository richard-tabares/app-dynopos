import { NavLink, useNavigate } from "react-router"
import { login } from '../helpers/login'
import { useState } from "react"
import { toast } from 'react-toastify'
import { useStore } from '../../../app/providers/store'

export const Login = () => {
    const navigate = useNavigate()
    const setLogin = useStore((state) => state.setLogin)


    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const user = {
        email: email,
        password: password
    }

    const onHandleSubmit = async (e) => {
        e.preventDefault()
        try {
            const data = await login(user, setLogin)
            if (data) {
                toast.success('Sesión iniciada correctamente')
                navigate('/dashboard', {replace:true})
            } else {
                toast.error('Credenciales incorrectas')
            }
        } catch (error) {
            toast.error(error.message || 'Error al iniciar sesión')
        }
    }
    return (
        <section className='flex justify-center place-items-center h-screen bg-gray-100'>
            <section className='bg-white w-1/3 max-lg:w-2/4 max-md:w-3/4 border border-gray-300 p-10'>
                <h1 className='text-2xl font-bold text-center text-gray-800 mb-2'>Iniciar Sesión</h1>
                <p className='text-gray-600 text-center'>
                    Bienvenido de vuelta! 👋
                </p>
                <p className='text-gray-600 text-center mb-8'>Inicia sesión para administrar con tu negocio</p>
                <form action=''>
                    <input
                        type='email'
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder='Correo Electrónico'
                        className='border border-gray-200 rounded-md py-3 px-4 w-full mb-4'
                    />
                    <input
                        type='password'
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder='Contraseña'
                        className='border border-gray-200 rounded-md py-3 px-4 w-full mb-4'
                    />
                    <button type="submit" className='py-3 px-6 font-semibold bg-primary-600 text-white rounded-md w-full cursor-pointer mb-2' onClick={onHandleSubmit}>
                        Iniciar Sesión
                    </button>
                    <p className='text-center text-gray-600 text-xs mb-8'>
                        <NavLink
                            to='/forgot-password'
                            className='text-primary-600 text-decoration-none font-semibold transition-all duration-300 hover:text-purple-600 hover:underline'>
                            Olvidaste tu contraseña
                        </NavLink>
                    </p>
                    <p className='text-center text-gray-600'>
                        ¿Aún no tienes cuenta?{' '}
                        <NavLink
                            to='/signup'
                            className='text-primary-600 text-decoration-none font-semibold transition-all duration-300 hover:text-purple-600 hover:underline'>
                            Registrate aquí
                        </NavLink>
                    </p>
                </form>
            </section>
        </section>
    )
}
