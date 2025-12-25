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
      // R1 features only
      features: ['Smart route input', 'Carpool option', 'Fare estimate', 'Instant booking'],
      path: '/booking/ride',
    },
    {
      id: 'item',
      title: 'Send an Item',
      description: 'Send books, documents, or small items across campus quickly and securely.',
      icon: '📦',
      color: 'green',
      // R1 features only
      features: ['Item description required', 'Fare estimate', 'Secure handling', 'Instant booking'],
      path: '/booking/item',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto py-12 px-4">
        {/* R1: Service Selection Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Service
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Select between booking a ride or sending an item. Both services use smart route input and provide upfront fare estimates.
          </p>
        </div>

        {/* R1: Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>

        {/* R1: Requirements Display */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Service Requirements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">For Rides</h3>
              <ul className="space-y-2 text-gray-600">
                <li>✓ Smart pickup & destination input</li>
                <li>✓ Carpool or solo option</li>
                <li>✓ Upfront fare estimate</li>
                <li>✓ University locations only</li>
              </ul>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold text-gray-900 mb-2">For Items</h3>
              <ul className="space-y-2 text-gray-600">
                <li>✓ Item description required</li>
                <li>✓ Size selection</li>
                <li>✓ Upfront fare estimate</li>
                <li>✓ Campus delivery only</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}