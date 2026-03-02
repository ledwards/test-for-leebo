// @ts-nocheck
'use client'

import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

export function usePresence(userId?: string): number {
  const [count, setCount] = useState(0)
  const socketRef = useRef<Socket | null>(null)

  // Always connect to receive the count (even for anonymous users)
  useEffect(() => {
    const socket = io()
    socketRef.current = socket

    socket.on('connect', () => {
      // Subscribe to count updates (all users)
      socket.emit('presence:subscribe')
      // Register as a counted user if logged in
      if (userId) {
        socket.emit('presence:join', userId)
      }
    })

    socket.on('presence:count', (data: { count: number }) => {
      setCount(data.count)
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [userId])

  return count
}
