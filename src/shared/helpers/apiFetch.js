import { getAuthHeaders } from './getAuthHeaders'
import { useStore } from '../../app/providers/store'

const isTokenExpired = (token) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        return Date.now() >= (payload.exp * 1000 - 30000)
    } catch {
        return true
    }
}

let refreshPromise = null

const attemptTokenRefresh = async () => {
    if (refreshPromise) return refreshPromise

    const { refreshToken } = useStore.getState()
    if (!refreshToken) return null

    refreshPromise = (async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL
            const res = await fetch(`${apiUrl}/api/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: refreshToken }),
            })
            if (!res.ok) return null
            const data = await res.json()
            useStore.getState().setToken(data.access_token)
            useStore.getState().setRefreshToken(data.refresh_token)
            return data.access_token
        } catch {
            return null
        }
    })()

    refreshPromise.finally(() => { refreshPromise = null })
    return refreshPromise
}

const doFetch = async (url, config) => {
    const store = useStore.getState()

    if (store.token && isTokenExpired(store.token)) {
        const newToken = await attemptTokenRefresh()
        if (newToken) {
            config.headers['Authorization'] = `Bearer ${newToken}`
        }
    }

    return fetch(url, config)
}

export const apiFetch = async (url, options = {}) => {
    const { body, method = 'GET', contentType = 'application/json' } = options

    const headers = getAuthHeaders(contentType)
    const config = { method, headers }
    if (body) {
        config.body = body
    }

    let response = await doFetch(url, config)

    if (response.status === 401) {
        const newToken = await attemptTokenRefresh()
        if (newToken) {
            config.headers['Authorization'] = `Bearer ${newToken}`
            response = await fetch(url, config)
        } else {
            useStore.getState().setLogOut()
            window.location.href = '/login'
            throw new Error('Sesión expirada')
        }
    }

    return response
}
