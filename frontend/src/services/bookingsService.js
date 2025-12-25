import { get, post } from './api';

export const bookingService = {
  // Get autocomplete suggestions
  getAutocompleteSuggestions: async (query) => {
    try {
      const response = await get(`/api/places/autocomplete?q=${encodeURIComponent(query)}&limit=5`);
      return response.success ? response.data : [];
    } catch (error) {
      console.error('Autocomplete error:', error);
      return [];
    }
  },

  // Get fare estimate
  getFareEstimate: async (bookingData) => {
    try {
      const response = await post('/api/r1/fare/estimate', bookingData);
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Fare estimate error:', error);
      return null;
    }
  },

  // Create a ride booking
  createRideBooking: async (bookingData) => {
    try {
      // You'll need to create this endpoint in your backend
      const response = await post('/api/rides/book', bookingData, true);
      return response;
    } catch (error) {
      console.error('Ride booking error:', error);
      return { success: false, message: 'Booking failed' };
    }
  },

  // Create an item delivery booking
  createItemBooking: async (bookingData) => {
    try {
      // You'll need to create this endpoint in your backend
      const response = await post('/api/items/book', bookingData, true);
      return response;
    } catch (error) {
      console.error('Item booking error:', error);
      return { success: false, message: 'Booking failed' };
    }
  },

  // Calculate distance between two points (Haversine formula)
  calculateDistance: (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  },
};