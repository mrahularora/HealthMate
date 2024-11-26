import axios from "./api";

// Function to create appointment slots for a doctor
export const createAppointmentSlots = async (appointmentData) => {
  try {
    const response = await axios.post("/appointments/create", appointmentData);
    return response.data;
  } catch (error) {
    console.error("Error creating appointment slots:", error);
    throw error;
  }
};

// Fetch available slots for a specific doctor on a given date
export const getAvailableSlots = async (doctorId, date) => {
  try {
    const response = await axios.post("/appointments/available", {
      doctorId, // Top-level doctorId
      date, // Top-level date
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching available slots:", error);
    throw error;
  }
};

// Function to book an appointment
export const bookAppointment = async (slotId, userId) => {
  try {
    const response = await axios.post("/appointments/book", { slotId, userId });
    return response.data;
  } catch (error) {
    console.error("Error booking appointment:", error);
    throw error;
  }
};

// Function to fetch appointments for the logged-in user
export const getAppointments = async () => {
  try {
    const response = await axios.get("/appointments/");
    return response.data;
  } catch (error) {
    console.error("Error fetching appointments:", error);
    throw error;
  }
};

// Cancel an appointment
export const cancelAppointment = async (appointmentId, slotId) => {
  try {
    const response = await axios.patch(`/appointments/cancel`, {
      appointmentId,
      slotId,
    });
    return response.data;
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    throw error;
  }
};

// Function to send a booking request
export const bookAppointmentRequest = async (data) => {
  try {
    const response = await axios.post("/appointments/book-request", data);
    return response.data;
  } catch (error) {
    console.error("Error sending booking request:", error);
    throw error;
  }
};