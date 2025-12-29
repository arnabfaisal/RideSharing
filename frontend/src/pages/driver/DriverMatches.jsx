import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { carpoolService } from '../../services/carpoolService';

export default function DriverMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMatches = async (lat, lon) => {
    setLoading(true);
    const data = await carpoolService.listDriverMatches(lat, lon);
    setMatches(data || []);
    setLoading(false);
  };

  useEffect(() => {
    // try to get geolocation; fallback to manual prompt
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(p => {
        fetchMatches(p.coords.latitude, p.coords.longitude);
      }, () => {
        setError('Location access denied. Please provide coordinates to fetch matches.');
        setLoading(false);
      });
    } else {
      setError('Geolocation not supported');
      setLoading(false);
    }
  }, []);

  const handleAccept = async (groupId) => {
    let res;
    if (groupId && String(groupId).startsWith('solo_')) {
      const bookingId = String(groupId).replace('solo_','');
      res = await carpoolService.acceptSolo(bookingId);
    } else {
      res = await carpoolService.acceptGroup(groupId);
    }
    if (res.success) {
      // mark accepted locally
      setMatches(ms => ms.map(m => m.group._id === groupId ? { ...m, group: res.data } : m));
      alert('Group accepted — passengers will be notified.');
    } else {
      alert('Accept failed: ' + (res.message || 'unknown'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-3">Driver Matches</h2>
          {loading && <div>Loading matches...</div>}
          {error && <div className="text-sm text-red-600">{error}</div>}

          {!loading && !matches.length && (
            <div className="text-gray-600">No matches available right now.</div>
          )}

          <ul className="space-y-3 mt-4">
            {matches.map(item => (
              <li key={item.group._id} className="border p-3 rounded flex justify-between items-start">
                <div>
                  <div className="font-medium">Group {item.group._id}</div>
                      <div className="text-sm text-gray-500">Passengers: {item.group.bookings.length}</div>
                  <div className="text-sm text-gray-500">Distance: {item.distanceKm} km</div>
                  <div className="text-sm text-gray-500">AvgRating: {item.avgRating}</div>
                </div>
                    <div className="flex flex-col items-end space-y-2">
                      <div className="text-sm text-gray-600">Score: {Math.round(item.score*100)/100}</div>
                      <div className="flex flex-col space-y-2">
                        <button onClick={() => handleAccept(item.group._id)} className="bg-blue-600 text-white px-3 py-1 rounded">Accept Group</button>
                        {String(item.group._id).startsWith('solo_') ? (
                          <a href={`/driver/booking/${String(item.group._id).replace('solo_','')}`} className="text-sm text-gray-700 underline">Open Control</a>
                        ) : (
                          <a href={`/driver/group/${item.group._id}`} className="text-sm text-gray-700 underline">Open Control</a>
                        )}
                      </div>
                    </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Footer />
    </div>
  );
}
