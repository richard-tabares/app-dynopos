import { useState, useEffect } from 'react'

export const useIsMobileDevice = () => {
    const [isMobile, setIsMobile] = useState(
        window.innerWidth < 1024
    )

    useEffect(() => {
        const mql = window.matchMedia('(max-width: 1023px)')
        const handleChange = (e) => setIsMobile(e.matches)
        mql.addEventListener('change', handleChange)
        return () => mql.removeEventListener('change', handleChange)
    }, [])

    return isMobile
}
