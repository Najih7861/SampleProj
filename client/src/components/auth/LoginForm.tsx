import { useState } from 'react'
import { authErrorMessage, login } from '../../api/auth'
import type { AuthUser } from '../../api/auth'

interface Props {
  onSuccess: (user: AuthUser) => void
  onCreateAccount: () => void
  onForgotPassword: () => void
}

export default function LoginForm({ onSuccess, onCreateAccount, onForgotPassword }: Props) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const user = await login({ username, password })
      onSuccess(user)
    } catch (err) {
      setError(authErrorMessage(err, 'Could not log in. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Welcome back</h2>
      {error && <div className="notice notice-error">{error}</div>}

      <div className="form-row">
        <label htmlFor="login-username">Username</label>
        <input id="login-username" required value={username}
          onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
      </div>
      <div className="form-row">
        <label htmlFor="login-password">Password</label>
        <input id="login-password" type="password" required value={password}
          onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
      </div>

      <button type="submit" className="btn-cta" disabled={submitting} style={{ width: '100%' }}>
        {submitting ? 'Logging in…' : 'Log In'}
      </button>

      <div className="auth-links">
        <button type="button" className="link-btn" onClick={onForgotPassword}>Forgot password?</button>
        <button type="button" className="link-btn" onClick={onCreateAccount}>Create account</button>
      </div>
    </form>
  )
}
