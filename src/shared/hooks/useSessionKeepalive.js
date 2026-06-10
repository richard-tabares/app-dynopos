import { useEffect } from 'react'
import { useStore } from '../../app/providers/store'

const KEEPALIVE_INTERVAL = 60 * 60 * 1000
const EXPIRY_BUFFER = 2 * 60 * 60 * 1000

const isTokenExpiringSoon = (token) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        return Date.now() >= (payload.exp * 1000 - EXPIRY_BUFFER)
    } catch {
        return true
    }
}

export const useSessionKeepalive = () => {
    const refreshToken = useStore((s) => s.refreshToken)
    const setSessionExpired = useStore((s) => s.setSessionExpired)

    useEffect(() => {
        if (!refreshToken) return

        const keepAlive = async () => {
            const state = useStore.getState()
            if (!state.token) return
            if (!isTokenExpiringSoon(state.token)) return

            try {
                const apiUrl = import.meta.env.VITE_API_URL
                const res = await fetch(`${apiUrl}/api/auth/refresh`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refresh_token: state.refreshToken }),
                })
                if (!res.ok) {
                    state.setSessionExpired(true)
                    return
                }
                const data = await res.json()
                state.setToken(data.access_token)
                state.setRefreshToken(data.refresh_token)
            } catch {
                useStore.getState().setSessionExpired(true)
            }
        }

        const interval = setInterval(keepAlive, KEEPALIVE_INTERVAL)

        return () => clearInterval(interval)
    }, [refreshToken, setSessionExpired])
}
