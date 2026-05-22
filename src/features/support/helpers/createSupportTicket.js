import { apiFetch } from '../../../shared/helpers/apiFetch'

export const createSupportTicket = async (data) => {
    const apiUrl = import.meta.env.VITE_API_URL
    const response = await apiFetch(`${apiUrl}/api/support/tickets`, {
        method: 'POST',
        body: JSON.stringify(data),
    })
    const result = await response.json()

    if (!response.ok) {
        throw new Error(result.error || 'Error al crear el ticket de soporte')
    }

    return result
}
