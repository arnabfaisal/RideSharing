import React, { useEffect, useState } from 'react'
import { get, post } from '../api'
import { useNavigate } from 'react-router-dom'

export default function Profile(){
  const [user,setUser] = useState(null)
  const [msg,setMsg] = useState(null)
  const navigate = useNavigate()

  useEffect(()=>{ load() }, [])
  async function load(){
    try{
      const res = await get('/api/auth/me', true)
      if (!res.success) return setMsg({ type:'err', text: res.message || 'Failed' })
      setUser(res.data)
    }catch(err){ setMsg({ type:'err', text: err.message }) }
  }

  async function logout(){
    try{
      await post('/api/auth/logout', {}, true)
    }catch(_){}
    localStorage.removeItem('rs_token')
    localStorage.removeItem('rs_user')
    navigate('/login')
  }

  if (msg) return <div className="alert">{msg.text}</div>
  if (!user) return <div className="small">Loading...</div>

  return (
    <div>
      <h2>Profile</h2>
      <div className="profile-row"><strong>Name:</strong> {user.name}</div>
      <div className="profile-row"><strong>Email:</strong> {user.email}</div>
      <div className="profile-row"><strong>Roles:</strong> {JSON.stringify(user.roles)}</div>
      <div className="profile-row"><strong>Vehicle:</strong> {user.vehicle || 'N/A'}</div>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
