import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';


export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Campus Ride Sharing
            <span className="block text-blue-600 text-4xl md:text-5xl mt-2">
              Smarter. Safer. Together.
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Connect with verified university students for rides, carpooling, and item delivery across campus. 
            Exclusive for .edu email holders only.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/register">
              <Button size="lg" variant="primary">
                Get Started Free
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="secondary">
                Sign In
              </Button>
            </Link>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">1,000+</div>
              <div className="text-gray-600">Active Students</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">5,000+</div>
              <div className="text-gray-600">Rides Completed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">4.9★</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose CampusRide?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <div className="text-blue-600 text-4xl mb-4">🚗</div>
              <h3 className="text-xl font-semibold mb-3">Smart Carpooling</h3>
              <p className="text-gray-600">
                Save money by sharing rides with students going your way. Our algorithm matches you perfectly.
              </p>
            </Card>
            
            <Card>
              <div className="text-blue-600 text-4xl mb-4">📦</div>
              <h3 className="text-xl font-semibold mb-3">Campus Delivery</h3>
              <p className="text-gray-600">
                Send items across campus securely. Books, laptops, or anything you need delivered.
              </p>
            </Card>
            
            <Card>
              <div className="text-blue-600 text-4xl mb-4">⭐</div>
              <h3 className="text-xl font-semibold mb-3">Earn Rewards</h3>
              <p className="text-gray-600">
                Get points for every ride, redeem for discounts, priority matching, and exclusive merch.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Sign Up', desc: 'Register with your .edu email' },
              { step: '2', title: 'Choose Service', desc: 'Select Ride or Item Delivery' },
              { step: '3', title: 'Get Matched', desc: 'Connect with verified students' },
              { step: '4', title: 'Track & Pay', desc: 'Live tracking & secure payment' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h4 className="font-semibold text-lg mb-2">{item.title}</h4>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}