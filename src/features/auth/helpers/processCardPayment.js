export const processCardPayment = async (data) => {
    const apiUrl = import.meta.env.VITE_API_URL
    const response = await fetch(`${apiUrl}/api/payments/process-card`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(data),
    })
    const result = await response.json()
    if (!response.ok && !Object.prototype.hasOwnProperty.call(result, 'success')) {
        throw new Error(result.error || `Error ${response.status}`)
    }
    return result
}
