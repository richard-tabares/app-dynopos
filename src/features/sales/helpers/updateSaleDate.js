import { apiFetch } from '../../../shared/helpers/apiFetch'

export const updateSaleDate = async (saleId, date) => {
    const API_URL = import.meta.env.VITE_API_URL
    const response = await apiFetch(`${API_URL}/api/sales/${saleId}/date`, {
        method: 'PATCH',
        body: JSON.stringify({ date }),
    })
    if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || 'Error al actualizar la fecha')
    }
    return response.json()
}
