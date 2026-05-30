import { apiFetch } from '../../../shared/helpers/apiFetch'

export const updateInventory = async (productId, formData) => {
    const apiUrl = import.meta.env.VITE_API_URL
    const response = await apiFetch(`${apiUrl}/api/inventory/${productId}`, {
        method: 'PATCH',
        body: JSON.stringify(formData),
    })
    const result = await response.json()
    if (!response.ok) {
        throw new Error(result.error || 'Error al actualizar el inventario')
    }
    return result.data
}
