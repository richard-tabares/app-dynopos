import { useState } from 'react'
import { Eye, EyeClosed } from 'lucide-react'
import { signup as SignUpHelper } from '../helpers/signup'
import { NavLink, useNavigate } from 'react-router'
import { toast } from 'react-toastify'

export const SignUp = () => {

    const navigate = useNavigate()
    // Estado para el formulario
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

    // Validar que la contraseña cumpla con los requisitos
    const validatePassword = (password) => {
        const hasLetters = /[a-zA-Z]/.test(password)
        const hasNumbers = /[0-9]/.test(password)
        const isLongEnough = password.length >= 8
        return hasLetters && hasNumbers && isLongEnough
    }

    // Validar email
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    // Validar teléfono
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
        // Limpiar error del campo cuando el usuario empieza a escribir
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }))
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
            // enviamos datos al backend
            try {
                await SignUpHelper(formData)
                toast.success('Cuenta creada exitosamente. Por favor, inicia sesión.')
                navigate('/login', {replace:true})
            } catch (error) {
                toast.error('Error al crear la cuenta')
            }
        } else {
            setErrors(newErrors)
            // Marcar todos los campos como tocados para mostrar errores
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

    return (
        <section className='w-full flex flex-col items-center justify-center bg-gray-100 px-4 py-8'>
            <section className='w-2/4 max-lg:w-2/3 max-md:w-full bg-white border border-gray-300 p-10'>
                <h1 className='text-2xl font-bold text-center text-gray-800 mb-2'>
                    Crear Cuenta
                </h1>
                <p className=' text-gray-600 text-center mb-8'>
                    Completa los datos para registrarse
                </p>

                <form
                    onSubmit={handleSubmit}
                    className='space-y-5'>
                    {/* Campo Empresa */}
                    <section className='flex flex-col gap-2'>
                        <label
                            htmlFor='businessName'
                            className=' font-semibold text-gray-900'>
                            Empresa{' '}
                            <span className='text-red-500 font-bold'>*</span>
                        </label>
                        <input
                            type='text'
                            id='businessName'
                            name='business_name'
                            value={formData.business_name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder='Nombre de tu empresa'
                            className={`px-4 py-3 border rounded-lg transition-all duration-300 focus:outline-none ${
                                touched.business_name && errors.business_name
                                    ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                                    : 'border-gray-200 focus:border-primary-300 focus:ring-2 focus:ring-primary-300'
                            }`}
                        />
                        {touched.business_name && errors.business_name && (
                            <p className='text-xs font-semibold text-red-500'>
                                {errors.business_name}
                            </p>
                        )}
                    </section>

                    {/* Campo Nombres y Apellidos */}
                    <section className='flex flex-col gap-2'>
                        <label
                            htmlFor='ownerName'
                            className=' font-semibold text-gray-900'>
                            Nombres y Apellidos{' '}
                            <span className='text-red-500 font-bold'>*</span>
                        </label>
                        <input
                            type='text'
                            id='ownerName'
                            name='owner_name'
                            value={formData.owner_name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder='Tu nombre completo'
                            className={`px-4 py-3 border rounded-lg  transition-all duration-300 focus:outline-none ${
                                touched.owner_name && errors.owner_name
                                    ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                                    : 'border-gray-200 focus:border-primary-300 focus:ring-2 focus:ring-primary-300'
                            }`}
                        />
                        {touched.owner_name && errors.owner_name && (
                            <p className='text-xs font-semibold text-red-500'>
                                {errors.owner_name}
                            </p>
                        )}
                    </section>

                    {/* Campo Email */}
                    <section className='flex flex-col gap-2'>
                        <label
                            htmlFor='email'
                            className=' font-semibold text-gray-900'>
                            Email{' '}
                            <span className='text-red-500 font-bold'>*</span>
                        </label>
                        <input
                            type='email'
                            id='email'
                            name='email'
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder='tu@email.com'
                            className={`px-4 py-3 border rounded-lg  transition-all duration-300 focus:outline-none ${
                                touched.email && errors.email
                                    ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                                    : 'border-gray-200 focus:border-primary-300 focus:ring-2 focus:ring-primary-300'
                            }`}
                        />
                        {touched.email && errors.email && (
                            <p className='text-xs font-semibold text-red-500'>
                                {errors.email}
                            </p>
                        )}
                    </section>

                    {/* Campo Contraseña */}
                    <section className='flex flex-col gap-2'>
                        <label
                            htmlFor='password'
                            className=' font-semibold text-gray-900'>
                            Contraseña{' '}
                            <span className='text-red-500 font-bold'>*</span>
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
                                className={`w-full px-4 py-3 pr-10 border rounded-lg  transition-all duration-300 focus:outline-none ${
                                    touched.password && errors.password
                                        ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                                        : 'border-gray-200 focus:border-primary-300 focus:ring-2 focus:ring-primary-300'
                                }`}
                            />
                            <button
                                type='button'
                                className='absolute right-3 bg-transparent border-none cursor-pointer text-lg p-1 text-primary-300 hover:scale-125 transition-transform duration-200'
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
                            <section className='bg-gray-100 border-l-4 border-primary-600 p-3 rounded flex flex-col gap-1.5'>
                                <p className='text-xs font-semibold text-gray-900'>
                                    Requisitos cumplidos:
                                </p>
                                <section
                                    className={`text-xs transition-colors duration-300 ${/[a-zA-Z]/.test(formData.password) ? 'text-green-600 font-semibold' : 'text-gray-500'}`}>
                                    ✓ Contiene letras
                                </section>
                                <section
                                    className={`text-xs transition-colors duration-300 ${/[0-9]/.test(formData.password) ? 'text-green-600 font-semibold' : 'text-gray-500'}`}>
                                    ✓ Contiene números
                                </section>
                                <section
                                    className={`text-xs transition-colors duration-300 ${formData.password.length >= 8 ? 'text-green-600 font-semibold' : 'text-gray-500'}`}>
                                    ✓ Mínimo 8 caracteres
                                </section>
                            </section>
                        )}
                    </section>

                    {/* Campo Confirmar Contraseña */}
                    <section className='flex flex-col gap-2'>
                        <label
                            htmlFor='confirmPassword'
                            className=' font-semibold text-gray-900'>
                            Confirmar Contraseña{' '}
                            <span className='text-red-500 font-bold'>*</span>
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
                                className={`w-full px-4 py-3 pr-10 border rounded-lg  transition-all duration-300 focus:outline-none ${
                                    touched.confirmPassword &&
                                    errors.confirmPassword
                                        ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                                        : 'border-gray-200 focus:border-primary-300 focus:ring-2 focus:ring-primary-300'
                                }`}
                            />
                            <button
                                type='button'
                                className='absolute right-3 bg-transparent border-none cursor-pointer text-lg p-1 text-primary-300 hover:scale-125 transition-transform duration-200'
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

                    {/* Campo Teléfono */}
                    <section className='flex flex-col gap-2'>
                        <label
                            htmlFor='phone'
                            className=' font-semibold text-gray-900'>
                            Teléfono{' '}
                            <span className='text-red-500 font-bold'>*</span>
                        </label>
                        <input
                            type='tel'
                            id='phone'
                            name='phone'
                            value={formData.phone}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder='10 dígitos mínimo'
                            className={`px-4 py-3 border rounded-lg  transition-all duration-300 focus:outline-none ${
                                touched.phone && errors.phone
                                    ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                                    : 'border-gray-200 focus:border-primary-300 focus:ring-2 focus:ring-primary-300'
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
                        className='w-full mt-4 px-6 py-3 bg-primary-600 text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 hover:bg-primary-500'>
                        Crear Cuenta
                    </button>

                    <p className='text-center text-gray-600 m-0'>
                        ¿Ya tienes cuenta?{' '}
                        <NavLink
                            to='/login'
                            className='text-primary-600 text-decoration-none font-semibold transition-all duration-300 hover:text-purple-600 hover:underline'>
                            Inicia sesión aquí
                        </NavLink>
                    </p>
                </form>
            </section>
        </section>
    )
}
