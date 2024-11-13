
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
            <h3 className="mb-4">What is HealthMate ?</h3>
        <p>
        HealthMate is a web and mobile application designed to bridge the communication between patients and doctors, 
        while the patient can manage their medication and health habits through message alerts.
         It integrates an intuitive solution into three basic healthcare functionalities: doctor-patient communication, 
         tracking habits, and medication administration. HealthMate desires to meet the emerging demands of quality patient attention, 
         remote health management, and medication fidelity, which characterize a digitizing healthcare environment.
        </p>
        </div>
   

    </div> 
    );
};

export default AboutPage;
