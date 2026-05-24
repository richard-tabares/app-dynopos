import { apiFetch } from '../../../shared/helpers/apiFetch'

export const getUsers = async (businessId) => {
    const apiUrl = import.meta.env.VITE_API_URL
    try {
        const response = await apiFetch(`${apiUrl}/api/users/${businessId}`)
        return await response.json()
    } catch (error) {
        console.error('Error fetching users:', error.message)
        return []
    }
}
