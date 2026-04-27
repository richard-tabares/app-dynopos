import { apiFetch } from '../../../shared/helpers/apiFetch'

export const getDashboardData = async (businessId) => {
    const API_URL = import.meta.env.VITE_API_URL
    try {
        const response = await apiFetch(`${API_URL}/api/dashboard/${businessId}`)
        return await response.json()
    } catch (error) {
        console.error('Error in getDashboardData:', error)
        throw error
    }
}
