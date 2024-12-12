import React, { useEffect, useState } from "react";
import { getAppointments, cancelAppointment } from "../../services/appointmentService";
import "../../css/userappointments.css";

const UserAppointments = () => {
  const [appointments, setAppointments] = useState({ upcoming: [], past: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        const { upcoming, past } = categorizeAppointments(data.appointments);
        setAppointments({ upcoming, past });
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch appointments");
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

  const getStatusColor = (status) => {
    switch (status) {
      case "Available":
        return "green";
      case "Requested":
        return "orange";
      case "Confirmed":
        return "blue";
      case "Cancelled":
        return "red";
      case "Completed":
        return "purple";
      case "No-Show":
        return "gray";
      case "Rescheduled":
        return "yellow";
      default:
        return "black";
    }
  };

  const handleCancel = async (appointmentId, slotId) => {
    // Show a confirmation prompt before canceling the appointment
    const isConfirmed = window.confirm("Are you sure you want to cancel this appointment?");
  
    if (isConfirmed) {
      try {
        // Call the cancelAppointment service with the appointment ID and slot ID
        await cancelAppointment(appointmentId, slotId);
        
        // Update the state to reflect the change
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
    } else {
      console.log("Appointment cancellation aborted.");
    }
  };  

  if (loading)
    return <div className="user-appointments-loading">Loading...</div>;
  if (error) return <div className="user-appointments-error">{error}</div>;

  return (
    <div className="user-appointments-container">
      <h2>User Appointments</h2>

      <h3>Upcoming Appointments</h3>
      {appointments.upcoming.length > 0 ? (
        <ul>
          {appointments.upcoming.map((appointment) => (
            <li
              key={appointment._id}
              className="user-appointments-appointment-card"
            >
              <div
                className={`user-appointments-status ${getStatusColor(
                  appointment.timeSlots[0]?.status
                )}`}
              >
                {appointment.timeSlots[0]?.status}
              </div>
              <div className="user-appointments-appointment-details">
                <div>
                  <strong>Doctor:</strong> {appointment.doctorId.name} (
                  {appointment.doctorId.specialty})
                </div>
                <div>
                  <strong>Date:</strong> {formatDate(appointment.date)}
                </div>
              </div>
              <div className="user-appointments-date-time">
                {appointment.timeSlots.map((slot) => (
                  <div key={slot._id} className="user-appointments-time-slot">
                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                  </div>
                ))}
              </div>
              <div className="user-appointments-buttons">
                <button
                  className="user-appointments-btn cancel"
                  disabled={appointment.timeSlots[0]?.status === "Cancelled"}
                  onClick={() =>
                    handleCancel(appointment._id, appointment.timeSlots[0]._id)
                  }
                >
                  Cancel
                </button>
                <button
                  className="user-appointments-btn reschedule"
                  disabled={true}
                >
                  Reschedule
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="user-appointments-no-appointments">
          No upcoming appointments.
        </p>
      )}

      <h3>Past Appointments</h3>
      {appointments.past.length > 0 ? (
        <ul>
          {appointments.past.map((appointment) => (
            <li
              key={appointment._id}
              className="user-appointments-appointment-card"
            >
              <div
                className={`user-appointments-status ${getStatusColor(
                  appointment.timeSlots[0]?.status
                )}`}
              >
                {appointment.timeSlots[0]?.status}
              </div>
              <div className="user-appointments-appointment-details">
                <div>
                  <strong>Doctor:</strong> {appointment.doctorId.name} (
                  {appointment.doctorId.specialty})
                </div>
                <div>
                  <strong>Date:</strong> {formatDate(appointment.date)}
                </div>
              </div>
              <div className="user-appointments-date-time">
                {appointment.timeSlots.map((slot) => (
                  <div key={slot._id} className="user-appointments-time-slot">
                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="user-appointments-no-appointments">
          No past appointments.
        </p>
      )}
    </div>
  );
};

export default UserAppointments;
