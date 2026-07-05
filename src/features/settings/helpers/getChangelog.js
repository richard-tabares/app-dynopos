import { apiFetch } from '../../../shared/helpers/apiFetch'

const API_URL = import.meta.env.VITE_API_URL

export const getChangelog = async () => {
    try {
        const response = await apiFetch(`${API_URL}/api/changelog`)
        const data = await response.json()
        return Array.isArray(data) ? data : []
    } catch (error) {
        console.error('Error al obtener novedades:', error.message)
        return []
    }
}

export const getLatestChangelogId = async () => {
    try {
        const response = await apiFetch(`${API_URL}/api/changelog/latest-id`)
        const data = await response.json()
        return data?.maxId || 0
    } catch (error) {
        console.error('Error al obtener último ID:', error.message)
        return 0
    }
}
