import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../hooks/useBooking';
import LocationInput from '../../components/booking/LocationInput';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

export default function RideBooking() {
  const navigate = useNavigate();
  const {
    bookingData,
    updateBookingData,
    fareEstimate,
    loading,
    calculateFare,
    submitBooking,
    apiError,
  } = useBooking();

  const [errors, setErrors] = useState({});

  // R1: Validate basic booking form
  const validateForm = () => {
    const newErrors = {};
    
    if (!bookingData.pickup.address || !bookingData.pickup.lat) {
      newErrors.pickup = 'Please select a pickup location';
    }
    
    if (!bookingData.destination.address || !bookingData.destination.lat) {
      newErrors.destination = 'Please select a destination';
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

  // R1: Submit basic booking
  const handleSubmit = async () => {
    if (validateForm()) {
      const result = await submitBooking();
      if (result.success) {
        alert('Ride booking request created! Matching will be handled by the system.');
        navigate('/dashboard');
      } else {
        alert(`Booking failed: ${result.message}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
    {/* Add API error display */}
    {apiError && (
    <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center">
        <div className="text-yellow-600 mr-3">⚠️</div>
        <div>
            <p className="text-sm text-yellow-800">{apiError}</p>
            <p className="text-xs text-yellow-700 mt-1">Using estimated pricing for demonstration.</p>
        </div>
        </div>
    </div>
    )}
      
      <div className="max-w-4xl mx-auto py-12 px-4">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div className="w-16 h-1 bg-blue-600 mx-2"></div>
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                2
              </div>
            </div>
          </div>
          <div className="flex justify-center text-sm text-gray-600 mt-2 space-x-12">
            <span>Choose Service</span>
            <span className="font-medium text-blue-600">Book Ride</span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Book a Campus Ride
          </h1>
          <p className="text-gray-600">
            Enter your pickup and destination. Choose between carpool or solo ride.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          {/* R1: Carpool Toggle */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Ride Type</h3>
                <p className="text-sm text-gray-600">Carpool is shared and cheaper</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => updateBookingData('carpool', false)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    !bookingData.carpool 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="font-medium">Solo</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => updateBookingData('carpool', true)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    bookingData.carpool 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="font-medium">Carpool</span>
                </button>
              </div>
            </div>
            
            {/* Carpool info */}
            <div className={`rounded-lg p-4 ${
              bookingData.carpool ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'
            }`}>
              <div className="flex items-center">
                <div className={`mr-3 ${bookingData.carpool ? 'text-green-600' : 'text-blue-600'}`}>
                  {bookingData.carpool ? '👥' : '🚗'}
                </div>
                <div>
                  <p className={`text-sm ${bookingData.carpool ? 'text-green-800' : 'text-blue-800'}`}>
                    {bookingData.carpool 
                      ? 'Carpool: Shared ride with other students. 30% cheaper but may have additional stops.'
                      : 'Solo: Private ride directly to your destination. Faster but more expensive.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* R1: Smart Route Input */}
          <div className="space-y-6 mb-8">
            <LocationInput
              label="Pickup Location"
              value={bookingData.pickup}
              onChange={(value) => updateBookingData('pickup', value)}
              placeholder="Enter campus pickup point..."
              error={errors.pickup}
            />

            <LocationInput
              label="Destination"
              value={bookingData.destination}
              onChange={(value) => updateBookingData('destination', value)}
              placeholder="Enter campus destination..."
              error={errors.destination}
            />
          </div>

          {/* R1: Additional Notes */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={bookingData.notes}
              onChange={(e) => updateBookingData('notes', e.target.value)}
              placeholder="Any special instructions for the driver?"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="2"
            />
          </div>

          {/* R1: Calculate Fare Button */}
          <div className="mb-6">
            <button
              onClick={handleCalculateFare}
              disabled={loading || !bookingData.pickup.lat || !bookingData.destination.lat}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Calculating Fare...' : 'Get Fare Estimate'}
            </button>
          </div>

          {/* R1: Fare Estimate Display */}
          {fareEstimate && (
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Fare Estimate</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Distance</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {fareEstimate.distanceKm.toFixed(1)} km
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Estimated Fare</div>
                  <div className="text-2xl font-bold text-green-600">
                    ${fareEstimate.estimatedFare.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <div className="flex justify-between mb-1">
                  <span>Base fare:</span>
                  <span>${fareEstimate.breakdown.base}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>Distance ({fareEstimate.distanceKm.toFixed(1)} km):</span>
                  <span>${(fareEstimate.breakdown.perKm * fareEstimate.distanceKm).toFixed(2)}</span>
                </div>
                {bookingData.carpool && (
                  <div className="flex justify-between mb-1">
                    <span>Carpool discount (30%):</span>
                    <span className="text-green-600">-${(fareEstimate.estimatedFare * 0.3).toFixed(2)}</span>
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
              {loading ? 'Creating Booking...' : 'Confirm Booking →'}
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}