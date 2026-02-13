'use client'

// Authentication context for React
import { createContext, useContext, useState, useEffect } from 'react'
import { getSession, signInWithDiscord, signOut as apiSignOut, enrollBeta as apiEnrollBeta, refreshSession as apiRefreshSession, checkPatronStatus as apiCheckPatronStatus } from '../utils/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isPatron, setIsPatron] = useState(null) // null = loading, true/false = resolved

  useEffect(() => {
    // Load session on mount
    loadSession()
    
    // Also reload session when URL has auth=success (after Discord OAuth)
    // or auth=already_logged_in (if already had session)
    const urlParams = new URLSearchParams(window.location.search)
    const authParam = urlParams.get('auth')
    if (authParam === 'success' || authParam === 'already_logged_in') {
      // Small delay to ensure cookie is set
      setTimeout(() => {
        loadSession()
      }, 100)
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  async function loadSession() {
    try {
      const session = await getSession()
      setUser(session)
      if (session) {
        apiCheckPatronStatus().then(setIsPatron)
      } else {
        setIsPatron(false)
      }
    } catch (error) {
      console.error('Failed to load session:', error)
      setUser(null)
      setIsPatron(null)
    } finally {
      setLoading(false)
    }
  }

  async function signIn() {
    // Check if we already have a valid session
    const session = await getSession()
    if (session) {
      setUser(session)
      return
    }
    // No session, go through OAuth
    signInWithDiscord()
  }

  async function signOut() {
    await apiSignOut()
    setUser(null)
  }

  async function enrollBeta() {
    const updatedUser = await apiEnrollBeta()
    if (updatedUser) {
      setUser(updatedUser)
      return true
    }
    return false
  }

  async function refreshSession() {
    const updatedUser = await apiRefreshSession()
    if (updatedUser) {
      setUser(updatedUser)
      return true
    }
    return false
  }

  const value = {
    user,
    loading,
    isPatron,
    signIn,
    signOut,
    enrollBeta,
    refreshSession,
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
