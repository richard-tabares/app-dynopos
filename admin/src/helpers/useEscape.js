import { useEffect } from 'react'

export const useEscape = (onClose) => {
    useEffect(() => {
        if (!onClose) return
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handleKey)
        return () => document.removeEventListener('keydown', handleKey)
    }, [onClose])
}
