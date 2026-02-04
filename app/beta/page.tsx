// @ts-nocheck
'use client'

import { useAuth } from '@/src/contexts/AuthContext'
import Button from '@/src/components/Button'
import { useRouter } from 'next/navigation'
import './page.css'

export default function BetaPage() {
  const { user, loading, signIn, enrollBeta } = useAuth()
  const router = useRouter()

  const hasBetaAccess = user?.is_beta_tester || user?.is_admin

  const handleJoinBeta = async () => {
    const success = await enrollBeta()
    if (success) {
      router.push('/sets')
    }
  }

  if (loading) {
    return (
      <div className="beta-page">
        <div className="beta-container">
          <div className="loading">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="beta-page">
      <div className="beta-container">
        <h1>Beta Program</h1>

        <div className="beta-info">
          <div className="beta-features">
            <h3>Early Access</h3>
            <ul>
              <li><strong>A Lawless Time (LAW)</strong> - Set 7</li>
              <li>New pack generation rules</li>
            </ul>
          </div>
        </div>

        <div className="beta-actions">
          {!user && (
            <>
              <p className="beta-prompt">Sign in to join the beta.</p>
              <Button variant="discord" onClick={signIn}>
                Sign in with Discord
              </Button>
            </>
          )}

          {user && !hasBetaAccess && (
            <Button variant="primary" size="lg" onClick={handleJoinBeta}>
              Join the Beta
            </Button>
          )}

          {user && hasBetaAccess && (
            <div className="beta-success">
              <span className="checkmark">✓</span>
              <span>You have beta access</span>
            </div>
          )}
        </div>

        <div className="beta-footer">
          <Button variant="back" onClick={() => router.push('/')}>
            Back
          </Button>
        </div>
      </div>
    </div>
  )
}
