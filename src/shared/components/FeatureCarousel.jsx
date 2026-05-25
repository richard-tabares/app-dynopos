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

const INTERVAL = 4000

const ICON_ELEMENTS = {
    'Punto de venta': <ShoppingCart className='w-5 h-5 text-login-accent' />,
    'Gestión de productos': <Package className='w-5 h-5 text-login-accent' />,
    'Control de inventario': <Warehouse className='w-5 h-5 text-login-accent' />,
    'Reportes Dinámicos': <BarChart3 className='w-5 h-5 text-login-accent' />,
    'Gestión de Usuarios': <Users className='w-5 h-5 text-login-accent' />,
    'Soporte email': <Mail className='w-5 h-5 text-login-accent' />,
    'Soporte WhatsApp': <MessageCircle className='w-5 h-5 text-login-accent' />,
    'Panel de Control': <LayoutDashboard className='w-5 h-5 text-login-accent' />,
    'Órdenes Múltiples': <ClipboardList className='w-5 h-5 text-login-accent' />,
    'Roles y Permisos': <ShieldCheck className='w-5 h-5 text-login-accent' />,
}

const getFeatureIcon = (title) => {
    const key = Object.keys(ICON_ELEMENTS).find((k) =>
        title.toLowerCase().includes(k.toLowerCase())
    )
    return ICON_ELEMENTS[key] || ICON_ELEMENTS['Punto de venta']
}

export const FeatureCarousel = ({ features }) => {
    const [current, setCurrent] = useState(0)
    const [paused, setPaused] = useState(false)

    const next = useCallback(() => {
        setCurrent((prev) => (prev + 1) % features.length)
    }, [features.length])

    useEffect(() => {
        if (paused || features.length <= 1) return
        const timer = setInterval(next, INTERVAL)
        return () => clearInterval(timer)
    }, [paused, features.length, next])

    if (!features.length) return null

    const feature = features[current]
    const featureTitle = feature.title || feature

    return (
        <div
            className='relative w-full'
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            <div className='min-h-[104px] flex items-center'>
                <AnimatePresence mode='wait'>
                    <Motion.div
                        key={current}
                        initial={{ opacity: 0, x: -24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 24 }}
                        transition={{ duration: 0.35 }}
                        className='flex items-start gap-4'
                    >
                        <div className='mt-0.5 flex-shrink-0 w-10 h-10 rounded-xl bg-login-accent/10 flex items-center justify-center border border-login-accent/30'>
                            {getFeatureIcon(featureTitle)}
                        </div>
                        <div>
                            <h4 className='text-base font-semibold text-white'>
                                {featureTitle}
                            </h4>
                            {feature.description && (
                                <p className='text-sm text-white/80 leading-relaxed'>
                                    {feature.description}
                                </p>
                            )}
                        </div>
                    </Motion.div>
                </AnimatePresence>
            </div>
            {features.length > 1 && (
                <div className='flex justify-center gap-1.5 mt-3'>
                    {features.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrent(i)}
                            className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                                i === current
                                    ? 'bg-login-accent w-5'
                                    : 'bg-white/30 hover:bg-white/50'
                            }`}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
