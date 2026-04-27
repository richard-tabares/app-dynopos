import { apiFetch } from '../../../shared/helpers/apiFetch'

export const getCategories = async (businessId) => {
    const apiUrl = import.meta.env.VITE_API_URL
    try {
        const response = await apiFetch(`${apiUrl}/api/categories/${businessId}`)
        const data = await response.json()

        if (Array.isArray(data)) {
            return data
        }
        if (Array.isArray(data.data)) {
            return data.data
        }
        return []
    } catch (error) {
        console.error('Error:', error.message)
        return []
    }
}
