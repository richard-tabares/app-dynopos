import { NavLink, useNavigate } from "react-router"
import { Send } from 'lucide-react'
import { forgotPassword } from '../helpers/forgotPassword'
import { useState } from "react"
import { toast } from 'react-toastify'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const ForgotPassword = () => {
    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [errors, setErrors] = useState({})
    const [touched, setTouched] = useState({})

    const validateForm = () => {
        const newErrors = {}
        if (!email.trim()) {
            newErrors.email = 'El correo electrónico es requerido'
        } else if (!emailRegex.test(email)) {
            newErrors.email = 'Por favor, ingresa un email válido'
        }
        return newErrors
    }

    const handleChange = (e) => {
        setEmail(e.target.value)
        if (errors.email) {
            setErrors((prev) => ({ ...prev, email: '' }))
        }
    }

    const handleBlur = () => {
        setTouched((prev) => ({ ...prev, email: true }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const newErrors = validateForm()

        if (Object.keys(newErrors).length === 0) {
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
        } else {
            setErrors(newErrors)
            setTouched({ email: true })
        }
    }

    return (
        <section className='flex justify-center place-items-center h-screen bg-surface'>
            <section className='w-1/3 max-lg:w-2/4 max-md:w-11/12 p-6 md:p-10'>
                <h1 className='text-2xl font-bold text-center text-on-surface mb-2'>Recuperar Contraseña</h1>
                <p className='text-on-body text-center mb-8'>
                    Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
                </p>
                <form onSubmit={handleSubmit}>
                    <section className='flex flex-col gap-2 mb-4'>
                        <input
                            type='email'
                            name="email"
                            value={email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder='Correo Electrónico'
                            className={`border rounded-md py-3 px-4 w-full transition-all duration-300 focus:outline-none ${
                                touched.email && errors.email
                                    ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-0 focus:ring-red-200'
                                    : 'border-divider focus:border-accent focus:ring-0 focus:ring-accent'
                            }`}
                        />
                        {touched.email && errors.email && (
                            <p className='text-xs font-semibold text-red-500'>{errors.email}</p>
                        )}
                    </section>
                    <button type="submit" className='py-3 px-6 font-semibold bg-accent text-surface rounded-md w-full cursor-pointer mb-2 flex items-center justify-center gap-2'>
                        <Send className='w-5 h-5' /> Enviar enlace
                    </button>
                    <p className='text-center text-on-body'>
                        <NavLink
                            to='/login'
                            className='text-accent text-decoration-none font-semibold transition-all duration-300 hover:underline'>
                            Volver a Iniciar Sesión
                        </NavLink>
                    </p>
                </form>
            </section>
        </section>
    )
}
