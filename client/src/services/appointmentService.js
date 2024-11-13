import axios from './api'; 

// Function to create appointment slots for a doctor
export const createAppointmentSlots = async (appointmentData) => {
    try {
      // Directly using the endpoint path, as baseURL is already set in axios instance
      const response = await axios.post('/appointments/create', appointmentData);
      return response.data;
    } catch (error) {
      console.error('Error creating appointment slots:', error);
      throw error;
    }
  };
  
  
