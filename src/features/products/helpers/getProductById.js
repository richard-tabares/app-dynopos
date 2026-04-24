export const getProductById = async (productId) => {
    const apiUrl = import.meta.env.VITE_API_URL
    const endPoint = '/api/products/product'
    try {
        const response = await fetch(`${apiUrl}${endPoint}/${productId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        if (!response.ok) {
            throw new Error('Error al obtener el producto')
        }
        const data = await response.json()

        return data
    } catch (error) {
        console.error('Error:', error.message)
        return null
    }
}
