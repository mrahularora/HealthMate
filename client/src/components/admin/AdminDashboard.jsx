import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchDetails, fetchStats } from "../../services/adminService";

const metricCards = [
  {
    type: "totalUsers",
    label: "Total Users",
    statKey: "totalUsers",
    icon: "/assets/images/icons/users.png",
    description: "All registered accounts",
  },
  {
    type: "users",
    label: "Patients",
    statKey: "totalNormalUsers",
    icon: "/assets/images/icons/patient.png",
    description: "Patient portal users",
  },
  {
    type: "doctors",
    label: "Doctors",
    statKey: "totalDoctors",
    icon: "/assets/images/icons/doctor.png",
    description: "Clinical providers",
  },
  {
    type: "admins",
    label: "Admins",
    statKey: "totalAdmins",
    icon: "/assets/images/icons/admin-portal.png",
    description: "System operators",
  },
  {
    type: "appointments",
    label: "Appointments",
    statKey: "totalAppointments",
    icon: "/assets/images/icons/doctor-portal.png",
    description: "Scheduled records",
  },
];

const quickLinks = [
  { label: "Manage Users", path: "/admin/ManageUsers" },
  { label: "View Appointments", path: "/admin/appointments" },
  { label: "Contact Messages", path: "/admin/Contact" },
];

const getDetailsTitle = (activeType) => {
  if (activeType === "totalUsers") return "All Users";
  if (activeType === "users") return "Patients";
  if (activeType === "appointments") return "Appointments";
  return activeType.charAt(0).toUpperCase() + activeType.slice(1);
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [details, setDetails] = useState([]);
  const [activeType, setActiveType] = useState("totalUsers");
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoadingStats(true);
        setError("");
        const statsData = await fetchStats();
        setStats(statsData || {});
      } catch (err) {
        console.error("Error loading stats:", err);
        setError("Unable to load admin statistics right now.");
      } finally {
        setLoadingStats(false);
      }
    };

    loadDashboard();
  }, []);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        setLoadingDetails(true);
        setError("");
        const detailsData = await fetchDetails(activeType);
        setDetails(detailsData || []);
      } catch (err) {
        console.error(`Error loading details for type: ${activeType}`, err);
        setError("Unable to load the selected details right now.");
        setDetails([]);
      } finally {
        setLoadingDetails(false);
      }
    };

    loadDetails();
  }, [activeType]);

  const appointmentDetailsActive = activeType === "appointments";
  const selectedMetric =
    metricCards.find((metric) => metric.type === activeType) || metricCards[0];

  return (
    <main className="admin-dashboard">
      <section className="admin-dashboard-hero">
        <div>
          <p className="admin-dashboard-eyebrow">Admin Command Center</p>
          <h1>HealthMate system overview</h1>
          <p>
            Monitor platform activity, review user groups, and jump into the
            admin tools that keep the healthcare workflow moving.
          </p>
        </div>
        <div className="admin-dashboard-hero__summary">
          <span>System users</span>
          <strong>{loadingStats ? "--" : stats.totalUsers || 0}</strong>
        </div>
      </section>

      {error && <p className="admin-dashboard-alert">{error}</p>}

      <section className="admin-dashboard-grid">
        <div className="admin-dashboard-main">
          <section className="admin-dashboard-metrics" aria-label="Admin metrics">
            {metricCards.map((metric) => (
              <button
                type="button"
                key={metric.type}
                className={
                  activeType === metric.type
                    ? "admin-dashboard-metric is-active"
                    : "admin-dashboard-metric"
                }
                onClick={() => setActiveType(metric.type)}
              >
                <img src={metric.icon} alt="" aria-hidden="true" />
                <span>{metric.label}</span>
                <strong>{loadingStats ? "--" : stats[metric.statKey] || 0}</strong>
                <small>{metric.description}</small>
              </button>
            ))}
          </section>

          <section className="admin-dashboard-panel">
            <div className="admin-dashboard-panel__heading">
              <div>
                <p className="admin-dashboard-eyebrow">Details</p>
                <h2>{getDetailsTitle(activeType)}</h2>
              </div>
              <span className="admin-dashboard-pill">
                {loadingDetails ? "Loading" : `${details.length} records`}
              </span>
            </div>

            {loadingDetails ? (
              <div className="admin-dashboard-loading">
                <span />
                <span />
                <span />
              </div>
            ) : details.length > 0 ? (
              <div className="admin-dashboard-table-wrap">
                <table className="admin-dashboard-table">
                  <thead>
                    <tr>
                      {appointmentDetailsActive ? (
                        <>
                          <th>Doctor</th>
                          <th>Date</th>
                          <th>Status</th>
                        </>
                      ) : (
                        <>
                          <th>First Name</th>
                          <th>Last Name</th>
                          <th>Email</th>
                          <th>Role</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {details.map((item, index) => (
                      <tr key={item._id || index}>
                        {appointmentDetailsActive ? (
                          <>
                            <td>{item.doctorName || "Unknown Doctor"}</td>
                            <td>
                              {item.date
                                ? new Date(item.date).toLocaleDateString()
                                : "N/A"}
                            </td>
                            <td>
                              <span className="admin-dashboard-status">
                                {item.status || "N/A"}
                              </span>
                            </td>
                          </>
                        ) : (
                          <>
                            <td>{item.firstName || "N/A"}</td>
                            <td>{item.lastName || "N/A"}</td>
                            <td>{item.email || "N/A"}</td>
                            <td>
                              <span className="admin-dashboard-status">
                                {item.role || "N/A"}
                              </span>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="admin-dashboard-empty">
                <h3>No records found</h3>
                <p>{selectedMetric.label} details will appear here when available.</p>
              </div>
            )}
          </section>
        </div>

        <aside className="admin-dashboard-sidebar">
          <section className="admin-dashboard-panel">
            <p className="admin-dashboard-eyebrow">Quick Access</p>
            <div className="admin-dashboard-links">
              {quickLinks.map((link) => (
                <Link to={link.path} key={link.path}>
                  {link.label}
                </Link>
              ))}
            </div>
          </section>

          <section className="admin-dashboard-panel">
            <p className="admin-dashboard-eyebrow">Selected View</p>
            <div className="admin-dashboard-selected">
              <img src={selectedMetric.icon} alt="" aria-hidden="true" />
              <h3>{selectedMetric.label}</h3>
              <p>{selectedMetric.description}</p>
              <strong>
                {loadingStats ? "--" : stats[selectedMetric.statKey] || 0}
              </strong>
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
};

export default AdminDashboard;
