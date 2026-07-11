import React, { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import {
  bookAppointmentRequest,
  getAvailableSlots,
} from "../../services/appointmentService";
import { getDoctorList } from "../../services/doctorService";
import { AuthContext } from "../../context/AuthContext";
import Sidebar from "../common/Sidebar";
import "../../css/bookappointment.css";

const fieldGroups = [
  [
    { name: "firstName", label: "First name", required: true },
    { name: "lastName", label: "Last name", required: true },
    { name: "gender", label: "Gender", required: true },
    { name: "age", label: "Age", required: true, type: "number" },
  ],
  [
    { name: "phone", label: "Phone" },
    { name: "email", label: "Email", required: true, type: "email" },
    { name: "bloodGroup", label: "Blood group" },
    { name: "address", label: "Address" },
  ],
  [
    { name: "illness", label: "Reason for visit", required: true },
    { name: "notes", label: "Additional notes" },
  ],
];

const initialFormData = {
  firstName: "",
  lastName: "",
  gender: "",
  age: "",
  phone: "",
  email: "",
  address: "",
  bloodGroup: "",
  illness: "",
  notes: "",
};

const today = new Date().toISOString().split("T")[0];
const paypalClientId = process.env.REACT_APP_PAYPAL_CLIENT_ID;

const BookAppointmentComponent = () => {
  const { doctorId } = useParams();
  const { user } = useContext(AuthContext);
  const [doctor, setDoctor] = useState(null);
  const [doctorLoading, setDoctorLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [showPayPal, setShowPayPal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setFormData((currentFormData) => ({
      ...currentFormData,
      firstName: user?.firstName || currentFormData.firstName,
      lastName: user?.lastName || currentFormData.lastName,
      email: user?.email || currentFormData.email,
      gender: user?.gender || currentFormData.gender,
    }));
  }, [user]);

  useEffect(() => {
    const loadDoctor = async () => {
      try {
        setDoctorLoading(true);
        const response = await getDoctorList();
        const matchedDoctor = response.data.find(
          (item) => item._id === doctorId
        );
        setDoctor(matchedDoctor || null);
      } catch (err) {
        console.error("Error loading doctor:", err);
      } finally {
        setDoctorLoading(false);
      }
    };

    loadDoctor();
  }, [doctorId]);

  const selectedSlot = availableSlots.find((slot) => slot._id === selectedSlotId);

  const handleDateChange = async (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setSelectedSlotId("");
    setAvailableSlots([]);
    setShowPayPal(false);
    setErrors((currentErrors) => ({
      ...currentErrors,
      selectedDate: "",
      selectedSlot: "",
    }));

    if (!date) {
      return;
    }

    try {
      setSlotsLoading(true);
      const response = await getAvailableSlots(doctorId, date);
      setAvailableSlots(response.availableSlots || []);
    } catch (err) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        selectedDate:
          err.response?.data?.message || "No appointment slots found for this date.",
      }));
    } finally {
      setSlotsLoading(false);
    }
  };

  const validateField = (name, value) => {
    if (["firstName", "lastName", "gender", "illness"].includes(name) && !value) {
      return `${name.replace(/([A-Z])/g, " $1")} is required.`;
    }

    if (name === "age" && (!value || Number(value) <= 0)) {
      return "Please enter a valid age.";
    }

    if (name === "email" && (!value || !/\S+@\S+\.\S+/.test(value))) {
      return "Please enter a valid email.";
    }

    return "";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((currentFormData) => ({ ...currentFormData, [name]: value }));
    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: validateField(name, value),
    }));
  };

  const validateForm = () => {
    const formErrors = {};

    fieldGroups.flat().forEach((field) => {
      const error = validateField(field.name, formData[field.name]);
      if (error) {
        formErrors[field.name] = error;
      }
    });

    if (!selectedDate) {
      formErrors.selectedDate = "Please select an appointment date.";
    }

    if (!selectedSlot) {
      formErrors.selectedSlot = "Please select a time slot.";
    }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const submitBookingRequest = async () => {
    if (!selectedSlot) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        selectedSlot: "Please select a time slot.",
      }));
      return;
    }

    try {
      setSubmitting(true);
      await bookAppointmentRequest({
        doctorId,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        userDetails: { ...formData },
      });
      setSuccessMessage("Appointment request sent successfully.");
      setShowPayPal(false);
    } catch (err) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        selectedSlot:
          err.response?.data?.message || "Error booking appointment.",
      }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewBooking = async () => {
    if (!validateForm()) {
      return;
    }

    if (paypalClientId) {
      setShowPayPal(true);
      return;
    }

    await submitBookingRequest();
  };

  return (
    <div className="user-page">
      <Sidebar />
      <main className="book-appointment-container">
        <section className="book-appointment-hero">
          <div>
            <Link to="/doctorslist" className="book-appointment-back">
              Back to doctors
            </Link>
            <h1>Book an Appointment</h1>
            <p>
              Choose an available time, add the visit details, and send your
              request to the doctor.
            </p>
          </div>
          <div className="book-appointment-fee">
            <span>Consultation fee</span>
            <strong>$50 CAD</strong>
          </div>
        </section>

        {successMessage ? (
          <section className="book-appointment-success">
            <h2>{successMessage}</h2>
            <p>
              Your appointment is now pending doctor confirmation. You can track
              the status from your appointments page.
            </p>
            <Link to="/UserAppointments">View my appointments</Link>
          </section>
        ) : (
          <>
            <section className="book-appointment-doctor">
              {doctorLoading ? (
                <p>Loading doctor...</p>
              ) : doctor ? (
                <>
                  <img
                    src={doctor.imageUrl || "/assets/images/icons/doctor.png"}
                    alt={`${doctor.firstName} ${doctor.lastName}`}
                  />
                  <div>
                    <p className="book-appointment-label">Selected doctor</p>
                    <h2>
                      Dr. {doctor.firstName} {doctor.lastName}
                    </h2>
                    <span>{doctor.specialization || "General Medicine"}</span>
                    <p>{doctor.bio || "Available for patient consultations."}</p>
                  </div>
                </>
              ) : (
                <p>Doctor details are unavailable, but booking can still continue.</p>
              )}
            </section>

            <section className="book-appointment-panel">
              <div className="book-appointment-step">
                <span>1</span>
                <div>
                  <h2>Choose date and time</h2>
                  <p>Select a day first, then pick one available slot.</p>
                </div>
              </div>

              <div className="book-appointment-date-row">
                <label htmlFor="appointment-date">Appointment date</label>
                <input
                  id="appointment-date"
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  min={today}
                />
              </div>
              {errors.selectedDate && (
                <p className="book-appointment-error">{errors.selectedDate}</p>
              )}

              {selectedDate && (
                <div className="book-appointment-slots">
                  {slotsLoading ? (
                    <p>Checking available slots...</p>
                  ) : availableSlots.length > 0 ? (
                    availableSlots.map((slot) => (
                      <button
                        type="button"
                        key={slot._id}
                        className={
                          selectedSlotId === slot._id
                            ? "book-appointment-slot is-selected"
                            : "book-appointment-slot"
                        }
                        onClick={() => {
                          setSelectedSlotId(slot._id);
                          setShowPayPal(false);
                          setErrors((currentErrors) => ({
                            ...currentErrors,
                            selectedSlot: "",
                          }));
                        }}
                      >
                        {slot.startTime} - {slot.endTime}
                      </button>
                    ))
                  ) : (
                    <p>No open slots for this date.</p>
                  )}
                </div>
              )}
              {errors.selectedSlot && (
                <p className="book-appointment-error">{errors.selectedSlot}</p>
              )}
            </section>

            <section className="book-appointment-panel">
              <div className="book-appointment-step">
                <span>2</span>
                <div>
                  <h2>Patient details</h2>
                  <p>These details help the doctor prepare for your visit.</p>
                </div>
              </div>

              {fieldGroups.map((group, groupIndex) => (
                <div className="book-appointment-form-grid" key={groupIndex}>
                  {group.map((field) => (
                    <label
                      className={
                        field.name === "illness" || field.name === "notes"
                          ? "book-appointment-field is-wide"
                          : "book-appointment-field"
                      }
                      key={field.name}
                    >
                      <span>
                        {field.label}
                        {field.required ? " *" : ""}
                      </span>
                      <input
                        type={field.type || "text"}
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleInputChange}
                      />
                      {errors[field.name] && (
                        <small>{errors[field.name]}</small>
                      )}
                    </label>
                  ))}
                </div>
              ))}
            </section>

            <section className="book-appointment-panel book-appointment-review">
              <div>
                <p className="book-appointment-label">Summary</p>
                <h2>
                  {selectedDate ? selectedDate : "Select a date"}{" "}
                  {selectedSlot
                    ? `at ${selectedSlot.startTime}`
                    : "and a time"}
                </h2>
                <p>
                  {paypalClientId
                    ? "Payment is collected before sending the appointment request."
                    : "PayPal is not configured locally, so this will send the request directly."}
                </p>
              </div>
              {!showPayPal && (
                <button
                  type="button"
                  className="book-appointment-submit"
                  onClick={handleReviewBooking}
                  disabled={submitting}
                >
                  {submitting ? "Sending..." : paypalClientId ? "Continue to payment" : "Send request"}
                </button>
              )}
              {showPayPal && (
                <div className="book-appointment-paypal">
                  <PayPalScriptProvider
                    options={{ "client-id": paypalClientId, currency: "CAD" }}
                  >
                    <PayPalButtons
                      style={{ layout: "vertical" }}
                      createOrder={(data, actions) =>
                        actions.order.create({
                          purchase_units: [{ amount: { value: "50.00" } }],
                        })
                      }
                      onApprove={(data, actions) =>
                        actions.order
                          .capture()
                          .then(() => submitBookingRequest())
                      }
                      onError={(err) => {
                        console.error("PayPal Checkout Error:", err);
                        setShowPayPal(false);
                      }}
                    />
                  </PayPalScriptProvider>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default BookAppointmentComponent;
