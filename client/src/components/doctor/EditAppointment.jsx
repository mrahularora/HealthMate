import React, { useState, useEffect, useContext, useCallback } from "react";
import { getAllTimeSlots, deleteAvailableSlot } from "../../services/appointmentService"; // Import API calls
import { AuthContext } from "../../context/AuthContext"; // Import AuthContext

const EditAppointments = () => {
  const { user } = useContext(AuthContext);
  const [allSlots, setAllSlots] = useState([]);
  const [error, setError] = useState(null);

  // Fetch all time slots
  const fetchAllSlots = useCallback(async () => {
    try {
      const response = await getAllTimeSlots(user.id);
      setAllSlots(response);
    } catch (err) {
      console.error("Error fetching slots:", err);
      setError("Failed to fetch slots.");
    }
  }, [user]);

  // Fetch slots on component load
  useEffect(() => {
    if (user?.role === "Doctor") {
      fetchAllSlots();
    }
  }, [user, fetchAllSlots]);

  const handleDeleteSlot = async (slot) => {
    try {
      await deleteAvailableSlot({
        doctorId: user.id,
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
      });
      alert("Slot deleted successfully.");
      fetchAllSlots(); // Refresh slots after deletion
    } catch (err) {
      console.error("Error deleting slot:", err);
      setError("Failed to delete slot.");
    }
  };

  return (
    <div className="view-slots mt-4">
      <h5 className="greeting">View and Manage Slots</h5>
      <p>
        Efficiently manage your appointment slots with ease. Under this section, you can view all available, 
        booked, and past slots to make sure that you are organized and in control. Update timings easily, manage availability.
      </p>

      {error && <p className="error-text">{error}</p>}

      {allSlots.length > 0 ? (
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {allSlots.map((slot, index) => (
              <tr key={index}>
                <td>{new Date(slot.date).toLocaleDateString()}</td>
                <td>{slot.startTime}</td>
                <td>{slot.endTime}</td>
                <td>{slot.status}</td>
                <td>
                  {slot.status === "Available" ? (
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeleteSlot(slot)}
                    >
                      Delete
                    </button>
                  ) : (
                    <span>Not Deletable</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No slots available.</p>
      )}
    </div>
  );
};

export default EditAppointments;
