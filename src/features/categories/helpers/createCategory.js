export const createCategory = async (categoryData) => {
    const apiUrl = import.meta.env.VITE_API_URL
    const endPoint = '/api/categories'
    try {
        const response = await fetch(`${apiUrl}${endPoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(categoryData),
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Error al crear la categoría')
        }

        const result = await response.json()
        return result.data?.[0] || result
    } catch (error) {
        console.error('Error:', error.message)
        throw error
    }
}
