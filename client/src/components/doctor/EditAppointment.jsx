import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  deleteAvailableSlot,
  getAllTimeSlots,
} from "../../services/appointmentService";
import { AuthContext } from "../../context/AuthContext";

const getDoctorId = (user) => user?.id || user?._id || user?.doctorId;

const formatDisplayDate = (date) => {
  if (!date) return "Date pending";

  return new Date(date).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const sortSlots = (slots) =>
  [...slots].sort((first, second) => {
    const firstDate = new Date(first.date || 0).getTime();
    const secondDate = new Date(second.date || 0).getTime();

    if (firstDate !== secondDate) return firstDate - secondDate;
    return String(first.startTime || "").localeCompare(String(second.startTime || ""));
  });

const EditAppointments = ({ refreshKey = 0 }) => {
  const { user } = useContext(AuthContext);
  const [allSlots, setAllSlots] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingSlotKey, setDeletingSlotKey] = useState("");

  const doctorId = getDoctorId(user);

  const fetchAllSlots = useCallback(async () => {
    if (!doctorId) {
      setError("Doctor profile is missing an account ID. Please log in again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await getAllTimeSlots(doctorId);
      setAllSlots(Array.isArray(response) ? sortSlots(response) : []);
    } catch (err) {
      if (err.response?.status === 404) {
        setAllSlots([]);
        setError("");
      } else {
        console.error("Error fetching slots:", err);
        setError(err.response?.data?.message || "Failed to fetch slots.");
      }
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    if (user?.role === "Doctor") {
      fetchAllSlots();
    }
  }, [fetchAllSlots, refreshKey, user]);

  const slotSummary = useMemo(() => {
    return allSlots.reduce(
      (summary, slot) => {
        summary.total += 1;
        summary[slot.status] = (summary[slot.status] || 0) + 1;
        return summary;
      },
      { total: 0 }
    );
  }, [allSlots]);

  const handleDeleteSlot = async (slot) => {
    const slotKey = `${slot.date}-${slot.startTime}-${slot.endTime}`;
    const confirmed = window.confirm(
      `Delete the available slot on ${formatDisplayDate(slot.date)} from ${slot.startTime} to ${slot.endTime}?`
    );

    if (!confirmed) return;

    setDeletingSlotKey(slotKey);
    setError("");

    try {
      await deleteAvailableSlot({
        doctorId,
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
      });
      await fetchAllSlots();
    } catch (err) {
      console.error("Error deleting slot:", err);
      setError(err.response?.data?.message || "Failed to delete slot.");
    } finally {
      setDeletingSlotKey("");
    }
  };

  return (
    <section className="manage-slots">
      <div className="manage-slots__heading">
        <div>
          <p className="create-appointment__eyebrow">Published schedule</p>
          <h2>View and manage slots</h2>
          <p>
            Track available, requested, confirmed, and completed slots. Only
            available slots can be deleted.
          </p>
        </div>
        <button onClick={fetchAllSlots} type="button">
          Refresh
        </button>
      </div>

      {error && <p className="create-appointment__alert is-error">{error}</p>}

      <div className="manage-slots__stats">
        <div>
          <span>Total</span>
          <strong>{slotSummary.total}</strong>
        </div>
        <div>
          <span>Available</span>
          <strong>{slotSummary.Available || 0}</strong>
        </div>
        <div>
          <span>Requested</span>
          <strong>{slotSummary.Requested || 0}</strong>
        </div>
        <div>
          <span>Booked</span>
          <strong>
            {(slotSummary.Confirmed || 0) +
              (slotSummary.InProgress || 0) +
              (slotSummary.Completed || 0)}
          </strong>
        </div>
      </div>

      {loading ? (
        <div className="manage-slots__loading">
          <span />
          <span />
          <span />
        </div>
      ) : allSlots.length > 0 ? (
        <div className="manage-slots__table-wrap">
          <table className="manage-slots__table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {allSlots.map((slot) => {
                const slotKey = `${slot.date}-${slot.startTime}-${slot.endTime}`;
                const canDelete = slot.status === "Available";

                return (
                  <tr key={slot._id || slotKey}>
                    <td>{formatDisplayDate(slot.date)}</td>
                    <td>
                      {slot.startTime} - {slot.endTime}
                    </td>
                    <td>
                      <span className={`manage-slots__status is-${slot.status?.toLowerCase()}`}>
                        {slot.status || "Unknown"}
                      </span>
                    </td>
                    <td>
                      {canDelete ? (
                        <button
                          className="manage-slots__delete"
                          disabled={deletingSlotKey === slotKey}
                          onClick={() => handleDeleteSlot(slot)}
                          type="button"
                        >
                          {deletingSlotKey === slotKey ? "Deleting..." : "Delete"}
                        </button>
                      ) : (
                        <span className="manage-slots__locked">Locked</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="create-appointment__empty">
          <h3>No slots published yet</h3>
          <p>Published appointment slots will appear here after you create them.</p>
        </div>
      )}
    </section>
  );
};

export default EditAppointments;
