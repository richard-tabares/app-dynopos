import { apiFetch } from '../../../shared/helpers/apiFetch'

export const editProduct = async (productId, formData) => {
    const apiUrl = import.meta.env.VITE_API_URL
    const response = await apiFetch(`${apiUrl}/api/products/${productId}`, {
        method: 'PATCH',
        body: JSON.stringify(formData),
    })
    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar el producto')
    }

    return data.data
}
