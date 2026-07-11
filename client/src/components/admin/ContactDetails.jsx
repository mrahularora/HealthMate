import React, { useState, useEffect} from "react";
import { getAllContactDetails } from "../../services/adminService";
import Sidebar from "../common/Sidebar";

const ContactDetailsPage = () => {
  const [contacts, setContacts] = useState([]);
  const [error, setError] = useState(null);

  const fetchContacts = async () => {
    try {
      const response = await getAllContactDetails();
      setContacts(response);
    } catch (err) {
      console.error("Error fetching contact details:", err);
      setError(err.message || "Failed to fetch contact details.");
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  return (
    <div className="page-container">
      <Sidebar />
      <div className="content">
        <h5 className="greeting">Contact Form Inquiries</h5>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="row">
          {contacts.length > 0 ? (
            contacts.map((contact) => (
              <div className="col-md-6" key={contact._id}>
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">Inquiry</h5>
                    <p className="card-text">
                      <strong>Name:</strong> {contact.name}
                    </p>
                    <p className="card-text">
                      <strong>Email:</strong> {contact.email}
                    </p>
                    <p className="card-text">
                      <strong>Message:</strong> {contact.message}
                    </p>
                    <p className="card-text">
                      <small className="text-muted">
                        Submitted on: {new Date(contact.createdAt).toLocaleString()}
                      </small>
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted">No contact submissions available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactDetailsPage;
