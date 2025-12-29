import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { carpoolService } from '../services/carpoolService';
import socket, { joinBooking, leaveBooking, joinGroup, leaveGroup } from '../services/socket';

export default function ActivityPage(){
  const { user } = useAuth();
  const [data, setData] = useState({ bookings: [], trips: [] });
  const [loading, setLoading] = useState(true);
  const currentUserId = user?.id || user?._id || null;

  useEffect(()=>{
    let mounted = true;
    (async ()=>{
      setLoading(true);
      const d = await carpoolService.getMyActivity();
      if(mounted) setData(d);

      // join socket rooms for active bookings so user receives bookingAccepted, bookingOnTrip, bookingCompleted
      try {
        // join booking rooms for ALL active (non-completed) bookings so we stay connected for updates
        d.bookings.forEach(b => {
          if (b.status !== 'completed' && !b.carpool) {
            joinBooking(b._id);
          }
          // if booking is part of a carpool group, join that group room
          if (b.carpool && b.carpoolGroup) {
            joinGroup(b.carpoolGroup);
          }
        });
      } catch (e) { console.error('join rooms error', e); }
      setLoading(false);
    })();
    return () => {
      mounted = false;
      // leave rooms on unmount
      try {
        (async () => {
          const d = await carpoolService.getMyActivity();
          d.bookings.forEach(b => {
            if (b.status !== 'completed' && !b.carpool) leaveBooking(b._id);
            if (b.carpool && b.carpoolGroup) leaveGroup(b.carpoolGroup);
          });
        })();
      } catch (e) { /* ignore */ }
    };
  },[]);

  useEffect(() => {
    const onBookingAccepted = (data) => {
      if (!data || !data.bookingId) return;
      // refresh activity to update booking/trip lists
      carpoolService.getMyActivity().then(d => setData(d));
      alert('Your booking was accepted by a driver.');
    };
    socket.on('bookingAccepted', onBookingAccepted);
    socket.on('bookingOnTrip', (data) => {
      if (!data || !data.bookingId) return;
      carpoolService.getMyActivity().then(d => setData(d));
      alert('Your trip is now in progress.');
    });
    socket.on('bookingCompleted', (data) => {
      if (!data || !data.bookingId) return;
      carpoolService.getMyActivity().then(d => setData(d));
      alert('Your trip was completed.');
      // redirect to dashboard when completed
      window.location.href = '/dashboard';
    });

    return () => {
      socket.off('bookingAccepted', onBookingAccepted);
      socket.off('bookingOnTrip');
      socket.off('bookingCompleted');
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-5xl mx-auto py-12 px-4">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Activity History</h2>
          {loading && <div>Loading...</div>}

          {!loading && (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">Bookings</h3>
                <ul className="space-y-2">
                  {data.bookings.map(b=> (
                    <li key={b._id} className="border p-2 rounded">
                      <div className="text-sm">{b.serviceType} — {b.status}</div>
                      <div className="text-xs text-gray-500">{b.pickup?.display_name} → {b.destination?.display_name}</div>
                      <div className="text-sm">Fare: {b.passengerFare ?? b.estimatedFare}</div>
                      {b.status === 'accepted' && (
                        <div className="mt-2">
                          <button onClick={async ()=>{
                            const res = await carpoolService.confirmBooking(b._id);
                            if (res.success) { alert('Confirmed — driver notified'); const d = await carpoolService.getMyActivity(); setData(d); }
                            else alert('Confirm failed: '+(res.message||'unknown'))
                          }} className="px-3 py-1 bg-blue-600 text-white rounded">Confirm Pickup</button>
                        </div>
                      )}
                      {/* Driver action: complete solo booking from bookings list */}
                      {user?.roles?.driver && b.status !== 'completed' && !b.carpool && b.trip && (
                        <div className="mt-2">
                          <button onClick={async ()=>{
                            console.log('Complete clicked for booking:', b._id, 'status:', b.status, 'trip:', b.trip);
                            const res = await carpoolService.updateBookingStatus(b._id, 'completed');
                            console.log('Complete response:', res);
                            if (res.success) { alert('Marked completed'); const d = await carpoolService.getMyActivity(); setData(d); }
                            else alert('Complete failed: '+(res.message||'unknown'))
                          }} className="px-3 py-1 bg-green-600 text-white rounded">Complete (Driver)</button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2">Trips</h3>
                <ul className="space-y-2">
                  {data.trips.map(t=> (
                    <li key={t._id} className="border p-2 rounded">
                      <div className="text-sm">{t.tripType} — {t.status}</div>
                      <div className="text-xs text-gray-500">Fare: {t.fareAmount}</div>
                      <div className="text-xs text-gray-500">Created: {new Date(t.createdAt).toLocaleString()}</div>
                      {user?.roles?.driver && t.driver && t.driver.toString() === currentUserId && t.status !== 'COMPLETED' && (
                        <div className="mt-2">
                          <button onClick={async ()=>{
                            console.log('Trip Complete clicked for trip:', t._id, 'status:', t.status, 'booking:', t.booking);
                            // prefer booking status update if trip linked to booking so booking rooms are notified
                            let res = { success: false };
                            if (t.booking) {
                              console.log('Using booking status endpoint');
                              res = await carpoolService.updateBookingStatus(t.booking, 'completed');
                            } else {
                              console.log('Using trip confirm endpoint');
                              res = await carpoolService.confirmTripDriver(t._id);
                            }
                            console.log('Trip Complete response:', res);
                            if (res.success) { alert('Trip marked completed'); const d = await carpoolService.getMyActivity(); setData(d); }
                            else alert('Complete failed: '+(res.message||'unknown'))
                          }} className="px-3 py-1 bg-green-600 text-white rounded">Complete (Driver)</button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
