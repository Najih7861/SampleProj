import { useEffect, useState } from 'react'
import { authErrorMessage } from '../../api/auth'
import { requestOtp, verifyOtp } from '../../api/passwordResetOtp'

interface Props {
  onBackToLogin: () => void
}

type Step = 'request' | 'verify'

const RESEND_COOLDOWN_SECONDS = 60 // resend becomes available after 1 minute

function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function ForgotPasswordOtpForm({ onBackToLogin }: Props) {
  const [step, setStep] = useState<Step>('request')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')

  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  const [otpSecondsLeft, setOtpSecondsLeft] = useState(0)
  const [resendSecondsLeft, setResendSecondsLeft] = useState(0)

  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)

  // One ticking interval (only while verifying) drives both countdowns.
  useEffect(() => {
    if (step !== 'verify') return
    const id = setInterval(() => {
      setOtpSecondsLeft((s) => (s > 0 ? s - 1 : 0))
      setResendSecondsLeft((s) => (s > 0 ? s - 1 : 0))
    }, 1000)
    return () => clearInterval(id)
  }, [step])

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const res = await requestOtp(username.trim())
      setEmail(res.email)
      setOtpSecondsLeft(res.expiresInSeconds)
      setResendSecondsLeft(RESEND_COOLDOWN_SECONDS)
      setStep('verify')
    } catch (err) {
      setError(authErrorMessage(err, 'Could not send a reset code. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleResend() {
    if (resendSecondsLeft > 0 || resending) return
    setError(null)
    setResending(true)
    try {
      const res = await requestOtp(username.trim())
      setEmail(res.email)
      setOtp('')
      setOtpSecondsLeft(res.expiresInSeconds)
      setResendSecondsLeft(RESEND_COOLDOWN_SECONDS)
    } catch (err) {
      setError(authErrorMessage(err, 'Could not resend the code. Please try again.'))
    } finally {
      setResending(false)
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (otpSecondsLeft <= 0) {
      setError('Your code has expired. Please resend a new one.')
      return
    }
    if (newPassword !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setVerifying(true)
    try {
      const res = await verifyOtp({ username: username.trim(), otp: otp.trim(), newPassword })
      setDone(res.message)
    } catch (err) {
      setError(authErrorMessage(err, 'Could not reset your password. Please try again.'))
    } finally {
      setVerifying(false)
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

  // Step 1 — enter username, request a code.
  if (step === 'request') {
    return (
      <form onSubmit={handleRequest}>
        <h2>Forgot your password?</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          Enter your username and we’ll email a verification code to the address on your account.
        </p>
        {error && <div className="notice notice-error">{error}</div>}

        <div className="form-row">
          <label htmlFor="otp-username">Username</label>
          <input
            id="otp-username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
        </div>

        <button type="submit" className="btn-cta" disabled={submitting} style={{ width: '100%' }}>
          {submitting ? 'Sending…' : 'Send code'}
        </button>

        <div className="auth-links" style={{ justifyContent: 'center' }}>
          <button type="button" className="link-btn" onClick={onBackToLogin}>Back to Log In</button>
        </div>
      </form>
    )
  }

  // Step 2 — enter the emailed code + a new password.
  const expired = otpSecondsLeft <= 0
  return (
    <form onSubmit={handleVerify}>
      <h2>Enter your code</h2>
      <div className="notice notice-success">
        OTP sent to <strong>{email}</strong>
      </div>
      {error && <div className="notice notice-error">{error}</div>}

      <div className="form-row">
        <label htmlFor="otp-code">Verification code</label>
        <input
          id="otp-code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="6-digit code"
          required
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '0.35rem',
            gap: '0.75rem',
          }}
        >
          <span className="muted" style={{ fontSize: '0.85rem' }}>
            {expired ? 'Code expired' : `Code expires in ${formatClock(otpSecondsLeft)}`}
          </span>
          <button
            type="button"
            className="link-btn"
            onClick={handleResend}
            disabled={resendSecondsLeft > 0 || resending}
          >
            {resending
              ? 'Resending…'
              : resendSecondsLeft > 0
                ? `Resend in ${formatClock(resendSecondsLeft)}`
                : 'Resend code'}
          </button>
        </div>
      </div>

      <div className="form-row">
        <label htmlFor="otp-new">New password</label>
        <input
          id="otp-new"
          type="password"
          required
          minLength={6}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
        />
      </div>
      <div className="form-row">
        <label htmlFor="otp-confirm">Confirm new password</label>
        <input
          id="otp-confirm"
          type="password"
          required
          minLength={6}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
        />
      </div>

      <button type="submit" className="btn-cta" disabled={verifying || expired} style={{ width: '100%' }}>
        {verifying ? 'Resetting…' : 'Reset Password'}
      </button>

      <div className="auth-links" style={{ justifyContent: 'center' }}>
        <button type="button" className="link-btn" onClick={onBackToLogin}>Back to Log In</button>
      </div>
    </form>
  )
}
