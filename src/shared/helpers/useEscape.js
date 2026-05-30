import { useEffect, useRef } from 'react'

let counter = 0
let activeIds = new Set()

export const useEscape = (callback) => {
    const savedCallback = useRef(callback)
    savedCallback.current = callback
    const idRef = useRef(0)

    useEffect(() => {
        if (!savedCallback.current) return

        idRef.current = ++counter
        activeIds.add(idRef.current)

        const handler = (e) => {
            if (e.key === 'Escape' && idRef.current === Math.max(...activeIds)) {
                savedCallback.current()
            }
        }

        document.addEventListener('keydown', handler)
        return () => {
            document.removeEventListener('keydown', handler)
            activeIds.delete(idRef.current)
        }
    }, [])
}
