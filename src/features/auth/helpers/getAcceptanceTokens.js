export const getAcceptanceTokens = async (id) => {
    const apiUrl = import.meta.env.VITE_API_URL
    const response = await fetch(`${apiUrl}/api/payments/acceptance-tokens/${id}`)
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Error ${response.status}`)
    }
    return response.json()
}
