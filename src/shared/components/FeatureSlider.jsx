import { useState, useEffect, useCallback } from 'react'
import { motion as Motion, AnimatePresence } from 'motion/react'
import {
    ShoppingCart,
    Package,
    Warehouse,
    BarChart3,
    Users,
    Mail,
    MessageCircle,
    LayoutDashboard,
    ClipboardList,
    ShieldCheck,
} from 'lucide-react'

const INTERVAL = 3500

const ICON_ELEMENTS = {
    'Punto de venta': <ShoppingCart className='w-4 h-4 text-accent' />,
    'Gestión de productos': <Package className='w-4 h-4 text-accent' />,
    'Control de inventario': <Warehouse className='w-4 h-4 text-accent' />,
    'Reportes Dinámicos': <BarChart3 className='w-4 h-4 text-accent' />,
    'Gestión de Usuarios': <Users className='w-4 h-4 text-accent' />,
    'Soporte email': <Mail className='w-4 h-4 text-accent' />,
    'Soporte WhatsApp': <MessageCircle className='w-4 h-4 text-accent' />,
    'Panel de Control': <LayoutDashboard className='w-4 h-4 text-accent' />,
    'Órdenes Múltiples': <ClipboardList className='w-4 h-4 text-accent' />,
    'Roles y Permisos': <ShieldCheck className='w-4 h-4 text-accent' />,
}

const getFeatureIcon = (title) => {
    const key = Object.keys(ICON_ELEMENTS).find((k) =>
        title.toLowerCase().includes(k.toLowerCase())
    )
    return ICON_ELEMENTS[key] || ICON_ELEMENTS['Punto de venta']
}

const chunkArray = (arr, size) => {
    const result = []
    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size))
    }
    return result
}

export const FeatureSlider = ({ features, itemsPerSlide = 2 }) => {
    const slides = chunkArray(features, itemsPerSlide)
    const totalSlides = slides.length

    const [current, setCurrent] = useState(0)
    const [paused, setPaused] = useState(false)

    const next = useCallback(() => {
        setCurrent((prev) => (prev + 1) % totalSlides)
    }, [totalSlides])

    useEffect(() => {
        if (paused || totalSlides <= 1) return
        const timer = setInterval(next, INTERVAL)
        return () => clearInterval(timer)
    }, [paused, totalSlides, next])

    if (!features.length) return null

    return (
        <div
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            <AnimatePresence mode='wait'>
                <Motion.div
                    key={current}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className='min-h-[72px] space-y-2.5'
                >
                    {slides[current].map((feature, i) => (
                        <div key={i} className='flex items-start gap-3'>
                            <div className='mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center border border-accent/20'>
                                {getFeatureIcon(feature.title || feature)}
                            </div>
                            <div className='min-w-0'>
                                <p className='text-base font-semibold text-on-body leading-tight'>
                                    {feature.title || feature}
                                </p>
                                {feature.description && (
                                    <p className='text-sm text-muted leading-relaxed mt-0.5'>
                                        {feature.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </Motion.div>
            </AnimatePresence>
            {totalSlides > 1 && (
                <div className='flex justify-center gap-1.5 mt-2.5'>
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrent(i)}
                            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                                i === current
                                    ? 'bg-accent w-3'
                                    : 'bg-on-body/30 hover:bg-on-body/50'
                            }`}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
