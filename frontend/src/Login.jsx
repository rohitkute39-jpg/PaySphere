import { useState } from 'react'
import './Login.css'

const API_URL = 'http://localhost:8080/api/v1/auth/login'

function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!username.trim() || !password) {
      setError('Please enter your username and password.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.error ||
          'Invalid username or password.'
        )
      }

      if (!data.accessToken) {
        throw new Error('Login response did not contain an access token.')
      }

      const user = {
        username: data.username,
        role: data.role,
      }

      sessionStorage.setItem('paysphere_token', data.accessToken)
      sessionStorage.setItem('paysphere_user', JSON.stringify(user))

      onLogin(user)
    } catch (err) {
      setError(
        err.message || 'Unable to connect to the server. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-brand">
        <div className="login-brand-icon">P</div>
        <div>
          <h2>PaySphere</h2>
          <span>EMPLOYEE MANAGEMENT</span>
        </div>
      </div>

      <div className="login-card">
        <div className="login-icon">P</div>

        <h1>Welcome Back</h1>
        <p className="login-subtitle">
          Sign in to access your PaySphere dashboard.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="login-username">Username</label>
          <input
            id="login-username"
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            required
          />

          <label htmlFor="login-password">Password</label>
          <div className="password-wrapper">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((previous) => !previous)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="login-security">
          <span>🔒</span>
          Secure access to your employee management system
        </div>
      </div>

      <div className="login-footer">
        © {new Date().getFullYear()} PaySphere. All rights reserved.
      </div>
    </div>
  )
}

export default Login
