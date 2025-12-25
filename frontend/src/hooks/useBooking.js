import { useState, useEffect } from 'react';
import { bookingService } from '../services/bookingService';

export const useBooking = () => {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [fareEstimate, setFareEstimate] = useState(null);
  const [bookingData, setBookingData] = useState({
    serviceType: 'ride', // 'ride' or 'item'
    pickup: { lat: null, lon: null, address: '' },
    destination: { lat: null, lon: null, address: '' },
    carpool: false,
    itemDescription: '',
    itemSize: 'small', // small, medium, large
    preferredTime: new Date(),
    notes: '',
  });

  // Debounced search for autocomplete
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (bookingData.pickup.address.length > 2) {
        const results = await bookingService.getAutocompleteSuggestions(bookingData.pickup.address);
        setSuggestions(results);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [bookingData.pickup.address]);

  // Update booking data
  const updateBookingData = (field, value) => {
    setBookingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Calculate fare estimate
  const calculateFare = async () => {
    setLoading(true);
    try {
      const estimate = await bookingService.getFareEstimate({
        serviceType: bookingData.serviceType,
        pickup: bookingData.pickup,
        destination: bookingData.destination,
        carpool: bookingData.carpool,
        itemSize: bookingData.itemSize
      });
      setFareEstimate(estimate);
    } catch (error) {
      console.error('Error calculating fare:', error);
    } finally {
      setLoading(false);
    }
  };

  // Submit booking
  const submitBooking = async () => {
    setLoading(true);
    try {
      let response;
      if (bookingData.serviceType === 'ride') {
        response = await bookingService.createRideBooking(bookingData);
      } else {
        response = await bookingService.createItemBooking(bookingData);
      }
      
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setBookingData({
      serviceType: 'ride',
      pickup: { lat: null, lon: null, address: '' },
      destination: { lat: null, lon: null, address: '' },
      carpool: false,
      itemDescription: '',
      itemSize: 'small',
      preferredTime: new Date(),
      notes: '',
    });
    setFareEstimate(null);
    setSuggestions([]);
  };

  return {
    bookingData,
    updateBookingData,
    suggestions,
    fareEstimate,
    loading,
    calculateFare,
    submitBooking,
    resetForm,
  };
};