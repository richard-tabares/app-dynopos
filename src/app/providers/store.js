import { create } from 'zustand'

export const useStore = create((set) => ({
    isMobile: false,
    setIsMobile: (payload) => set((state) => ({ isMobile: payload })),
}))
