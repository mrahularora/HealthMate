import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAcceptedAppointments } from "../../services/appointmentService";
import { AuthContext } from "../../context/AuthContext";
import Sidebar from "../common/Sidebar";
import "../../css/allappointments.css";

const statusOptions = ["All", "Confirmed", "InProgress", "Completed"];

const statusLabels = {
  Confirmed: "Confirmed",
  InProgress: "In progress",
  Completed: "Completed",
};

const getDoctorId = (user) => user?.id || user?._id || user?.doctorId;

const getPatientName = (appointment) => {
  const details = appointment?.userDetails || appointment?.bookedBy || {};
  return (
    [details.firstName, details.lastName].filter(Boolean).join(" ") ||
    details.name ||
    "Patient"
  );
};

const formatDate = (date) => {
  if (!date) return "Date pending";

  return new Date(date).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getSlotTime = (appointment) =>
  [appointment?.startTime, appointment?.endTime].filter(Boolean).join(" - ") ||
  "Time pending";

const sortAppointments = (appointments) =>
  [...appointments].sort((first, second) => {
    const firstDate = new Date(first.date || 0).getTime();
    const secondDate = new Date(second.date || 0).getTime();

    if (firstDate !== secondDate) return firstDate - secondDate;
    return String(first.startTime || "").localeCompare(String(second.startTime || ""));
  });

const isSameDay = (date, targetDate) => {
  const first = new Date(date);
  first.setHours(0, 0, 0, 0);
  const second = new Date(targetDate);
  second.setHours(0, 0, 0, 0);
  return first.getTime() === second.getTime();
};

const AcceptedAppointments = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [activeStatus, setActiveStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const doctorId = getDoctorId(user);

  const fetchAcceptedAppointments = useCallback(async () => {
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
      const response = await getAcceptedAppointments(doctorId);
      setAppointments(Array.isArray(response) ? sortAppointments(response) : []);
    } catch (err) {
      console.error("Error fetching accepted appointments:", err);
      setError(
        err?.response?.data?.message ||
          "Failed to fetch appointments. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [doctorId, user]);

  useEffect(() => {
    fetchAcceptedAppointments();
  }, [fetchAcceptedAppointments]);

  const appointmentData = useMemo(() => {
    const today = new Date();
    const counts = appointments.reduce(
      (summary, appointment) => {
        summary.total += 1;
        summary[appointment.status] = (summary[appointment.status] || 0) + 1;
        if (appointment.status !== "Completed" && isSameDay(appointment.date, today)) {
          summary.today += 1;
        }
        return summary;
      },
      { total: 0, today: 0 }
    );

    const normalizedSearch = searchTerm.trim().toLowerCase();
    const visibleAppointments = appointments.filter((appointment) => {
      const matchesStatus =
        activeStatus === "All" || appointment.status === activeStatus;
      const searchable = [
        getPatientName(appointment),
        appointment.userDetails?.email,
        appointment.userDetails?.phone,
        appointment.userDetails?.illness,
        appointment.status,
        formatDate(appointment.date),
        getSlotTime(appointment),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesStatus && (!normalizedSearch || searchable.includes(normalizedSearch));
    });

    const nextAppointment = sortAppointments(
      appointments.filter((appointment) => appointment.status !== "Completed")
    )[0];

    return {
      counts,
      visibleAppointments,
      nextAppointment,
    };
  }, [activeStatus, appointments, searchTerm]);

  const handleViewDetails = (appointment) => {
    if (!appointment?.appointmentId || !appointment?._id) return;
    navigate(`/appointment-details/${appointment.appointmentId}/${appointment._id}`);
  };

  return (
    <div className="doctor-accepted-page">
      <Sidebar />
      <main className="doctor-accepted">
        <section className="doctor-accepted__hero">
          <div>
            <p className="doctor-accepted__eyebrow">Doctor appointments</p>
            <h1>Appointment workspace</h1>
            <p>
              Track confirmed visits, continue in-progress consultations, and
              review completed appointments from one organized schedule.
            </p>
          </div>
          <aside>
            <span>Next visit</span>
            {appointmentData.nextAppointment ? (
              <>
                <strong>{getPatientName(appointmentData.nextAppointment)}</strong>
                <small>
                  {formatDate(appointmentData.nextAppointment.date)} ·{" "}
                  {getSlotTime(appointmentData.nextAppointment)}
                </small>
              </>
            ) : (
              <>
                <strong>No upcoming visit</strong>
                <small>Your accepted schedule is clear.</small>
              </>
            )}
          </aside>
        </section>

        {error && (
          <div className="doctor-accepted__alert">
            <span>{error}</span>
            <button onClick={fetchAcceptedAppointments} type="button">
              Retry
            </button>
          </div>
        )}

        <section className="doctor-accepted__stats" aria-label="Appointment totals">
          <div>
            <span>Total</span>
            <strong>{appointmentData.counts.total}</strong>
          </div>
          <div>
            <span>Today</span>
            <strong>{appointmentData.counts.today}</strong>
          </div>
          <div>
            <span>In progress</span>
            <strong>{appointmentData.counts.InProgress || 0}</strong>
          </div>
          <div>
            <span>Completed</span>
            <strong>{appointmentData.counts.Completed || 0}</strong>
          </div>
        </section>

        <section className="doctor-accepted__toolbar">
          <label>
            Search appointments
            <input
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search patient, illness, status, date..."
              type="search"
              value={searchTerm}
            />
          </label>
          <div className="doctor-accepted__filters" aria-label="Status filters">
            {statusOptions.map((status) => (
              <button
                className={activeStatus === status ? "is-active" : ""}
                key={status}
                onClick={() => setActiveStatus(status)}
                type="button"
              >
                {status === "All" ? "All" : statusLabels[status]}
                <span>
                  {status === "All"
                    ? appointmentData.counts.total
                    : appointmentData.counts[status] || 0}
                </span>
              </button>
            ))}
          </div>
        </section>

        {loading ? (
          <section className="doctor-accepted__grid">
            {[0, 1, 2, 3, 4, 5].map((item) => (
              <article className="doctor-accepted__card is-loading" key={item}>
                <span />
                <div />
                <p />
                <p />
              </article>
            ))}
          </section>
        ) : appointmentData.visibleAppointments.length > 0 ? (
          <section className="doctor-accepted__grid">
            {appointmentData.visibleAppointments.map((appointment) => (
              <article className="doctor-accepted__card" key={appointment._id}>
                <div className="doctor-accepted__card-top">
                  <span className={`doctor-accepted__status is-${appointment.status?.toLowerCase()}`}>
                    {statusLabels[appointment.status] || appointment.status}
                  </span>
                  <small>{formatDate(appointment.date)}</small>
                </div>

                <h2>{getPatientName(appointment)}</h2>
                <dl>
                  <div>
                    <dt>Time</dt>
                    <dd>{getSlotTime(appointment)}</dd>
                  </div>
                  <div>
                    <dt>Reason</dt>
                    <dd>{appointment.userDetails?.illness || "Consultation"}</dd>
                  </div>
                  <div>
                    <dt>Contact</dt>
                    <dd>
                      {appointment.userDetails?.phone ||
                        appointment.userDetails?.email ||
                        "Not provided"}
                    </dd>
                  </div>
                </dl>

                <button onClick={() => handleViewDetails(appointment)} type="button">
                  View consultation
                </button>
              </article>
            ))}
          </section>
        ) : (
          <section className="doctor-accepted__empty">
            <h2>No appointments found</h2>
            <p>
              Try clearing the search or switching filters. Confirmed,
              in-progress, and completed appointments will appear here.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setActiveStatus("All");
              }}
              type="button"
            >
              Clear filters
            </button>
          </section>
        )}
      </main>
    </div>
  );
};

export default AcceptedAppointments;
