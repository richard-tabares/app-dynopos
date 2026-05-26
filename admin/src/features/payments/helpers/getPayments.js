import { apiFetch } from '../../../apiFetch.js'

const API_URL = import.meta.env.VITE_API_URL

export const getPayments = async () => {
    const res = await apiFetch(`${API_URL}/api/admin/payments`)
    if (!res.ok) throw new Error('Error al obtener pagos')
    return res.json()
}
