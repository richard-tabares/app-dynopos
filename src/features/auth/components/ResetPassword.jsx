import { NavLink, useNavigate } from "react-router"
import { resetPassword } from '../helpers/resetPassword'
import { useState, useMemo } from "react"
import { toast } from 'react-toastify'
import { Eye, EyeClosed } from 'lucide-react'

export const ResetPassword = () => {
    const navigate = useNavigate()

    const hashParams = useMemo(() => {
        const hash = window.location.hash
        if (!hash) return null
        const params = new URLSearchParams(hash.replace('#', '?'))
        return {
            access_token: params.get('access_token'),
            refresh_token: params.get('refresh_token'),
        }
    }, [])

    const token = hashParams?.access_token
    const refreshToken = hashParams?.refresh_token
    const invalidLink = window.location.hash !== '' && !token

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const onHandleSubmit = async (e) => {
        e.preventDefault()
        if (password.length < 8) {
            toast.error('La contraseña debe tener al menos 8 caracteres')
            return
        }
        if (password !== confirmPassword) {
            toast.error('Las contraseñas no coinciden')
            return
        }
        try {
            const data = await resetPassword(token, refreshToken, password)
            if (data) {
                toast.success('Contraseña actualizada exitosamente')
                navigate('/login', { replace: true })
            }
        } catch (error) {
            toast.error(error.message || 'Error al restablecer la contraseña')
        }
    }

    if (invalidLink) {
        return (
            <section className='flex justify-center place-items-center h-screen bg-gray-100'>
                <section className='bg-white w-1/3 max-lg:w-2/4 max-md:w-3/4 border border-gray-300 p-10 text-center'>
                    <h1 className='text-2xl font-bold text-center text-gray-800 mb-2'>Enlace inválido</h1>
                    <p className='text-gray-600 mb-8'>El enlace para restablecer tu contraseña es inválido o ha expirado.</p>
                    <NavLink
                        to='/forgot-password'
                        className='text-primary-600 text-decoration-none font-semibold transition-all duration-300 hover:text-purple-600 hover:underline'>
                        Solicitar nuevo enlace
                    </NavLink>
                </section>
            </section>
        )
    }

    return (
        <section className='flex justify-center place-items-center h-screen bg-gray-100'>
            <section className='bg-white w-1/3 max-lg:w-2/4 max-md:w-3/4 border border-gray-300 p-10'>
                <h1 className='text-2xl font-bold text-center text-gray-800 mb-2'>Restablecer Contraseña</h1>
                <p className='text-gray-600 text-center mb-8'>
                    Ingresa tu nueva contraseña
                </p>
                <form action=''>
                    <section className='relative flex items-center mb-4'>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder='Nueva contraseña'
                            className='border border-gray-200 rounded-md py-3 px-4 w-full pr-10'
                        />
                        <button
                            type='button'
                            className='absolute right-3 bg-transparent border-none cursor-pointer text-lg p-1 text-primary-300 hover:scale-125 transition-transform duration-200'
                            onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <Eye /> : <EyeClosed />}
                        </button>
                    </section>
                    <section className='relative flex items-center mb-4'>
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder='Confirmar contraseña'
                            className='border border-gray-200 rounded-md py-3 px-4 w-full pr-10'
                        />
                        <button
                            type='button'
                            className='absolute right-3 bg-transparent border-none cursor-pointer text-lg p-1 text-primary-300 hover:scale-125 transition-transform duration-200'
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                            {showConfirmPassword ? <Eye /> : <EyeClosed />}
                        </button>
                    </section>
                    <button type="submit" className='py-3 px-6 font-semibold bg-primary-600 text-white rounded-md w-full cursor-pointer mb-2' onClick={onHandleSubmit}>
                        Restablecer contraseña
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
