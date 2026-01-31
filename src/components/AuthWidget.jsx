'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { fetchUserPools } from '../utils/poolApi'
import { useRouter, usePathname } from 'next/navigation'
import './AuthWidget.css'

export default function AuthWidget({ showOnlyWhenLoggedIn = false }) {
  const { user, loading, signIn, signOut } = useAuth()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [mostRecentSealed, setMostRecentSealed] = useState(null)
  const [currentDraft, setCurrentDraft] = useState(null)
  const [hasShowcases, setHasShowcases] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
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

  // Fetch recent pools and drafts when user is logged in and drawer opens
  useEffect(() => {
    if (user && drawerOpen && !loadingData) {
      setLoadingData(true)

      Promise.all([
        fetchUserPools(user.id),
        fetch('/api/draft/history', { credentials: 'include' }).then(r => r.json()),
        fetch(`/api/users/${user.id}/showcase-leaders?limit=1`).then(r => r.ok ? r.json() : { total: 0 })
      ])
        .then(([poolsData, draftData, showcaseData]) => {
          // Check if user has any showcase leaders
          const showcaseTotal = showcaseData?.data?.total || showcaseData?.total || 0
          setHasShowcases(showcaseTotal > 0)
          // Find most recent sealed pool (not draft type)
          const sealedPools = (poolsData || [])
            .filter(p => p.poolType !== 'draft')
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

          setMostRecentSealed(sealedPools[0] || null)

          // Find current or most recent draft
          const allDrafts = draftData?.data?.pods || draftData?.pods || []
          const sortedDrafts = allDrafts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

          // Find active draft first (waiting, leader_draft, pack_draft)
          const activeDraft = sortedDrafts.find(d =>
            d.status === 'waiting' || d.status === 'active'
          )

          if (activeDraft) {
            setCurrentDraft({ ...activeDraft, isActive: true })
          } else if (sortedDrafts[0]) {
            setCurrentDraft({ ...sortedDrafts[0], isActive: false })
          } else {
            setCurrentDraft(null)
          }
        })
        .catch(err => {
          console.error('Failed to fetch user data:', err)
          setMostRecentSealed(null)
          setCurrentDraft(null)
        })
        .finally(() => {
          setLoadingData(false)
        })
    }
  }, [user, drawerOpen])

  const handleSignOut = async () => {
    await signOut()
    setDrawerOpen(false)
  }

  const truncateName = (name, maxLength = 30) => {
    return name && name.length > maxLength ? name.substring(0, maxLength) + '...' : name
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
    // Build login URL with redirect back to current page
    const loginUrl = `/api/auth/login?redirect=${encodeURIComponent(pathname || '/')}`
    return (
      <div className="auth-widget">
        <a href={loginUrl} className="auth-widget-login-button" title="Login with Discord">
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
        </a>
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
              <a
                href="/sets"
                className="auth-widget-drawer-menu-item"
                onClick={(e) => {
                  e.preventDefault()
                  router.push('/sets')
                  setDrawerOpen(false)
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="12" y1="8" x2="12" y2="16"></line>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
                New Sealed Pool
              </a>

              <a
                href="/draft"
                className="auth-widget-drawer-menu-item"
                onClick={(e) => {
                  e.preventDefault()
                  router.push('/draft')
                  setDrawerOpen(false)
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <line x1="19" y1="8" x2="19" y2="14"></line>
                  <line x1="22" y1="11" x2="16" y2="11"></line>
                </svg>
                New Draft Pod
              </a>

              {(loadingData || mostRecentSealed || currentDraft) && (
                <div className="auth-widget-drawer-divider"></div>
              )}

              {loadingData && (
                <div className="auth-widget-drawer-menu-item auth-widget-loading-pools">
                  Loading...
                </div>
              )}

              {!loadingData && mostRecentSealed && (
                <a
                  href={`/pool/${mostRecentSealed.shareId}/deck`}
                  className="auth-widget-drawer-menu-item auth-widget-drawer-pool-item"
                  onClick={() => setDrawerOpen(false)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                  <span>{truncateName(mostRecentSealed.name) || 'Last Sealed Pool'}</span>
                </a>
              )}

              {!loadingData && currentDraft && (
                <a
                  href={`/draft/${currentDraft.shareId}`}
                  className="auth-widget-drawer-menu-item auth-widget-drawer-pool-item"
                  onClick={() => setDrawerOpen(false)}
                >
                  {currentDraft.isActive ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polygon points="10 8 16 12 10 16 10 8" fill="currentColor"></polygon>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                  )}
                  <span>
                    {currentDraft.isActive
                      ? (truncateName(currentDraft.draftName) || 'Current Draft Pod')
                      : (truncateName(currentDraft.draftName) || 'Most Recent Draft')
                    }
                  </span>
                </a>
              )}

              <div className="auth-widget-drawer-divider"></div>

              {hasShowcases && (
                <a
                  href="/showcases"
                  className="auth-widget-drawer-menu-item auth-widget-showcases-item"
                  onClick={(e) => {
                    e.preventDefault()
                    router.push('/showcases')
                    setDrawerOpen(false)
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L9 9l-7 1 5 5-1.5 7L12 18l6.5 4L17 15l5-5-7-1-3-7z" fill="currentColor" opacity="0.3"/>
                    <path d="M12 2L9 9l-7 1 5 5-1.5 7L12 18l6.5 4L17 15l5-5-7-1-3-7z"/>
                    <line x1="2" y1="2" x2="5" y2="5" strokeLinecap="round"/>
                  </svg>
                  Showcases
                </a>
              )}

              <a
                href="/history"
                className="auth-widget-drawer-menu-item"
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
                History
              </a>

              <a
                href="/"
                className="auth-widget-drawer-menu-item"
                onClick={(e) => {
                  e.preventDefault()
                  router.push('/')
                  setDrawerOpen(false)
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                Home
              </a>

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
