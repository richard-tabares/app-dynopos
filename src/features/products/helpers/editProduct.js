export const editProduct = async (productId, formData) => {
    const apiUrl = import.meta.env.VITE_API_URL
    const endPoint = `/api/products/`
    try {
        const response = await fetch(`${apiUrl}${endPoint}${productId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        })
        
        if (!response.ok) {
            throw new Error('Error al actualizar el producto')
        }
        
        const result = await response.json()
        return result.data
    } catch (error) {
        console.error('Error:', error.message)
        return null
    }
}