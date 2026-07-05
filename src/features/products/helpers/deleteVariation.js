import { apiFetch } from '../../../shared/helpers/apiFetch'

export const deleteVariation = async (variationId) => {
    const apiUrl = import.meta.env.VITE_API_URL
    const response = await apiFetch(`${apiUrl}/api/products/variations/${variationId}`, {
        method: 'DELETE',
    })
    const result = await response.json()

    if (!response.ok) {
        throw new Error(result.error || 'Error al eliminar la variación')
    }

    return result
}
