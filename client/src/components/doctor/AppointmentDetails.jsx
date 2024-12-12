import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getAppointmentDetails,
  updateAppointmentDetails,
  generateReport,
} from "../../services/appointmentService";
import "../../css/appointmentdetails.css";
import Sidebar from "../common/Sidebar";
import VoiceInput from "../common/VoiceInput";

const AppointmentDetails = () => {
  const { appointmentId, slotId } = useParams(); // Get params from URL
  const [userDetails, setUserDetails] = useState(null);
  const [prescription, setPrescription] = useState({
    medicines: [],
    notes: "",
    advice: "",
  });
  const [newMedicine, setNewMedicine] = useState({
    name: "",
    dosage: "",
    duration: "",
  });
  const [status, setStatus] = useState("InProgress");
  const [reportPath, setReportPath] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // Track loading state for report generation
  const navigate = useNavigate();

  // Fetch appointment details
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await getAppointmentDetails(appointmentId, slotId);
        setUserDetails(response.userDetails);
        setPrescription(
          response.prescription || { medicines: [], notes: "", advice: "" }
        );
        setStatus(response.status || "InProgress");
      } catch (err) {
        setError("Failed to fetch appointment details.");
      }
    };
    fetchDetails();
  }, [appointmentId, slotId]);

  // Handle adding a new medicine to the prescription
  const handleAddMedicine = () => {
    if (!newMedicine.name || !newMedicine.dosage || !newMedicine.duration) {
      alert("Please fill in all fields for the medicine.");
      return;
    }
    setPrescription((prev) => ({
      ...prev,
      medicines: [...prev.medicines, newMedicine],
    }));
    setNewMedicine({ name: "", dosage: "", duration: "" });
  };

  // Save updated prescription and status
  const handleSave = async () => {
    try {
      await updateAppointmentDetails({
        appointmentId,
        slotId,
        status,
        prescription,
      });
      alert("Appointment updated successfully.");
      navigate("/AcceptedAppointments");
    } catch (err) {
      setError("Failed to update appointment details.");
    }
  };

  // Generate PDF report
  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const response = await generateReport(appointmentId, slotId);
      setReportPath(response.reportPath);
      alert("Report generated successfully. You can now download it.");
    } catch (err) {
      setError("Failed to generate the report.");
    } finally {
      setLoading(false);
    }
  };

  if (!userDetails) return <p className="loading">Loading details...</p>;

  return (
    <div className="page-container">
      <Sidebar />
      <div className="appointment-details">
        <h5 className="greeting">Appointment Details</h5>
        <p>
          Review the selected patient appointment by viewing their personal
          details, health information, and any notes from the consultation. On
          this tab, you can change the status of the appointment, add any
          prescriptions or update other medical notes, or medication
          recommendations.
        </p>
        {error && <p className="error">{error}</p>}

        <div className="user-info">
          <p>
            <strong>Patient Name:</strong> {userDetails.firstName}{" "}
            {userDetails.lastName}
          </p>
          <p><strong>Email:</strong> {userDetails.email}</p>
          <p><strong>Phone:</strong> {userDetails.phone}</p>
          <p><strong>Address:</strong> {userDetails.address}</p>
          <p><strong>Blood Group:</strong> {userDetails.bloodGroup}</p>
          <p><strong>Illness:</strong> {userDetails.illness}</p>
          <p><strong>Notes:</strong> {userDetails.notes}</p>
        </div>

        <h5 className="greeting">Prescription</h5>
        <textarea
          className="notes-input mb-2"
          placeholder="Doctor's Notes"
          value={prescription.notes}
          onChange={(e) =>
            setPrescription({ ...prescription, notes: e.target.value })
          }
        ></textarea>
        <textarea
          className="advice-input"
          placeholder="Advice"
          value={prescription.advice}
          onChange={(e) =>
            setPrescription({ ...prescription, advice: e.target.value })
          }
        ></textarea>

        <div className="medicine-form">
          <h5 className="greeting">Add Medicine</h5>
          <VoiceInput
            className="medicine-input"
            type="text"
            placeholder="Medicine Name"
            value={newMedicine.name}
            onChange={(e) =>
              setNewMedicine({ ...newMedicine, name: e.target.value })
            }
          />
          <VoiceInput
            className="medicine-input"
            type="text"
            placeholder="Dosage"
            value={newMedicine.dosage}
            onChange={(e) =>
              setNewMedicine({ ...newMedicine, dosage: e.target.value })
            }
          />
          <VoiceInput
            className="medicine-input"
            type="text"
            placeholder="Duration"
            value={newMedicine.duration}
            onChange={(e) =>
              setNewMedicine({ ...newMedicine, duration: e.target.value })
            }
          />
          <button className="add-medicine-btn" onClick={handleAddMedicine}>
            Add Medicine
          </button>
        </div>

        <ul className="medicine-list">
          {prescription.medicines.map((med, index) => (
            <li key={index} className="medicine-item">
              {med.name} - {med.dosage} - {med.duration}
            </li>
          ))}
        </ul>

        <div className="status-select">
          <h5 className="greeting">Status</h5>
          <select
            className="status-dropdown mb-4"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="Select Status">Select Status</option>
            <option value="InProgress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <button className="save-btn" onClick={handleSave}>
          Save and Complete
        </button><br /><br />

        {status === "Completed" && (
          <button
            className="btn"
            onClick={handleGenerateReport}
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Report"}
          </button>
        )}

        {reportPath && (
          <a href={reportPath} target="_blank" rel="noopener noreferrer" download>
            <button className="btn">Download Report</button>
          </a>
        )}
      </div>
    </div>
  );
};

export default AppointmentDetails;
