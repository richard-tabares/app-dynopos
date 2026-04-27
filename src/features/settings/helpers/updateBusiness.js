import { apiFetch } from '../../../shared/helpers/apiFetch'

export const updateBusiness = async (id, data) => {
    const apiUrl = import.meta.env.VITE_API_URL
    try {
        const response = await apiFetch(`${apiUrl}/api/businesses/updateBusiness/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        })
        const result = await response.json()
        return result.data?.[0] || result
    } catch (error) {
        console.error('Error:', error.message)
        throw error
    }
}
