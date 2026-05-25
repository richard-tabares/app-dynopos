import { NavLink, useNavigate } from 'react-router'
import {
    Eye,
    EyeClosed,
    Loader,
    LogIn,
    Moon,
    Rocket,
    Sun,
} from 'lucide-react'
import { login } from '../helpers/login'
import { useState, useEffect } from 'react'
import { getPlanFeatures } from '../helpers/getPlanFeatures'
import { sileo } from 'sileo'
import { useStore } from '../../../app/providers/store'
import { LogoComplete } from '../../../shared/components/LogoComplete'
import { FeatureCarousel } from '../../../shared/components/FeatureCarousel'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const Login = () => {
    const navigate = useNavigate()
    const setLogin = useStore((state) => state.setLogin)
    const isDarkMode = useStore((state) => state.isDarkMode)
    const toggleDarkMode = useStore((state) => state.toggleDarkMode)

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errors, setErrors] = useState({})
    const [touched, setTouched] = useState({})
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [features, setFeatures] = useState([])

    useEffect(() => {
        getPlanFeatures().then(setFeatures)
    }, [])

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
            newErrors.password =
                'La contraseña debe tener al menos 8 caracteres'
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
                    sileo.success({
                        fill: 'var(--toast-success)',
                        title: 'Completado',
                        description: 'Sesión iniciada correctamente',
                    })
                    navigate('/dashboard', { replace: true })
                } else {
                    sileo.error({
                        fill: 'var(--toast-error)',
                        title: 'Error',
                        description: 'Credenciales incorrectas',
                    })
                }
            } catch (error) {
                sileo.error({
                    fill: 'var(--toast-error)',
                    title: 'Error',
                    description: error.message || 'Error al iniciar sesión',
                })
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
        <section className='bg-surface flex max-lg:flex-col min-h-screen relative max-lg:justify-center'>
            <button
                onClick={toggleDarkMode}
                className='absolute top-4 right-4 z-50 p-2.5 rounded-full bg-accent text-surface hover:bg-accent/85 transition-all duration-300 cursor-pointer'>
                {isDarkMode ? (
                    <Sun className='w-5 h-5' />
                ) : (
                    <Moon className='w-5 h-5' />
                )}
            </button>
            <section className='w-1/2 max-lg:w-full bg-corporate max-lg:bg-surface p-8 lg:p-16 flex flex-col lg:justify-between relative overflow-hidden'>
                <div className='relative z-10 [&_path]:fill-white max-lg:[&_path]:fill-on-surface max-lg:flex max-lg:justify-center'>
                    <LogoComplete className='w-48' />
                </div>
                <div className='relative z-10 py-6 lg:py-12'>
                    <h2 className='text-3xl lg:text-4xl font-extrabold text-white max-lg:text-on-surface tracking-tight leading-tight max-md:text-2xl max-lg:text-center'>
                        Tu POS que administra tu negocio
                    </h2>
                    <span className='max-lg:text-accent lg:text-login-accent text-4xl font-bold max-md:text-2xl max-lg:text-center max-lg:block'>
                        sin límites, desde cualquier lugar.
                    </span>
                    <p className='mt-4 text-slate-400 text-ms max-w-md leading-relaxed hidden lg:block'>
                        Nuestra solución de Punto de Venta ágil te ayuda a
                        automatizar ventas, controlar inventarios y obtener
                        analíticas precisas en tiempo real.
                    </p>
                    <div className='mt-8 max-w-sm hidden lg:block'>
                        <FeatureCarousel features={features} />
                    </div>
                </div>
                <div className='items-center gap-4 max-w-sm hidden lg:flex'>
                    <div className='p-3 text-login-accent'>
                        <Rocket className='w-8 h-8' />
                    </div>
                    <div>
                        <h5 className='text-xs font-bold text-white tracking-widest uppercase'>
                            Lanzamiento Oficial
                        </h5>
                        <p className='text-xs text-slate-400'>
                            Inicia sesión y despega tu productividad hoy.
                        </p>
                    </div>
                </div>
            </section>
            <section className='w-1/2 max-lg:w-full bg-surface flex lg:items-center justify-center p-6 md:p-10 relative overflow-hidden'>
                <div className='absolute inset-0 dark:bg-black/20 hidden lg:block pointer-events-none' />
                <div className='w-full max-w-md z-10'>
                    <h1 className='text-2xl font-bold text-center text-on-surface mb-2'>Iniciar Sesión</h1>
                    <p className='text-on-body text-center mb-8'>
                        Administra tu negocio en un solo lugar
                    </p>
                    {/* <p className='text-on-body text-center mb-8'>Inicia sesión para administrar con tu negocio</p> */}
                    <form onSubmit={handleSubmit}>
                        <section className='flex flex-col gap-2 mb-4'>
                            <input
                                type='email'
                                name='email'
                                value={email}
                                onChange={handleChange('email')}
                                onBlur={handleBlur('email')}
                                placeholder='Correo Electrónico'
                                className={inputClass('email')}
                            />
                            {touched.email && errors.email && (
                                <p className='text-xs font-semibold text-red-500'>
                                    {errors.email}
                                </p>
                            )}
                        </section>
                        <section className='flex flex-col gap-2 mb-4'>
                            <section className='relative flex items-center'>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name='password'
                                    value={password}
                                    onChange={handleChange('password')}
                                    onBlur={handleBlur('password')}
                                    placeholder='Contraseña'
                                    className={`${inputClass('password')} pr-10`}
                                />
                                <button
                                    type='button'
                                    className='absolute right-3 bg-transparent border-none cursor-pointer text-lg p-1 text-accent hover:scale-110 transition-transform duration-300'
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }>
                                    {showPassword ? <Eye /> : <EyeClosed />}
                                </button>
                            </section>
                            {touched.password && errors.password && (
                                <p className='text-xs font-semibold text-red-500'>
                                    {errors.password}
                                </p>
                            )}
                        </section>
                        <button
                            type='submit'
                            disabled={loading}
                            className='py-3 px-6 font-semibold bg-accent text-surface hover:bg-accent/85 transition-all duration-300 rounded-md w-full cursor-pointer mb-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2'>
                            {loading ? (
                                <>
                                    <Loader className='w-5 h-5 animate-spin text-surface' />{' '}
                                    Iniciando...
                                </>
                            ) : (
                                <>
                                    <LogIn className='w-5 h-5' /> Iniciar Sesión
                                </>
                            )}
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
                </div>
            </section>
        </section>
    )
}
