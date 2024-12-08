import React, { useState } from 'react';
import '../css/contact.css';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, email, message } = formData;

    // Validate form inputs
    if (!name || !email || !message) {
      setErrorMessage('All fields are required.');
      return;
    }

    // TODO: Add logic to send the message, e.g., via an API request

    setErrorMessage('');
    setSuccessMessage('Your message has been sent successfully!');

    setFormData({
      name: '',
      email: '',
      message: '',
    });
  };

  return (
    <div className="contact-page">
       <div className="contact-hero-section mb-4">
            <div className="contact-hero-content">
                <h1>Contact HealthMate</h1>
            </div>
        </div>

      <div className="contact-info">
        <div className="address">
          <h2 className="mb-4">Our Main Office</h2>
          <p>299 Doon Valley Drive</p>
          <p>Kitchener, ON. N2R 0N6</p>
          <p>Email: info@healthmate.com</p>
          <p>Phone: +1(548) 333-3418</p>

            <hr />

          <h2 className="mb-4">Our Branch</h2>
          <p>299 Doon Valley Drive</p>
          <p>Kitchener, ON. N2R 0N6</p>
          <p>Email: info@healthmate.com</p>
          <p>Phone: +1(548) 333-3418</p>
        </div>

        <div className="map">
          <h2>Find Us Here</h2>
          <iframe
            title="HealthMate Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.123456789!2d-122.41941584882594!3d37.77492937975986!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085808c85a8b8ab%3A0x7f90d0a8c7e62c59!2s123%20Main%20St%2C%20San%20Francisco%2C%20CA%2094103%2C%20USA!5e0!3m2!1sen!2sin!4v1678936329504!5m2!1sen!2sin"
            width="600"
            height="450"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
          />
        </div>
      </div>

      <div className="contact-form-section mb-4">
        <form onSubmit={handleSubmit} className="contact-form">
          <h2 className="mb-4">Get in Touch</h2>
          <p>Fill the following form to get in touch with our team. We'll contact you shortly.</p>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          {successMessage && <p className="success-message">{successMessage}</p>}
          <div className="form-group">
            <label htmlFor="name">Full Name<span className="red">* </span>:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email Address<span className="red">* </span>:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="message">Message<span className="red">* </span>:</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Message"
              rows="5"
              required
            />
          </div>
          <button type="submit" className="submit-button">Send Message</button>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;
