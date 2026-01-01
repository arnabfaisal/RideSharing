import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { carpoolService } from '../services/carpoolService';
import { get } from '../services/api';




export default function Dashboard() {
  const { user } = useAuth();
  const [totals, setTotals] = useState({ totalRides: 0, itemsSent: 0, rewardPoints: 0 });

  useEffect(() => {
    const loadCounts = async () => {
      if (!user) return;
      try {
        const act = await carpoolService.getMyActivity();
        const bookings = act.bookings || [];
        const trips = act.trips || [];
        const rides = bookings.filter(b => b.serviceType === 'ride').length + trips.length;
        const itemsSent = bookings.filter(b => b.serviceType === 'item').length;
        let rewardPoints = user?.rewardPoints || 0;
        try {
          const res = await get(`/api/rewards/dashboard/${user._id}`, true);
          rewardPoints = res.account?.points || rewardPoints;
        } catch (e) { console.error('Failed to load reward points', e); }
        setTotals({ totalRides: rides, itemsSent, rewardPoints });
      } catch (e) {
        console.error('Failed to load activity', e);
      }
    };
    loadCounts();
  }, [user]);

  // Quick action cards
  const quickActions = [
    {
      title: 'Book a Ride',
      description: 'Get a ride to any campus location',
      icon: '🚗',
      color: 'blue',
      path: '/booking/ride',
      features: ['Carpool option', 'Live tracking', 'Student drivers']
    },
    {
      title: 'Send an Item',
      description: 'Deliver items across campus',
      icon: '📦',
      color: 'green',
      path: '/booking/item',
      features: ['Secure delivery', 'Item tracking', 'Same-day service']
    },
    {
      title: 'My Profile',
      description: 'View and edit your profile',
      icon: '👤',
      color: 'purple',
      path: '/profile',
      features: ['Edit info', 'View ratings', 'Manage vehicle']
    },
    {
      title: 'Activity History',
      description: 'View your ride and delivery history',
      icon: '📊',
      color: 'orange',
      path: '/activity-history',
      features: ['Past rides', 'Item deliveries', 'Ratings']
    },
    {
        title: 'Rewards & Points',
        description: 'View and redeem your reward points',
        icon: '🎁',
        color: 'indigo',
        path: '/rewards',
        features: ['Earn points', 'Redeem rewards', 'Track progress']
      }
  ];

  // Driver-specific actions (if user is a driver)
  const driverActions = user?.roles?.driver ? [
    {
      title: 'Driver Dashboard',
      description: 'Manage your rides and earnings',
      icon: '🚘',
      color: 'red',
      path: '/driver/dashboard',
      features: ['Accept rides', 'View earnings', 'Manage schedule']
    }
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name || 'User'}!
          </h1>
          <p className="text-gray-600 mt-2">
            What would you like to do today?
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Total Rides</div>
            <div className="text-2xl font-bold">{totals.totalRides}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Items Sent</div>
            <div className="text-2xl font-bold">{totals.itemsSent}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Rating</div>
            <div className="text-2xl font-bold">{user?.rating || 'N/A'}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Reward Points</div>
            <div className="text-2xl font-bold text-blue-600">
              {totals.rewardPoints}
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...quickActions, ...driverActions].map((action, index) => (
              <Link 
                key={index} 
                to={action.path}
                className="block"
              >
                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-200 h-full">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-4 ${
                    action.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                    action.color === 'green' ? 'bg-green-100 text-green-600' :
                    action.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                    action.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                    action.color === 'indigo' ? 'bg-indigo-100 text-indigo-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {action.icon}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {action.description}
                  </p>
                  
                  <ul className="space-y-1">
                    {action.features.map((feature, idx) => (
                      <li key={idx} className="text-xs text-gray-500 flex items-center">
                        <span className="text-green-500 mr-1">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-6">
                    <button className={`w-full py-2 rounded-lg font-medium ${
                      action.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
                      action.color === 'green' ? 'bg-green-600 hover:bg-green-700' :
                      action.color === 'purple' ? 'bg-purple-600 hover:bg-purple-700' :
                      action.color === 'orange' ? 'bg-orange-600 hover:bg-orange-700' :
                      action.color === 'indigo' ? 'bg-indigo-600 hover:bg-indigo-700' :

                      'bg-red-600 hover:bg-red-700'
                    } text-white transition-colors`}>
                      Go to {action.title}
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
            <Link 
              to="/activity-history" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View All →
            </Link>
          </div>
          
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-4">📋</div>
            <p className="text-lg mb-2">No recent activity yet</p>
            <p className="text-sm">Book your first ride or send an item to get started!</p>
            <div className="mt-4 flex justify-center space-x-4">
              <Link 
                to="/booking/ride"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Book a Ride
              </Link>
              <Link 
                to="/booking/item"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Send an Item
              </Link>
            </div>
          </div>
        </div>

        {/* Service Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ride Information */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">About Rides</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="text-blue-600 mr-3">🚗</div>
                <div>
                  <h4 className="font-medium text-gray-900">Solo Rides</h4>
                  <p className="text-sm text-gray-600">Private, direct trips to your destination</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="text-blue-600 mr-3">👥</div>
                <div>
                  <h4 className="font-medium text-gray-900">Carpool Rides</h4>
                  <p className="text-sm text-gray-600">Shared rides with other students, 30% cheaper</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="text-blue-600 mr-3">🛡️</div>
                <div>
                  <h4 className="font-medium text-gray-900">Safety First</h4>
                  <p className="text-sm text-gray-600">All drivers are verified university students</p>
                </div>
              </li>
            </ul>
            <div className="mt-6">
              <Link 
                to="/booking/ride"
                className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
              >
                Book a Ride Now
              </Link>
            </div>
          </div>

          {/* Item Delivery Information */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">About Item Delivery</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="text-green-600 mr-3">📦</div>
                <div>
                  <h4 className="font-medium text-gray-900">Campus Delivery</h4>
                  <p className="text-sm text-gray-600">Send books, documents, and small items</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="text-green-600 mr-3">⏰</div>
                <div>
                  <h4 className="font-medium text-gray-900">Same-Day Service</h4>
                  <p className="text-sm text-gray-600">Most deliveries completed within hours</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="text-green-600 mr-3">🔒</div>
                <div>
                  <h4 className="font-medium text-gray-900">Secure Handling</h4>
                  <p className="text-sm text-gray-600">Your items are handled with care</p>
                </div>
              </li>
            </ul>
            <div className="mt-6">
              <Link 
                to="/booking/item"
                className="inline-block px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
              >
                Send an Item Now
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}