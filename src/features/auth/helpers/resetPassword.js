export const resetPassword = async (access_token, refresh_token, password) => {
    const apiUrl = import.meta.env.VITE_API_URL
    const endPoint = '/api/auth/reset-password'
    try {
        const response = await fetch(apiUrl + endPoint, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({ access_token, refresh_token, password }),
        })
        if (!response.ok) {
            const err = await response.json()
            throw new Error(err.error || `Error ${response.status}`)
        }
        const data = await response.json()
        return data
    } catch (error) {
        console.log('Reset password error:', error)
        throw error
    }
}
