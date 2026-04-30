export const login = async (user, setLogin) => {
    const apiUrl = import.meta.env.VITE_API_URL
    const endPoint = '/api/auth/login'
    const response = await fetch(apiUrl + endPoint, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(user),
    })
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Error ${response.status}`)
    }
    const data = await response.json()
    setLogin(data)
    return data
}
