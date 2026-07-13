import { useState } from 'react'
import { Lock, Eye, EyeClosed, Loader } from 'lucide-react'
import { sileo } from 'sileo'
import { useNavigate } from 'react-router'
import { useStore } from '../../../../app/providers/store'
import { changePassword } from '../../account/helpers/changePassword'
import { RequiredIndicator } from '../../../../shared/components/RequiredIndicator'

export const Security = () => {
    const { user, setLogOut } = useStore()
    const navigate = useNavigate()
    const formData = { email: user?.business?.email || '' }

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    })
    const [changingPassword, setChangingPassword] = useState(false)
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false })

    const isPasswordFormEmpty = !passwordData.currentPassword && !passwordData.newPassword && !passwordData.confirmPassword

    const togglePasswordVisibility = (field) => {
        setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }))
    }

    const handlePasswordChange = (e) => {
        const { name, value } = e.target
        setPasswordData((prev) => ({ ...prev, [name]: value }))
    }

    const handleChangePassword = async () => {
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            sileo.warning({ fill: 'var(--toast-warning)', title: 'Atención', description: 'Todos los campos de contraseña son obligatorios' })
            return
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            sileo.warning({ fill: 'var(--toast-warning)', title: 'Atención', description: 'Las contraseñas nuevas no coinciden' })
            return
        }
        if (passwordData.newPassword.length < 6) {
            sileo.warning({ fill: 'var(--toast-warning)', title: 'Atención', description: 'La contraseña debe tener al menos 6 caracteres' })
            return
        }
        if (passwordData.currentPassword === passwordData.newPassword) {
            sileo.warning({ fill: 'var(--toast-warning)', title: 'Atención', description: 'La nueva contraseña debe ser diferente a la actual' })
            return
        }
        if (!formData.email) {
            sileo.error({ fill: 'var(--toast-error)', title: 'Error', description: 'No se encontró el correo del negocio' })
            return
        }

        setChangingPassword(true)
        try {
            const result = await changePassword({
                email: user?.data?.user?.email || formData.email,
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            })
            if (result.status === 200) {
                sileo.success({ fill: 'var(--toast-success)', title: 'Completado', description: 'Contraseña actualizada exitosamente. Inicia sesión de nuevo.' })
                setLogOut()
                navigate('/login', { replace: true })
            }
        } catch (error) {
            sileo.error({ fill: 'var(--toast-error)', title: 'Error', description: error.message || 'Error al cambiar la contraseña' })
        } finally {
            setChangingPassword(false)
        }
    }

    return (
<section className='bg-settings-card border border-outline shadow-sm rounded-lg'>
        <div className='p-6'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <section>
                        <label className='block text-sm font-medium text-on-body mb-1'>Contraseña Actual{' '}<RequiredIndicator /></label>
                        <div className='relative flex items-center'>
                            <input
                                type={showPasswords.current ? 'text' : 'password'}
                                name='currentPassword'
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                placeholder='••••••••'
                                className='w-full px-4 py-3 pr-10 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0'
                            />
                            <button
                                type='button'
                                className='absolute right-3 bg-transparent border-none cursor-pointer text-lg p-1 text-accent hover:scale-110 transition-transform duration-300'
                                onClick={() => togglePasswordVisibility('current')}>
                                {showPasswords.current ? <EyeClosed /> : <Eye />}
                            </button>
                        </div>
                    </section>
                    <section>
                        <label className='block text-sm font-medium text-on-body mb-1'>Nueva Contraseña{' '}<RequiredIndicator /></label>
                        <div className='relative flex items-center'>
                            <input
                                type={showPasswords.new ? 'text' : 'password'}
                                name='newPassword'
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                placeholder='••••••••'
                                className='w-full px-4 py-3 pr-10 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0'
                            />
                            <button
                                type='button'
                                className='absolute right-3 bg-transparent border-none cursor-pointer text-lg p-1 text-accent hover:scale-110 transition-transform duration-300'
                                onClick={() => togglePasswordVisibility('new')}>
                                {showPasswords.new ? <EyeClosed /> : <Eye />}
                            </button>
                        </div>
                    </section>
                    <section>
                        <label className='block text-sm font-medium text-on-body mb-1'>Confirmar Contraseña{' '}<RequiredIndicator /></label>
                        <div className='relative flex items-center'>
                            <input
                                type={showPasswords.confirm ? 'text' : 'password'}
                                name='confirmPassword'
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                placeholder='••••••••'
                                className='w-full px-4 py-3 pr-10 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0'
                            />
                            <button
                                type='button'
                                className='absolute right-3 bg-transparent border-none cursor-pointer text-lg p-1 text-accent hover:scale-110 transition-transform duration-300'
                                onClick={() => togglePasswordVisibility('confirm')}>
                                {showPasswords.confirm ? <EyeClosed /> : <Eye />}
                            </button>
                        </div>
                    </section>
                </div>
                <div className='mt-4 flex justify-end'>
                    <button
                        onClick={handleChangePassword}
                        disabled={changingPassword || isPasswordFormEmpty}
                        className='flex items-center gap-2 px-4 py-2 bg-accent text-surface text-sm font-medium rounded-lg hover:bg-accent/85 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'>
                        {changingPassword ? <Loader className='w-5 h-5 animate-spin text-surface' /> : <Lock className='w-4 h-4' />}
                        Cambiar Contraseña
                    </button>
                </div>
            </div>
        </section>
    )
}
