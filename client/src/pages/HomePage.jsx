import React, { useEffect, useState } from 'react';
import { fetchDoctorsFromSchema } from '../services/doctorService';

const HomePage = () => {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const doctorsData = await fetchDoctorsFromSchema();
        console.log("Fetched doctors from Doctor schema:", doctorsData);
        setDoctors(doctorsData);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };

    fetchDoctors();
  }, []);

  return (
    <div>
      <div className="hero-section mb-4">
        <div className="hero-content">
          <h1>Welcome to HealthMate</h1>
          <p>Connecting You to Better Health.</p>
          <a href="/signup" className="btn">Get Started</a>
        </div>
      </div>

      <h2 className="text-center mb-4">What is HealthMate ?</h2>
      <div className="mb-4 w-75 mx-auto mb-4">
        <p className="text-center">HealthMate is a web and mobile application designed to bridge the communication between patients and doctors, 
          while the patient can manage their medication and health habits through message alerts. 
          It integrates an intuitive solution into three basic healthcare functionalities: doctor-patient communication, 
          tracking habits, and medication administration. HealthMate desires to meet the emerging demands of quality patient attention, 
          remote health management, and medication fidelity, which characterize a digitizing healthcare environment.</p>
      </div>
      <div class="d-flex justify-content-center align-items-center mb-4">
          <a href="/login" class="btn">Consult Now</a>
      </div>
      <hr class="my-4 w-50 mx-auto"></hr>

      <h2 className="text-center mb-4">Meet our Doctors</h2>
      <div className="doctor-grid-container mb-4">
        {doctors.length === 0 ? (
          <p>Loading doctors...</p>
        ) : (
          doctors.map((doctor) => (
            <div key={doctor._id} className="doctor-grid-item">
              <img src={doctor.imageUrl} alt={doctor.name} />
              <div className="doctor-details">
                <h3>{doctor.name}</h3>
                <p><strong>Specialty:</strong> {doctor.specialty}</p>
                <p><strong>Experience:</strong> {doctor.experience} years</p>
                <p>{doctor.description}</p>
              </div>
            </div>
          ))
        )}
      </div>
      <hr class="my-4 w-50 mx-auto"></hr>

      <section className="text-center py-5">
        <div className="container">
          <h2 className="mb-4">Download the App</h2>
          <p>Get HealthMate on your mobile device for easy access to healthcare services and track your health progress on the go.</p>
          <a href="/download" className="btn m-2">App Store</a>
          <a href="/download" className="btn m-2">Play Store</a>
        </div>
      </section>
      <hr class="my-4 w-50 mx-auto"></hr>

    </div>
  );
};

export default HomePage;
