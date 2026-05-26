import { apiFetch } from '../../../apiFetch.js'

const API_URL = import.meta.env.VITE_API_URL

export const toggleClientStatus = async (id, is_active) => {
    const res = await apiFetch(`${API_URL}/api/admin/clients/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active }),
    })
    if (!res.ok) throw new Error('Error al actualizar estado')
    return res.json()
}

export const changeBillingFrequency = async (id, billing_frequency) => {
    const res = await apiFetch(`${API_URL}/api/admin/clients/${id}/frequency`, {
        method: 'PATCH',
        body: JSON.stringify({ billing_frequency }),
    })
    if (!res.ok) throw new Error('Error al cambiar frecuencia')
    return res.json()
}

export const extendSubscription = async (id, current_period_end) => {
    const res = await apiFetch(`${API_URL}/api/admin/clients/${id}/extend`, {
        method: 'PATCH',
        body: JSON.stringify({ current_period_end }),
    })
    if (!res.ok) throw new Error('Error al extender suscripción')
    return res.json()
}

export const manualRenewal = async (id) => {
    const res = await apiFetch(`${API_URL}/api/admin/clients/${id}/renew`, {
        method: 'POST',
    })
    if (!res.ok) throw new Error('Error al renovar manualmente')
    return res.json()
}
