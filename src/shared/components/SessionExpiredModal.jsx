import { LogOut } from 'lucide-react'
import { useStore } from '../../app/providers/store'

export const SessionExpiredModal = () => {
    const sessionExpired = useStore((s) => s.sessionExpired)
    const setSessionExpired = useStore((s) => s.setSessionExpired)
    const setLogOut = useStore((s) => s.setLogOut)

    const handleLogin = () => {
        setSessionExpired(false)
        setLogOut()
        window.location.href = '/login'
    }

    if (!sessionExpired) return null

    return (
        <section className='fixed inset-0 bg-overlay backdrop-blur-xs w-full h-full flex flex-col items-center justify-center z-[9999] p-4'>
            <section className='bg-surface rounded-xl border border-outline w-full max-w-md relative'>
                <section className='flex flex-col items-center px-6 py-6'>
                    <LogOut className='w-12 h-12 text-danger mb-4' />
                    <h2 className='text-lg font-semibold text-title mb-2'>Sesi&oacute;n expirada</h2>
                    <p className='text-body text-sm text-center'>
                        Tu sesi&oacute;n ha expirado. Inicia sesi&oacute;n nuevamente para continuar trabajando.
                    </p>
                </section>
                <section className='px-6 pb-6'>
                    <button
                        onClick={handleLogin}
                        className='w-full py-2.5 px-4 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition cursor-pointer'
                    >
                        Iniciar sesi&oacute;n
                    </button>
                </section>
            </section>
        </section>
    )
}
