import { useState, useEffect } from 'react'
import { Store, Save, Loader, Trash2, AlertTriangle } from 'lucide-react'
import { sileo } from 'sileo'
import { Modal } from '../../../../shared/components/Modal'
import { useStore } from '../../../../app/providers/store'
import { updateBusiness } from '../../account/helpers/updateBusiness'
import { uploadLogo } from '../../account/helpers/uploadLogo'
import { deleteLogo } from '../../account/helpers/deleteLogo'

export const StoreInfo = () => {
    const { user, setBusiness } = useStore()
    const businessId = user?.profile?.business_id || user?.data?.user?.id

    const [formData, setFormData] = useState({
        business_name: '',
        owner_name: '',
        email: '',
        phone: '',
    })
    const [logoPreview, setLogoPreview] = useState('')
    const [logoFile, setLogoFile] = useState(null)
    const [saving, setSaving] = useState(false)
    const [uploadingLogo, setUploadingLogo] = useState(false)
    const [deletingLogo, setDeletingLogo] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    useEffect(() => {
        const b = user?.business
        if (b) {
            setFormData({
                business_name: b.business_name || '',
                owner_name: b.owner_name || '',
                email: b.email || '',
                phone: b.phone || '',
            })
            setLogoPreview(b.business_logo || '')
        }
    }, [user?.business])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleLogoChange = (e) => {
        const file = e.target.files?.[0]
        if (file) {
            setLogoFile(file)
            setLogoPreview(URL.createObjectURL(file))
        }
    }

    const handleDeleteLogo = () => setShowDeleteConfirm(true)

    const handleConfirmDelete = async () => {
        if (!businessId) return
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
        if (!businessId) return
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
                sileo.success({ fill: 'var(--toast-success)', title: 'Completado', description: 'Información guardada exitosamente' })
            }
        } catch (error) {
            sileo.error({ fill: 'var(--toast-error)', title: 'Error', description: error.message || 'Error al guardar' })
        } finally {
            setSaving(false)
        }
    }

    return (
        <>
<section className='bg-settings-card border border-outline shadow-sm rounded-lg'>
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
                    <div className='flex justify-end mt-6'>
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
                </div>
            </section>

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
        </>
    )
}
