export const initiateSignup = async (formData) => {
    const apiUrl = import.meta.env.VITE_API_URL
    const response = await fetch(`${apiUrl}/api/payments/init-signup`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            business_name: formData.business_name,
            owner_name: formData.owner_name,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
        }),
    })
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Error ${response.status}`)
    }
    return response.json()
}
