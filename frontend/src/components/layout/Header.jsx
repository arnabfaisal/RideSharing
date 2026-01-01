import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';

export default function Header() {
  const { user } = useAuth();
  const [showBookDropdown, setShowBookDropdown] = useState(false);

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side: Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg mr-2"></div>
              <span className="text-xl font-bold text-gray-900">CampusRide</span>
            </Link>
            
            {/* Navigation Links */}
            <nav className="hidden md:ml-10 md:flex md:space-x-6">
              <Link 
                to="/dashboard" 
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link 
                to="/activity" 
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
              >
                My Activity
              </Link>
              {user?.roles?.driver && (
                <Link 
                  to="/driver/matches" 
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
                >
                  Driver Matches
                </Link>  
              )}
              {user?.roles?.driver && (
  <Link 
    to="/driver/ratings" 
    className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
  >
    My Ratings
  </Link>
)}
{user?.roles?.admin && (
  <Link
    to="/admin/reports"
    className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
  >
    Admin Reports
  </Link>
)}

              {/* Book Dropdown - only for passengers */}
              {user?.roles?.passenger && (
                <div className="relative">
                  <button
                    onClick={() => setShowBookDropdown(!showBookDropdown)}
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium flex items-center"
                  >
                    Book Now
                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showBookDropdown && (
                    <div className="absolute z-10 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                      <Link
                        to="/booking/ride"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowBookDropdown(false)}
                      >
                        🚗 Book a Ride
                      </Link>
                      <Link
                        to="/booking/item"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowBookDropdown(false)}
                      >
                        📦 Send an Item
                      </Link>
                    </div>
                  )}
                </div>
              )}
              
              <Link 
                to="/how-it-works" 
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
              >
                How It Works
              </Link>
            </nav>
          </div>

          {/* Right side: User actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/booking">
                  <Button size="sm" className="hidden md:inline-flex">
                    Book Now
                  </Button>
                </Link>
                
                <Link to="/profile">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {user.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                  </div>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="secondary" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile Book Dropdown */}
      {showBookDropdown && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-3 space-y-2">
            <Link
              to="/booking/ride"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
              onClick={() => setShowBookDropdown(false)}
            >
              🚗 Book a Ride
            </Link>
            <Link
              to="/booking/item"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
              onClick={() => setShowBookDropdown(false)}
            >
              📦 Send an Item
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}