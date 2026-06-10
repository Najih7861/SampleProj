import { useState } from 'react'
import { authErrorMessage, forgotPassword } from '../../api/auth'

interface Props {
  onBackToLogin: () => void
}

export default function ForgotPasswordForm({ onBackToLogin }: Props) {
  const [username, setUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (newPassword !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setSubmitting(true)
    try {
      const res = await forgotPassword({ username, newPassword })
      setDone(res.message)
    } catch (err) {
      setError(authErrorMessage(err, 'Could not reset your password. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div>
        <h2>Password reset</h2>
        <div className="notice notice-success">{done}</div>
        <button type="button" className="btn-primary" onClick={onBackToLogin} style={{ width: '100%' }}>
          Back to Log In
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Reset your password</h2>
      <p className="muted" style={{ marginTop: 0 }}>
        Enter your username and a new password.
      </p>
      {error && <div className="notice notice-error">{error}</div>}

      <div className="form-row">
        <label htmlFor="fp-username">Username</label>
        <input id="fp-username" required value={username}
          onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
      </div>
      <div className="form-row">
        <label htmlFor="fp-new">New password</label>
        <input id="fp-new" type="password" required minLength={6} value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" />
      </div>
      <div className="form-row">
        <label htmlFor="fp-confirm">Confirm new password</label>
        <input id="fp-confirm" type="password" required minLength={6} value={confirm}
          onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
      </div>

      <button type="submit" className="btn-cta" disabled={submitting} style={{ width: '100%' }}>
        {submitting ? 'Resetting…' : 'Reset Password'}
      </button>

      <div className="auth-links" style={{ justifyContent: 'center' }}>
        <button type="button" className="link-btn" onClick={onBackToLogin}>Back to Log In</button>
      </div>
    </form>
  )
}
