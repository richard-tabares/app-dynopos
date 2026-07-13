import { useState, useRef } from 'react'
import { Eye, EyeClosed, ArrowRight, Loader } from 'lucide-react'
import { initiateSignup } from '../helpers/initiateSignup'
import { checkEmail } from '../helpers/checkEmail'
import { NavLink, useNavigate } from 'react-router'
import { sileo } from 'sileo'
import { encryptData } from '../../../shared/helpers/crypto'
import { RequiredIndicator } from '../../../shared/components/RequiredIndicator'

export const SignUp = () => {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        business_name: '',
        owner_name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
    })

    const [errors, setErrors] = useState({})
    const [touched, setTouched] = useState({})
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [emailExists, setEmailExists] = useState(null)
    const [checkingEmail, setCheckingEmail] = useState(false)
    const debounceRef = useRef(null)

    const validatePassword = (password) => {
        const hasLetters = /[a-zA-Z]/.test(password)
        const hasNumbers = /[0-9]/.test(password)
        const isLongEnough = password.length >= 8
        return hasLetters && hasNumbers && isLongEnough
    }

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    const validatePhone = (phone) => {
        const phoneRegex = /^\d{10,}$/
        return phoneRegex.test(phone.replace(/[^\d]/g, ''))
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.business_name.trim()) {
            newErrors.business_name = 'El nombre de la empresa es obligatorio'
        }

        if (!formData.owner_name.trim()) {
            newErrors.owner_name = 'El nombre del propietario es obligatorio'
        }

        if (!formData.email.trim()) {
            newErrors.email = 'El email es obligatorio'
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Por favor, ingresa un email válido'
        }

        if (!formData.password) {
            newErrors.password = 'La contraseña es obligatoria'
        } else if (!validatePassword(formData.password)) {
            newErrors.password =
                'La contraseña debe tener al menos 8 caracteres con letras y números'
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Debes confirmar la contraseña'
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden'
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'El teléfono es obligatorio'
        } else if (!validatePhone(formData.phone)) {
            newErrors.phone =
                'Por favor, ingresa un teléfono válido (mínimo 10 dígitos)'
        }

        return newErrors
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }))
        }
        if (name === 'email') {
            setEmailExists(null)
            if (debounceRef.current) clearTimeout(debounceRef.current)
            if (value && validateEmail(value)) {
                setCheckingEmail(true)
                debounceRef.current = setTimeout(async () => {
                    try {
                        const result = await checkEmail(value)
                        setEmailExists(result.exists)
                    } catch {
                        setEmailExists(null)
                    } finally {
                        setCheckingEmail(false)
                    }
                }, 500)
            } else {
                setCheckingEmail(false)
            }
        }
    }

    const handleBlur = (e) => {
        const { name } = e.target
        setTouched((prev) => ({
            ...prev,
            [name]: true,
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const newErrors = validateForm()

        if (Object.keys(newErrors).length === 0) {
            setLoading(true)
            try {
                const result = await initiateSignup(formData)

                const signupData = {
                    pending_signup_id: result.id,
                    encrypted_password: result.encrypted_password,
                    business_name: formData.business_name,
                    owner_name: formData.owner_name,
                    email: formData.email,
                    phone: formData.phone,
                    acceptance_token: result.acceptance_token,
                    personal_data_auth: result.personal_data_auth,
                    plan: result.plan,
                }
                localStorage.setItem('dynopos_signup', encryptData(JSON.stringify(signupData)))

                navigate('/signup/payment', {
                    state: { pending_signup_id: result.id },
                    replace: true,
                })
            } catch (error) {
                sileo.error({ fill: 'var(--toast-error)', title: 'Error', description: error.message || 'Error al iniciar el registro'})
            } finally {
                setLoading(false)
            }
        } else {
            setErrors(newErrors)
            setTouched({
                business_name: true,
                owner_name: true,
                email: true,
                password: true,
                confirmPassword: true,
                phone: true,
            })
        }
    }

    const isFormValid = formData.business_name.trim()
        && formData.owner_name.trim()
        && formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
        && formData.password && /[a-zA-Z]/.test(formData.password) && /[0-9]/.test(formData.password) && formData.password.length >= 8
        && formData.confirmPassword && formData.password === formData.confirmPassword
        && formData.phone && /^\d{10,}$/.test(formData.phone.replace(/[^\d]/g, ''))
        && emailExists === false

    return (
        <section className='w-full flex flex-col items-center justify-center bg-surface px-4 py-8'>
            <section className='w-2/4 max-lg:w-2/3 max-md:w-full p-6 md:p-10'>
                {/* Step Indicator */}
                <section className='flex items-center justify-center gap-3 mb-8'>
                    <section className='flex items-center gap-2'>
                        <span className='w-8 h-8 rounded-full bg-accent text-surface flex items-center justify-center text-sm font-bold'>
                            1
                        </span>
                        <span className='text-sm font-semibold text-accent'>
                            Datos
                        </span>
                    </section>
                    <section className='w-12 h-0.5 bg-divider' />
                    <section className='flex items-center gap-2'>
                        <span className='w-8 h-8 rounded-full bg-disabled text-muted flex items-center justify-center text-sm font-bold'>
                            2
                        </span>
                        <span className='text-sm text-muted'>
                            Plan
                        </span>
                    </section>
                    <section className='w-12 h-0.5 bg-divider' />
                    <section className='flex items-center gap-2'>
                        <span className='w-8 h-8 rounded-full bg-disabled text-muted flex items-center justify-center text-sm font-bold'>
                            3
                        </span>
                        <span className='text-sm text-muted'>
                            Pago
                        </span>
                    </section>
                </section>

                <h1 className='text-2xl font-bold text-center text-on-surface mb-2'>
                    Crear Cuenta
                </h1>
                <p className='text-on-body text-center mb-8'>
                    Paso 1: Datos de la empresa y del propietario
                </p>

                <form
                    onSubmit={handleSubmit}
                    className='space-y-5'>
                    <section className='flex flex-col gap-2'>
                        <label
                            htmlFor='businessName'
                            className='font-semibold text-on-surface'>
                            Empresa{' '}
                            <RequiredIndicator />
                        </label>
                        <input
                            type='text'
                            id='businessName'
                            name='business_name'
                            value={formData.business_name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder='Nombre de tu empresa'
                            className={`px-4 py-3 border rounded-md transition-all duration-300 focus:outline-none ${
                                touched.business_name && errors.business_name
                                    ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-0 focus:ring-red-200'
                                    : 'border-divider focus:border-accent focus:ring-0 focus:ring-accent'
                            }`}
                        />
                        {touched.business_name && errors.business_name && (
                            <p className='text-xs font-semibold text-red-500'>
                                {errors.business_name}
                            </p>
                        )}
                    </section>

                    <section className='flex flex-col gap-2'>
                        <label
                            htmlFor='ownerName'
                            className='font-semibold text-on-surface'>
                            Nombres y Apellidos{' '}
                            <RequiredIndicator />
                        </label>
                        <input
                            type='text'
                            id='ownerName'
                            name='owner_name'
                            value={formData.owner_name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder='Tu nombre completo'
                            className={`px-4 py-3 border rounded-md transition-all duration-300 focus:outline-none ${
                                touched.owner_name && errors.owner_name
                                    ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-0 focus:ring-red-200'
                                    : 'border-divider focus:border-accent focus:ring-0 focus:ring-accent'
                            }`}
                        />
                        {touched.owner_name && errors.owner_name && (
                            <p className='text-xs font-semibold text-red-500'>
                                {errors.owner_name}
                            </p>
                        )}
                    </section>

                    <section className='flex flex-col gap-2'>
                        <label
                            htmlFor='email'
                            className='font-semibold text-on-surface'>
                            Email{' '}
                            <RequiredIndicator />
                        </label>
                        <input
                            type='email'
                            id='email'
                            name='email'
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder='tu@email.com'
                            className={`px-4 py-3 border rounded-md transition-all duration-300 focus:outline-none ${
                                touched.email && errors.email
                                    ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-0 focus:ring-red-200'
                                    : 'border-divider focus:border-accent focus:ring-0 focus:ring-accent'
                            }`}
                        />
                        {touched.email && errors.email && (
                            <p className='text-xs font-semibold text-red-500'>
                                {errors.email}
                            </p>
                        )}
                        {checkingEmail && (
                            <p className='text-xs font-semibold text-accent'>
                                Verificando email...
                            </p>
                        )}
                        {emailExists === true && !checkingEmail && (
                            <p className='text-xs font-semibold text-red-500'>
                                Este email ya está registrado
                            </p>
                        )}
                        {emailExists === false && !checkingEmail && formData.email && !errors.email && (
                            <p className='text-xs font-semibold text-green-600'>
                                Email disponible
                            </p>
                        )}
                    </section>

                    <section className='flex flex-col gap-2'>
                        <label
                            htmlFor='password'
                            className='font-semibold text-on-surface'>
                            Contraseña{' '}
                            <RequiredIndicator />
                        </label>
                        <section className='relative flex items-center'>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id='password'
                                name='password'
                                value={formData.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder='Mínimo 8 caracteres (letras y números)'
                                className={`w-full px-4 py-3 pr-10 border rounded-md transition-all duration-300 focus:outline-none ${
                                    touched.password && errors.password
                                        ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-0 focus:ring-red-200'
                                        : 'border-divider focus:border-accent focus:ring-0 focus:ring-accent'
                                }`}
                            />
                            <button
                                type='button'
                                className='absolute right-3 bg-transparent border-none cursor-pointer text-lg p-1 text-accent hover:scale-110 transition-transform duration-300'
                                onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <Eye /> : <EyeClosed />}
                            </button>
                        </section>
                        {touched.password && errors.password && (
                            <p className='text-xs font-semibold text-red-500'>
                                {errors.password}
                            </p>
                        )}
                        {formData.password && !errors.password && (
                            <section className='bg-accent/10 border-l-4 border-accent p-3 rounded flex flex-col gap-1.5'>
                                <p className='text-xs font-semibold text-on-surface'>
                                    Requisitos cumplidos:
                                </p>
                                <section
                                    className={`text-xs transition-colors duration-300 ${/[a-zA-Z]/.test(formData.password) ? 'text-green-600 font-semibold' : 'text-muted'}`}>
                                    ✓ Contiene letras
                                </section>
                                <section
                                    className={`text-xs transition-colors duration-300 ${/[0-9]/.test(formData.password) ? 'text-green-600 font-semibold' : 'text-muted'}`}>
                                    ✓ Contiene números
                                </section>
                                <section
                                    className={`text-xs transition-colors duration-300 ${formData.password.length >= 8 ? 'text-green-600 font-semibold' : 'text-muted'}`}>
                                    ✓ Mínimo 8 caracteres
                                </section>
                            </section>
                        )}
                    </section>

                    <section className='flex flex-col gap-2'>
                        <label
                            htmlFor='confirmPassword'
                            className='font-semibold text-on-surface'>
                            Confirmar Contraseña{' '}
                            <RequiredIndicator />
                        </label>
                        <section className='relative flex items-center'>
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                id='confirmPassword'
                                name='confirmPassword'
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder='Confirma tu contraseña'
                                className={`w-full px-4 py-3 pr-10 border rounded-md transition-all duration-300 focus:outline-none ${
                                    touched.confirmPassword &&
                                    errors.confirmPassword
                                        ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-0 focus:ring-red-200'
                                        : 'border-divider focus:border-accent focus:ring-0 focus:ring-accent'
                                }`}
                            />
                            <button
                                type='button'
                                className='absolute right-3 bg-transparent border-none cursor-pointer text-lg p-1 text-accent hover:scale-125 transition-transform duration-300'
                                onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                }>
                                {showConfirmPassword ? <Eye /> : <EyeClosed />}
                            </button>
                        </section>
                        {touched.confirmPassword && errors.confirmPassword && (
                            <p className='text-xs font-semibold text-red-500'>
                                {errors.confirmPassword}
                            </p>
                        )}
                        {formData.confirmPassword &&
                            formData.password === formData.confirmPassword &&
                            !errors.confirmPassword && (
                                <p className='text-xs font-semibold text-green-600'>
                                    ✓ Las contraseñas coinciden
                                </p>
                            )}
                    </section>

                    <section className='flex flex-col gap-2'>
                        <label
                            htmlFor='phone'
                            className='font-semibold text-on-surface'>
                            Teléfono{' '}
                            <RequiredIndicator />
                        </label>
                        <input
                            type='tel'
                            id='phone'
                            name='phone'
                            value={formData.phone}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder='10 dígitos mínimo'
                            className={`px-4 py-3 border rounded-md transition-all duration-300 focus:outline-none ${
                                touched.phone && errors.phone
                                    ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-0 focus:ring-red-200'
                                    : 'border-divider focus:border-accent focus:ring-0 focus:ring-accent'
                            }`}
                        />
                        {touched.phone && errors.phone && (
                            <p className='text-xs font-semibold text-red-500'>
                                {errors.phone}
                            </p>
                        )}
                    </section>

                    <button
                        type='submit'
                        disabled={loading || !isFormValid}
                        className='w-full mt-4 px-6 py-3 bg-accent text-surface border-none rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 hover:bg-accent/85 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'>
                        {loading ? (
                            <><Loader className='w-5 h-5 animate-spin text-surface' /> Procesando...</>
                        ) : (
                            <>
                                Seleccionar Plan
                                <ArrowRight className='w-5 h-5' />
                            </>
                        )}
                    </button>

                    <p className='text-center text-on-body m-0'>
                        ¿Ya tienes cuenta?{' '}
                        <NavLink
                            to='/login'
                            className='text-accent text-decoration-none font-semibold transition-all duration-300 hover:text-accent hover:underline'>
                            Inicia sesión aquí
                        </NavLink>
                    </p>
                </form>
            </section>
        </section>
    )
}
