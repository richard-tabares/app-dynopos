export const login = async (user, setLogin) => {
    const apiUrl = import.meta.env.VITE_API_URL
    const endPoint = '/api/auth/login'
    try {
        const response = await fetch(apiUrl + endPoint, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(user),
        })
        if (!response.ok) {
            throw new Error(`Error ${response.status}`)
        }
        const data = await response.json()
        setLogin(data)
        return data
    } catch (error) {
        console.log('Login error:', error)
    }
}
