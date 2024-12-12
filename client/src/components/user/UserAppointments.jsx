import React, { useEffect, useState, useCallback } from "react";
import { getAppointments, cancelAppointment } from "../../services/appointmentService";
import Sidebar from "../common/Sidebar";
import "../../css/userappointments.css";

const UserAppointments = () => {
  const [appointments, setAppointments] = useState({ upcoming: [], past: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getUserEmail = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.email || "";
  };

  const categorizeAppointments = useCallback((appointments) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = [];
    const past = [];

    appointments.forEach((appointment) => {
      const appointmentDate = new Date(appointment.date);

      if (appointmentDate >= today) {
        upcoming.push(appointment);
      } else {
        past.push(appointment);
      }
    });

    upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
    past.sort((a, b) => new Date(b.date) - new Date(a.date));

    return { upcoming, past };
  }, []);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const userEmail = getUserEmail();
        const data = await getAppointments();

        const userAppointments = data.appointments.filter((appointment) =>
          appointment.timeSlots.some((slot) => slot.userDetails.email === userEmail)
        );

        const { upcoming, past } = categorizeAppointments(userAppointments);
        setAppointments({ upcoming, past });
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch appointments");
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [categorizeAppointments]);

  const formatDate = (date) => {
    const formattedDate = new Date(date);
    const localDate = new Date(formattedDate.getTime() + formattedDate.getTimezoneOffset() * 60000);
    return localDate.toLocaleDateString("en-US", {
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
      } catch (error) {
        setError("Failed to cancel the appointment");
      }
    }
  };

  if (loading) return <div className="user-appointments-loading">Loading...</div>;
  if (error) return <div className="user-appointments-error">{error}</div>;

  return (
    <div className="user-page">
      <Sidebar />
      <div className="appointments-container">
        <h2 className="greeting">Welcome, Patient!</h2>

        <h3 className="records-title">Upcoming Appointments</h3>
        {appointments.upcoming.length > 0 ? (
          <ul className="appointments-list">
            {appointments.upcoming.map((appointment) => (
              <li key={appointment._id} className="appointment-card">
                <div className={`status ${appointment.timeSlots[0]?.status}`}>
                  {appointment.timeSlots[0]?.status}
                </div>
                <div className="appointment-details">
                  <div className="appointment-info">
                    <strong>Doctor:</strong> {appointment.doctorDetails?.name} ({appointment.doctorDetails?.specialty})
                  </div>
                  <div className="appointment-info">
                    <strong>Date:</strong> {formatDate(appointment.date)}
                  </div>
                  <div className="appointment-info">
                    <strong>Time:</strong>
                    {appointment.timeSlots.map((slot) => (
                      <div key={slot._id} className="time-slot">
                        {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="action-buttons">
                  <button
                    className="cancel-button"
                    disabled={[
                      "Cancelled",
                      "Completed",
                      "InProgress",
                    ].includes(appointment.timeSlots[0]?.status)}
                    onClick={() => handleCancel(appointment._id, appointment.timeSlots[0]._id)}
                  >
                    Cancel
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No upcoming appointments.</p>
        )}

        <h3 className="records-title">Past Appointments</h3>
        {appointments.past.length > 0 ? (
          <ul className="appointments-list">
            {appointments.past.map((appointment) => (
              <li key={appointment._id} className="appointment-card">
                <div className={`status ${appointment.timeSlots[0]?.status}`}>
                  <strong>{appointment.timeSlots[0]?.status}</strong>
                </div>
                <div className="appointment-details">
                  <div className="appointment-info">
                    <strong>Doctor:</strong> {appointment.doctorDetails?.name} ({appointment.doctorDetails?.specialty})
                  </div>
                  <div className="appointment-info">
                    <strong>Date:</strong> {formatDate(appointment.date)}
                  </div>
                  <div className="appointment-info">
                    <strong>Time:</strong>
                    {appointment.timeSlots.map((slot) => (
                      <div key={slot._id} className="time-slot">
                        {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                      </div>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No past appointments.</p>
        )}
      </div>
    </div>
  );
};

export default UserAppointments;