import { apiFetch } from '../../../shared/helpers/apiFetch'

export const updateUser = async (userId, { display_name, role }) => {
    const apiUrl = import.meta.env.VITE_API_URL
    const response = await apiFetch(`${apiUrl}/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name, role }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Error al actualizar usuario')
    return data
}
