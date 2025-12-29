import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { carpoolService } from '../../services/carpoolService';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import socket, { joinGroup, leaveGroup } from '../../services/socket';
import { useAuth } from '../../context/AuthContext';

export default function CarpoolGroupPage() {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      const g = await carpoolService.getGroup(id);
      if (mounted) setGroup(g);
      setLoading(false);
    };
    load();

    // Poll for updates every 5s
    const t = setInterval(load, 5000);
    // join socket room for realtime updates
    joinGroup(id);

    // handle incoming groupAccepted events
    const onAccepted = (data) => {
      if (data && data.groupId === id) {
        // refresh group data
        carpoolService.getGroup(id).then(g => setGroup(g));
        alert('Group accepted by driver');
      }
    };
    socket.on('groupAccepted', onAccepted);
    return () => { mounted = false; clearInterval(t); socket.off('groupAccepted', onAccepted); leaveGroup(id); };
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto py-12 px-4">Loading carpool group...</div>
      <Footer />
    </div>
  );

  if (!group) return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto py-12 px-4">Carpool group not found or not available.</div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-3">Carpool Group</h2>
          <p className="text-sm text-gray-600">Status: <strong>{group.status}</strong></p>
          <p className="text-sm text-gray-600">Total fare: <strong>{group.totalFare}</strong></p>

          {group.liveLocation && (
            <div className="mt-3 p-3 bg-gray-50 rounded">
              <div className="text-sm text-gray-600">Driver location (last update):</div>
              <div className="font-medium">Lat: {group.liveLocation.lat}, Lon: {group.liveLocation.lon}</div>
              <div className="text-xs text-gray-500">Updated: {new Date(group.liveLocation.updatedAt).toLocaleString()}</div>
            </div>
          )}

          <div className="mt-4">
            <h3 className="font-medium">Passengers & split fares</h3>
            <ul className="mt-2 space-y-3">
              {group.bookings.map(b => (
                <li key={b._id} className="border p-3 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{b.user?.name || 'Guest'}</div>
                      <div className="text-sm text-gray-500">Pickup: {b.pickup.display_name}</div>
                      <div className="text-sm text-gray-500">Destination: {b.destination?.display_name}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Estimated: {b.estimatedFare}</div>
                      <div className="text-lg font-semibold">Pay: {group.splitFares?.[b._id] ?? b.passengerFare ?? '—'}</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          {/* Rating UI for passengers after completion */}
          {group.status === 'completed' && (
            <div className="mt-6">
              <h3 className="font-medium">Rate your driver</h3>
              <RatingForm groupId={group._id} />
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

function RatingForm({ groupId }) {
  const [rating, setRating] = React.useState(5);
  const [submitting, setSubmitting] = React.useState(false);

  const submit = async () => {
    setSubmitting(true);
    const res = await (await import('../../services/carpoolService')).carpoolService.rateGroup(groupId, rating);
    setSubmitting(false);
    if (res.success) alert('Thanks for rating!'); else alert('Failed: ' + (res.message || 'unknown'));
  };

  return (
    <div className="mt-2 flex items-center space-x-3">
      <select value={rating} onChange={e => setRating(parseInt(e.target.value,10))} className="border px-2 py-1">
        <option value={5}>5</option>
        <option value={4}>4</option>
        <option value={3}>3</option>
        <option value={2}>2</option>
        <option value={1}>1</option>
      </select>
      <button disabled={submitting} onClick={submit} className="bg-blue-600 text-white px-3 py-1 rounded">Submit Rating</button>
    </div>
  );
}
