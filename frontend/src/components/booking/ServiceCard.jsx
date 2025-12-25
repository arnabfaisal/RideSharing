import React from 'react';
import { Link } from 'react-router-dom';

export default function ServiceCard({ service }) {
  const colorClasses = {
    blue: 'border-blue-200 hover:border-blue-500 bg-blue-50',
    green: 'border-green-200 hover:border-green-500 bg-green-50',
  };

  const iconBgClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
  };

  return (
    <Link to={service.path}>
      <div className={`border-2 rounded-2xl p-8 transition-all duration-300 hover:shadow-xl cursor-pointer h-full ${colorClasses[service.color]}`}>
        <div className="flex items-start mb-6">
          <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl mr-4 ${iconBgClasses[service.color]}`}>
            {service.icon}
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{service.title}</h3>
            <p className="text-gray-600">{service.description}</p>
          </div>
        </div>
        
        <ul className="space-y-2 mb-8">
          {service.features.map((feature, index) => (
            <li key={index} className="flex items-center text-gray-700">
              <span className="text-green-500 mr-2">✓</span>
              {feature}
            </li>
          ))}
        </ul>
        
        <button className={`w-full py-3 rounded-lg font-semibold transition-colors ${
          service.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
        } text-white`}>
          Select {service.id === 'ride' ? 'Ride' : 'Item'} Service →
        </button>
      </div>
    </Link>
  );
}