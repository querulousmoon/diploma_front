import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Activity, AlertCircle } from 'lucide-react'
import './LoginPage.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login({ email, password })
      navigate('/dashboard', { replace: true })
    } catch (err: any) {
      const message = err.response?.data?.detail || err.response?.data?.message || err.message || 'Invalid username or password'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-page__container">
        <div className="login-page__header">
          <Activity size={40} className="login-page__icon" />
          <h1 className="login-page__title">Server Monitor</h1>
          <p className="login-page__subtitle">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-page__form">
          {error && (
            <div className="login-page__error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="login-page__field">
            <label htmlFor="email" className="login-page__label">
              Username
            </label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              placeholder="username"
              className="login-page__input"
              autoComplete="username"
            />
          </div>

          <div className="login-page__field">
            <label htmlFor="password" className="login-page__label">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              placeholder="••••••••"
              className="login-page__input"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="login-page__submit"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
