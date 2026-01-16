'use client'

// Authentication context for React
import { createContext, useContext, useState, useEffect } from 'react'
import { getSession, signInWithDiscord, signOut as apiSignOut } from '../utils/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load session on mount
    loadSession()
  }, [])

  async function loadSession() {
    try {
      const session = await getSession()
      setUser(session)
    } catch (error) {
      console.error('Failed to load session:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  async function signIn() {
    signInWithDiscord()
  }

  async function signOut() {
    await apiSignOut()
    setUser(null)
  }

  const value = {
    user,
    loading,
    signIn,
    signOut,
    refreshSession: loadSession,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
