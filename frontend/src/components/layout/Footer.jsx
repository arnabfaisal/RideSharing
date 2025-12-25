import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">CampusRide</h3>
            <p className="text-gray-400 text-sm">
              Connecting university students for safe, affordable, and convenient transportation.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Services</h4>
            <ul className="space-y-2">
              <li><Link to="/rides" className="text-gray-400 hover:text-white">Rides</Link></li>
              <li><Link to="/carpool" className="text-gray-400 hover:text-white">Carpool</Link></li>
              <li><Link to="/delivery" className="text-gray-400 hover:text-white">Item Delivery</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-400 hover:text-white">About Us</Link></li>
              <li><Link to="/safety" className="text-gray-400 hover:text-white">Safety</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-400 hover:text-white">Terms of Service</Link></li>
              <li><Link to="/community" className="text-gray-400 hover:text-white">Community Guidelines</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} CampusRide. For university students only.</p>
          <p className="mt-2">Use of .edu email required for registration.</p>
        </div>
      </div>
    </footer>
  );
}