import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, register } = useAuth()
  const [registerMode, setRegisterMode] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')
    try {
      const user = registerMode
        ? await register(form)
        : await login(form.email, form.password)

      setMessage(registerMode ? 'Account created successfully.' : 'You are now signed in.')
      const destination = location.state?.from || (user.role === 'admin' ? '/admin' : '/account')
      setTimeout(() => navigate(destination, { replace: true }), 350)
    } catch (err) {
      setError(err.message)
    }
  }

  return <main className="auth-page section">
    <div className="auth-card">
      <div className="auth-intro"><span className="eyebrow">{registerMode ? 'CREATE ACCOUNT' : 'WELCOME BACK'}</span><h1>{registerMode ? 'Create your Soft-Gate account.' : 'Sign in to your account.'}</h1><p>{registerMode ? 'Save your details and make future orders easier.' : 'Access your orders, wishlist and shopping preferences.'}</p></div>
      <form className="auth-form" onSubmit={submit}>
        {registerMode && <label>Full name<input value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} required autoComplete="name" placeholder="Your full name" /></label>}
        {registerMode && <label>Phone number<input value={form.phone} onChange={(e) => setForm((current) => ({ ...current, phone: e.target.value }))} autoComplete="tel" placeholder="0800 000 0000" /></label>}
        <label>Email address<input type="email" value={form.email} onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))} required autoComplete="email" placeholder="you@example.com" /></label>
        <label>Password<div className="password-field"><input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))} required minLength="6" autoComplete={registerMode ? 'new-password' : 'current-password'} placeholder="••••••••" /><button type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? 'Hide' : 'Show'}</button></div></label>
        <button className="primary-button full" type="submit">{registerMode ? 'Create account' : 'Sign in'} →</button>
        {message && <p className="auth-message">{message}</p>}
        {error && <p className="auth-message" role="alert">{error}</p>}
      </form>
      <div className="auth-switch">{registerMode ? 'Already have an account?' : 'New to Soft-Gate?'} <button type="button" onClick={() => { setRegisterMode((value) => !value); setMessage(''); setError('') }}>{registerMode ? 'Sign in' : 'Create an account'}</button></div>
      <p className="auth-demo-note">Your account is now stored securely in the Soft-Gate backend. Passwords are hashed and never returned to the frontend.</p>
    </div>
  </main>
}
