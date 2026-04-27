import { apiFetch } from '../../../shared/helpers/apiFetch'

export const uploadLogo = async (businessId, file) => {
    const apiUrl = import.meta.env.VITE_API_URL
    const formData = new FormData()
    formData.append('logo', file)
    try {
        const response = await apiFetch(`${apiUrl}/api/businesses/uploadLogo/${businessId}`, {
            method: 'POST',
            contentType: '',
            body: formData,
        })
        return await response.json()
    } catch (error) {
        console.error('Error:', error.message)
        throw error
    }
}
