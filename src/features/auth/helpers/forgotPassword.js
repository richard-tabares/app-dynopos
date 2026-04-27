export const forgotPassword = async (email) => {
    const apiUrl = import.meta.env.VITE_API_URL
    const endPoint = '/api/auth/forgot-password'
    try {
        const response = await fetch(apiUrl + endPoint, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({ email }),
        })
        if (!response.ok) {
            throw new Error(`Error ${response.status}`)
        }
        const data = await response.json()
        return data
    } catch (error) {
        console.log('Forgot password error:', error)
    }
}
