export const createSale = async (saleData) => {
    const apiUrl = import.meta.env.VITE_API_URL
    const endPoint = '/api/sales/createSale'
    try {
        const response = await fetch(`${apiUrl}${endPoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(saleData),
        })
        
        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Error al procesar la venta')
        }
        
        return await response.json()
    } catch (error) {
        console.error('Error:', error.message)
        throw error
    }
}
