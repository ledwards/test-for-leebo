'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import ReleaseNotes from './ReleaseNotes'
import Button from './Button'
import './LandingPage.css'

function LandingPage({ onSealedClick, onDraftClick }) {
  const { user, loading, signIn } = useAuth()
  const router = useRouter()
  const [activeDraft, setActiveDraft] = useState(null)

  // Check for active drafts when user is logged in
  useEffect(() => {
    if (!user || loading) {
      setActiveDraft(null)
      return
    }

    const checkActiveDrafts = async () => {
      try {
        const response = await fetch('/api/draft/history', {
          credentials: 'include',
        })
        if (response.ok) {
          const data = await response.json()
          // Find first active draft (waiting or active status)
          const active = data.pods?.find(
            pod => pod.status === 'waiting' || pod.status === 'leader_draft' || pod.status === 'pack_draft'
          )
          setActiveDraft(active || null)
        }
      } catch (err) {
        console.error('Failed to check active drafts:', err)
      }
    }

    checkActiveDrafts()
  }, [user, loading])

  return (
    <div className="landing-page">
      <ReleaseNotes />
      <div className="landing-content">
        <a href="/">
          <img className="landing-logo" src="/ptp_logo400.png" alt="Protect the Pod Logo" />
        </a>
        <h1 className="visually-hidden">Protect the Pod</h1>
        <h2 className="subtitle">
          The Star Wars Unlimited<br />
          Limited Simulator
        </h2>
        {activeDraft && (
          <div className="active-draft-banner">
            <span>You have an active Draft Pod.</span>
            <Button
              variant="primary"
              size="sm"
              className="rejoin-button"
              onClick={() => router.push(`/draft/${activeDraft.shareId}`)}
            >
              Rejoin?
            </Button>
          </div>
        )}
        <div className="mode-selection">
          <button className="mode-button sealed-button" onClick={onSealedClick}>
            Sealed
          </button>
          <button className="mode-button draft-button" onClick={onDraftClick}>
            Draft
          </button>
        </div>
        {!loading && !user && (
          <div className="landing-login">
            <Button variant="discord" className="landing-login-button" onClick={signIn}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"
                  fill="currentColor"
                />
              </svg>
              Login with Discord
            </Button>
          </div>
        )}
        {!loading && user && (
          <div className="landing-login">
            <a
              className="btn btn--discord landing-login-button"
              href="https://discord.gg/sHrwzGqRvg"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"
                  fill="currentColor"
                />
              </svg>
              Join the Discord
            </a>
            <p>For games, strategy, and feedback</p>
          </div>
        )}
      </div>
      <div className="landing-disclaimer">
        <p>Protect the Pod is in no way affiliated with Disney or Fantasy Flight Games. Star Wars characters, cards, logos, and art are property of Disney and/or Fantasy Flight Games.</p>
      </div>
    </div>
  )
}

export default LandingPage
