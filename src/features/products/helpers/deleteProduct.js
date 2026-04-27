import { apiFetch } from '../../../shared/helpers/apiFetch'

export const deleteProduct = async (productId) => {
    const apiUrl = import.meta.env.VITE_API_URL
    try {
        const response = await apiFetch(`${apiUrl}/api/products/${productId}`, {
            method: 'DELETE',
        })
        return await response.json()
    } catch (error) {
        console.error('Error:', error.message)
        throw error
    }
}
