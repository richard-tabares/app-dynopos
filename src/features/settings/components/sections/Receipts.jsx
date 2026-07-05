import { useState, useEffect } from 'react'
import { Save, Loader } from 'lucide-react'
import { sileo } from 'sileo'
import { useStore } from '../../../../app/providers/store'
import { updateBusiness } from '../../account/helpers/updateBusiness'

export const Receipts = () => {
    const { user, setBusiness } = useStore()
    const businessId = user?.profile?.business_id || user?.data?.user?.id
    const [ticketFooter, setTicketFooter] = useState('')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        setTicketFooter(user?.business?.ticket_footer || '')
    }, [user?.business?.ticket_footer])

    const handleSave = async () => {
        if (!businessId) return
        setSaving(true)
        try {
            const updated = await updateBusiness(businessId, { ticket_footer: ticketFooter })
            if (updated) {
                setBusiness(updated)
                sileo.success({ fill: 'var(--toast-success)', title: 'Completado', description: 'Mensaje de ticket actualizado' })
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
                <label className='block text-sm font-medium text-on-body mb-1'>Mensaje de pie de página del ticket</label>
                <textarea
                    value={ticketFooter}
                    onChange={(e) => setTicketFooter(e.target.value)}
                    rows={3}
                    placeholder='¡Gracias por tu compra!'
                    className='w-full px-4 py-3 border border-divider rounded-md transition-all duration-300 focus:outline-none focus:border-accent focus:ring-0 resize-none'
                />
                <p className='text-xs text-muted mt-1'>Este mensaje aparecerá al final de cada ticket de venta.</p>
                <div className='flex justify-end mt-4'>
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
