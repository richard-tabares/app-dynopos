import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const migrateToken = () => {
    try {
        const raw = localStorage.getItem('dynopos-store')
        if (raw) {
            const parsed = JSON.parse(raw)
            const state = parsed?.state
            if (state && !state.token && state.user?.data?.session?.access_token) {
                state.token = state.user.data.session.access_token
                localStorage.setItem('dynopos-store', JSON.stringify(parsed))
            }
        }
    } catch {}
}

migrateToken()

export const useStore = create(
    persist(
        (set) => ({
            user: {},
            token: null,
            isMobile: false,
            products:[],
            cart: [],
            todayRevenue: 0,
            categories: [],
            setLogin: (payload) => set({ user: payload, token: payload?.access_token || null }),
            setLogOut: () => set({ user: '', token: null, cart:[] }),
            setToken: (token) => set({ token }),
            setBusiness: (payload) => set((state) => ({
                user: { ...state.user, business: { ...state.user.business, ...payload } }
            })),
            setIsMobile: (payload) => set({ isMobile: payload }),
            setIsCollapsed: (payload) => set({ isCollapsed: payload }),
            setProducts: (payload) => set({ products: payload }),
            addToCart: (product) => set((state) => {
                const existingItem = state.cart.find(item => item.id === product.id)
                if (existingItem) {
                    return {
                        cart: state.cart.map(item =>
                            item.id === product.id
                                ? { ...item, quantity: item.quantity + 1 }
                                : item
                        )
                    }
                }
                return { cart: [...state.cart, { ...product, quantity: 1 }] }
            }),
            removeFromCart: (productId) => set((state) => ({
                cart: state.cart.filter(item => item.id !== productId)
            })),
            updateQuantity: (productId, quantity) => set((state) => ({
                cart: state.cart.map(item =>
                    item.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
                )
            })),
            clearCart: () => set({ cart: [] }),
            setTodayRevenue: (payload) => set({ todayRevenue: payload }),
            setCategories: (payload) => set({ categories: payload }),
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
