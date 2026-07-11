import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchDoctorsFromSchema } from "../../services/doctorService";
import "../../css/userdoctorlist.css";
import Sidebar from "../common/Sidebar";

const fallbackSpecialty = "General Medicine";

const getDoctorName = (doctor) => doctor.name || "Doctor unavailable";

const getBookableDoctorId = (doctor) => doctor.doctorId || doctor._id;

const DoctorListComponent = () => {
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSpecialty, setActiveSpecialty] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError(null);
        const doctorsData = await fetchDoctorsFromSchema();
        setDoctors(doctorsData || []);
      } catch (err) {
        console.error("Error fetching doctors:", err);
        setError("Failed to fetch doctors.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const specialties = [
    "All",
    ...Array.from(
      new Set(
        doctors.map((doctor) => doctor.specialty || fallbackSpecialty)
      )
    ).sort(),
  ];

  const filteredDoctors = doctors.filter((doctor) => {
    const specialty = doctor.specialty || fallbackSpecialty;
    const searchableText = [
      doctor.name,
      specialty,
      doctor.description,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch = searchableText.includes(searchTerm.toLowerCase());
    const matchesSpecialty =
      activeSpecialty === "All" || specialty === activeSpecialty;

    return matchesSearch && matchesSpecialty;
  });

  const handleBookAppointment = (doctorId) => {
    navigate(`/book-appointment/${doctorId}`);
  };

  return (
    <div className="doctor-directory-shell">
      <Sidebar />
      <main className="doctor-directory">
        <section className="doctor-directory-hero">
          <div>
            <p className="doctor-directory-eyebrow">Care Team</p>
            <h1>Find the right doctor for your next visit</h1>
            <p>
              Search by name, specialty, or care focus, then choose an available
              appointment time.
            </p>
          </div>
          <div className="doctor-directory-summary">
            <span>Available doctors</span>
            <strong>{loading ? "--" : doctors.length}</strong>
          </div>
        </section>

        <section className="doctor-directory-toolbar">
          <label className="doctor-directory-search">
            <span>Search doctors</span>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by name or specialty"
            />
          </label>

          <div className="doctor-directory-filters" aria-label="Specialty filters">
            {specialties.map((specialty) => (
              <button
                type="button"
                key={specialty}
                className={
                  activeSpecialty === specialty
                    ? "doctor-directory-filter is-active"
                    : "doctor-directory-filter"
                }
                onClick={() => setActiveSpecialty(specialty)}
              >
                {specialty}
              </button>
            ))}
          </div>
        </section>

        {error && <p className="doctor-directory-alert">{error}</p>}

        {loading ? (
          <section className="doctor-directory-grid">
            {[1, 2, 3, 4].map((item) => (
              <article className="doctor-directory-card is-loading" key={item}>
                <div className="doctor-directory-card__image" />
                <div className="doctor-directory-card__body">
                  <span />
                  <div className="doctor-directory-card__title-placeholder" />
                  <p />
                  <p />
                </div>
              </article>
            ))}
          </section>
        ) : filteredDoctors.length > 0 ? (
          <section className="doctor-directory-grid">
            {filteredDoctors.map((doctor) => {
              const specialty = doctor.specialty || fallbackSpecialty;

              return (
                <article className="doctor-directory-card" key={doctor._id}>
                  <img
                    src={doctor.imageUrl || "/assets/images/icons/doctor.png"}
                    alt={getDoctorName(doctor)}
                    className="doctor-directory-card__image"
                  />
                  <div className="doctor-directory-card__body">
                    <span className="doctor-directory-specialty">{specialty}</span>
                    <h2>{getDoctorName(doctor)}</h2>
                    <p>
                      {doctor.description ||
                        "Available for patient consultations and follow-up care."}
                    </p>
                    <div className="doctor-directory-meta">
                      <span>{doctor.experience || "5+"} years experience</span>
                      <span>Bookable care provider</span>
                    </div>
                    <div className="doctor-directory-card__footer">
                      <span>{specialty}</span>
                      <button
                        type="button"
                        onClick={() =>
                          handleBookAppointment(getBookableDoctorId(doctor))
                        }
                      >
                        Book Appointment
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        ) : (
          <section className="doctor-directory-empty">
            <h2>No doctors found</h2>
            <p>Try a different name, specialty, or clear the active filter.</p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setActiveSpecialty("All");
              }}
            >
              Clear filters
            </button>
          </section>
        )}
      </main>
    </div>
  );
};

export default DoctorListComponent;
