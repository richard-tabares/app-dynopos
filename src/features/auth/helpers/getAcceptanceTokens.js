export const getAcceptanceTokens = async (signupToken) => {
    const apiUrl = import.meta.env.VITE_API_URL
    const response = await fetch(`${apiUrl}/api/payments/acceptance-tokens/${signupToken}`)
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Error ${response.status}`)
    }
    return response.json()
}
