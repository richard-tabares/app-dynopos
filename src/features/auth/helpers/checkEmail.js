export const checkEmail = async (email) => {
    const apiUrl = import.meta.env.VITE_API_URL
    const response = await fetch(`${apiUrl}/api/auth/check-email/${encodeURIComponent(email)}`)
    if (!response.ok) return { exists: false }
    return response.json()
}
