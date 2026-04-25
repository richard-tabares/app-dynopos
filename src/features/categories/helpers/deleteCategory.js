export const deleteCategory = async (id) => {
    const apiUrl = import.meta.env.VITE_API_URL
    const endPoint = `/api/categories/${id}`
    try {
        const response = await fetch(`${apiUrl}${endPoint}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Error al eliminar la categoría')
        }

        const result = await response.json()
        return result.data?.[0] || result
    } catch (error) {
        console.error('Error:', error.message)
        throw error
    }
}
