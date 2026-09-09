import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function Login() {
  const navigate = useNavigate()
  const [register, setRegister] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const submit = (event) => {
    event.preventDefault()
    const customer = { name: register ? form.name : 'Soft-Gate Customer', email: form.email }
    localStorage.setItem('softgate-customer', JSON.stringify(customer))
    window.dispatchEvent(new Event('softgate-customer-updated'))
    setMessage(register ? 'Account created successfully.' : 'You are now signed in.')
    setTimeout(() => navigate('/account'), 500)
  }

  return <main className="auth-page section">
    <div className="auth-card">
      <div className="auth-intro"><span className="eyebrow">{register ? 'CREATE ACCOUNT' : 'WELCOME BACK'}</span><h1>{register ? 'Create your Soft-Gate account.' : 'Sign in to your account.'}</h1><p>{register ? 'Save your details and make future orders easier.' : 'Access your orders, wishlist and shopping preferences.'}</p></div>
      <form className="auth-form" onSubmit={submit}>
        {register && <label>Full name<input value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} required autoComplete="name" placeholder="Your full name" /></label>}
        <label>Email address<input type="email" value={form.email} onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))} required autoComplete="email" placeholder="you@example.com" /></label>
        <label>Password<div className="password-field"><input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))} required minLength="6" autoComplete={register ? 'new-password' : 'current-password'} placeholder="••••••••" /><button type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? 'Hide' : 'Show'}</button></div></label>
        <button className="primary-button full" type="submit">{register ? 'Create account' : 'Sign in'} →</button>
        {message && <p className="auth-message">{message}</p>}
      </form>
      <div className="auth-switch">{register ? 'Already have an account?' : 'New to Soft-Gate?'} <button type="button" onClick={() => { setRegister((value) => !value); setMessage('') }}>{register ? 'Sign in' : 'Create an account'}</button></div>
      <p className="auth-demo-note">Demo authentication for the frontend stage. Passwords are not stored. Secure authentication, sessions and account recovery will be handled by the production backend.</p>
    </div>
  </main>
}
