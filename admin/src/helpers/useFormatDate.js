export const useFormatDate = () => {
    return (dateStr) => {
        if (!dateStr) return '—'
        try {
            return new Date(dateStr).toLocaleDateString('es-CO', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            })
        } catch {
            return dateStr
        }
    }
}
