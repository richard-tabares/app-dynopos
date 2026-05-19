import { NavLink, useNavigate } from "react-router"
import { login } from '../helpers/login'
import { useState } from "react"
import { toast } from 'react-toastify'
import { useStore } from '../../../app/providers/store'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const Login = () => {
    const navigate = useNavigate()
    const setLogin = useStore((state) => state.setLogin)

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errors, setErrors] = useState({})
    const [touched, setTouched] = useState({})
    const [loading, setLoading] = useState(false)

    const validateForm = () => {
        const newErrors = {}
        if (!email.trim()) {
            newErrors.email = 'El correo electrónico es requerido'
        } else if (!emailRegex.test(email)) {
            newErrors.email = 'Por favor, ingresa un email válido'
        }
        if (!password.trim()) {
            newErrors.password = 'La contraseña es requerida'
        } else if (password.length < 8) {
            newErrors.password = 'La contraseña debe tener al menos 8 caracteres'
        }
        return newErrors
    }

    const handleChange = (field) => (e) => {
        const value = e.target.value
        if (field === 'email') setEmail(value)
        if (field === 'password') setPassword(value)
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
            const user = { email, password }
            setLoading(true)
            try {
                const data = await login(user, setLogin)
                if (data) {
                    toast.success('Sesión iniciada correctamente')
                    navigate('/dashboard', { replace: true })
                } else {
                    toast.error('Credenciales incorrectas')
                }
            } catch (error) {
                toast.error(error.message || 'Error al iniciar sesión')
            } finally {
                setLoading(false)
            }
        } else {
            setErrors(newErrors)
            setTouched({ email: true, password: true })
        }
    }

    const inputClass = (field) =>
        `border rounded-md py-3 px-4 w-full transition-all duration-300 focus:outline-none ${
            touched[field] && errors[field]
                ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-0 focus:ring-red-200'
                : 'border-divider focus:border-accent focus:ring-0 focus:ring-accent'
        }`

    return (
        <section className='flex justify-center place-items-center h-screen bg-surface'>
            <section className='w-1/3 max-lg:w-2/4 max-md:w-11/12 p-6 md:p-10'>
                <h1 className='text-2xl font-bold text-center text-on-surface mb-2'>Iniciar Sesión</h1>
                <p className='text-on-body text-center'>
                    Bienvenido de vuelta! 👋
                </p>
                <p className='text-on-body text-center mb-8'>Inicia sesión para administrar con tu negocio</p>
                <form onSubmit={handleSubmit}>
                    <section className='flex flex-col gap-2 mb-4'>
                        <input
                            type='email'
                            name="email"
                            value={email}
                            onChange={handleChange('email')}
                            onBlur={handleBlur('email')}
                            placeholder='Correo Electrónico'
                            className={inputClass('email')}
                        />
                        {touched.email && errors.email && (
                            <p className='text-xs font-semibold text-red-500'>{errors.email}</p>
                        )}
                    </section>
                    <section className='flex flex-col gap-2 mb-4'>
                        <input
                            type='password'
                            name="password"
                            value={password}
                            onChange={handleChange('password')}
                            onBlur={handleBlur('password')}
                            placeholder='Contraseña'
                            className={inputClass('password')}
                        />
                        {touched.password && errors.password && (
                            <p className='text-xs font-semibold text-red-500'>{errors.password}</p>
                        )}
                    </section>
                    <button type="submit" disabled={loading} className='py-3 px-6 font-semibold bg-accent text-surface hover:bg-accent/85 transition-all duration-300 rounded-md w-full cursor-pointer mb-2 disabled:opacity-60 disabled:cursor-not-allowed'>
                        {loading ? 'Iniciando...' : 'Iniciar Sesión'}
                    </button>
                    <p className='text-center text-on-body text-xs mb-8'>
                        <NavLink
                            to='/forgot-password'
                            className='text-accent text-decoration-none font-semibold transition-all duration-300 hover:underline'>
                            Olvidaste tu contraseña
                        </NavLink>
                    </p>
                    <p className='text-center text-on-body'>
                        ¿Aún no tienes cuenta?{' '}
                        <NavLink
                            to='/signup'
                            className='text-accent text-decoration-none font-semibold transition-all duration-300 hover:underline'>
                            Registrate aquí
                        </NavLink>
                    </p>
                </form>
            </section>
        </section>
    )
}
