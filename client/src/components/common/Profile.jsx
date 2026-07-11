import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { editUser, updateUser } from "../../services/userService";
import VoiceInput from "./VoiceInput";

const emptyProfile = {
  firstName: "",
  lastName: "",
  email: "",
  gender: "",
  role: "",
  specialization: "",
  experience: "",
  bio: "",
  phone: "",
};

const roleAccent = {
  User: "Patient",
  Doctor: "Doctor",
  Admin: "Administrator",
};

const roleAction = {
  User: { label: "View appointments", path: "/UserAppointments" },
  Doctor: { label: "View requests", path: "/RequestedAppointments" },
  Admin: { label: "Manage users", path: "/admin/ManageUsers" },
};

const getInitials = (profile) =>
  `${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}`.toUpperCase() ||
  "HM";

const validateName = (name) => /^[A-Za-z\s.'-]+$/.test(name);

const UserProfile = () => {
  const { user, login } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(emptyProfile);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userData = await editUser();
        setFormData({ ...emptyProfile, ...userData });
      } catch (error) {
        setErrors({ general: error.message });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
    setErrors((currentErrors) => ({ ...currentErrors, [name]: "" }));
    setSuccessMessage("");
  };

  const validateForm = () => {
    const formErrors = {};

    if (!formData.firstName || !validateName(formData.firstName)) {
      formErrors.firstName = "First name may only contain letters and spaces.";
    }

    if (!formData.lastName || !validateName(formData.lastName)) {
      formErrors.lastName = "Last name may only contain letters and spaces.";
    }

    if (!formData.gender) {
      formErrors.gender = "Please select a gender.";
    }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSaveChanges = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      const updatedUser = await updateUser(formData);
      const nextProfile = { ...formData, ...updatedUser };
      setFormData(nextProfile);

      if (user) {
        login({ ...user, ...nextProfile });
      }

      setSuccessMessage("Profile updated successfully.");
      setErrors({});
      setIsEditing(false);
    } catch (error) {
      setErrors({ general: error.message });
      setSuccessMessage("");
    } finally {
      setSaving(false);
    }
  };

  const fullName =
    `${formData.firstName || ""} ${formData.lastName || ""}`.trim() ||
    "HealthMate member";
  const roleLabel = roleAccent[formData.role] || formData.role || "Member";
  const action = roleAction[formData.role] || roleAction.User;

  if (loading) {
    return (
      <main className="profile-page">
        <section className="profile-loading-card">
          <div className="profile-avatar is-loading" />
          <p>Loading your profile...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <section className="profile-hero">
        <div className="profile-avatar" aria-hidden="true">
          {getInitials(formData)}
        </div>
        <div className="profile-hero__content">
          <p className="profile-eyebrow">{roleLabel} Profile</p>
          <h1>{fullName}</h1>
          <p>
            Keep your identity, contact details, and account information current
            for smoother healthcare coordination.
          </p>
        </div>
        <div className="profile-hero__actions">
          <button
            type="button"
            className="profile-primary-button"
            onClick={() => setIsEditing((current) => !current)}
          >
            {isEditing ? "Cancel Edit" : "Edit Profile"}
          </button>
          <Link to={action.path} className="profile-secondary-button">
            {action.label}
          </Link>
        </div>
      </section>

      {errors.general && <p className="profile-alert is-error">{errors.general}</p>}
      {successMessage && <p className="profile-alert is-success">{successMessage}</p>}

      <section className="profile-grid">
        <article className="profile-panel profile-panel--wide">
          <div className="profile-panel__heading">
            <div>
              <p className="profile-eyebrow">Personal Information</p>
              <h2>{isEditing ? "Update your details" : "Account details"}</h2>
            </div>
            <span className="profile-role-pill">{formData.role || "Member"}</span>
          </div>

          {isEditing ? (
            <div className="profile-form">
              <label className="profile-field">
                <span>First name</span>
                <VoiceInput
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
                {errors.firstName && <small>{errors.firstName}</small>}
              </label>

              <label className="profile-field">
                <span>Last name</span>
                <VoiceInput
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
                {errors.lastName && <small>{errors.lastName}</small>}
              </label>

              <label className="profile-field">
                <span>Email</span>
                <input type="email" name="email" value={formData.email} disabled />
              </label>

              <label className="profile-field">
                <span>Role</span>
                <input type="text" name="role" value={formData.role} disabled />
              </label>

              <div className="profile-field profile-field--wide">
                <span>Gender</span>
                <div className="profile-gender-options">
                  {["Male", "Female", "Other"].map((gender) => (
                    <label key={gender}>
                      <input
                        type="radio"
                        name="gender"
                        value={gender}
                        checked={formData.gender === gender}
                        onChange={handleInputChange}
                      />
                      {gender}
                    </label>
                  ))}
                </div>
                {errors.gender && <small>{errors.gender}</small>}
              </div>

              <div className="profile-form__actions">
                <button
                  type="button"
                  className="profile-primary-button"
                  onClick={handleSaveChanges}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  className="profile-text-button"
                  onClick={() => {
                    setIsEditing(false);
                    setErrors({});
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="profile-detail-list">
              <div>
                <span>First name</span>
                <strong>{formData.firstName || "Not provided"}</strong>
              </div>
              <div>
                <span>Last name</span>
                <strong>{formData.lastName || "Not provided"}</strong>
              </div>
              <div>
                <span>Email</span>
                <strong>{formData.email || "Not provided"}</strong>
              </div>
              <div>
                <span>Gender</span>
                <strong>{formData.gender || "Not provided"}</strong>
              </div>
            </div>
          )}
        </article>

        <aside className="profile-panel">
          <p className="profile-eyebrow">Account Snapshot</p>
          <div className="profile-snapshot">
            <div>
              <span>Status</span>
              <strong>Active</strong>
            </div>
            <div>
              <span>Role</span>
              <strong>{roleLabel}</strong>
            </div>
            <div>
              <span>Profile email</span>
              <strong>{formData.email || "Not provided"}</strong>
            </div>
          </div>
        </aside>

        {formData.role === "Doctor" && (
          <article className="profile-panel profile-panel--wide">
            <p className="profile-eyebrow">Clinical Profile</p>
            <div className="profile-detail-list">
              <div>
                <span>Specialization</span>
                <strong>{formData.specialization || "Not provided"}</strong>
              </div>
              <div>
                <span>Experience</span>
                <strong>
                  {formData.experience ? `${formData.experience} years` : "Not provided"}
                </strong>
              </div>
              <div className="profile-detail-list__wide">
                <span>Bio</span>
                <strong>{formData.bio || "Not provided"}</strong>
              </div>
            </div>
          </article>
        )}
      </section>
    </main>
  );
};

export default UserProfile;
