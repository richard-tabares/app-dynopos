export const createCheckout = async ({ pending_signup_id, billing_frequency, payment_method }) => {
    const apiUrl = import.meta.env.VITE_API_URL
    const response = await fetch(`${apiUrl}/api/payments/create-checkout`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ pending_signup_id, billing_frequency, payment_method }),
    })
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Error ${response.status}`)
    }
    return response.json()
}
