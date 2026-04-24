
export const getDashboardData = async (businessId) => {
    const API_URL = import.meta.env.VITE_API_URL
    try {
        const response = await fetch(`${API_URL}/api/dashboard/${businessId}`)
        if (!response.ok) {
            throw new Error('Error al obtener datos del dashboard')
        }
        return await response.json()
    } catch (error) {
        console.error('Error in getDashboardData:', error)
        throw error
    }
}
