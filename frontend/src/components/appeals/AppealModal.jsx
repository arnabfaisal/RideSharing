import { useState } from 'react';
import { submitAppeal } from '../../services/appealService';

export default function AppealModal({ email, onClose }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email) {
      alert('Unable to identify account for appeal');
      return;
    }

    if (!message.trim()) {
      alert('Please explain your reason');
      return;
    }

    setLoading(true);
    try {
      await submitAppeal(email, message);
      alert('Appeal submitted');
      onClose();
    } catch (e) {
      alert(e.message || 'Failed to submit appeal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded w-96">
        <h3 className="font-bold mb-2">Appeal Suspension</h3>

        <textarea
          className="w-full border p-2 mb-3"
          rows={4}
          placeholder="Explain why your suspension should be lifted"
          value={message}
          onChange={e => setMessage(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="border px-3 py-1">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="bg-orange-600 text-white px-3 py-1"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
