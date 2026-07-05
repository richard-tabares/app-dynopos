import { useEffect } from 'react'
import { useStore } from '../../../../app/providers/store'

export const Appearance = () => {
    const isDarkMode = useStore((state) => state.isDarkMode)
    const toggleDarkMode = useStore((state) => state.toggleDarkMode)

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDarkMode)
    }, [isDarkMode])

    return (
<section className='bg-settings-card border border-outline shadow-sm rounded-lg'>
        <div className='p-6'>
                <div className='flex items-center justify-between'>
                    <div>
                        <p className='text-on-body font-medium'>Modo Oscuro</p>
                        <p className='text-muted text-sm'>Activa el modo oscuro para reducir la fatiga visual</p>
                    </div>
                    <label className='relative inline-flex items-center cursor-pointer'>
                        <input
                            type='checkbox'
                            className='sr-only peer'
                            checked={isDarkMode}
                            onChange={toggleDarkMode}
                        />
                        <div className="w-11 h-6 bg-hover-icon peer-focus:outline-none peer-focus:ring-0 rounded-full peer-checked:after:translate-x-full peer-checked:after:border-surface after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-surface after:border-outline after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                    </label>
                </div>
            </div>
        </section>
    )
}
