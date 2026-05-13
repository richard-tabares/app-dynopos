export const checkPaymentStatus = async (id) => {
    const apiUrl = import.meta.env.VITE_API_URL
    const response = await fetch(`${apiUrl}/api/payments/status/${id}`)
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Error ${response.status}`)
    }
    return response.json()
}
