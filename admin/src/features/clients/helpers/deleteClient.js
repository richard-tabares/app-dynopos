import { apiFetch } from '../../../apiFetch.js'

const API_URL = import.meta.env.VITE_API_URL

export const deleteClient = async (id) => {
    const res = await apiFetch(`${API_URL}/api/admin/clients/${id}`, {
        method: 'DELETE',
    })
    if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Error al eliminar cliente')
    }
    return res.json()
}
