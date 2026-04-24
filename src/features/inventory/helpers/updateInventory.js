export const updateInventory = async (productId, formData) => {
    const apiUrl = import.meta.env.VITE_API_URL
    const endPoint = `/api/inventory/${productId}`
    try {
        const response = await fetch(`${apiUrl}${endPoint}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        })
        
        if (!response.ok) {
            throw new Error('Error al actualizar el inventario')
        }
        
        const result = await response.json()
        return result.data
    } catch (error) {
        console.error('Error:', error.message)
        return null
    }
}
