import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Sidebar from "../components/common/Sidebar";
import { getAppointments } from "../services/appointmentService";
import { fetchDoctorsFromSchema } from "../services/doctorService";
import "../css/userpage.css";
import "../css/sidebar.css";

const flattenAppointments = (appointments) =>
  appointments.flatMap((appointment) =>
    (appointment.timeSlots || []).map((slot) => ({
      appointmentId: appointment._id,
      date: appointment.date,
      doctorDetails: appointment.doctorDetails,
      slot,
    }))
  );

const getSlotDateTime = (date, time) => new Date(`${date}T${time || "00:00"}`);

const formatDate = (date) =>
  new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const getBookableDoctorId = (doctor) => doctor.doctorId || doctor._id;

const UserPage = () => {
  const { user } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [appointmentsData, doctorsResponse] = await Promise.all([
          getAppointments(),
          fetchDoctorsFromSchema(),
        ]);

        setAppointments(
          flattenAppointments(appointmentsData?.appointments || [])
        );
        setDoctors(doctorsResponse || []);
      } catch (err) {
        console.error("Error loading patient dashboard:", err);
        setError("We could not load your dashboard right now.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const now = new Date();
  const activeAppointments = appointments.filter((appointment) =>
    ["Requested", "Confirmed", "InProgress"].includes(appointment.slot.status)
  );
  const upcomingAppointments = activeAppointments
    .filter((appointment) =>
      getSlotDateTime(appointment.date, appointment.slot.endTime) >= now
    )
    .sort(
      (first, second) =>
        getSlotDateTime(first.date, first.slot.startTime) -
        getSlotDateTime(second.date, second.slot.startTime)
    );
  const nextAppointment = upcomingAppointments[0];
  const completedCount = appointments.filter(
    (appointment) => appointment.slot.status === "Completed"
  ).length;
  const requestedCount = appointments.filter(
    (appointment) => appointment.slot.status === "Requested"
  ).length;
  const featuredDoctors = doctors.slice(0, 4);

  return (
    <div className="user-page">
      <Sidebar />
      <main className="patient-dashboard">
        <section className="patient-dashboard__hero">
          <div>
            <p className="patient-dashboard__eyebrow">Patient Dashboard</p>
            <h1>Welcome back, {user?.firstName || "there"}</h1>
            <p>
              Keep your appointments, care team, and next steps in one calm
              place.
            </p>
          </div>
          <div className="patient-dashboard__hero-actions">
            <Link to="/doctorslist" className="patient-dashboard__primary-btn">
              Book Appointment
            </Link>
            <Link to="/UserAppointments" className="patient-dashboard__ghost-btn">
              View Appointments
            </Link>
          </div>
        </section>

        {error && <p className="patient-dashboard__error">{error}</p>}

        <section className="patient-dashboard__stats" aria-label="Appointment summary">
          <div className="patient-dashboard__stat">
            <span>{loading ? "--" : upcomingAppointments.length}</span>
            <p>Upcoming</p>
          </div>
          <div className="patient-dashboard__stat">
            <span>{loading ? "--" : requestedCount}</span>
            <p>Pending Requests</p>
          </div>
          <div className="patient-dashboard__stat">
            <span>{loading ? "--" : completedCount}</span>
            <p>Completed Visits</p>
          </div>
        </section>

        <section className="patient-dashboard__content">
          <div className="patient-dashboard__panel patient-dashboard__next">
            <div className="patient-dashboard__panel-heading">
              <h2>Next Appointment</h2>
              <Link to="/UserAppointments">See all</Link>
            </div>
            {loading ? (
              <p className="patient-dashboard__muted">Loading your next visit...</p>
            ) : nextAppointment ? (
              <div className="patient-dashboard__next-card">
                <div>
                  <p className="patient-dashboard__label">Doctor</p>
                  <h3>
                    {nextAppointment.doctorDetails?.name || "Doctor unavailable"}
                  </h3>
                </div>
                <div className="patient-dashboard__next-meta">
                  <span>{formatDate(nextAppointment.date)}</span>
                  <span>
                    {nextAppointment.slot.startTime} - {nextAppointment.slot.endTime}
                  </span>
                  <strong>{nextAppointment.slot.status}</strong>
                </div>
              </div>
            ) : (
              <div className="patient-dashboard__empty">
                <h3>No upcoming appointment yet</h3>
                <p>Choose a doctor and request a time that works for you.</p>
                <Link to="/doctorslist">Find a doctor</Link>
              </div>
            )}
          </div>

          <div className="patient-dashboard__panel">
            <div className="patient-dashboard__panel-heading">
              <h2>Quick Actions</h2>
            </div>
            <div className="patient-dashboard__actions">
              <Link to="/doctorslist">Find doctors</Link>
              <Link to="/UserAppointments">Manage appointments</Link>
              <Link to="/Profile">Update profile</Link>
            </div>
          </div>
        </section>

        <section className="patient-dashboard__panel">
          <div className="patient-dashboard__panel-heading">
            <h2>Available Doctors</h2>
            <Link to="/doctorslist">Browse all</Link>
          </div>
          {loading ? (
            <p className="patient-dashboard__muted">Loading doctors...</p>
          ) : (
            <div className="patient-dashboard__doctor-grid">
              {featuredDoctors.map((doctor) => (
                <article key={doctor._id} className="patient-dashboard__doctor">
                  <img
                    src={doctor.imageUrl || "/assets/images/icons/doctor.png"}
                    alt={doctor.name || "Doctor"}
                  />
                  <div>
                    <h3>{doctor.name || "Doctor unavailable"}</h3>
                    <p>{doctor.specialty || "General Medicine"}</p>
                    <small>
                      {doctor.description ||
                        "Available for patient consultations and follow-up care."}
                    </small>
                    <span>{doctor.experience || "5+"} years experience</span>
                  </div>
                  <Link to={`/book-appointment/${getBookableDoctorId(doctor)}`}>
                    Book
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default UserPage;
