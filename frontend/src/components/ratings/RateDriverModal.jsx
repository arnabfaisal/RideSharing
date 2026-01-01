import { useState } from "react";
import { createRating } from "../../services/ratingService";

export default function RateDriverModal({ trip, onClose, onSuccess }) {
  if (!trip) return null;

  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (loading) return;

    try {
      setLoading(true);
      await createRating({
        tripId: trip._id,
        stars,
        comment
      });
      onSuccess();
      onClose();
    } catch (e) {
      console.error(e);
      alert(e.message || "Failed to submit rating");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
      style={{ zIndex: 99999 }}
    >
      <div className="bg-white rounded p-4 w-80 shadow-lg">
        <h3 className="text-lg font-semibold mb-2">Rate Driver</h3>

        <label className="block mb-1">Stars</label>
        <select
          className="w-full border p-1 mb-2"
          value={stars}
          onChange={e => setStars(Number(e.target.value))}
          disabled={loading}
        >
          {[5, 4, 3, 2, 1].map(s => (
            <option key={s} value={s}>{s} ★</option>
          ))}
        </select>

        <label className="block mb-1">Comment (optional)</label>
        <textarea
          className="w-full border p-1 mb-3"
          value={comment}
          onChange={e => setComment(e.target.value)}
          disabled={loading}
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1 border rounded"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            disabled={loading}
            onClick={submit}
            className="px-3 py-1 bg-blue-600 text-white rounded"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
