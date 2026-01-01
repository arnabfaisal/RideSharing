import { useState } from "react";
import { post } from "../../services/api";

export default function AppealModal({ onClose, onSuccess }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (message.trim().length < 10) {
      alert("Please explain properly (min 10 characters)");
      return;
    }

    try {
      setLoading(true);
      await post("/appeals", { message }, true);
      alert("Appeal submitted");
      onSuccess?.();
      onClose();
    } catch (e) {
      alert(e.message || "Appeal failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-4 rounded w-96">
        <h3 className="font-semibold mb-2">Appeal Suspension</h3>

        <textarea
          rows="4"
          className="w-full border p-2 mb-3"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Explain your actions and apology..."
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose}>Cancel</button>
          <button
            disabled={loading}
            onClick={submit}
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
