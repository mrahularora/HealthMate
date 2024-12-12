import React, { useState, useEffect, useContext } from "react";
import { getAcceptedAppointments } from "../../services/appointmentService";
import { AuthContext } from "../../context/AuthContext";
import Sidebar from "../../components/common/Sidebar";

const Patients = () => {
  const { user } = useContext(AuthContext);
  const [completedAppointments, setCompletedAppointments] = useState([]);
  const [error, setError] = useState(null);

  const fetchCompletedAppointments = async () => {
    try {
      if (user.role !== "Doctor") {
        setError("You are not authorized to view this page.");
        return;
      }

      const response = await getAcceptedAppointments(user.id);
      const completed = response.filter((app) => app.status === "Completed");
      setCompletedAppointments(completed);
    } catch (err) {
      console.error("Error fetching completed appointments:", err);
      setError("Failed to fetch completed appointments.");
    }
  };

  useEffect(() => {
    fetchCompletedAppointments();
  }, []);

  return (
    <div className="doctor-page">
      <Sidebar />
      <div className="doctor-appointments-container">
        <div className="greeting">Patients List</div>
        <p>
          All the patient details are provided on this page to help you review
          the patients you have treated!
        </p>
        {error && <div className="alert alert-danger">{error}</div>}
        {completedAppointments.length > 0 ? (
          <table className="table table-bordered table-striped">
            <thead>
              <tr>
                <th>#</th>
                <th>Patient Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Date</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {completedAppointments.map((appointment, index) => (
                <tr key={appointment._id}>
                  <td>{index + 1}</td>
                  <td>
                    {`${appointment.userDetails?.firstName} ${appointment.userDetails?.lastName}`}
                  </td>
                  <td>{appointment.userDetails?.email || "N/A"}</td>
                  <td>{appointment.userDetails?.phone || "N/A"}</td>
                  <td>{appointment.userDetails?.address || "N/A"}</td>
                  <td>{new Date(appointment.date).toLocaleDateString()}</td>
                  <td>
                    {`${appointment.startTime} - ${appointment.endTime}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-muted">No completed appointments available.</p>
        )}
      </div>
    </div>
  );
};

export default Patients;
