import React, { useState, useContext } from 'react';
import { createAppointmentSlots } from '../../services/appointmentService'; // Import API calls
import { AuthContext } from '../../context/AuthContext'; // Import AuthContext

const CreateAppointmentComponent = () => {
  const { user } = useContext(AuthContext);
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [error, setError] = useState(null);
  const [existingTimeSlots] = useState([]); // Store existing time slots for the selected date

  // Only allow doctors to create appointment slots
  if (user?.role !== 'Doctor') {
    return <p>You do not have permission to create appointment slots.</p>;
  }

  // Generate time slots between 7 AM and 5 PM
  const generateTimeSlots = () => {
    const timeSlots = [];
    let startTime = 7;
    let endTime = startTime + 1;

    while (startTime < 17) {
      const start = `${startTime < 10 ? '0' : ''}${startTime}:00`;
      const end = `${endTime < 10 ? '0' : ''}${endTime}:00`;
      timeSlots.push({ label: `${start} - ${end}`, value: `${start}-${end}` });
      startTime++;
      endTime++;
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
      setDates([]); // Reset the form after successful submission
      setError(null); // Clear any errors after successful submission
    } catch (error) {
      if (error.response && error.response.data && error.response.data.duplicateSlots) {
        const duplicateSlotMessages = error.response.data.duplicateSlots.map(
          (slot) => `Date: ${slot.date}, Time Slot: ${slot.startTime} - ${slot.endTime}`
        );
        setError(`The following time slots already exist: ${duplicateSlotMessages.join(', ')}`);
      } else {
        setError('Error creating appointment slots');
      }
    }
  };

  const handleTimeSlotChange = (e) => {
    setSelectedSlot(e.target.value);
    setError(null);
  };

  const addTimeSlot = () => {
    if (!selectedDate) {
      setError('Please select a date before adding a time slot.');
      return;
    }

    if (!selectedSlot) {
      setError('Please select a valid time slot.');
      return;
    }

    if (existingTimeSlots.includes(selectedSlot)) {
      setError('This time slot has already been taken for this date.');
      return;
    }

    const dateIndex = dates.findIndex((dateObj) => dateObj.date === selectedDate);
    if (dateIndex !== -1 && dates[dateIndex].timeSlots.includes(selectedSlot)) {
      setError('This time slot has already been added for this date.');
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
      .map((dateObj) => {
        if (dateObj.date === date) {
          const updatedTimeSlots = dateObj.timeSlots.filter((timeSlot) => timeSlot !== slot);

          if (updatedTimeSlots.length === 0) {
            return null;
          }

          return {
            ...dateObj,
            timeSlots: updatedTimeSlots,
          };
        }
        return dateObj;
      })
      .filter((dateObj) => dateObj !== null);

    setDates(updatedDates);
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <h1>Create Appointments</h1>
        <label htmlFor="date">Select Date: </label>
        <input
          id="date"
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Time Slot: </label>
        <select value={selectedSlot} onChange={handleTimeSlotChange} required>
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
  );
};

export default CreateAppointmentComponent;
