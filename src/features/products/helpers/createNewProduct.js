import { apiFetch } from '../../../shared/helpers/apiFetch'

export const createNewProduct = async (formData) => {
    const apiUrl = import.meta.env.VITE_API_URL
    const response = await apiFetch(`${apiUrl}/api/products/createProduct`, {
        method: 'POST',
        body: JSON.stringify(formData),
    })
    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.error || 'Error al crear el producto')
    }

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
}
