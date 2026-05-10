import { CheckCircle } from 'lucide-react'
import { NavLink } from 'react-router'

export const PaymentSuccess = () => {
    return (
        <section className='w-full flex flex-col items-center justify-center bg-surface px-4 py-8'>
            <section className='w-2/4 max-lg:w-2/3 max-md:w-full p-6 md:p-10 text-center'>
                <CheckCircle className='w-20 h-20 text-green-500 mx-auto mb-6' />

                <h1 className='text-2xl font-bold text-on-surface mb-2'>
                    ¡Pago exitoso!
                </h1>
                <p className='text-on-body mb-6'>
                    Tu cuenta ha sido creada exitosamente. Hemos enviado un correo con
                    tus credenciales de acceso.
                </p>

                <section className='bg-green-50 border border-green-200 rounded-lg p-4 mb-8'>
                    <p className='text-sm text-green-800'>
                        Revisa tu bandeja de entrada y sigue las instrucciones para
                        confirmar tu correo electrónico y comenzar a usar DynoPOS.
                    </p>
                </section>

                <NavLink
                    to='/login'
                    className='inline-block px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold transition-all duration-300 hover:bg-primary-500'>
                    Iniciar sesión
                </NavLink>
            </section>
        </section>
    )
}
