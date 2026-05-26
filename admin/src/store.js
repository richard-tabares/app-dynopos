import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useStore = create(
    persist(
        (set) => ({
            user: {},
            profile: {},
            token: null,
            refreshToken: null,
            isCollapsed: false,
            isMobile: false,
            isDarkMode: true,

            setLogin: (payload) =>
                set({
                    user: payload.user,
                    profile: payload.profile,
                    token: payload.access_token || null,
                    refreshToken: payload.refresh_token || null,
                }),
            setLogOut: () =>
                set({
                    user: {},
                    profile: {},
                    token: null,
                    refreshToken: null,
                }),
            setToken: (token) => set({ token }),
            setRefreshToken: (refreshToken) => set({ refreshToken }),
            setIsMobile: (payload) => set({ isMobile: payload }),
            toggleDarkMode: () =>
                set((state) => ({ isDarkMode: !state.isDarkMode })),
            setIsCollapsed: (payload) => set({ isCollapsed: payload }),
        }),
        {
            name: 'dynopos-admin-store',
        },
    ),
)
