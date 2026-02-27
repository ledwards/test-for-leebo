// @ts-nocheck
'use client'

import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

export function usePresence(userId?: string): number {
  const [count, setCount] = useState(0)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!userId) return

    const socket = io()
    socketRef.current = socket

    socket.on('connect', () => {
      socket.emit('presence:join', userId)
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
