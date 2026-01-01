import { useEffect, useState } from "react";
import {
  getMyDriverRatings,
  respondToRating
} from "../services/ratingService";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

export default function DriverRatings() {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState({});

  useEffect(() => {
    fetchRatings();
  }, []);

  const fetchRatings = async () => {
    try {
      const res = await getMyDriverRatings();
      setRatings(res.ratings || []);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const submitResponse = async (ratingId) => {
    try {
      const responseText = responses[ratingId];
      if (!responseText) return alert("Response cannot be empty");

      await respondToRating(ratingId, responseText);
      setResponses({});
      fetchRatings(); // refresh
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto py-10 px-4">
        <h2 className="text-2xl font-semibold mb-4">My Ratings</h2>

        {loading && <div>Loading ratings...</div>}

        {!loading && ratings.length === 0 && (
          <div>No ratings yet.</div>
        )}

        {!loading && ratings.map(r => (
          <div key={r._id} className="bg-white p-4 rounded shadow mb-3">

            {/* Stars */}
            <div className="text-yellow-500 text-lg">
              {"★".repeat(r.stars)}{"☆".repeat(5 - r.stars)}
            </div>

            {/* Comment */}
            {r.comment && (
              <p className="text-gray-700 mt-1">
                “{r.comment}”
              </p>
            )}

            {/* Passenger */}
            <div className="text-xs text-gray-500 mt-2">
              Passenger: {r.passenger?.name || "Unknown"}
            </div>

            {/* Driver response (if exists) */}
            {r.driverResponse ? (
              <div className="mt-3 p-2 bg-green-50 border-l-4 border-green-500 text-sm">
                <strong>Your response:</strong> {r.driverResponse}
              </div>
            ) : (
              <div className="mt-3">
                <textarea
                  className="w-full border p-2 rounded text-sm"
                  placeholder="Write a response..."
                  value={responses[r._id] || ""}
                  onChange={e =>
                    setResponses({
                      ...responses,
                      [r._id]: e.target.value
                    })
                  }
                />

                <button
                  onClick={() => submitResponse(r._id)}
                  className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm"
                >
                  Respond
                </button>
              </div>
            )}

          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
}
