import { apiFetch } from '../../../apiFetch.js'

const API_URL = import.meta.env.VITE_API_URL

export const clearClientData = async (id) => {
    const res = await apiFetch(`${API_URL}/api/admin/clients/${id}/clear-data`, {
        method: 'POST',
    })
    if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Error al limpiar datos del cliente')
    }
    return res.json()
}
