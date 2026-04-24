export const getSales = async (businessId) => {
    const apiUrl = import.meta.env.VITE_API_URL
    try {
        const response = await fetch(`${apiUrl}/api/sales/${businessId}`)
        if (!response.ok) {
            throw new Error('Error al obtener ventas')
        }
        return await response.json()
    } catch (error) {
        console.error('Error in getSales:', error)
        throw error
    }
}
