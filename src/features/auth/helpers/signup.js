export const signup = async (formData) => {
    const apiUrl = import.meta.env.VITE_API_URL
    const endPoint = '/api/auth/signup'
    try {
        const response = await fetch(apiUrl + endPoint, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(formData),
        })
        if (!response.ok) {
            throw new Error(`Error ${response.status}`)
        }
        const data = await response.json()
        console.log(data)
    } catch (error) {
        console.log('Error en el registro:', error)
    }
}
