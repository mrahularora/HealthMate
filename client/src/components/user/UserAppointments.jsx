import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  cancelAppointment,
  getAppointments,
} from "../../services/appointmentService";
import Sidebar from "../common/Sidebar";
import "../../css/sidebar.css";
import "../../css/userappointments.css";

const CANCELLABLE_STATUSES = ["Requested", "Confirmed"];
const HISTORY_STATUSES = ["Completed", "Cancelled"];

const getAppointmentTime = (date, time) => {
  const [year, month, day] = String(date).slice(0, 10).split("-").map(Number);
  const [hours = 0, minutes = 0] = String(time || "00:00")
    .split(":")
    .map(Number);

  return new Date(year, month - 1, day, hours, minutes);
};

const formatDate = (date) => {
  const [year, month, day] = String(date).slice(0, 10).split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString("en-CA", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatTime = (time) => {
  const [hours = 0, minutes = 0] = String(time || "00:00")
    .split(":")
    .map(Number);

  return new Date(1970, 0, 1, hours, minutes).toLocaleTimeString("en-CA", {
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatStatus = (status) =>
  status === "InProgress" ? "In progress" : status || "Unknown";

const UserAppointments = () => {
  const [appointmentSlots, setAppointmentSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingSlotId, setCancellingSlotId] = useState(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getAppointments();
      const appointments = Array.isArray(data?.appointments)
        ? data.appointments
        : [];

      const slots = appointments.flatMap((appointment) =>
        (appointment.timeSlots || []).map((slot) => ({
          appointmentId: appointment._id,
          date: appointment.date,
          doctorDetails: appointment.doctorDetails,
          slot,
        }))
      );

      setAppointmentSlots(slots);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "We could not load your appointments. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const appointments = useMemo(() => {
    const now = new Date();
    const upcoming = [];
    const past = [];

    appointmentSlots.forEach((appointment) => {
      const appointmentEnd = getAppointmentTime(
        appointment.date,
        appointment.slot.endTime
      );

      if (
        HISTORY_STATUSES.includes(appointment.slot.status) ||
        appointmentEnd < now
      ) {
        past.push(appointment);
      } else {
        upcoming.push(appointment);
      }
    });

    upcoming.sort(
      (a, b) =>
        getAppointmentTime(a.date, a.slot.startTime) -
        getAppointmentTime(b.date, b.slot.startTime)
    );
    past.sort(
      (a, b) =>
        getAppointmentTime(b.date, b.slot.startTime) -
        getAppointmentTime(a.date, a.slot.startTime)
    );

    return { upcoming, past };
  }, [appointmentSlots]);

  const handleCancel = async (appointmentId, slotId) => {
    if (!window.confirm("Cancel this appointment?")) {
      return;
    }

    setCancellingSlotId(slotId);
    setError("");

    try {
      await cancelAppointment(appointmentId, slotId);
      setAppointmentSlots((currentSlots) =>
        currentSlots.map((appointment) =>
          appointment.slot._id === slotId
            ? {
                ...appointment,
                slot: {
                  ...appointment.slot,
                  isBooked: false,
                  status: "Cancelled",
                },
              }
            : appointment
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "We could not cancel the appointment. Please try again."
      );
    } finally {
      setCancellingSlotId(null);
    }
  };

  const renderAppointment = (appointment) => {
    const { appointmentId, date, doctorDetails, slot } = appointment;
    const canCancel = CANCELLABLE_STATUSES.includes(slot.status);
    const statusClass = String(slot.status || "unknown").toLowerCase();

    return (
      <li key={`${appointmentId}-${slot._id}`} className="patient-appointment-card">
        <div className="patient-appointment-card__header">
          <div>
            <p className="patient-appointment-card__label">Doctor</p>
            <h3>{doctorDetails?.name || "Doctor unavailable"}</h3>
          </div>
          <span className={`patient-appointment-status ${statusClass}`}>
            {formatStatus(slot.status)}
          </span>
        </div>

        <dl className="patient-appointment-details">
          <div>
            <dt>Date</dt>
            <dd>{formatDate(date)}</dd>
          </div>
          <div>
            <dt>Time</dt>
            <dd>
              {formatTime(slot.startTime)} to {formatTime(slot.endTime)}
            </dd>
          </div>
        </dl>

        {canCancel && (
          <div className="patient-appointment-card__actions">
            <button
              type="button"
              className="patient-appointment-cancel"
              disabled={cancellingSlotId === slot._id}
              onClick={() => handleCancel(appointmentId, slot._id)}
            >
              {cancellingSlotId === slot._id ? "Cancelling..." : "Cancel appointment"}
            </button>
          </div>
        )}
      </li>
    );
  };

  return (
    <div className="user-appointments-page">
      <Sidebar />
      <main className="user-appointments-main">
        <header className="user-appointments-header">
          <p className="user-appointments-eyebrow">Patient portal</p>
          <h1>My appointments</h1>
          <p>Review upcoming visits and your appointment history.</p>
        </header>

        {error && (
          <div className="user-appointments-alert" role="alert">
            <span>{error}</span>
            <button type="button" onClick={fetchAppointments}>
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <div className="user-appointments-state" role="status">
            Loading appointments...
          </div>
        ) : (
          <>
            <section className="user-appointments-section" aria-labelledby="upcoming-title">
              <div className="user-appointments-section__heading">
                <h2 id="upcoming-title">Upcoming</h2>
                <span>{appointments.upcoming.length}</span>
              </div>
              {appointments.upcoming.length > 0 ? (
                <ul className="patient-appointment-list">
                  {appointments.upcoming.map(renderAppointment)}
                </ul>
              ) : (
                <div className="user-appointments-empty">
                  <h3>No upcoming appointments</h3>
                  <p>Your newly requested or confirmed appointments will appear here.</p>
                </div>
              )}
            </section>

            <section className="user-appointments-section" aria-labelledby="history-title">
              <div className="user-appointments-section__heading">
                <h2 id="history-title">History</h2>
                <span>{appointments.past.length}</span>
              </div>
              {appointments.past.length > 0 ? (
                <ul className="patient-appointment-list">
                  {appointments.past.map(renderAppointment)}
                </ul>
              ) : (
                <div className="user-appointments-empty">
                  <h3>No appointment history</h3>
                  <p>Completed and cancelled appointments will appear here.</p>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default UserAppointments;
