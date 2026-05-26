import { apiFetch } from '../../../apiFetch.js'

const API_URL = import.meta.env.VITE_API_URL

export const getTickets = async () => {
    const res = await apiFetch(`${API_URL}/api/admin/support/tickets`)
    if (!res.ok) throw new Error('Error al obtener tickets')
    return res.json()
}

export const updateTicketStatus = async (id, status) => {
    const res = await apiFetch(`${API_URL}/api/admin/support/tickets/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
    })
    if (!res.ok) throw new Error('Error al actualizar ticket')
    return res.json()
}
