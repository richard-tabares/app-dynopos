export const deleteProduct = async (productId) => {
    const apiUrl = import.meta.env.VITE_API_URL
    const endPoint = '/api/products'
    try {
        const response = await fetch(`${apiUrl}${endPoint}/${productId}`, {
            method: 'DELETE',
        })
        if (!response.ok) {
            throw new Error('Error al eliminar el producto')
        }
        const data = await response.json()
        return data
    } catch (error) {
        console.error('Error:', error.message)
    }
}