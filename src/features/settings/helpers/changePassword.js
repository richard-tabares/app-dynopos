import { apiFetch } from '../../../shared/helpers/apiFetch'

export const changePassword = async (data) => {
    const apiUrl = import.meta.env.VITE_API_URL
    try {
        const response = await apiFetch(`${apiUrl}/api/businesses/changePassword`, {
            method: 'POST',
            body: JSON.stringify(data),
        })
        
        return await response.json()
    } catch (error) {
        console.error('Error:', error.message)
        throw error
    }
}
