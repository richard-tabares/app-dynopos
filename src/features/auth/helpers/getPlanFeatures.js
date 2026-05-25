const API_URL = import.meta.env.VITE_API_URL

export const getPlanFeatures = async () => {
    try {
        const res = await fetch(`${API_URL}/api/plans/current`)
        if (!res.ok) return []
        const data = await res.json()
        return data.features || []
    } catch {
        return []
    }
}
