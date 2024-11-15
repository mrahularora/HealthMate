import React, { useState } from 'react';
import { getAvailableSlots, bookAppointment } from '../../services/appointmentService';  // Updated to include bookAppointment
import '../../css/bookappointment.css';

const BookAppointment = () => {
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [error, setError] = useState('');
  const [rawResponse, setRawResponse] = useState('');
  const [bookedSlot, setBookedSlot] = useState(null);
  const [bookingStatus, setBookingStatus] = useState('');  // State for booking success or error message

  // Function to convert 24-hour time to 12-hour format
  const convertTo12HourFormat = (time) => {
    const [hours, minutes] = time.split(':');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const newHour = hours % 12 || 12;  // Convert hour to 12-hour format
    return `${newHour}:${minutes} ${ampm}`;
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);  // Set the selected slot
  };

  const handleBookAppointment = async () => {
    if (!selectedSlot) {
      setError('Please select a time slot.');
      return;
    }

    const loggedInUser = JSON.parse(localStorage.getItem('user'));  // Get the logged-in user from localStorage
    console.log(loggedInUser.id);
    

    if (!loggedInUser) {
      setError('You must be logged in to book an appointment.');
      return;
    }

    try {
      // Attempt to book the appointment using the selected slot and the logged-in user ID
      const response = await bookAppointment(selectedSlot._id, loggedInUser.id);
      setBookingStatus(response.message || 'Booking failed.');
      setBookedSlot(selectedSlot);
      setError('');
    } catch (err) {
      setError('Failed to book the appointment.');
      setBookingStatus('');
    }
  };

  // Function to fetch and sort available slots
  const handleSearch = async () => {
    if (!doctorId || !date) {
      setError('Please enter Doctor ID and Date.');
      return;
    }
    try {
      const response = await getAvailableSlots(doctorId, date);
      setRawResponse(JSON.stringify(response, null, 2));  // Store the raw response as formatted text

      // Sorting the slots based on start time
      const sortedSlots = response.availableSlots.sort((a, b) => {
        const timeA = new Date(`1970-01-01T${a.startTime}:00Z`);
        const timeB = new Date(`1970-01-01T${b.startTime}:00Z`);
        return timeA - timeB;  // Sort in ascending order
      });

      setAvailableSlots(sortedSlots);
      setError('');  // Reset any previous error
    } catch (err) {
      setError('Could not fetch available slots.');
    }
  };

  return (
    <div className="book-appointment-container">
      <h2>Book an Appointment</h2>
      <div className="inputs">
        <input
          type="text"
          placeholder="Enter Doctor ID"
          value={doctorId}
          onChange={(e) => setDoctorId(e.target.value)}
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {/* Search Button to trigger API call */}
      <div className="search-button">
        <button onClick={handleSearch}>Search</button>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="available-slots">
        {availableSlots.length === 0 ? (
          <p>No available slots for this doctor on the selected date.</p>
        ) : (
          <div className="time-slot-boxes">
            {availableSlots.map((slot) => (
              <div
                key={slot._id}
                className={`time-slot-box ${selectedSlot?._id === slot._id ? 'selected' : ''}`}
                onClick={() => handleSlotSelect(slot)}
              >
                {convertTo12HourFormat(slot.startTime)} - {convertTo12HourFormat(slot.endTime)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* "Book Now" Button */}
      <div className="book-now-button">
        <button onClick={handleBookAppointment}>Book Now</button>
      </div>

      {/* Display the booked slot below the "Book Now" button */}
      {bookedSlot && (
        <div className="booked-slot-info">
          <h3>Your Booked Slot:</h3>
          <p>{convertTo12HourFormat(bookedSlot.startTime)} - {convertTo12HourFormat(bookedSlot.endTime)}</p>
        </div>
      )}

      {/* Display success or error booking message */}
      {bookingStatus && (
        <div className="booking-status">
          <p>{bookingStatus}</p>
        </div>
      )}

      {/* Display the raw response as text */}
      <div className="raw-response">
        <h3>Raw Response:</h3>
        <pre>{rawResponse}</pre>  {/* Display the raw JSON response */}
      </div>
    </div>
  );
};

export default BookAppointment;
