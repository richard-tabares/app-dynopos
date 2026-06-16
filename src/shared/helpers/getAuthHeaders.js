import { useStore } from '../../app/providers/store'

export const getAuthHeaders = (contentType) => {
    const token = useStore.getState().token
    const headers = {}
    if (contentType) {
        headers['Content-Type'] = contentType
    }
    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }
    return headers
}
