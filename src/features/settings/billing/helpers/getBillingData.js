import { apiFetch } from '../../../../shared/helpers/apiFetch'

const apiUrl = import.meta.env.VITE_API_URL

export const getSubscription = async (businessId) => {
    try {
        const response = await apiFetch(`${apiUrl}/api/billing/${businessId}`)
        const result = await response.json()
        return result.data
    } catch (error) {
        console.error('Error fetching subscription:', error.message)
        throw error
    }
}

export const getTransactions = async (businessId) => {
    try {
        const response = await apiFetch(`${apiUrl}/api/billing/${businessId}/transactions`)
        const result = await response.json()
        return result.data
    } catch (error) {
        console.error('Error fetching transactions:', error.message)
        throw error
    }
}

const handleResponse = async (response) => {
    const result = await response.json()
    if (!response.ok) {
        throw new Error(result.error || 'Error al procesar la solicitud')
    }
    return result
}

export const cancelRecurring = async (businessId) => {
    try {
        const response = await apiFetch(`${apiUrl}/api/billing/${businessId}/cancel-recurring`, {
            method: 'POST',
        })
        return await handleResponse(response)
    } catch (error) {
        console.error('Error cancelling recurring:', error.message)
        throw error
    }
}

export const reactivateSubscription = async (businessId) => {
    try {
        const response = await apiFetch(`${apiUrl}/api/billing/${businessId}/reactivate`, {
            method: 'POST',
        })
        return await handleResponse(response)
    } catch (error) {
        console.error('Error reactivating subscription:', error.message)
        throw error
    }
}
