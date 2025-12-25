import { useState, useEffect } from 'react';
import { bookingService } from '../services/bookingsService';

export const useBooking = () => {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [fareEstimate, setFareEstimate] = useState(null);
  const [apiError, setApiError] = useState(null);
  
  // R1: Basic booking data only
  const [bookingData, setBookingData] = useState({
    serviceType: 'ride', // 'ride' or 'item' - R1 requirement
    pickup: { lat: null, lon: null, address: '' },
    destination: { lat: null, lon: null, address: '' },
    carpool: false, // R1 requirement - carpool toggle for rides
    itemDescription: '', // R1 requirement for items
    itemSize: 'small',
    notes: '',
  });

  // R1: Autocomplete for smart route input
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (bookingData.pickup.address.length > 2) {
        try {
          const results = await bookingService.getAutocompleteSuggestions(bookingData.pickup.address);
          setSuggestions(results);
          setApiError(null);
        } catch (error) {
          console.error('Autocomplete failed, using fallback:', error);
          // Use OSM as fallback
          const osmResults = await bookingService.getOSMSuggestions(bookingData.pickup.address);
          setSuggestions(osmResults);
        }
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [bookingData.pickup.address]);

  // R1: Update booking data
  const updateBookingData = (field, value) => {
    setBookingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // R1: Basic fare estimate (for display only)
  const calculateFare = async () => {
    setLoading(true);
    setApiError(null);
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
      setApiError('Unable to calculate fare. Using estimated pricing.');
      // Use dummy estimate as fallback
      const dummyEstimate = {
        distanceKm: 3.5,
        estimatedFare: bookingData.serviceType === 'ride' ? 
          (bookingData.carpool ? 35 : 50) : 
          (bookingData.itemSize === 'small' ? 40 : bookingData.itemSize === 'medium' ? 50 : 60),
        currency: 'USD',
        breakdown: {
          serviceType: bookingData.serviceType,
          base: bookingData.serviceType === 'ride' ? 30 : 25,
          perKm: 5,
          carpool: bookingData.carpool,
          itemSize: bookingData.itemSize
        }
      };
      setFareEstimate(dummyEstimate);
    } finally {
      setLoading(false);
    }
  };

  // R1: Submit booking (basic creation)
  const submitBooking = async () => {
    setLoading(true);
    setApiError(null);
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
        setApiError(response.message || 'Booking failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      setApiError(error.message || 'Network error');
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
      notes: '',
    });
    setFareEstimate(null);
    setSuggestions([]);
    setApiError(null);
  };

  return {
    bookingData,
    updateBookingData,
    suggestions,
    fareEstimate,
    loading,
    apiError,
    calculateFare,
    submitBooking,
    resetForm,
    
  };
};