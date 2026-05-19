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
    const [errors, setErrors] = useState({})
    const [touched, setTouched] = useState({})
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const validateForm = () => {
        const newErrors = {}
        if (!password.trim()) {
            newErrors.password = 'La nueva contraseña es requerida'
        } else if (password.length < 8) {
            newErrors.password = 'La contraseña debe tener al menos 8 caracteres'
        }
        if (!confirmPassword.trim()) {
            newErrors.confirmPassword = 'Debes confirmar la nueva contraseña'
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden'
        }
        return newErrors
    }

    const handleChange = (field) => (e) => {
        const value = e.target.value
        if (field === 'password') setPassword(value)
        if (field === 'confirmPassword') setConfirmPassword(value)
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }))
        }
    }

    const handleBlur = (field) => () => {
        setTouched((prev) => ({ ...prev, [field]: true }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const newErrors = validateForm()

        if (Object.keys(newErrors).length === 0) {
            try {
                const data = await resetPassword(token, refreshToken, password)
                if (data) {
                    toast.success('Contraseña actualizada exitosamente')
                    navigate('/login', { replace: true })
                }
            } catch (error) {
                toast.error(error.message || 'Error al restablecer la contraseña')
            }
        } else {
            setErrors(newErrors)
            setTouched({ password: true, confirmPassword: true })
        }
    }

    if (invalidLink) {
        return (
            <section className='flex justify-center place-items-center h-screen bg-surface'>
                <section className='w-1/3 max-lg:w-2/4 max-md:w-11/12 p-6 md:p-10 text-center'>
                    <h1 className='text-2xl font-bold text-center text-on-surface mb-2'>Enlace inválido</h1>
                    <p className='text-on-body mb-8'>El enlace para restablecer tu contraseña es inválido o ha expirado.</p>
                    <NavLink
                        to='/forgot-password'
                        className='text-accent text-decoration-none font-semibold transition-all duration-300 hover:text-purple-600 hover:underline'>
                        Solicitar nuevo enlace
                    </NavLink>
                </section>
            </section>
        )
    }

    return (
        <section className='flex justify-center place-items-center h-screen bg-surface'>
            <section className='w-1/3 max-lg:w-2/4 max-md:w-11/12 p-6 md:p-10'>
                <h1 className='text-2xl font-bold text-center text-on-surface mb-2'>Restablecer Contraseña</h1>
                <p className='text-on-body text-center mb-8'>
                    Ingresa tu nueva contraseña
                </p>
                <form onSubmit={handleSubmit}>
                    <section className='flex flex-col gap-2 mb-4'>
                        <section className='relative flex items-center'>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={password}
                                onChange={handleChange('password')}
                                onBlur={handleBlur('password')}
                                placeholder='Nueva contraseña'
                                className={`w-full border rounded-md py-3 px-4 pr-10 transition-all duration-300 focus:outline-none ${
                                    touched.password && errors.password
                                        ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-0 focus:ring-red-200'
                                        : 'border-divider focus:border-accent focus:ring-0'
                                }`}
                            />
                            <button
                                type='button'
                                className='absolute right-3 bg-transparent border-none cursor-pointer text-lg p-1 text-accent hover:scale-125 transition-transform duration-200'
                                onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <Eye /> : <EyeClosed />}
                            </button>
                        </section>
                        {touched.password && errors.password && (
                            <p className='text-xs font-semibold text-red-500'>{errors.password}</p>
                        )}
                    </section>
                    <section className='flex flex-col gap-2 mb-4'>
                        <section className='relative flex items-center'>
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                value={confirmPassword}
                                onChange={handleChange('confirmPassword')}
                                onBlur={handleBlur('confirmPassword')}
                                placeholder='Confirmar contraseña'
                                className={`w-full border rounded-md py-3 px-4 pr-10 transition-all duration-300 focus:outline-none ${
                                    touched.confirmPassword && errors.confirmPassword
                                        ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-0 focus:ring-red-200'
                                        : 'border-divider focus:border-accent focus:ring-0'
                                }`}
                            />
                            <button
                                type='button'
                                className='absolute right-3 bg-transparent border-none cursor-pointer text-lg p-1 text-accent hover:scale-125 transition-transform duration-200'
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                {showConfirmPassword ? <Eye /> : <EyeClosed />}
                            </button>
                        </section>
                        {touched.confirmPassword && errors.confirmPassword && (
                            <p className='text-xs font-semibold text-red-500'>{errors.confirmPassword}</p>
                        )}
                        {touched.confirmPassword && !errors.confirmPassword && confirmPassword && password === confirmPassword && (
                            <p className='text-xs font-semibold text-green-600'>✓ Las contraseñas coinciden</p>
                        )}
                    </section>
                    <button type="submit" className='py-3 px-6 font-semibold bg-accent text-white rounded-md w-full cursor-pointer mb-2'>
                        Restablecer contraseña
                    </button>
                    <p className='text-center text-on-body'>
                        <NavLink
                            to='/login'
                            className='text-accent text-decoration-none font-semibold transition-all duration-300 hover:text-purple-600 hover:underline'>
                            Volver a Iniciar Sesión
                        </NavLink>
                    </p>
                </form>
            </section>
        </section>
    )
}
