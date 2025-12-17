/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { User } from '@/lib/types'
import { authApi } from '@/lib/api'

interface AuthContextType {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (email: string, password: string) => Promise<void>
    register: (email: string, password: string, name: string) => Promise<void>
    logout: () => Promise<void>
    updateProfile: (data: { name?: string; email?: string }) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const queryClient = useQueryClient()

    // Fetch user profile on mount
    const { data: profileData, isLoading } = useQuery({
        queryKey: ['auth', 'profile'],
        queryFn: authApi.getProfile,
        retry: false,
        enabled: true,
    })

    // Derive user state from query data (no useEffect needed)
    const user = profileData?.success && profileData.data
        ? {
            id: profileData.data._id,
            email: profileData.data.email,
            name: profileData.data.name,
            createdAt: new Date(profileData.data.createdAt),
        }
        : null

    // Login mutation
    const loginMutation = useMutation({
        mutationFn: ({ email, password }: { email: string; password: string }) =>
            authApi.login(email, password),
        onSuccess: (data) => {
            if (data.success && data.data?.user) {
                queryClient.setQueryData(['auth', 'profile'], data)
                queryClient.invalidateQueries({ queryKey: ['auth'] })
            }
        },
    })

    // Register mutation
    const registerMutation = useMutation({
        mutationFn: ({
            email,
            password,
            name,
        }: {
            email: string
            password: string
            name: string
        }) => authApi.register(email, password, name),
        onSuccess: (data) => {
            if (data.success && data.data?.user) {
                queryClient.setQueryData(['auth', 'profile'], data)
                queryClient.invalidateQueries({ queryKey: ['auth'] })
            }
        },
    })

    // Update profile mutation
    const updateProfileMutation = useMutation({
        mutationFn: (data: { name?: string; email?: string }) => authApi.updateProfile(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['auth', 'profile'] })
        },
    })

    // Logout mutation
    const logoutMutation = useMutation({
        mutationFn: authApi.logout,
        onSuccess: () => {
            queryClient.clear()
        },
    })

    const login = useCallback(
        async (email: string, password: string) => {
            await loginMutation.mutateAsync({ email, password })
        },
        [loginMutation]
    )

    const register = useCallback(
        async (email: string, password: string, name: string) => {
            await registerMutation.mutateAsync({ email, password, name })
        },
        [registerMutation]
    )

    const logout = useCallback(async () => {
        await logoutMutation.mutateAsync()
    }, [logoutMutation])

    const updateProfile = useCallback(
        async (data: { name?: string; email?: string }) => {
            await updateProfileMutation.mutateAsync(data)
        },
        [updateProfileMutation]
    )

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                register,
                logout,
                updateProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
