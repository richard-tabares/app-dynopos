import { apiFetch } from '../../../shared/helpers/apiFetch'
import { sileo } from 'sileo'

export const getUsers = async (businessId) => {
    const apiUrl = import.meta.env.VITE_API_URL
    try {
        const response = await apiFetch(`${apiUrl}/api/users/${businessId}`)
        const data = await response.json()
        if (!response.ok) {
            throw new Error(data.error || 'Error al obtener usuarios')
        }
        return data
    } catch (error) {
        console.error('Error fetching users:', error.message)
        sileo.error({
            fill: 'var(--toast-error)',
            title: 'Error',
            description: error.message,
        })
        return []
    }
}
