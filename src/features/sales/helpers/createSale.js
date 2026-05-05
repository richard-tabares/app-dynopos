import { apiFetch } from '../../../shared/helpers/apiFetch'

export const createSale = async (saleData) => {
    const apiUrl = import.meta.env.VITE_API_URL
    try {
        const response = await apiFetch(`${apiUrl}/api/sales/createSale`, {
            method: 'POST',
            body: JSON.stringify(saleData),
        })
        if (!response.ok) {
            const err = await response.json()
            throw new Error(err.error || 'Error al procesar la venta')
        }
        return await response.json()
    } catch (error) {
        console.error('Error creating sale:', error.message)
        throw error
    }
}
