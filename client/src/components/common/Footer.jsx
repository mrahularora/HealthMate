// src/components/common/Footer.jsx

import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="footer text-center text-lg-start mt-auto">
                <div className="footer-container">
                    <div className="footer-section">
                    <img src="/assets/images/logo.png" className="width25" alt="logo" />
                    </div>
                    
                    <div className="footer-section">
                    <h3>Quick Links</h3>
                    <ul>
                        <li><a href={Link} to="/">Home</a></li>
                        <li><a href="/admin">Admin</a></li>
                        <li><a href="/about">About Us</a></li>
                        <li><a href="/contact">Contact Us</a></li>
                        <li><a href="/appointments">Book an Appointment</a></li>
                    </ul>
                    </div>

                    <div className="footer-section">
                    <h3>Contact Us</h3>
                    <p>Email: <a href="mailto:info@healthmate.com">info@healthmate.com</a></p>
                    <p>Phone: <a href="tel:+15483333418">+1 (548) 333-3418</a></p>
                    <p>Address: 299 Doon Valley Dr, Kitchener, Ontario, Canada, N2R 0N6</p>
                    </div>

                    <div className="footer-section">
                    <h3>Follow Us</h3>
                    <div className="social-media">
                        <a href="https://facebook.com/healthmate" className="social-icon1">Facebook</a>
                        <a href="https://twitter.com/healthmate" className="social-icon2">Twitter</a>
                        <a href="https://linkedin.com/healthmate" className="social-icon3">LinkedIn</a>
                        <a href="https://instagram.com/healthmate" className="social-icon4">Instagram</a>
                    </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    &copy; {new Date().getFullYear()} HealthMate. All rights reserved.
                </div>
        </footer>
    );
};

export default Footer;
