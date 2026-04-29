import { apiFetch } from '../../../shared/helpers/apiFetch'

export const getTodayRevenue = async (businessId) => {
    const API_URL = import.meta.env.VITE_API_URL
    const response = await apiFetch(`${API_URL}/api/revenue/today/${businessId}`)
    return await response.json()
}
