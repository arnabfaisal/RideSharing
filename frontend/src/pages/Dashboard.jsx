import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Welcome back, {user?.name || 'User'}!
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link 
                to="/book-ride" 
                className="block w-full bg-blue-600 text-white py-2 px-4 rounded text-center hover:bg-blue-700"
              >
                Book a Ride
              </Link>
              <Link 
                to="/send-item" 
                className="block w-full bg-gray-200 text-gray-800 py-2 px-4 rounded text-center hover:bg-gray-300"
              >
                Send an Item
              </Link>
              {user?.roles?.driver && (
                <Link 
                  to="/driver/dashboard" 
                  className="block w-full bg-green-600 text-white py-2 px-4 rounded text-center hover:bg-green-700"
                >
                  Driver Dashboard
                </Link>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="text-gray-500 italic">
              No recent activity. Book your first ride!
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Your Stats</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Total Rides</span>
                <span className="font-bold">0</span>
              </div>
              <div className="flex justify-between">
                <span>Items Sent</span>
                <span className="font-bold">0</span>
              </div>
              <div className="flex justify-between">
                <span>Reward Points</span>
                <span className="font-bold text-blue-600">0</span>
              </div>
              <div className="flex justify-between">
                <span>Your Rating</span>
                <span className="font-bold">{user?.rating || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-6">What would you like to do?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link 
              to="/book-ride" 
              className="border border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="text-blue-600 text-3xl mb-4">🚗</div>
              <h3 className="font-semibold mb-2">Book a Ride</h3>
              <p className="text-gray-600 text-sm">Get a ride to any campus location</p>
            </Link>
            
            <Link 
              to="/send-item" 
              className="border border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="text-blue-600 text-3xl mb-4">📦</div>
              <h3 className="font-semibold mb-2">Send an Item</h3>
              <p className="text-gray-600 text-sm">Deliver items across campus</p>
            </Link>
            
            <Link 
              to="/profile" 
              className="border border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="text-blue-600 text-3xl mb-4">👤</div>
              <h3 className="font-semibold mb-2">My Profile</h3>
              <p className="text-gray-600 text-sm">View and edit your profile</p>
            </Link>
            
            <Link 
              to="/activity-history" 
              className="border border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="text-blue-600 text-3xl mb-4">📊</div>
              <h3 className="font-semibold mb-2">Activity History</h3>
              <p className="text-gray-600 text-sm">View your ride history</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}