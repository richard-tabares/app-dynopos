import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useStore = create(
    persist(
        (set) => ({
            user: {},
            isMobile: false,
            products:[],
            setLogin: (payload) => set({ user: payload }),
            setLogOut: () => set({ user: '' }),
            setIsMobile: (payload) => set({ isMobile: payload }),
            setProducts: (payload) => set({ products: payload }),
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
