import { apiFetch } from '../../../shared/helpers/apiFetch'

export const getSales = async (businessId) => {
    const apiUrl = import.meta.env.VITE_API_URL
    try {
        const response = await apiFetch(`${apiUrl}/api/sales/${businessId}`)
        return await response.json()
    } catch (error) {
        console.error('Error in getSales:', error)
        throw error
    }
}
