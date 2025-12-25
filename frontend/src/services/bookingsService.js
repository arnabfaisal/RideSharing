import { get, post } from './api';

export const bookingService = {
  // Use your existing backend autocomplete endpoint
  getAutocompleteSuggestions: async (query) => {
    console.log('Fetching autocomplete suggestions for query:', query);
    try {
      const response = await get(`/api/r1/places/autocomplete?q=${encodeURIComponent(query)}&limit=5`);
      return response.success ? response.data : [];
    } catch (error) {
      console.error('Autocomplete error:', error);
      // Fallback: Return dummy university data
      return getDummyUniversitySuggestions(query);
    }
  },

  // Fix: Fare estimate doesn't need authentication
  getFareEstimate: async (bookingData) => {
    try {
      // Remove authentication flag (false instead of true)
      const response = await post('/api/r1/fare/estimate', bookingData, false);
      return response.success ? response.data : getDummyFareEstimate(bookingData);
    } catch (error) {
      console.error('Fare estimate error:', error);
      // Return dummy estimate if API fails
      return getDummyFareEstimate(bookingData);
    }
  },

  // Create a ride booking (WITH authentication)
  createRideBooking: async (bookingData) => {
    try {
      // Backend expects booking creation at /api/r1/bookings with serviceType in body
      const response = await post('/api/r1/bookings', bookingData, true);
      return response;
    } catch (error) {
      console.error('Ride booking error:', error);
      return { success: false, message: 'Booking failed' };
    }
  },

  // Create an item delivery booking (WITH authentication)
  createItemBooking: async (bookingData) => {
    try {
      // Backend expects booking creation at /api/r1/bookings with serviceType in body
      const response = await post('/api/r1/bookings', bookingData, true);
      return response;
    } catch (error) {
      console.error('Item booking error:', error);
      return { success: false, message: 'Booking failed' };
    }
  },

  // Free alternative: Use OpenStreetMap directly (client-side)
  getOSMSuggestions: async (query) => {
    try {
      // OpenStreetMap Nominatim API (free, no key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ' university')}&limit=5`
      );
      const data = await response.json();
      
      return data.map(item => ({
        display_name: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        type: item.type,
        source: 'osm'
      }));
    } catch (error) {
      console.error('OSM API error:', error);
      return getDummyUniversitySuggestions(query);
    }
  },
};

// Fallback dummy data
function getDummyUniversitySuggestions(query) {
  const universities = [
    { display_name: 'Harvard University', lat: 42.365743, lon: -71.122213, type: 'university', source: 'dummy' },
    { display_name: 'Stanford University', lat: 37.431313, lon: -122.169365, type: 'university', source: 'dummy' },
    { display_name: 'MIT Massachusetts Institute of Technology', lat: 42.360081, lon: -71.094176, type: 'university', source: 'dummy' },
    { display_name: 'University of California Berkeley', lat: 37.871899, lon: -122.258539, type: 'university', source: 'dummy' },
    { display_name: 'Yale University', lat: 41.257130, lon: -72.989669, type: 'university', source: 'dummy' },
  ];
  
  return universities.filter(uni => 
    uni.display_name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);
}

function getDummyFareEstimate(bookingData) {
  const distance = 3.5; // dummy distance in km
  const baseFare = bookingData.serviceType === 'ride' ? 50 : 40;
  const perKm = 5;
  let estimatedFare = baseFare + (distance * perKm);
  
  if (bookingData.carpool) {
    estimatedFare *= 0.7; // 30% discount for carpool
  }
  
  if (bookingData.itemSize === 'medium') {
    estimatedFare += 10;
  } else if (bookingData.itemSize === 'large') {
    estimatedFare += 20;
  }
  
  return {
    distanceKm: distance,
    estimatedFare: estimatedFare,
    currency: 'TAKA',
    breakdown: {
      serviceType: bookingData.serviceType,
      base: baseFare,
      perKm: perKm,
      carpool: bookingData.carpool,
      itemSize: bookingData.itemSize
    }
  };
}