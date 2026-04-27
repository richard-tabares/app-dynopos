import { apiFetch } from '../../../shared/helpers/apiFetch'

export const editProduct = async (productId, formData) => {
    const apiUrl = import.meta.env.VITE_API_URL
    try {
        const response = await apiFetch(`${apiUrl}/api/products/${productId}`, {
            method: 'PATCH',
            body: JSON.stringify(formData),
        })
        const result = await response.json()
        return result.data
    } catch (error) {
        console.error('Error:', error.message)
        return null
    }
}