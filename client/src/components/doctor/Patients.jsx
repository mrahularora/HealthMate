import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAcceptedAppointments } from "../../services/appointmentService";
import { AuthContext } from "../../context/AuthContext";
import Sidebar from "../../components/common/Sidebar";
import "../../css/doctorpage.css";

const getDoctorId = (user) => user?.id || user?._id || user?.doctorId;

const getPatientName = (appointment) => {
  const details = appointment?.userDetails || appointment?.bookedBy || {};
  return (
    [details.firstName, details.lastName].filter(Boolean).join(" ") ||
    details.name ||
    "Patient"
  );
};

const getPatientKey = (appointment) => {
  const details = appointment?.userDetails || appointment?.bookedBy || {};
  return details.email || details.phone || getPatientName(appointment);
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

    if (firstDate !== secondDate) return secondDate - firstDate;
    return String(second.startTime || "").localeCompare(String(first.startTime || ""));
  });

const Patients = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [completedAppointments, setCompletedAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const doctorId = getDoctorId(user);

  const fetchCompletedAppointments = useCallback(async () => {
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
      const completed = Array.isArray(response)
        ? response.filter((appointment) => appointment.status === "Completed")
        : [];
      setCompletedAppointments(sortAppointments(completed));
    } catch (err) {
      console.error("Error fetching completed appointments:", err);
      setError(
        err?.response?.data?.message ||
          "Failed to fetch completed patient records. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [doctorId, user]);

  useEffect(() => {
    fetchCompletedAppointments();
  }, [fetchCompletedAppointments]);

  const patientData = useMemo(() => {
    const patientMap = new Map();

    completedAppointments.forEach((appointment) => {
      const key = getPatientKey(appointment);
      const details = appointment.userDetails || appointment.bookedBy || {};
      const currentPatient = patientMap.get(key);

      if (!currentPatient) {
        patientMap.set(key, {
          key,
          name: getPatientName(appointment),
          email: details.email || "Not provided",
          phone: details.phone || "Not provided",
          address: details.address || "Not provided",
          bloodGroup: details.bloodGroup || "N/A",
          lastIllness: details.illness || "Visit",
          visits: [appointment],
        });
        return;
      }

      currentPatient.visits.push(appointment);
      if (details.illness) currentPatient.lastIllness = details.illness;
    });

    const patients = Array.from(patientMap.values()).sort(
      (first, second) => second.visits.length - first.visits.length
    );
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const filteredAppointments = completedAppointments.filter((appointment) => {
      const details = appointment.userDetails || {};
      const searchable = [
        getPatientName(appointment),
        details.email,
        details.phone,
        details.address,
        details.bloodGroup,
        details.illness,
        details.notes,
        formatDate(appointment.date),
        getSlotTime(appointment),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return !normalizedSearch || searchable.includes(normalizedSearch);
    });

    const filteredPatientKeys = new Set(
      filteredAppointments.map((appointment) => getPatientKey(appointment))
    );

    return {
      patients: patients.filter((patient) => filteredPatientKeys.has(patient.key)),
      totalPatients: patients.length,
      filteredAppointments,
      latestVisit: completedAppointments[0],
    };
  }, [completedAppointments, searchTerm]);

  const handleViewDetails = (appointment) => {
    if (!appointment?.appointmentId || !appointment?._id) return;
    navigate(`/appointment-details/${appointment.appointmentId}/${appointment._id}`);
  };

  return (
    <div className="doctor-page">
      <Sidebar />
      <main className="doctor-patients">
        <section className="doctor-patients__hero">
          <div>
            <p className="doctor-patients__eyebrow">Patient history</p>
            <h1>Patients list</h1>
            <p>
              Review completed consultations, patient contact details, visit
              reasons, and clinical history from your finished appointments.
            </p>
          </div>
          <aside>
            <span>Latest completed visit</span>
            {patientData.latestVisit ? (
              <>
                <strong>{getPatientName(patientData.latestVisit)}</strong>
                <small>
                  {formatDate(patientData.latestVisit.date)} ·{" "}
                  {getSlotTime(patientData.latestVisit)}
                </small>
              </>
            ) : (
              <>
                <strong>No completed visits</strong>
                <small>Completed appointment records will appear here.</small>
              </>
            )}
          </aside>
        </section>

        {error && (
          <div className="doctor-patients__alert">
            <span>{error}</span>
            <button onClick={fetchCompletedAppointments} type="button">
              Retry
            </button>
          </div>
        )}

        <section className="doctor-patients__stats" aria-label="Patient totals">
          <div>
            <span>Patients</span>
            <strong>{patientData.totalPatients}</strong>
          </div>
          <div>
            <span>Completed visits</span>
            <strong>{completedAppointments.length}</strong>
          </div>
          <div>
            <span>Filtered records</span>
            <strong>{patientData.filteredAppointments.length}</strong>
          </div>
        </section>

        <section className="doctor-patients__toolbar">
          <label>
            Search patients
            <input
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search name, illness, blood group, email, phone..."
              type="search"
              value={searchTerm}
            />
          </label>
          <button onClick={fetchCompletedAppointments} type="button">
            Refresh
          </button>
        </section>

        {loading ? (
          <section className="doctor-patients__grid">
            {[0, 1, 2].map((item) => (
              <article className="doctor-patients__card is-loading" key={item}>
                <span />
                <div />
                <p />
                <p />
              </article>
            ))}
          </section>
        ) : patientData.filteredAppointments.length > 0 ? (
          <>
            <section className="doctor-patients__grid">
              {patientData.patients.slice(0, 6).map((patient) => (
                <article className="doctor-patients__card" key={patient.key}>
                  <div className="doctor-patients__avatar" aria-hidden="true">
                    {patient.name.slice(0, 1)}
                  </div>
                  <div>
                    <h2>{patient.name}</h2>
                    <p>{patient.lastIllness}</p>
                  </div>
                  <dl>
                    <div>
                      <dt>Visits</dt>
                      <dd>{patient.visits.length}</dd>
                    </div>
                    <div>
                      <dt>Blood</dt>
                      <dd>{patient.bloodGroup}</dd>
                    </div>
                    <div>
                      <dt>Email</dt>
                      <dd>{patient.email}</dd>
                    </div>
                    <div>
                      <dt>Phone</dt>
                      <dd>{patient.phone}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </section>

            <section className="doctor-patients__records">
              <div className="doctor-patients__records-heading">
                <div>
                  <p className="doctor-patients__eyebrow">Visit records</p>
                  <h2>Completed appointments</h2>
                </div>
                <span>{patientData.filteredAppointments.length} records</span>
              </div>
              <div className="doctor-patients__table-wrap">
                <table className="doctor-patients__table">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Contact</th>
                      <th>Reason</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patientData.filteredAppointments.map((appointment) => (
                      <tr key={appointment._id}>
                        <td>
                          <strong>{getPatientName(appointment)}</strong>
                          <small>{appointment.userDetails?.bloodGroup || "N/A"}</small>
                        </td>
                        <td>
                          <span>
                            {appointment.userDetails?.email || "Email not provided"}
                          </span>
                          <small>
                            {appointment.userDetails?.phone || "Phone not provided"}
                          </small>
                        </td>
                        <td>{appointment.userDetails?.illness || "Consultation"}</td>
                        <td>{formatDate(appointment.date)}</td>
                        <td>{getSlotTime(appointment)}</td>
                        <td>
                          <button onClick={() => handleViewDetails(appointment)} type="button">
                            View record
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : (
          <section className="doctor-patients__empty">
            <h2>No patient records found</h2>
            <p>
              Completed appointments will appear here. Try clearing the search
              if you were filtering your patient history.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                fetchCompletedAppointments();
              }}
              type="button"
            >
              Clear search
            </button>
          </section>
        )}
      </main>
    </div>
  );
};

export default Patients;
