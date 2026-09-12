import { useState } from 'react'
import { api } from '../lib/api'

export default function Contact(){
  const [sent,setSent]=useState(false)
  const [error,setError]=useState('')
  const [sending,setSending]=useState(false)
  const [form,setForm]=useState({name:'',email:'',message:''})
  const update=(field,value)=>setForm((current)=>({...current,[field]:value}))
  const submit=async(e)=>{
    e.preventDefault()
    setError('')
    setSending(true)
    try{
      await api.sendContact(form)
      setSent(true)
      setForm({name:'',email:'',message:''})
    }catch(err){setError(err.message||'Unable to send your message. Please try again.')}finally{setSending(false)}
  }
  return <section className="section content-page"><span className="eyebrow">CONTACT US</span><h1>Let's talk tech.</h1><p className="lead">Need a laptop, office setup, accessory or advice? Send us a message.</p><div className="contact-layout"><div className="contact-info"><h2>Sales & support</h2><p>Lagos, Nigeria</p><p>Mon–Sat · 8am–6pm</p><p>We’ll help you find the right technology for the job.</p></div><form className="contact-form" onSubmit={submit}><label>Name<input required value={form.name} onChange={e=>update('name',e.target.value)} placeholder="Your name"/></label><label>Email<input type="email" required value={form.email} onChange={e=>update('email',e.target.value)} placeholder="you@example.com"/></label><label>Message<textarea required value={form.message} onChange={e=>update('message',e.target.value)} placeholder="How can we help?"></textarea></label>{error&&<p className="auth-message">{error}</p>}{sent&&<p className="auth-message">Message sent successfully ✓</p>}<button className="primary-button" disabled={sending}>{sending?'Sending…':sent?'Send another message →':'Send message →'}</button></form></div></section>
}
