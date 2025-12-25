import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { post } from '../api'

export default function Login(){
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [msg,setMsg] = useState(null)
  const navigate = useNavigate()

  async function submit(e){
    e.preventDefault()
    setMsg(null)
    try{
      const res = await post('/api/auth/login', { email, password })
      if (!res.success) return setMsg({ type:'err', text: res.message || 'Login failed' })
      localStorage.setItem('rs_token', res.token)
      localStorage.setItem('rs_user', JSON.stringify(res.user))
      setMsg({ type:'ok', text: 'Logged in' })
      navigate('/profile')
    }catch(err){ setMsg({ type:'err', text: err.message }) }
  }

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <label>Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required />
        <label>Password</label>
        <input value={password} onChange={e=>setPassword(e.target.value)} type="password" required />
        <button type="submit">Login</button>
      </form>
      {msg && <div className={msg.type==='err' ? 'alert' : 'success'}>{msg.text}</div>}
    </div>
  )
}
