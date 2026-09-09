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
    setMessage(register ? 'Account created successfully.' : 'You are now signed in.')
    setTimeout(() => navigate('/account'), 500)
  }

  const switchMode = () => {
    setRegister((value) => !value)
    setMessage('')
    setForm({ name: '', email: '', password: '' })
  }

  return <main className="section auth-page">
    <div className="auth-card">
      <span className="eyebrow">SOFT-GATE ACCOUNT</span>
      <h1>{register ? 'Create your account.' : 'Welcome back.'}</h1>
      <p>{register ? 'Create an account to track orders, save products and manage your shopping details.' : 'Sign in to manage your orders, saved products and account details.'}</p>
      {message && <div className="auth-note">✓ {message}</div>}
      <form className="auth-form" onSubmit={submit}>
        {register && <label>Full name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Your full name" autoComplete="name" /></label>}
        <label>Email address<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="you@example.com" autoComplete="email" /></label>
        <label>Password<div className="password-field"><input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength="6" placeholder="At least 6 characters" autoComplete={register ? 'new-password' : 'current-password'} /><button type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? 'Hide' : 'Show'}</button></div></label>
        <button className="primary-button full" type="submit">{register ? 'Create account' : 'Sign in'} →</button>
      </form>
      {!register && <div className="auth-links"><span>Forgot password?</span><button type="button" onClick={() => setMessage('Password reset will be connected to the production backend.')}>Reset password</button></div>}
      <div className="auth-divider">OR</div>
      <div className="auth-note">This frontend currently uses local browser state for the demo. Production authentication, password recovery and secure sessions will be connected to the Node.js backend.</div>
      <div className="auth-links"><span>{register ? 'Already have an account?' : 'New to Soft-Gate?'}</span><button type="button" onClick={switchMode}>{register ? 'Sign in' : 'Create an account'}</button></div>
      <div className="auth-links"><Link to="/shop">← Continue shopping</Link><Link to="/">Back home</Link></div>
    </div>
  </main>
}