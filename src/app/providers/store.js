import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getActiveVariations } from '../../shared/helpers/productHelpers'

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

const _nextAvailableLabel = (state) => {
    const used = new Set()
    if (state.currentLabel !== null) used.add(state.currentLabel)
    for (const o of state.pendingOrders) used.add(o.label)
    let n = 1
    while (used.has(n)) n++
    return n
}

export const useStore = create(
    persist(
        (set, get) => ({
            user: {},
            token: null,
            refreshToken: null,
            sessionExpired: false,
            isCollapsed: false,
            isMobile: false,
            isDarkMode: true,
            products: [],
            cart: [],
            todayRevenue: 0,
            categories: [],
            unitsOfMeasure: [],
            pendingOrders: [],
            currentLabel: null,
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
                    sessionExpired: false,
                    cart: [],
                    pendingOrders: [],
                    currentLabel: null,
                }),
            setSessionExpired: (payload) => set({ sessionExpired: payload }),
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
            setProfile: (payload) =>
                set((state) => ({
                    user: {
                        ...state.user,
                        profile: { ...state.user.profile, ...payload },
                    },
                })),
            setIsMobile: (payload) => set({ isMobile: payload }),
            toggleDarkMode: () =>
                set((state) => ({ isDarkMode: !state.isDarkMode })),
            setIsCollapsed: (payload) => set({ isCollapsed: payload }),
            setProducts: (payload) => set({ products: payload }),
            addToCart: (product, variation = null, unitOptions = null) =>
                set((state) => {
                    const v = variation || getActiveVariations(product)[0]
                    if (!v) return state

                    const cartKey = `${product.id}-${v.id}`
                    const existingItem = state.cart.find(
                        (item) => item.cartKey === cartKey,
                    )
                    if (existingItem) {
                        if (unitOptions) {
                            return {
                                cart: state.cart.map((item) =>
                                    item.cartKey === cartKey
                                        ? {
                                            ...item,
                                            quantity: item.quantity + unitOptions.quantity,
                                            soldInUnitId: unitOptions.soldInUnitId,
                                            displayUnit: unitOptions.displayUnit,
                                            conversionFactor: unitOptions.conversionFactor,
                                            basePrice: unitOptions.basePrice,
                                            price: unitOptions.effectivePrice,
                                        }
                                        : item,
                                ),
                            }
                        }
                        return {
                            cart: state.cart.map((item) =>
                                item.cartKey === cartKey
                                    ? { ...item, quantity: item.quantity + 1 }
                                    : item,
                            ),
                        }
                    }
                    const displayName = v.variation_name === 'Default'
                        ? product.name
                        : `${product.name} - ${v.variation_name}`
                    const cartItem = {
                        ...product,
                        id: cartKey,
                        cartKey,
                        product_id: product.id,
                        price: unitOptions ? unitOptions.effectivePrice : v.price,
                        stock: v.stock,
                        variation_id: v.id,
                        variation_name: v.variation_name,
                        variation_sku: v.sku,
                        variation_barcode: v.barcode,
                        track_stock: v.track_stock,
                        name: displayName,
                        soldInUnitId: unitOptions ? unitOptions.soldInUnitId : null,
                        displayUnit: unitOptions ? unitOptions.displayUnit : '',
                        conversionFactor: unitOptions ? unitOptions.conversionFactor : 1,
                        basePrice: unitOptions ? unitOptions.basePrice : v.price,
                    }
                    return {
                        cart: [...state.cart, { ...cartItem, quantity: unitOptions ? unitOptions.quantity : 1 }],
                    }
                }),
            removeFromCart: (cartKey) => {
                const { cart } = get()
                const updated = cart.filter((item) => item.cartKey !== cartKey)
                set({
                    cart: updated,
                    currentLabel: updated.length === 0 ? null : get().currentLabel,
                })
            },
            updateQuantity: (cartKey, quantity) =>
                set((state) => ({
                    cart: state.cart.map((item) =>
                        item.cartKey === cartKey
                            ? { ...item, quantity: Math.max(1, quantity) }
                            : item,
                    ),
                })),
            clearCart: () => set({ cart: [], currentLabel: null }),
            setTodayRevenue: (payload) => set({ todayRevenue: payload }),
            setCategories: (payload) => set({ categories: payload }),
            setUnitsOfMeasure: (payload) => set({ unitsOfMeasure: payload }),
            saleDate: new Date().toLocaleDateString('en-CA'),
            setSaleDate: (payload) => set({ saleDate: payload }),

            // ---- Multi-order (tabs) actions ----

            initCurrentOrder: () => {
                set((state) => ({
                    currentLabel: _nextAvailableLabel(state),
                }))
            },

            holdCurrentOrder: () => {
                const { cart, saleDate, currentLabel } = get()
                if (cart.length === 0 || currentLabel === null) return

                const newPending = {
                    label: currentLabel,
                    cart: [...cart],
                    saleDate,
                }

                set((state) => ({
                    pendingOrders: [...state.pendingOrders, newPending],
                    cart: [],
                    saleDate: new Date().toLocaleDateString('en-CA'),
                    currentLabel: _nextAvailableLabel(state),
                }))
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
                const { pendingOrders } = get()

                if (pendingOrders.length > 0) {
                    set((state) => ({
                        cart: [],
                        saleDate: new Date().toLocaleDateString('en-CA'),
                        currentLabel: _nextAvailableLabel({ ...state, currentLabel: null }),
                    }))
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
