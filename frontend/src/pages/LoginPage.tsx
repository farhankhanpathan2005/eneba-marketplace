import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser, setAuth } from '../services/api'
import { toast } from '../hooks/useDebounce'

const LoginPage = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const tokens = await loginUser({ email, password })
      setAuth(tokens)
      toast('Welcome back!', 'success')
      navigate('/')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid email or password'
      setError(message)
      toast('Login failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Welcome Back</h1>
        <p className="subtitle">Sign in to your Eneba account</p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
        <p className="auth-footer" style={{ marginTop: '0.5rem' }}>
          <Link to="/" style={{ fontSize: '0.85rem' }}>← Back to home</Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage