import { useState } from 'react'
import { useNavigate } from 'react-router'
import { LogIn, Eye, EyeOff, Loader, AlertCircle } from 'lucide-react'
import { useStore } from '../../store.js'
import { adminLogin } from './helpers/login.js'
import { LogoComplete } from '../../components/LogoComplete.jsx'

export const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const setLogin = useStore((state) => state.setLogin)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const data = await adminLogin(email, password)
            setLogin(data)
            navigate('/dashboard', { replace: true })
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className='flex justify-center place-items-center min-h-screen bg-body'>
            <section className='w-1/3 max-lg:w-2/4 max-md:w-11/12'>
                <section className='bg-surface p-6 md:p-10 shadow-xs rounded-lg border border-outline'>
                    <div className='flex justify-center mb-6'>
                        <LogoComplete className='h-10' />
                    </div>
                    <h1 className='text-2xl font-bold text-center text-on-surface mb-2'>Panel de Administración</h1>
                    <p className='text-sm text-muted text-center mb-6'>Ingresa con tu cuenta de super administrador</p>

                    {error && (
                        <div className='flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4'>
                            <AlertCircle className='w-5 h-5 text-red-500 shrink-0 mt-0.5' />
                            <p className='text-sm text-red-700 dark:text-red-300'>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                        <section className='flex flex-col gap-2'>
                            <label className='block text-sm font-medium text-on-body'>Correo electrónico</label>
                            <input
                                type='email'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder='admin@ejemplo.com'
                                className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0'
                                required
                                autoFocus
                            />
                        </section>

                        <section className='flex flex-col gap-2'>
                            <label className='block text-sm font-medium text-on-body'>Contraseña</label>
                            <section className='relative flex items-center'>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder='••••••••'
                                    className='w-full px-4 py-3 pr-10 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0'
                                    required
                                />
                                <button
                                    type='button'
                                    onClick={() => setShowPassword(!showPassword)}
                                    className='absolute right-3 bg-transparent border-none cursor-pointer text-accent'
                                >
                                    {showPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                                </button>
                            </section>
                        </section>

                        <button
                            type='submit'
                            disabled={loading}
                            className='w-full py-3 px-6 font-semibold bg-accent text-surface hover:bg-accent/85 rounded-md cursor-pointer mb-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                        >
                            {loading ? <Loader className='w-5 h-5 animate-spin' /> : <LogIn className='w-5 h-5' />}
                            {loading ? 'Ingresando...' : 'Ingresar'}
                        </button>
                    </form>
                </section>
            </section>
        </section>
    )
}
