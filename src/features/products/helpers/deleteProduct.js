export const deleteProduct = async (productId) => {
    const apiUrl = import.meta.env.VITE_API_URL
    const endPoint = '/api/products'
    try {
        const response = await fetch(`${apiUrl}${endPoint}/${productId}`, {
            method: 'DELETE',
        })
        const data = await response.json()
        if (!response.ok) {
            throw new Error(data.error || 'Error al eliminar el producto')
        }
        return data
    } catch (error) {
        console.error('Error:', error.message)
        throw error // Re-lanzar para que el componente lo maneje
    }
}
