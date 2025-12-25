import React, { useState, useEffect, useRef } from 'react';
import { bookingService } from '../../services/bookingsService';

export default function LocationInput({
  label,
  value,
  onChange,
  placeholder = "Enter campus location...",
  className = "",
  error = null,
}) {
  const [query, setQuery] = useState(value.address || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [useOSM, setUseOSM] = useState(false); // Track if we need to use OSM
  const inputRef = useRef(null);

  // Enhanced autocomplete with fallback
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length > 2) {
        setLoading(true);
        
        try {
          // Try your backend API first
          let results = await bookingService.getAutocompleteSuggestions(query);
          
          // If no results, try OSM as fallback
          if (results.length === 0) {
            results = await bookingService.getOSMSuggestions(query);
            setUseOSM(true);
          } else {
            setUseOSM(false);
          }
          
          // Filter for university/campus locations
          const filteredResults = results.filter(item => 
            item.display_name.toLowerCase().includes('university') ||
            item.display_name.toLowerCase().includes('college') ||
            item.display_name.toLowerCase().includes('campus') ||
            item.display_name.toLowerCase().includes('hall') ||
            item.type === 'university' ||
            item.type === 'college'
          );
          
          // If still no results after filtering, show all results
          setSuggestions(filteredResults.length > 0 ? filteredResults : results.slice(0, 5));
        } catch (error) {
          console.error('Autocomplete error:', error);
          setSuggestions([]);
        } finally {
          setLoading(false);
          setShowSuggestions(true);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 500); // Increased debounce time

    return () => clearTimeout(timer);
  }, [query]);

  // Update query when value changes
  useEffect(() => {
    setQuery(value.address || '');
  }, [value.address]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setQuery(newValue);
    onChange({ ...value, address: newValue });
  };

  const handleSuggestionClick = (suggestion) => {
    const newValue = {
      address: suggestion.display_name,
      lat: suggestion.lat,
      lon: suggestion.lon,
    };
    setQuery(suggestion.display_name);
    onChange(newValue);
    setShowSuggestions(false);
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newValue = {
            address: 'Your Current Location',
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          };
          setQuery('Your Current Location');
          onChange(newValue);
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Unable to get your location. Please enter it manually.');
        }
      );
    }
  };

  const handleUseExample = () => {
    const examples = [
      'Harvard University Main Campus',
      'MIT Student Center',
      'Stanford University Library',
      'University Dormitory',
      'Campus Dining Hall'
    ];
    const randomExample = examples[Math.floor(Math.random() * examples.length)];
    setQuery(randomExample);
    onChange({ ...value, address: randomExample });
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={inputRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
          autoComplete="off"
        />
        
        <div className="absolute right-3 top-3 flex items-center space-x-2">
          {loading && (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          )}
          
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            className="text-sm text-blue-600 hover:text-blue-800"
            title="Use current location"
          >
            📍
          </button>
          
          <button
            type="button"
            onClick={handleUseExample}
            className="text-sm text-gray-500 hover:text-gray-700"
            title="Use example"
          >
            🎓
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Data source indicator */}
      {useOSM && suggestions.length > 0 && (
        <p className="mt-1 text-xs text-gray-500">
          Using OpenStreetMap data (free service)
        </p>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="font-medium text-gray-900 flex items-center">
                {suggestion.type === 'university' || suggestion.display_name.toLowerCase().includes('university') ? (
                  <span className="mr-2">🏛️</span>
                ) : suggestion.type === 'college' || suggestion.display_name.toLowerCase().includes('college') ? (
                  <span className="mr-2">🎓</span>
                ) : (
                  <span className="mr-2">📍</span>
                )}
                {suggestion.display_name}
              </div>
              <div className="text-sm text-gray-500 flex items-center justify-between">
                <span className="capitalize">{suggestion.type || 'location'}</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {suggestion.source === 'osm' ? 'OSM' : 'API'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No suggestions message */}
      {showSuggestions && suggestions.length === 0 && query.length > 2 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
          <p className="text-gray-600">No campus locations found for "{query}"</p>
          <p className="text-sm text-gray-500 mt-1">
            Try: "University Library", "Student Center", "Campus Dorm"
          </p>
        </div>
      )}

      {/* Location validation */}
      {value.lat && value.lon && (
        <div className="mt-2 flex items-center text-sm text-green-600">
          <span className="mr-1">✓</span>
          <span>Location selected (Lat: {value.lat.toFixed(4)}, Lon: {value.lon.toFixed(4)})</span>
        </div>
      )}
    </div>
  );
}