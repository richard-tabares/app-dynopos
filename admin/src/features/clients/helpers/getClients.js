import { apiFetch } from '../../../apiFetch.js'

const API_URL = import.meta.env.VITE_API_URL

export const getClients = async () => {
    const res = await apiFetch(`${API_URL}/api/admin/clients`)
    if (!res.ok) throw new Error('Error al obtener clientes')
    return res.json()
}
