import React, { useState, useEffect } from "react";
import { getAllAppointments, getAppointmentDetails } from "../../services/adminService";
import Sidebar from "../common/Sidebar";

const AllAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [error, setError] = useState(null);

  const fetchAppointments = async () => {
    try {
      const response = await getAllAppointments();
      setAppointments(response);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError(err.message || "Failed to fetch appointments.");
    }
  };

  const fetchAppointmentDetails = async (id) => {
    try {
      const response = await getAppointmentDetails(id);
      setSelectedAppointment(response);
    } catch (err) {
      console.error("Error fetching appointment details:", err);
      setError(err.message || "Failed to fetch appointment details.");
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <div className="page-container">
      <Sidebar />
      <div className="content">
        <h5 className="greeting">All Appointments</h5>
        {error && <div className="alert alert-danger">{error}</div>}

        {!selectedAppointment && !selectedSlot ? (
          <div className="row">
            {appointments.map((appointment) => (
              <div className="col-md-6" key={appointment._id}>
                <div className="card shadow-sm mb-4">
                  <div className="card-body">
                    <h5 className="card-title">
                      Doctor: {appointment.doctorId.firstName}{" "}
                      {appointment.doctorId.lastName}
                    </h5>
                    <p className="card-text">
                      <strong>Date:</strong>{" "}
                      {new Date(appointment.date).toLocaleDateString()}
                    </p>
                    <p className="card-text">
                      <strong>Time Slots:</strong>{" "}
                      {appointment.timeSlots.length}
                    </p>
                    <button
                      className="btn btn-primary"
                      onClick={() => fetchAppointmentDetails(appointment._id)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : selectedAppointment && !selectedSlot ? (
          <div>
            <button
              className="btn btn-secondary mb-4"
              onClick={() => setSelectedAppointment(null)}
            >
              Back to Appointments
            </button>
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Appointment Details</h5>
                <h6>Doctor Details</h6>
                <p>
                  <strong>Name:</strong> {selectedAppointment.doctorId.firstName}{" "}
                  {selectedAppointment.doctorId.lastName}
                </p>
                <p>
                  <strong>Email:</strong> {selectedAppointment.doctorId.email}
                </p>
                <p>
                  <strong>Specialization:</strong>{" "}
                  {selectedAppointment.doctorId.specialization}
                </p>

                <h6 className="mt-4">All Appointment Slots</h6>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Slot Time</th>
                      <th>Status</th>
                      <th>Patient</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedAppointment.timeSlots.map((slot, index) => (
                      <tr key={index}>
                        <td>
                          {slot.startTime} - {slot.endTime}
                        </td>
                        <td>{slot.status}</td>
                        <td>
                          {slot.userDetails
                            ? `${slot.userDetails.firstName} ${slot.userDetails.lastName}`
                            : "N/A"}
                        </td>
                        <td>
                          <button
                            className="btn btn-info"
                            onClick={() => setSelectedSlot(slot)}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <button
              className="btn btn-secondary mb-4"
              onClick={() => setSelectedSlot(null)}
            >
              Back to Slots
            </button>
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Slot Details</h5>
                <p>
                  <strong>Time:</strong> {selectedSlot.startTime} -{" "}
                  {selectedSlot.endTime}
                </p>
                <p>
                  <strong>Status:</strong> {selectedSlot.status}
                </p>
                {selectedSlot.userDetails ? (
                  <>
                    <h6>Patient Details</h6>
                    <p>
                      <strong>Name:</strong>{" "}
                      {selectedSlot.userDetails.firstName}{" "}
                      {selectedSlot.userDetails.lastName}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedSlot.userDetails.email}
                    </p>
                    <p>
                      <strong>Illness:</strong> {selectedSlot.userDetails.illness}
                    </p>
                  </>
                ) : (
                  <p>No patient details available for this slot.</p>
                )}
                {selectedSlot.prescription && (
                  <>
                    <h6>Prescription</h6>
                    {selectedSlot.prescription.medicines.map((medicine, i) => (
                      <p key={i}>
                        <strong>{medicine.name}:</strong> {medicine.dosage} for{" "}
                        {medicine.duration}
                      </p>
                    ))}
                    <p>
                      <strong>Notes:</strong> {selectedSlot.prescription.notes}
                    </p>
                    <p>
                      <strong>Advice:</strong> {selectedSlot.prescription.advice}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllAppointmentsPage;
