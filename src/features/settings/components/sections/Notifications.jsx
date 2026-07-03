import { useState, useEffect } from 'react'
import { Bell, Save, Loader } from 'lucide-react'
import { sileo } from 'sileo'
import { useStore } from '../../../../app/providers/store'
import { updateBusiness } from '../../account/helpers/updateBusiness'

export const Notifications = () => {
    const { user, setBusiness } = useStore()
    const businessId = user?.profile?.business_id || user?.data?.user?.id
    const [enabled, setEnabled] = useState(false)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        setEnabled(user?.business?.low_stock_notifications ?? false)
    }, [user?.business?.low_stock_notifications])

    const handleSave = async () => {
        if (!businessId) return
        setSaving(true)
        try {
            const updated = await updateBusiness(businessId, { low_stock_notifications: enabled })
            if (updated) {
                setBusiness(updated)
                sileo.success({ fill: 'var(--toast-success)', title: 'Completado', description: 'Notificaciones actualizadas' })
            }
        } catch (error) {
            sileo.error({ fill: 'var(--toast-error)', title: 'Error', description: error.message || 'Error al guardar' })
        } finally {
            setSaving(false)
        }
    }

    return (
        <section className='bg-surface border border-outline shadow-sm rounded-lg'>
            <div className='px-6 py-4 border-b border-divider bg-body/50'>
                <h2 className='text-lg font-semibold flex items-center gap-2'>
                    <Bell className='w-5 h-5 text-accent' />
                    Notificaciones
                </h2>
            </div>
            <div className='p-6'>
                <label className='flex items-center gap-3 cursor-pointer mb-4'>
                    <input
                        type='checkbox'
                        checked={enabled}
                        onChange={(e) => setEnabled(e.target.checked)}
                        className='w-4 h-4 text-accent border-divider rounded focus:ring-0 cursor-pointer'
                    />
                    <span className='text-sm text-on-body'>
                        Activar correo de notificación cuando un producto tenga stock bajo
                    </span>
                </label>
                <div className='flex justify-end'>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className='flex items-center gap-2 px-4 py-2 bg-accent text-surface text-sm font-medium rounded-lg hover:bg-accent/85 transition disabled:opacity-50 cursor-pointer'>
                        {saving ? <Loader className='w-4 h-4 animate-spin' /> : <Save className='w-4 h-4' />}
                        Guardar
                    </button>
                </div>
            </div>
        </section>
    )
}
