import { apiFetch } from '../../../shared/helpers/apiFetch'

export const updateCategory = async (id, categoryData) => {
    const apiUrl = import.meta.env.VITE_API_URL
    try {
        const response = await apiFetch(`${apiUrl}/api/categories/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(categoryData),
        })
        const result = await response.json()
        return result.data?.[0] || result
    } catch (error) {
        console.error('Error:', error.message)
        throw error
    }
}
