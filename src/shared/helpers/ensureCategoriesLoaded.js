import { getCategories } from '../../features/categories/helpers/getCategories'

export const ensureCategoriesLoaded = async (categories, setCategories, businessId) => {
    if (categories.length > 0 || !businessId) return
    try {
        const data = await getCategories(businessId)
        setCategories(data)
    } catch { /* ignore */ }
}
