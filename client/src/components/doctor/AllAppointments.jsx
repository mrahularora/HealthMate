import React, { useState, useEffect, useContext } from "react";
import { getAcceptedAppointments } from "../../services/appointmentService";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Sidebar from "../common/Sidebar";
import "../../css/allappointments.css";

const AcceptedAppointments = () => {
  const { user } = useContext(AuthContext); // Get doctor details from AuthContext
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchAcceptedAppointments = async () => {
    try {
      if (user.role !== "Doctor") {
        setError("You are not authorized to view this page.");
        return;
      }

      const response = await getAcceptedAppointments(user.id);
      setAppointments(response);
    } catch (err) {
      console.error("Error fetching accepted appointments:", err);
      setError("Failed to fetch accepted appointments.");
    }
  };

  useEffect(() => {
    fetchAcceptedAppointments();
  }, []);

  // Categorize appointments by status
  const confirmedAppointments = appointments.filter(
    (app) => app.status === "Confirmed"
  );
  const inProgressAppointments = appointments.filter(
    (app) => app.status === "InProgress"
  );
  const completedAppointments = appointments.filter(
    (app) => app.status === "Completed"
  );

  const handleViewDetails = (appointmentId, slotId) => {
    navigate(`/appointment-details/${appointmentId}/${slotId}`);
  };

  return (
    <div className="page-container">
      <Sidebar />
      <div className="content">
      <h5 className="greeting mb-4">All Appointments</h5>
      <p>The All Appointments section gives a detailed look at all appointments sorted by their status. 
        It helps you to manage and follow meetings easily, making things clear and organized.</p>
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Confirmed Appointments */}
      <div className="mb-5 mt-5">
        <h4 className="heading">Accepted Appointments</h4>
        <p>This section shows appointments that have been accepted and are scheduled for consultation. 
        This section will help you keep track of upcoming visits from patients and prepare in time for each session.</p>

        <div className="row">
          {confirmedAppointments.length > 0 ? (
            confirmedAppointments.map((appointment) => (
              <div className="col-md-4" key={appointment._id}>
                <div className="card shadow-sm mb-4">
                  <div className="card-body">
                    <h5 className="card-title">
                      {appointment.userDetails?.firstName}{" "}
                      {appointment.userDetails?.lastName}
                    </h5>
                    <p className="card-text">
                      <strong>Date:</strong>{" "}
                      {new Date(appointment.date).toLocaleDateString()}
                    </p>
                    <p className="card-text">
                      <strong>Time:</strong> {appointment.startTime} -{" "}
                      {appointment.endTime}
                    </p>
                    <p className="card-text">
                      <strong>Illness:</strong>{" "}
                      {appointment.userDetails?.illness}
                    </p>
                    <button
                      className="btn"
                      onClick={() =>
                        handleViewDetails(
                          appointment.appointmentId,
                          appointment._id
                        )
                      }
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted">No confirmed appointments available.</p>
          )}
        </div>
      </div>

      {/* In-Progress Appointments */}
      <div className="mb-5">
        <h4 className="heading">In-Progress Appointments</h4>
        <p>View appointments currently in progress. This section shows live updates of ongoing consultations, 
        allowing you to be informed and manage interactions with patients effectively.</p>
        <div className="row">
          {inProgressAppointments.length > 0 ? (
            inProgressAppointments.map((appointment) => (
              <div className="col-md-4" key={appointment._id}>
                <div className="card shadow-sm mb-4">
                  <div className="card-body">
                    <h5 className="card-title">
                      {appointment.userDetails?.firstName}{" "}
                      {appointment.userDetails?.lastName}
                    </h5>
                    <p className="card-text">
                      <strong>Date:</strong>{" "}
                      {new Date(appointment.date).toLocaleDateString()}
                    </p>
                    <p className="card-text">
                      <strong>Time:</strong> {appointment.startTime} -{" "}
                      {appointment.endTime}
                    </p>
                    <p className="card-text">
                      <strong>Illness:</strong>{" "}
                      {appointment.userDetails?.illness}
                    </p>
                    <button
                      className="btn"
                      onClick={() =>
                        handleViewDetails(
                          appointment.appointmentId,
                          appointment._id
                        )
                      }
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted">No in-progress appointments available.</p>
          )}
        </div>
      </div>

      {/* Completed Appointments */}
      <div className="mb-5">
        <h4 className="heading">Completed Appointments</h4>
        <p>View the list of all completed appointments. Use this section for viewing patient histories and making final notes, as well as updating follow-up as needed.</p>
        <div className="row">
          {completedAppointments.length > 0 ? (
            completedAppointments.map((appointment) => (
              <div className="col-md-4" key={appointment._id}>
                <div className="card shadow-sm mb-4">
                  <div className="card-body">
                    <h5 className="card-title">
                      {appointment.userDetails?.firstName}{" "}
                      {appointment.userDetails?.lastName}
                    </h5>
                    <p className="card-text">
                      <strong>Date:</strong>{" "}
                      {new Date(appointment.date).toLocaleDateString()}
                    </p>
                    <p className="card-text">
                      <strong>Time:</strong> {appointment.startTime} -{" "}
                      {appointment.endTime}
                    </p>
                    <p className="card-text">
                      <strong>Illness:</strong>{" "}
                      {appointment.userDetails?.illness}
                    </p>
                    <button
                      className="btn"
                      onClick={() =>
                        handleViewDetails(
                          appointment.appointmentId,
                          appointment._id
                        )
                      }
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted">No completed appointments available.</p>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default AcceptedAppointments;
