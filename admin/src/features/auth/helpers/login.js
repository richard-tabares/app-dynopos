const API_URL = import.meta.env.VITE_API_URL

export const adminLogin = async (email, password) => {
    const res = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    })

    const data = await res.json()

    if (!res.ok) {
        throw new Error(data.error || 'Error al iniciar sesión')
    }

    return data
}
