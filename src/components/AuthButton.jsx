// Authentication button component
import { useAuth } from '../contexts/AuthContext'
import './AuthButton.css'
import Button from './Button'

export default function AuthButton() {
  const { user, loading, signIn, signOut } = useAuth()

  if (loading) {
    return (
      <div className="auth-button loading">
        <span></span>
      </div>
    )
  }

  if (user) {
    return (
      <div className="auth-button authenticated">
        <span className="user-info">
          {user.avatar_url && (
            <img src={user.avatar_url} alt={user.username} className="user-avatar" />
          )}
          <span className="username">{user.username || user.email}</span>
        </span>
        <Button variant="secondary" size="sm" onClick={signOut} className="sign-out-button">
          Sign Out
        </Button>
      </div>
    )
  }

  return (
    <div className="auth-button">
      <Button variant="discord" onClick={signIn} className="sign-in-button">
        Sign in with Discord
      </Button>
    </div>
  )
}
