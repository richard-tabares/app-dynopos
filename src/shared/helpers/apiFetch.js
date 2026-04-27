import { getAuthHeaders } from './getAuthHeaders'
import { useStore } from '../../app/providers/store'

export const apiFetch = async (url, options = {}) => {
    const { body, method = 'GET', contentType = 'application/json' } = options

    const headers = getAuthHeaders(contentType)
    const config = { method, headers }
    if (body) {
        config.body = body
    }

    const response = await fetch(url, config)

    if (response.status === 401) {
        useStore.getState().setLogOut()
        window.location.href = '/login'
        throw new Error('Sesión expirada')
    }

    return response
}
