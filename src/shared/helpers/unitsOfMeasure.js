export const getUnitLabel = (unitOfMeasureId, unitsOfMeasure) => {
    if (!unitOfMeasureId) return 'uds'
    const unit = unitsOfMeasure.find(u => u.id === unitOfMeasureId)
    return unit?.short_name || 'uds'
}

export const ensureUnitsLoaded = async (unitsOfMeasure, setUnitsOfMeasure) => {
    if (unitsOfMeasure.length > 0) return
    try {
        const apiUrl = import.meta.env.VITE_API_URL
        const response = await fetch(`${apiUrl}/api/products/units/list`)
        const data = await response.json()
        if (Array.isArray(data)) setUnitsOfMeasure(data)
    } catch { /* ignore */ }
}
