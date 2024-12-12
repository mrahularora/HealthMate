import React, { useState, useContext } from 'react';
import { createAppointmentSlots } from '../../services/appointmentService'; // Import API calls
import { AuthContext } from '../../context/AuthContext'; // Import AuthContext
import EditAppointment from './EditAppointment';

const CreateAppointmentComponent = () => {
  const { user } = useContext(AuthContext);
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [error, setError] = useState(null);

  // Only allow doctors to create appointment slots
  if (user?.role !== 'Doctor') {
    return <p>You do not have permission to create appointment slots.</p>;
  }

  // Generate time slots between 7 AM and 5 PM
  const generateTimeSlots = () => {
    const timeSlots = [];
    for (let hour = 7; hour < 17; hour++) {
      const start = `${hour.toString().padStart(2, '0')}:00`;
      const end = `${(hour + 1).toString().padStart(2, '0')}:00`;
      timeSlots.push({ label: `${start} - ${end}`, value: `${start}-${end}` });
    }
    return timeSlots;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const appointmentData = {
      doctorId: user.id,
      appointments: dates.map((dateObj) => ({
        date: dateObj.date,
        timeSlots: dateObj.timeSlots.map((slot) => ({
          startTime: slot.split('-')[0],
          endTime: slot.split('-')[1],
          isBooked: false,
        })),
      })),
    };

    try {
      await createAppointmentSlots(appointmentData);
      alert('Appointment slots created successfully');
      setDates([]);
      setError(null);
    } catch (error) {
      if (error.response?.data?.duplicateSlots) {
        const duplicateMessages = error.response.data.duplicateSlots.map(
          (slot) => `Date: ${slot.date}, Time Slot: ${slot.startTime} - ${slot.endTime}`
        );
        setError(`The following time slots already exist: ${duplicateMessages.join(', ')}`);
      } else {
        setError('Error creating appointment slots. Please try again.');
      }
    }
  };

  const addTimeSlot = () => {
    if (!selectedDate || !selectedSlot) {
      setError('Please select both a date and a time slot.');
      return;
    }

    const dateIndex = dates.findIndex((dateObj) => dateObj.date === selectedDate);
    if (dateIndex !== -1 && dates[dateIndex].timeSlots.includes(selectedSlot)) {
      setError('This time slot is already added.');
      return;
    }

    if (dateIndex === -1) {
      setDates([...dates, { date: selectedDate, timeSlots: [selectedSlot] }]);
    } else {
      const updatedDates = [...dates];
      updatedDates[dateIndex].timeSlots.push(selectedSlot);
      setDates(updatedDates);
    }

    setError(null);
    setSelectedSlot('');
  };

  const removeTimeSlot = (date, slot) => {
    const updatedDates = dates
      .map((dateObj) =>
        dateObj.date === date
          ? { ...dateObj, timeSlots: dateObj.timeSlots.filter((timeSlot) => timeSlot !== slot) }
          : dateObj
      )
      .filter((dateObj) => dateObj.timeSlots.length > 0);

    setDates(updatedDates);
  };

  return (
    <div className="create-appointment">
      <h1>Create Appointments</h1>
      <p>
        Handle your availability with ease. Let patients book appointments at convenient times.
        Manage your schedule in real-time with easy modifications.
      </p>
      <form onSubmit={handleSubmit}>
        <div className="form-group mb-4">
          <label htmlFor="date">Select Date:</label>
          <input
            id="date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="time-slot">Time Slot:</label>
          <select
            id="time-slot"
            value={selectedSlot}
            onChange={(e) => setSelectedSlot(e.target.value)}
            required
          >
            <option value="">Select Time</option>
            {generateTimeSlots().map((time, idx) => (
              <option key={idx} value={time.value}>
                {time.label}
              </option>
            ))}
          </select>
        </div>
        {error && <p className="error-text">{error}</p>}
        <button type="button" onClick={addTimeSlot}>
          Add Time Slot
        </button>
        <div className="added-slots">
          <h3>Selected Time Slots:</h3>
          {dates.length > 0 ? (
            <ul>
              {dates.map((dateObj, idx) => (
                <li key={idx}>
                  <strong>{dateObj.date}</strong>
                  <ul>
                    {dateObj.timeSlots.map((slot, index) => (
                      <li key={index}>
                        {slot}{' '}
                        <button type="button" onClick={() => removeTimeSlot(dateObj.date, slot)}>
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          ) : (
            <p>No time slots added yet.</p>
          )}
        </div>
        <button type="submit">Create Appointment Slots</button>
      </form>
      <EditAppointment />
    </div>
  );
};

export default CreateAppointmentComponent;
