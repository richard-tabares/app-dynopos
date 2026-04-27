import { apiFetch } from '../../../shared/helpers/apiFetch'

export const getProductById = async (productId) => {
    const apiUrl = import.meta.env.VITE_API_URL
    try {
        const response = await apiFetch(`${apiUrl}/api/products/product/${productId}`)
        return await response.json()
    } catch (error) {
        console.error('Error:', error.message)
        return null
    }
}
