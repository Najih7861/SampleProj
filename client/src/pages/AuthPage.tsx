import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import type { AuthUser } from '../api/auth'
import LoginForm from '../components/auth/LoginForm'
import RegisterForm from '../components/auth/RegisterForm'
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm'

type View = 'login' | 'register' | 'forgot'

export default function AuthPage() {
  const [view, setView] = useState<View>('login')
  const { login } = useAuth()
  const navigate = useNavigate()

  function handleAuthSuccess(user: AuthUser) {
    login(user)
    navigate('/')
  }

  return (
    <div className="page">
      <div className="container">
        <div className="auth-shell">
          {view !== 'forgot' && (
            <div className="auth-tabs">
              <button
                className={`auth-tab ${view === 'login' ? 'active' : ''}`}
                onClick={() => setView('login')}
              >
                Login
              </button>
              <button
                className={`auth-tab ${view === 'register' ? 'active' : ''}`}
                onClick={() => setView('register')}
              >
                Register
              </button>
            </div>
          )}

          <div className="form-card auth-panel">
            {view === 'login' && (
              <LoginForm
                onSuccess={handleAuthSuccess}
                onCreateAccount={() => setView('register')}
                onForgotPassword={() => setView('forgot')}
              />
            )}
            {view === 'register' && (
              <RegisterForm
                onSuccess={handleAuthSuccess}
                onAlreadyHaveAccount={() => setView('login')}
              />
            )}
            {view === 'forgot' && (
              <ForgotPasswordForm onBackToLogin={() => setView('login')} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
