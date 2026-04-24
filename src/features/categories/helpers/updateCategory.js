export const updateCategory = async (id, categoryData) => {
    const apiUrl = import.meta.env.VITE_API_URL
    const endPoint = `/api/categories/${id}`
    try {
        const response = await fetch(`${apiUrl}${endPoint}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(categoryData),
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Error al actualizar la categoría')
        }

        return await response.json()
    } catch (error) {
        console.error('Error:', error.message)
        throw error
    }
}
