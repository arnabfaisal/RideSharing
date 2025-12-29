import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { carpoolService } from '../../services/carpoolService';

export default function DriverBookingControl(){
  const { id } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('arrived');

  const sendStatus = async () => {
    const res = await carpoolService.updateBookingStatus(id, status);
    if (res.success) {
      alert('Status updated');
      if (status === 'completed') navigate('/activity');
    } else alert('Status update failed: ' + (res.message || 'unknown'));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-3">Driver Booking Control</h2>
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
      <Footer />
    </div>
  );
}
