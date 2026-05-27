import { apiFetch } from '../../../shared/helpers/apiFetch'

export const updateVariation = async (variationId, data) => {
    const apiUrl = import.meta.env.VITE_API_URL
    const response = await apiFetch(`${apiUrl}/api/products/variations/${variationId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    })
    const result = await response.json()

    if (!response.ok) {
        throw new Error(result.error || 'Error al actualizar la variación')
    }

    return result.data
}
