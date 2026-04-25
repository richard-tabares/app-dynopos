export const uploadLogo = async (businessId, file) => {
    const apiUrl = import.meta.env.VITE_API_URL
    const formData = new FormData()
    formData.append('logo', file)
    try {
        const response = await fetch(`${apiUrl}/api/businesses/uploadLogo/${businessId}`, {
            method: 'POST',
            body: formData,
        })
        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Error al subir el logo')
        }
        return await response.json()
    } catch (error) {
        console.error('Error:', error.message)
        throw error
    }
}
