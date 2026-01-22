'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { fetchUserPools } from '../utils/poolApi'
import { useRouter, usePathname } from 'next/navigation'
import './AuthWidget.css'

export default function AuthWidget({ showOnlyWhenLoggedIn = false }) {
  const { user, loading, signIn, signOut } = useAuth()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [recentPools, setRecentPools] = useState([])
  const [loadingPools, setLoadingPools] = useState(false)
  const drawerRef = useRef(null)
  const router = useRouter()
  const pathname = usePathname()

  // Close drawer when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (drawerRef.current && !drawerRef.current.contains(event.target)) {
        setDrawerOpen(false)
      }
    }

    if (drawerOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [drawerOpen])

  // Close drawer on escape key
  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape' && drawerOpen) {
        setDrawerOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [drawerOpen])

  // Fetch recent pools when user is logged in and drawer opens
  useEffect(() => {
    if (user && drawerOpen && !loadingPools) {
      setLoadingPools(true)
      fetchUserPools(user.id)
        .then(pools => {
          // Get last 5 pools, sorted by created_at descending
          const sorted = pools.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          setRecentPools(sorted.slice(0, 5))
        })
        .catch(err => {
          console.error('Failed to fetch user pools:', err)
          setRecentPools([])
        })
        .finally(() => {
          setLoadingPools(false)
        })
    }
  }, [user, drawerOpen])

  const handleSignOut = async () => {
    await signOut()
    setDrawerOpen(false)
  }

  if (loading) {
    if (showOnlyWhenLoggedIn) {
      return null
    }
    return (
      <div className="auth-widget">
        <div className="auth-widget-loading">...</div>
      </div>
    )
  }

  // If showOnlyWhenLoggedIn is true, only show when logged in
  if (!user) {
    if (showOnlyWhenLoggedIn) {
      return null
    }
    return (
      <div className="auth-widget">
        <button className="auth-widget-login-button" onClick={signIn} title="Login with Discord">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div className="auth-widget" ref={drawerRef}>
      <button
        className="auth-widget-avatar-button"
        onClick={() => setDrawerOpen(!drawerOpen)}
        aria-label="User menu"
      >
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={user.username || 'User'}
            className="auth-widget-avatar"
          />
        ) : (
          <div className="auth-widget-avatar-placeholder">
            {user.username?.[0]?.toUpperCase() || 'U'}
          </div>
        )}
      </button>

      {drawerOpen && (
        <>
          <div
            className="auth-widget-drawer-overlay"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="auth-widget-drawer">
            <div className="auth-widget-drawer-header">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.username || 'User'}
                  className="auth-widget-drawer-avatar"
                />
              ) : (
                <div className="auth-widget-drawer-avatar-placeholder">
                  {user.username?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <div className="auth-widget-drawer-user-info">
                <div className="auth-widget-drawer-username">
                  {user.username || 'User'}
                </div>
                {user.email && (
                  <div className="auth-widget-drawer-email">
                    {user.email}
                  </div>
                )}
              </div>
            </div>

            <div className="auth-widget-drawer-menu">
              {(loadingPools || recentPools.length > 0) && (
                <>
                  <a
                    href="/history"
                    className="auth-widget-drawer-menu-header"
                    onClick={(e) => {
                      e.preventDefault()
                      router.push('/history')
                      setDrawerOpen(false)
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>History</span>
                  </a>
                  {loadingPools && (
                    <div className="auth-widget-drawer-menu-item auth-widget-loading-pools">
                      Loading...
                    </div>
                  )}
                  {!loadingPools && recentPools.map((pool) => {
                    const isOnDeckPage = pathname?.includes('/deck')
                    const poolUrl = isOnDeckPage
                      ? `/pool/${pool.shareId}/deck`
                      : `/pool/${pool.shareId}`

                    // Truncate name to 35 characters for display
                    const fullName = pool.name || `${pool.setCode} ${pool.poolType === 'draft' ? 'Draft' : 'Sealed'}`
                    const displayName = fullName.length > 35 ? fullName.substring(0, 35) + '...' : fullName

                    // Format creation time
                    const createdAt = new Date(pool.createdAt)
                    const month = String(createdAt.getMonth() + 1).padStart(2, '0')
                    const day = String(createdAt.getDate()).padStart(2, '0')
                    let hours = createdAt.getHours()
                    const minutes = String(createdAt.getMinutes()).padStart(2, '0')
                    const ampm = hours >= 12 ? 'PM' : 'AM'
                    hours = hours % 12
                    hours = hours ? hours : 12
                    const timeStr = `${month}/${day} ${hours}:${minutes} ${ampm}`

                    return (
                      <a
                        key={pool.id}
                        href={poolUrl}
                        className="auth-widget-drawer-menu-item auth-widget-drawer-pool-item"
                        onClick={() => setDrawerOpen(false)}
                      >
                        <div className="auth-widget-pool-item-content">
                          <span className="auth-widget-pool-name">{displayName}</span>
                          <span className="auth-widget-pool-time">{timeStr}</span>
                        </div>
                      </a>
                    )
                  })}
                  {!loadingPools && recentPools.length > 0 && (
                    <a
                      href="/history"
                      className="auth-widget-drawer-menu-item more-link"
                      onClick={(e) => {
                        e.preventDefault()
                        router.push('/history')
                        setDrawerOpen(false)
                      }}
                    >
                      More...
                    </a>
                  )}
                </>
              )}
              <button
                className="auth-widget-drawer-menu-item"
                onClick={handleSignOut}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
