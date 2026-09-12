import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { api } from '../lib/api'

export default function Login() {
  const navigate = useNavigate()
  const [register, setRegister] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const submit = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')
    setSubmitting(true)
    try {
      const data = register
        ? await api.register({ name: form.name, email: form.email, password: form.password })
        : await api.login({ email: form.email, password: form.password })

      localStorage.setItem('softgate-token', data.token)
      localStorage.setItem('softgate-user', JSON.stringify(data.user))
      window.dispatchEvent(new Event('softgate-auth-updated'))
      setMessage(register ? 'Account created successfully.' : 'You are now signed in.')
      setTimeout(() => navigate('/account'), 500)
    } catch (requestError) {
      setError(requestError.message || 'Unable to complete authentication.')
    } finally {
      setSubmitting(false)
    }
  }

  return <main className="auth-page section">
    <div className="auth-card">
      <div className="auth-intro"><span className="eyebrow">{register ? 'CREATE ACCOUNT' : 'WELCOME BACK'}</span><h1>{register ? 'Create your Soft-Gate account.' : 'Sign in to your account.'}</h1><p>{register ? 'Save your details and make future orders easier.' : 'Access your orders, wishlist and shopping preferences.'}</p></div>
      <form className="auth-form" onSubmit={submit}>
        {register && <label>Full name<input value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} required autoComplete="name" placeholder="Your full name" /></label>}
        <label>Email address<input type="email" value={form.email} onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))} required autoComplete="email" placeholder="you@example.com" /></label>
        <label>Password<div className="password-field"><input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))} required minLength="6" autoComplete={register ? 'new-password' : 'current-password'} placeholder="••••••••" /><button type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? 'Hide' : 'Show'}</button></div></label>
        <button className="primary-button full" type="submit" disabled={submitting}>{submitting ? 'Please wait…' : register ? 'Create account →' : 'Sign in →'}</button>
        {message && <p className="auth-message">{message}</p>}
        {error && <p className="auth-message" role="alert">{error}</p>}
      </form>
      <div className="auth-switch">{register ? 'Already have an account?' : 'New to Soft-Gate?'} <button type="button" onClick={() => { setRegister((value) => !value); setMessage(''); setError('') }}>{register ? 'Sign in' : 'Create an account'}</button></div>
      <p className="auth-demo-note">Your account is securely authenticated by the Soft-Gate backend. Your password is never stored in the browser.</p>
      <p className="auth-switch"><Link to="/">← Back to shop</Link></p>
    </div>
  </main>
}
