
export const logout = async (setLogin) => {
    const apiUrl = import.meta.env.VITE_API_URL
    const endPoint = '/api/auth/logout'
    
    try {
        const response = await fetch(apiUrl + endPoint, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
        })
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}`)
        }
        
        const data = await response.json()
        setLogin(null)
        return data
    } catch (error) {
        console.log('Logout error:', error)
    }
}