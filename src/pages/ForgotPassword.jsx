import { Link } from 'react-router-dom'
import { useState } from 'react'
import { api } from '../lib/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')
    setSending(true)

    try {
      const data = await api('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
      setMessage(data.message)
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  return <main className="auth-page section">
    <div className="auth-card">
      <div className="auth-intro">
        <span className="eyebrow">ACCOUNT RECOVERY</span>
        <h1>Forgot your password?</h1>
        <p>Enter the email address you used to create your Soft-Gate account. If it is registered, we will send you a secure reset link.</p>
      </div>
      <form className="auth-form" onSubmit={submit}>
        <label>Email address
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
        </label>
        <button className="primary-button full" type="submit" disabled={sending}>
          {sending ? 'Sending…' : 'Send reset link →'}
        </button>
        {message && <p className="auth-message">{message}</p>}
        {error && <p className="auth-message" role="alert">{error}</p>}
      </form>
      <p className="auth-back-link"><Link to="/login">← Back to sign in</Link></p>
    </div>
  </main>
}
