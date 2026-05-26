import { apiFetch } from '../../../apiFetch.js'

const API_URL = import.meta.env.VITE_API_URL

export const createClient = async (data) => {
    const res = await apiFetch(`${API_URL}/api/admin/clients`, {
        method: 'POST',
        body: JSON.stringify(data),
    })
    if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Error al crear cliente')
    }
    return res.json()
}
