export const createNewProduct = async (formData) => {
    const apiUrl = import.meta.env.VITE_API_URL
    const endPoint = '/api/products/createProduct'
    try {
        const response = await fetch(`${apiUrl}${endPoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        })
        
        if (!response.ok) {
            throw new Error('Error al crear el producto')
        }
        
        const data = await response.json()

        if (Array.isArray(data)) {
            return data[0]
        }
        
        if (Array.isArray(data.data)) {
            return data.data[0]
        }
        
        if (data.data && typeof data.data === 'object') {
            return data.data
        }
        return data
    } catch (error) {
        console.error('Error:', error.message)
        return null
    }
}
