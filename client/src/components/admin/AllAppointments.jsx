import React, { useEffect, useMemo, useState } from "react";
import { getAllAppointments, getAppointmentDetails } from "../../services/adminService";
import Sidebar from "../common/Sidebar";
import "../../css/sidebar.css";
import "../../css/allappointments.css";

const statusFilters = ["All", "Available", "Requested", "Confirmed", "InProgress", "Completed", "Cancelled"];

const getDoctorName = (appointment) => {
  const doctor = appointment?.doctorId;
  if (!doctor) return "Unknown Doctor";
  return `${doctor.firstName || ""} ${doctor.lastName || ""}`.trim() || "Unknown Doctor";
};

const getPatientName = (slot) => {
  const details = slot?.userDetails;
  if (!details) return "Unassigned";
  return `${details.firstName || ""} ${details.lastName || ""}`.trim() || "Patient";
};

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "No date";

const flattenSlots = (appointments) =>
  appointments.flatMap((appointment) =>
    (appointment.timeSlots || []).map((slot) => ({
      ...slot,
      appointmentId: appointment._id,
      doctorName: getDoctorName(appointment),
      doctorEmail: appointment.doctorId?.email,
      specialization: appointment.doctorId?.specialization,
      date: appointment.date,
    }))
  );

const AllAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [activeStatus, setActiveStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllAppointments();
      setAppointments(response || []);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError(err.message || "Failed to fetch appointments.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointmentDetails = async (appointmentId) => {
    try {
      setDetailsLoading(true);
      setError(null);
      const response = await getAppointmentDetails(appointmentId);
      setSelectedAppointment(response);
      setSelectedSlot(null);
    } catch (err) {
      console.error("Error fetching appointment details:", err);
      setError(err.message || "Failed to fetch appointment details.");
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const allSlots = useMemo(() => flattenSlots(appointments), [appointments]);
  const filteredAppointments = appointments.filter((appointment) => {
    const doctorName = getDoctorName(appointment).toLowerCase();
    const specialty = appointment.doctorId?.specialization?.toLowerCase() || "";
    const date = appointment.date || "";
    const matchesSearch = [doctorName, specialty, date]
      .join(" ")
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      activeStatus === "All" ||
      (appointment.timeSlots || []).some((slot) => slot.status === activeStatus);

    return matchesSearch && matchesStatus;
  });

  const statusCounts = allSlots.reduce(
    (counts, slot) => ({
      ...counts,
      [slot.status]: (counts[slot.status] || 0) + 1,
    }),
    {}
  );

  const bookedSlotCount = allSlots.filter((slot) => slot.isBooked).length;
  const visibleSlots = selectedAppointment?.timeSlots || [];

  return (
    <div className="admin-appointments-page">
      <Sidebar />
      <main className="admin-appointments">
        <section className="admin-appointments-hero">
          <div>
            <p className="admin-appointments-eyebrow">Admin Appointments</p>
            <h1>Appointment operations</h1>
            <p>
              Review doctor availability, booking requests, patient details, and
              clinical notes from one workspace.
            </p>
          </div>
          <div className="admin-appointments-summary">
            <span>Total slots</span>
            <strong>{loading ? "--" : allSlots.length}</strong>
          </div>
        </section>

        {error && (
          <div className="admin-appointments-alert">
            <span>{error}</span>
            <button type="button" onClick={() => setError(null)}>
              Dismiss
            </button>
          </div>
        )}

        <section className="admin-appointments-stats">
          <div>
            <span>Appointment Days</span>
            <strong>{loading ? "--" : appointments.length}</strong>
          </div>
          <div>
            <span>Booked Slots</span>
            <strong>{loading ? "--" : bookedSlotCount}</strong>
          </div>
          <div>
            <span>Requested</span>
            <strong>{loading ? "--" : statusCounts.Requested || 0}</strong>
          </div>
          <div>
            <span>Completed</span>
            <strong>{loading ? "--" : statusCounts.Completed || 0}</strong>
          </div>
        </section>

        {!selectedAppointment && (
          <>
            <section className="admin-appointments-toolbar">
              <label className="admin-appointments-search">
                <span>Search appointments</span>
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by doctor, specialty, or date"
                />
              </label>
              <div className="admin-appointments-filters" aria-label="Appointment status filters">
                {statusFilters.map((status) => (
                  <button
                    type="button"
                    key={status}
                    className={
                      activeStatus === status
                        ? "admin-appointments-filter is-active"
                        : "admin-appointments-filter"
                    }
                    onClick={() => setActiveStatus(status)}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </section>

            {loading ? (
              <section className="admin-appointments-grid">
                {[1, 2, 3, 4].map((item) => (
                  <article className="admin-appointment-card is-loading" key={item}>
                    <span />
                    <div className="admin-appointment-card__title-placeholder" />
                    <p />
                    <p />
                  </article>
                ))}
              </section>
            ) : filteredAppointments.length > 0 ? (
              <section className="admin-appointments-grid">
                {filteredAppointments.map((appointment) => {
                  const slotCount = appointment.timeSlots?.length || 0;
                  const requestedCount = (appointment.timeSlots || []).filter(
                    (slot) => slot.status === "Requested"
                  ).length;

                  return (
                    <article className="admin-appointment-card" key={appointment._id}>
                      <div className="admin-appointment-card__top">
                        <span>{appointment.doctorId?.specialization || "General Medicine"}</span>
                        <strong>{formatDate(appointment.date)}</strong>
                      </div>
                      <h2>Dr. {getDoctorName(appointment)}</h2>
                      <p>{appointment.doctorId?.email || "No doctor email available"}</p>
                      <div className="admin-appointment-card__meta">
                        <span>{slotCount} slots</span>
                        <span>{requestedCount} requests</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => fetchAppointmentDetails(appointment._id)}
                      >
                        {detailsLoading ? "Loading..." : "View Details"}
                      </button>
                    </article>
                  );
                })}
              </section>
            ) : (
              <section className="admin-appointments-empty">
                <h2>No appointments found</h2>
                <p>Try another status filter or search term.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setActiveStatus("All");
                  }}
                >
                  Clear filters
                </button>
              </section>
            )}
          </>
        )}

        {selectedAppointment && !selectedSlot && (
          <section className="admin-appointments-panel">
            <div className="admin-appointments-panel__heading">
              <div>
                <button
                  type="button"
                  className="admin-appointments-back"
                  onClick={() => setSelectedAppointment(null)}
                >
                  Back to Appointments
                </button>
                <p className="admin-appointments-eyebrow">Appointment Details</p>
                <h2>
                  Dr. {getDoctorName(selectedAppointment)} on{" "}
                  {formatDate(selectedAppointment.date)}
                </h2>
              </div>
              <span className="admin-appointments-pill">
                {visibleSlots.length} slots
              </span>
            </div>

            <div className="admin-appointments-doctor">
              <div>
                <span>Doctor Email</span>
                <strong>{selectedAppointment.doctorId?.email || "N/A"}</strong>
              </div>
              <div>
                <span>Specialization</span>
                <strong>{selectedAppointment.doctorId?.specialization || "N/A"}</strong>
              </div>
              <div>
                <span>Date</span>
                <strong>{formatDate(selectedAppointment.date)}</strong>
              </div>
            </div>

            <div className="admin-appointments-table-wrap">
              <table className="admin-appointments-table">
                <thead>
                  <tr>
                    <th>Slot Time</th>
                    <th>Status</th>
                    <th>Patient</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleSlots.map((slot) => (
                    <tr key={slot._id || `${slot.startTime}-${slot.endTime}`}>
                      <td>{slot.startTime} - {slot.endTime}</td>
                      <td>
                        <span className={`admin-appointments-status is-${slot.status?.toLowerCase()}`}>
                          {slot.status || "N/A"}
                        </span>
                      </td>
                      <td>{getPatientName(slot)}</td>
                      <td>
                        <button type="button" onClick={() => setSelectedSlot(slot)}>
                          View Slot
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {selectedAppointment && selectedSlot && (
          <section className="admin-appointments-panel">
            <div className="admin-appointments-panel__heading">
              <div>
                <button
                  type="button"
                  className="admin-appointments-back"
                  onClick={() => setSelectedSlot(null)}
                >
                  Back to Slots
                </button>
                <p className="admin-appointments-eyebrow">Slot Details</p>
                <h2>{selectedSlot.startTime} - {selectedSlot.endTime}</h2>
              </div>
              <span className={`admin-appointments-status is-${selectedSlot.status?.toLowerCase()}`}>
                {selectedSlot.status || "N/A"}
              </span>
            </div>

            <div className="admin-slot-grid">
              <article className="admin-slot-card">
                <p className="admin-appointments-eyebrow">Patient</p>
                {selectedSlot.userDetails ? (
                  <>
                    <h3>{getPatientName(selectedSlot)}</h3>
                    <p>{selectedSlot.userDetails.email || "No email provided"}</p>
                    <p>{selectedSlot.userDetails.phone || "No phone provided"}</p>
                    <p>{selectedSlot.userDetails.illness || "No illness listed"}</p>
                  </>
                ) : (
                  <p>No patient details available for this slot.</p>
                )}
              </article>

              <article className="admin-slot-card">
                <p className="admin-appointments-eyebrow">Visit Notes</p>
                <h3>{selectedSlot.userDetails?.bloodGroup || "Blood group N/A"}</h3>
                <p>{selectedSlot.userDetails?.address || "No address provided"}</p>
                <p>{selectedSlot.userDetails?.notes || "No patient notes provided"}</p>
              </article>
            </div>

            {selectedSlot.prescription?.medicines?.length > 0 || selectedSlot.prescription?.notes ? (
              <article className="admin-slot-card admin-slot-card--wide">
                <p className="admin-appointments-eyebrow">Prescription</p>
                {selectedSlot.prescription?.medicines?.map((medicine, index) => (
                  <div className="admin-prescription-line" key={`${medicine.name}-${index}`}>
                    <strong>{medicine.name || "Medicine"}</strong>
                    <span>{medicine.dosage || "Dosage N/A"}</span>
                    <span>{medicine.duration || "Duration N/A"}</span>
                  </div>
                ))}
                {selectedSlot.prescription?.notes && <p>{selectedSlot.prescription.notes}</p>}
                {selectedSlot.prescription?.advice && <p>{selectedSlot.prescription.advice}</p>}
              </article>
            ) : (
              <article className="admin-slot-card admin-slot-card--wide">
                <p className="admin-appointments-eyebrow">Prescription</p>
                <p>No prescription has been added for this slot.</p>
              </article>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default AllAppointmentsPage;
