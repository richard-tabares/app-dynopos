export const changePassword = async (data) => {
    const apiUrl = import.meta.env.VITE_API_URL
    try {
        const response = await fetch(`${apiUrl}/api/businesses/changePassword`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Error al cambiar la contraseña')
        }
        return await response.json()
    } catch (error) {
        console.error('Error:', error.message)
        throw error
    }
}
