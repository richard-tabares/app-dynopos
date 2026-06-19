import { apiFetch } from '../../../../shared/helpers/apiFetch'

export const deleteLogo = async (businessId) => {
    const apiUrl = import.meta.env.VITE_API_URL
    try {
        const response = await apiFetch(`${apiUrl}/api/businesses/deleteLogo/${businessId}`, {
            method: 'DELETE',
        })
        const result = await response.json()
        return result.data || result
    } catch (error) {
        console.error('Error:', error.message)
        throw error
    }
}
