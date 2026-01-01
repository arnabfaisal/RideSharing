import { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import {
  getPendingAppeals,
  reviewAppeal
} from '../../services/appealService';

export default function AdminAppeals() {
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAppeals = async () => {
    try {
      const res = await getPendingAppeals();
      setAppeals(res || []);
    } catch (e) {
      alert('Failed to load appeals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppeals();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto py-10 px-4">
        <h2 className="text-2xl font-semibold mb-4">
          Pending Driver Appeals
        </h2>

        {loading && <p>Loading...</p>}

        {!loading && appeals.length === 0 && (
          <p>No pending appeals</p>
        )}

        {!loading && appeals.map(a => (
          <div
            key={a._id}
            className="border rounded p-4 mb-4 bg-white"
          >
            <p className="font-medium">{a.email}</p>

            <p className="italic text-gray-700 mt-1">
              "{a.appealMessage}"
            </p>

            <div className="mt-3 flex gap-2">
              <button
                className="bg-green-600 text-white px-3 py-1 rounded"
                onClick={async () => {
                  await reviewAppeal(a._id, 'approved');
                  await loadAppeals();
                  alert('Driver unsuspended');
                }}
              >
                Approve & Unsuspend
              </button>

              <button
                className="bg-gray-600 text-white px-3 py-1 rounded"
                onClick={async () => {
                  await reviewAppeal(a._id, 'rejected');
                  await loadAppeals();
                  alert('Appeal rejected');
                }}
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      <Footer />
    </div>
  );
}
