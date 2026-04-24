
export const getProducts = async (businessId) => {
    const apiUrl = import.meta.env.VITE_API_URL
    const endPoint = '/api/products'
    try {
        const response = await fetch(`${apiUrl}${endPoint}/${businessId}`)
        if (!response.ok) {
            throw new Error('Error al obtener los productos')
        }
        const data = await response.json()
        
        // Asegurar que siempre retorna un array
        if (Array.isArray(data)) {
            return data
        }
        if (Array.isArray(data.data)) {
            return data.data
        }
        return []
    } catch (error) {
        console.error('Error:', error.message)
        return []
    }
}