
import React from 'react';

const HomePage = () => {
    return (
    <div>
            <div className="hero-section mb-4">
                <div className="hero-content">
                    <h1>Welcome to HealthMate</h1>
                    <p>Your journey begins here.</p>
                    <a href="#get-started" className="btn">Get Started</a>
                </div>
            </div>

        <h1 className="text-center">Doctors</h1>
        <div className="grid-container mb-4">
            <div className="grid-item">
                <img src="/assets/images/doctors/4.jpg" alt="doctor1" />
                <div className="doctor-details">
                    <h3>Dr. David Wilson</h3>
                    <p><strong>Specialty:</strong> Internal Medicine</p>
                    <p><strong>Experience:</strong> 18 years</p>
                    <p>Dr. David Wilson provides expert care in internal medicine, focusing on the prevention and management of chronic conditions.</p>
                </div>
            </div>

            <div className="grid-item">
                <img src="/assets/images/doctors/2.jpg" alt="doctor1" />
                <div className="doctor-details">
                    <h3>Dr. James Carter</h3>
                    <p><strong>Specialty:</strong> Orthopedics</p>
                    <p><strong>Experience:</strong> 14 years</p>
                    <p>Dr. James Carter is an expert in orthopedic surgery, helping patients recover from injuries and improve mobility.</p>
                </div>
            </div>

            <div className="grid-item">
                <img src="/assets/images/doctors/3.jpg" alt="doctor1" />
                <div className="doctor-details">
                    <h3>Dr. Emily Thompson</h3>
                    <p><strong>Specialty:</strong> Cardiology</p>
                    <p><strong>Experience:</strong> 12 years</p>
                    <p>Dr. Emily Thompson specializes in cardiovascular diseases, providing advanced care and compassionate treatment for heart health.</p>
                </div>
            </div>

            <div className="grid-item">
                <img src="/assets/images/doctors/7.jpg" alt="doctor1" />
                <div className="doctor-details">
                    <h3>Dr. Rachel Lee</h3>
                    <p><strong>Specialty:</strong> Neurology</p>
                    <p><strong>Experience:</strong> 15 years</p>
                    <p>Dr. Rachel Lee specializes in treating neurological disorders, offering advanced care for conditions like epilepsy and migraines.</p>
                </div>
            </div>
            <div className="grid-item">
                <img src="/assets/images/doctors/1.jpg" alt="doctor1" />
                <div className="doctor-details">
                <h3>Dr. Sarah Patel</h3>
                <p><strong>Specialty:</strong> Pediatrics</p>
                <p><strong>Experience:</strong> 8 years</p>
                <p>Dr. Sarah Patel is dedicated to the health and development of children, offering expert care in pediatric medicine.</p>
                </div>
            </div>
            <div className="grid-item">
                <img src="/assets/images/doctors/6.jpg" alt="doctor1" />
                <div className="doctor-details">
                    <h3>Dr. Olivia Garcia</h3>
                    <p><strong>Specialty:</strong> Obstetrics & Gynecology</p>
                    <p><strong>Experience:</strong> 10 years</p>
                    <p>Dr. Olivia Garcia provides comprehensive care in women's health, specializing in prenatal and reproductive care.</p>
                </div>
            </div>

        </div> 

    </div> 
    );
};

export default HomePage;
