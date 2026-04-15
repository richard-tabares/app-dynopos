import { useNavigate } from "react-router"
import { login } from '../helpers/login'
import { useState } from "react"
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
        const data = await login(user, setLogin)
        navigate('/dashboard', {replace:true})
    }
    return (
        <section className='flex justify-center place-items-center h-screen'>
            <section className='w-1/4 max-lg:w-2/4 max-md:w-3/4'>
                <form action=''>
                    <input
                        type='email'
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder='Correo Electrónico'
                        className='border border-gray-300 rounded-md py-3 px-4 w-full mb-4'
                    />
                    <input
                        type='password'
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder='Contraseña'
                        className='border border-gray-300 rounded-md py-3 px-4 w-full mb-4'
                    />
                    <button type="submit" className='py-3 px-6 font-semibold bg-primary-600 text-white rounded-md w-full cursor-pointer' onClick={onHandleSubmit}>
                        Iniciar Sesión
                    </button>
                </form>
            </section>
        </section>
    )
}
