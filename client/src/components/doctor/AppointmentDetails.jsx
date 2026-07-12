import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  generateReport,
  getAppointmentDetails,
  updateAppointmentDetails,
} from "../../services/appointmentService";
import Sidebar from "../common/Sidebar";
import VoiceInput from "../common/VoiceInput";
import "../../css/appointmentdetails.css";

const emptyPrescription = {
  medicines: [],
  notes: "",
  advice: "",
};

const emptyMedicine = {
  name: "",
  dosage: "",
  duration: "",
};

const statusOptions = [
  { value: "InProgress", label: "In progress" },
  { value: "Completed", label: "Completed" },
];

const getPatientName = (userDetails) =>
  [userDetails?.firstName, userDetails?.lastName].filter(Boolean).join(" ") ||
  "Patient";

const getInitials = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "P";

const AppointmentDetails = () => {
  const { appointmentId, slotId } = useParams();
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState(null);
  const [prescription, setPrescription] = useState(emptyPrescription);
  const [newMedicine, setNewMedicine] = useState(emptyMedicine);
  const [status, setStatus] = useState("InProgress");
  const [reportPath, setReportPath] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  const patientName = getPatientName(userDetails);
  const medicineCount = prescription.medicines.length;

  const patientFacts = useMemo(
    () => [
      { label: "Email", value: userDetails?.email || "Not provided" },
      { label: "Phone", value: userDetails?.phone || "Not provided" },
      { label: "Blood group", value: userDetails?.bloodGroup || "N/A" },
      { label: "Address", value: userDetails?.address || "Not provided" },
    ],
    [userDetails]
  );

  const clinicalFacts = useMemo(
    () => [
      { label: "Reason for visit", value: userDetails?.illness || "Consultation" },
      { label: "Patient notes", value: userDetails?.notes || "No notes provided" },
      { label: "Current status", value: status === "Completed" ? "Completed" : "In progress" },
      { label: "Medicines", value: `${medicineCount} added` },
    ],
    [medicineCount, status, userDetails]
  );

  const fetchDetails = useCallback(async () => {
    setLoadingDetails(true);
    setError("");

    try {
      const response = await getAppointmentDetails(appointmentId, slotId);
      setUserDetails(response.userDetails || {});
      setPrescription({
        ...emptyPrescription,
        ...(response.prescription || {}),
        medicines: Array.isArray(response.prescription?.medicines)
          ? response.prescription.medicines
          : [],
      });
      setStatus(response.status || "InProgress");
    } catch (err) {
      console.error("Error fetching appointment details:", err);
      setError(
        err?.response?.data?.message ||
          "Failed to fetch appointment details. Please try again."
      );
    } finally {
      setLoadingDetails(false);
    }
  }, [appointmentId, slotId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const updatePrescriptionField = (field, value) => {
    setPrescription((currentPrescription) => ({
      ...currentPrescription,
      [field]: value,
    }));
  };

  const handleMedicineChange = (event) => {
    const { name, value } = event.target;
    setNewMedicine((currentMedicine) => ({
      ...currentMedicine,
      [name]: value,
    }));
  };

  const handleAddMedicine = () => {
    setSuccessMessage("");

    if (!newMedicine.name.trim() || !newMedicine.dosage.trim() || !newMedicine.duration.trim()) {
      setError("Please fill in medicine name, dosage, and duration.");
      return;
    }

    setPrescription((currentPrescription) => ({
      ...currentPrescription,
      medicines: [
        ...currentPrescription.medicines,
        {
          name: newMedicine.name.trim(),
          dosage: newMedicine.dosage.trim(),
          duration: newMedicine.duration.trim(),
        },
      ],
    }));
    setNewMedicine(emptyMedicine);
    setError("");
  };

  const removeMedicine = (indexToRemove) => {
    setPrescription((currentPrescription) => ({
      ...currentPrescription,
      medicines: currentPrescription.medicines.filter(
        (_, index) => index !== indexToRemove
      ),
    }));
  };

  const handleSave = async ({ redirect = false } = {}) => {
    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      await updateAppointmentDetails({
        appointmentId,
        slotId,
        status,
        prescription,
      });

      setSuccessMessage("Appointment details saved successfully.");

      if (redirect) {
        navigate("/AcceptedAppointments");
      }
    } catch (err) {
      console.error("Error updating appointment details:", err);
      setError(
        err?.response?.data?.message ||
          "Failed to update appointment details. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateReport = async () => {
    if (status !== "Completed") {
      setError("Mark the appointment completed before generating a report.");
      return;
    }

    setGeneratingReport(true);
    setError("");
    setSuccessMessage("");

    try {
      await updateAppointmentDetails({
        appointmentId,
        slotId,
        status,
        prescription,
      });
      const response = await generateReport(appointmentId, slotId);
      setReportPath(response.reportPath);
      setSuccessMessage("Report generated successfully.");
    } catch (err) {
      console.error("Error generating report:", err);
      setError(
        err?.response?.data?.message ||
          "Failed to generate the report. Please try again."
      );
    } finally {
      setGeneratingReport(false);
    }
  };

  if (loadingDetails) {
    return (
      <div className="appointment-detail-page">
        <Sidebar />
        <main className="appointment-detail">
          <section className="appointment-detail__hero is-loading">
            <span />
            <span />
            <span />
          </section>
          <section className="appointment-detail__grid">
            <div className="appointment-detail__skeleton" />
            <div className="appointment-detail__skeleton" />
          </section>
        </main>
      </div>
    );
  }

  if (!userDetails && error) {
    return (
      <div className="appointment-detail-page">
        <Sidebar />
        <main className="appointment-detail">
          <section className="appointment-detail__empty">
            <h1>Appointment details unavailable</h1>
            <p>{error}</p>
            <button onClick={fetchDetails} type="button">
              Retry
            </button>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="appointment-detail-page">
      <Sidebar />
      <main className="appointment-detail">
        <section className="appointment-detail__hero">
          <div>
            <p className="appointment-detail__eyebrow">Consultation chart</p>
            <h1>{patientName}</h1>
            <p>
              Review patient context, update consultation notes, manage
              medicines, and generate the final HealthMate report after
              completion.
            </p>
            <div className="appointment-detail__hero-actions">
              <Link to="/AcceptedAppointments">Back to appointments</Link>
              <button onClick={() => handleSave()} disabled={saving} type="button">
                {saving ? "Saving..." : "Save progress"}
              </button>
            </div>
          </div>
          <aside>
            <span>Status</span>
            <strong>{status === "Completed" ? "Completed" : "In progress"}</strong>
            <small>{medicineCount} medicine entries</small>
          </aside>
        </section>

        {error && <p className="appointment-detail__alert is-error">{error}</p>}
        {successMessage && (
          <p className="appointment-detail__alert is-success">{successMessage}</p>
        )}

        <section className="appointment-detail__stats">
          {clinicalFacts.map((fact) => (
            <div key={fact.label}>
              <span>{fact.label}</span>
              <strong>{fact.value}</strong>
            </div>
          ))}
        </section>

        <section className="appointment-detail__grid">
          <article className="appointment-detail__panel">
            <div className="appointment-detail__patient-heading">
              <div className="appointment-detail__avatar" aria-hidden="true">
                {getInitials(patientName)}
              </div>
              <div>
                <p className="appointment-detail__eyebrow">Patient profile</p>
                <h2>{patientName}</h2>
              </div>
            </div>

            <dl className="appointment-detail__facts">
              {patientFacts.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          </article>

          <article className="appointment-detail__panel">
            <div className="appointment-detail__panel-heading">
              <div>
                <p className="appointment-detail__eyebrow">Visit notes</p>
                <h2>Clinical notes</h2>
              </div>
            </div>

            <label className="appointment-detail__field">
              Doctor notes
              <textarea
                onChange={(event) => updatePrescriptionField("notes", event.target.value)}
                placeholder="Add diagnosis, clinical observations, or treatment notes."
                value={prescription.notes || ""}
              />
            </label>

            <label className="appointment-detail__field">
              Advice for patient
              <textarea
                onChange={(event) => updatePrescriptionField("advice", event.target.value)}
                placeholder="Add follow-up instructions, lifestyle advice, or warnings."
                value={prescription.advice || ""}
              />
            </label>
          </article>

          <article className="appointment-detail__panel appointment-detail__panel--wide">
            <div className="appointment-detail__panel-heading">
              <div>
                <p className="appointment-detail__eyebrow">Prescription</p>
                <h2>Medicine plan</h2>
              </div>
              <span>{medicineCount} medicines</span>
            </div>

            <div className="appointment-detail__medicine-form">
              <VoiceInput
                aria-label="Medicine name"
                name="name"
                onChange={handleMedicineChange}
                placeholder="Medicine name"
                value={newMedicine.name}
              />
              <VoiceInput
                aria-label="Dosage"
                name="dosage"
                onChange={handleMedicineChange}
                placeholder="Dosage"
                value={newMedicine.dosage}
              />
              <VoiceInput
                aria-label="Duration"
                name="duration"
                onChange={handleMedicineChange}
                placeholder="Duration"
                value={newMedicine.duration}
              />
              <button onClick={handleAddMedicine} type="button">
                Add medicine
              </button>
            </div>

            {medicineCount > 0 ? (
              <div className="appointment-detail__medicine-list">
                {prescription.medicines.map((medicine, index) => (
                  <div key={`${medicine.name}-${index}`}>
                    <span>{index + 1}</span>
                    <div>
                      <strong>{medicine.name}</strong>
                      <small>
                        {medicine.dosage} · {medicine.duration}
                      </small>
                    </div>
                    <button onClick={() => removeMedicine(index)} type="button">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="appointment-detail__empty is-compact">
                <h3>No medicines added</h3>
                <p>Add medicines above when the treatment plan requires them.</p>
              </div>
            )}
          </article>

          <aside className="appointment-detail__panel">
            <div className="appointment-detail__panel-heading">
              <div>
                <p className="appointment-detail__eyebrow">Completion</p>
                <h2>Status and report</h2>
              </div>
            </div>

            <label className="appointment-detail__field">
              Appointment status
              <select value={status} onChange={(event) => setStatus(event.target.value)}>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="appointment-detail__action-stack">
              <button onClick={() => handleSave({ redirect: true })} disabled={saving} type="button">
                {saving ? "Saving..." : "Save and return"}
              </button>
              <button
                className="is-secondary"
                disabled={generatingReport || status !== "Completed"}
                onClick={handleGenerateReport}
                type="button"
              >
                {generatingReport ? "Generating..." : "Generate report"}
              </button>
              {reportPath && (
                <a href={reportPath} rel="noopener noreferrer" target="_blank">
                  Download report
                </a>
              )}
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
};

export default AppointmentDetails;
