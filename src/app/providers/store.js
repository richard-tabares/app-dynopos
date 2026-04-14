import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useStore = create(
    persist(
        (set) => ({
            user: {},
            isMobile: false,
            setLogin: (payload) => set((state) => ({ user: payload })),
            setLogOut: (payload) => set((state) => ({ user: '' })),
            setIsMobile: (payload) => set((state) => ({ isMobile: payload })),
        }),
        {
            name: 'dynopos-store',
            // partialize: (state) => ({
            //     user: state.user,
            //     isMobile: state.isMobile,
            // }),
        },
    )
)
