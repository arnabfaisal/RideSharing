import React, { useEffect, useState } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { carpoolService } from '../services/carpoolService';

export default function ActivityPage(){
  const [data, setData] = useState({ bookings: [], trips: [] });
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    let mounted = true;
    (async ()=>{
      setLoading(true);
      const d = await carpoolService.getMyActivity();
      if(mounted) setData(d);
      setLoading(false);
    })();
    return ()=> mounted = false;
  },[]);

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
