import { apiFetch } from '../../../shared/helpers/apiFetch'

export const getReports = async (businessId, { section = 'sales', filter = 'month', startDate, endDate, categoryId, productSearch } = {}) => {
    const API_URL = import.meta.env.VITE_API_URL
    try {
        const params = new URLSearchParams({ section, filter })
        if (startDate) params.append('startDate', startDate)
        if (endDate) params.append('endDate', endDate)
        if (categoryId) params.append('categoryId', categoryId)
        if (productSearch) params.append('productSearch', productSearch)

        const response = await apiFetch(`${API_URL}/api/reports/${businessId}?${params}`)
        return await response.json()
    } catch (error) {
        console.error('Error in getReports:', error)
        throw error
    }
}
