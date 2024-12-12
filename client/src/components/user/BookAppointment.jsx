import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { getAvailableSlots, bookAppointmentRequest } from "../../services/appointmentService";
import Sidebar from "../common/Sidebar";
import "../../css/bookappointment.css";

const BookAppointmentComponent = () => {
  const { doctorId } = useParams();
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [formData, setFormData] = useState({
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
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState(null);
  const [showPayPal, setShowPayPal] = useState(false);
  const [isBookingComplete, setIsBookingComplete] = useState(false);

  const handleDateChange = async (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setAvailableSlots([]);
    setErrors((prevErrors) => ({ ...prevErrors, selectedDate: "", selectedSlot: "" }));

    try {
      const response = await getAvailableSlots(doctorId, date);
      if (response.availableSlots.length === 0) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          selectedDate: "No appointments found for the selected date.",
        }));
      } else {
        setAvailableSlots(response.availableSlots);
      }
    } catch (err) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        selectedDate: err.response?.data?.message || "Error fetching available slots.",
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "firstName":
        error = value ? "" : "First name is required.";
        break;
      case "lastName":
        error = value ? "" : "Last name is required.";
        break;
      case "gender":
        error = value ? "" : "Gender is required.";
        break;
      case "age":
        error = value && !isNaN(value) ? "" : "Please enter a valid age.";
        break;
      case "illness":
        error = value ? "" : "Illness details are required.";
        break;
      case "email":
        error = value && /\S+@\S+\.\S+/.test(value) ? "" : "Please enter a valid email.";
        break;
      default:
        break;
    }
    setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
  };

  const validateForm = () => {
    const formErrors = {};
    if (!formData.firstName) formErrors.firstName = "First name is required.";
    if (!formData.lastName) formErrors.lastName = "Last name is required.";
    if (!formData.gender) formErrors.gender = "Gender is required.";
    if (!formData.age || isNaN(formData.age)) formErrors.age = "Please enter a valid age.";
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) formErrors.email = "Please enter a valid email.";
    if (!formData.illness) formErrors.illness = "Illness details are required.";
    if (!selectedSlot) formErrors.selectedSlot = "Please select a time slot.";

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleProceedToPayment = () => {
    if (validateForm()) {
      setShowPayPal(true);
    }
  };

  const handlePaymentSuccess = async () => {
    const [startTime, endTime] = selectedSlot.split("-");
    try {
      await bookAppointmentRequest({
        doctorId,
        date: selectedDate,
        startTime,
        endTime,
        userDetails: { ...formData },
      });
      setSuccessMessage("Appointment booking successful.");
      setIsBookingComplete(true);
    } catch (err) {
      setErrors({
        selectedSlot: err.response?.data?.message || "Error booking appointment.",
      });
    }
  };

  if (isBookingComplete) {
    return (
      <div className="user-page">
        <Sidebar />
        <div className="book-appointment-container">
          <h2 className="success-message">{successMessage}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="user-page">
      <Sidebar />
      <div className="book-appointment-container">
        <h2 className="greeting">Book Your Appointment</h2>

        {/* Date Selection */}
        <div className="form-group">
          <label>Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            min={new Date().toISOString().split("T")[0]}
            className="input-field"
          />
        </div>

        {/* Time Slot Selection */}
        {selectedDate && (
          <div className="form-group">
            <label>Select Time Slot:</label>
            <select
              value={selectedSlot}
              onChange={(e) => setSelectedSlot(e.target.value)}
              className="input-field"
            >
              <option value="">Select a time slot</option>
              {availableSlots.map((slot, idx) => (
                <option key={idx} value={`${slot.startTime}-${slot.endTime}`}>
                  {slot.startTime} - {slot.endTime}
                </option>
              ))}
            </select>
            {errors.selectedSlot && <p className="error-message">{errors.selectedSlot}</p>}
          </div>
        )}

        {/* Patient Info Form */}
        {["firstName", "lastName", "gender", "age", "phone", "email", "address", "bloodGroup", "illness", "notes"].map(
          (field) => (
            <div className="form-group" key={field}>
              <label>{field.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}:</label>
              <input
                type={field === "email" ? "email" : field === "age" ? "number" : "text"}
                name={field}
                value={formData[field]}
                onChange={handleInputChange}
                className="input-field"
              />
              {errors[field] && <p className="error-message">{errors[field]}</p>}
            </div>
          )
        )}

        {/* Proceed to Payment */}
        {!showPayPal && (
          <button onClick={handleProceedToPayment} className="submit-button">
            Proceed to Payment
          </button>
        )}

        {/* PayPal Buttons */}
        {showPayPal && (
          <PayPalScriptProvider
            options={{ "client-id": process.env.REACT_APP_PAYPAL_CLIENT_ID,currency: "CAD", }}
          >
            <PayPalButtons
              style={{ layout: "vertical" }}
              createOrder={(data, actions) => {
                return actions.order.create({
                  purchase_units: [
                    {
                      amount: { value: "50.00" },                      
                    },
                  ],
                });
              }}
              onApprove={(data, actions) => {
                return actions.order.capture().then(() => handlePaymentSuccess());
              }}
              onError={(err) => {
                console.error("PayPal Checkout Error: ", err);
                setShowPayPal(false);
              }}
            />
          </PayPalScriptProvider>
        )}
      </div>
    </div>
  );
};

export default BookAppointmentComponent;
