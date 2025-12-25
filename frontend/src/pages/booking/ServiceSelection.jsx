import React from 'react';
import { Link } from 'react-router-dom';
import ServiceCard from '../../components/booking/ServiceCard';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

export default function ServiceSelection() {
  const services = [
    {
      id: 'ride',
      title: 'Book a Ride',
      description: 'Get a ride to any campus location. Choose between solo or carpool options.',
      icon: '🚗',
      color: 'blue',
      features: ['Campus-wide coverage', 'Solo or carpool options', 'Live tracking', 'Student drivers only'],
      path: '/booking/ride',
    },
    {
      id: 'item',
      title: 'Send an Item',
      description: 'Send books, documents, or small items across campus quickly and securely.',
      icon: '📦',
      color: 'green',
      features: ['Same-day delivery', 'Item tracking', 'Insurance available', 'Secure handling'],
      path: '/booking/item',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto py-12 px-4">
        {/* Progress indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div className="w-24 h-1 bg-blue-600 mx-2"></div>
              <div className="w-10 h-10 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div className="w-24 h-1 bg-gray-300 mx-2"></div>
              <div className="w-10 h-10 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-bold">
                3
              </div>
            </div>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span className="font-medium text-blue-600">Choose Service</span>
            <span>Enter Details</span>
            <span>Confirm Booking</span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            What would you like to do today?
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Choose between booking a ride or sending an item across campus. Both services are exclusively for verified university students.
          </p>
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>

        {/* Recent Bookings (if any) */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Your Recent Bookings</h2>
          <div className="text-center py-8 text-gray-500">
            <p className="mb-2">No recent bookings yet.</p>
            <p className="text-sm">Book your first ride or item delivery to get started!</p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Who can use this service?</h3>
              <p className="text-gray-600">Only verified university students with .edu email addresses can book rides or send items.</p>
            </div>
            <div className="border-b pb-4">
              <h3 className="font-semibold text-gray-900 mb-2">What's the difference between solo and carpool?</h3>
              <p className="text-gray-600">Solo rides are private, while carpool rides are shared with other students going in the same direction, making them more affordable.</p>
            </div>
            <div className="border-b pb-4">
              <h3 className="font-semibold text-gray-900 mb-2">What items can I send?</h3>
              <p className="text-gray-600">You can send books, documents, laptops, small packages, and other campus essentials. Prohibited items include cash, alcohol, and illegal substances.</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}