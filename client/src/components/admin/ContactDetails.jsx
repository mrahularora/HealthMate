import React, { useEffect, useMemo, useState } from "react";
import { getAllContactDetails } from "../../services/adminService";
import Sidebar from "../common/Sidebar";
import "../../css/sidebar.css";
import "../../css/contact.css";

const formatDateTime = (date) =>
  date
    ? new Date(date).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "Date unavailable";

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "HM";

const ContactDetailsPage = () => {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getAllContactDetails();
        const nextContacts = response || [];
        setContacts(nextContacts);
        setSelectedContact(nextContacts[0] || null);
      } catch (err) {
        console.error("Error fetching contact details:", err);
        setError(err.message || "Failed to fetch contact details.");
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  const filteredContacts = useMemo(
    () =>
      contacts.filter((contact) =>
        [contact.name, contact.email, contact.message]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      ),
    [contacts, searchTerm]
  );

  const latestContact = contacts[0];
  const todayCount = contacts.filter((contact) => {
    if (!contact.createdAt) return false;
    return new Date(contact.createdAt).toDateString() === new Date().toDateString();
  }).length;

  return (
    <div className="admin-contact-page">
      <Sidebar />
      <main className="admin-contact">
        <section className="admin-contact-hero">
          <div>
            <p className="admin-contact-eyebrow">Admin Inbox</p>
            <h1>Contact form inquiries</h1>
            <p>
              Review patient and visitor messages, scan sender details, and keep
              support requests visible for follow-up.
            </p>
          </div>
          <div className="admin-contact-summary">
            <span>Total messages</span>
            <strong>{loading ? "--" : contacts.length}</strong>
          </div>
        </section>

        {error && (
          <div className="admin-contact-alert">
            <span>{error}</span>
            <button type="button" onClick={() => setError(null)}>
              Dismiss
            </button>
          </div>
        )}

        <section className="admin-contact-stats">
          <div>
            <span>Messages Today</span>
            <strong>{loading ? "--" : todayCount}</strong>
          </div>
          <div>
            <span>Latest Sender</span>
            <strong>{loading ? "--" : latestContact?.name || "None"}</strong>
          </div>
          <div>
            <span>Latest Received</span>
            <strong>{loading ? "--" : formatDateTime(latestContact?.createdAt)}</strong>
          </div>
        </section>

        <section className="admin-contact-workspace">
          <div className="admin-contact-list-panel">
            <div className="admin-contact-panel-heading">
              <div>
                <p className="admin-contact-eyebrow">Messages</p>
                <h2>Inquiry Queue</h2>
              </div>
              <span>{filteredContacts.length} shown</span>
            </div>

            <label className="admin-contact-search">
              <span>Search inquiries</span>
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by name, email, or message"
              />
            </label>

            {loading ? (
              <div className="admin-contact-loading">
                <span />
                <span />
                <span />
              </div>
            ) : filteredContacts.length > 0 ? (
              <div className="admin-contact-list">
                {filteredContacts.map((contact) => (
                  <button
                    type="button"
                    key={contact._id}
                    className={
                      selectedContact?._id === contact._id
                        ? "admin-contact-item is-active"
                        : "admin-contact-item"
                    }
                    onClick={() => setSelectedContact(contact)}
                  >
                    <span className="admin-contact-avatar">
                      {getInitials(contact.name)}
                    </span>
                    <span className="admin-contact-item__content">
                      <strong>{contact.name || "Unknown sender"}</strong>
                      <small>{contact.email || "No email provided"}</small>
                      <em>{contact.message || "No message provided"}</em>
                    </span>
                    <span className="admin-contact-item__date">
                      {formatDateTime(contact.createdAt)}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="admin-contact-empty">
                <h3>No inquiries found</h3>
                <p>Try a different search term or clear the search box.</p>
                <button type="button" onClick={() => setSearchTerm("")}>
                  Clear search
                </button>
              </div>
            )}
          </div>

          <aside className="admin-contact-detail-panel">
            {selectedContact ? (
              <>
                <div className="admin-contact-detail-header">
                  <span className="admin-contact-avatar is-large">
                    {getInitials(selectedContact.name)}
                  </span>
                  <div>
                    <p className="admin-contact-eyebrow">Selected Inquiry</p>
                    <h2>{selectedContact.name || "Unknown sender"}</h2>
                    <a href={`mailto:${selectedContact.email}`}>
                      {selectedContact.email || "No email provided"}
                    </a>
                  </div>
                </div>

                <div className="admin-contact-detail-meta">
                  <div>
                    <span>Submitted</span>
                    <strong>{formatDateTime(selectedContact.createdAt)}</strong>
                  </div>
                  <div>
                    <span>Message ID</span>
                    <strong>{selectedContact._id}</strong>
                  </div>
                </div>

                <article className="admin-contact-message">
                  <p className="admin-contact-eyebrow">Message</p>
                  <p>{selectedContact.message || "No message provided."}</p>
                </article>
              </>
            ) : (
              <div className="admin-contact-empty">
                <h3>No message selected</h3>
                <p>Select an inquiry from the queue to review the full message.</p>
              </div>
            )}
          </aside>
        </section>
      </main>
    </div>
  );
};

export default ContactDetailsPage;
