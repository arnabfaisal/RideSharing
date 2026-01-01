import React, { useEffect, useState } from "react";
import { getAllReports, suspendUser, banUser} from "../../services/adminService";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import { reviewAppeal } from "../../services/appealService";
export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await getAllReports();
        setReports(res.reports || []);
      } catch (e) {
        console.error("Failed to load reports", e);
        alert("Failed to load reports");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

const handleSuspend = async (userId) => {
  const days = prompt("Suspend for how many days?");
  if (!days) return;

  const numDays = Number(days);
  if (isNaN(numDays) || numDays <= 0) {
    alert("Invalid number of days");
    return;
  }

  try {
    await suspendUser(userId, numDays);
    alert(`User suspended for ${numDays} days`);

    // 🔄 REFRESH REPORT LIST HERE
    const res = await getAllReports();
    setReports(res.reports || []);

  } catch (e) {
    console.error(e);
    alert(e.message || "Failed to suspend user");
  }
};



  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto py-10 px-4">
        <h2 className="text-2xl font-semibold mb-4">Reported Users</h2>

        {loading && <div>Loading...</div>}

        {!loading && reports.length === 0 && (
          <div>No reports found</div>
        )}

        {!loading && reports.length > 0 && (
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Reporter</th>
                <th className="border p-2">Driver</th>
                <th className="border p-2">Category</th>
                <th className="border p-2">Description</th>
                <th className="border p-2">Trip</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(r => (
                <tr key={r._id}>
                  <td className="border p-2">
                    {r.reporter?.name} <br />
                    <span className="text-xs text-gray-500">
                      {r.reporter?.email}
                    </span>
                  </td>

                  <td className="border p-2">
                    {r.reportedUser?.name} <br />
                    <span className="text-xs text-gray-500">
                      {r.reportedUser?.email}
                    </span>
                  </td>

                  <td className="border p-2">{r.category}</td>
                  <td className="border p-2 italic">{r.description}</td>

                  <td className="border p-2">
                    {r.trip?._id}
                  </td>

{/* STATUS COLUMN */}
<td className="border p-2">
  {r.reportedUser?.isBanned && (
    <span className="text-red-600 font-bold">BANNED</span>
  )}
  {r.reportedUser?.isSuspended && !r.reportedUser?.isBanned && (
    <span className="text-yellow-600 font-medium">
      Suspended
    </span>
  )}
  {!r.reportedUser?.isBanned && !r.reportedUser?.isSuspended && (
    <span className="text-green-600 font-medium">
      Active
    </span>
  )}
</td>

{/* ACTION COLUMN */}
<td className="border p-2">
  <div className="flex flex-col gap-2 text-center">

    {/* ACTIVE USER */}
    {!r.reportedUser?.isSuspended && !r.reportedUser?.isBanned && (
      <>
        <button
          className="px-3 py-1 bg-yellow-600 text-white rounded"
          onClick={() => handleSuspend(r.reportedUser._id)}
        >
          Suspend
        </button>

        <button
          className="px-3 py-1 bg-red-700 text-white rounded"
          onClick={async () => {
            if (!window.confirm("Permanently ban this user?")) return;
            await banUser(r.reportedUser._id);

            const res = await getAllReports();
            setReports(res.reports || []);

            alert("User permanently banned");
          }}
        >
          Ban
        </button>
      </>
    )}

    {/* SUSPENDED USER */}
    {r.reportedUser?.isSuspended && !r.reportedUser?.isBanned && (
      <>
        <span className="text-yellow-700 font-bold">
          Suspended
        </span>

        <button
          className="px-3 py-1 bg-red-700 text-white rounded"
          onClick={async () => {
            if (!window.confirm("Permanently ban this user?")) return;
            await banUser(r.reportedUser._id);

            const res = await getAllReports();
            setReports(res.reports || []);

            alert("User permanently banned");
          }}
        >
          Ban
        </button>
      </>
    )}

    {/* BANNED USER */}
    {r.reportedUser?.isBanned && (
      <span className="text-red-600 font-bold">
        BANNED
      </span>
    )}
    
  </div>
  {r.reportedUser?.appealStatus === 'pending' && (
  <div className="mt-2">
    <p className="italic text-sm">
      "{r.reportedUser.appealMessage}"
    </p>

<button
  className="bg-green-600 text-white px-2 py-1 mr-2"
  onClick={async () => {
    await reviewAppeal(r.reportedUser._id, 'approved');

    const res = await getAllReports();
    setReports(res.reports || []);

    alert("Appeal approved and driver unsuspended");
  }}
>
  Approve
</button>


<button
  className="bg-gray-600 text-white px-2 py-1"
  onClick={async () => {
    await reviewAppeal(r.reportedUser._id, 'rejected');

    const res = await getAllReports();
    setReports(res.reports || []);

    alert("Appeal rejected");
  }}
>
  Reject
</button>

  </div>
)}

</td>



                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Footer />
    </div>
  );
}
