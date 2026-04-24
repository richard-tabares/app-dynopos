import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useStore = create(
    persist(
        (set) => ({
            user: {},
            isMobile: false,
            products:[],
            setLogin: (payload) => set((state) => ({ user: payload })),
            setLogOut: (payload) => set((state) => ({ user: '' })),
            setIsMobile: (payload) => set((state) => ({ isMobile: payload })),
            setProducts: (payload) => set((state) => ({ products: payload })),
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
