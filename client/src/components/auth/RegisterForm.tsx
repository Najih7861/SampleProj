import { useState } from 'react'
import { authErrorMessage, register } from '../../api/auth'
import type { AuthUser } from '../../api/auth'

interface Props {
  onSuccess: (user: AuthUser) => void
  onAlreadyHaveAccount: () => void
}

export default function RegisterForm({ onSuccess, onAlreadyHaveAccount }: Props) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const user = await register({ username, email, password })
      onSuccess(user)
    } catch (err) {
      setError(authErrorMessage(err, 'Could not create your account. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create your account</h2>
      {error && <div className="notice notice-error">{error}</div>}

      <div className="form-row">
        <label htmlFor="reg-username">Username</label>
        <input id="reg-username" required value={username}
          onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
      </div>
      <div className="form-row">
        <label htmlFor="reg-email">Email</label>
        <input id="reg-email" type="email" required value={email}
          onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
      </div>
      <div className="form-row">
        <label htmlFor="reg-password">Password</label>
        <input id="reg-password" type="password" required minLength={6} value={password}
          onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
        <span className="muted" style={{ fontSize: '0.8rem' }}>At least 6 characters.</span>
      </div>

      <button type="submit" className="btn-cta" disabled={submitting} style={{ width: '100%' }}>
        {submitting ? 'Creating…' : 'Create Account'}
      </button>

      <div className="auth-links" style={{ justifyContent: 'center' }}>
        <span className="muted">Already have an account?</span>
        <button type="button" className="link-btn" onClick={onAlreadyHaveAccount}>Log in</button>
      </div>
    </form>
  )
}
