import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getAcceptedAppointments,
  getAppointmentRequests,
} from "../../services/appointmentService";
import { AuthContext } from "../../context/AuthContext";
import "../../css/doctorpage.css";

const statusLabels = {
  Confirmed: "Confirmed",
  InProgress: "In progress",
  Completed: "Completed",
  Requested: "Requested",
};

const formatDate = (date) => {
  if (!date) return "Date pending";

  return new Date(date).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const formatFullDate = (date) => {
  if (!date) return "No appointment selected";

  return new Date(date).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const getSlotTime = (appointment) =>
  [appointment?.startTime, appointment?.endTime].filter(Boolean).join(" - ") ||
  "Time pending";

const getPatientName = (appointment) => {
  const details = appointment?.userDetails || appointment?.bookedBy || {};
  return (
    [details.firstName, details.lastName].filter(Boolean).join(" ") ||
    details.name ||
    "Patient"
  );
};

const getDoctorName = (user) =>
  [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
  user?.name ||
  "Doctor";

const getDoctorId = (user) => user?.id || user?._id || user?.doctorId;

const sortAppointments = (appointments) =>
  [...appointments].sort((first, second) => {
    const firstTime = new Date(first.date || 0).getTime();
    const secondTime = new Date(second.date || 0).getTime();

    if (firstTime !== secondTime) return firstTime - secondTime;
    return String(first.startTime || "").localeCompare(String(second.startTime || ""));
  });

const DoctorDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const doctorId = getDoctorId(user);

  const fetchDashboardData = useCallback(async () => {
    if (!user || user.role !== "Doctor") {
      setError("You are not authorized to view this page.");
      setLoading(false);
      return;
    }

    if (!doctorId) {
      setError("Doctor profile is missing an account ID. Please log in again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [acceptedResponse, requestResponse] = await Promise.all([
        getAcceptedAppointments(doctorId),
        getAppointmentRequests(doctorId),
      ]);

      setAppointments(Array.isArray(acceptedResponse) ? acceptedResponse : []);
      setRequests(Array.isArray(requestResponse) ? requestResponse : []);
    } catch (err) {
      console.error("Error fetching doctor dashboard data:", err);
      setError(
        err?.response?.data?.message ||
          "Failed to load doctor dashboard data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [doctorId, user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const dashboardData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const accepted = appointments.filter((appointment) => appointment.status === "Confirmed");
    const inProgress = appointments.filter((appointment) => appointment.status === "InProgress");
    const completed = appointments.filter((appointment) => appointment.status === "Completed");
    const upcoming = sortAppointments(
      appointments.filter((appointment) => {
        const date = new Date(appointment.date);
        date.setHours(0, 0, 0, 0);
        return appointment.status !== "Completed" && date >= today;
      })
    );
    const todayAppointments = appointments.filter((appointment) => {
      const date = new Date(appointment.date);
      date.setHours(0, 0, 0, 0);
      return date.getTime() === today.getTime() && appointment.status !== "Completed";
    });
    const recentPatients = sortAppointments(appointments)
      .filter((appointment) => appointment.userDetails || appointment.bookedBy)
      .slice(-4)
      .reverse();

    return {
      accepted,
      inProgress,
      completed,
      upcoming,
      todayAppointments,
      recentPatients,
    };
  }, [appointments]);

  const nextAppointment = dashboardData.upcoming[0];

  const metricCards = [
    {
      label: "Upcoming visits",
      value: dashboardData.accepted.length,
      helper: "Confirmed appointments waiting for consultation",
      tone: "blue",
    },
    {
      label: "Requests",
      value: requests.length,
      helper: "Patient requests that need your review",
      tone: "pink",
    },
    {
      label: "In progress",
      value: dashboardData.inProgress.length,
      helper: "Consultations currently being handled",
      tone: "teal",
    },
    {
      label: "Completed",
      value: dashboardData.completed.length,
      helper: "Visits completed with notes or prescriptions",
      tone: "green",
    },
  ];

  const handleViewDetails = (appointment) => {
    if (!appointment?.appointmentId || !appointment?._id) return;
    navigate(`/appointment-details/${appointment.appointmentId}/${appointment._id}`);
  };

  if (loading) {
    return (
      <main className="doctor-dashboard">
        <section className="doctor-dashboard__hero is-loading">
          <span />
          <span />
          <span />
        </section>
        <section className="doctor-dashboard__stats">
          {[0, 1, 2, 3].map((item) => (
            <div className="doctor-dashboard__skeleton-card" key={item} />
          ))}
        </section>
      </main>
    );
  }

  return (
    <main className="doctor-dashboard">
      <section className="doctor-dashboard__hero">
        <div>
          <p className="doctor-dashboard__eyebrow">Doctor workspace</p>
          <h1>Welcome, Dr. {getDoctorName(user)}</h1>
          <p>
            Review today's schedule, respond to booking requests, and continue
            consultations from one focused dashboard.
          </p>
          <div className="doctor-dashboard__hero-actions">
            <Link to="/CreateAppointment">Create slots</Link>
            <Link to="/RequestedAppointments" className="is-secondary">
              Review requests
            </Link>
          </div>
        </div>

        <aside className="doctor-dashboard__next-card">
          <span>Next appointment</span>
          {nextAppointment ? (
            <>
              <strong>{getPatientName(nextAppointment)}</strong>
              <p>{formatFullDate(nextAppointment.date)}</p>
              <small>{getSlotTime(nextAppointment)}</small>
              <button onClick={() => handleViewDetails(nextAppointment)} type="button">
                View visit
              </button>
            </>
          ) : (
            <>
              <strong>No upcoming visits</strong>
              <p>Your confirmed schedule is clear.</p>
              <small>Create slots or review pending requests.</small>
            </>
          )}
        </aside>
      </section>

      {error && (
        <div className="doctor-dashboard__alert">
          <span>{error}</span>
          <button onClick={fetchDashboardData} type="button">
            Retry
          </button>
        </div>
      )}

      <section className="doctor-dashboard__stats" aria-label="Doctor statistics">
        {metricCards.map((card) => (
          <article className={`doctor-dashboard__stat is-${card.tone}`} key={card.label}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <p>{card.helper}</p>
          </article>
        ))}
      </section>

      <section className="doctor-dashboard__grid">
        <article className="doctor-dashboard__panel doctor-dashboard__panel--wide">
          <div className="doctor-dashboard__panel-heading">
            <div>
              <p className="doctor-dashboard__eyebrow">Schedule</p>
              <h2>Upcoming appointments</h2>
            </div>
            <Link to="/AcceptedAppointments">View all</Link>
          </div>

          {dashboardData.upcoming.length > 0 ? (
            <div className="doctor-dashboard__appointment-list">
              {dashboardData.upcoming.slice(0, 5).map((appointment) => (
                <button
                  className="doctor-dashboard__appointment"
                  key={appointment._id}
                  onClick={() => handleViewDetails(appointment)}
                  type="button"
                >
                  <div>
                    <strong>{getPatientName(appointment)}</strong>
                    <span>{appointment.userDetails?.illness || "Consultation"}</span>
                  </div>
                  <div>
                    <span>{formatDate(appointment.date)}</span>
                    <small>{getSlotTime(appointment)}</small>
                  </div>
                  <em>{statusLabels[appointment.status] || appointment.status}</em>
                </button>
              ))}
            </div>
          ) : (
            <div className="doctor-dashboard__empty">
              <h3>No upcoming appointments</h3>
              <p>Confirmed and in-progress visits will appear here.</p>
              <Link to="/CreateAppointment">Open slot creator</Link>
            </div>
          )}
        </article>

        <aside className="doctor-dashboard__panel">
          <div className="doctor-dashboard__panel-heading">
            <div>
              <p className="doctor-dashboard__eyebrow">Today</p>
              <h2>{dashboardData.todayAppointments.length} visits</h2>
            </div>
          </div>
          <div className="doctor-dashboard__today-list">
            {dashboardData.todayAppointments.length > 0 ? (
              dashboardData.todayAppointments.map((appointment) => (
                <button
                  key={appointment._id}
                  onClick={() => handleViewDetails(appointment)}
                  type="button"
                >
                  <strong>{getSlotTime(appointment)}</strong>
                  <span>{getPatientName(appointment)}</span>
                </button>
              ))
            ) : (
              <p>No visits booked for today.</p>
            )}
          </div>
        </aside>

        <article className="doctor-dashboard__panel">
          <div className="doctor-dashboard__panel-heading">
            <div>
              <p className="doctor-dashboard__eyebrow">Queue</p>
              <h2>Pending requests</h2>
            </div>
            <Link to="/RequestedAppointments">{requests.length}</Link>
          </div>
          <div className="doctor-dashboard__request-list">
            {requests.length > 0 ? (
              requests.slice(0, 4).map((request) => (
                <div key={request._id}>
                  <strong>{getPatientName(request)}</strong>
                  <span>
                    {formatDate(request.date)} · {getSlotTime(request)}
                  </span>
                </div>
              ))
            ) : (
              <p>No booking requests waiting.</p>
            )}
          </div>
        </article>

        <article className="doctor-dashboard__panel">
          <div className="doctor-dashboard__panel-heading">
            <div>
              <p className="doctor-dashboard__eyebrow">Patients</p>
              <h2>Recent activity</h2>
            </div>
            <Link to="/Patients">Patients</Link>
          </div>
          <div className="doctor-dashboard__patient-list">
            {dashboardData.recentPatients.length > 0 ? (
              dashboardData.recentPatients.map((appointment) => (
                <div key={`${appointment.appointmentId}-${appointment._id}`}>
                  <span>{getPatientName(appointment).slice(0, 1)}</span>
                  <div>
                    <strong>{getPatientName(appointment)}</strong>
                    <small>
                      {appointment.userDetails?.illness || "Visit"} ·{" "}
                      {statusLabels[appointment.status] || appointment.status}
                    </small>
                  </div>
                </div>
              ))
            ) : (
              <p>No patient activity yet.</p>
            )}
          </div>
        </article>
      </section>
    </main>
  );
};

export default DoctorDashboard;
