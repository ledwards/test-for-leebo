// Authentication button component
import { useAuth } from '../contexts/AuthContext'
import './AuthButton.css'

export default function AuthButton() {
  const { user, loading, signIn, signOut } = useAuth()

  if (loading) {
    return (
      <div className="auth-button loading">
        <span>Loading...</span>
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
        <button onClick={signOut} className="sign-out-button">
          Sign Out
        </button>
      </div>
    )
  }

  return (
    <div className="auth-button">
      <button onClick={signIn} className="sign-in-button">
        Sign in with Discord
      </button>
    </div>
  )
}
