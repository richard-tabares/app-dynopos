import { apiFetch } from '../../../shared/helpers/apiFetch'

export const returnSale = async (saleId, { reason, businessId, items }) => {
    const apiUrl = import.meta.env.VITE_API_URL
    const response = await apiFetch(`${apiUrl}/api/sales/returnSale/${saleId}`, {
        method: 'PATCH',
        body: JSON.stringify({ reason, business_id: businessId, items })
    })
    return await response.json()
}
