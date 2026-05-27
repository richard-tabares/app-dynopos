import { apiFetch } from '../../../shared/helpers/apiFetch'

export const bulkUpload = async (businessId, file) => {
    const apiUrl = import.meta.env.VITE_API_URL
    const formData = new FormData()
    formData.append('file', file)
    formData.append('business_id', businessId)

    const response = await apiFetch(`${apiUrl}/api/products/bulk-upload`, {
        method: 'POST',
        body: formData,
        contentType: null,
    })

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.error || 'Error al procesar la carga masiva')
    }

    return data
}
