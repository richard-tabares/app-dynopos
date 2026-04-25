export const updateBusiness = async (id, data) => {
    const apiUrl = import.meta.env.VITE_API_URL
    try {
        const response = await fetch(`${apiUrl}/api/businesses/updateBusiness/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Error al actualizar el negocio')
        }
        const result = await response.json()
        return result.data?.[0] || result
    } catch (error) {
        console.error('Error:', error.message)
        throw error
    }
}
