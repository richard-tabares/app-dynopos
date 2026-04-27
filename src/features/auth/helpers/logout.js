import { apiFetch } from '../../../shared/helpers/apiFetch'
import { useStore } from '../../../app/providers/store'

export const logout = async () => {
    const apiUrl = import.meta.env.VITE_API_URL
    try {
        await apiFetch(`${apiUrl}/api/auth/logout`, { method: 'POST' })
        useStore.getState().setLogOut()
    } catch (error) {
        console.log('Logout error:', error)
    }
}