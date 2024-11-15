import React, { useState, useEffect, useRef } from 'react';
import { searchDoctorsByQuery } from '../../services/doctorService';
import { getAvailableSlots, bookAppointment } from '../../services/appointmentService';
import '../../css/bookappointment.css';

const BookAppointment = () => {
  const [doctorName, setDoctorName] = useState('');
  const [doctorsList, setDoctorsList] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [date, setDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSearching, setIsSearching] = useState(false); // For search button
  const [isBooking, setIsBooking] = useState(false); // For booking button

  const debounceTimeout = useRef(null);

  // Convert time to 12-hour format
  const convertTo12HourFormat = (time) => {
    const [hours, minutes] = time.split(':');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const newHour = hours % 12 || 12;
    return `${newHour}:${minutes} ${ampm}`;
  };

  // Debounced doctor search function
  const handleDoctorSearch = async (e) => {
    const query = e.target.value;
    setDoctorName(query);
    resetForm();
    if (query.length >= 3) {
      clearTimeout(debounceTimeout.current);
      debounceTimeout.current = setTimeout(async () => {
        setIsSearching(true);
        try {
          const results = await searchDoctorsByQuery(query);
          setDoctorsList(results);
        } catch (err) {
          setError('No doctors found matching your search. Please try a different name or specialty.');
        } finally {
          setIsSearching(false);
        }
      }, 500);
    }
  };

  // Handle doctor selection
  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setDoctorName(doctor.name);
    setDoctorsList([]);
    setError('');
  };

  // Reset form when needed
  const resetForm = () => {
    setDoctorsList([]);
    setSelectedDoctor(null);
    setAvailableSlots([]);
    setSelectedSlot(null);
    setDate('');
    setSuccessMessage('');
    setError('');
  };

  // Handle appointment booking
  const handleBookAppointment = async () => {
    if (!selectedSlot) {
      setError('Please select a time slot.');
      return;
    }
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.id) {
      setError('You must be logged in to book an appointment.');
      return;
    }

    setIsBooking(true); // Booking in progress
    try {
      const response = await bookAppointment(selectedSlot._id, user.id);
      setSuccessMessage(response.message || 'Appointment booked successfully!');
    } catch (err) {
      setError('Error booking the appointment.');
    } finally {
      setIsBooking(false); // Booking complete
    }
  };

  // Fetch available slots based on selected doctor and date
  const handleSearchSlots = async () => {
    if (!date) {
      setError('Please select a valid date.');
      return;
    }

    setAvailableSlots([]);
    setSelectedSlot(null);
    setError('');

    if (selectedDoctor) {
      setIsSearching(true);
      try {
        const response = await getAvailableSlots(selectedDoctor._id, date);
        const sortedSlots = response.availableSlots.sort((a, b) => {
          const timeA = new Date(`1970-01-01T${a.startTime}:00Z`);
          const timeB = new Date(`1970-01-01T${b.startTime}:00Z`);
          return timeA - timeB;
        });
        setAvailableSlots(sortedSlots);
        if (sortedSlots.length === 0) {
          setError('No slots available for this date.');
        }
      } catch (err) {
        setError('Error fetching available slots.');
      } finally {
        setIsSearching(false);
      }
    }
  };

  useEffect(() => {
    return () => clearTimeout(debounceTimeout.current); // Cleanup timeout on component unmount
  }, []);

  return (
    <div className="book-appointment">
      <h2 className="title">Book an Appointment</h2>

      <div className="step">
        <label className="label">Doctor Name or Specialty</label>
        <input
          type="text"
          placeholder="Search for a doctor or specialty"
          value={doctorName}
          onChange={handleDoctorSearch}
          className="input"
        />
        {doctorsList.length > 0 && (
          <div className="dropdown">
            {doctorsList.map((doctor) => (
              <div
                key={doctor._id}
                onClick={() => handleDoctorSelect(doctor)}
                className="dropdown-item"
              >
                <img src={doctor.imageUrl || '/default-avatar.png'} alt={doctor.name} className="doctor-img" />
                {doctor.name} - {doctor.specialty}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedDoctor && (
        <div className="step">
          <label className="label">Selected Doctor:</label>
          <div className="doctor-selected">
            <img src={selectedDoctor.imageUrl || '/default-avatar.png'} alt={selectedDoctor.name} className="doctor-img-large" />
            <div>
              <div><strong>{selectedDoctor.name}</strong></div>
              <div>{selectedDoctor.specialty}</div>
            </div>
          </div>
        </div>
      )}

      {selectedDoctor && (
        <div className="step">
          <label className="label">Select a Date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input"
          />
        </div>
      )}

      {selectedDoctor && date && (
        <div className="step">
          <button className="search-button" onClick={handleSearchSlots} disabled={isSearching}>
            {isSearching ? 'Searching...' : 'Search for Available Slots'}
          </button>
        </div>
      )}

      {availableSlots.length > 0 && (
        <div className="slots">
          {availableSlots.map((slot) => (
            <div
              key={slot._id}
              className={`slot ${selectedSlot?._id === slot._id ? 'selected' : ''}`}
              onClick={() => setSelectedSlot(slot)}
            >
              {convertTo12HourFormat(slot.startTime)} - {convertTo12HourFormat(slot.endTime)}
            </div>
          ))}
        </div>
      )}

      {selectedSlot && (
        <button className="book-button" onClick={handleBookAppointment} disabled={isBooking}>
          {isBooking ? 'Booking...' : 'Book Now'}
        </button>
      )}

      {error && <p className="error-message">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}
    </div>
  );
};

export default BookAppointment;
