import { apiFetch } from '../../../shared/helpers/apiFetch'

export const createUser = async ({ email, password, display_name, role, permissions }) => {
    const apiUrl = import.meta.env.VITE_API_URL
    const response = await apiFetch(`${apiUrl}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, display_name, role, permissions }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Error al crear usuario')
    return data
}
