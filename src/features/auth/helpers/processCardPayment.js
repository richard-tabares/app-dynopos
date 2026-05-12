export const processCardPayment = async (data) => {
    const apiUrl = import.meta.env.VITE_API_URL
    const response = await fetch(`${apiUrl}/api/payments/process-card`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(data),
    })
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Error ${response.status}`)
    }
    return response.json()
}
