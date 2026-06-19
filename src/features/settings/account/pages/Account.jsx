import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router'
import { Store, Shield, Receipt, Bell, Save, Loader, Palette, Lock, Eye, EyeClosed, Printer, CheckCircle, XCircle, RotateCw, Trash2, AlertTriangle } from 'lucide-react'
import { sileo } from 'sileo'
import { Modal } from '../../../../shared/components/Modal'
import { useStore } from '../../../../app/providers/store'
import { updateBusiness } from '../helpers/updateBusiness'
import { uploadLogo } from '../helpers/uploadLogo'
import { deleteLogo } from '../helpers/deleteLogo'
import { changePassword } from '../helpers/changePassword'
import { checkAgent, getPrinters, printTicket, setStoredPrinter, getStoredPrinter } from '../../../../shared/helpers/printEngine'
import { isAndroid, getRawBTPlayStoreUrl } from '../../../../shared/helpers/rawbtPrint'
import { updateProfile } from '../helpers/updateProfile'

export const Account = () => {
    const { user, setBusiness, setLogOut, isDarkMode, toggleDarkMode, setProfile } = useStore()
    const navigate = useNavigate()
    const businessId = user?.profile?.business_id || user?.data?.user?.id

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
    const [deletingLogo, setDeletingLogo] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false })
    const isPasswordFormEmpty = !passwordData.currentPassword && !passwordData.newPassword && !passwordData.confirmPassword

    const [agentStatus, setAgentStatus] = useState(null)
    const [availablePrinters, setAvailablePrinters] = useState([])
    const [selectedPrinter, setSelectedPrinter] = useState(getStoredPrinter() || '')
    const [checkingAgent, setCheckingAgent] = useState(false)
    const [testingPrint, setTestingPrint] = useState(false)
    const [thermalPrintingEnabled, setThermalPrintingEnabled] = useState(
        user?.profile?.thermal_printing_enabled ?? true
    )
    const [printerWidth, setPrinterWidth] = useState(
        user?.profile?.printer_width ?? 32
    )

    const handleTogglePrinting = async () => {
        const newValue = !thermalPrintingEnabled
        const profileId = user?.profile?.id || user?.data?.user?.id
        if (!profileId) return
        try {
            await updateProfile(profileId, { thermal_printing_enabled: newValue })
            setProfile({ thermal_printing_enabled: newValue })
            setThermalPrintingEnabled(newValue)
        } catch (err) {
            sileo.error({ fill: 'var(--toast-error)', title: 'Error', description: err.message || 'Error al actualizar la configuración' })
        }
    }

    const handlePrinterWidthChange = async (e) => {
        const newValue = parseInt(e.target.value)
        const profileId = user?.profile?.id || user?.data?.user?.id
        if (!profileId) return
        try {
            await updateProfile(profileId, { printer_width: newValue })
            setProfile({ printer_width: newValue })
            setPrinterWidth(newValue)
            sileo.success({
                fill: 'var(--toast-success)',
                title: 'Completado',
                description: 'Ancho de impresión actualizado',
            })
        } catch (err) {
            sileo.error({
                fill: 'var(--toast-error)',
                title: 'Error',
                description: err.message || 'Error al actualizar el ancho de impresión',
            })
        }
    }

    const refreshAgentStatus = useCallback(async () => {
        setCheckingAgent(true)
        try {
            const health = await checkAgent()
            if (health) {
                setAgentStatus('connected')
                const result = await getPrinters()
                setAvailablePrinters(result.printers || [])
            } else {
                setAgentStatus('disconnected')
                setAvailablePrinters([])
            }
        } catch {
            setAgentStatus('disconnected')
            setAvailablePrinters([])
        } finally {
            setCheckingAgent(false)
        }
    }, [])

    useEffect(() => {
        refreshAgentStatus()
    }, [refreshAgentStatus])

    const handlePrinterChange = (e) => {
        const name = e.target.value
        setSelectedPrinter(name)
        if (name) {
            setStoredPrinter(name)
        } else {
            setStoredPrinter(null)
        }
    }

    const handleTestPrint = async () => {
        if (!selectedPrinter) {
            sileo.warning({ fill: 'var(--toast-warning)', title: 'Atención', description: 'Selecciona una impresora primero' })
            return
        }
        setTestingPrint(true)
        try {
            await printTicket(selectedPrinter, {
                businessName: user?.business?.business_name || 'DynoPOS',
                ticketNumber: 'TEST',
                date: new Date().toLocaleDateString('es-CO'),
                paymentMethod: '---',
                items: [{ name: 'Prueba de impresión', quantity: 1, price: 0, subtotal: 0 }],
                total: 0,
                footer: 'Impresión de prueba exitosa',
            })
            sileo.success({ fill: 'var(--toast-success)', title: 'Completado', description: 'Impresión de prueba exitosa' })
        } catch (err) {
            sileo.error({ fill: 'var(--toast-error)', title: 'Error', description: err.message || 'Error en la impresión de prueba' })
        } finally {
            setTestingPrint(false)
        }
    }

    const togglePasswordVisibility = (field) => {
        setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }))
    }

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

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDarkMode)
    }, [isDarkMode])

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

    const handleDeleteLogo = () => {
        setShowDeleteConfirm(true)
    }

    const handleConfirmDelete = async () => {
        if (!businessId) {
            sileo.error({ fill: 'var(--toast-error)', title: 'Error', description: 'No se encontró el ID del negocio' })
            return
        }

        setDeletingLogo(true)
        try {
            const updated = await deleteLogo(businessId)
            setLogoPreview('')
            setLogoFile(null)
            setBusiness(updated)
            setShowDeleteConfirm(false)
            sileo.success({ fill: 'var(--toast-success)', title: 'Completado', description: 'Logo eliminado exitosamente' })
        } catch (error) {
            sileo.error({ fill: 'var(--toast-error)', title: 'Error', description: error.message || 'Error al eliminar el logo' })
        } finally {
            setDeletingLogo(false)
        }
    }

    const handleSave = async () => {
        if (!businessId) {
            sileo.error({ fill: 'var(--toast-error)', title: 'Error', description: 'No se encontró el ID del negocio'})
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
                sileo.success({ fill: 'var(--toast-success)', title: 'Completado', description: 'Configuraciones guardadas exitosamente'})
            }
        } catch (error) {
            sileo.error({ fill: 'var(--toast-error)', title: 'Error', description: error.message || 'Error al guardar las configuraciones'})
        } finally {
            setSaving(false)
        }
    }

    const handleChangePassword = async () => {
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            sileo.warning({ fill: 'var(--toast-warning)', title: 'Atención', description: 'Todos los campos de contraseña son obligatorios'})
            return
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            sileo.warning({ fill: 'var(--toast-warning)', title: 'Atención', description: 'Las contraseñas nuevas no coinciden'})
            return
        }
        if (passwordData.newPassword.length < 6) {
            sileo.warning({ fill: 'var(--toast-warning)', title: 'Atención', description: 'La contraseña debe tener al menos 6 caracteres'})
            return
        }
        if (passwordData.currentPassword === passwordData.newPassword) {
            sileo.warning({ fill: 'var(--toast-warning)', title: 'Atención', description: 'La nueva contraseña debe ser diferente a la actual'})
            return
        }
        if (!formData.email) {
            sileo.error({ fill: 'var(--toast-error)', title: 'Error', description: 'No se encontró el correo del negocio'})
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
                sileo.success({ fill: 'var(--toast-success)', title: 'Completado', description: 'Contraseña actualizada exitosamente. Inicia sesión de nuevo.'})
                setLogOut()
                navigate('/login', { replace: true })
            }
        } catch (error) {
            sileo.error({ fill: 'var(--toast-error)', title: 'Error', description: error.message || 'Error al cambiar la contraseña'})
        } finally {
            setChangingPassword(false)
        }
    }

    return (
        <section className='flex flex-col gap-6'>
            <section>
                <h1 className='text-2xl font-bold'>Configuraciones</h1>
                <p className='text-on-body'>Ajusta la configuración de tu negocio</p>
            </section>

            {/* Card 1: Información de la Tienda */}
            <section className='bg-surface border border-outline shadow-sm rounded-lg'>
                <div className='px-6 py-4 border-b border-divider bg-body/50'>
                    <h2 className='text-lg font-semibold flex items-center gap-2'>
                        <Store className='w-5 h-5 text-accent' />
                        Información de la Tienda
                    </h2>
                </div>
                <div className='p-6'>
                    <div className='flex items-center gap-6 mb-6'>
                        <div className='relative w-20 h-20 rounded-full overflow-hidden bg-subtle border border-outline flex-shrink-0'>
                            {logoPreview ? (
                                <img src={logoPreview} alt='Logo' className='w-full h-full object-cover' />
                            ) : (
                                <div className='w-full h-full flex items-center justify-center text-faint'>
                                    <Store className='w-8 h-8' />
                                </div>
                            )}
                        </div>
                        <div>
                            <div className='flex items-center gap-2'>
                                <label className='cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-outline text-on-body text-sm rounded-lg hover:bg-hover transition font-medium'>
                                    <input
                                        type='file'
                                        accept='image/*'
                                        onChange={handleLogoChange}
                                        className='hidden'
                                    />
                                    {uploadingLogo ? 'Subiendo...' : 'Cambiar Logo'}
                                </label>
                                {logoPreview && (
                                    <button
                                        onClick={handleDeleteLogo}
                                        disabled={deletingLogo}
                                        className='p-2 border border-danger/50 text-danger rounded-lg hover:bg-danger/5 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
                                        title='Eliminar Logo'>
                                        {deletingLogo ? (
                                            <Loader className='w-4 h-4 animate-spin' />
                                        ) : (
                                            <Trash2 className='w-4 h-4' />
                                        )}
                                    </button>
                                )}
                            </div>
                            <p className='text-xs text-muted mt-1'>PNG, JPG. Tamaño recomendado: 256x256px</p>
                        </div>
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <section>
                            <label className='block text-sm font-medium text-on-body mb-1'>Nombre del Negocio</label>
                            <input
                                type='text'
                                name='business_name'
                                value={formData.business_name}
                                onChange={handleChange}
                                className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0'
                            />
                        </section>
                        <section>
                            <label className='block text-sm font-medium text-on-body mb-1'>Dueño / Propietario</label>
                            <input
                                type='text'
                                name='owner_name'
                                value={formData.owner_name}
                                onChange={handleChange}
                                className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0'
                            />
                        </section>
                        <section>
                            <label className='block text-sm font-medium text-on-body mb-1'>Correo Electrónico</label>
                            <input
                                type='email'
                                name='email'
                                value={formData.email}
                                onChange={handleChange}
                                disabled
                                className='w-full px-4 py-3 border border-divider rounded-md bg-body text-muted cursor-not-allowed transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0'
                            />
                        </section>
                        <section>
                            <label className='block text-sm font-medium text-on-body mb-1'>Teléfono</label>
                            <input
                                type='tel'
                                name='phone'
                                value={formData.phone}
                                onChange={handleChange}
                                className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0'
                            />
                        </section>
                    </div>
                </div>
            </section>

            {/* Card 2: Seguridad */}
            <section className='bg-surface border border-outline shadow-sm rounded-lg'>
                <div className='px-6 py-4 border-b border-divider bg-body/50'>
                    <h2 className='text-lg font-semibold flex items-center gap-2'>
                        <Shield className='w-5 h-5 text-accent' />
                        Seguridad
                    </h2>
                </div>
                <div className='p-6'>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                        <section>
                            <label className='block text-sm font-medium text-on-body mb-1'>Contraseña Actual</label>
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
                            <label className='block text-sm font-medium text-on-body mb-1'>Nueva Contraseña</label>
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
                            <label className='block text-sm font-medium text-on-body mb-1'>Confirmar Contraseña</label>
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

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/* Card: Apariencia */}
                <section className='bg-surface border border-outline shadow-sm rounded-lg'>
                    <div className='px-6 py-4 border-b border-divider bg-body/50'>
                        <h2 className='text-lg font-semibold flex items-center gap-2'>
                            <Palette className='w-5 h-5 text-accent' />
                            Apariencia
                        </h2>
                    </div>
                    <div className='p-6'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='text-on-body font-medium'>Modo Oscuro</p>
                                <p className='text-muted text-sm'>Activa el modo oscuro para reducir la fatiga visual</p>
                            </div>
                            <label className='relative inline-flex items-center cursor-pointer'>
                                <input
                                    type='checkbox'
                                    className='sr-only peer'
                                    checked={isDarkMode}
                                    onChange={toggleDarkMode}
                                />
                                <div className="w-11 h-6 bg-hover-icon peer-focus:outline-none peer-focus:ring-0 rounded-full peer-checked:after:translate-x-full peer-checked:after:border-surface after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-surface after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                            </label>
                        </div>
                    </div>
                </section>

                {/* Card 3: Recibos */}
                <section className='bg-surface border border-outline shadow-sm rounded-lg'>
                    <div className='px-6 py-4 border-b border-divider bg-body/50'>
                        <h2 className='text-lg font-semibold flex items-center gap-2'>
                            <Receipt className='w-5 h-5 text-accent' />
                            Recibos
                        </h2>
                    </div>
                    <div className='p-6'>
                        <label className='block text-sm font-medium text-on-body mb-1'>Mensaje de pie de página del ticket</label>
                        <textarea
                            name='ticket_footer'
                            value={formData.ticket_footer}
                            onChange={handleChange}
                            rows={3}
                            placeholder='¡Gracias por tu compra!'
                            className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0 resize-none'
                        />
                        <p className='text-xs text-muted mt-1'>Este mensaje aparecerá al final de cada ticket de venta.</p>
                    </div>
                </section>
            </div>

            {/* Card: Impresora Térmica */}
            <section className='bg-surface border border-outline shadow-sm rounded-lg'>
                <div className='px-6 py-4 border-b border-divider bg-body/50'>
                    <h2 className='text-lg font-semibold flex items-center gap-2'>
                        <Printer className='w-5 h-5 text-accent' />
                        Impresora Térmica
                    </h2>
                </div>
                <div className='p-6 space-y-4'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <p className='text-on-body font-medium'>Habilitar impresión térmica</p>
                            <p className='text-muted text-sm'>Permite imprimir tickets automáticamente al confirmar ventas</p>
                        </div>
                        <label className='relative inline-flex items-center cursor-pointer'>
                            <input
                                type='checkbox'
                                className='sr-only peer'
                                checked={thermalPrintingEnabled}
                                onChange={handleTogglePrinting}
                            />
                            <div className="w-11 h-6 bg-hover-icon peer-focus:outline-none peer-focus:ring-0 rounded-full peer-checked:after:translate-x-full peer-checked:after:border-surface after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-surface after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                        </label>
                    </div>

                    <div>
                        <label className='block text-sm font-medium text-on-body mb-1'>
                            Ancho de impresión
                        </label>
                        <select
                            value={printerWidth}
                            onChange={handlePrinterWidthChange}
                            className='w-full px-4 py-3 bg-surface text-on-body border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0'>
                            <option value={32}>50mm (32 caracteres)</option>
                            <option value={42}>80mm (42 caracteres)</option>
                        </select>
                        <p className='text-xs text-muted mt-1'>
                            Selecciona el tamaño de papel de tu impresora térmica
                        </p>
                    </div>

                    <div className={`${!thermalPrintingEnabled ? 'opacity-50 pointer-events-none' : ''} space-y-4`}>
                    {isAndroid() ? (
                        <>
                            <div className='rounded-lg bg-accent/5 border border-accent/20 p-4'>
                                <p className='text-sm text-on-body font-medium mb-1'>
                                    Impresión vía rawBT (Android)
                                </p>
                                <p className='text-sm text-muted'>
                                    Se usará la app rawBT para imprimir en tu impresora Bluetooth.
                                    Asegúrate de tenerla instalada y configurada.
                                </p>
                            </div>
                            <div className='flex justify-end'>
                                <a
                                    href={getRawBTPlayStoreUrl()}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='inline-flex items-center gap-2 px-4 py-2 border border-accent text-accent text-sm font-medium rounded-lg hover:bg-accent/5 transition cursor-pointer'>
                                    <Printer className='w-4 h-4' />
                                    Instalar rawBT
                                </a>
                            </div>
                        </>
                    ) : (
                        <>
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='text-on-body font-medium'>Estado del Agente</p>
                                <p className='text-muted text-sm'>Agente local de impresión en esta computadora</p>
                            </div>
                            <div className='flex items-center gap-2'>
                                {checkingAgent ? (
                                    <Loader className='w-5 h-5 animate-spin text-accent' />
                                ) : agentStatus === 'connected' ? (
                                    <div className='flex items-center gap-1.5 text-accent'>
                                        <CheckCircle className='w-4 h-4' />
                                        <span className='text-sm font-medium'>Conectado</span>
                                    </div>
                                ) : (
                                    <div className='flex items-center gap-1.5 text-danger'>
                                        <XCircle className='w-4 h-4' />
                                        <span className='text-sm font-medium'>Desconectado</span>
                                    </div>
                                )}
                                <button
                                    onClick={refreshAgentStatus}
                                    className='p-1.5 border border-outline rounded-md hover:bg-hover transition cursor-pointer'
                                    title='Actualizar estado'>
                                    <RotateCw className='w-3.5 h-3.5 text-muted' />
                                </button>
                            </div>
                        </div>

                        {agentStatus === 'connected' && (
                            <>
                                <div>
                                    <label className='block text-sm font-medium text-on-body mb-1'>
                                        Impresora predeterminada
                                    </label>
                                    <select
                                        value={selectedPrinter}
                                        onChange={handlePrinterChange}
                                        disabled={!thermalPrintingEnabled}
                                        className='w-full px-4 py-3 bg-surface text-on-body border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0 disabled:opacity-50 disabled:cursor-not-allowed'>
                                        <option value=''>Seleccionar impresora...</option>
                                        {availablePrinters.map((p) => (
                                            <option key={p.name} value={p.name}>
                                                {p.name}{p.autoDetected ? ' (USB)' : ''}
                                            </option>
                                        ))}
                                    </select>
                                    <p className='text-xs text-muted mt-1'>
                                        Se usará esta impresora para imprimir tickets de venta automáticamente
                                    </p>
                                </div>

                                <div className='flex justify-end'>
                                    <button
                                        onClick={handleTestPrint}
                                        disabled={testingPrint || !selectedPrinter || !thermalPrintingEnabled}
                                        className='flex items-center gap-2 px-4 py-2 border border-accent text-accent text-sm font-medium rounded-lg hover:bg-accent/5 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'>
                                        {testingPrint ? (
                                            <Loader className='w-4 h-4 animate-spin' />
                                        ) : (
                                            <Printer className='w-4 h-4' />
                                        )}
                                        Probar impresión
                                    </button>
                                </div>
                            </>
                        )}

                        {agentStatus === 'disconnected' && (
                            <div className='rounded-lg bg-danger/5 border border-danger/20 p-4'>
                                <p className='text-sm text-on-body'>
                                    El agente de impresión no está corriendo en esta computadora.{' '}
                                    <a
                                        href='/docs/agente-impresion'
                                        className='text-accent hover:underline'
                                        target='_blank'
                                        rel='noopener noreferrer'>
                                        ¿Cómo instalarlo?
                                    </a>
                                </p>
                            </div>
                        )}
                        </>
                    )}
                    </div>
                </div>
            </section>

            {/* Card: Notificaciones */}
            <section className='bg-surface border border-outline shadow-sm rounded-lg'>
                <div className='px-6 py-4 border-b border-divider bg-body/50'>
                    <h2 className='text-lg font-semibold flex items-center gap-2'>
                        <Bell className='w-5 h-5 text-accent' />
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
                            className='w-4 h-4 text-accent border-divider rounded focus:ring-0 cursor-pointer'
                        />
                        <span className='text-sm text-on-body'>
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
                    className='flex items-center gap-2 px-6 py-2.5 bg-accent text-surface text-sm font-bold rounded-lg hover:bg-accent/85 transition disabled:opacity-50 cursor-pointer'>
                    {saving || uploadingLogo ? (
                        <Loader className='w-5 h-5 animate-spin text-surface' />
                    ) : (
                        <Save className='w-4 h-4' />
                    )}
                    Guardar Cambios
                </button>
            </div>

            {/* Modal Confirmar Eliminar Logo */}
            <Modal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                title='Eliminar Logo'
                icon={AlertTriangle}
                iconColor='text-red-600'
                size='sm'>
                <div className='p-6'>
                    <p className='text-on-body mb-6'>¿Estás seguro de eliminar el logo del negocio?</p>
                    <div className='flex justify-end gap-3'>
                        <button
                            onClick={() => setShowDeleteConfirm(false)}
                            className='px-4 py-2 border border-outline text-on-body text-sm rounded-lg hover:bg-hover transition cursor-pointer'>
                            Cancelar
                        </button>
                        <button
                            onClick={handleConfirmDelete}
                            disabled={deletingLogo}
                            className='flex items-center gap-2 px-4 py-2 bg-danger text-surface text-sm rounded-lg hover:bg-danger/85 transition disabled:opacity-50 cursor-pointer'>
                            {deletingLogo ? (
                                <Loader className='w-4 h-4 animate-spin' />
                            ) : (
                                <Trash2 className='w-4 h-4' />
                            )}
                            Eliminar
                        </button>
                    </div>
                </div>
            </Modal>
        </section>
    )
}
