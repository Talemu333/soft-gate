import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { api } from '../lib/api'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [form, setForm] = useState({ password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'referrer'
    meta.content = 'no-referrer'
    document.head.appendChild(meta)
    return () => meta.remove()
  }, [])

  const submit = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')

    if (!token) {
      setError('This reset link is missing its token. Please request a new one.')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSaving(true)
    try {
      const data = await api('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          token,
          newPassword: form.password,
          confirmPassword: form.confirmPassword,
        }),
      })
      setMessage(data.message)
      setForm({ password: '', confirmPassword: '' })
      setTimeout(() => navigate('/login', { replace: true, state: { message: data.message } }), 1200)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return <main className="auth-page section">
    <div className="auth-card">
      <div className="auth-intro">
        <span className="eyebrow">ACCOUNT RECOVERY</span>
        <h1>Create a new password.</h1>
        <p>Choose a new password for your Soft-Gate account. Your reset link can only be used once.</p>
      </div>
      <form className="auth-form" onSubmit={submit}>
        <label>New password
          <div className="password-field">
            <input
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              required
              minLength="8"
              maxLength="72"
              autoComplete="new-password"
              placeholder="••••••••"
            />
            <button type="button" onClick={() => setShowPassword((value) => !value)}>
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </label>
        <label>Confirm new password
          <input
            type="password"
            value={form.confirmPassword}
            onChange={(event) => setForm((current) => ({ ...current, confirmPassword: event.target.value }))}
            required
            minLength="8"
            maxLength="72"
            autoComplete="new-password"
            placeholder="••••••••"
          />
        </label>
        <button className="primary-button full" type="submit" disabled={saving}>
          {saving ? 'Updating…' : 'Set new password →'}
        </button>
        {message && <p className="auth-message">{message}</p>}
        {error && <p className="auth-message" role="alert">{error}</p>}
      </form>
      <p className="auth-back-link"><Link to="/login">← Back to sign in</Link></p>
    </div>
  </main>
}
