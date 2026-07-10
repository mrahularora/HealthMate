import React, { useEffect, useState } from "react";
import { getAppointments, cancelAppointment } from "../../services/appointmentService";
import Sidebar from "../common/Sidebar";
import "../../css/userappointments.css";

const UserAppointments = () => {
  const [appointments, setAppointments] = useState({ upcoming: [], past: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loggedInUserEmail = JSON.parse(localStorage.getItem("user"))?.email || "";

  const filterValidAppointments = (appointments) => {
    return appointments
      .map((appointment) => ({
        ...appointment,
        timeSlots: appointment.timeSlots.filter(
          (slot) => slot.userDetails?.email === loggedInUserEmail
        ),
      }))
      .filter((appointment) => appointment.timeSlots.length > 0);
  };

  const categorizeAppointments = (appointments) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = [];
    const past = [];

    appointments.forEach((appointment) => {
      const appointmentDate = new Date(appointment.date);
      appointmentDate.setHours(0, 0, 0, 0);

      if (appointmentDate >= today) {
        upcoming.push(appointment);
      } else {
        past.push(appointment);
      }
    });

    upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
    past.sort((a, b) => new Date(b.date) - new Date(a.date));

    return { upcoming, past };
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await getAppointments();
        const filteredAppointments = filterValidAppointments(data.appointments);
        const { upcoming, past } = categorizeAppointments(filteredAppointments);
        setAppointments({ upcoming, past });
      } catch (err) {
        setError("Failed to fetch appointments");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (time) => {
    return new Date(`1970-01-01T${time}:00`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleCancel = async (appointmentId, slotId) => {
    const isConfirmed = window.confirm("Are you sure you want to cancel this appointment?");
    if (isConfirmed) {
      try {
        await cancelAppointment(appointmentId, slotId);
        setAppointments((prevState) => {
          const updatedUpcoming = prevState.upcoming.map((appointment) => {
            if (appointment._id === appointmentId) {
              return {
                ...appointment,
                timeSlots: appointment.timeSlots.map((slot) => {
                  if (slot._id === slotId) {
                    return { ...slot, status: "Cancelled" };
                  }
                  return slot;
                }),
              };
            }
            return appointment;
          });
          return { ...prevState, upcoming: updatedUpcoming };
        });
      } catch {
        setError("Failed to cancel the appointment");
      }
    }
  };

  return (
    <div className="appointments-page">
      <Sidebar />
      <div className="appointments-container">
        {loading && <div className="loading-message">Loading...</div>}
        {error && <div className="error-message">{error}</div>}
        {!loading && !error && (
          <>
            <h2 className="appointments-heading">Your Appointments</h2>

            <div className="appointment-category-card">
              <h3 className="appointment-subheading">Upcoming Appointments</h3>
              {appointments.upcoming.length > 0 ? (
                <ul className="appointment-list">
                  {appointments.upcoming.map((appointment) => (
                    <li key={appointment._id} className="appointment-card">
                      {appointment.timeSlots.map((slot) => (
                        <div key={slot._id}>
                          <div className={`status ${slot.status}`}>{slot.status}</div>
                          <div className="appointment-details-card">
                            <div className="appointment-info">
                              <strong>Doctor:</strong> {appointment.doctorDetails?.name} (
                              {appointment.doctorDetails?.specialty})
                            </div>
                            <div className="appointment-info">
                              <strong>Date:</strong> {formatDate(appointment.date)}
                            </div>
                            <div className="appointment-info">
                              <strong>Time:</strong> {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                            </div>
                          </div>
                          <div className="action-buttons">
                            <button
                              className="cancel-button"
                              disabled={slot.status === "Cancelled"}
                              onClick={() => handleCancel(appointment._id, slot._id)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ))}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-appointments">No upcoming appointments.</p>
              )}
            </div>

            <div className="appointment-category-card">
              <h3 className="appointment-subheading">Past Appointments</h3>
              {appointments.past.length > 0 ? (
                <ul className="appointment-list">
                  {appointments.past.map((appointment) => (
                    <li key={appointment._id} className="appointment-card">
                      {appointment.timeSlots.map((slot) => (
                        <div key={slot._id}>
                          <div className={`status ${slot.status}`}>{slot.status}</div>
                          <div className="appointment-details-card">
                            <div className="appointment-info">
                              <strong>Doctor:</strong> {appointment.doctorDetails?.name} (
                              {appointment.doctorDetails?.specialty})
                            </div>
                            <div className="appointment-info">
                              <strong>Date:</strong> {formatDate(appointment.date)}
                            </div>
                            <div className="appointment-info">
                              <strong>Time:</strong> {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-appointments">No past appointments.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserAppointments;