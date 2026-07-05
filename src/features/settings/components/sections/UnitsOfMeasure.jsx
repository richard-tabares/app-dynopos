import { useState, useEffect } from 'react'
import { Save, Loader } from 'lucide-react'
import { sileo } from 'sileo'
import { useStore } from '../../../../app/providers/store'
import { updateBusiness } from '../../account/helpers/updateBusiness'

export const UnitsOfMeasure = () => {
    const { user, setBusiness } = useStore()
    const businessId = user?.profile?.business_id || user?.data?.user?.id
    const [enabled, setEnabled] = useState(false)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        setEnabled(user?.business?.variable_units_enabled ?? false)
    }, [user?.business?.variable_units_enabled])

    const handleSave = async () => {
        if (!businessId) return
        setSaving(true)
        try {
            const updated = await updateBusiness(businessId, { variable_units_enabled: enabled })
            if (updated) {
                setBusiness(updated)
                sileo.success({ fill: 'var(--toast-success)', title: 'Completado', description: 'Configuración de unidades actualizada' })
            }
        } catch (error) {
            sileo.error({ fill: 'var(--toast-error)', title: 'Error', description: error.message || 'Error al guardar' })
        } finally {
            setSaving(false)
        }
    }

    return (
<section className='bg-settings-card border border-outline shadow-sm rounded-lg'>
        <div className='p-6'>
                <div className='flex items-center justify-between mb-4'>
                    <div>
                        <p className='text-on-body font-medium'>Vender en metros, kilogramos y submúltiplos</p>
                        <p className='text-muted text-sm'>Permite configurar productos con unidades de medida como Metro, Kilogramo, Centímetro y Gramo</p>
                    </div>
                    <label className='relative inline-flex items-center cursor-pointer'>
                        <input
                            type='checkbox'
                            className='sr-only peer'
                            checked={enabled}
                            onChange={() => setEnabled(!enabled)}
                        />
                        <div className="w-11 h-6 bg-hover-icon peer-focus:outline-none peer-focus:ring-0 rounded-full peer-checked:after:translate-x-full peer-checked:after:border-surface after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-surface after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                    </label>
                </div>
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
