import { useState } from "react";
import { createReport } from "../../services/reportService";

export default function ReportDriverModal({ trip, onClose, onSuccess }) {
  if (!trip) return null;

  const [category, setCategory] = useState("Other");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    try {
      setLoading(true);

      await createReport({
        tripId: trip._id,          // ✅ REQUIRED
        category,                  // ✅ REQUIRED
        description                // ✅ REQUIRED
      });

      onSuccess?.();
      onClose();
    } catch (e) {
      console.error(e);
      alert(e.message || "Failed to submit report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded p-4 w-80">
        <h3 className="text-lg font-semibold mb-2">Report Driver</h3>

        <label className="block mb-1">Category</label>
        <select
          className="w-full border p-1 mb-2"
          value={category}
          onChange={e => setCategory(e.target.value)}
        >
          <option value="Late">Late</option>
          <option value="Rude">Rude</option>
          <option value="No Show">No Show</option>
          <option value="Other">Other</option>
        </select>

        <label className="block mb-1">Description</label>
        <textarea
          className="w-full border p-1 mb-3"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="border px-3 py-1">
            Cancel
          </button>
          <button
            disabled={loading}
            onClick={submit}
            className="bg-red-600 text-white px-3 py-1"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
