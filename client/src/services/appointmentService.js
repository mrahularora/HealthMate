import axios from "./api";

// Fetch all time slots for a doctor
export const getAllTimeSlots = async (doctorId) => {
  const response = await axios.get(`/appointments/slots/${doctorId}`);
  return response.data.timeSlots;
};

// Delete an available time slot
export const deleteAvailableSlot = async (data) => {
  return axios.delete("/appointments/slot", { data });
};


export const generateReport = async (appointmentId, slotId) => {
  try {
    const response = await axios.post(`/appointments/${appointmentId}/slots/${slotId}/report`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};


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

export const getAppointmentRequests = async (doctorId) => {
  try {
    const response = await axios.get(
      `/appointments/requests?doctorId=${doctorId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching appointment requests:", error);
    throw error;
  }
};

export const updateAppointmentStatus = async ({
  doctorId,
  appointmentId,
  slotId,
  status,
}) => {
  try {
    const response = await axios.patch(`/appointments/status`, {
      doctorId,
      appointmentId,
      slotId,
      status,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating appointment status:", error);
    throw error;
  }
};

// API call for accepted appointments for doctor
export const getAcceptedAppointments = async (doctorId) => {
  try {
    const response = await axios.get(
      `/appointments/accepted?doctorId=${doctorId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching accepted appointments:", error);
    throw error;
  }
};

// API call for accepted appointments details for doctor
export const getAppointmentDetails = async (appointmentId, slotId) => {
  try {
    const response = await axios.get(
      `/appointments/details?appointmentId=${appointmentId}&slotId=${slotId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching appointment details:", error);
    throw error;
  }
};



// Api call for doctor update prescription for user
export const updateAppointmentDetails = async ({
  appointmentId,
  slotId,
  status,
  prescription,
}) => {
  try {
    const response = await axios.patch(`/appointments/details`, {
      appointmentId,
      slotId,
      status,
      prescription,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating appointment details:", error);
    throw error;
  }
};
