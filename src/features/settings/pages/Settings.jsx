import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { Store, Shield, Receipt, Bell, Save, Loader } from 'lucide-react'
import { toast } from 'react-toastify'
import { useStore } from '../../../app/providers/store'
import { updateBusiness } from '../helpers/updateBusiness'
import { uploadLogo } from '../helpers/uploadLogo'
import { changePassword } from '../helpers/changePassword'

export const Settings = () => {
    const { user, setBusiness, setLogOut } = useStore()
    const navigate = useNavigate()
    const businessId = user?.data?.user?.id

    const [formData, setFormData] = useState({
        business_name: '',
        owner_name: '',
        email: '',
        phone: '',
        ticket_footer: '',
        low_stock_notifications: false,
    })
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    })
    const [logoPreview, setLogoPreview] = useState('')
    const [logoFile, setLogoFile] = useState(null)
    const [saving, setSaving] = useState(false)
    const [changingPassword, setChangingPassword] = useState(false)
    const [uploadingLogo, setUploadingLogo] = useState(false)

    useEffect(() => {
        const b = user?.business
        if (b) {
            setFormData({
                business_name: b.business_name || '',
                owner_name: b.owner_name || '',
                email: b.email || '',
                phone: b.phone || '',
                ticket_footer: b.ticket_footer || '',
                low_stock_notifications: b.low_stock_notifications ?? false,
            })
            setLogoPreview(b.business_logo || '')
        }
    }, [user?.business])

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }))
    }

    const handlePasswordChange = (e) => {
        const { name, value } = e.target
        setPasswordData((prev) => ({ ...prev, [name]: value }))
    }

    const handleLogoChange = (e) => {
        const file = e.target.files?.[0]
        if (file) {
            setLogoFile(file)
            setLogoPreview(URL.createObjectURL(file))
        }
    }

    const handleSave = async () => {
        if (!businessId) {
            toast.error('No se encontró el ID del negocio')
            return
        }

        setSaving(true)
        try {
            if (logoFile) {
                setUploadingLogo(true)
                const logoResult = await uploadLogo(businessId, logoFile)
                if (logoResult.url) {
                    formData.business_logo = logoResult.url
                }
                setUploadingLogo(false)
            }

            const updated = await updateBusiness(businessId, formData)
            if (updated) {
                setBusiness(updated)
                toast.success('Configuraciones guardadas exitosamente')
            }
        } catch (error) {
            toast.error(error.message || 'Error al guardar las configuraciones')
        } finally {
            setSaving(false)
        }
    }

    const handleChangePassword = async () => {
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            toast.warn('Todos los campos de contraseña son obligatorios')
            return
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.warn('Las contraseñas nuevas no coinciden')
            return
        }
        if (passwordData.newPassword.length < 6) {
            toast.warn('La contraseña debe tener al menos 6 caracteres')
            return
        }
        if (passwordData.currentPassword === passwordData.newPassword) {
            toast.warn('La nueva contraseña debe ser diferente a la actual')
            return
        }
        if (!formData.email) {
            toast.error('No se encontró el correo del negocio')
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
                toast.success('Contraseña actualizada exitosamente. Inicia sesión de nuevo.')
                setLogOut()
                navigate('/login', { replace: true })
            }
        } catch (error) {
            toast.error(error.message || 'Error al cambiar la contraseña')
        } finally {
            setChangingPassword(false)
        }
    }

    return (
        <section className='flex flex-col gap-6'>
            <section>
                <h1 className='text-2xl font-bold'>Configuraciones</h1>
                <p className='text-gray-600'>Ajusta la configuración de tu negocio</p>
            </section>

            {/* Card 1: Información de la Tienda */}
            <section className='bg-white border border-gray-300 shadow-sm rounded-lg'>
                <div className='px-6 py-4 border-b border-gray-200 bg-gray-50/50'>
                    <h2 className='text-lg font-semibold flex items-center gap-2'>
                        <Store className='w-5 h-5 text-primary-600' />
                        Información de la Tienda
                    </h2>
                </div>
                <div className='p-6'>
                    <div className='flex items-center gap-6 mb-6'>
                        <div className='relative w-20 h-20 rounded-full overflow-hidden bg-gray-100 border border-gray-300 flex-shrink-0'>
                            {logoPreview ? (
                                <img src={logoPreview} alt='Logo' className='w-full h-full object-cover' />
                            ) : (
                                <div className='w-full h-full flex items-center justify-center text-gray-400'>
                                    <Store className='w-8 h-8' />
                                </div>
                            )}
                        </div>
                        <div>
                            <label className='cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition font-medium'>
                                <input
                                    type='file'
                                    accept='image/*'
                                    onChange={handleLogoChange}
                                    className='hidden'
                                />
                                {uploadingLogo ? 'Subiendo...' : 'Cambiar Logo'}
                            </label>
                            <p className='text-xs text-gray-500 mt-1'>PNG, JPG. Tamaño recomendado: 256x256px</p>
                        </div>
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <section>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Nombre del Negocio</label>
                            <input
                                type='text'
                                name='business_name'
                                value={formData.business_name}
                                onChange={handleChange}
                                className='w-full px-4 py-2 border border-gray-300 rounded-lg duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-0'
                            />
                        </section>
                        <section>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Dueño / Propietario</label>
                            <input
                                type='text'
                                name='owner_name'
                                value={formData.owner_name}
                                onChange={handleChange}
                                className='w-full px-4 py-2 border border-gray-300 rounded-lg duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-0'
                            />
                        </section>
                        <section>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Correo Electrónico</label>
                            <input
                                type='email'
                                name='email'
                                value={formData.email}
                                onChange={handleChange}
                                disabled
                                className='w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-0'
                            />
                        </section>
                        <section>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Teléfono</label>
                            <input
                                type='tel'
                                name='phone'
                                value={formData.phone}
                                onChange={handleChange}
                                className='w-full px-4 py-2 border border-gray-300 rounded-lg duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-0'
                            />
                        </section>
                    </div>
                </div>
            </section>

            {/* Card 2: Seguridad */}
            <section className='bg-white border border-gray-300 shadow-sm rounded-lg'>
                <div className='px-6 py-4 border-b border-gray-200 bg-gray-50/50'>
                    <h2 className='text-lg font-semibold flex items-center gap-2'>
                        <Shield className='w-5 h-5 text-primary-600' />
                        Seguridad
                    </h2>
                </div>
                <div className='p-6'>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                        <section>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Contraseña Actual</label>
                            <input
                                type='password'
                                name='currentPassword'
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                placeholder='••••••••'
                                className='w-full px-4 py-2 border border-gray-300 rounded-lg duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-0'
                            />
                        </section>
                        <section>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Nueva Contraseña</label>
                            <input
                                type='password'
                                name='newPassword'
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                placeholder='••••••••'
                                className='w-full px-4 py-2 border border-gray-300 rounded-lg duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-0'
                            />
                        </section>
                        <section>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Confirmar Contraseña</label>
                            <input
                                type='password'
                                name='confirmPassword'
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                placeholder='••••••••'
                                className='w-full px-4 py-2 border border-gray-300 rounded-lg duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-0'
                            />
                        </section>
                    </div>
                    <div className='mt-4 flex justify-end'>
                        <button
                            onClick={handleChangePassword}
                            disabled={changingPassword}
                            className='flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition disabled:opacity-50 cursor-pointer'>
                            {changingPassword ? <Loader className='w-4 h-4 animate-spin' /> : null}
                            Cambiar Contraseña
                        </button>
                    </div>
                </div>
            </section>

            {/* Card 3: Recibos */}
            <section className='bg-white border border-gray-300 shadow-sm rounded-lg'>
                <div className='px-6 py-4 border-b border-gray-200 bg-gray-50/50'>
                    <h2 className='text-lg font-semibold flex items-center gap-2'>
                        <Receipt className='w-5 h-5 text-primary-600' />
                        Recibos
                    </h2>
                </div>
                <div className='p-6'>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Mensaje de pie de página del ticket</label>
                    <textarea
                        name='ticket_footer'
                        value={formData.ticket_footer}
                        onChange={handleChange}
                        rows={3}
                        placeholder='¡Gracias por tu compra!'
                        className='w-full px-4 py-2 border border-gray-300 rounded-lg duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-0 resize-none'
                    />
                    <p className='text-xs text-gray-500 mt-1'>Este mensaje aparecerá al final de cada ticket de venta.</p>
                </div>
            </section>

            {/* Card 4: Notificaciones */}
            <section className='bg-white border border-gray-300 shadow-sm rounded-lg'>
                <div className='px-6 py-4 border-b border-gray-200 bg-gray-50/50'>
                    <h2 className='text-lg font-semibold flex items-center gap-2'>
                        <Bell className='w-5 h-5 text-primary-600' />
                        Notificaciones
                    </h2>
                </div>
                <div className='p-6'>
                    <label className='flex items-center gap-3 cursor-pointer'>
                        <input
                            type='checkbox'
                            name='low_stock_notifications'
                            checked={formData.low_stock_notifications}
                            onChange={handleChange}
                            className='w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer'
                        />
                        <span className='text-sm text-gray-700'>
                            Activar correo de notificación cuando un producto tenga stock bajo
                        </span>
                    </label>
                </div>
            </section>

            {/* Botón Guardar Cambios */}
            <div className='flex justify-end'>
                <button
                    onClick={handleSave}
                    disabled={saving || uploadingLogo}
                    className='flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white text-sm font-bold rounded-lg hover:bg-primary-700 transition disabled:opacity-50 cursor-pointer'>
                    {saving || uploadingLogo ? (
                        <Loader className='w-4 h-4 animate-spin' />
                    ) : (
                        <Save className='w-4 h-4' />
                    )}
                    Guardar Cambios
                </button>
            </div>
        </section>
    )
}
