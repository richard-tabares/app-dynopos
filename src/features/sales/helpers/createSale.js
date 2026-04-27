import { apiFetch } from '../../../shared/helpers/apiFetch'

export const createSale = async (saleData) => {
    const apiUrl = import.meta.env.VITE_API_URL
    try {
        const response = await apiFetch(`${apiUrl}/api/sales/createSale`, {
            method: 'POST',
            body: JSON.stringify(saleData),
        })
        return await response.json()
    } catch (error) {
        console.error('Error:', error.message)
        throw error
    }
}
