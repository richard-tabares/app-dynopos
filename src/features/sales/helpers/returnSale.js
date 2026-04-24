export const returnSale = async (saleId, { reason, businessId, items }) => {
    const apiUrl = import.meta.env.VITE_API_URL
    const response = await fetch(`${apiUrl}/api/sales/returnSale/${saleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, business_id: businessId, items })
    })

    if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al procesar la devolución')
    }

    return await response.json()
}
