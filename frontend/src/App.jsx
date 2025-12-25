import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'

export default function App(){
  return (
    <div className="container">
      <header>
        <h1>RideSharing</h1>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
          <Link to="/profile">Profile</Link>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<div style={{padding:12}}>Welcome to RideSharing — use the nav to login or register.</div>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<Register/>} />
          <Route path="/profile" element={<Profile/>} />
        </Routes>
      </main>
    </div>
  )
}
