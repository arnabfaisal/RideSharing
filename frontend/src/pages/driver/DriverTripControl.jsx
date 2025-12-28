import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { carpoolService } from '../../services/carpoolService';

export default function DriverTripControl() {
  const { id } = useParams();
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [status, setStatus] = useState('on_trip');

  const sendLocation = async () => {
    const l = parseFloat(lat);
    const ln = parseFloat(lon);
    if (Number.isNaN(l) || Number.isNaN(ln)) return alert('Invalid lat/lon');
    const res = await carpoolService.updateLocation(id, l, ln);
    if (res.success) alert('Location updated'); else alert('Location update failed');
  };

  const sendStatus = async () => {
    const res = await carpoolService.updateStatus(id, status);
    if (res.success) alert('Status updated'); else alert('Status update failed');
  };

  const useGeo = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported');
    navigator.geolocation.getCurrentPosition(p => {
      setLat(p.coords.latitude);
      setLon(p.coords.longitude);
    }, () => alert('Failed to get position'));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-3">Driver Group Control</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm">Latitude</label>
              <input value={lat} onChange={e=>setLat(e.target.value)} className="border px-2 py-1 w-full" />
            </div>
            <div>
              <label className="block text-sm">Longitude</label>
              <input value={lon} onChange={e=>setLon(e.target.value)} className="border px-2 py-1 w-full" />
            </div>
            <div className="flex space-x-2">
              <button onClick={useGeo} className="bg-gray-200 px-3 py-1 rounded">Use My Location</button>
              <button onClick={sendLocation} className="bg-blue-600 text-white px-3 py-1 rounded">Send Location</button>
            </div>

            <div>
              <label className="block text-sm">Status</label>
              <select value={status} onChange={e=>setStatus(e.target.value)} className="border px-2 py-1">
                <option value="arrived">Arrived</option>
                <option value="on_trip">On Trip</option>
                <option value="completed">Completed</option>
              </select>
              <div className="mt-2">
                <button onClick={sendStatus} className="bg-green-600 text-white px-3 py-1 rounded">Update Status</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
