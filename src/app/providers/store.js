import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const migrateToken = () => {
    try {
        const raw = localStorage.getItem('dynopos-store')
        if (raw) {
            const parsed = JSON.parse(raw)
            const state = parsed?.state
            if (state?.user?.data?.session) {
                if (!state.token && state.user.data.session.access_token) {
                    state.token = state.user.data.session.access_token
                }
                if (!state.refreshToken && state.user.data.session.refresh_token) {
                    state.refreshToken = state.user.data.session.refresh_token
                }
                if (state.token || state.refreshToken) {
                    localStorage.setItem('dynopos-store', JSON.stringify(parsed))
                }
            }
        }
    } catch {
        // Ignore parse errors
    }
}

migrateToken()

export const useStore = create(
    persist(
        (set, get) => ({
            user: {},
            token: null,
            refreshToken: null,
            isCollapsed: false,
            isMobile: false,
            isDarkMode: false,
            products: [],
            cart: [],
            todayRevenue: 0,
            categories: [],
            pendingOrders: [],
            currentLabel: null,
            nextLabel: 1,
            setLogin: (payload) =>
                set({
                    user: payload,
                    token: payload?.access_token || null,
                    refreshToken: payload?.data?.session?.refresh_token || null,
                }),
            setLogOut: () =>
                set({
                    user: '',
                    token: null,
                    refreshToken: null,
                    cart: [],
                    pendingOrders: [],
                    currentLabel: null,
                    nextLabel: 1,
                }),
            setToken: (token) => set({ token }),
            setRefreshToken: (refreshToken) => set({ refreshToken }),
            setSubscription: (payload) =>
                set((state) => ({
                    user: { ...state.user, subscription: payload },
                })),
            setBusiness: (payload) =>
                set((state) => ({
                    user: {
                        ...state.user,
                        business: { ...state.user.business, ...payload },
                    },
                })),
            setIsMobile: (payload) => set({ isMobile: payload }),
            toggleDarkMode: () =>
                set((state) => ({ isDarkMode: !state.isDarkMode })),
            setIsCollapsed: (payload) => set({ isCollapsed: payload }),
            setProducts: (payload) => set({ products: payload }),
            addToCart: (product) =>
                set((state) => {
                    const existingItem = state.cart.find(
                        (item) => item.id === product.id,
                    )
                    if (existingItem) {
                        return {
                            cart: state.cart.map((item) =>
                                item.id === product.id
                                    ? { ...item, quantity: item.quantity + 1 }
                                    : item,
                            ),
                        }
                    }
                    return {
                        cart: [...state.cart, { ...product, quantity: 1 }],
                    }
                }),
            removeFromCart: (productId) => {
                const { cart } = get()
                const updated = cart.filter((item) => item.id !== productId)
                set({
                    cart: updated,
                    currentLabel: updated.length === 0 ? null : get().currentLabel,
                })
            },
            updateQuantity: (productId, quantity) =>
                set((state) => ({
                    cart: state.cart.map((item) =>
                        item.id === productId
                            ? { ...item, quantity: Math.max(1, quantity) }
                            : item,
                    ),
                })),
            clearCart: () => set({ cart: [], currentLabel: null }),
            setTodayRevenue: (payload) => set({ todayRevenue: payload }),
            setCategories: (payload) => set({ categories: payload }),
            saleDate: new Date().toLocaleDateString('en-CA'),
            setSaleDate: (payload) => set({ saleDate: payload }),

            // ---- Multi-order (tabs) actions ----

            initCurrentOrder: () => {
                const { nextLabel } = get()
                set({
                    currentLabel: nextLabel,
                    nextLabel: nextLabel + 1,
                })
            },

            holdCurrentOrder: () => {
                const { cart, saleDate, currentLabel, nextLabel } = get()
                if (cart.length === 0 || currentLabel === null) return

                const newPending = {
                    label: currentLabel,
                    cart: [...cart],
                    saleDate,
                }

                set({
                    pendingOrders: [...get().pendingOrders, newPending],
                    cart: [],
                    saleDate: new Date().toLocaleDateString('en-CA'),
                    currentLabel: nextLabel,
                    nextLabel: nextLabel + 1,
                })
            },

            switchToOrder: (label) => {
                const { cart, saleDate, currentLabel, pendingOrders } = get()
                const target = pendingOrders.find((o) => o.label === label)
                if (!target || label === currentLabel) return

                const remaining = pendingOrders.filter(
                    (o) => o.label !== label,
                )

                if (cart.length > 0 && currentLabel !== null) {
                    remaining.push({
                        label: currentLabel,
                        cart: [...cart],
                        saleDate,
                    })
                }

                set({
                    cart: [...target.cart],
                    saleDate: target.saleDate,
                    currentLabel: label,
                    pendingOrders: remaining,
                })
            },

            removePendingOrder: (label) => {
                set((state) => ({
                    pendingOrders: state.pendingOrders.filter(
                        (o) => o.label !== label,
                    ),
                }))
            },

            finalizeCurrentOrder: () => {
                const { pendingOrders, nextLabel } = get()

                if (pendingOrders.length > 0) {
                    set({
                        cart: [],
                        saleDate: new Date().toLocaleDateString('en-CA'),
                        currentLabel: nextLabel,
                        nextLabel: nextLabel + 1,
                    })
                } else {
                    set({
                        cart: [],
                        currentLabel: null,
                    })
                }
            },

            resetOrderState: () => {
                set({
                    cart: [],
                    pendingOrders: [],
                    currentLabel: null,
                    nextLabel: 1,
                })
            },
        }),
        {
            name: 'dynopos-store',
            // partialize: (state) => ({
            //     user: state.user,
            //     isMobile: state.isMobile,
            // }),
        },
    ),
)
