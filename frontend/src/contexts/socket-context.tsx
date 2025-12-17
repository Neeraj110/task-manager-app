/* eslint-disable react-refresh/only-export-components */

import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import type { SocketNotification } from '@/lib/realtime'
import { useAuth } from './auth-context'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

interface SocketContextType {
    socket: Socket | null
    isConnected: boolean
    notifications: SocketNotification[]
    onlineUsers: string[]
    addNotification: (notification: SocketNotification) => void
    clearNotifications: () => void
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const [socket, setSocket] = useState<Socket | null>(null)
    const [isConnected, setIsConnected] = useState(false)
    const [notifications, setNotifications] = useState<SocketNotification[]>([])
    const [onlineUsers, setOnlineUsers] = useState<string[]>([])
    const { user, isAuthenticated } = useAuth()
    const socketRef = useRef<Socket | null>(null)
    const queryClient = useQueryClient()

    useEffect(() => {
        // Clean up previous socket connection
        if (socketRef.current) {
            socketRef.current.disconnect()
            socketRef.current = null
        }

        if (!isAuthenticated || !user) {
            // Don't connect if not authenticated
            return
        }

        // Initialize socket connection
        const newSocket = io(SOCKET_URL, {
            withCredentials: true,
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        })

        socketRef.current = newSocket

        // Connection event handlers
        newSocket.on('connect', () => {
            console.log('✅ Socket connected:', newSocket.id)
            setSocket(newSocket)
            setIsConnected(true)

            // Register user with the server
            newSocket.emit('register', {
                userId: user.id,
                userName: user.name,
            })

            // Auto-join dashboard room for task updates
            newSocket.emit('join:dashboard')
        })

        newSocket.on('disconnect', () => {
            console.log('❌ Socket disconnected')
            setIsConnected(false)
        })

        newSocket.on('connect_error', (error) => {
            console.error('❌ Socket connection error:', error.message)
            setIsConnected(false)
        })

        // Listen for online users updates
        newSocket.on('onlineUsers', (users: string[]) => {
            console.log('👥 Online users:', users)
            setOnlineUsers(users)
        })

        // Listen for task updates
        newSocket.on('task:created', (data) => {
            console.log('📝 Task created via socket:', data)
            // Invalidate all relevant queries for real-time updates
            queryClient.invalidateQueries({ queryKey: ["tasks"] })
            queryClient.invalidateQueries({ queryKey: ["dashboard"] })
            queryClient.invalidateQueries({ queryKey: ["notifications"] })

            // Show toast notification for other users
            const creatorName = data.creatorId?.name || 'Someone'
            if (data.creatorId?._id !== user?.id) {
                toast.info(`${creatorName} created a new task: "${data.title}"`)
            }
        })

        newSocket.on('task:updated', (data) => {
            console.log('✏️ Task updated via socket:', data)
            // Invalidate all relevant queries for real-time updates
            queryClient.invalidateQueries({ queryKey: ["tasks"] })
            queryClient.invalidateQueries({ queryKey: ["dashboard"] })

            // Show toast notification
            toast.info(`Task "${data.title}" was updated`)
        })

        newSocket.on('task:deleted', (data) => {
            console.log('🗑️ Task deleted via socket:', data)
            // Invalidate all relevant queries for real-time updates
            queryClient.invalidateQueries({ queryKey: ["tasks"] })
            queryClient.invalidateQueries({ queryKey: ["dashboard"] })
        })

        // Listen for assignment notifications
        newSocket.on('notification:assignment', (notification: SocketNotification) => {
            console.log('🔔 Assignment notification:', notification)
            setNotifications((prev) => [notification, ...prev])

            // Invalidate notifications query
            queryClient.invalidateQueries({ queryKey: ["notifications"] })

            // Show toast notification
            toast.success(`New Task Assigned`, {
                description: `${notification.assignedByName} assigned you to: "${notification.taskTitle}"`,
                duration: 5000,
            })

            // Show browser notification if permission granted
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('New Task Assignment', {
                    body: `${notification.assignedByName} assigned you to: ${notification.taskTitle}`,
                    icon: '/favicon.ico',
                })
            }
        })

        // Cleanup on unmount or when auth changes
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect()
                socketRef.current = null
            }
            setSocket(null)
            setIsConnected(false)
        }
    }, [isAuthenticated, user])

    // Request notification permission on mount
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission()
        }
    }, [])

    const addNotification = (notification: SocketNotification) => {
        setNotifications((prev) => [notification, ...prev])
    }

    const clearNotifications = () => {
        setNotifications([])
    }

    return (
        <SocketContext.Provider
            value={{
                socket,
                isConnected,
                notifications,
                onlineUsers,
                addNotification,
                clearNotifications,
            }}
        >
            {children}
        </SocketContext.Provider>
    )
}

export function useSocket() {
    const context = useContext(SocketContext)
    if (context === undefined) {
        throw new Error('useSocket must be used within a SocketProvider')
    }
    return context
}
