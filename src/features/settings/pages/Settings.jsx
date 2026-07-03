import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { SettingsLayout } from '../components/SettingsLayout'

export const Settings = () => {
    const location = useLocation()

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [location.pathname])

    return <SettingsLayout />
}
