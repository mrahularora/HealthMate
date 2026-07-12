import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  getAppointmentRequests,
  updateAppointmentStatus,
} from "../../services/appointmentService";
import { AuthContext } from "../../context/AuthContext";
import Sidebar from "../common/Sidebar";
import "../../css/requestedappointments.css";

const getDoctorId = (user) => user?.id || user?._id || user?.doctorId;

const getPatientName = (request) => {
  const details = request?.userDetails || {};
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

const getSlotTime = (request) =>
  [request?.startTime, request?.endTime].filter(Boolean).join(" - ") ||
  "Time pending";

const sortRequests = (requests) =>
  [...requests].sort((first, second) => {
    const firstDate = new Date(first.date || 0).getTime();
    const secondDate = new Date(second.date || 0).getTime();

    if (firstDate !== secondDate) return firstDate - secondDate;
    return String(first.startTime || "").localeCompare(String(second.startTime || ""));
  });

const isToday = (date) => {
  const current = new Date(date);
  current.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return current.getTime() === today.getTime();
};

const AppointmentRequest = () => {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [actionSlotId, setActionSlotId] = useState("");

  const doctorId = getDoctorId(user);

  const fetchRequests = useCallback(async () => {
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
      const response = await getAppointmentRequests(doctorId);
      setRequests(Array.isArray(response) ? sortRequests(response) : []);
    } catch (err) {
      console.error("Error fetching appointment requests:", err);
      setError(
        err?.response?.data?.message ||
          "Failed to fetch appointment requests. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [doctorId, user]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const requestData = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const todayCount = requests.filter((request) => isToday(request.date)).length;
    const uniquePatients = new Set(requests.map((request) => getPatientName(request))).size;
    const visibleRequests = requests.filter((request) => {
      const searchable = [
        getPatientName(request),
        request.userDetails?.email,
        request.userDetails?.phone,
        request.userDetails?.illness,
        request.userDetails?.notes,
        formatDate(request.date),
        getSlotTime(request),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return !normalizedSearch || searchable.includes(normalizedSearch);
    });

    return {
      nextRequest: requests[0],
      todayCount,
      uniquePatients,
      visibleRequests,
    };
  }, [requests, searchTerm]);

  const handleUpdateStatus = async (request, status) => {
    if (!doctorId || !request?.appointmentId || !request?._id) {
      setError("This request is missing appointment details.");
      return;
    }

    const statusLabel = status === "Confirmed" ? "confirm" : "reject";
    const confirmed = window.confirm(
      `Are you sure you want to ${statusLabel} ${getPatientName(request)}'s request for ${formatDate(request.date)} at ${getSlotTime(request)}?`
    );

    if (!confirmed) return;

    setActionSlotId(request._id);
    setError("");
    setSuccessMessage("");

    try {
      await updateAppointmentStatus({
        doctorId,
        appointmentId: request.appointmentId,
        slotId: request._id,
        status,
      });

      setSuccessMessage(
        status === "Confirmed"
          ? "Appointment confirmed successfully."
          : "Appointment rejected and the slot is available again."
      );
      await fetchRequests();
    } catch (err) {
      console.error("Error updating appointment status:", err);
      setError(
        err?.response?.data?.message ||
          "Failed to update appointment status. Please try again."
      );
    } finally {
      setActionSlotId("");
    }
  };

  return (
    <div className="doctor-requests-page">
      <Sidebar />
      <main className="doctor-requests">
        <section className="doctor-requests__hero">
          <div>
            <p className="doctor-requests__eyebrow">Booking queue</p>
            <h1>Appointment requests</h1>
            <p>
              Review patient booking requests, check visit details, and confirm
              or reject pending appointments with confidence.
            </p>
          </div>
          <aside>
            <span>Next request</span>
            {requestData.nextRequest ? (
              <>
                <strong>{getPatientName(requestData.nextRequest)}</strong>
                <small>
                  {formatDate(requestData.nextRequest.date)} ·{" "}
                  {getSlotTime(requestData.nextRequest)}
                </small>
              </>
            ) : (
              <>
                <strong>Queue clear</strong>
                <small>No patient requests are waiting.</small>
              </>
            )}
          </aside>
        </section>

        {error && (
          <div className="doctor-requests__alert is-error">
            <span>{error}</span>
            <button onClick={fetchRequests} type="button">
              Retry
            </button>
          </div>
        )}
        {successMessage && (
          <p className="doctor-requests__alert is-success">{successMessage}</p>
        )}

        <section className="doctor-requests__stats" aria-label="Request totals">
          <div>
            <span>Total requests</span>
            <strong>{requests.length}</strong>
          </div>
          <div>
            <span>Today</span>
            <strong>{requestData.todayCount}</strong>
          </div>
          <div>
            <span>Patients</span>
            <strong>{requestData.uniquePatients}</strong>
          </div>
        </section>

        <section className="doctor-requests__toolbar">
          <label>
            Search requests
            <input
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search patient, illness, date, email..."
              type="search"
              value={searchTerm}
            />
          </label>
          <button onClick={fetchRequests} type="button">
            Refresh
          </button>
        </section>

        {loading ? (
          <section className="doctor-requests__grid">
            {[0, 1, 2, 3].map((item) => (
              <article className="doctor-requests__card is-loading" key={item}>
                <span />
                <div />
                <p />
                <p />
              </article>
            ))}
          </section>
        ) : requestData.visibleRequests.length > 0 ? (
          <section className="doctor-requests__grid">
            {requestData.visibleRequests.map((request) => (
              <article className="doctor-requests__card" key={request._id}>
                <div className="doctor-requests__card-top">
                  <span>Requested</span>
                  <small>{formatDate(request.date)}</small>
                </div>

                <h2>{getPatientName(request)}</h2>
                <dl>
                  <div>
                    <dt>Time</dt>
                    <dd>{getSlotTime(request)}</dd>
                  </div>
                  <div>
                    <dt>Reason</dt>
                    <dd>{request.userDetails?.illness || "Consultation"}</dd>
                  </div>
                  <div>
                    <dt>Contact</dt>
                    <dd>
                      {request.userDetails?.phone ||
                        request.userDetails?.email ||
                        "Not provided"}
                    </dd>
                  </div>
                  {request.userDetails?.notes && (
                    <div>
                      <dt>Notes</dt>
                      <dd>{request.userDetails.notes}</dd>
                    </div>
                  )}
                </dl>

                <div className="doctor-requests__actions">
                  <button
                    className="is-confirm"
                    disabled={actionSlotId === request._id}
                    onClick={() => handleUpdateStatus(request, "Confirmed")}
                    type="button"
                  >
                    {actionSlotId === request._id ? "Updating..." : "Confirm"}
                  </button>
                  <button
                    className="is-reject"
                    disabled={actionSlotId === request._id}
                    onClick={() => handleUpdateStatus(request, "Rejected")}
                    type="button"
                  >
                    Reject
                  </button>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="doctor-requests__empty">
            <h2>No requests found</h2>
            <p>
              New patient booking requests will appear here. Try clearing the
              search if you were filtering the queue.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                fetchRequests();
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

export default AppointmentRequest;
