import React, { useState, useEffect, useContext, useCallback } from "react";
import { getAppointmentRequests, updateAppointmentStatus } from "../../services/appointmentService";
import { AuthContext } from "../../context/AuthContext"; // Import AuthContext
import "../../css/requestedappointments.css";
import Sidebar from "../common/Sidebar";

const AppointmentRequest = () => {
  const { user } = useContext(AuthContext); // Get logged-in user details from AuthContext
  const [requests, setRequests] = useState([]); // Holds appointment requests
  const [error, setError] = useState(null); // Holds error messages

  // Fetch appointment requests for the logged-in doctor
  const fetchRequests = useCallback(async () => {
    try {
      if (!user || user.role !== "Doctor") {
        setError("You are not authorized to view this page.");
        return;
      }

      const response = await getAppointmentRequests(user.id); // Use doctor's ID from AuthContext
      setRequests(response);
    } catch (err) {
      console.error("Error fetching appointment requests:", err);
      setError("Failed to fetch appointment requests.");
    }
  }, [user]);

  useEffect(() => {
    fetchRequests(); // Fetch requests when the component loads
  }, [fetchRequests]);

  // Handle acceptance or rejection of a request
  const handleUpdateStatus = async (appointmentId, slotId, status) => {
    try {
      await updateAppointmentStatus({
        doctorId: user.id, // Use doctorId from AuthContext
        appointmentId,
        slotId,
        status,
      });

      if (status === "Confirmed") {
        alert("Appointment confirmed successfully.");
      } else if (status === "Rejected") {
        alert("Appointment rejected successfully.");
      }

      // Refresh the requests list after status update
      fetchRequests();
    } catch (err) {
      console.error("Error updating appointment status:", err);
      setError("Failed to update appointment status.");
    }
  };

  return (
    <div className="page-container">
      <Sidebar />
      <div className="appointment-details">
        <h5 className="greeting">Appointment Requests</h5>
        {error && <p className="error">{error}</p>}
        {requests.length > 0 ? (
          <ul className="appointment-list">
            {requests.map((request) => (
              <li key={request._id} className="appointment-card">
                <div className="patient-info">
                  <p>
                    <strong>Patient Name:</strong> {request.userDetails.firstName}{" "}
                    {request.userDetails.lastName}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(request.date).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Time:</strong> {request.startTime} - {request.endTime}
                  </p>
                  <p>
                    <strong>Status:</strong> {request.status}
                  </p>
                </div>
                <div className="appointment-actions">
                  <button
                    onClick={() =>
                      handleUpdateStatus(
                        request.appointmentId,
                        request._id,
                        "Confirmed"
                      )
                    }
                    className="btn-confirm"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() =>
                      handleUpdateStatus(
                        request.appointmentId,
                        request._id,
                        "Rejected"
                      )
                    }
                    className="btn-reject"
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No appointment requests at the moment.</p>
        )}
      </div>
    </div>
  );
};

export default AppointmentRequest;
