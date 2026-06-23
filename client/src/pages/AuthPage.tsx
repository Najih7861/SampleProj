import { useState } from 'react'
import { KeyRound, LogIn, UserPlus } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useToast } from '../components/ui/toast/useToast'
import type { AuthUser } from '../api/auth'
import LoginForm from '../components/auth/LoginForm'
import RegisterForm from '../components/auth/RegisterForm'
import ForgotPasswordOtpForm from '../components/auth/ForgotPasswordOtpForm'

type View = 'login' | 'register' | 'forgot'

interface AuthLocationState {
  from?: string
}

export default function AuthPage() {
  const [view, setView] = useState<View>('login')
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const from = (location.state as AuthLocationState | null)?.from

  function handleAuthSuccess(user: AuthUser) {
    login(user)
    navigate(user.role === 'Admin' ? '/admin' : from || '/')
  }

  function handleLoginSuccess(user: AuthUser) {
    toast.success('Welcome back!')
    handleAuthSuccess(user)
  }

  function handleRegisterSuccess(user: AuthUser) {
    toast.success('Account created — welcome!')
    handleAuthSuccess(user)
  }

  return (
    <div className="page auth-page">
      <div className="container">
        <div className="auth-shell">
          <div className="section-heading section-heading-center">
            <p className="eyebrow">Secure access</p>
            <h1>{view === 'forgot' ? 'Reset your password' : 'Welcome to Wanderlust'}</h1>
          </div>

          {view !== 'forgot' && (
            <div className="auth-tabs" role="tablist" aria-label="Authentication view">
              <button
                type="button"
                className={`auth-tab icon-text ${view === 'login' ? 'active' : ''}`}
                onClick={() => setView('login')}
              >
                <LogIn size={17} aria-hidden />
                Login
              </button>
              <button
                type="button"
                className={`auth-tab icon-text ${view === 'register' ? 'active' : ''}`}
                onClick={() => setView('register')}
              >
                <UserPlus size={17} aria-hidden />
                Register
              </button>
            </div>
          )}

          <div className="form-card auth-panel">
            {view === 'login' && (
              <LoginForm
                onSuccess={handleLoginSuccess}
                onCreateAccount={() => setView('register')}
                onForgotPassword={() => setView('forgot')}
              />
            )}
            {view === 'register' && (
              <RegisterForm
                onSuccess={handleRegisterSuccess}
                onAlreadyHaveAccount={() => setView('login')}
              />
            )}
            {view === 'forgot' && (
              <div>
                <div className="auth-forgot-icon" aria-hidden><KeyRound size={24} /></div>
                <ForgotPasswordOtpForm onBackToLogin={() => setView('login')} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
