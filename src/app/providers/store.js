import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useStore = create(
    persist(
        (set) => ({
            user: {},
            isMobile: false,
            products:[],
            cart: [],
            setLogin: (payload) => set({ user: payload }),
            setLogOut: () => set({ user: '' }),
            setIsMobile: (payload) => set({ isMobile: payload }),
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
