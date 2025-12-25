import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { get } from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const res = await get('/api/auth/me', true);
      if (res.success) {
        setUser(res.data);
      } else {
        setError('Failed to load profile');
      }
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      setError('Logout failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <Button variant="secondary" onClick={handleLogout}>
            Sign Out
          </Button>
        </div>

        {error && <Alert type="error" message={error} className="mb-6" />}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info Card */}
          <div className="lg:col-span-2">
            <Card>
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-blue-600">
                      {user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{user?.name}</h2>
                    <p className="text-gray-600">{user?.email}</p>
                    <div className="flex items-center mt-1">
                      <span className="text-yellow-500">★</span>
                      <span className="ml-1 font-medium">{user?.rating || 'N/A'}</span>
                      <span className="text-gray-500 text-sm ml-1">
                        ({user?.ratingCount || 0} ratings)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Member Since</h3>
                    <p className="font-medium">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">User ID</h3>
                    <p className="font-mono text-sm truncate">{user?._id?.substring(0, 12)}...</p>
                  </div>
                </div>

                {/* Roles Section */}
                <div className="pt-6 border-t">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Your Roles</h3>
                  <div className="flex flex-wrap gap-3">
                    {user?.roles?.passenger && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        Passenger
                      </span>
                    )}
                    {user?.roles?.driver && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        Driver
                      </span>
                    )}
                  </div>
                </div>

                {/* Vehicle Info */}
                {user?.vehicle && (
                  <div className="pt-6 border-t">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Vehicle Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Make & Model</p>
                        <p className="font-medium">{user.vehicle.make} {user.vehicle.model}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Plate Number</p>
                        <p className="font-medium">{user.vehicle.plateNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Color</p>
                        <p className="font-medium">{user.vehicle.color}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Year</p>
                        <p className="font-medium">{user.vehicle.year}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Quick Stats Sidebar */}
          <div className="space-y-6">
            <Card>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Rides</span>
                  <span className="font-bold">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Items Delivered</span>
                  <span className="font-bold">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Carpools Joined</span>
                  <span className="font-bold">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Reward Points</span>
                  <span className="font-bold text-blue-600">0</span>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link to="/booking/ride">
                  <Button variant="primary" className="w-full">
                    Book a Ride
                  </Button>
                </Link>
                <Link to="/booking/item">
                  <Button variant="secondary" className="w-full">
                    Send an Item
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="outline" className="w-full">
                    Go to Dashboard
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}