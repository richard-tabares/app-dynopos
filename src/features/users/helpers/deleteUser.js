import { apiFetch } from '../../../shared/helpers/apiFetch'

export const deleteUser = async (userId) => {
    const apiUrl = import.meta.env.VITE_API_URL
    const response = await apiFetch(`${apiUrl}/api/users/${userId}`, {
        method: 'DELETE',
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Error al eliminar usuario')
    return data
}
