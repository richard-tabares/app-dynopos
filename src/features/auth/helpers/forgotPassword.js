export const forgotPassword = async (email) => {
    const apiUrl = import.meta.env.VITE_API_URL
    const endPoint = '/api/auth/forgot-password'
    const response = await fetch(apiUrl + endPoint, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify({ email }),
    })
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Error ${response.status}`)
    }
    const data = await response.json()
    return data
}
