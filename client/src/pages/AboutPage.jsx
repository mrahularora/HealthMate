import React from 'react';
import '../css/about.css';

const AboutPage = () => {
    return (
    <div>
        <div className="about-hero-section mb-4">
            <div className="about-hero-content">
                <h1>About HealthMate</h1>
            </div>
        </div>

        <div className="about-box mb-4">
            <h3 className="mb-4">What is HealthMate?</h3>
            <p>
                HealthMate is a web and mobile application designed to bridge the communication between patients and doctors, 
                while the patient can manage their medication and health habits through message alerts. It integrates an 
                intuitive solution into three basic healthcare functionalities: doctor-patient communication, tracking habits, 
                and medication administration. HealthMate desires to meet the emerging demands of quality patient attention, 
                remote health management, and medication fidelity, which characterize a digitizing healthcare environment.
            </p>
        </div>

        <div className="about-box mb-4">
            <h3 className="mb-4">Our Mission</h3>
            <p>
            HealthMate's mission is to transform the healthcare experience through accessible, innovative, user-friendly solutions for the
            patients and healthcare providers. We strive to foster better relationships and healthier habits by empowering users with 
            the tools they need to take control of their health journey.
            </p>
        </div>

        <div className="about-box mb-4">
            <h3 className="mb-4">Core Features</h3>
            <ul>
            <li>Effortless communication between doctors and patients with secure messaging.</li>
            <li>Personalized medication and habit tracking with timely alerts.</li>
            <li>Centralized management of health records and reports.</li>
            <li>Remote monitoring and consultation features that enhance patient care.</li>
            </ul>
        </div>

        <div className="about-box mb-4">
            <h3 className="mb-4">Why Choose HealthMate?</h3>
            <p>
            HealthMate is built for the modern world where healthcare extends beyond clinics. It adapts to your busy
            It helps schedule and provides tools for better communication, organized health records, and actionable health insights.
            With HealthMate, you are investing in a trusted companion to help you through all your health journeys.
            </p>
        </div>
    </div>
    );
};

export default AboutPage;
