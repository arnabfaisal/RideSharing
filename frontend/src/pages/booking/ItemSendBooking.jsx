import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../hooks/useBooking';
import LocationInput from '../../components/booking/LocationInput';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

export default function ItemSendBooking() {
  const navigate = useNavigate();
  const {
    bookingData,
    updateBookingData,
    fareEstimate,
    loading,
    calculateFare,
    submitBooking,
  } = useBooking();

  const [errors, setErrors] = useState({});

  const itemSizes = [
    { id: 'small', label: 'Small', description: 'Books, documents, phone', example: 'Textbook, folder' },
    { id: 'medium', label: 'Medium', description: 'Laptop, small package', example: 'Laptop, small box' },
    { id: 'large', label: 'Large', description: 'Backpack, larger items', example: 'Backpack, instrument' },
  ];

  // R1: Validate item booking form
  const validateForm = () => {
    const newErrors = {};
    
    if (!bookingData.pickup.address || !bookingData.pickup.lat) {
      newErrors.pickup = 'Please select a pickup location';
    }
    
    if (!bookingData.destination.address || !bookingData.destination.lat) {
      newErrors.destination = 'Please select a destination';
    }

    if (!bookingData.itemDescription.trim()) {
      newErrors.itemDescription = 'Please describe the item';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // R1: Calculate fare estimate
  const handleCalculateFare = async () => {
    if (validateForm()) {
      await calculateFare();
    }
  };

  // R1: Submit item booking
  const handleSubmit = async () => {
    if (validateForm()) {
      const result = await submitBooking();
      if (result.success) {
        alert('Item delivery request created! A driver will be matched soon.');
        navigate('/dashboard');
      } else {
        alert(`Booking failed: ${result.message}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto py-12 px-4">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div className="w-16 h-1 bg-green-600 mx-2"></div>
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                2
              </div>
            </div>
          </div>
          <div className="flex justify-center text-sm text-gray-600 mt-2 space-x-12">
            <span>Choose Service</span>
            <span className="font-medium text-green-600">Send Item</span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Send an Item on Campus
          </h1>
          <p className="text-gray-600">
            Describe your item and enter pickup/destination locations for delivery.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          {/* R1: Item Description */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Item Details</h3>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Description *
              </label>
              <textarea
                value={bookingData.itemDescription}
                onChange={(e) => updateBookingData('itemDescription', e.target.value)}
                placeholder="Describe what you're sending (e.g., 'Physics textbook for Prof. Smith', 'Laptop charger', 'Important documents for the registrar')"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.itemDescription ? 'border-red-500' : 'border-gray-300'
                }`}
                rows="3"
              />
              {errors.itemDescription && (
                <p className="mt-1 text-sm text-red-600">{errors.itemDescription}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Be specific about the item and any special handling instructions.
              </p>
            </div>

            {/* R1: Item Size Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Item Size
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {itemSizes.map((size) => (
                  <div
                    key={size.id}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      bookingData.itemSize === size.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 hover:border-green-300'
                    }`}
                    onClick={() => updateBookingData('itemSize', size.id)}
                  >
                    <div className="font-medium text-gray-900 mb-1">{size.label}</div>
                    <div className="text-sm text-gray-600 mb-1">{size.description}</div>
                    <div className="text-xs text-gray-500">e.g., {size.example}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* R1: Smart Route Input */}
          <div className="space-y-6 mb-8">
            <LocationInput
              label="Pickup Location"
              value={bookingData.pickup}
              onChange={(value) => updateBookingData('pickup', value)}
              placeholder="Where to pick up the item?"
              error={errors.pickup}
            />

            <LocationInput
              label="Delivery Destination"
              value={bookingData.destination}
              onChange={(value) => updateBookingData('destination', value)}
              placeholder="Where to deliver the item?"
              error={errors.destination}
            />
          </div>

          {/* R1: Calculate Fare Button */}
          <div className="mb-6">
            <button
              onClick={handleCalculateFare}
              disabled={loading || !bookingData.pickup.lat || !bookingData.destination.lat || !bookingData.itemDescription}
              className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Calculating Fare...' : 'Get Delivery Estimate'}
            </button>
          </div>

          {/* R1: Fare Estimate Display */}
          {fareEstimate && (
            <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Estimate</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Distance</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {fareEstimate.distanceKm.toFixed(1)} km
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Delivery Cost</div>
                  <div className="text-2xl font-bold text-green-600">
                    ${fareEstimate.estimatedFare.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <div className="flex justify-between mb-1">
                  <span>Base delivery:</span>
                  <span>${fareEstimate.breakdown.base}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>Distance ({fareEstimate.distanceKm.toFixed(1)} km):</span>
                  <span>${(fareEstimate.breakdown.perKm * fareEstimate.distanceKm).toFixed(2)}</span>
                </div>
                {bookingData.itemSize !== 'small' && (
                  <div className="flex justify-between mb-1">
                    <span>{bookingData.itemSize} item surcharge:</span>
                    <span>+${(fareEstimate.estimatedFare - fareEstimate.breakdown.base - (fareEstimate.breakdown.perKm * fareEstimate.distanceKm)).toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* R1: Action Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <button
              onClick={() => navigate('/booking')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              ← Back to Services
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={!fareEstimate || loading}
              className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Delivery...' : 'Schedule Delivery →'}
            </button>
          </div>
        </div>

        {/* R1: Delivery Guidelines */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-4">Delivery Guidelines</h3>
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="text-yellow-600 mr-3">✓</div>
              <div>
                <h4 className="font-medium text-yellow-900">Allowed Items</h4>
                <p className="text-sm text-yellow-800">Books, documents, laptops, small packages, campus supplies</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="text-red-600 mr-3">✗</div>
              <div>
                <h4 className="font-medium text-red-900">Prohibited Items</h4>
                <p className="text-sm text-red-800">Cash, alcohol, illegal substances, perishable food, fragile valuables</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="text-blue-600 mr-3">⏰</div>
              <div>
                <h4 className="font-medium text-blue-900">Delivery Hours</h4>
                <p className="text-sm text-blue-800">8:00 AM - 10:00 PM, Monday to Saturday. Same-day delivery available.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}