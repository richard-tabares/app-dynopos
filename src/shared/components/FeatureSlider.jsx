import { useState, useEffect, useCallback } from 'react'
import { motion as Motion, AnimatePresence } from 'motion/react'
import { Check } from 'lucide-react'

const INTERVAL = 3500

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
                    className='min-h-[60px]'
                >
                    {slides[current].map((feature, i) => (
                        <div
                            key={i}
                            className='flex items-center gap-2 text-sm text-on-body py-0.5'
                        >
                            <Check className='w-4 h-4 text-green-500 flex-shrink-0' />
                            <span>{feature.title || feature}</span>
                        </div>
                    ))}
                </Motion.div>
            </AnimatePresence>
            {totalSlides > 1 && (
                <div className='flex justify-center gap-1.5 mt-2'>
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
