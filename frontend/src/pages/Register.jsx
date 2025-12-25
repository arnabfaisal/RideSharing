import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { post } from '../api'

export default function Register(){
  const [name,setName] = useState('')
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [roles,setRoles] = useState('passenger')
  const [vehicle,setVehicle] = useState('')
  const [msg,setMsg] = useState(null)
  const navigate = useNavigate()

  async function submit(e){
    e.preventDefault()
    setMsg(null)
    try{
      const body = { name, email, password, roles }
      if (roles === 'driver' || roles === 'both') body.vehicle = vehicle
      const res = await post('/api/auth/register', body)
      if (!res.success) return setMsg({ type:'err', text: res.message || 'Registration failed' })
      setMsg({ type:'ok', text: 'Registered — please login' })
      navigate('/login')
    }catch(err){ setMsg({ type:'err', text: err.message }) }
  }

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={submit}>
        <label>Full name</label>
        <input value={name} onChange={e=>setName(e.target.value)} required />
        <label>Email (university .edu)</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required />
        <label>Password</label>
        <input value={password} onChange={e=>setPassword(e.target.value)} type="password" required />
        <label>Register as</label>
        <select value={roles} onChange={e=>setRoles(e.target.value)}>
          <option value="passenger">Passenger</option>
          <option value="driver">Driver</option>
          <option value="both">Both</option>
        </select>
        {(roles==='driver' || roles==='both') && (
          <>
            <label>Vehicle details</label>
            <input value={vehicle} onChange={e=>setVehicle(e.target.value)} placeholder="e.g. Toyota Camry, plate ABC123" />
          </>
        )}
        <button type="submit">Register</button>
      </form>
      {msg && <div className={msg.type==='err' ? 'alert' : 'success'}>{msg.text}</div>}
    </div>
  )
}
