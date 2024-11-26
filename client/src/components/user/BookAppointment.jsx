import React, { useState } from "react";
import { useParams } from "react-router-dom";
import {
  getAvailableSlots,
  bookAppointmentRequest,
} from "../../services/appointmentService";
import '../../css/bookappointment.css';

const BookAppointmentComponent = () => {
  const { doctorId } = useParams(); // Doctor ID from URL params
  const [selectedDate, setSelectedDate] = useState(""); // Selected date
  const [availableSlots, setAvailableSlots] = useState([]); // Time slots for the selected date
  const [selectedSlot, setSelectedSlot] = useState(""); // Selected time slot
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
  const [error, setError] = useState(null); // Error message state
  const [successMessage, setSuccessMessage] = useState(null); // Success message state

  // Fetch available slots when a date is selected
  const handleDateChange = async (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setAvailableSlots([]);
    setError(null); // Clear previous errors

    try {
      const response = await getAvailableSlots(doctorId, date); // Fix: Pass doctorId and date as separate arguments
      setAvailableSlots(response.availableSlots);
    } catch (err) {
      setError(
        err.response?.data?.message || "Error fetching available slots."
      );
    }
  };

  // Update form data dynamically
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle booking request submission
  const handleBookAppointment = async () => {
    if (!selectedSlot) {
      setError("Please select a time slot.");
      return;
    }

    const [startTime, endTime] = selectedSlot.split("-");

    try {
      await bookAppointmentRequest({
        doctorId,
        date: selectedDate,
        startTime,
        endTime,
        userDetails: { ...formData },
      });
      setSuccessMessage("Appointment request sent successfully.");
      setError(null); // Clear any errors
    } catch (err) {
      setError(
        err.response?.data?.message || "Error sending appointment request."
      );
      setSuccessMessage(null); // Clear success message on error
    }
  };

  return (
    <div className="book-appointment">
      <h1>Book Appointment</h1>

      {/* Date Selection */}
      <div>
        <label>Select Date:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          min={new Date().toISOString().split("T")[0]} // Disable past dates
        />
      </div>

      {/* Time Slot Selection */}
      {selectedDate && (
        <div>
          <label>Select Time Slot:</label>
          <select
            value={selectedSlot}
            onChange={(e) => setSelectedSlot(e.target.value)}
          >
            <option value="">Select a time slot</option>
            {availableSlots.length > 0 ? (
              availableSlots.map((slot, idx) => (
                <option key={idx} value={`${slot.startTime}-${slot.endTime}`}>
                  {slot.startTime} - {slot.endTime}
                </option>
              ))
            ) : (
              <option value="" disabled>
                No available slots
              </option>
            )}
          </select>
        </div>
      )}

      {/* Form Fields */}
      <div>
        <label>First Name:</label>
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label>Last Name:</label>
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label>Gender:</label>
        <input
          type="text"
          name="gender"
          value={formData.gender}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label>Age:</label>
        <input
          type="number"
          name="age"
          value={formData.age}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label>Phone:</label>
        <input
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label>Address:</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label>Blood Group:</label>
        <input
          type="text"
          name="bloodGroup"
          value={formData.bloodGroup}
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label>Illness:</label>
        <textarea
          name="illness"
          value={formData.illness}
          onChange={handleInputChange}
        ></textarea>
      </div>
      <div>
        <label>Notes:</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
        ></textarea>
      </div>

      {/* Error and Success Messages */}
      {error && <p className="error">{error}</p>}
      {successMessage && <p className="success">{successMessage}</p>}

      {/* Submit Button */}
      <button onClick={handleBookAppointment}>Book Appointment</button>
    </div>
  );
};

export default BookAppointmentComponent;

