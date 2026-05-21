export const useFormatDate = () => {
    const formatDate = (dateStr, options) => {
        if (!dateStr) return ''
        if (options) {
            return new Date(dateStr).toLocaleDateString('es-CO', options)
        }
        const [year, month, day] = dateStr.split('-')
        return `${day}/${month}/${year}`
    }
    return formatDate
}
