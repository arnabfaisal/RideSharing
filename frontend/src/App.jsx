import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

import ServiceSelection from './pages/booking/ServiceSelection';
import RideBooking from './pages/booking/RideBooking';
import ItemSendBooking from './pages/booking/ItemSendBooking';
import CarpoolGroupPage from './pages/carpool/CarpoolGroup';
import DriverMatches from './pages/driver/DriverMatches';
import DriverTripControl from './pages/driver/DriverTripControl';
import DriverBookingControl from './pages/driver/DriverBookingControl';
import ActivityPage from './pages/Activity';

// Placeholder Dashboard
function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-600">Dashboard content will be added as features are developed.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />


        {/* r1 */}
        <Route path="/booking" element={<ServiceSelection />} />
        <Route path="/booking/ride" element={
          <ProtectedRoute>
            <RideBooking />
          </ProtectedRoute>
        } />
        <Route path="/booking/item" element={
          <ProtectedRoute>
            <ItemSendBooking />
          </ProtectedRoute>
        } />

        <Route path="/carpool/:id" element={
          <ProtectedRoute>
            <CarpoolGroupPage />
          </ProtectedRoute>
        } />

        <Route path="/driver/matches" element={
          <ProtectedRoute>
            <DriverMatches />
          </ProtectedRoute>
        } />
        <Route path="/driver/group/:id" element={
          <ProtectedRoute>
            <DriverTripControl />
          </ProtectedRoute>
        } />
        <Route path="/driver/booking/:id" element={
          <ProtectedRoute>
            <DriverBookingControl />
          </ProtectedRoute>
        } />
        <Route path="/activity" element={
          <ProtectedRoute>
            <ActivityPage />
          </ProtectedRoute>
        } />
        
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
